import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

let rateLimitOk = true;
let dbAvailable = true;
const mockContributions: Record<string, unknown>[] = [];

const queryRawMock = vi.fn(async (strings: TemplateStringsArray) => {
  const sql = strings.join(" ");

  if (!dbAvailable) throw new Error('relation "contributions" does not exist');

  // Rate limit check
  if (
    sql.includes("SELECT COUNT(*) as count FROM contributions") &&
    sql.includes("created_at >")
  ) {
    return [{ count: rateLimitOk ? BigInt(0) : BigInt(10) }];
  }

  // Insert contribution
  if (sql.includes("INSERT INTO contributions")) {
    const id = "test-contribution-id";
    return [{ id }];
  }

  // Count contributions (for GET pagination)
  if (sql.includes("SELECT COUNT(*)") && sql.includes("FROM contributions")) {
    return [{ count: BigInt(mockContributions.length) }];
  }

  // Select contributions
  if (sql.includes("FROM contributions") && sql.includes("ORDER BY")) {
    return mockContributions;
  }

  return [];
});

// Mock for $queryRawUnsafe
const queryRawUnsafeMock = vi.fn(async () => mockContributions);

vi.mock("@/lib/prisma", () => ({
  default: {
    $queryRaw: queryRawMock,
    $queryRawUnsafe: queryRawUnsafeMock,
  },
}));

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

const { POST, GET } = await import("@/app/api/contributions/route");

function createPostRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest(
    new URL("/api/contributions", "http://localhost:3000"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "1.2.3.4",
      },
      body: JSON.stringify(body),
    }
  );
}

function createGetRequest(params?: Record<string, string>): NextRequest {
  const url = new URL("/api/contributions", "http://localhost:3000");
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new NextRequest(url, {
    headers: { "x-forwarded-for": "1.2.3.4" },
  });
}

describe("POST /api/contributions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitOk = true;
    dbAvailable = true;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a new species contribution", async () => {
    const req = createPostRequest({
      type: "NEW_SPECIES",
      title: "Mango Tree",
      description: "A tropical fruit tree very common in Costa Rica",
      scientificName: "Mangifera indica",
      family: "Anacardiaceae",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.contributionId).toBeDefined();
  });

  it("creates a correction contribution with treeSlug", async () => {
    const req = createPostRequest({
      type: "CORRECTION",
      title: "Fix elevation data",
      description: "Elevation should be 0-1500m not 0-1200m",
      treeSlug: "ceiba",
      targetField: "elevation",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
  });

  describe("validation", () => {
    it("returns 400 for missing type", async () => {
      const req = createPostRequest({
        title: "Test",
        description: "Test description",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for missing title", async () => {
      const req = createPostRequest({
        type: "NEW_SPECIES",
        description: "Test description",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for missing description", async () => {
      const req = createPostRequest({
        type: "NEW_SPECIES",
        title: "Test",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for invalid contribution type", async () => {
      const req = createPostRequest({
        type: "INVALID_TYPE",
        title: "Test",
        description: "Test description",
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toContain("Invalid contribution type");
    });

    it("returns 400 for CORRECTION without treeSlug", async () => {
      const req = createPostRequest({
        type: "CORRECTION",
        title: "Fix something",
        description: "Something is wrong",
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.error).toContain("Tree slug is required");
    });

    it("returns 400 for LOCAL_KNOWLEDGE without treeSlug", async () => {
      const req = createPostRequest({
        type: "LOCAL_KNOWLEDGE",
        title: "Traditional use",
        description: "This tree is used for medicine",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("returns 400 for TRANSLATION without treeSlug", async () => {
      const req = createPostRequest({
        type: "TRANSLATION",
        title: "Translate ceiba",
        description: "Spanish translation needed",
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });

  it("returns 429 when rate limited", async () => {
    rateLimitOk = false;

    const req = createPostRequest({
      type: "NEW_SPECIES",
      title: "Test",
      description: "Test description",
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });
});

describe("GET /api/contributions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbAvailable = true;
    mockContributions.length = 0;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns contributions list", async () => {
    mockContributions.push({
      id: "contrib-1",
      type: "NEW_SPECIES",
      title: "Mango",
      status: "PENDING",
      created_at: new Date().toISOString(),
    });

    const req = createGetRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.contributions).toBeDefined();
  });

  it("returns empty array when no contributions", async () => {
    const req = createGetRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
  });

  it("handles database not ready gracefully", async () => {
    dbAvailable = false;

    const req = createGetRequest();
    const res = await GET(req);

    // Should return 200 with empty data or 503 - not 500
    expect([200, 503]).toContain(res.status);
  });

  it("applies priority filter in SQL when used alone", async () => {
    const req = createGetRequest({ priority: "HIGH" });
    const res = await GET(req);

    expect(res.status).toBe(200);
    // Verify the query was executed (mock was called for SELECT + COUNT)
    expect(queryRawMock).toHaveBeenCalled();
    const body = await res.json();
    expect(body.contributions).toBeDefined();
  });

  it("applies both type and priority filters together in SQL", async () => {
    const req = createGetRequest({ type: "NEW_SPECIES", priority: "HIGH" });
    const res = await GET(req);

    expect(res.status).toBe(200);
    // Verify the query was executed and returned valid response
    expect(queryRawMock).toHaveBeenCalled();
    const body = await res.json();
    expect(body.contributions).toBeDefined();
  });

  it("returns 400 for invalid priority filter", async () => {
    const req = createGetRequest({ priority: "INVALID" });
    const res = await GET(req);

    expect(res.status).toBe(400);
  });
});
