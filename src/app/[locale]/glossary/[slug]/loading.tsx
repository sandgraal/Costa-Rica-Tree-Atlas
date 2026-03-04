export default function GlossaryDetailLoading() {
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <div className="h-10 bg-muted rounded w-2/3 mb-4 animate-pulse" />
      <div className="h-5 bg-muted rounded w-1/3 mb-8 animate-pulse italic" />
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-muted rounded w-full animate-pulse" />
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
      </div>
    </div>
  );
}
