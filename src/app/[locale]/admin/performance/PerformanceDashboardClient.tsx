"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Rating = "good" | "needs-improvement" | "poor";

type MetricKey = "lcp" | "cls" | "inp" | "fcp" | "ttfb";

type MetricSnapshot = {
  key: MetricKey;
  label: string;
  value: number | null;
  unit: string;
  rating: Rating;
  description: string;
};

type ResourceSnapshot = {
  jsTransferKb: number;
  cssTransferKb: number;
  imageTransferKb: number;
  totalTransferKb: number;
  resourceCount: number;
};

type LayoutShiftEntry = PerformanceEntry & {
  hadRecentInput: boolean;
  value: number;
};

type InteractionEventEntry = PerformanceEntry & {
  interactionId?: number;
  duration: number;
};

const METRICS: Array<{
  key: MetricKey;
  label: string;
  unit: string;
  description: string;
  thresholds: { good: number; needsImprovement: number };
}> = [
  {
    key: "lcp",
    label: "Largest Contentful Paint",
    unit: "ms",
    description: "Render timing for the largest element in view.",
    thresholds: { good: 2500, needsImprovement: 4000 },
  },
  {
    key: "cls",
    label: "Cumulative Layout Shift",
    unit: "",
    description: "Unexpected layout movement during page load.",
    thresholds: { good: 0.1, needsImprovement: 0.25 },
  },
  {
    key: "inp",
    label: "Interaction to Next Paint",
    unit: "ms",
    description: "Responsiveness to user interactions (estimated from events).",
    thresholds: { good: 200, needsImprovement: 500 },
  },
  {
    key: "fcp",
    label: "First Contentful Paint",
    unit: "ms",
    description: "Time until the first text or image is rendered.",
    thresholds: { good: 1800, needsImprovement: 3000 },
  },
  {
    key: "ttfb",
    label: "Time to First Byte",
    unit: "ms",
    description: "Server response latency measured on navigation.",
    thresholds: { good: 800, needsImprovement: 1800 },
  },
];

const ratingLabels: Record<Rating, string> = {
  good: "Good",
  "needs-improvement": "Needs Improvement",
  poor: "Poor",
};

const ratingClasses: Record<Rating, string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  "needs-improvement":
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  poor: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
};

const formatValue = (value: number | null, unit: string) => {
  if (value === null) return "—";
  if (unit === "") return value.toFixed(3);
  return `${Math.round(value)} ${unit}`;
};

const getRating = (key: MetricKey, value: number | null): Rating => {
  if (value === null) return "needs-improvement";

  // Derive thresholds from METRICS to avoid duplication and drift.
  const metric = METRICS.find((m) => m.key === key);
  const thresholds = metric && (metric as any).thresholds;

  if (!thresholds) {
    // Fallback if METRICS is misconfigured for this key.
    return "needs-improvement";
  }

  const { good, needsImprovement } = thresholds as {
    good: number;
    needsImprovement: number;
  };
  if (value <= good) return "good";
  if (value <= needsImprovement) return "needs-improvement";
  return "poor";
};

const getTransferSize = (entry: PerformanceResourceTiming) => {
  if (entry.transferSize && entry.transferSize > 0) {
    return entry.transferSize;
  }
  return entry.encodedBodySize || 0;
};

const getMetricValue = (
  source: Record<MetricKey, number | null>,
  key: MetricKey
) => {
  switch (key) {
    case "lcp":
      return source.lcp;
    case "cls":
      return source.cls;
    case "inp":
      return source.inp;
    case "fcp":
      return source.fcp;
    case "ttfb":
      return source.ttfb;
    default:
      return null;
  }
};

export default function PerformanceDashboardClient() {
  const [metrics, setMetrics] = useState<Record<MetricKey, number | null>>({
    lcp: null,
    cls: null,
    inp: null,
    fcp: null,
    ttfb: null,
  });
  const [resources, setResources] = useState<ResourceSnapshot>({
    jsTransferKb: 0,
    cssTransferKb: 0,
    imageTransferKb: 0,
    totalTransferKb: 0,
    resourceCount: 0,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );

  const updateMetric = useCallback((key: MetricKey, value: number | null) => {
    setMetrics((prev) => {
      switch (key) {
        case "lcp":
          return { ...prev, lcp: value };
        case "cls":
          return { ...prev, cls: value };
        case "inp":
          return { ...prev, inp: value };
        case "fcp":
          return { ...prev, fcp: value };
        case "ttfb":
          return { ...prev, ttfb: value };
        default:
          return prev;
      }
    });
    setLastUpdated(new Date());
  }, []);

  const calculateResources = useCallback(() => {
    const entries = performance.getEntriesByType(
      "resource"
    ) as PerformanceResourceTiming[];
    if (!entries.length) return;

    let jsTotal = 0;
    let cssTotal = 0;
    let imageTotal = 0;
    let total = 0;

    entries.forEach((entry) => {
      const size = getTransferSize(entry);
      total += size;

      if (entry.initiatorType === "script") {
        jsTotal += size;
      } else if (
        entry.initiatorType === "link" ||
        entry.initiatorType === "css"
      ) {
        cssTotal += size;
      } else if (entry.initiatorType === "img") {
        imageTotal += size;
      }
    });

    const toKb = (value: number) => Math.round(value / 1024);

    setResources({
      jsTransferKb: toKb(jsTotal),
      cssTransferKb: toKb(cssTotal),
      imageTransferKb: toKb(imageTotal),
      totalTransferKb: toKb(total),
      resourceCount: entries.length,
    });
  }, []);

  const refreshSnapshot = useCallback(() => {
    const navigationEntries = performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];

    if (navigationEntries.length > 0) {
      updateMetric("ttfb", navigationEntries[0].responseStart);
    }

    calculateResources();
  }, [calculateResources, updateMetric]);

  useEffect(() => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    let clsValue = 0;
    let inpValue = 0;

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        updateMetric("lcp", lastEntry.startTime);
      }
    });

    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as LayoutShiftEntry;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
          updateMetric("cls", clsValue);
        }
      }
    });

    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          updateMetric("fcp", entry.startTime);
        }
      }
    });

    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as InteractionEventEntry;
        if (eventEntry.interactionId && eventEntry.duration > inpValue) {
          inpValue = eventEntry.duration;
          updateMetric("inp", inpValue);
        }
      }
    });

    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
    clsObserver.observe({ type: "layout-shift", buffered: true });
    fcpObserver.observe({ type: "paint", buffered: true });
    inpObserver.observe({
      type: "event",
      buffered: true,
    });

    refreshSnapshot();

    const handleLoad = () => {
      refreshSnapshot();
    };

    window.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("load", handleLoad);
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fcpObserver.disconnect();
      inpObserver.disconnect();
    };
  }, [refreshSnapshot, updateMetric]);

  const snapshots = useMemo<MetricSnapshot[]>(
    () =>
      METRICS.map((metric) => {
        const value = getMetricValue(metrics, metric.key);

        return {
          key: metric.key,
          label: metric.label,
          value,
          unit: metric.unit,
          description: metric.description,
          rating: getRating(metric.key, value),
        };
      }),
    [metrics]
  );

  const jsonSnapshot = useMemo(
    () => ({
      updatedAt: lastUpdated?.toISOString() ?? null,
      metrics,
      resources,
    }),
    [lastUpdated, metrics, resources]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(jsonSnapshot, null, 2)
      );
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to copy snapshot", error);
      setCopyStatus("failed");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Live Core Web Vitals
          </h2>
          <p className="text-sm text-muted-foreground">
            Metrics are captured from the current session using the browser
            Performance APIs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refreshSnapshot}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
          >
            Refresh snapshot
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-border bg-foreground px-3 py-2 text-sm font-medium text-background shadow-sm hover:bg-foreground/90"
          >
            {copyStatus === "copied"
              ? "Copied"
              : copyStatus === "failed"
                ? "Copy failed"
                : "Copy JSON"}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.key}
            className={`rounded-xl border p-4 shadow-sm ${ratingClasses[snapshot.rating]}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold uppercase tracking-wide">
                {snapshot.key}
              </div>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-foreground/70 dark:bg-black/30 dark:text-foreground">
                {ratingLabels[snapshot.rating]}
              </span>
            </div>
            <div className="mt-2 text-2xl font-semibold">
              {formatValue(snapshot.value, snapshot.unit)}
            </div>
            <div className="mt-1 text-sm font-medium text-foreground/80">
              {snapshot.label}
            </div>
            <p className="mt-2 text-xs text-foreground/70">
              {snapshot.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground">
            Resource Mix
          </h3>
          <p className="text-xs text-muted-foreground">
            Transfer size totals for this page load.
          </p>
          <div className="mt-4 space-y-2 text-sm text-foreground">
            <div className="flex justify-between">
              <span>JavaScript</span>
              <span className="font-semibold">{resources.jsTransferKb} KB</span>
            </div>
            <div className="flex justify-between">
              <span>CSS</span>
              <span className="font-semibold">
                {resources.cssTransferKb} KB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Images</span>
              <span className="font-semibold">
                {resources.imageTransferKb} KB
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span>Total</span>
              <span className="font-semibold">
                {resources.totalTransferKb} KB
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Resources counted</span>
              <span>{resources.resourceCount}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground">
            Reference Targets
          </h3>
          <p className="text-xs text-muted-foreground">
            Targets align with Web Vitals guidance and the project performance
            budgets.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {METRICS.map((metric) => (
              <div
                key={metric.key}
                className="rounded-lg border border-border p-3"
              >
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  {metric.key}
                </div>
                <div className="mt-1 text-sm text-foreground">
                  Good: {metric.thresholds.good}
                  {metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Needs improvement: ≤ {metric.thresholds.needsImprovement}
                  {metric.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">Last updated:</span>
          <span>
            {lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : "Waiting for metrics..."}
          </span>
        </div>
        <p className="mt-2">
          Pair this dashboard with Vercel Speed Insights and Lighthouse CI for
          historical tracking and regression alerts.
        </p>
      </div>
    </div>
  );
}
