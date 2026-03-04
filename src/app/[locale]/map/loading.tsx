export default function MapLoading() {
  return (
    <div className="container py-8">
      <div className="h-12 bg-muted rounded w-48 mb-4 animate-pulse" />
      <div className="h-6 bg-muted rounded w-64 mb-8 animate-pulse" />
      {/* Map placeholder */}
      <div className="aspect-[16/9] bg-muted rounded-lg animate-pulse" />
    </div>
  );
}
