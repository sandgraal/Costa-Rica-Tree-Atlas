export default function CompareDetailLoading() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="h-10 bg-muted rounded w-3/4 mb-4 animate-pulse" />
      {/* Subtitle */}
      <div className="h-6 bg-muted rounded w-1/2 mb-8 animate-pulse" />
      {/* Side-by-side comparison skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[4/3] bg-muted rounded-lg animate-pulse" />
            <div className="h-6 bg-muted rounded w-2/3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
