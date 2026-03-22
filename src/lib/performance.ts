/**
 * Performance monitoring utilities for development
 * These functions only run in development mode to avoid production overhead
 */

/**
 * Log render performance for debugging
 * Measures the time it takes for a component to render
 *
 * @param componentName - Name of the component being measured
 * @param itemCount - Number of items being rendered
 *
 * @example
 * ```tsx
 * measureRender('TreeGallery', images.length);
 * ```
 */
export function measureRender(componentName: string, itemCount: number) {
  if (
    process.env.NODE_ENV === "development" &&
    typeof performance !== "undefined" &&
    typeof requestAnimationFrame !== "undefined"
  ) {
    const startMark = `${componentName}-render-start-${itemCount}`;
    const endMark = `${componentName}-render-end-${itemCount}`;
    const measureName = `${componentName}-render-duration-${itemCount}`;

    performance.mark(startMark);

    requestAnimationFrame(() => {
      performance.mark(endMark);

      try {
        performance.measure(measureName, startMark, endMark);
      } catch (_error) {
        // Marks may have been cleared or unsupported by the current runtime.
      } finally {
        performance.clearMarks(startMark);
        performance.clearMarks(endMark);
      }
    });
  }
}

/**
 * Create a performance mark for measuring
 *
 * @param markName - Unique name for the performance mark
 */
export function markPerformance(markName: string) {
  if (
    process.env.NODE_ENV === "development" &&
    typeof performance !== "undefined"
  ) {
    performance.mark(markName);
  }
}

/**
 * Measure the time between two performance marks
 *
 * @param measureName - Name for the measurement
 * @param startMark - Starting mark name
 * @param endMark - Ending mark name
 */
export function measurePerformance(
  measureName: string,
  startMark: string,
  endMark: string
): number | undefined {
  if (
    process.env.NODE_ENV === "development" &&
    typeof performance !== "undefined"
  ) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      return measure?.duration;
    } catch (_e) {
      // Marks might not exist, ignore
    }
  }

  return undefined;
}
