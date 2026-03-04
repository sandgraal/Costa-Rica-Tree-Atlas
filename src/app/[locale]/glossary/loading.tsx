export default function GlossaryLoading() {
  return (
    <div className="container py-8">
      <div className="h-12 bg-muted rounded w-48 mb-4 animate-pulse" />
      <div className="h-6 bg-muted rounded w-80 mb-8 animate-pulse" />
      {/* Alphabet filter bar */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 w-8 bg-muted rounded animate-pulse" />
        ))}
      </div>
      {/* Glossary terms list */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 border border-border rounded-lg">
            <div className="h-5 bg-muted rounded w-40 mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
