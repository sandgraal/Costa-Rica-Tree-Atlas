function Loader2Icon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingFallback({
  message = "Loading...",
  fullScreen = false,
}: LoadingFallbackProps) {
  const containerClass = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background"
    : "flex items-center justify-center min-h-[400px]";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
