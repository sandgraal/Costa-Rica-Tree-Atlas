"use client";

import { Link } from "@i18n/navigation";
import { useFavorite } from "@/lib/store";
import {
  TAG_DEFINITIONS,
  getTagLabel,
  CONSERVATION_CATEGORIES,
} from "@/lib/i18n";
import { SafeImage } from "@/components/SafeImage";
import { ResponsiveVirtualizedGrid } from "@/components/ResponsiveVirtualizedGrid";
import { SafetyIcon } from "@/components/safety";
import type { Tree as ContentlayerTree } from "contentlayer/generated";
import type { Locale, TreeTag } from "@/types/tree";

// ============================================================================
// Types
// ============================================================================

interface TreeCardProps {
  tree: ContentlayerTree; // Use contentlayer's Tree type for compatibility
  locale: Locale;
  showFavorite?: boolean;
  priority?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyZDVhMjciIG9wYWNpdHk9IjAuMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhiNWEyYiIgb3BhY2l0eT0iMC4xIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg=="; // eslint-disable-line no-secrets/no-secrets

// ============================================================================
// Component
// ============================================================================

export function TreeCard({
  tree,
  locale,
  showFavorite = true,
  priority = false,
}: TreeCardProps) {
  const { isFavorite, toggle } = useFavorite(tree.slug);

  return (
    <article className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-border hover:border-primary/30">
      {/* Favorite button */}
      {showFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      )}

      <Link href={`/trees/${tree.slug}`} className="block">
        {/* Image */}
        <div className="aspect-video bg-primary/10 relative overflow-hidden">
          <SafeImage
            src={tree.featuredImage || ""}
            alt={tree.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            priority={priority}
            quality={75}
            fallback="placeholder"
          />

          {/* Conservation status badge */}
          {tree.conservationStatus && (
            <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-secondary/90 text-white rounded">
              {CONSERVATION_CATEGORIES[
                tree.conservationStatus as keyof typeof CONSERVATION_CATEGORIES
              ]?.label[locale] || tree.conservationStatus}
            </span>
          )}

          {/* Safety indicator icon */}
          <div className="absolute bottom-3 left-3">
            <SafetyIcon
              toxicityLevel={tree.toxicityLevel}
              skinContactRisk={tree.skinContactRisk}
              childSafe={tree.childSafe}
              petSafe={tree.petSafe}
              className="text-2xl"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
            {tree.title}
          </h3>
          <p className="text-sm text-foreground/60 italic mb-2 line-clamp-1">
            {tree.scientificName}
          </p>
          <p className="text-sm text-foreground/80 line-clamp-2 min-h-[2.5rem]">
            {tree.description}
          </p>

          {/* Meta info */}
          <div className="mt-3 flex items-center gap-4 text-xs text-foreground/60">
            <span className="flex items-center gap-1">
              <FamilyIcon />
              {tree.family}
            </span>
            {tree.maxHeight && (
              <span className="flex items-center gap-1">
                <HeightIcon />
                {tree.maxHeight}
              </span>
            )}
          </div>

          {/* Tags */}
          {tree.tags && tree.tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/10">
              <div className="flex flex-wrap gap-1.5">
                {tree.tags.slice(0, 3).map((tag) => (
                  <TagBadge key={tag} tag={tag as TreeTag} locale={locale} />
                ))}
                {tree.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{tree.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function TagBadge({ tag, locale }: { tag: TreeTag; locale: Locale }) {
  const def = TAG_DEFINITIONS[tag];
  if (!def) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${def.color}`}
    >
      <span>{def.icon}</span>
      <span>{getTagLabel(tag, locale)}</span>
    </span>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className={`w-5 h-5 ${filled ? "text-red-500" : "text-gray-400"}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function TreePlaceholder() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-16 h-16 text-primary/30"
    >
      <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
    </svg>
  );
}

function FamilyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
    </svg>
  );
}

function HeightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ============================================================================
// Grid component for tree cards
// ============================================================================

interface TreeGridProps {
  trees: ContentlayerTree[];
  locale: Locale;
  showFavorites?: boolean;
}

export function TreeGrid({
  trees,
  locale,
  showFavorites = true,
}: TreeGridProps) {
  if (trees.length === 0) {
    return (
      <div className="text-center py-16">
        <TreePlaceholder />
        <p className="text-muted-foreground text-lg mt-4">
          {locale === "es" ? "No se encontraron árboles" : "No trees found"}
        </p>
      </div>
    );
  }

  // Use virtualization for large lists (30+ trees)
  const useVirtualization = trees.length >= 30;

  const renderTreeCard = (tree: ContentlayerTree, index: number) => (
    <TreeCard
      key={tree._id}
      tree={tree}
      locale={locale}
      showFavorite={showFavorites}
      priority={index < 6}
    />
  );

  if (useVirtualization) {
    return (
      <div className="h-[1200px] w-full">
        <ResponsiveVirtualizedGrid
          items={trees}
          itemHeight={380}
          gap={24}
          renderItem={renderTreeCard}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {trees.map((tree, index) => renderTreeCard(tree, index))}
    </div>
  );
}
