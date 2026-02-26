import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let tablesExist = true;
let rateLimitOk = true;
const existingVotes: { id: string; is_flag: boolean }[] = [];
let flagCount = BigInt(0);
const existingProposals: { id: string }[] = [];

const queryRawMock = vi.fn(async (strings: TemplateStringsArray) => {
  const sql = strings.join(" ");

  if (sql.includes("SELECT 1 FROM image_votes LIMIT 1")) {
    if (!tablesExist) throw new Error("Table not found");
    return [{ ok: 1 }];
  }

  if (
    sql.includes("SELECT COUNT(*) as count") &&
    sql.includes("is_flag = true") &&
    sql.includes("FROM image_votes") &&
    sql.includes("created_at >")
  ) {
    return [{ count: rateLimitOk ? BigInt(0) : BigInt(50) }];
  }

  if (sql.includes("SELECT id, is_flag FROM image_votes")) {
    return existingVotes;
  }

  if (
    sql.includes("SELECT COUNT(*) as count") &&
    sql.includes("is_flag = true") &&
    !sql.includes("created_at >")
  ) {
    return [{ count: flagCount }];
  }

  if (sql.includes("SELECT id FROM image_proposals")) {
    return existingProposals;
  }

  return [];
});

const executeRawMock = vi.fn(async () => 1);

vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: queryRawMock,
    $executeRaw: executeRawMock,
  },
}));

vi.mock("@/lib/validation/slug", () => ({
  validateSlug: vi.fn((input: string | null) => {
    if (!input) return { valid: false, error: "Slug required" };
    return { valid: true, sanitized: input };
  }),
}));

const { POST } = await import("@/app/api/images/flag/route");

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL("/api/images/flag", "http://localhost:3000"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "1.2.3.4",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/images/flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tablesExist = true;
    rateLimitOk = true;
    existingVotes.length = 0;
    existingProposals.length = 0;
    flagCount = BigInt(1);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("creates a new flag successfully", async () => {
    const req = createRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      reason: "WRONG_SPECIES",
      details: "This is a palm tree",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.id).toBeDefined();
    expect(body.message).toContain("Flag submitted");
  });

  it("converts existing vote to flag", async () => {
    existingVotes.push({ id: "existing-vote-1", is_flag: false });

    const req = createRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      reason: "POOR_QUALITY",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.status).toBe("updated_existing_vote_to_flag");
  });

  it("returns 409 when already flagged", async () => {
    existingVotes.push({ id: "existing-flag-1", is_flag: true });

    const req = createRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      reason: "MISLABELED",
    });
    const res = await POST(req);

    expect(res.status).toBe(409);
  });

  it("auto-creates proposal after 3+ flags", async () => {
    flagCount = BigInt(3);

    const req = createRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      reason: "WRONG_SPECIES",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.autoProposalCreated).toBe(true);
  });

  it("does not create duplicate proposal", async () => {
    flagCount = BigInt(5);
    existingProposals.push({ id: "existing-proposal-1" });

    const req = createRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      reason: "WRONG_SPECIES",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.autoProposalCreated).toBe(false);
  });

  it("sets vote-session cookie", async () => {
    const req = createRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      reason: "POOR_QUALITY",
    });
    const res = await POST(req);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("vote-session");
  });

  describe("validation", () => {
    it("returns 400 for missing treeSlug", async () => {
      const req = createRequest({
        imageType: "FEATURED",
        reason: "WRONG_SPECIES",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for missing imageType", async () => {
      const req = createRequest({
        treeSlug: "ceiba",
        reason: "WRONG_SPECIES",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for missing reason", async () => {
      const req = createRequest({
        treeSlug: "ceiba",
        imageType: "FEATURED",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid imageType", async () => {
      const req = createRequest({
        treeSlug: "ceiba",
        imageType: "INVALID",
        reason: "WRONG_SPECIES",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid reason", async () => {
      const req = createRequest({
        treeSlug: "ceiba",
        imageType: "FEATURED",
        reason: "INVALID_REASON",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("error handling", () => {
    it("returns 503 when tables don't exist", async () => {
      tablesExist = false;

      const req = createRequest({
        treeSlug: "ceiba",
        imageType: "FEATURED",
        reason: "WRONG_SPECIES",
      });
      const res = await POST(req);
      expect(res.status).toBe(503);
    });

    it("returns 429 when rate limited", async () => {
      rateLimitOk = false;

      const req = createRequest({
        treeSlug: "ceiba",
        imageType: "FEATURED",
        reason: "WRONG_SPECIES",
      });
      const res = await POST(req);
      expect(res.status).toBe(429);
    });
  });
});
