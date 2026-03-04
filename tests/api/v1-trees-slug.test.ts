import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Mock data - same family trees for related feature
const mockTrees = [
  {
    slug: "ceiba",
    locale: "en",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
    family: "Malvaceae",
    description: "The magnificent ceiba tree",
    nativeRegion: "Central America",
    maxHeight: "70 m",
    elevation: "0-1200 m",
    conservationStatus: "LC",
    uses: ["timber", "ornamental"],
    tags: ["native"],
    distribution: ["guanacaste"],
    floweringSeason: ["march"],
    fruitingSeason: ["june"],
    featuredImage: "/images/trees/ceiba/featured.jpg",
    images: ["/images/trees/ceiba/01.jpg"],
    publishedAt: "2025-01-01",
    updatedAt: "2025-06-01",
  },
  {
    slug: "ceiba",
    locale: "es",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
    family: "Malvaceae",
    description: "El magnífico árbol de ceiba",
    nativeRegion: "América Central",
    maxHeight: "70 m",
    elevation: "0-1200 m",
    conservationStatus: "LC",
    uses: ["madera"],
    tags: ["nativo"],
    distribution: ["guanacaste"],
    floweringSeason: ["marzo"],
    fruitingSeason: ["junio"],
    featuredImage: "/images/trees/ceiba/featured.jpg",
    images: [],
    publishedAt: "2025-01-01",
    updatedAt: "2025-06-01",
  },
  {
    slug: "balsa",
    locale: "en",
    title: "Balsa",
    scientificName: "Ochroma pyramidale",
    family: "Malvaceae",
    description: "A fast-growing tropical tree",
    nativeRegion: "Central America",
    maxHeight: "30 m",
    elevation: "0-1000 m",
    conservationStatus: "LC",
    uses: ["timber"],
    tags: ["native"],
    distribution: ["guanacaste"],
    floweringSeason: ["november"],
    fruitingSeason: ["january"],
    featuredImage: undefined,
    images: [],
    publishedAt: "2025-01-01",
    updatedAt: "2025-06-01",
  },
];

vi.mock("contentlayer/generated", () => ({
  allTrees: mockTrees,
}));

const { GET } = await import("@/app/api/v1/trees/[slug]/route");

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    headers: { "X-API-Key": "test-api-key" },
  });
}

describe("GET /api/v1/trees/[slug]", () => {
  beforeEach(() => {
    process.env.API_V1_KEY = "test-api-key";
    vi.clearAllMocks();
  });

  describe("successful lookup", () => {
    it("returns a tree by slug and locale", async () => {
      const req = createRequest("/api/v1/trees/ceiba?locale=en");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "ceiba" }),
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.slug).toBe("ceiba");
      expect(body.data.locale).toBe("en");
      expect(body.data.title).toBe("Ceiba");
      expect(body.data.scientificName).toBe("Ceiba pentandra");
    });

    it("defaults to English locale", async () => {
      const req = createRequest("/api/v1/trees/ceiba");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "ceiba" }),
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.locale).toBe("en");
    });

    it("returns Spanish tree when locale=es", async () => {
      const req = createRequest("/api/v1/trees/ceiba?locale=es");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "ceiba" }),
      });
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data.locale).toBe("es");
      expect(body.data.description).toContain("magnífico");
    });

    it("includes related trees from same family", async () => {
      const req = createRequest("/api/v1/trees/ceiba?locale=en");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "ceiba" }),
      });
      const body = await res.json();

      expect(body._related).toBeDefined();
      expect(body._related.length).toBeGreaterThan(0);
      expect(body._related[0].slug).toBe("balsa");
    });

    it("returns rate limit and cache headers", async () => {
      const req = createRequest("/api/v1/trees/ceiba?locale=en");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "ceiba" }),
      });

      expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
      expect(res.headers.get("Cache-Control")).toBe(
        "public, max-age=300, s-maxage=600"
      );
    });
  });

  describe("not found cases", () => {
    it("returns 404 NOT_FOUND for non-existent slug", async () => {
      const req = createRequest("/api/v1/trees/nonexistent?locale=en");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "nonexistent" }),
      });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error.code).toBe("NOT_FOUND");
      expect(body._links).toBeDefined();
    });

    it("returns 404 LOCALE_NOT_FOUND when slug exists but locale does not", async () => {
      // balsa only exists in "en", not "es"
      const req = createRequest("/api/v1/trees/balsa?locale=es");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "balsa" }),
      });
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.error.code).toBe("LOCALE_NOT_FOUND");
      expect(body.error.message).toContain("Available in:");
      expect(body._links.alternatives).toBeDefined();
    });
  });

  describe("data transformation", () => {
    it("includes absolute URL for featured image", async () => {
      const req = createRequest("/api/v1/trees/ceiba?locale=en");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "ceiba" }),
      });
      const body = await res.json();

      expect(body.data.featuredImage).toContain("http");
      expect(body.data.featuredImage).toContain(
        "/images/trees/ceiba/featured.jpg"
      );
    });

    it("handles trees without featured images", async () => {
      const req = createRequest("/api/v1/trees/balsa?locale=en");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "balsa" }),
      });
      const body = await res.json();

      expect(body.data.featuredImage).toBeUndefined();
    });

    it("includes _links with self and html URLs", async () => {
      const req = createRequest("/api/v1/trees/ceiba?locale=en");
      const res = await GET(req, {
        params: Promise.resolve({ slug: "ceiba" }),
      });
      const body = await res.json();

      expect(body.data._links.self).toContain("/api/v1/trees/ceiba");
      expect(body.data._links.html).toContain("/en/trees/ceiba");
    });
  });
});
