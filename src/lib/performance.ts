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
  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${componentName} rendering ${itemCount} items`);

    const start = performance.now();
    requestAnimationFrame(() => {
      const end = performance.now();
      console.log(
        `[Performance] ${componentName} rendered in ${(end - start).toFixed(2)}ms`
      );
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
) {
  if (
    process.env.NODE_ENV === "development" &&
    typeof performance !== "undefined"
  ) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      console.log(
        `[Performance] ${measureName}: ${measure.duration.toFixed(2)}ms`
      );
    } catch (e) {
      // Marks might not exist, ignore
    }
  }
}
