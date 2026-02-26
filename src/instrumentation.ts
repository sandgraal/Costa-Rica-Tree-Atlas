/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the Next.js server starts. Used to initialize
 * monitoring and error tracking services.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Initialize Sentry on the server side when DSN is configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    try {
      // Dynamic require to avoid compile-time resolution —
      // @sentry/nextjs may not be installed yet
      const sentryModule = "@sentry/nextjs";
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require(sentryModule) as {
        init: (options: Record<string, unknown>) => void;
      };

      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        // Capture 10% of transactions for performance monitoring
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        // Only send errors in production
        enabled: process.env.NODE_ENV === "production",
      });

      console.info("[Sentry] Initialized successfully");
    } catch {
      // @sentry/nextjs not installed — running without error tracking
      // This is expected until the package is installed
    }
  }
}
