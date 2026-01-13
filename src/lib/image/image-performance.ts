/**
 * Image performance monitoring utilities
 */

interface ImageMetrics {
  name: string;
  duration: number;
  size: number;
  cached: boolean;
  timestamp: number;
}

/**
 * Monitor image loading performance
 */
export function monitorImagePerformance(): void {
  if (typeof window === "undefined") return;

  // Check if PerformanceObserver is supported
  if (!("PerformanceObserver" in window)) {
    console.warn("PerformanceObserver not supported");
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (
          entry.entryType === "resource" &&
          entry.name.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)
        ) {
          const imageEntry = entry as PerformanceResourceTiming;

          const metrics: ImageMetrics = {
            name: entry.name,
            duration: imageEntry.duration,
            size: imageEntry.transferSize || 0,
            cached: imageEntry.transferSize === 0,
            timestamp: Date.now(),
          };

          // Log metrics in development
          if (process.env.NODE_ENV === "development") {
            console.log("Image loaded:", {
              ...metrics,
              url: entry.name.substring(entry.name.lastIndexOf("/") + 1),
            });
          }

          // Send to analytics if available
          if (typeof window !== "undefined" && "gtag" in window) {
            // @ts-expect-error - gtag is injected by analytics
            window.gtag?.("event", "image_loaded", {
              event_category: "performance",
              event_label: metrics.name,
              value: Math.round(metrics.duration),
              custom_dimension_1: metrics.cached ? "cached" : "network",
              custom_dimension_2: Math.round(metrics.size / 1024) + "KB",
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ["resource"] });
  } catch (error) {
    console.error("Failed to initialize image performance monitoring:", error);
  }
}

/**
 * Get image loading statistics
 */
export function getImageStats(): {
  total: number;
  cached: number;
  avgLoadTime: number;
  totalSize: number;
} {
  if (typeof window === "undefined" || !("performance" in window)) {
    return { total: 0, cached: 0, avgLoadTime: 0, totalSize: 0 };
  }

  const entries = performance.getEntriesByType(
    "resource"
  ) as PerformanceResourceTiming[];
  const imageEntries = entries.filter((entry) =>
    entry.name.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)
  );

  const total = imageEntries.length;
  const cached = imageEntries.filter(
    (entry) => entry.transferSize === 0
  ).length;
  const avgLoadTime =
    imageEntries.reduce((sum, entry) => sum + entry.duration, 0) / total || 0;
  const totalSize = imageEntries.reduce(
    (sum, entry) => sum + (entry.transferSize || 0),
    0
  );

  return {
    total,
    cached,
    avgLoadTime: Math.round(avgLoadTime),
    totalSize: Math.round(totalSize / 1024), // Convert to KB
  };
}

/**
 * Check Largest Contentful Paint (LCP) for images
 */
export function monitorLCP(): void {
  if (typeof window === "undefined") return;

  if (!("PerformanceObserver" in window)) {
    console.warn("PerformanceObserver not supported");
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        element?: Element;
        url?: string;
      };

      // Check if LCP element is an image
      if (
        lastEntry.element &&
        (lastEntry.element.tagName === "IMG" ||
          lastEntry.element.tagName === "IMAGE")
      ) {
        if (process.env.NODE_ENV === "development") {
          console.log("LCP Image:", {
            url: lastEntry.url,
            loadTime: Math.round(lastEntry.startTime),
          });
        }

        // Send to analytics
        if (typeof window !== "undefined" && "gtag" in window) {
          // @ts-expect-error - gtag is injected by analytics
          window.gtag?.("event", "lcp_image", {
            event_category: "performance",
            value: Math.round(lastEntry.startTime),
          });
        }
      }
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
  } catch (error) {
    console.error("Failed to initialize LCP monitoring:", error);
  }
}

/**
 * Initialize all image performance monitoring
 */
export function initImagePerformanceMonitoring(): void {
  if (typeof window === "undefined") return;

  // Wait for page to load before starting monitoring
  if (document.readyState === "complete") {
    monitorImagePerformance();
    monitorLCP();
  } else {
    window.addEventListener("load", () => {
      monitorImagePerformance();
      monitorLCP();
    });
  }
}
