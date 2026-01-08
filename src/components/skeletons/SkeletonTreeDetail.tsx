export function SkeletonTreeDetail() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Hero image */}
      <div className="aspect-video bg-muted rounded-lg" />

      {/* Title */}
      <div className="space-y-3">
        <div className="h-10 bg-muted rounded w-3/4" />
        <div className="h-6 bg-muted rounded w-1/2" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}
