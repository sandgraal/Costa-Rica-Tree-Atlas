"use client";

import { useState, useEffect } from "react";
import { VirtualizedGrid } from "./VirtualizedGrid";

interface ResponsiveVirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  gap?: number;
  className?: string;
}

/**
 * Virtualized grid that adapts columns to screen size
 * Uses Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
 *
 * @template T - Type of items in the grid
 * @param items - Array of items to render
 * @param renderItem - Function to render each item
 * @param itemHeight - Estimated height of each row in pixels (default: 300)
 * @param gap - Gap between items in pixels (default: 16)
 * @param className - Additional CSS classes for the container
 */
export function ResponsiveVirtualizedGrid<T>({
  items,
  renderItem,
  itemHeight = 300,
  gap = 16,
  className = "",
}: ResponsiveVirtualizedGridProps<T>) {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640)
        setColumns(1); // sm
      else if (width < 768)
        setColumns(2); // md
      else if (width < 1024)
        setColumns(3); // lg
      else setColumns(4); // xl
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return (
    <VirtualizedGrid
      items={items}
      renderItem={renderItem}
      columns={columns}
      itemHeight={itemHeight}
      gap={gap}
      className={className}
    />
  );
}
