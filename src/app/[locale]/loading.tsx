"use client";

import { useLocale } from "next-intl";

export default function Loading() {
  const locale = useLocale();
  const loadingText = locale === "es" ? "Cargando..." : "Loading...";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="relative">
        {/* Animated tree icon */}
        <div className="animate-pulse">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 22V8M5 12l7-10 7 10M5 12a7 7 0 0 0 14 0"
            />
          </svg>
        </div>

        {/* Rotating ring */}
        <div className="absolute inset-0 -m-4">
          <svg
            className="animate-spin h-28 w-28 text-primary/20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>

      <p className="mt-8 text-muted-foreground animate-pulse" role="status">
        {loadingText}
      </p>
    </div>
  );
}
