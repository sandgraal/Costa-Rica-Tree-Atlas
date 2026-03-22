"use client";

import { useRouter } from "@i18n/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("error");
  const messages = {
    title: t("title"),
    description: t("description"),
    tryAgain: t("tryAgain"),
    developmentDetails: t("developmentDetails"),
  };

  return (
    <ErrorBoundary
      messages={messages}
      fallback={(error, reset) => (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center max-w-lg">
            <div className="text-8xl mb-6">💥</div>
            <h1 className="text-4xl font-bold mb-4">{t("pageError")}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {t("pageErrorDescription")}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {t("tryAgain")}
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                {t("goHome")}
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 border border-border rounded-md hover:bg-muted"
              >
                {t("goBack")}
              </button>
            </div>
            {process.env.NODE_ENV === "development" && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer font-semibold mb-2">
                  {t("developmentDetails")}
                </summary>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64 whitespace-pre-wrap">
                  {error.stack ?? error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
      onError={(error, errorInfo) => {
        if (process.env.NODE_ENV === "development") {
          console.error("Page error:", error, errorInfo);
        }

        // TODO: Send to error tracking
        // trackError('page_error', { error, errorInfo });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
