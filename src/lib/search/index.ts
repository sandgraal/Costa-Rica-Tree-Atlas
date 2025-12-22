/**
 * Search infrastructure using Fuse.js
 * Provides fuzzy search, faceted filtering, and ranked results
 */

import Fuse, { IFuseOptions, FuseResult } from "fuse.js";
import type {
  Tree,
  TreeFilter,
  TreeSort,
  TreeTag,
  Month,
  Distribution,
} from "@/types/tree";

// ============================================================================
// Search Configuration
// ============================================================================

const FUSE_OPTIONS: IFuseOptions<Tree> = {
  keys: [
    // Primary identifiers (highest weight)
    { name: "title", weight: 0.25 },
    { name: "scientificName", weight: 0.2 },
    // Secondary identifiers
    { name: "family", weight: 0.12 },
    { name: "description", weight: 0.1 },
    // Characteristics and uses
    { name: "uses", weight: 0.08 },
    { name: "tags", weight: 0.08 },
    // Geographic and environmental
    { name: "nativeRegion", weight: 0.05 },
    { name: "distribution", weight: 0.05 },
    { name: "elevation", weight: 0.03 },
    // Conservation
    { name: "conservationStatus", weight: 0.02 },
    // Seasonal
    { name: "floweringSeason", weight: 0.01 },
    { name: "fruitingSeason", weight: 0.01 },
  ],
  threshold: 0.35, // Slightly higher threshold for more inclusive results
  ignoreLocation: true,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  useExtendedSearch: true,
  findAllMatches: true, // Find all matches, not just the first one
};

// ============================================================================
// Search Index
// ============================================================================

let searchIndex: Fuse<Tree> | null = null;

export function initializeSearchIndex(trees: Tree[]): Fuse<Tree> {
  searchIndex = new Fuse(trees, FUSE_OPTIONS);
  return searchIndex;
}

export function getSearchIndex(): Fuse<Tree> | null {
  return searchIndex;
}

// ============================================================================
// Search Functions
// ============================================================================

export interface SearchResult {
  tree: Tree;
  score: number;
  matches?: ReadonlyArray<{
    key?: string;
    value?: string;
    indices?: ReadonlyArray<[number, number]>;
  }>;
}

export function search(query: string, trees: Tree[]): SearchResult[] {
  if (!query.trim()) {
    return trees.map((tree) => ({ tree, score: 0 }));
  }

  // Initialize index if needed
  if (!searchIndex) {
    initializeSearchIndex(trees);
  }

  const results = searchIndex!.search(query);

  return results.map((result: FuseResult<Tree>) => ({
    tree: result.item,
    score: result.score ?? 0,
    matches: result.matches,
  }));
}

// ============================================================================
// Filter Functions
// ============================================================================

export function filterTrees(trees: Tree[], filter: TreeFilter): Tree[] {
  return trees.filter((tree) => {
    // Family filter
    if (filter.family && tree.family !== filter.family) {
      return false;
    }

    // Conservation status filter
    if (
      filter.conservationStatus &&
      tree.conservationStatus !== filter.conservationStatus
    ) {
      return false;
    }

    // Tags filter (AND logic - must have ALL selected tags)
    if (filter.tags && filter.tags.length > 0) {
      const treeTags = tree.tags ?? [];
      if (!filter.tags.every((tag) => treeTags.includes(tag))) {
        return false;
      }
    }

    // Distribution filter (OR logic - must have ANY selected distribution)
    if (filter.distribution && filter.distribution.length > 0) {
      const treeDist = tree.distribution ?? [];
      if (!filter.distribution.some((dist) => treeDist.includes(dist))) {
        return false;
      }
    }

    // Seasonal filter
    if (filter.seasonalFilter && filter.seasonalFilter !== "all") {
      const month = filter.month ?? getCurrentMonth();

      if (filter.seasonalFilter === "flowering") {
        const flowering = tree.floweringSeason ?? [];
        if (
          !flowering.includes(month as Month) &&
          !flowering.includes("all-year")
        ) {
          return false;
        }
      }

      if (filter.seasonalFilter === "fruiting") {
        const fruiting = tree.fruitingSeason ?? [];
        if (
          !fruiting.includes(month as Month) &&
          !fruiting.includes("all-year")
        ) {
          return false;
        }
      }
    }

    return true;
  });
}

// ============================================================================
// Sort Functions
// ============================================================================

export function sortTrees(trees: Tree[], sort: TreeSort): Tree[] {
  const sorted = [...trees];
  const { field, direction } = sort;

  sorted.sort((a, b) => {
    const aValue = a[field] ?? "";
    const bValue = b[field] ?? "";
    const comparison = aValue.localeCompare(bValue);
    return direction === "asc" ? comparison : -comparison;
  });

  return sorted;
}

// ============================================================================
// Facet Extraction
// ============================================================================

export interface SearchFacets {
  families: { value: string; count: number }[];
  conservationStatuses: { value: string; count: number }[];
  tags: { value: TreeTag; count: number }[];
  distributions: { value: Distribution; count: number }[];
}

export function extractFacets(trees: Tree[]): SearchFacets {
  const familyMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  const tagMap = new Map<TreeTag, number>();
  const distMap = new Map<Distribution, number>();

  for (const tree of trees) {
    // Family
    if (tree.family) {
      familyMap.set(tree.family, (familyMap.get(tree.family) ?? 0) + 1);
    }

    // Conservation status
    if (tree.conservationStatus) {
      statusMap.set(
        tree.conservationStatus,
        (statusMap.get(tree.conservationStatus) ?? 0) + 1
      );
    }

    // Tags
    for (const tag of tree.tags ?? []) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }

    // Distribution
    for (const dist of tree.distribution ?? []) {
      distMap.set(dist, (distMap.get(dist) ?? 0) + 1);
    }
  }

  return {
    families: Array.from(familyMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    conservationStatuses: Array.from(statusMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
    tags: Array.from(tagMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value)),
    distributions: Array.from(distMap.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count),
  };
}

// ============================================================================
// Utilities
// ============================================================================

const MONTHS: Month[] = [
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

export function getCurrentMonth(): Month {
  return MONTHS[new Date().getMonth()];
}

export function getTreesActiveInMonth(
  trees: Tree[],
  month: Month
): { flowering: Tree[]; fruiting: Tree[] } {
  const flowering = trees.filter((tree) => {
    const seasons = tree.floweringSeason ?? [];
    return seasons.includes(month) || seasons.includes("all-year");
  });

  const fruiting = trees.filter((tree) => {
    const seasons = tree.fruitingSeason ?? [];
    return seasons.includes(month) || seasons.includes("all-year");
  });

  return { flowering, fruiting };
}

export function getMonthCounts(
  trees: Tree[]
): Record<Month, { flowering: number; fruiting: number }> {
  const counts = {} as Record<Month, { flowering: number; fruiting: number }>;

  for (const month of MONTHS) {
    const active = getTreesActiveInMonth(trees, month);
    counts[month] = {
      flowering: active.flowering.length,
      fruiting: active.fruiting.length,
    };
  }

  return counts;
}
