/**
 * Tests for height range filtering, use category filtering,
 * and facet extraction for both.
 */

import { describe, it, expect } from "vitest";
import {
  filterTrees,
  extractFacets,
  parseMaxHeightMeters,
  classifyHeight,
  classifyUses,
} from "@/lib/search";
import type { Tree, TreeFilter, HeightRange, UseCategory } from "@/types/tree";

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

// ============================================================================
// parseMaxHeightMeters
// ============================================================================

describe("parseMaxHeightMeters", () => {
  it("parses '20-30 meters' → 20", () => {
    expect(parseMaxHeightMeters("20-30 meters")).toBe(20);
  });

  it("parses '15-25 meters (50-80 feet)' → 15", () => {
    expect(parseMaxHeightMeters("15-25 meters (50-80 feet)")).toBe(15);
  });

  it("parses '5-12 meters (16-40 feet)' → 5", () => {
    expect(parseMaxHeightMeters("5-12 meters (16-40 feet)")).toBe(5);
  });

  it("parses '40-60 meters (130-200 feet)' → 40", () => {
    expect(parseMaxHeightMeters("40-60 meters (130-200 feet)")).toBe(40);
  });

  it("returns NaN for undefined", () => {
    expect(parseMaxHeightMeters(undefined)).toBeNaN();
  });

  it("returns NaN for empty string", () => {
    expect(parseMaxHeightMeters("")).toBeNaN();
  });

  it("returns NaN for text without numbers", () => {
    expect(parseMaxHeightMeters("unknown")).toBeNaN();
  });
});

// ============================================================================
// classifyHeight
// ============================================================================

describe("classifyHeight", () => {
  it("classifies < 10m as small", () => {
    expect(classifyHeight("5-8 meters")).toBe("small");
    expect(classifyHeight("8-15 meters")).toBe("small");
  });

  it("classifies 10-24m as medium", () => {
    expect(classifyHeight("10-20 meters")).toBe("medium");
    expect(classifyHeight("15-25 meters")).toBe("medium");
  });

  it("classifies 25-39m as large", () => {
    expect(classifyHeight("25-35 meters")).toBe("large");
    expect(classifyHeight("30-40 meters")).toBe("large");
  });

  it("classifies >= 40m as very-large", () => {
    expect(classifyHeight("40-60 meters")).toBe("very-large");
    expect(classifyHeight("50-70 meters")).toBe("very-large");
  });

  it("returns null for undefined", () => {
    expect(classifyHeight(undefined)).toBeNull();
  });

  it("returns null for unparseable string", () => {
    expect(classifyHeight("unknown")).toBeNull();
  });
});

// ============================================================================
// classifyUses
// ============================================================================

describe("classifyUses", () => {
  it("classifies timber uses", () => {
    const result = classifyUses(["Premium timber", "Fine furniture"]);
    expect(result).toContain("timber");
  });

  it("classifies medicine uses", () => {
    const result = classifyUses(["Traditional medicine"]);
    expect(result).toContain("medicine");
  });

  it("classifies food uses", () => {
    const result = classifyUses([
      "Fresh fruit consumption",
      "Juice and beverages",
    ]);
    expect(result).toContain("food");
  });

  it("classifies ornamental uses", () => {
    const result = classifyUses(["Ornamental landscaping"]);
    expect(result).toContain("ornamental");
  });

  it("classifies environmental uses", () => {
    const result = classifyUses(["Reforestation", "Erosion control"]);
    expect(result).toContain("environmental");
  });

  it("classifies agriculture uses", () => {
    const result = classifyUses(["Living fences", "Firewood"]);
    expect(result).toContain("agriculture");
  });

  it("classifies crafts uses", () => {
    const result = classifyUses(["Musical instruments", "Handicrafts"]);
    expect(result).toContain("crafts");
  });

  it("returns multiple categories for multi-use trees", () => {
    const result = classifyUses([
      "Traditional medicine",
      "Premium timber",
      "Edible fruit",
    ]);
    expect(result).toContain("medicine");
    expect(result).toContain("timber");
    expect(result).toContain("food");
  });

  it("returns empty array for undefined uses", () => {
    expect(classifyUses(undefined)).toEqual([]);
  });

  it("returns empty array for empty uses", () => {
    expect(classifyUses([])).toEqual([]);
  });

  it("returns empty array for unrecognized uses", () => {
    expect(classifyUses(["something completely unknown"])).toEqual([]);
  });

  it("is case-insensitive", () => {
    const result = classifyUses(["TRADITIONAL MEDICINE"]);
    expect(result).toContain("medicine");
  });

  it("does not match 'oil' keyword inside 'soil' (regression test for false positive)", () => {
    // "Soil conservation" and "Soil rehabilitation" contain "oil" as a substring
    // but must NOT be classified as food — only as environmental.
    const result = classifyUses(["Soil conservation", "Soil rehabilitation"]);
    expect(result).not.toContain("food");
    expect(result).toContain("environmental");
  });
});

// ============================================================================
// filterTrees — height range
// ============================================================================

describe("filterTrees — height range", () => {
  const trees: Tree[] = [
    mockTree({
      slug: "small-tree",
      title: "Small Tree",
      maxHeight: "5-8 meters",
    }),
    mockTree({
      slug: "medium-tree",
      title: "Medium Tree",
      maxHeight: "15-25 meters",
    }),
    mockTree({
      slug: "large-tree",
      title: "Large Tree",
      maxHeight: "30-40 meters",
    }),
    mockTree({
      slug: "giant-tree",
      title: "Giant Tree",
      maxHeight: "45-60 meters",
    }),
    mockTree({
      slug: "no-height",
      title: "No Height",
      maxHeight: undefined,
    }),
  ];

  it("returns all trees when no height filter is set", () => {
    const result = filterTrees(trees, {});
    expect(result).toHaveLength(5);
  });

  it("filters by small height range", () => {
    const filter: TreeFilter = { heightRange: ["small"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("small-tree");
  });

  it("filters by medium height range", () => {
    const filter: TreeFilter = { heightRange: ["medium"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("medium-tree");
  });

  it("filters by large height range", () => {
    const filter: TreeFilter = { heightRange: ["large"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("large-tree");
  });

  it("filters by very-large height range", () => {
    const filter: TreeFilter = { heightRange: ["very-large"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("giant-tree");
  });

  it("excludes trees without maxHeight data", () => {
    const filter: TreeFilter = { heightRange: ["small"] };
    const result = filterTrees(trees, filter);
    expect(result.find((t) => t.slug === "no-height")).toBeUndefined();
  });
});

// ============================================================================
// filterTrees — use category
// ============================================================================

describe("filterTrees — use category", () => {
  const trees: Tree[] = [
    mockTree({
      slug: "timber-tree",
      title: "Timber Tree",
      uses: ["Premium timber", "Construction"],
    }),
    mockTree({
      slug: "medicine-tree",
      title: "Medicine Tree",
      uses: ["Traditional medicine"],
    }),
    mockTree({
      slug: "fruit-tree",
      title: "Fruit Tree",
      uses: ["Fresh fruit consumption", "Juice and beverages"],
    }),
    mockTree({
      slug: "multi-use",
      title: "Multi-Use Tree",
      uses: ["Traditional medicine", "Timber", "Edible fruit"],
    }),
    mockTree({
      slug: "no-uses",
      title: "No Uses",
      uses: undefined,
    }),
  ];

  it("returns all trees when no use filter is set", () => {
    const result = filterTrees(trees, {});
    expect(result).toHaveLength(5);
  });

  it("filters by timber category", () => {
    const filter: TreeFilter = { useCategory: ["timber"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.slug)).toEqual(
      expect.arrayContaining(["timber-tree", "multi-use"])
    );
  });

  it("filters by medicine category", () => {
    const filter: TreeFilter = { useCategory: ["medicine"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.slug)).toEqual(
      expect.arrayContaining(["medicine-tree", "multi-use"])
    );
  });

  it("filters by food category", () => {
    const filter: TreeFilter = { useCategory: ["food"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.slug)).toEqual(
      expect.arrayContaining(["fruit-tree", "multi-use"])
    );
  });

  it("excludes trees without uses data", () => {
    const filter: TreeFilter = { useCategory: ["timber"] };
    const result = filterTrees(trees, filter);
    expect(result.find((t) => t.slug === "no-uses")).toBeUndefined();
  });
});

// ============================================================================
// Combined filters
// ============================================================================

describe("filterTrees — combined height + use + family", () => {
  const trees: Tree[] = [
    mockTree({
      slug: "big-timber",
      family: "Fabaceae",
      maxHeight: "30-45 meters",
      uses: ["Premium timber"],
    }),
    mockTree({
      slug: "small-timber",
      family: "Fabaceae",
      maxHeight: "5-10 meters",
      uses: ["Light construction"],
    }),
    mockTree({
      slug: "big-medicine",
      family: "Meliaceae",
      maxHeight: "25-35 meters",
      uses: ["Traditional medicine"],
    }),
    mockTree({
      slug: "small-ornamental",
      family: "Bignoniaceae",
      maxHeight: "6-12 meters",
      uses: ["Ornamental"],
    }),
  ];

  it("combines height + use category", () => {
    const filter: TreeFilter = {
      heightRange: ["large"],
      useCategory: ["timber"],
    };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("big-timber");
  });

  it("combines family + height", () => {
    const filter: TreeFilter = { family: ["Fabaceae"], heightRange: ["small"] };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("small-timber");
  });

  it("combines all three filters", () => {
    const filter: TreeFilter = {
      family: ["Meliaceae"],
      heightRange: ["large"],
      useCategory: ["medicine"],
    };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("big-medicine");
  });

  it("returns empty when combined filters have no match", () => {
    const filter: TreeFilter = {
      heightRange: ["very-large"],
      useCategory: ["food"],
    };
    const result = filterTrees(trees, filter);
    expect(result).toHaveLength(0);
  });
});

// ============================================================================
// extractFacets — height + uses
// ============================================================================

describe("extractFacets — height ranges and use categories", () => {
  const trees: Tree[] = [
    mockTree({
      maxHeight: "5-8 meters",
      uses: ["Traditional medicine", "Ornamental"],
    }),
    mockTree({
      maxHeight: "15-25 meters",
      uses: ["Premium timber", "Traditional medicine"],
    }),
    mockTree({
      maxHeight: "30-40 meters",
      uses: ["Reforestation"],
    }),
    mockTree({
      maxHeight: "45-60 meters",
      uses: ["Premium timber", "Firewood"],
    }),
    mockTree({
      maxHeight: undefined,
      uses: undefined,
    }),
  ];

  it("extracts height range facets in order", () => {
    const facets = extractFacets(trees);
    expect(facets.heightRanges).toHaveLength(4);
    expect(facets.heightRanges.map((h) => h.value)).toEqual([
      "small",
      "medium",
      "large",
      "very-large",
    ]);
  });

  it("counts height ranges correctly", () => {
    const facets = extractFacets(trees);
    const small = facets.heightRanges.find((h) => h.value === "small");
    expect(small?.count).toBe(1);
    const medium = facets.heightRanges.find((h) => h.value === "medium");
    expect(medium?.count).toBe(1);
  });

  it("excludes trees without maxHeight from facets", () => {
    const facets = extractFacets(trees);
    const totalHeightCount = facets.heightRanges.reduce(
      (sum, h) => sum + h.count,
      0
    );
    expect(totalHeightCount).toBe(4); // 5 trees minus 1 without maxHeight
  });

  it("extracts use category facets", () => {
    const facets = extractFacets(trees);
    expect(facets.useCategories.length).toBeGreaterThan(0);
  });

  it("counts use categories correctly", () => {
    const facets = extractFacets(trees);
    const medicine = facets.useCategories.find((c) => c.value === "medicine");
    expect(medicine?.count).toBe(2); // tree 1 and tree 2
    const timber = facets.useCategories.find((c) => c.value === "timber");
    expect(timber?.count).toBe(2); // tree 2 and tree 4
  });

  it("includes environmental for reforestation", () => {
    const facets = extractFacets(trees);
    const env = facets.useCategories.find((c) => c.value === "environmental");
    expect(env?.count).toBe(1);
  });

  it("includes agriculture for firewood", () => {
    const facets = extractFacets(trees);
    const agri = facets.useCategories.find((c) => c.value === "agriculture");
    expect(agri?.count).toBe(1);
  });
});
