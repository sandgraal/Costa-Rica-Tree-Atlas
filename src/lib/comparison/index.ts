/**
 * Shared utilities for comparison features
 */

import type { Locale } from "@/types/tree";

// ============================================================================
// CONFUSION RATING UTILITIES
// ============================================================================

export type ConfusionRating = 1 | 2 | 3 | 4 | 5;

export interface ConfusionRatingConfig {
  rating: number;
  label: string;
  shortLabel: string;
  colorClass: string;
  bgColorClass: string;
  textColorClass: string;
  borderColorClass: string;
}

/**
 * Get configuration for a confusion rating level
 * @param rating - Rating from 1 (easy to distinguish) to 5 (extremely similar)
 * @param locale - Current locale ('en' or 'es')
 * @returns Configuration object with labels and color classes
 */
export function getConfusionRatingConfig(
  rating: number,
  locale: Locale
): ConfusionRatingConfig {
  const normalizedRating = Math.min(
    5,
    Math.max(1, Math.round(rating))
  ) as ConfusionRating;

  const labels = {
    en: [
      { full: "Easy to distinguish", short: "Easy" },
      { full: "Usually distinguishable", short: "Moderate" },
      { full: "Moderately confusing", short: "Confusing" },
      { full: "Often confused", short: "Very confusing" },
      { full: "Extremely similar", short: "Nearly identical" },
    ],
    es: [
      { full: "Fácil de distinguir", short: "Fácil" },
      { full: "Generalmente distinguibles", short: "Moderado" },
      { full: "Moderadamente confusos", short: "Confuso" },
      { full: "A menudo confundidos", short: "Muy confuso" },
      { full: "Extremadamente similares", short: "Casi idénticos" },
    ],
  };

  const colors: ConfusionRatingConfig["colorClass"][] = [
    "bg-success",
    "bg-success",
    "bg-warning",
    "bg-orange-500", // Level 4: intermediate between warning and destructive
    "bg-destructive",
  ];

  const bgColors: ConfusionRatingConfig["bgColorClass"][] = [
    "bg-success/20",
    "bg-success/15",
    "bg-warning/20",
    "bg-orange-500/20", // Matches level 4 main color
    "bg-destructive/20",
  ];

  const textColors: ConfusionRatingConfig["textColorClass"][] = [
    "text-success",
    "text-success",
    "text-warning",
    "text-orange-600 dark:text-orange-400", // Matches level 4 theme
    "text-destructive",
  ];

  const borderColors: ConfusionRatingConfig["borderColorClass"][] = [
    "border-success/30",
    "border-success/20",
    "border-warning/30",
    "border-orange-500/30", // Matches level 4 theme
    "border-destructive/30",
  ];

  const localeLabels = locale === "es" ? labels.es : labels.en;

  return {
    rating: normalizedRating,
    label: localeLabels[normalizedRating - 1].full,
    shortLabel: localeLabels[normalizedRating - 1].short,
    colorClass: colors[normalizedRating - 1],
    bgColorClass: bgColors[normalizedRating - 1],
    textColorClass: textColors[normalizedRating - 1],
    borderColorClass: borderColors[normalizedRating - 1],
  };
}

// ============================================================================
// COMPARISON TAG UTILITIES
// ============================================================================

export type ComparisonTag =
  | "leaves"
  | "bark"
  | "fruit"
  | "flowers"
  | "size"
  | "habitat"
  | "trunk"
  | "seeds"
  | "crown"
  | "roots";

/**
 * Get icon emoji for a comparison tag
 * @param tag - Tag name (case-insensitive)
 * @returns Icon emoji string or undefined if tag not found
 */
export function getComparisonTagIcon(tag: string): string | undefined {
  switch (tag.toLowerCase()) {
    case "leaves":
      return "🍃";
    case "bark":
      return "🪵";
    case "fruit":
      return "🍎";
    case "flowers":
      return "🌸";
    case "size":
      return "📏";
    case "habitat":
      return "🏞️";
    case "trunk":
      return "🌳";
    case "seeds":
      return "🌰";
    case "crown":
      return "👑";
    case "roots":
      return "🌱";
    default:
      return undefined;
  }
}

/**
 * Tag labels for localization
 * Defined at module level for performance
 */
const TAG_LABELS: Record<string, { en: string; es: string }> = {
  leaves: { en: "Leaves", es: "Hojas" },
  bark: { en: "Bark", es: "Corteza" },
  fruit: { en: "Fruit", es: "Fruto" },
  flowers: { en: "Flowers", es: "Flores" },
  size: { en: "Size", es: "Tamaño" },
  habitat: { en: "Habitat", es: "Hábitat" },
  trunk: { en: "Trunk", es: "Tronco" },
  seeds: { en: "Seeds", es: "Semillas" },
  crown: { en: "Crown", es: "Copa" },
  roots: { en: "Roots", es: "Raíces" },
};

function getComparisonTagLabels(
  tagKey: string
): { en: string; es: string } | null {
  switch (tagKey) {
    case "leaves":
      return TAG_LABELS.leaves;
    case "bark":
      return TAG_LABELS.bark;
    case "fruit":
      return TAG_LABELS.fruit;
    case "flowers":
      return TAG_LABELS.flowers;
    case "size":
      return TAG_LABELS.size;
    case "habitat":
      return TAG_LABELS.habitat;
    case "trunk":
      return TAG_LABELS.trunk;
    case "seeds":
      return TAG_LABELS.seeds;
    case "crown":
      return TAG_LABELS.crown;
    case "roots":
      return TAG_LABELS.roots;
    default:
      return null;
  }
}

/**
 * Get localized label for a comparison tag
 * @param tag - Tag name (case-insensitive)
 * @param locale - Current locale ('en' or 'es')
 * @returns Localized tag label
 */
export function getComparisonTagLabel(tag: string, locale: Locale): string {
  const tagKey = tag.toLowerCase();
  const labels = getComparisonTagLabels(tagKey);

  if (!labels) {
    // Fallback: capitalize first letter if tag not found
    // Log warning in development to help identify data issues
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `Unknown comparison tag encountered: "${tag}". Using fallback capitalization.`
      );
    }
    return tag.charAt(0).toUpperCase() + tag.slice(1);
  }

  return locale === "es" ? labels.es : labels.en;
}

// ============================================================================
// IMAGE UTILITIES
// ============================================================================

export interface TreeImageSource {
  featuredImage?: string;
  featuredImages?: string[];
  slug: string;
}

/**
 * Get the image URL for a species with fallback logic
 * @param tree - Tree object with image properties
 * @param index - Index for featuredImages array (default: 0, must be non-negative)
 * @returns Image URL string
 */
export function getSpeciesImageUrl(
  tree: TreeImageSource,
  index: number = 0
): string {
  // Validate index
  if (index < 0) {
    throw new Error("Index must be non-negative");
  }

  // First try featuredImages array at given index
  if (tree.featuredImages) {
    const [imageAtIndex] = tree.featuredImages.slice(index, index + 1);
    if (imageAtIndex) {
      return imageAtIndex;
    }
  }

  // Fallback to featuredImage
  if (tree.featuredImage) {
    return tree.featuredImage;
  }

  // Final fallback to default path based on slug
  return `/images/trees/${tree.slug}.jpg`;
}
