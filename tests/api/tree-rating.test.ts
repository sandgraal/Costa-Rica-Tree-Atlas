import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let dbAvailable = true;
let rateLimitCount = BigInt(0);
let existingRatings: Array<{ rating: number }> = [];
let aggregation = [
  { avg_rating: null as number | null, total_count: BigInt(0) },
];

const queryRawMock = vi.fn(async (strings: TemplateStringsArray) => {
  const sql = strings.join(" ");

  if (!dbAvailable) throw new Error('relation "tree_ratings" does not exist');

  // Rate limit check
  if (sql.includes("SELECT COUNT(*)") && sql.includes("ip_hash")) {
    return [{ count: rateLimitCount }];
  }

  // Aggregate rating
  if (sql.includes("AVG(rating)") && sql.includes("tree_ratings")) {
    return aggregation;
  }

  // User rating lookup
  if (sql.includes("SELECT rating FROM tree_ratings")) {
    return existingRatings;
  }

  return [];
});

const executeRawMock = vi.fn(async () => {
  if (!dbAvailable) throw new Error('relation "tree_ratings" does not exist');
  return 1;
});

vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: queryRawMock,
    $executeRaw: executeRawMock,
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("@/lib/error-tracking", () => ({
  captureApiError: vi.fn(),
}));

// Mock contentlayer with known tree slugs
vi.mock("contentlayer/generated", () => ({
  allTrees: [
    { slug: "ceiba", locale: "en" },
    { slug: "ceiba", locale: "es" },
    { slug: "guanacaste", locale: "en" },
    { slug: "guanacaste", locale: "es" },
  ],
}));

const { GET, POST } = await import("@/app/api/trees/[slug]/rating/route");

function createGetRequest(
  slug: string
): [NextRequest, { params: Promise<{ slug: string }> }] {
  const req = new NextRequest(
    new URL(`/api/trees/${slug}/rating`, "http://localhost:3000"),
    {
      headers: { "x-forwarded-for": "1.2.3.4" },
    }
  );
  return [req, { params: Promise.resolve({ slug }) }];
}

function createPostRequest(
  slug: string,
  body: Record<string, unknown>
): [NextRequest, { params: Promise<{ slug: string }> }] {
  const req = new NextRequest(
    new URL(`/api/trees/${slug}/rating`, "http://localhost:3000"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "1.2.3.4",
      },
      body: JSON.stringify(body),
    }
  );
  return [req, { params: Promise.resolve({ slug }) }];
}

describe("GET /api/trees/[slug]/rating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbAvailable = true;
    rateLimitCount = BigInt(0);
    existingRatings = [];
    aggregation = [{ avg_rating: null, total_count: BigInt(0) }];
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns aggregate rating for valid tree", async () => {
    aggregation = [{ avg_rating: 4.5, total_count: BigInt(10) }];
    existingRatings = [{ rating: 5 }];

    const [req, routeParams] = createGetRequest("ceiba");
    const res = await GET(req, routeParams);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.treeSlug).toBe("ceiba");
    expect(body.averageRating).toBe(4.5);
    expect(body.totalRatings).toBe(10);
    expect(body.userRating).toBe(5);
  });

  it("returns null rating when no ratings exist", async () => {
    const [req, routeParams] = createGetRequest("ceiba");
    const res = await GET(req, routeParams);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.averageRating).toBeNull();
    expect(body.totalRatings).toBe(0);
    expect(body.userRating).toBeNull();
  });

  it("returns 404 for non-existent tree slug", async () => {
    const [req, routeParams] = createGetRequest("nonexistent-tree");
    const res = await GET(req, routeParams);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Tree not found");
  });

  it("handles missing table gracefully with 200", async () => {
    dbAvailable = false;

    const [req, routeParams] = createGetRequest("ceiba");
    const res = await GET(req, routeParams);
    const body = await res.json();

    // Should return 200 with empty data and setup message
    expect(res.status).toBe(200);
    expect(body.averageRating).toBeNull();
    expect(body.totalRatings).toBe(0);
    expect(body.userRating).toBeNull();
    expect(body.message).toContain("being set up");
  });
});

describe("POST /api/trees/[slug]/rating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbAvailable = true;
    rateLimitCount = BigInt(0);
    existingRatings = [];
    aggregation = [{ avg_rating: 4.0, total_count: BigInt(1) }];
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits a new rating successfully", async () => {
    const [req, routeParams] = createPostRequest("ceiba", { rating: 4 });
    const res = await POST(req, routeParams);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.userRating).toBe(4);
    expect(body.treeSlug).toBe("ceiba");
    expect(executeRawMock).toHaveBeenCalled();
  });

  it("returns 404 for non-existent tree slug", async () => {
    const [req, routeParams] = createPostRequest("nonexistent-tree", {
      rating: 3,
    });
    const res = await POST(req, routeParams);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Tree not found");
  });

  it("validates rating is an integer between 1 and 5", async () => {
    // Too low
    const [req1, rp1] = createPostRequest("ceiba", { rating: 0 });
    const res1 = await POST(req1, rp1);
    expect(res1.status).toBe(400);

    // Too high
    const [req2, rp2] = createPostRequest("ceiba", { rating: 6 });
    const res2 = await POST(req2, rp2);
    expect(res2.status).toBe(400);

    // Not a number
    const [req3, rp3] = createPostRequest("ceiba", { rating: "five" });
    const res3 = await POST(req3, rp3);
    expect(res3.status).toBe(400);

    // Decimal
    const [req4, rp4] = createPostRequest("ceiba", { rating: 3.5 });
    const res4 = await POST(req4, rp4);
    expect(res4.status).toBe(400);
  });

  it("returns 429 when rate limited", async () => {
    rateLimitCount = BigInt(50);

    const [req, routeParams] = createPostRequest("ceiba", { rating: 4 });
    const res = await POST(req, routeParams);

    expect(res.status).toBe(429);
  });

  it("handles missing table gracefully with 503", async () => {
    dbAvailable = false;

    const [req, routeParams] = createPostRequest("ceiba", { rating: 4 });
    const res = await POST(req, routeParams);
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.success).toBe(false);
    expect(body.error).toContain("being set up");
  });

  it("sets rating_session cookie for new sessions", async () => {
    const [req, routeParams] = createPostRequest("ceiba", { rating: 5 });
    const res = await POST(req, routeParams);

    expect(res.status).toBe(200);
    // Response should set the rating_session cookie
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("rating_session");
  });
});
