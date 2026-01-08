export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border p-4 animate-pulse">
      <div className="aspect-square bg-muted rounded-lg mb-4" />
      <div className="h-6 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
      <div className="h-4 bg-muted rounded w-full" />
    </div>
  );
}
