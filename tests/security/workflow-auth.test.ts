import { afterEach, describe, expect, it } from "vitest";
import { isAuthenticatedWorkflowRequest } from "@/lib/auth/workflow-auth";

/**
 * Regression guard for the auth bypass on POST /api/admin/images/proposals.
 *
 * The check used to be `authHeader?.startsWith("Bearer workflow-")`, so any
 * unauthenticated caller who chose that prefix could write proposal rows.
 */
describe("isAuthenticatedWorkflowRequest", () => {
  afterEach(() => {
    delete process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN;
  });

  it("rejects the old guessable prefix", async () => {
    process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN = "s3cret-token";
    expect(await isAuthenticatedWorkflowRequest("Bearer workflow-")).toBe(
      false
    );
    expect(await isAuthenticatedWorkflowRequest("Bearer workflow-123")).toBe(
      false
    );
    expect(
      await isAuthenticatedWorkflowRequest("Bearer workflow-anything-at-all")
    ).toBe(false);
  });

  it("accepts only the exact configured token", async () => {
    process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN = "s3cret-token";
    expect(await isAuthenticatedWorkflowRequest("Bearer s3cret-token")).toBe(
      true
    );
    expect(await isAuthenticatedWorkflowRequest("Bearer s3cret-toke")).toBe(
      false
    );
    expect(await isAuthenticatedWorkflowRequest("Bearer s3cret-tokenX")).toBe(
      false
    );
    expect(await isAuthenticatedWorkflowRequest("s3cret-token")).toBe(false);
  });

  it("fails closed when no token is configured", async () => {
    delete process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN;
    expect(await isAuthenticatedWorkflowRequest("Bearer anything")).toBe(false);
    expect(await isAuthenticatedWorkflowRequest("Bearer ")).toBe(false);
  });

  it("rejects a missing Authorization header", async () => {
    process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN = "s3cret-token";
    expect(await isAuthenticatedWorkflowRequest(null)).toBe(false);
  });

  it("rejects absurdly long headers without throwing (HashDoS guard)", async () => {
    process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN = "s3cret-token";
    await expect(
      isAuthenticatedWorkflowRequest(`Bearer ${"a".repeat(20_000)}`)
    ).resolves.toBe(false);
  });
});

describe("secureCompareOrFalse", () => {
  it("returns false instead of throwing on over-length input", async () => {
    const { secureCompareOrFalse, secureCompare } =
      await import("@/lib/auth/secure-compare");
    const huge = "a".repeat(20_000);

    // The primitive still throws — that HashDoS guard is deliberate.
    await expect(secureCompare(huge, "secret")).rejects.toThrow();

    // The wrapper used at every request boundary must not.
    await expect(secureCompareOrFalse(huge, "secret")).resolves.toBe(false);
    await expect(secureCompareOrFalse("secret", huge)).resolves.toBe(false);
  });

  it("still matches and rejects normal input correctly", async () => {
    const { secureCompareOrFalse } = await import("@/lib/auth/secure-compare");
    await expect(secureCompareOrFalse("abc", "abc")).resolves.toBe(true);
    await expect(secureCompareOrFalse("abc", "abd")).resolves.toBe(false);
  });
});
