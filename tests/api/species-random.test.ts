import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockTrees = [
  {
    slug: "ceiba",
    locale: "en",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
  },
  {
    slug: "guanacaste",
    locale: "en",
    title: "Guanacaste",
    scientificName: "Enterolobium cyclocarpum",
  },
  {
    slug: "ceiba",
    locale: "es",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
  },
];

vi.mock("contentlayer/generated", () => ({
  allTrees: mockTrees,
}));

// Mock rateLimit to always allow
vi.mock("@/lib/ratelimit", () => ({
  rateLimit: vi.fn().mockResolvedValue({
    headers: { "X-RateLimit-Remaining": "99" },
  }),
}));

// Mock validation
vi.mock("@/lib/validation", () => ({
  validateLocale: vi.fn((input: string | null) => {
    if (!input) return { valid: true, sanitized: "en" };
    const lower = (input || "").toLowerCase().trim();
    if (lower !== "en" && lower !== "es") {
      return { valid: false, error: 'Invalid locale. Must be "en" or "es"' };
    }
    return { valid: true, sanitized: lower };
  }),
  validateScientificName: vi.fn(),
}));

const { GET } = await import("@/app/api/species/random/route");

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/species/random", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a random tree for English locale", async () => {
    const req = createRequest("/api/species/random?locale=en");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.slug).toBeDefined();
    expect(body.title).toBeDefined();
    expect(body.scientificName).toBeDefined();

    // Should be one of the English trees
    const englishSlugs = ["ceiba", "guanacaste"];
    expect(englishSlugs).toContain(body.slug);
  });

  it("returns a random tree for Spanish locale", async () => {
    const req = createRequest("/api/species/random?locale=es");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.slug).toBe("ceiba"); // Only Spanish tree
  });

  it("defaults to English when no locale", async () => {
    const req = createRequest("/api/species/random");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    const englishSlugs = ["ceiba", "guanacaste"];
    expect(englishSlugs).toContain(body.slug);
  });

  it("returns 400 for invalid locale", async () => {
    const req = createRequest("/api/species/random?locale=fr");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns only slug, title, and scientificName", async () => {
    const req = createRequest("/api/species/random?locale=en");
    const res = await GET(req);
    const body = await res.json();

    expect(Object.keys(body)).toEqual(
      expect.arrayContaining(["slug", "title", "scientificName"])
    );
    // Should NOT include full tree data
    expect(body.family).toBeUndefined();
    expect(body.description).toBeUndefined();
  });
});
