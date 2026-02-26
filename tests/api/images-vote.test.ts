import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Track mock DB state
let tablesExist = true;
let rateLimitOk = true;
const existingVotes: { id: string }[] = [];
const voteStats = [
  { upvotes: BigInt(5), downvotes: BigInt(2), flags: BigInt(1) },
];
const sessionVotes: { is_upvote: boolean | null; is_flag: boolean }[] = [];

const queryRawMock = vi.fn(async (strings: TemplateStringsArray) => {
  const sql = strings.join(" ");

  if (sql.includes("SELECT 1 FROM image_votes LIMIT 1")) {
    if (!tablesExist) throw new Error("Table not found");
    return [{ ok: 1 }];
  }

  if (
    sql.includes("SELECT COUNT(*) as count") &&
    sql.includes("FROM image_votes")
  ) {
    return [{ count: rateLimitOk ? BigInt(0) : BigInt(100) }];
  }

  if (
    sql.includes("SELECT id FROM image_votes") &&
    sql.includes("session_id")
  ) {
    return existingVotes;
  }

  if (sql.includes("COALESCE(SUM")) {
    return voteStats;
  }

  if (sql.includes("SELECT is_upvote, is_flag")) {
    return sessionVotes;
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

const { GET, POST } = await import("@/app/api/images/vote/route");

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(new URL("/api/images/vote", "http://localhost:3000"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "1.2.3.4",
    },
    body: JSON.stringify(body),
  });
}

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL("/api/images/vote", "http://localhost:3000");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new NextRequest(url);
}

describe("POST /api/images/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tablesExist = true;
    rateLimitOk = true;
    existingVotes.length = 0;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("creates a new upvote successfully", async () => {
    const req = createPostRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      isUpvote: true,
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.created).toBe(true);
    expect(body.message).toBe("Vote recorded");
  });

  it("creates a new downvote successfully", async () => {
    const req = createPostRequest({
      treeSlug: "ceiba",
      imageType: "BARK",
      isUpvote: false,
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.created).toBe(true);
  });

  it("creates a flag successfully", async () => {
    const req = createPostRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      isFlag: true,
      flagReason: "WRONG_SPECIES",
      flagNotes: "This looks like a palm",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Flag submitted");
  });

  it("updates existing vote", async () => {
    existingVotes.push({ id: "existing-vote-1" });

    const req = createPostRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      isUpvote: true,
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.updated).toBe(true);
  });

  it("sets vote-session cookie on new vote", async () => {
    const req = createPostRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
      isUpvote: true,
    });
    const res = await POST(req);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("vote-session");
  });

  describe("validation", () => {
    it("returns 400 for missing treeSlug", async () => {
      const req = createPostRequest({
        imageType: "FEATURED",
        isUpvote: true,
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for missing imageType", async () => {
      const req = createPostRequest({
        treeSlug: "ceiba",
        isUpvote: true,
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid imageType", async () => {
      const req = createPostRequest({
        treeSlug: "ceiba",
        imageType: "INVALID_TYPE",
        isUpvote: true,
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toContain("Invalid imageType");
    });

    it("returns 400 when neither vote nor flag provided", async () => {
      const req = createPostRequest({
        treeSlug: "ceiba",
        imageType: "FEATURED",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid flag reason", async () => {
      const req = createPostRequest({
        treeSlug: "ceiba",
        imageType: "FEATURED",
        isFlag: true,
        flagReason: "INVALID_REASON",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  describe("error handling", () => {
    it("returns 503 when tables don't exist", async () => {
      tablesExist = false;

      const req = createPostRequest({
        treeSlug: "ceiba",
        imageType: "FEATURED",
        isUpvote: true,
      });
      const res = await POST(req);
      expect(res.status).toBe(503);
    });

    it("returns 429 when rate limited", async () => {
      rateLimitOk = false;

      const req = createPostRequest({
        treeSlug: "ceiba",
        imageType: "FEATURED",
        isUpvote: true,
      });
      const res = await POST(req);
      expect(res.status).toBe(429);
    });
  });
});

describe("GET /api/images/vote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tablesExist = true;
    sessionVotes.length = 0;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns vote stats for an image", async () => {
    const req = createGetRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.upvotes).toBe(5);
    expect(body.data.downvotes).toBe(2);
    expect(body.data.flags).toBe(1);
    expect(body.data.score).toBe(3); // 5 - 2
  });

  it("includes user vote when session has voted", async () => {
    sessionVotes.push({ is_upvote: true, is_flag: false });

    const req = createGetRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
    });
    const res = await GET(req);
    const body = await res.json();

    expect(body.data.userVote).toBeDefined();
    expect(body.data.userVote.isUpvote).toBe(true);
  });

  it("returns null userVote when session has not voted", async () => {
    const req = createGetRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
    });
    const res = await GET(req);
    const body = await res.json();

    expect(body.data.userVote).toBeNull();
  });

  it("returns 400 for missing treeSlug", async () => {
    const req = createGetRequest({ imageType: "FEATURED" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing imageType", async () => {
    const req = createGetRequest({ treeSlug: "ceiba" });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 503 when tables don't exist", async () => {
    tablesExist = false;

    const req = createGetRequest({
      treeSlug: "ceiba",
      imageType: "FEATURED",
    });
    const res = await GET(req);
    expect(res.status).toBe(503);
  });
});
