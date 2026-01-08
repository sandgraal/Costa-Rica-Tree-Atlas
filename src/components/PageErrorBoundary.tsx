"use client";

import { useRouter } from "@i18n/navigation";
import { ErrorBoundary } from "./ErrorBoundary";
import type { ReactNode } from "react";

interface PageErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Error boundary for full pages
 * Shows full-page error with navigation options
 */
export function PageErrorBoundary({ children }: PageErrorBoundaryProps) {
  const router = useRouter();

  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center max-w-lg">
            <div className="text-8xl mb-6">💥</div>
            <h1 className="text-4xl font-bold mb-4">Page Error</h1>
            <p className="text-xl text-muted-foreground mb-2">
              We encountered an error loading this page
            </p>
            <p className="text-sm text-muted-foreground mb-6 font-mono bg-muted p-4 rounded">
              {error.message}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Go Home
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-border rounded-md hover:bg-muted"
              >
                Go Back
              </button>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer font-semibold mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error("Page error:", error, errorInfo);

        // TODO: Send to error tracking
        // trackError('page_error', { error, errorInfo });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
