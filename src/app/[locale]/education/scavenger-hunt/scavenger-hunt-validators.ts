/**
 * Mission validator functions and constants for the Scavenger Hunt game.
 * Separated from ScavengerHuntClient to reduce file size and improve modularity.
 */

export interface ScavengerHuntTree {
  title: string;
  scientificName: string;
  family: string;
  slug: string;
  featuredImage?: string;
  tags?: string[];
  conservationStatus?: string;
  nativeRegion?: string;
  maxHeight?: string;
  floweringSeason?: string[];
  fruitingSeason?: string[];
  uses?: string[];
}

type MissionValidator = (
  trees: ScavengerHuntTree[],
  answer?: string
) => ScavengerHuntTree[];

/**
 * Validator functions for each mission. These are NOT serializable and must
 * live in the client bundle. The display data (title, description, etc.)
 * comes from the server via lessonData prop.
 */
export const MISSION_VALIDATORS: Record<string, MissionValidator> = {
  "tall-tree": (trees) =>
    trees.filter((t) => {
      const height = parseInt(t.maxHeight || "0");
      return height >= 30;
    }),
  "flowering-tree": (trees) => {
    const month = new Date().getMonth() + 1;
    const monthNames = [
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
    const currentMonth = monthNames[month - 1];
    return trees.filter((t) =>
      t.floweringSeason?.some((s) => s.toLowerCase().includes(currentMonth))
    );
  },
  "fruit-tree": (trees) =>
    trees.filter((t) => t.tags?.includes("edible-fruit")),
  "endangered-tree": (trees) =>
    trees.filter((t) =>
      [
        "Vulnerable",
        "Endangered",
        "Critically Endangered",
        "Near Threatened",
      ].some((status) => t.conservationStatus?.includes(status))
    ),
  "medicinal-tree": (trees) =>
    trees.filter((t) => t.tags?.includes("medicinal")),
  "three-families": (trees) => trees, // Special handling in component
  "native-tree": (trees) => trees.filter((t) => t.tags?.includes("native")),
  "timber-tree": (trees) => trees.filter((t) => t.tags?.includes("timber")),
  "shade-tree": (trees) => trees.filter((t) => t.tags?.includes("shade-tree")),
  "wildlife-tree": (trees) =>
    trees.filter(
      (t) =>
        t.tags?.includes("wildlife-habitat") ||
        t.tags?.includes("attracts-birds")
    ),
  "compound-leaves": (trees) =>
    trees.filter((t) => t.tags?.includes("compound-leaves")),
  "buttress-roots": (trees) =>
    trees.filter((t) => t.tags?.includes("buttress-roots")),
  "dry-forest": (trees) => trees.filter((t) => t.tags?.includes("dry-forest")),
  "fast-growing": (trees) =>
    trees.filter(
      (t) => t.tags?.includes("fast-growing") || t.tags?.includes("pioneer")
    ),
  "nitrogen-fixer": (trees) =>
    trees.filter((t) => t.tags?.includes("nitrogen-fixing")),
};

export const STORAGE_KEY = "costa-rica-tree-atlas-scavenger-hunt";

export const AVATARS = [
  "🦜",
  "🦋",
  "🐸",
  "🦎",
  "🐒",
  "🦥",
  "🐦",
  "🦆",
  "🦢",
  "🦚",
  "🌺",
  "🌸",
];

export const TEAM_COLORS = [
  {
    name: "green",
    bg: "bg-green-500",
    text: "text-green-500",
    light: "bg-green-50 dark:bg-green-900/20",
  },
  {
    name: "blue",
    bg: "bg-blue-500",
    text: "text-blue-500",
    light: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    name: "orange",
    bg: "bg-orange-500",
    text: "text-orange-500",
    light: "bg-orange-50 dark:bg-orange-900/20",
  },
  {
    name: "purple",
    bg: "bg-purple-500",
    text: "text-purple-500",
    light: "bg-purple-50 dark:bg-purple-900/20",
  },
];
