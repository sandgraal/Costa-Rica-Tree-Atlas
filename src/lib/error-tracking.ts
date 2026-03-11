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

interface SentryScopeLike {
  setLevel?: (level: ErrorSeverity) => void;
  setTag?: (key: string, value: string) => void;
  setExtra?: (key: string, value: unknown) => void;
  setUser?: (user: { id?: string; email?: string }) => void;
}

interface SentryLike {
  withScope: (callback: (scope: SentryScopeLike) => void) => void;
  captureException: (error: Error) => void;
  captureMessage: (message: string) => void;
}

declare global {
  var __CRTA_SENTRY__: SentryLike | undefined;
}

/**
 * Read the optional Sentry adapter from the global runtime.
 * The server instrumentation hook can register it when the package exists.
 * This avoids bundler resolution failures in shared modules.
 */
function getSentry(): SentryLike | null {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return null;

  return globalThis.__CRTA_SENTRY__ ?? null;
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
    Sentry.withScope((scope) => {
      if (context?.level) scope.setLevel?.(context.level);
      if (context?.tags) {
        for (const [key, value] of Object.entries(context.tags)) {
          scope.setTag?.(key, value);
        }
      }
      if (context?.extra) {
        for (const [key, value] of Object.entries(context.extra)) {
          scope.setExtra?.(key, value);
        }
      }
      if (context?.user) scope.setUser?.(context.user);
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
    Sentry.withScope((scope) => {
      if (context?.level) scope.setLevel?.(context.level);
      if (context?.tags) {
        for (const [key, value] of Object.entries(context.tags)) {
          scope.setTag?.(key, value);
        }
      }
      if (context?.extra) {
        for (const [key, value] of Object.entries(context.extra)) {
          scope.setExtra?.(key, value);
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
