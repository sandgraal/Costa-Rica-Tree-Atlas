/**
 * Search Analytics Dashboard — Client Component
 *
 * Displays search metrics, top queries, zero-result queries,
 * and a recent-searches feed. Data is fetched from the admin-only
 * GET /api/search-analytics endpoint.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TopQuery {
  query: string;
  count: number;
  avgResults: number | null;
}

interface ZeroResultQuery {
  query: string;
  count: number;
}

interface LocaleBreakdown {
  locale: string;
  count: number;
}

interface RecentSearch {
  query: string;
  locale: string;
  resultsCount: number;
  selectedResult: string | null;
  createdAt: string;
}

interface AnalyticsData {
  totalSearches: number;
  uniqueQueries: number;
  topQueries: TopQuery[];
  zeroResultQueries: ZeroResultQuery[];
  localeBreakdown: LocaleBreakdown[];
  recentSearches: RecentSearch[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchAnalyticsClient() {
  const t = useTranslations("admin.searchAnalytics");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search-analytics?days=${d}&limit=50`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(days);
  }, [days, fetchData]);

  // Derived stats
  const totalZeroResult =
    data?.zeroResultQueries.reduce((sum, q) => sum + q.count, 0) ?? 0;
  const clickedSearches =
    data?.recentSearches.filter((s) => s.selectedResult).length ?? 0;
  const totalRecent = data?.recentSearches.length ?? 0;
  const clickRate =
    totalRecent > 0 ? Math.round((clickedSearches / totalRecent) * 100) : 0;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{t("error")}</p>
        <button
          onClick={() => void fetchData(days)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!data || data.totalSearches === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-2">🔍</p>
        <p className="font-medium text-foreground">{t("noData")}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {t("noDataDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Time range selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {t("timeRange")}:
        </span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              days === d
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            {t(`days${d}` as "days7" | "days30" | "days90")}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label={t("totalSearches")} value={data.totalSearches} />
        <MetricCard label={t("uniqueQueries")} value={data.uniqueQueries} />
        <MetricCard label={t("zeroResults")} value={totalZeroResult} />
        <MetricCard label={t("clickRate")} value={`${clickRate}%`} />
      </div>

      {/* Two-column layout for tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Queries */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {t("topQueries")}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">{t("queryColumn")}</th>
                  <th className="pb-2 font-medium text-right">
                    {t("countColumn")}
                  </th>
                  <th className="pb-2 font-medium text-right">
                    {t("avgResultsColumn")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topQueries.slice(0, 20).map((q) => (
                  <tr
                    key={q.query}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-2 font-mono text-foreground">
                      {q.query}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">
                      {q.count}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">
                      {q.avgResults !== null ? q.avgResults.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Zero-Result Queries */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {t("zeroResultQueries")}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {t("zeroResultDescription")}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">{t("queryColumn")}</th>
                  <th className="pb-2 font-medium text-right">
                    {t("countColumn")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.zeroResultQueries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-4 text-center text-muted-foreground"
                    >
                      —
                    </td>
                  </tr>
                ) : (
                  data.zeroResultQueries.slice(0, 20).map((q) => (
                    <tr
                      key={q.query}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2 font-mono text-red-600 dark:text-red-400">
                        {q.query}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {q.count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("recentSearches")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">{t("queryColumn")}</th>
                <th className="pb-2 font-medium text-right">
                  {t("resultColumn")}
                </th>
                <th className="pb-2 font-medium">{t("clickedColumn")}</th>
                <th className="pb-2 font-medium">{t("localeColumn")}</th>
                <th className="pb-2 font-medium text-right">
                  {t("timeColumn")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentSearches.slice(0, 50).map((s, i) => (
                <tr
                  key={`${s.createdAt}-${i}`}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2 font-mono text-foreground">{s.query}</td>
                  <td className="py-2 text-right text-muted-foreground">
                    {s.resultsCount}
                  </td>
                  <td className="py-2 text-muted-foreground">
                    {s.selectedResult ? (
                      <span className="text-green-600 dark:text-green-400">
                        {s.selectedResult}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2">
                    <span className="inline-block px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground uppercase">
                      {s.locale}
                    </span>
                  </td>
                  <td className="py-2 text-right text-muted-foreground text-xs">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center">
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
