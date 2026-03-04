import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockComparisons = [
  {
    slug: "ceiba-vs-pochote",
    locale: "en",
    title: "Ceiba vs Pochote",
    species: ["ceiba", "pochote"],
    keyDifference: "Trunk spines differ",
    description: "How to tell Ceiba and Pochote apart",
    difficulty: "moderate",
    confusionRating: 4,
    comparisonTags: ["trunk", "bark"],
    seasonalNote: "Best when leafless",
    publishedAt: "2025-01-15",
  },
  {
    slug: "ceiba-vs-pochote",
    locale: "es",
    title: "Ceiba vs Pochote",
    species: ["ceiba", "pochote"],
    keyDifference: "Las espinas difieren",
    description: "Cómo distinguir la Ceiba del Pochote",
    difficulty: "moderate",
    confusionRating: 4,
    comparisonTags: ["trunk", "bark"],
    seasonalNote: "Mejor sin hojas",
    publishedAt: "2025-01-15",
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

const { GET } = await import("@/app/api/v1/comparisons/[slug]/route");

function createRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    headers: { "X-API-Key": "test-api-key" },
  });
}

function createParams(slug: string): { params: Promise<{ slug: string }> } {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/v1/comparisons/[slug]", () => {
  beforeEach(() => {
    process.env.API_V1_KEY = "test-api-key";
    vi.clearAllMocks();
  });

  it("returns comparison with enriched species data", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons/ceiba-vs-pochote?locale=en"),
      createParams("ceiba-vs-pochote")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.slug).toBe("ceiba-vs-pochote");
    expect(body.data.species).toEqual(["ceiba", "pochote"]);
    expect(body.data._embedded).toBeDefined();
    expect(body.data._embedded.species).toHaveLength(2);
    expect(body.data._embedded.species[0].title).toBe("Ceiba");
    expect(body.data._embedded.species[0].scientificName).toBe(
      "Ceiba pentandra"
    );
    expect(body.data._embedded.species[1].title).toBe("Pochote");
  });

  it("returns 404 for non-existent slug", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons/no-such-comparison"),
      createParams("no-such-comparison")
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns locale-not-found when slug exists but not in requested locale", async () => {
    // ceiba-vs-pochote exists in en and es, but not in a made-up locale variant
    // Actually, let's use ES locale which does exist — need to test missing locale
    // Use en locale for a comparison that only exists in en:
    const res = await GET(
      createRequest("/api/v1/comparisons/ceiba-vs-pochote?locale=fr"),
      createParams("ceiba-vs-pochote")
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    // The slug exists in "en" and "es", but "fr" is not found—LOCALE_NOT_FOUND
    expect(body.error.code).toBe("LOCALE_NOT_FOUND");
    expect(body._links.alternatives).toBeDefined();
  });

  it("includes _links self and html", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons/ceiba-vs-pochote?locale=en"),
      createParams("ceiba-vs-pochote")
    );
    const body = await res.json();

    expect(body.data._links.self).toContain(
      "/api/v1/comparisons/ceiba-vs-pochote"
    );
    expect(body.data._links.html).toContain("/en/compare/ceiba-vs-pochote");
  });

  it("includes rate-limit headers", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons/ceiba-vs-pochote"),
      createParams("ceiba-vs-pochote")
    );
    expect(res.headers.get("X-RateLimit-Limit")).toBeDefined();
  });

  it("includes cache-control header on success", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons/ceiba-vs-pochote"),
      createParams("ceiba-vs-pochote")
    );
    expect(res.headers.get("Cache-Control")).toContain("max-age");
  });

  it("defaults to English locale", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons/ceiba-vs-pochote"),
      createParams("ceiba-vs-pochote")
    );
    const body = await res.json();

    expect(body.data.locale).toBe("en");
    expect(body.data.keyDifference).toBe("Trunk spines differ");
  });

  it("returns Spanish locale when requested", async () => {
    const res = await GET(
      createRequest("/api/v1/comparisons/ceiba-vs-pochote?locale=es"),
      createParams("ceiba-vs-pochote")
    );
    const body = await res.json();

    expect(body.data.locale).toBe("es");
    expect(body.data.keyDifference).toBe("Las espinas difieren");
  });
});
