import { describe, expect, it, vi } from "vitest";

const mockTrees = [
  {
    slug: "ceiba",
    locale: "en",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
    family: "Malvaceae",
    description: "A magnificent tree",
    uses: ["timber", "ornamental"],
    tags: ["native"],
    nativeRegion: "Central America",
    distribution: ["guanacaste"],
    conservationStatus: "LC",
  },
  {
    slug: "ceiba",
    locale: "es",
    title: "Ceiba",
    scientificName: "Ceiba pentandra",
    family: "Malvaceae",
    description: "Un árbol magnífico",
    uses: ["madera"],
    tags: ["nativo"],
    nativeRegion: "América Central",
    distribution: ["guanacaste"],
    conservationStatus: "LC",
  },
  {
    slug: "guanacaste",
    locale: "en",
    title: "Guanacaste",
    scientificName: "Enterolobium cyclocarpum",
    family: "Fabaceae",
    description: "National tree",
    uses: ["shade"],
    tags: ["native"],
    nativeRegion: "Central America",
    distribution: ["guanacaste"],
    conservationStatus: "LC",
  },
];

vi.mock("contentlayer/generated", () => ({
  allTrees: mockTrees,
}));

vi.mock("@i18n/routing", () => ({
  routing: {
    locales: ["en", "es"],
  },
}));

const { GET } = await import("@/app/api/trees/search-index/route");
const { GET: GET_BY_LOCALE, generateStaticParams } =
  await import("@/app/api/trees/search-index/[locale]/route");

describe("GET /api/trees/search-index", () => {
  it("returns search index grouped by locale", async () => {
    const res = GET();
    const body = await res.json();

    expect(body.en).toBeDefined();
    expect(body.es).toBeDefined();
  });

  it("includes correct fields for search", async () => {
    const res = GET();
    const body = await res.json();

    const ceiba = body.en.find((t: { slug: string }) => t.slug === "ceiba");
    expect(ceiba).toBeDefined();
    expect(ceiba.title).toBe("Ceiba");
    expect(ceiba.scientificName).toBe("Ceiba pentandra");
    expect(ceiba.family).toBe("Malvaceae");
    expect(ceiba.description).toBe("A magnificent tree");
    expect(ceiba.uses).toEqual(["timber", "ornamental"]);
    expect(ceiba.tags).toEqual(["native"]);
    expect(ceiba.nativeRegion).toBe("Central America");
    expect(ceiba.distribution).toEqual(["guanacaste"]);
    expect(ceiba.conservationStatus).toBe("LC");
  });

  it("does not include body/raw content", async () => {
    const res = GET();
    const body = await res.json();

    const ceiba = body.en.find((t: { slug: string }) => t.slug === "ceiba");
    expect(ceiba).not.toHaveProperty("body");
    expect(ceiba).not.toHaveProperty("_raw");
    expect(ceiba).not.toHaveProperty("_id");
  });

  it("groups correctly per locale", async () => {
    const res = GET();
    const body = await res.json();

    // 2 English trees
    expect(body.en).toHaveLength(2);
    // 1 Spanish tree
    expect(body.es).toHaveLength(1);
  });

  it("returns proper cache headers", async () => {
    const res = GET();

    expect(res.headers.get("Cache-Control")).toBe(
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
  });
});

/**
 * The all-locales route above is `force-static`, which means `searchParams` are
 * unavailable at render time. It used to advertise a `?locale=` filter, and a
 * test asserted that filter worked — by calling GET() directly with a
 * hand-built NextRequest, which bypasses static rendering entirely. The unit
 * test proved a behaviour that could never occur in production, and every real
 * client silently downloaded both locales.
 *
 * A path segment CAN be statically generated, so the filter now lives here.
 */
describe("GET /api/trees/search-index/[locale]", () => {
  const params = (locale: string) => ({ params: Promise.resolve({ locale }) });

  it("pre-renders one route per supported locale", () => {
    expect(generateStaticParams()).toEqual([
      { locale: "en" },
      { locale: "es" },
    ]);
  });

  it("returns only the requested locale, as a flat array", async () => {
    const res = await GET_BY_LOCALE(
      new Request("http://localhost:3000/api/trees/search-index/es"),
      params("es")
    );
    const body = await res.json();

    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].slug).toBe("ceiba");
    expect(body[0].locale).toBeUndefined();
  });

  it("does not leak the other locale's entries", async () => {
    const res = await GET_BY_LOCALE(
      new Request("http://localhost:3000/api/trees/search-index/en"),
      params("en")
    );
    const body = await res.json();

    expect(body).toHaveLength(2);
    expect(body.map((t: { slug: string }) => t.slug).sort()).toEqual([
      "ceiba",
      "guanacaste",
    ]);
  });

  it("404s on an unsupported locale", async () => {
    const res = await GET_BY_LOCALE(
      new Request("http://localhost:3000/api/trees/search-index/fr"),
      params("fr")
    );
    expect(res.status).toBe(404);
  });

  it("returns proper cache headers", async () => {
    const res = await GET_BY_LOCALE(
      new Request("http://localhost:3000/api/trees/search-index/en"),
      params("en")
    );
    expect(res.headers.get("Cache-Control")).toBe(
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
  });
});
