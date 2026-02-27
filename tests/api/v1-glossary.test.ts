import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mockGlossaryTerms = [
  {
    slug: "deciduous",
    locale: "en",
    term: "Deciduous",
    simpleDefinition: "A tree that loses its leaves seasonally",
    technicalDefinition:
      "A plant that sheds all its leaves annually in response to seasonal change",
    category: "ecology",
    pronunciation: "deh-SID-yoo-us",
    etymology: "Latin deciduus, from decidere (to fall off)",
    exampleSpecies: ["ceiba", "guanacaste"],
    relatedTerms: ["evergreen", "semi-deciduous"],
    image: undefined,
    publishedAt: "2025-01-01",
  },
  {
    slug: "deciduous",
    locale: "es",
    term: "Caducifolio",
    simpleDefinition: "Un árbol que pierde sus hojas estacionalmente",
    technicalDefinition:
      "Una planta que pierde todas sus hojas anualmente en respuesta al cambio estacional",
    category: "ecology",
    pronunciation: "ka-du-si-FO-lio",
    etymology: "Del latín caducus (que cae)",
    exampleSpecies: ["ceiba", "guanacaste"],
    relatedTerms: ["evergreen", "semi-deciduous"],
    image: undefined,
    publishedAt: "2025-01-01",
  },
  {
    slug: "evergreen",
    locale: "en",
    term: "Evergreen",
    simpleDefinition: "A tree that keeps its leaves year-round",
    technicalDefinition: undefined,
    category: "ecology",
    pronunciation: undefined,
    etymology: undefined,
    exampleSpecies: [],
    relatedTerms: ["deciduous"],
    image: undefined,
    publishedAt: "2025-01-15",
  },
  {
    slug: "semi-deciduous",
    locale: "en",
    term: "Semi-deciduous",
    simpleDefinition: "A tree that drops some but not all leaves",
    technicalDefinition: undefined,
    category: "ecology",
    pronunciation: undefined,
    etymology: undefined,
    exampleSpecies: [],
    relatedTerms: [],
    image: undefined,
    publishedAt: "2025-02-01",
  },
  {
    slug: "phloem",
    locale: "en",
    term: "Phloem",
    simpleDefinition: "The tissue that transports food in a plant",
    technicalDefinition:
      "Vascular tissue responsible for transporting photosynthates",
    category: "anatomy",
    pronunciation: "FLO-em",
    etymology: "Greek phloios (bark)",
    exampleSpecies: [],
    relatedTerms: [],
    image: undefined,
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
    slug: "guanacaste",
    locale: "en",
    title: "Guanacaste",
    scientificName: "Enterolobium cyclocarpum",
    family: "Fabaceae",
    description: "National tree of Costa Rica",
  },
];

vi.mock("contentlayer/generated", () => ({
  allGlossaryTerms: mockGlossaryTerms,
  allTrees: mockTrees,
}));

function createRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

// ---- List route ----

const listRoute = await import("@/app/api/v1/glossary/route");

describe("GET /api/v1/glossary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated glossary terms with default locale", async () => {
    const res = await listRoute.GET(createRequest("/api/v1/glossary"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toBeDefined();
    expect(body.pagination).toBeDefined();
    // No locale filter — returns all 5 terms across both locales
    expect(body.pagination.total).toBe(5);
  });

  it("filters by locale", async () => {
    const res = await listRoute.GET(
      createRequest("/api/v1/glossary?locale=es")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(1);
    expect(body.data[0].locale).toBe("es");
  });

  it("filters by category", async () => {
    const res = await listRoute.GET(
      createRequest("/api/v1/glossary?category=anatomy&locale=en")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(1);
    expect(body.data[0].term).toBe("Phloem");
  });

  it("filters by free-text search", async () => {
    const res = await listRoute.GET(
      createRequest("/api/v1/glossary?search=transport&locale=en")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.pagination.total).toBe(1);
    expect(body.data[0].slug).toBe("phloem");
  });

  it("paginates correctly", async () => {
    const res = await listRoute.GET(
      createRequest("/api/v1/glossary?page=1&pageSize=2&locale=en")
    );
    const body = await res.json();

    expect(body.data).toHaveLength(2);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.totalPages).toBe(2);
    expect(body.pagination.hasNext).toBe(true);
  });

  it("includes _links in response items", async () => {
    const res = await listRoute.GET(
      createRequest("/api/v1/glossary?locale=en")
    );
    const body = await res.json();

    expect(body.data[0]._links.self).toContain("/api/v1/glossary/");
    expect(body.data[0]._links.html).toContain("/en/glossary/");
  });

  it("includes rate-limit and cache headers", async () => {
    const res = await listRoute.GET(createRequest("/api/v1/glossary"));
    expect(res.headers.get("X-RateLimit-Limit")).toBeDefined();
    expect(res.headers.get("Cache-Control")).toBeDefined();
  });
});

// ---- Detail route ----

const detailRoute = await import("@/app/api/v1/glossary/[slug]/route");

function createParams(slug: string): { params: Promise<{ slug: string }> } {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/v1/glossary/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns term with enriched related terms", async () => {
    const res = await detailRoute.GET(
      createRequest("/api/v1/glossary/deciduous?locale=en"),
      createParams("deciduous")
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.slug).toBe("deciduous");
    expect(body.data.term).toBe("Deciduous");
    expect(body.data._embedded).toBeDefined();
    expect(body.data._embedded.relatedTerms.length).toBeGreaterThan(0);
    expect(body.data._embedded.relatedTerms[0].term).toBe("Evergreen");
  });

  it("returns term with enriched example species", async () => {
    const res = await detailRoute.GET(
      createRequest("/api/v1/glossary/deciduous?locale=en"),
      createParams("deciduous")
    );
    const body = await res.json();

    expect(body.data._embedded.exampleSpecies).toBeDefined();
    expect(body.data._embedded.exampleSpecies).toHaveLength(2);
    expect(body.data._embedded.exampleSpecies[0].title).toBe("Ceiba");
    expect(body.data._embedded.exampleSpecies[0].scientificName).toBe(
      "Ceiba pentandra"
    );
  });

  it("returns 404 for non-existent slug", async () => {
    const res = await detailRoute.GET(
      createRequest("/api/v1/glossary/nonexistent"),
      createParams("nonexistent")
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns locale-not-found when term exists in other locale", async () => {
    const res = await detailRoute.GET(
      createRequest("/api/v1/glossary/deciduous?locale=fr"),
      createParams("deciduous")
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("LOCALE_NOT_FOUND");
    expect(body._links.alternatives).toBeDefined();
  });

  it("includes _links self and html", async () => {
    const res = await detailRoute.GET(
      createRequest("/api/v1/glossary/deciduous?locale=en"),
      createParams("deciduous")
    );
    const body = await res.json();

    expect(body.data._links.self).toContain("/api/v1/glossary/deciduous");
    expect(body.data._links.html).toContain("/en/glossary/deciduous");
  });

  it("defaults to English locale", async () => {
    const res = await detailRoute.GET(
      createRequest("/api/v1/glossary/deciduous"),
      createParams("deciduous")
    );
    const body = await res.json();

    expect(body.data.locale).toBe("en");
    expect(body.data.term).toBe("Deciduous");
  });

  it("returns Spanish locale when requested", async () => {
    const res = await detailRoute.GET(
      createRequest("/api/v1/glossary/deciduous?locale=es"),
      createParams("deciduous")
    );
    const body = await res.json();

    expect(body.data.locale).toBe("es");
    expect(body.data.term).toBe("Caducifolio");
  });

  it("includes rate-limit headers", async () => {
    const res = await detailRoute.GET(
      createRequest("/api/v1/glossary/deciduous"),
      createParams("deciduous")
    );
    expect(res.headers.get("X-RateLimit-Limit")).toBeDefined();
  });
});
