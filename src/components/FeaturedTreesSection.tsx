"use client";

import { useState, useMemo } from "react";
import { Link } from "@i18n/navigation";
import { TreeCard } from "@/components/tree";
import type { Locale } from "@/types/tree";
import type { allTrees } from "contentlayer/generated";

const INITIAL_LOAD_COUNT = 6;
const LOAD_MORE_COUNT = 6;

interface FeaturedTreesSectionProps {
  trees: typeof allTrees;
  locale: Locale;
  featuredTrees: string;
  viewAll: string;
  loadMore: string;
}

export function FeaturedTreesSection({
  trees,
  locale,
  featuredTrees,
  viewAll,
  loadMore,
}: FeaturedTreesSectionProps) {
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LOAD_COUNT);

  // Get current month name in lowercase English (e.g., "january", "february")
  const currentMonth = new Date()
    .toLocaleString("en-US", { month: "long" })
    .toLowerCase();

  // Filter trees that are flowering or fruiting this month
  const seasonalTrees = useMemo(() => {
    const floweringTrees = trees.filter((tree) =>
      tree.floweringSeason?.includes(currentMonth)
    );
    const fruitingTrees = trees.filter((tree) =>
      tree.fruitingSeason?.includes(currentMonth)
    );

    // Prioritize flowering trees, then fruiting trees (avoid duplicates using Set for efficiency)
    const floweringIds = new Set(floweringTrees.map((t) => t._id));
    return [
      ...floweringTrees,
      ...fruitingTrees.filter((t) => !floweringIds.has(t._id)),
    ];
  }, [trees, currentMonth]);

  // If we don't have enough seasonal trees, fall back to first trees
  const displayTrees =
    seasonalTrees.length > 0 ? seasonalTrees : trees.slice(0, displayLimit);

  const visibleTrees = displayTrees.slice(0, displayLimit);
  const hasMore = displayLimit < displayTrees.length;

  const handleLoadMore = () => {
    setDisplayLimit((prev) => prev + LOAD_MORE_COUNT);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light">
          {featuredTrees}
        </h2>
        <Link
          href="/trees"
          className="text-primary hover:text-primary-light transition-colors font-medium"
        >
          {viewAll} →
        </Link>
      </div>

      {visibleTrees.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTrees.map((tree) => (
              <TreeCard key={tree._id} tree={tree} locale={locale} />
            ))}
          </div>

          {/* Load More button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm hover:shadow-md"
              >
                {loadMore}
              </button>
              <p className="mt-2 text-sm text-muted-foreground">
                {locale === "en"
                  ? `Showing ${visibleTrees.length} of ${displayTrees.length}`
                  : `Mostrando ${visibleTrees.length} de ${displayTrees.length}`}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          No trees found. Add some content to get started!
        </p>
      )}
    </>
  );
}
