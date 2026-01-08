"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns?: number;
  itemHeight?: number;
  gap?: number;
  className?: string;
}

/**
 * Virtualized grid that only renders visible items
 * Dramatically improves performance for large lists
 *
 * @template T - Type of items in the grid
 * @param items - Array of items to render
 * @param renderItem - Function to render each item
 * @param columns - Number of columns (default: 4)
 * @param itemHeight - Estimated height of each row in pixels (default: 300)
 * @param gap - Gap between items in pixels (default: 16)
 * @param className - Additional CSS classes for the container
 */
export function VirtualizedGrid<T>({
  items,
  renderItem,
  columns = 4,
  itemHeight = 300,
  gap = 16,
  className = "",
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows needed
  const rows = Math.ceil(items.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 2, // Render 2 extra rows above/below viewport
  });

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${itemHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: `${gap}px`,
                }}
              >
                {rowItems.map((item, colIndex) =>
                  renderItem(item, startIndex + colIndex)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
