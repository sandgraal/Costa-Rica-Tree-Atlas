"use client";

import { ErrorBoundary } from "./ErrorBoundary";
import type { ReactNode } from "react";

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
}

/**
 * Error boundary for individual components
 * Prevents one component error from crashing entire page
 */
export function ComponentErrorBoundary({
  children,
  componentName = "Component",
}: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="border border-destructive bg-destructive/10 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">
                {componentName} Error
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {error.message || "This component encountered an error"}
              </p>
              <button
                onClick={reset}
                className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      onError={(error) => {
        console.error(`${componentName} error:`, error);
        // TODO: Track component errors
        // trackError('component_error', { componentName, error });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
