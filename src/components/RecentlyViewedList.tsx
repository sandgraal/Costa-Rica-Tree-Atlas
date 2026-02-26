"use client";

import { Link } from "@i18n/navigation";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { BLUR_DATA_URL } from "@/lib/image";

/** Minimal tree data needed for the recently-viewed thumbnails. */
export interface RecentlyViewedTree {
  slug: string;
  title: string;
  scientificName: string;
  featuredImage?: string;
}

interface RecentlyViewedListProps {
  locale: string;
  /** Pre-built lookup: slug → minimal tree data (passed from server component). */
  treeLookup: Record<string, RecentlyViewedTree>;
  limit?: number;
}

/**
 * RecentlyViewedList - Displays user's recently viewed trees
 * Shows a horizontal scrollable list of recently viewed tree thumbnails.
 *
 * Tree data is passed via `treeLookup` prop from a server component so the
 * full contentlayer bundle (~30 MB) is never shipped to the client.
 */
export function RecentlyViewedList({
  locale,
  treeLookup,
  limit = 6,
}: RecentlyViewedListProps) {
  const hydrated = useStore((state) => state._hydrated);
  const recentlyViewed = useStore((state) => state.recentlyViewed);
  const clearRecentlyViewed = useStore((state) => state.clearRecentlyViewed);

  const t = {
    title: locale === "es" ? "Vistos Recientemente" : "Recently Viewed",
    clear: locale === "es" ? "Limpiar" : "Clear",
    empty:
      locale === "es"
        ? "No has visto árboles recientemente"
        : "No recently viewed trees",
  };

  // Resolve viewed slugs against the lightweight lookup (only after hydration)
  const viewedTrees = hydrated
    ? recentlyViewed
        .slice(0, limit)
        .map((slug) => treeLookup[slug])
        .filter((tree): tree is RecentlyViewedTree => tree !== undefined)
    : [];

  if (viewedTrees.length === 0) {
    return null;
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-muted-foreground" />
          {t.title}
        </h3>
        <button
          onClick={clearRecentlyViewed}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t.clear}
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {viewedTrees.map((tree) => (
          <Link
            key={tree.slug}
            href={`/trees/${tree.slug}`}
            className="flex-shrink-0 group"
          >
            <div className="w-28 md:w-32">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                {tree.featuredImage ? (
                  <Image
                    src={tree.featuredImage}
                    alt={tree.title}
                    fill
                    sizes="128px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    quality={60}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TreeIcon className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {tree.title}
              </p>
              <p className="text-xs text-muted-foreground italic truncate">
                {tree.scientificName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 22V8" />
      <path d="M5 12l7-10 7 10" />
      <path d="M5 12a7 7 0 0 0 14 0" />
    </svg>
  );
}
