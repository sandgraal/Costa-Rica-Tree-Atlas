// Loading skeleton for tree cards
export function TreeCardSkeleton() {
  return (
    <div className="flex-none w-48 bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="relative h-32 bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-5/6" />
      </div>
    </div>
  );
}

// Loading skeleton for stats section
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-card rounded-xl p-6 border border-border animate-pulse"
        >
          <div className="h-8 w-8 bg-muted rounded-full mx-auto mb-2" />
          <div className="h-8 bg-muted rounded w-16 mx-auto mb-1" />
          <div className="h-4 bg-muted rounded w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Loading skeleton for tree of the day
export function TreeOfTheDaySkeleton() {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border overflow-hidden animate-pulse">
      <div className="md:flex">
        <div className="md:w-2/5 relative h-64 md:h-80 bg-muted" />
        <div className="md:w-3/5 p-8 space-y-4">
          <div className="h-6 bg-muted rounded w-48" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-5/6" />
          <div className="h-20 bg-muted rounded" />
          <div className="flex gap-3">
            <div className="h-8 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton for now blooming section
export function NowBloomingSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-64" />
        </div>
        <div className="h-6 bg-muted rounded w-32" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TreeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
