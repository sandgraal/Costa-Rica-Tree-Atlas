"use client";

import { useEffect } from "react";
import { Link } from "@i18n/navigation";
import { useTranslations } from "next-intl";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4">
          {t("title")}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          {t("description")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t("tryAgain")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-card hover:bg-muted text-foreground border border-border font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t("goHome")}
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-muted-foreground mt-8">
            {t("errorId")}: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
