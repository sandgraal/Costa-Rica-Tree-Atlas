import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockComparisons = [
  {
    slug: "ceiba-vs-pochote",
    locale: "en",
    title: "Ceiba vs Pochote",
    species: ["ceiba", "pochote"],
    keyDifference: "Trunk spines: Ceiba has conical, Pochote has sharp",
    description: "How to tell Ceiba and Pochote apart",
    difficulty: "moderate",
    confusionRating: 4,
    comparisonTags: ["trunk", "bark", "leaves"],
    seasonalNote: "Best distinguished when leafless: Jan-Mar",
    publishedAt: "2025-01-15",
  },
  {
    slug: "ceiba-vs-pochote",
    locale: "es",
    title: "Ceiba vs Pochote",
    species: ["ceiba", "pochote"],
    keyDifference: "Espinas del tronco: Ceiba cónicas, Pochote afiladas",
    description: "Cómo distinguir la Ceiba del Pochote",
    difficulty: "moderate",
    confusionRating: 4,
    comparisonTags: ["trunk", "bark", "leaves"],
    seasonalNote: "Mejor distinguir sin hojas: Ene-Mar",
    publishedAt: "2025-01-15",
  },
  {
    slug: "mango-vs-espavel",
    locale: "en",
    title: "Mango vs Espavel",
    species: ["mango", "espavel"],
    keyDifference: "Leaf arrangement and fruit type differ significantly",
    description: "Commonly confused tropical trees",
    difficulty: "easy",
    confusionRating: 3,
    comparisonTags: ["leaves", "fruit"],
    seasonalNote: "Fruit differences most visible May-Aug",
    publishedAt: "2025-02-01",
  },
  {
    slug: "ron-ron-vs-cocobolo",
    locale: "en",
    title: "Ron-Ron vs Cocobolo",
    species: ["ron-ron", "cocobolo"],
    keyDifference: "Heartwood color and bark texture",
    description: "Both are valuable hardwoods in dry forests",
    difficulty: "challenging",
    confusionRating: 5,
    comparisonTags: ["bark", "flowers"],
    seasonalNote: undefined,
    publishedAt: "2025-03-01",
  },
];

const mockTrees = [
  {
    slug: "ceiba",
    locale: "en",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
    family: "Malvaceae",
    description: "The magnificent ceiba tree",
  },
  {
    slug: "pochote",
    locale: "en",
    title: "Pochote",
    scientificName: "Pachira quinata",
    family: "Malvaceae",
    description: "A spiny tropical tree",
  },
];

vi.mock("contentlayer/generated", () => ({
  allSpeciesComparisons: mockComparisons,
  allTrees: mockTrees,
}));

const { GET } = await import("@/app/api/v1/comparisons/route");

function createRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: { "X-API-Key": "test-api-key" },
  });
}

describe("GET /api/v1/comparisons", () => {
  beforeEach(() => {
    process.env.API_V1_KEY = "test-api-key";
    vi.clearAllMocks();
  });

  // ----- Basic listing -----

  it("returns paginated comparisons with default locale", async () => {
    const res = await GET(createRequest("/api/v1/comparisons"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.pagination).toBeDefined();
    expect(body._links).toBeDefined();
    // No locale filter — returns all 4 comparisons across both locales
    expect(body.pagination.total).toBe(4);
  });

  it("filters by locale", async () => {
    const res = await GET(createRequest("/api/v1/comparisons?locale=es"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(1);
    expect(body.data[0].locale).toBe("es");
  });

  // ----- Filtering -----

  it("filters by species", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons?species=ceiba&locale=en")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(1);
    expect(body.data[0].species).toContain("ceiba");
  });

  it("filters by difficulty", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons?difficulty=easy&locale=en")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(1);
    expect(body.data[0].difficulty).toBe("easy");
  });

  it("filters by tag", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons?tag=flowers&locale=en")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    // Only ron-ron-vs-cocobolo has "flowers" tag
    expect(body.pagination.total).toBe(1);
    expect(body.data[0].slug).toBe("ron-ron-vs-cocobolo");
  });

  it("filters by free-text search", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons?search=hardwood&locale=en")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(1);
    expect(body.data[0].slug).toBe("ron-ron-vs-cocobolo");
  });

  // ----- Pagination -----

  it("respects page and pageSize", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons?page=1&pageSize=2&locale=en")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.length).toBe(2);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.pageSize).toBe(2);
    expect(body.pagination.totalPages).toBe(2);
    expect(body.pagination.hasNext).toBe(true);
    expect(body.pagination.hasPrev).toBe(false);
  });

  it("returns empty data for out-of-range page", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons?page=99&locale=en")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(0);
    expect(body.pagination.hasNext).toBe(false);
  });

  // ----- Response shape -----

  it("includes _links in each comparison", async () => {
    const res = await GET(createRequest("/api/v1/comparisons?locale=en"));
    const body = await res.json();

    const first = body.data[0];
    expect(first._links).toBeDefined();
    expect(first._links.self).toContain("/api/v1/comparisons/");
    expect(first._links.html).toContain("/en/compare/");
  });

  it("includes rate-limit headers", async () => {
    const res = await GET(createRequest("/api/v1/comparisons"));
    expect(res.headers.get("X-RateLimit-Limit")).toBeDefined();
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
    expect(res.headers.get("X-RateLimit-Reset")).toBeDefined();
  });

  it("includes cache-control header", async () => {
    const res = await GET(createRequest("/api/v1/comparisons"));
    expect(res.headers.get("Cache-Control")).toBeDefined();
  });
});
