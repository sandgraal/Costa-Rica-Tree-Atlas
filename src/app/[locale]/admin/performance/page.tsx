import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import PerformanceDashboardClient from "./PerformanceDashboardClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Performance Dashboard | Admin",
    description:
      "Monitor Core Web Vitals and performance budgets for Costa Rica Tree Atlas.",
    robots: { index: false, follow: false },
  };
}

export default async function PerformanceDashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/users"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← Back to Admin
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-foreground">
              ⚡ Performance Monitoring
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Capture live Core Web Vitals and review performance budgets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://vercel.com/analytics"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
            >
              Open Vercel Analytics
            </a>
            <a
              href="https://vercel.com/docs/speed-insights"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
            >
              Speed Insights Docs
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
