/**
 * Search infrastructure using Fuse.js (lazy-loaded)
 * Provides fuzzy search, faceted filtering, and ranked results
 *
 * Fuse.js (~30KB gzipped) is dynamically imported only when the user
 * actually performs a search, keeping the initial bundle smaller.
 */

import type {
  Tree,
  TreeFilter,
  TreeSort,
  TreeTag,
  Month,
  Distribution,
  HeightRange,
  UseCategory,
} from "@/types/tree";

// ============================================================================
// Search Configuration (Fuse.js options — applied at lazy-init time)
// ============================================================================

const FUSE_OPTIONS = {
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
// Search Index (lazy-loaded)
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FuseClass: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let searchIndex: any = null;
let indexedTreesRef: Tree[] | null = null;

/**
 * Lazily load Fuse.js and build (or reuse) the search index.
 * Returns the Fuse instance ready to query.
 */
async function getOrCreateIndex(trees: Tree[]) {
  // Load Fuse.js on first call
  if (!FuseClass) {
    const mod = await import("fuse.js");
    FuseClass = mod.default ?? mod;
  }

  // Rebuild index only when the tree list changes
  if (!searchIndex || indexedTreesRef !== trees) {
    searchIndex = new FuseClass(trees, FUSE_OPTIONS);
    indexedTreesRef = trees;
  }

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

/**
 * Perform a fuzzy search across trees.
 * Fuse.js is loaded lazily on the first actual search query.
 */
export async function search(
  query: string,
  trees: Tree[]
): Promise<SearchResult[]> {
  if (!query.trim()) {
    return trees.map((tree) => ({ tree, score: 0 }));
  }

  const index = await getOrCreateIndex(trees);
  const results = index.search(query);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return results.map((result: any) => ({
    tree: result.item as Tree,
    score: (result.score as number) ?? 0,
    matches: result.matches,
  }));
}

// ============================================================================
// Height & Uses Utilities
// ============================================================================

/** Height range thresholds in meters */
const HEIGHT_RANGES: Record<HeightRange, { min: number; max: number }> = {
  small: { min: 0, max: 10 },
  medium: { min: 10, max: 25 },
  large: { min: 25, max: 40 },
  "very-large": { min: 40, max: Infinity },
};

/**
 * Parse the first number from a maxHeight string.
 * Handles formats like "20-30 meters", "15-25 meters (50-80 feet)", "5m"
 * Returns NaN if no number found.
 */
export function parseMaxHeightMeters(maxHeight: string | undefined): number {
  if (!maxHeight) return NaN;
  // eslint-disable-next-line security/detect-unsafe-regex
  const match = maxHeight.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : NaN;
}

/**
 * Classify a tree into a height range based on its maxHeight string.
 * Uses the first number found (lower bound) to classify.
 */
export function classifyHeight(
  maxHeight: string | undefined
): HeightRange | null {
  const meters = parseMaxHeightMeters(maxHeight);
  if (isNaN(meters)) return null;
  if (meters < HEIGHT_RANGES.small.max) return "small";
  if (meters < HEIGHT_RANGES.medium.max) return "medium";
  if (meters < HEIGHT_RANGES.large.max) return "large";
  return "very-large";
}

/**
 * Keyword map: each use category → keywords to match against (lowercase).
 * Includes both English and Spanish keywords.
 * Matching uses word boundaries (\b) to prevent false positives
 * (e.g., "oil" must not match inside "soil").
 */
const USE_CATEGORY_KEYWORDS: Record<UseCategory, string[]> = {
  timber: [
    // English
    "timber",
    "construction",
    "flooring",
    "furniture",
    "cabinetry",
    "plywood",
    "veneer",
    "boat building",
    "shipbuilding",
    "door",
    "window frame",
    "lumber",
    "woodwork",
    "railroad",
    "post",
    "framing",
    "boxes",
    "crates",
    "tool handle",
    // Spanish
    "madera",
    "construcción",
    "ebanistería",
    "carpintería",
    "muebles",
    "postes",
    "vigas",
    "pisos",
    "cajas",
    "mangos de herramienta",
  ],
  medicine: [
    // English
    "medicine",
    "medicinal",
    "pharmaceutical",
    "essential oil",
    // Spanish
    "medicina",
    "medicinal",
    "farmacéutico",
    "aceite esencial",
    "medicina tradicional",
    "uso medicinal",
  ],
  food: [
    // English
    "fruit",
    "edible",
    "beverage",
    "juice",
    "nut",
    "food",
    "ice cream",
    "dessert",
    "jam",
    "preserve",
    "seed oil",
    "cooking oil",
    "palm oil",
    "spice",
    "cooking",
    "chocolate",
    "cacao",
    "coffee", // only as food product, not shade
    // Spanish
    "fruta",
    "comestible",
    "bebida",
    "jugo",
    "nuez",
    "alimento",
    "helado",
    "postre",
    "mermelada",
    "aceite de palma",
    "aceite de semilla",
    "especia",
    "cocina",
  ],
  ornamental: [
    // English
    "ornamental",
    "landscaping",
    "urban shade",
    "decorative",
    "bonsai",
    "garden",
    "avenue tree",
    // Spanish
    "jardinería",
    "sombra urbana",
    "decorativo",
    "jardín",
    "árbol de avenida",
  ],
  environmental: [
    // English
    "reforestation",
    "erosion control",
    "watershed",
    "nitrogen fixation",
    "nitrogen-fixing",
    "carbon sequestration",
    "wildlife habitat",
    "wildlife food",
    "pollinator",
    "restoration",
    "soil conservation",
    "soil stabilization",
    "soil rehabilitation",
    "conservation",
    "coastal protection",
    "riparian",
    "wetland",
    "pioneer",
    "shade tree for coffee",
    "shade tree for cacao",
    // Spanish
    "reforestación",
    "control de erosión",
    "cuenca",
    "fijación de nitrógeno",
    "secuestro de carbono",
    "hábitat de vida silvestre",
    "restauración",
    "conservación",
    "protección costera",
    "ribereño",
    "conservación del suelo",
  ],
  agriculture: [
    // English
    "agroforestry",
    "living fence",
    "livestock fodder",
    "fodder",
    "windbreak",
    "honey",
    "bee forage",
    "apiculture",
    "shade tree",
    "firewood",
    "fuelwood",
    "charcoal",
    "pulpwood",
    "thatching",
    // Spanish
    "agroforestería",
    "cerca viva",
    "forraje",
    "cortina rompevientos",
    "miel",
    "apicultura",
    "sombreador",
    "leña",
    "carbón vegetal",
  ],
  crafts: [
    // English
    "musical instrument",
    "handicraft",
    "craft",
    "dye",
    "tannin",
    "resin",
    "fiber",
    "kapok",
    "carving",
    "cosmetic",
    "skincare",
    "rope",
    "basket",
    // Spanish
    "instrumento musical",
    "artesanía",
    "tintura",
    "tanino",
    "resina",
    "fibra",
    "tallado",
    "cosmético",
    "cuerda",
    "canasta",
  ],
};

/**
 * Build a word-boundary regex for a keyword.
 * Uses a Unicode-aware leading boundary so "oil" won't match inside "soil",
 * but does NOT require a trailing boundary so plural forms
 * (e.g. "instruments") are still matched by "instrument".
 */
function kwRegex(kw: string): RegExp {
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}`, "iu");
}

/**
 * Classify a tree's uses into use categories.
 * Returns a deduplicated set of categories that the tree belongs to.
 * Uses word-boundary matching to avoid false positives (e.g., "soil" ≠ "oil").
 */
export function classifyUses(uses: string[] | undefined): UseCategory[] {
  if (!uses || uses.length === 0) return [];
  const categories = new Set<UseCategory>();

  for (const use of uses) {
    for (const [category, keywords] of Object.entries(
      USE_CATEGORY_KEYWORDS
    ) as [UseCategory, string[]][]) {
      if (keywords.some((kw) => kwRegex(kw).test(use))) {
        categories.add(category);
      }
    }
  }

  return Array.from(categories);
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

    // Height range filter
    if (filter.heightRange) {
      const treeHeight = classifyHeight(tree.maxHeight);
      if (treeHeight !== filter.heightRange) {
        return false;
      }
    }

    // Use category filter
    if (filter.useCategory) {
      const treeCategories = classifyUses(tree.uses);
      if (!treeCategories.includes(filter.useCategory)) {
        return false;
      }
    }

    // Safety filters
    if (filter.childSafe !== undefined && tree.childSafe !== filter.childSafe) {
      return false;
    }

    if (filter.petSafe !== undefined && tree.petSafe !== filter.petSafe) {
      return false;
    }

    if (filter.nonToxic === true) {
      // nonToxic means toxicityLevel is "none" or undefined
      const toxicity = tree.toxicityLevel;
      if (toxicity && toxicity !== "none") {
        return false;
      }
    }

    if (filter.lowRisk === true) {
      // lowRisk means toxicityLevel is "none", "low", or undefined
      const toxicity = tree.toxicityLevel;
      if (toxicity && toxicity !== "none" && toxicity !== "low") {
        return false;
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

export interface SeasonalFacet {
  floweringCount: number;
  fruitingCount: number;
}

export interface SearchFacets {
  families: { value: string; count: number }[];
  conservationStatuses: { value: string; count: number }[];
  tags: { value: TreeTag; count: number }[];
  distributions: { value: Distribution; count: number }[];
  seasonal: Record<Exclude<Month, "all-year">, SeasonalFacet>;
  heightRanges: { value: HeightRange; count: number }[];
  useCategories: { value: UseCategory; count: number }[];
}

export function extractFacets(trees: Tree[]): SearchFacets {
  const familyMap = new Map<string, number>();
  const statusMap = new Map<string, number>();
  const tagMap = new Map<TreeTag, number>();
  const distMap = new Map<Distribution, number>();
  const heightMap = new Map<HeightRange, number>();
  const useCatMap = new Map<UseCategory, number>();

  // Seasonal counts per month
  const seasonal = {} as Record<Exclude<Month, "all-year">, SeasonalFacet>;
  for (const m of MONTHS) {
    seasonal[m] = { floweringCount: 0, fruitingCount: 0 };
  }

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

    // Height range
    const hr = classifyHeight(tree.maxHeight);
    if (hr) {
      heightMap.set(hr, (heightMap.get(hr) ?? 0) + 1);
    }

    // Use categories
    const cats = classifyUses(tree.uses);
    for (const cat of cats) {
      useCatMap.set(cat, (useCatMap.get(cat) ?? 0) + 1);
    }

    // Seasonal (flowering / fruiting)
    for (const m of tree.floweringSeason ?? []) {
      if (m === "all-year") {
        for (const mon of MONTHS) seasonal[mon].floweringCount++;
      } else if (m in seasonal) {
        seasonal[m as Exclude<Month, "all-year">].floweringCount++;
      }
    }
    for (const m of tree.fruitingSeason ?? []) {
      if (m === "all-year") {
        for (const mon of MONTHS) seasonal[mon].fruitingCount++;
      } else if (m in seasonal) {
        seasonal[m as Exclude<Month, "all-year">].fruitingCount++;
      }
    }
  }

  // Ordered height ranges (small → very-large)
  const heightOrder: HeightRange[] = ["small", "medium", "large", "very-large"];

  // Ordered use categories
  const useCatOrder: UseCategory[] = [
    "timber",
    "medicine",
    "food",
    "ornamental",
    "environmental",
    "agriculture",
    "crafts",
  ];

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
    seasonal,
    heightRanges: heightOrder
      .filter((h) => heightMap.has(h))
      .map((value) => ({ value, count: heightMap.get(value)! })),
    useCategories: useCatOrder
      .filter((c) => useCatMap.has(c))
      .map((value) => ({ value, count: useCatMap.get(value)! })),
  };
}

// ============================================================================
// Utilities
// ============================================================================

const MONTHS: Exclude<Month, "all-year">[] = [
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
