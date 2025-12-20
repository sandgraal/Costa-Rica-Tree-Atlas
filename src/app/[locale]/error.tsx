"use client";

import { useEffect } from "react";
import { Link } from "@i18n/navigation";
import { useLocale } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  
  const t = {
    title: locale === "es" ? "Algo salió mal" : "Something went wrong",
    description:
      locale === "es"
        ? "Encontramos un error inesperado. Por favor intenta de nuevo o regresa a la página principal."
        : "We encountered an unexpected error. Please try again or return to the homepage.",
    tryAgain: locale === "es" ? "Intentar de nuevo" : "Try Again",
    goHome: locale === "es" ? "Ir al Inicio" : "Go Home",
    errorId: locale === "es" ? "ID del error" : "Error ID",
  };

  useEffect(() => {
    // Log the error to console in development
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-4">
          {t.title}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t.description}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            {t.tryAgain}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-card hover:bg-muted text-foreground border border-border font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t.goHome}
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-8">
            {t.errorId}: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
