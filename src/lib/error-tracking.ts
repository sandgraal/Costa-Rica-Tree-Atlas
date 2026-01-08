/**
 * Log errors to tracking service
 * Currently logs to console, ready for Sentry/LogRocket integration
 */
export function logError(
  error: Error,
  context?: {
    componentName?: string;
    userId?: string;
    userAction?: string;
    [key: string]: unknown;
  }
) {
  if (process.env.NODE_ENV === "development") {
    console.error("Error logged:", { error, context });
    return;
  }

  // TODO: Send to error tracking service
  // Sentry.captureException(error, { extra: context });

  // TODO: Send to analytics
  // analytics.track('error', { error: error.message, ...context });
}

/**
 * Create error with additional context
 */
export class AppError extends Error {
  constructor(
    message: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}
