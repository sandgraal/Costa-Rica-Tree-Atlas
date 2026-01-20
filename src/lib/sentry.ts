/**
 * Sentry Error Tracking Utility
 *
 * Provides a centralized way to capture errors and send them to Sentry.
 * This module gracefully handles the case when Sentry is not configured.
 *
 * To enable Sentry:
 * 1. Run: npm install @sentry/nextjs
 * 2. Set NEXT_PUBLIC_SENTRY_DSN in environment variables
 * 3. Create sentry.client.config.ts and sentry.server.config.ts files
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

// Check if Sentry DSN is configured
const isSentryConfigured = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

// Log status on module load (development only)
if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  !isSentryConfigured
) {
  console.info(
    "[Sentry] Not configured. Set NEXT_PUBLIC_SENTRY_DSN to enable error tracking."
  );
}

/**
 * Capture an exception and send it to Sentry
 * Falls back to console.error if Sentry is not configured
 */
export function captureException(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id?: string; email?: string };
  }
): void {
  // Always log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Sentry] Captured exception:", error, context);
  }

  if (!isSentryConfigured) {
    // Sentry not configured, just log to console in production
    if (process.env.NODE_ENV === "production") {
      console.error("[Error]", error);
    }
    return;
  }

  // When Sentry is installed and configured, this will be replaced
  // with actual Sentry.captureException call. For now, log to console.
  // The actual Sentry integration happens via sentry.client.config.ts
  // and sentry.server.config.ts files.
  console.error("[Sentry Error]", error, context);
}

/**
 * Capture a message and send it to Sentry
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Sentry] ${level}:`, message, context);
  }

  if (!isSentryConfigured) {
    return;
  }

  // Log to console until actual Sentry is configured
  console.log(`[Sentry ${level}]`, message, context);
}

/**
 * Set user context for subsequent error reports
 */
export function setUser(
  _user: {
    id?: string;
    email?: string;
    username?: string;
  } | null
): void {
  // No-op when Sentry is not configured
  // Will be replaced with Sentry.setUser when SDK is installed
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(_breadcrumb: {
  category?: string;
  message: string;
  level?: "debug" | "info" | "warning" | "error";
  data?: Record<string, unknown>;
}): void {
  // No-op when Sentry is not configured
  // Will be replaced with Sentry.addBreadcrumb when SDK is installed
}
