/**
 * Error Tracking Utility
 *
 * Provides centralized error capture for error boundaries, API routes,
 * and other handlers. Supports an optional error-tracking adapter when
 * one is registered by the runtime.
 *
 * Without an adapter: logs errors to console with structured context.
 * With an adapter: forwards events while still logging locally.
 */

type ErrorSeverity = "fatal" | "error" | "warning" | "info";

type ErrorTrackingScope = {
  setLevel: (level: ErrorSeverity) => void;
  setTag: (key: string, value: string) => void;
  setExtra: (key: string, value: unknown) => void;
  setUser: (user: { id?: string; email?: string }) => void;
};

type ErrorTrackingAdapter = {
  withScope: (callback: (scope: ErrorTrackingScope) => void) => void;
  captureException: (error: Error) => void;
  captureMessage: (message: string) => void;
};

interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; email?: string };
  level?: ErrorSeverity;
}

const errorTrackingGlobal = globalThis as typeof globalThis & {
  __CRTA_ERROR_TRACKING_ADAPTER__?: ErrorTrackingAdapter;
};

/**
 * Resolve the optional error-tracking adapter registered by the runtime.
 * Returns null when no adapter is installed.
 */
function getErrorTrackingAdapter(): ErrorTrackingAdapter | null {
  return errorTrackingGlobal.__CRTA_ERROR_TRACKING_ADAPTER__ ?? null;
}

/**
 * Capture an exception and log it.
 * Called by ErrorBoundary, ComponentErrorBoundary, ImageErrorBoundary,
 * global-error.tsx, and API route catch blocks.
 *
 * When an adapter is configured, the error is forwarded with
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

  // Forward to an optional adapter synchronously
  const adapter = getErrorTrackingAdapter();
  if (adapter) {
    adapter.withScope((scope) => {
      if (context?.level) scope.setLevel(context.level);
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
      if (context?.user) scope.setUser(context.user);
      adapter.captureException(errorObj);
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

  // Forward to an optional adapter synchronously
  const adapter = getErrorTrackingAdapter();
  if (adapter) {
    adapter.withScope((scope) => {
      if (context?.level) scope.setLevel(context.level);
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
      adapter.captureMessage(message);
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
