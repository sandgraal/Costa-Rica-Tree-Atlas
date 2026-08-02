/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the Next.js server starts.
 *
 * This file used to be an empty `register()`. Combined with
 * `compiler.removeConsole: true`, that meant production had no error visibility
 * at all: `src/lib/error-tracking.ts` degrades to `console.error`, and every
 * `console.*` was stripped from the production bundle.
 *
 * We now install a structured console adapter unconditionally. It is not a
 * replacement for a hosted error tracker, but it guarantees that every
 * `captureException` / `captureApiError` call produces one parseable JSON line
 * in the platform log stream (Vercel, Docker, or a local terminal) instead of
 * vanishing.
 *
 * To forward to Sentry instead, install `@sentry/nextjs` and replace
 * `installConsoleErrorTracking()` with `Sentry.init(...)` plus an adapter that
 * wraps the Sentry SDK. See docs/SENTRY_SETUP.md.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
import { installConsoleErrorTracking } from "@/lib/error-tracking";

export async function register() {
  installConsoleErrorTracking();
}
