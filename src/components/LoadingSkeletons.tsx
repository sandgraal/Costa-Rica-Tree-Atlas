import { Skeleton } from "./LoadingSkeleton";

// Loading skeleton for tree cards
export function TreeCardSkeleton() {
  return (
    <div className="flex-none w-48 bg-card rounded-xl border border-border overflow-hidden">
      <Skeleton className="relative h-32 w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

// Loading skeleton for stats section
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-xl p-6 border border-border">
          <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
          <Skeleton className="h-8 w-16 mx-auto mb-1" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Loading skeleton for tree of the day
export function TreeOfTheDaySkeleton() {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border overflow-hidden">
      <div className="md:flex">
        <Skeleton className="md:w-2/5 relative h-64 md:h-80" />
        <div className="md:w-3/5 p-8 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
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
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TreeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for featured trees section
export function FeaturedTreesSkeleton() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            <Skeleton className="relative h-48 w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for recently viewed section
export function RecentlyViewedSkeleton() {
  return (
    <div>
      <Skeleton className="h-7 w-40 mb-4" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <TreeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Loading skeleton for about section
export function AboutSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-2/3 mx-auto" />
    </div>
  );
}
