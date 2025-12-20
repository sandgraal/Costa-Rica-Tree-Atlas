"use client";

import { useTranslations } from "next-intl";

// Predefined tag categories with icons and colors
export const TAG_DEFINITIONS = {
  // Foliage Type
  deciduous: {
    icon: "🍂",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    category: "foliage",
  },
  evergreen: {
    icon: "🌲",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    category: "foliage",
  },
  "semi-deciduous": {
    icon: "🍃",
    color: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
    category: "foliage",
  },

  // Special Features
  flowering: {
    icon: "🌸",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    category: "features",
  },
  "fruit-bearing": {
    icon: "🍎",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    category: "features",
  },
  "nitrogen-fixing": {
    icon: "♻️",
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
    category: "features",
  },
  buttressed: {
    icon: "🏔️",
    color:
      "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300",
    category: "features",
  },
  spiny: {
    icon: "🌵",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    category: "features",
  },

  // Origin
  native: {
    icon: "🇨🇷",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    category: "origin",
  },
  introduced: {
    icon: "✈️",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    category: "origin",
  },
  naturalized: {
    icon: "🏠",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    category: "origin",
  },

  // Uses
  timber: {
    icon: "🪵",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    category: "uses",
  },
  medicinal: {
    icon: "💊",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    category: "uses",
  },
  ornamental: {
    icon: "🎨",
    color:
      "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300",
    category: "uses",
  },
  edible: {
    icon: "🍽️",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    category: "uses",
  },

  // Conservation
  endangered: {
    icon: "🚨",
    color: "bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200",
    category: "conservation",
  },
  vulnerable: {
    icon: "⚠️",
    color:
      "bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-200",
    category: "conservation",
  },
  protected: {
    icon: "🛡️",
    color:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
    category: "conservation",
  },

  // Ecology
  "wildlife-food": {
    icon: "🦜",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    category: "ecology",
  },
  "shade-tree": {
    icon: "☂️",
    color:
      "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
    category: "ecology",
  },
  pioneer: {
    icon: "🌱",
    color: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300",
    category: "ecology",
  },
  "slow-growing": {
    icon: "🐢",
    color:
      "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300",
    category: "ecology",
  },
  "fast-growing": {
    icon: "🚀",
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
    category: "ecology",
  },

  // Cultural
  sacred: {
    icon: "✨",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    category: "cultural",
  },
  national: {
    icon: "🏛️",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    category: "cultural",
  },

  // Habitat
  "dry-forest": {
    icon: "🏜️",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    category: "habitat",
  },
  rainforest: {
    icon: "🌧️",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    category: "habitat",
  },
  "cloud-forest": {
    icon: "☁️",
    color:
      "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
    category: "habitat",
  },
  coastal: {
    icon: "🌊",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    category: "habitat",
  },
  highland: {
    icon: "⛰️",
    color:
      "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
    category: "habitat",
  },
} as const;

export type TagName = keyof typeof TAG_DEFINITIONS;

interface TreeTagProps {
  tag: string;
  onClick?: () => void;
  selected?: boolean;
  size?: "sm" | "md";
}

export function TreeTag({
  tag,
  onClick,
  selected = false,
  size = "md",
}: TreeTagProps) {
  const tagDef = TAG_DEFINITIONS[tag as TagName];

  if (!tagDef) {
    // Fallback for unknown tags
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300
          ${onClick ? "cursor-pointer hover:opacity-80" : ""}
          ${selected ? "ring-2 ring-primary ring-offset-1" : ""}
          ${size === "sm" ? "text-xs px-1.5 py-0.5" : ""}
        `}
        onClick={onClick}
      >
        {tag}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium
        ${tagDef.color}
        ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
        ${selected ? "ring-2 ring-primary ring-offset-1" : ""}
        ${size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1"}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <span>{tagDef.icon}</span>
      <span>{tag}</span>
    </span>
  );
}

interface TreeTagsProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
  selectedTags?: string[];
  size?: "sm" | "md";
  limit?: number;
}

export function TreeTags({
  tags,
  onTagClick,
  selectedTags = [],
  size = "md",
  limit,
}: TreeTagsProps) {
  const displayTags = limit ? tags.slice(0, limit) : tags;
  const hasMore = limit && tags.length > limit;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map((tag) => (
        <TreeTag
          key={tag}
          tag={tag}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
          selected={selectedTags.includes(tag)}
          size={size}
        />
      ))}
      {hasMore && (
        <span className="text-xs text-muted-foreground self-center">
          +{tags.length - limit!} more
        </span>
      )}
    </div>
  );
}

// Get all unique tags from a list of trees
export function getAllTags(trees: { tags?: string[] }[]): string[] {
  const tagSet = new Set<string>();
  trees.forEach((tree) => {
    tree.tags?.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

// Get tags grouped by category
export function getTagsByCategory(): Record<string, TagName[]> {
  const categories: Record<string, TagName[]> = {};

  Object.entries(TAG_DEFINITIONS).forEach(([tag, def]) => {
    if (!categories[def.category]) {
      categories[def.category] = [];
    }
    categories[def.category].push(tag as TagName);
  });

  return categories;
}

export default TreeTags;
