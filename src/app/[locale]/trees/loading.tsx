import { SkeletonGrid } from "@/components/skeletons/SkeletonGrid";

export default function TreesLoading() {
  return (
    <div className="container py-8">
      <div className="h-12 bg-muted rounded w-48 mb-8 animate-pulse" />
      <SkeletonGrid count={12} columns={4} />
    </div>
  );
}
