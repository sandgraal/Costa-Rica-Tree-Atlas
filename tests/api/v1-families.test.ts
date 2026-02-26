import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockTrees = [
  {
    slug: "ceiba",
    locale: "en",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
    family: "Malvaceae",
    description: "A ceiba tree",
  },
  {
    slug: "ceiba",
    locale: "es",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
    family: "Malvaceae",
    description: "Un árbol de ceiba",
  },
  {
    slug: "guanacaste",
    locale: "en",
    title: "Guanacaste",
    scientificName: "Enterolobium cyclocarpum",
    family: "Fabaceae",
    description: "National tree",
  },
  {
    slug: "balsa",
    locale: "en",
    title: "Balsa",
    scientificName: "Ochroma pyramidale",
    family: "Malvaceae",
    description: "Fast growing tree",
  },
  {
    slug: "cortez-amarillo",
    locale: "en",
    title: "Cortez Amarillo",
    scientificName: "Tabebuia ochracea",
    family: "Bignoniaceae",
    description: "Yellow flowering tree",
  },
];

vi.mock("contentlayer/generated", () => ({
  allTrees: mockTrees,
}));

const { GET } = await import("@/app/api/v1/families/route");

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/v1/families", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns family list with species counts for English", async () => {
    const req = createRequest("/api/v1/families?locale=en");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.meta).toBeDefined();
    expect(body._links).toBeDefined();

    // 3 English families: Bignoniaceae (1), Fabaceae (1), Malvaceae (2)
    expect(body.meta.totalFamilies).toBe(3);
    expect(body.meta.totalSpecies).toBe(4); // 4 English trees
    expect(body.meta.locale).toBe("en");
  });

  it("returns families sorted alphabetically", async () => {
    const req = createRequest("/api/v1/families?locale=en");
    const res = await GET(req);
    const body = await res.json();

    const names = body.data.map((f: { name: string }) => f.name);
    expect(names).toEqual(["Bignoniaceae", "Fabaceae", "Malvaceae"]);
  });

  it("includes correct species count per family", async () => {
    const req = createRequest("/api/v1/families?locale=en");
    const res = await GET(req);
    const body = await res.json();

    const malvaceae = body.data.find(
      (f: { name: string }) => f.name === "Malvaceae"
    );
    expect(malvaceae.speciesCount).toBe(2); // ceiba + balsa

    const fabaceae = body.data.find(
      (f: { name: string }) => f.name === "Fabaceae"
    );
    expect(fabaceae.speciesCount).toBe(1); // guanacaste
  });

  it("includes _links to species endpoint for each family", async () => {
    const req = createRequest("/api/v1/families?locale=en");
    const res = await GET(req);
    const body = await res.json();

    const malvaceae = body.data.find(
      (f: { name: string }) => f.name === "Malvaceae"
    );
    expect(malvaceae._links.species).toContain(
      "/api/v1/trees?family=Malvaceae"
    );
    expect(malvaceae._links.species).toContain("locale=en");
  });

  it("defaults to English when no locale specified", async () => {
    const req = createRequest("/api/v1/families");
    const res = await GET(req);
    const body = await res.json();

    expect(body.meta.locale).toBe("en");
  });

  it("filters by Spanish locale", async () => {
    const req = createRequest("/api/v1/families?locale=es");
    const res = await GET(req);
    const body = await res.json();

    // Only ceiba exists in es
    expect(body.meta.totalFamilies).toBe(1);
    expect(body.meta.totalSpecies).toBe(1);
    expect(body.data[0].name).toBe("Malvaceae");
  });

  it("returns cache control headers with longer TTL", async () => {
    const req = createRequest("/api/v1/families");
    const res = await GET(req);

    expect(res.headers.get("Cache-Control")).toBe(
      "public, max-age=3600, s-maxage=7200"
    );
  });

  it("returns rate limit headers", async () => {
    const req = createRequest("/api/v1/families");
    const res = await GET(req);

    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
  });

  it("includes top-level _links", async () => {
    const req = createRequest("/api/v1/families?locale=en");
    const res = await GET(req);
    const body = await res.json();

    expect(body._links.self).toContain("/api/v1/families");
    expect(body._links.trees).toContain("/api/v1/trees");
  });
});
