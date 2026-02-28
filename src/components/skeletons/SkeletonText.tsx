interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = "" }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className={`h-4 bg-muted rounded animate-pulse ${
            i === lines - 1 ? "w-3/5" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}
