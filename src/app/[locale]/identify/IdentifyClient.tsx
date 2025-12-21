"use client";

import { useTranslations } from "next-intl";
import { Link } from "@i18n/navigation";

// Feature temporarily disabled for security improvements
const FEATURE_ENABLED = false;

interface IdentifyClientProps {
  locale: string;
}

interface IdentifyLabel {
  description: string;
  score: number;
}

interface IdentifyMatch {
  title: string;
  scientificName: string;
  slug: string;
  score: number;
  url: string;
}

interface IdentifyResponse {
  labels: IdentifyLabel[];
  matches: IdentifyMatch[];
}

export default function IdentifyClient({ locale }: IdentifyClientProps) {
  const t = useTranslations("identify");

  // Show maintenance notice when feature is disabled
  if (!FEATURE_ENABLED) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">{t("subtitle")}</p>

          <div className="rounded-2xl border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 p-8 shadow-sm text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-4">
              {t("maintenanceTitle")}
            </h2>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              {t("maintenanceMessage")}
            </p>
            <p className="text-amber-600 dark:text-amber-400 text-sm mb-8">
              {t("maintenanceNote")}
            </p>
            <Link
              href="/trees"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
              {t("browseTrees")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Original functionality preserved below - will be restored when FEATURE_ENABLED = true
  // The code below is unreachable when FEATURE_ENABLED is false
  // To re-enable: set FEATURE_ENABLED = true at the top of this file
}
