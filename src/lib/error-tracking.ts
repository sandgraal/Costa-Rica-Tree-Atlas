/**
 * Error Tracking Utility
 *
 * Provides centralized error capture for error boundaries and other handlers.
 * Logs to console in all environments. Replace the body of captureException
 * with a third-party SDK call if you add external error tracking later.
 */

/**
 * Capture an exception and log it.
 * Called by ErrorBoundary, ComponentErrorBoundary, ImageErrorBoundary,
 * and global-error.tsx.
 */
export function captureException(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id?: string; email?: string };
  }
): void {
  if (process.env.NODE_ENV === "development") {
    console.error("[Error Tracking] Captured exception:", error, context);
  } else {
    // Production: log concisely
    console.error("[Error]", error);
  }
}
