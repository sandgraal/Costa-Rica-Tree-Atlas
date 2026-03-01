/**
 * Tests for province/distribution filtering and URL parameter parsing
 */

import { describe, it, expect } from "vitest";
import { filterTrees, extractFacets } from "@/lib/search";
import type { Tree, TreeFilter, Distribution } from "@/types/tree";

// Minimal tree factory for testing
function mockTree(overrides: Partial<Tree> = {}): Tree {
  return {
    _id: "test-id",
    _raw: {},
    body: { raw: "", code: "" },
    url: "/trees/test",
    slug: "test-tree",
    locale: "en",
    title: "Test Tree",
    scientificName: "Testus treeus",
    family: "Testaceae",
    description: "A test tree",
    ...overrides,
  } as Tree;
}

describe("Province/Distribution filtering", () => {
  const trees: Tree[] = [
    mockTree({
      slug: "ceiba",
      title: "Ceiba",
      distribution: ["guanacaste", "puntarenas", "alajuela"],
    }),
    mockTree({
      slug: "guanacaste",
      title: "Guanacaste",
      distribution: ["guanacaste"],
    }),
    mockTree({
      slug: "ojoche",
      title: "Ojoche",
      distribution: ["limon", "heredia"],
    }),
    mockTree({
      slug: "no-dist",
      title: "No Distribution",
      distribution: undefined,
    }),
  ];

  it("returns all trees when no distribution filter is set", () => {
    const result = filterTrees(trees, {});
    expect(result).toHaveLength(4);
  });

  it("filters by single province (OR logic)", () => {
    const filter: TreeFilter = { distribution: ["guanacaste"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.slug)).toEqual(
      expect.arrayContaining(["ceiba", "guanacaste"])
    );
  });

  it("filters by multiple provinces (OR logic — any match)", () => {
    const filter: TreeFilter = {
      distribution: ["limon", "guanacaste"] as Distribution[],
    };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(3);
    expect(result.map((t) => t.slug)).toEqual(
      expect.arrayContaining(["ceiba", "guanacaste", "ojoche"])
    );
  });

  it("excludes trees with no distribution data when filter is active", () => {
    const filter: TreeFilter = { distribution: ["guanacaste"] };
    const result = filterTrees(trees, filter);
    expect(result.find((t) => t.slug === "no-dist")).toBeUndefined();
  });

  it("combines province and family filters", () => {
    const treesWithFamilies = [
      mockTree({
        slug: "a",
        family: "Fabaceae",
        distribution: ["guanacaste"],
      }),
      mockTree({
        slug: "b",
        family: "Moraceae",
        distribution: ["guanacaste"],
      }),
      mockTree({
        slug: "c",
        family: "Fabaceae",
        distribution: ["limon"],
      }),
    ];
    const filter: TreeFilter = {
      distribution: ["guanacaste"],
      family: "Fabaceae",
    };
    const result = filterTrees(treesWithFamilies, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("a");
  });
});

describe("extractFacets distribution counts", () => {
  it("counts distributions correctly", () => {
    const trees: Tree[] = [
      mockTree({ distribution: ["guanacaste", "puntarenas"] }),
      mockTree({ distribution: ["guanacaste", "limon"] }),
      mockTree({ distribution: ["puntarenas"] }),
    ];
    const facets = extractFacets(trees);
    const distMap = Object.fromEntries(
      facets.distributions.map((d) => [d.value, d.count])
    );
    expect(distMap["guanacaste"]).toBe(2);
    expect(distMap["puntarenas"]).toBe(2);
    expect(distMap["limon"]).toBe(1);
  });

  it("returns distributions sorted by count (descending)", () => {
    const trees: Tree[] = [
      mockTree({ distribution: ["limon", "puntarenas"] }),
      mockTree({ distribution: ["limon", "puntarenas"] }),
      mockTree({ distribution: ["limon"] }),
      mockTree({ distribution: ["guanacaste"] }),
    ];
    const facets = extractFacets(trees);
    expect(facets.distributions[0].value).toBe("limon");
    expect(facets.distributions[0].count).toBe(3);
  });
});
