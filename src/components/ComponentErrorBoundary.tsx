"use client";

import { useTranslations } from "next-intl";
import { ErrorBoundary } from "./ErrorBoundary";
import { captureException } from "@/lib/error-tracking";
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
  const t = useTranslations("error");

  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="border border-destructive bg-destructive/10 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive mb-1">
                {t("componentErrorTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t("componentErrorDescription")}
              </p>
              <button
                onClick={reset}
                className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                {t("tryAgain")}
              </button>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-3 text-left">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    {t("developmentDetails")}
                  </summary>
                  <pre className="text-xs bg-background/70 p-3 rounded overflow-auto max-h-48">
                    {error.stack ?? error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
      onError={(error) => {
        console.error(`${componentName} error:`, error);
        // Log error with component context
        captureException(error, {
          tags: {
            boundary: "ComponentErrorBoundary",
            componentName,
          },
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
