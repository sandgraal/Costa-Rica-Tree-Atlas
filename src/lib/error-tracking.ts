/**
 * Error Tracking Utility
 *
 * Provides centralized error capture for error boundaries, API routes,
 * and other handlers. Supports optional Sentry integration when
 * @sentry/nextjs is installed and NEXT_PUBLIC_SENTRY_DSN is set.
 *
 * Without Sentry: logs errors to console with structured context.
 * With Sentry: forwards to Sentry while still logging locally.
 */

type ErrorSeverity = "fatal" | "error" | "warning" | "info";

interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; email?: string };
  level?: ErrorSeverity;
}

// Sentry SDK reference (lazily loaded if available)
// Uses `any` to avoid requiring @sentry/nextjs as a dependency.
// When Sentry is installed, this will hold the actual SDK module.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sentry: any = null;
let _sentryChecked = false;

/**
 * Attempt to load @sentry/nextjs dynamically.
 * Returns null if the package is not installed or DSN is not configured.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSentry(): any {
  if (_sentryChecked) return _sentry;
  _sentryChecked = true;

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _sentry = require("@sentry/nextjs");
    return _sentry;
  } catch {
    // @sentry/nextjs not installed — that's fine, fall back to console
    return null;
  }
}

/**
 * Capture an exception and log it.
 * Called by ErrorBoundary, ComponentErrorBoundary, ImageErrorBoundary,
 * global-error.tsx, and API route catch blocks.
 *
 * When Sentry is configured, the error is forwarded to Sentry with
 * full context. Otherwise, it's logged to the console.
 */
export function captureException(
  error: Error | unknown,
  context?: ErrorContext
): void {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const level = context?.level ?? "error";

  // Always log locally
  if (process.env.NODE_ENV === "development") {
    console.error(
      `[Error Tracking] [${level.toUpperCase()}]`,
      errorObj.message,
      {
        ...(context?.tags && { tags: context.tags }),
        ...(context?.extra && { extra: context.extra }),
        stack: errorObj.stack?.split("\n").slice(0, 5).join("\n"),
      }
    );
  } else {
    // Production: structured but concise
    console.error(
      JSON.stringify({
        level,
        message: errorObj.message,
        name: errorObj.name,
        ...(context?.tags && { tags: context.tags }),
        timestamp: new Date().toISOString(),
      })
    );
  }

  // Forward to Sentry synchronously
  const Sentry = getSentry();
  if (Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Sentry.withScope((scope: any) => {
      if (context?.level) scope.setLevel(context.level);
      if (context?.tags) {
        for (const [key, value] of Object.entries(context.tags)) {
          scope.setTag(key, value);
        }
      }
      if (context?.extra) {
        for (const [key, value] of Object.entries(context.extra)) {
          scope.setExtra(key, value);
        }
      }
      if (context?.user) scope.setUser(context.user);
      Sentry.captureException(errorObj);
    });
  }
}

/**
 * Capture a message (non-exception event).
 * Useful for tracking important events like rate limiting, auth failures.
 */
export function captureMessage(message: string, context?: ErrorContext): void {
  const level = context?.level ?? "info";

  if (process.env.NODE_ENV === "development") {
    console.warn(`[Error Tracking] [${level.toUpperCase()}]`, message, context);
  } else {
    console.warn(
      JSON.stringify({
        level,
        message,
        ...(context?.tags && { tags: context.tags }),
        timestamp: new Date().toISOString(),
      })
    );
  }

  // Forward to Sentry synchronously
  const Sentry = getSentry();
  if (Sentry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Sentry.withScope((scope: any) => {
      if (context?.level) scope.setLevel(context.level);
      if (context?.tags) {
        for (const [key, value] of Object.entries(context.tags)) {
          scope.setTag(key, value);
        }
      }
      if (context?.extra) {
        for (const [key, value] of Object.entries(context.extra)) {
          scope.setExtra(key, value);
        }
      }
      Sentry.captureMessage(message);
    });
  }
}

/**
 * Helper to capture API route errors with standard context.
 * Call in catch blocks of API route handlers.
 */
export function captureApiError(
  error: unknown,
  route: string,
  method: string,
  extra?: Record<string, unknown>
): void {
  captureException(error, {
    tags: {
      boundary: "api",
      route,
      method,
    },
    extra: {
      ...extra,
      route,
      method,
    },
  });
}
