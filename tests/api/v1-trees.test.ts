import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Mock data
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
    tags: ["native", "deciduous"],
    distribution: ["guanacaste", "puntarenas"],
    floweringSeason: ["march", "april"],
    fruitingSeason: ["june", "july"],
    toxicityLevel: undefined,
    toxicParts: undefined,
    skinContactRisk: undefined,
    allergenRisk: undefined,
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
    uses: ["madera", "ornamental"],
    tags: ["nativo", "caducifolio"],
    distribution: ["guanacaste", "puntarenas"],
    floweringSeason: ["marzo", "abril"],
    fruitingSeason: ["junio", "julio"],
    toxicityLevel: undefined,
    toxicParts: undefined,
    skinContactRisk: undefined,
    allergenRisk: undefined,
    featuredImage: "/images/trees/ceiba/featured.jpg",
    images: ["/images/trees/ceiba/01.jpg"],
    publishedAt: "2025-01-01",
    updatedAt: "2025-06-01",
  },
  {
    slug: "guanacaste",
    locale: "en",
    title: "Guanacaste",
    scientificName: "Enterolobium cyclocarpum",
    family: "Fabaceae",
    description: "The national tree of Costa Rica",
    nativeRegion: "Central America",
    maxHeight: "40 m",
    elevation: "0-900 m",
    conservationStatus: "LC",
    uses: ["shade", "timber"],
    tags: ["native", "evergreen"],
    distribution: ["guanacaste"],
    floweringSeason: ["february", "march"],
    fruitingSeason: ["april", "may"],
    toxicityLevel: undefined,
    toxicParts: undefined,
    skinContactRisk: undefined,
    allergenRisk: undefined,
    featuredImage: "/images/trees/guanacaste/featured.jpg",
    images: [],
    publishedAt: "2025-01-01",
    updatedAt: "2025-06-01",
  },
  {
    slug: "guanacaste",
    locale: "es",
    title: "Guanacaste",
    scientificName: "Enterolobium cyclocarpum",
    family: "Fabaceae",
    description: "El árbol nacional de Costa Rica",
    nativeRegion: "América Central",
    maxHeight: "40 m",
    elevation: "0-900 m",
    conservationStatus: "LC",
    uses: ["sombra", "madera"],
    tags: ["nativo", "perennifolio"],
    distribution: ["guanacaste"],
    floweringSeason: ["febrero", "marzo"],
    fruitingSeason: ["abril", "mayo"],
    toxicityLevel: undefined,
    toxicParts: undefined,
    skinContactRisk: undefined,
    allergenRisk: undefined,
    featuredImage: "/images/trees/guanacaste/featured.jpg",
    images: [],
    publishedAt: "2025-01-01",
    updatedAt: "2025-06-01",
  },
  {
    slug: "cortez-amarillo",
    locale: "en",
    title: "Cortez Amarillo",
    scientificName: "Tabebuia ochracea",
    family: "Bignoniaceae",
    description: "A stunning yellow-flowering tree",
    nativeRegion: "Central America",
    maxHeight: "25 m",
    elevation: "0-800 m",
    conservationStatus: "NT",
    uses: ["ornamental"],
    tags: ["native", "deciduous", "dry-forest"],
    distribution: ["guanacaste", "puntarenas"],
    floweringSeason: ["march"],
    fruitingSeason: ["may", "june"],
    toxicityLevel: undefined,
    toxicParts: undefined,
    skinContactRisk: undefined,
    allergenRisk: undefined,
    featuredImage: undefined,
    images: [],
    publishedAt: "2025-02-01",
    updatedAt: "2025-07-01",
  },
];

// Mock contentlayer
vi.mock("contentlayer/generated", () => ({
  allTrees: mockTrees,
}));

// Import after mock
const { GET } = await import("@/app/api/v1/trees/route");

function createRequest(
  url: string,
  headers?: Record<string, string>
): NextRequest {
  const req = new NextRequest(new URL(url, "http://localhost:3000"), {
    headers: headers ? new Headers(headers) : undefined,
  });
  return req;
}

describe("GET /api/v1/trees", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic responses", () => {
    it("returns paginated tree list", async () => {
      const req = createRequest("/api/v1/trees");
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.data).toBeDefined();
      expect(body.pagination).toBeDefined();
      expect(body.pagination.total).toBe(mockTrees.length);
      expect(body._links).toBeDefined();
      expect(body._links.self).toBeDefined();
      expect(body._links.first).toBeDefined();
      expect(body._links.last).toBeDefined();
    });

    it("returns rate limit headers", async () => {
      const req = createRequest("/api/v1/trees");
      const res = await GET(req);

      expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
      expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
    });

    it("returns cache control headers", async () => {
      const req = createRequest("/api/v1/trees");
      const res = await GET(req);

      expect(res.headers.get("Cache-Control")).toBe(
        "public, max-age=300, s-maxage=600"
      );
    });

    it("transforms tree data correctly", async () => {
      const req = createRequest("/api/v1/trees?locale=en");
      const res = await GET(req);
      const body = await res.json();
      const tree = body.data[0];

      expect(tree.slug).toBeDefined();
      expect(tree.title).toBeDefined();
      expect(tree.scientificName).toBeDefined();
      expect(tree.family).toBeDefined();
      expect(tree._links).toBeDefined();
      expect(tree._links.self).toContain("/api/v1/trees/");
      expect(tree._links.html).toContain("/trees/");
    });

    it("includes absolute URLs for featured images", async () => {
      const req = createRequest("/api/v1/trees?locale=en");
      const res = await GET(req);
      const body = await res.json();
      const ceiba = body.data.find((t: { slug: string }) => t.slug === "ceiba");

      expect(ceiba.featuredImage).toContain("http");
      expect(ceiba.featuredImage).toContain("/images/trees/ceiba/featured.jpg");
    });

    it("handles trees without featured images", async () => {
      const req = createRequest("/api/v1/trees?locale=en");
      const res = await GET(req);
      const body = await res.json();
      const cortez = body.data.find(
        (t: { slug: string }) => t.slug === "cortez-amarillo"
      );

      expect(cortez.featuredImage).toBeUndefined();
    });
  });

  describe("locale filtering", () => {
    it("filters by locale=en", async () => {
      const req = createRequest("/api/v1/trees?locale=en");
      const res = await GET(req);
      const body = await res.json();

      expect(
        body.data.every((t: { locale: string }) => t.locale === "en")
      ).toBe(true);
      // 3 English trees in mock data
      expect(body.pagination.total).toBe(3);
    });

    it("filters by locale=es", async () => {
      const req = createRequest("/api/v1/trees?locale=es");
      const res = await GET(req);
      const body = await res.json();

      expect(
        body.data.every((t: { locale: string }) => t.locale === "es")
      ).toBe(true);
      // 2 Spanish trees in mock data
      expect(body.pagination.total).toBe(2);
    });

    it("returns all locales when no locale filter", async () => {
      const req = createRequest("/api/v1/trees");
      const res = await GET(req);
      const body = await res.json();

      expect(body.pagination.total).toBe(5);
    });
  });

  describe("family filtering", () => {
    it("filters by family (case-insensitive)", async () => {
      const req = createRequest("/api/v1/trees?family=malvaceae");
      const res = await GET(req);
      const body = await res.json();

      expect(
        body.data.every((t: { family: string }) => t.family === "Malvaceae")
      ).toBe(true);
    });

    it("returns empty for non-existent family", async () => {
      const req = createRequest("/api/v1/trees?family=nonexistent");
      const res = await GET(req);
      const body = await res.json();

      expect(body.pagination.total).toBe(0);
      expect(body.data).toHaveLength(0);
    });
  });

  describe("conservation status filtering", () => {
    it("filters by conservation status", async () => {
      const req = createRequest("/api/v1/trees?conservationStatus=NT");
      const res = await GET(req);
      const body = await res.json();

      expect(body.data).toHaveLength(1);
      expect(body.data[0].slug).toBe("cortez-amarillo");
    });
  });

  describe("tag filtering", () => {
    it("filters by tag", async () => {
      const req = createRequest("/api/v1/trees?tag=deciduous&locale=en");
      const res = await GET(req);
      const body = await res.json();

      expect(body.data.length).toBeGreaterThan(0);
      expect(
        body.data.every((t: { tags: string[] }) =>
          t.tags?.some((tag: string) => tag.toLowerCase() === "deciduous")
        )
      ).toBe(true);
    });
  });

  describe("distribution filtering", () => {
    it("filters by distribution region", async () => {
      const req = createRequest(
        "/api/v1/trees?distribution=puntarenas&locale=en"
      );
      const res = await GET(req);
      const body = await res.json();

      expect(body.data.length).toBeGreaterThan(0);
      expect(
        body.data.every((t: { distribution: string[] }) =>
          t.distribution?.some((d: string) => d.toLowerCase() === "puntarenas")
        )
      ).toBe(true);
    });
  });

  describe("season filtering", () => {
    it("filters by flowering season", async () => {
      const req = createRequest(
        "/api/v1/trees?floweringSeason=march&locale=en"
      );
      const res = await GET(req);
      const body = await res.json();

      expect(body.data.length).toBeGreaterThan(0);
    });

    it("filters by fruiting season", async () => {
      const req = createRequest("/api/v1/trees?fruitingSeason=june&locale=en");
      const res = await GET(req);
      const body = await res.json();

      expect(body.data.length).toBeGreaterThan(0);
    });
  });

  describe("search filtering", () => {
    it("searches by title", async () => {
      const req = createRequest("/api/v1/trees?search=ceiba");
      const res = await GET(req);
      const body = await res.json();

      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data.some((t: { slug: string }) => t.slug === "ceiba")).toBe(
        true
      );
    });

    it("searches by scientific name", async () => {
      const req = createRequest("/api/v1/trees?search=enterolobium");
      const res = await GET(req);
      const body = await res.json();

      expect(body.data.length).toBeGreaterThan(0);
      expect(
        body.data.some((t: { slug: string }) => t.slug === "guanacaste")
      ).toBe(true);
    });

    it("returns empty for non-matching search", async () => {
      const req = createRequest("/api/v1/trees?search=xyznonexistent");
      const res = await GET(req);
      const body = await res.json();

      expect(body.data).toHaveLength(0);
    });
  });

  describe("pagination", () => {
    it("respects page and pageSize params", async () => {
      const req = createRequest("/api/v1/trees?page=1&pageSize=2");
      const res = await GET(req);
      const body = await res.json();

      expect(body.data).toHaveLength(2);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.pageSize).toBe(2);
      expect(body.pagination.hasNext).toBe(true);
    });

    it("returns second page", async () => {
      const req = createRequest("/api/v1/trees?page=2&pageSize=2");
      const res = await GET(req);
      const body = await res.json();

      expect(body.pagination.page).toBe(2);
      expect(body.pagination.hasPrev).toBe(true);
    });

    it("caps pageSize at 100", async () => {
      const req = createRequest("/api/v1/trees?pageSize=500");
      const res = await GET(req);
      const body = await res.json();

      expect(body.pagination.pageSize).toBe(100);
    });

    it("enforces minimum pageSize of 1", async () => {
      const req = createRequest("/api/v1/trees?pageSize=0");
      const res = await GET(req);
      const body = await res.json();

      expect(body.pagination.pageSize).toBe(1);
    });

    it("includes next/prev links when appropriate", async () => {
      const req = createRequest("/api/v1/trees?page=1&pageSize=2");
      const res = await GET(req);
      const body = await res.json();

      expect(body._links.next).toBeDefined();
      expect(body._links.prev).toBeUndefined();
    });
  });

  describe("sorting", () => {
    it("sorts by title ascending by default", async () => {
      const req = createRequest("/api/v1/trees?locale=en");
      const res = await GET(req);
      const body = await res.json();
      const titles = body.data.map((t: { title: string }) => t.title);

      expect(titles).toEqual([...titles].sort());
    });

    it("sorts by title descending", async () => {
      const req = createRequest("/api/v1/trees?locale=en&order=desc");
      const res = await GET(req);
      const body = await res.json();
      const titles = body.data.map((t: { title: string }) => t.title);

      expect(titles).toEqual([...titles].sort().reverse());
    });

    it("sorts by scientificName", async () => {
      const req = createRequest("/api/v1/trees?locale=en&sort=scientificName");
      const res = await GET(req);
      const body = await res.json();
      const names = body.data.map(
        (t: { scientificName: string }) => t.scientificName
      );

      expect(names).toEqual([...names].sort());
    });
  });

  describe("combined filters", () => {
    it("combines locale + family filter", async () => {
      const req = createRequest("/api/v1/trees?locale=en&family=Fabaceae");
      const res = await GET(req);
      const body = await res.json();

      expect(body.data).toHaveLength(1);
      expect(body.data[0].slug).toBe("guanacaste");
      expect(body.data[0].locale).toBe("en");
    });

    it("combines locale + tag + distribution", async () => {
      const req = createRequest(
        "/api/v1/trees?locale=en&tag=deciduous&distribution=puntarenas"
      );
      const res = await GET(req);
      const body = await res.json();

      // Both ceiba and cortez-amarillo are deciduous in puntarenas
      expect(body.data.length).toBeGreaterThan(0);
      expect(
        body.data.every((t: { locale: string }) => t.locale === "en")
      ).toBe(true);
    });
  });
});
