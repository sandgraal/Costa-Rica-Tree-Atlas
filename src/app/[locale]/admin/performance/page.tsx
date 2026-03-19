import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import PerformanceDashboardClient from "./PerformanceDashboardClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.performance");
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    robots: { index: false, follow: false },
    alternates: {
      languages: {
        en: "/en/admin/performance",
        es: "/es/admin/performance",
      },
    },
  };
}

export default async function PerformanceDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.performance");

  return (
    <div className="py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("heading")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://vercel.com/analytics"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
            >
              {t("vercelAnalytics")}
            </a>
            <a
              href="https://vercel.com/docs/speed-insights"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
            >
              {t("speedInsightsDocs")}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <PerformanceDashboardClient />
        </div>
      </div>
    </div>
  );
}
