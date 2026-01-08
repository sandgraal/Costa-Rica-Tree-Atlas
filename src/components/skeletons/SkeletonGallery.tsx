export function SkeletonGallery() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="aspect-square bg-muted rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}
