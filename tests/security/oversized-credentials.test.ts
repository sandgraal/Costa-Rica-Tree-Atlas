import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * `secureCompare()` throws when either input exceeds MAX_INPUT_LENGTH — a
 * deliberate HashDoS guard on the primitive, but the wrong behaviour at a
 * request boundary. Passing an over-length credential straight to it turned
 * each of these authorization gates into a denial-of-service vector, and into
 * an oracle: a 500 tells the caller "too long", distinguishable from the 401 or
 * 403 a wrong-but-normal value gets.
 *
 * Every gate must answer with its ordinary rejection status.
 */
const HUGE = "a".repeat(20_000);

vi.mock("@/lib/prisma", () => ({
  default: {
    user: { count: vi.fn(async () => 0) },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock("@/lib/ratelimit", () => ({
  rateLimit: vi.fn(async () => ({ headers: {} })),
}));

vi.mock("@/lib/error-tracking", () => ({
  captureApiError: vi.fn(),
  captureException: vi.fn(),
}));

describe("oversized credentials are rejected, not fatal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.API_V1_KEY;
    delete process.env.SETUP_TOKEN;
    delete process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN;
  });

  it("API v1 answers 401 for an over-length X-API-Key", async () => {
    process.env.API_V1_KEY = "the-real-key";
    const { requireApiV1Access } = await import("@/lib/api-access");

    const request = new NextRequest("http://localhost/api/v1/trees", {
      headers: { "X-API-Key": HUGE },
    });

    const response = await requireApiV1Access(request);
    expect(response?.status).toBe(401);
  });

  it("admin setup answers 403 for an over-length x-setup-token", async () => {
    process.env.SETUP_TOKEN = "the-real-token";
    const { POST } = await import("@/app/api/admin/setup/route");

    const request = new NextRequest("http://localhost/api/admin/setup", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-setup-token": HUGE,
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "Sufficiently-L0ng!Password",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it("workflow auth answers false for an over-length Authorization header", async () => {
    process.env.IMAGE_PROPOSALS_WORKFLOW_TOKEN = "the-real-token";
    const { isAuthenticatedWorkflowRequest } =
      await import("@/lib/auth/workflow-auth");

    await expect(
      isAuthenticatedWorkflowRequest(`Bearer ${HUGE}`)
    ).resolves.toBe(false);
  });
});
