/**
 * Tests for seasonal (flowering/fruiting) filtering and facet extraction
 */

import { describe, it, expect } from "vitest";
import { filterTrees, extractFacets, getCurrentMonth } from "@/lib/search";
import type { Tree, TreeFilter, Month } from "@/types/tree";

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

describe("Seasonal filtering — flowering", () => {
  const trees: Tree[] = [
    mockTree({
      slug: "ceiba",
      title: "Ceiba",
      floweringSeason: ["january", "february", "march"],
    }),
    mockTree({
      slug: "guanacaste",
      title: "Guanacaste",
      floweringSeason: ["march", "april", "may"],
    }),
    mockTree({
      slug: "corteza",
      title: "Corteza Amarilla",
      floweringSeason: ["all-year"],
    }),
    mockTree({
      slug: "no-season",
      title: "No Season Data",
      floweringSeason: undefined,
    }),
  ];

  it("returns all trees when seasonalFilter is 'all'", () => {
    const filter: TreeFilter = { seasonalFilter: "all" };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(4);
  });

  it("returns all trees when no seasonal filter is set", () => {
    const result = filterTrees(trees, {});
    expect(result).toHaveLength(4);
  });

  it("filters trees flowering in a specific month", () => {
    const filter: TreeFilter = {
      seasonalFilter: "flowering",
      month: "january",
    };
    const result = filterTrees(trees, filter);
    // ceiba (jan-mar) and corteza (all-year) flower in january
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.slug)).toEqual(
      expect.arrayContaining(["ceiba", "corteza"])
    );
  });

  it("includes all-year trees in any month", () => {
    const filter: TreeFilter = {
      seasonalFilter: "flowering",
      month: "october",
    };
    const result = filterTrees(trees, filter);
    // Only corteza (all-year) flowers in october
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("corteza");
  });

  it("excludes trees with no flowering data when filter is active", () => {
    const filter: TreeFilter = { seasonalFilter: "flowering", month: "march" };
    const result = filterTrees(trees, filter);
    // ceiba (jan-mar), guanacaste (mar-may), corteza (all-year) — no-season excluded
    expect(result).toHaveLength(3);
    expect(result.find((t) => t.slug === "no-season")).toBeUndefined();
  });

  it("uses current month as default when month not specified", () => {
    const filter: TreeFilter = { seasonalFilter: "flowering" };
    const result = filterTrees(trees, filter);
    // Should use getCurrentMonth() — just verify we get a valid result
    expect(result.length).toBeGreaterThanOrEqual(1);
    // Corteza (all-year) should always be included
    expect(result.find((t) => t.slug === "corteza")).toBeDefined();
  });
});

describe("Seasonal filtering — fruiting", () => {
  const trees: Tree[] = [
    mockTree({
      slug: "mango",
      title: "Mango",
      fruitingSeason: ["april", "may", "june"],
    }),
    mockTree({
      slug: "guava",
      title: "Guava",
      fruitingSeason: ["all-year"],
    }),
    mockTree({
      slug: "cedar",
      title: "Cedar",
      fruitingSeason: ["october", "november"],
    }),
    mockTree({
      slug: "no-fruit",
      title: "No Fruit Data",
      fruitingSeason: undefined,
    }),
  ];

  it("filters trees fruiting in a specific month", () => {
    const filter: TreeFilter = { seasonalFilter: "fruiting", month: "april" };
    const result = filterTrees(trees, filter);
    // mango (apr-jun) and guava (all-year)
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.slug)).toEqual(
      expect.arrayContaining(["mango", "guava"])
    );
  });

  it("excludes trees not fruiting in the selected month", () => {
    const filter: TreeFilter = { seasonalFilter: "fruiting", month: "january" };
    const result = filterTrees(trees, filter);
    // Only guava (all-year)
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("guava");
  });
});

describe("Seasonal filtering — combined with other filters", () => {
  const trees: Tree[] = [
    mockTree({
      slug: "a",
      family: "Fabaceae",
      floweringSeason: ["march"],
      distribution: ["guanacaste"],
    }),
    mockTree({
      slug: "b",
      family: "Fabaceae",
      floweringSeason: ["june"],
      distribution: ["guanacaste"],
    }),
    mockTree({
      slug: "c",
      family: "Moraceae",
      floweringSeason: ["march"],
      distribution: ["limon"],
    }),
  ];

  it("combines seasonal filter with family filter", () => {
    const filter: TreeFilter = {
      seasonalFilter: "flowering",
      month: "march",
      family: "Fabaceae",
    };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("a");
  });

  it("combines seasonal filter with distribution filter", () => {
    const filter: TreeFilter = {
      seasonalFilter: "flowering",
      month: "march",
      distribution: ["guanacaste"],
    };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("a");
  });
});

describe("extractFacets seasonal counts", () => {
  it("counts flowering trees per month", () => {
    const trees: Tree[] = [
      mockTree({ floweringSeason: ["january", "february"] }),
      mockTree({ floweringSeason: ["january", "march"] }),
      mockTree({ floweringSeason: ["march"] }),
    ];
    const facets = extractFacets(trees);
    expect(facets.seasonal.january.floweringCount).toBe(2);
    expect(facets.seasonal.february.floweringCount).toBe(1);
    expect(facets.seasonal.march.floweringCount).toBe(2);
    expect(facets.seasonal.april.floweringCount).toBe(0);
  });

  it("counts fruiting trees per month", () => {
    const trees: Tree[] = [
      mockTree({ fruitingSeason: ["april", "may"] }),
      mockTree({ fruitingSeason: ["april"] }),
    ];
    const facets = extractFacets(trees);
    expect(facets.seasonal.april.fruitingCount).toBe(2);
    expect(facets.seasonal.may.fruitingCount).toBe(1);
    expect(facets.seasonal.june.fruitingCount).toBe(0);
  });

  it("expands all-year to all 12 months", () => {
    const trees: Tree[] = [mockTree({ floweringSeason: ["all-year"] })];
    const facets = extractFacets(trees);
    // all-year should add 1 to every month
    expect(facets.seasonal.january.floweringCount).toBe(1);
    expect(facets.seasonal.june.floweringCount).toBe(1);
    expect(facets.seasonal.december.floweringCount).toBe(1);
  });

  it("combines regular months with all-year", () => {
    const trees: Tree[] = [
      mockTree({ floweringSeason: ["all-year"] }),
      mockTree({ floweringSeason: ["march", "april"] }),
    ];
    const facets = extractFacets(trees);
    expect(facets.seasonal.march.floweringCount).toBe(2);
    expect(facets.seasonal.april.floweringCount).toBe(2);
    expect(facets.seasonal.january.floweringCount).toBe(1);
  });

  it("handles trees without seasonal data", () => {
    const trees: Tree[] = [
      mockTree({ floweringSeason: undefined, fruitingSeason: undefined }),
    ];
    const facets = extractFacets(trees);
    expect(facets.seasonal.january.floweringCount).toBe(0);
    expect(facets.seasonal.january.fruitingCount).toBe(0);
  });
});

describe("getCurrentMonth utility", () => {
  it("returns a valid month string", () => {
    const month = getCurrentMonth();
    const validMonths: Month[] = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    expect(validMonths).toContain(month);
  });
});
