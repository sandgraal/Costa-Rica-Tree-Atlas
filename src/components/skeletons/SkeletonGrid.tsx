import { SkeletonCard } from "./SkeletonCard";

interface SkeletonGridProps {
  count?: number;
  columns?: number;
}

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export function SkeletonGrid({ count = 8, columns = 4 }: SkeletonGridProps) {
  const colClass = (() => {
    switch (columns) {
      case 1:
        return GRID_COLS[1];
      case 2:
        return GRID_COLS[2];
      case 3:
        return GRID_COLS[3];
      case 4:
        return GRID_COLS[4];
      case 5:
        return GRID_COLS[5];
      case 6:
        return GRID_COLS[6];
      default:
        return "grid-cols-4";
    }
  })();

  return (
    <div className={`grid gap-4 ${colClass}`}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
