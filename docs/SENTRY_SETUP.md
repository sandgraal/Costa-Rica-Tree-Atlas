# Sentry Error Tracking Setup

## Overview

The Costa Rica Tree Atlas uses a provider-agnostic error tracking module
(`src/lib/error-tracking.ts`). All API routes and error boundaries report
through `captureApiError()` / `captureException()`.

By default `src/instrumentation.ts` installs a **structured console adapter**:
one JSON line per event on stderr, tagged `crta.error-tracking`, which is
greppable in the Vercel log stream. Sentry replaces that adapter; it is not a
prerequisite for having error visibility.

> **Historical note.** This document previously described
> `src/instrumentation.ts → Sentry.init`. That was never true: `register()` was
> an empty function, no adapter was ever registered, and
> `next.config.ts` set `removeConsole: true` in production — which stripped the
> console fallback as well. Production reported nothing at all. Both are fixed;
> `removeConsole` now excludes `error` and `warn`.

## Architecture

```
src/lib/error-tracking.ts    → Core module (captureException, captureMessage,
                               captureApiError, registerErrorTrackingAdapter)
src/instrumentation.ts       → Next.js server init; installs the default
                               console adapter (swap for Sentry.init here)
src/components/*ErrorBoundary → Client-side error boundaries → captureException
src/app/api/**               → API routes → captureApiError
```

## Quick Setup

### 1. Install Sentry SDK

```bash
npm install @sentry/nextjs
```

### 2. Set Environment Variables

Add to `.env.local` (development) or Vercel environment settings (production):

```env
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id
```

### 3. Done

The application will automatically:

- Initialize Sentry when the server starts (`src/instrumentation.ts`)
- Report all API route errors via `captureApiError()`
- Report client-side errors via error boundaries
- Log structured JSON in production, verbose output in development

## How It Works

### Without Sentry (default)

When `NEXT_PUBLIC_SENTRY_DSN` is not set:

- All errors are logged to stdout as structured JSON (production) or verbose console output (development)
- Error boundaries display fallback UI without reporting to external services
- Zero external dependencies, zero network requests

### With Sentry

When `NEXT_PUBLIC_SENTRY_DSN` is set and `@sentry/nextjs` is installed:

- Errors are reported to Sentry with tags, extra context, and user info
- Server-side: 10% trace sampling in production, 100% in development
- Sentry only initializes in production (`enabled: process.env.NODE_ENV === "production"`)

## API Route Pattern

All API routes use the same error handling pattern:

```typescript
import { captureApiError } from "@/lib/error-tracking";

export async function GET(request: NextRequest) {
  try {
    // ... route logic
  } catch (error) {
    captureApiError(error, "/api/route-name", "GET");
    return NextResponse.json({ error: "..." }, { status: 500 });
  }
}
```

The `captureApiError(error, route, method, extra?)` function:

1. Logs the error with route/method context
2. Reports to Sentry if configured (with `api_route` and `http_method` tags)
3. Works with any error type (Error objects, strings, unknown)

## Environment Variables

| Variable                 | Required | Description                                                  |
| ------------------------ | -------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SENTRY_DSN` | No       | Sentry Data Source Name. When not set, logs to console only. |

## Files Modified

- `src/lib/error-tracking.ts` — Core error tracking module
- `src/instrumentation.ts` — Next.js server initialization hook
- `src/app/api/**` — All API routes use `captureApiError()`
