import { SkeletonGrid } from "@/components/skeletons/SkeletonGrid";

export default function SeasonalLoading() {
  return (
    <div className="container py-8">
      <div className="h-12 bg-muted rounded w-56 mb-4 animate-pulse" />
      <div className="h-6 bg-muted rounded w-80 mb-8 animate-pulse" />
      <SkeletonGrid count={8} columns={4} />
    </div>
  );
}
