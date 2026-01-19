"use client";

import { useMemo } from "react";
import { Link } from "@i18n/navigation";
import { TreeCard } from "@/components/tree";
import type { Locale } from "@/types/tree";
import type { allTrees } from "contentlayer/generated";

const MAX_FEATURED_TREES = 8;
const MAX_ENDANGERED_TREES = 5;

interface FeaturedTreesSectionProps {
  trees: typeof allTrees;
  locale: Locale;
  featuredTrees: string;
  viewAll: string;
}

export function FeaturedTreesSection({
  trees,
  locale,
  featuredTrees,
  viewAll,
}: FeaturedTreesSectionProps) {
  // Select most endangered and emblematic trees of Costa Rica
  const featuredTreesList = useMemo(() => {
    // Conservation status priority (most endangered first)
    const conservationPriority: Record<string, number> = {
      CR: 1, // Critically Endangered
      EN: 2, // Endangered
      VU: 3, // Vulnerable
    };

    // Check if tree is emblematic of Costa Rica
    const isEmblematic = (tree: (typeof allTrees)[number]) => {
      const tags = tree.tags || [];
      return (
        tags.includes("national") || // National tree of Costa Rica
        tags.includes("endemic") // Endemic to Costa Rica/region
      );
    };

    // Separate trees into categories
    const endangeredTrees = trees.filter(
      (tree) =>
        tree.conservationStatus &&
        ["CR", "EN", "VU"].includes(tree.conservationStatus)
    );

    const emblematicTrees = trees.filter(isEmblematic);

    // Sort endangered trees by conservation status priority
    const sortedEndangered = endangeredTrees.sort((a, b) => {
      const priorityA = conservationPriority[a.conservationStatus || ""] || 999;
      const priorityB = conservationPriority[b.conservationStatus || ""] || 999;
      return priorityA - priorityB;
    });

    // Combine endangered and emblematic trees, prioritizing endangered
    const combinedSet = new Set<(typeof allTrees)[number]>();

    // Add endangered trees first (up to MAX_ENDANGERED_TREES)
    sortedEndangered
      .slice(0, MAX_ENDANGERED_TREES)
      .forEach((tree) => combinedSet.add(tree));

    // Add emblematic trees that aren't already in the set
    for (const tree of emblematicTrees) {
      if (combinedSet.size >= MAX_FEATURED_TREES) break;
      combinedSet.add(tree);
    }

    // If we still don't have enough, add more endangered trees
    if (combinedSet.size < MAX_FEATURED_TREES) {
      for (
        let i = MAX_ENDANGERED_TREES;
        i < sortedEndangered.length && combinedSet.size < MAX_FEATURED_TREES;
        i++
      ) {
        combinedSet.add(sortedEndangered[i]);
      }
    }

    // Finally, if still not enough, add native trees as fallback
    if (combinedSet.size < MAX_FEATURED_TREES) {
      const nativeTrees = trees.filter((tree) =>
        (tree.tags || []).includes("native")
      );
      for (const tree of nativeTrees) {
        if (combinedSet.size >= MAX_FEATURED_TREES) break;
        combinedSet.add(tree);
      }
    }

    // Convert to array and limit to MAX_FEATURED_TREES
    return Array.from(combinedSet).slice(0, MAX_FEATURED_TREES);
  }, [trees]);

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

      {featuredTreesList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredTreesList.map((tree) => (
            <TreeCard key={tree._id} tree={tree} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          No trees found. Add some content to get started!
        </p>
      )}
    </>
  );
}
