"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Tree } from "contentlayer/generated";
import { TreeCard } from "./tree/TreeCard";
import type { Locale } from "@/types/tree";

interface VirtualizedTreeListProps {
  trees: Tree[];
  locale: Locale;
  showFavorites?: boolean;
}

/**
 * Virtualized list for tree cards
 * Only renders visible items for better performance with large lists
 *
 * @param trees - Array of tree objects to display
 * @param locale - Current locale (en/es) for rendering
 * @param showFavorites - Whether to show favorite buttons (default: true)
 */
export function VirtualizedTreeList({
  trees,
  locale,
  showFavorites = true,
}: VirtualizedTreeListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: trees.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated card height
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

  return (
    <div ref={parentRef} className="overflow-auto h-[calc(100vh-200px)]">
      <div
        className="w-full relative"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const tree = trees[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              <TreeCard
                tree={tree}
                locale={locale}
                showFavorite={showFavorites}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
