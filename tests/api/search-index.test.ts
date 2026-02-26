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
