export default function SafetyLoading() {
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="h-12 bg-muted rounded w-56 mb-4 animate-pulse" />
      <div className="h-6 bg-muted rounded w-96 mb-8 animate-pulse" />
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border border-border rounded-lg">
            <div className="h-6 bg-muted rounded w-48 mb-3 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
