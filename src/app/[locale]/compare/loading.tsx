import { SkeletonGrid } from "@/components/skeletons/SkeletonGrid";

export default function CompareLoading() {
  return (
    <div className="container py-8">
      <div className="h-12 bg-muted rounded w-64 mb-4 animate-pulse" />
      <div className="h-6 bg-muted rounded w-96 mb-8 animate-pulse" />
      <SkeletonGrid count={6} columns={3} />
    </div>
  );
}
