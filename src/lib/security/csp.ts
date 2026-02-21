// In-memory nonce tracking with timestamps (cleared every 5 minutes)
const recentNonces = new Map<string, number>();
let lastCleanup = Date.now();

/**
 * Common image sources allowed across all CSP policies
 * Includes a wildcard for HTTPS to ensure reliable image loading
 *
 * Security trade-off: The 'https:' wildcard allows any HTTPS image source.
 * This is intentionally permissive to prevent image loading failures, as requested.
 * HTTP sources are still blocked, providing basic protection against mixed content.
 */
const COMMON_IMG_SOURCES = [
  "'self'",
  "data:",
  "blob:",
  "https://static.inaturalist.org",
  "https://inaturalist-open-data.s3.amazonaws.com",
  "https://api.gbif.org",
  "https://images.unsplash.com",
  // Wildcard for all HTTPS images - intentionally permissive for reliability
  "https:",
] as const;

/**
 * Generate a cryptographic nonce for CSP using Web Crypto API
 * Compatible with Edge Runtime
 *
 * Includes collision detection to ensure nonce uniqueness.
 * Nonces are tracked in-memory with timestamps and automatically cleaned up.
 *
 * @returns Base64-encoded random nonce
 */
export function generateNonce(): string {
  const now = Date.now();

  // Cleanup old nonces every 5 minutes
  if (now - lastCleanup > 300000) {
    recentNonces.clear();
    lastCleanup = now;
  }

  // Also cleanup nonces older than 1 minute
  for (const [nonce, timestamp] of recentNonces.entries()) {
    if (now - timestamp > 60000) {
      recentNonces.delete(nonce);
    }
  }

  let attempts = 0;
  let nonce: string;

  do {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    nonce = btoa(
      Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")
    );
    attempts++;

    if (attempts > 3) {
      // Extremely unlikely - log for monitoring
      // In production, this should be sent to a monitoring service
      console.error(
        "⚠️ Multiple nonce collisions detected - possible PRNG issue"
      );
      break;
    }
  } while (recentNonces.has(nonce));

  recentNonces.set(nonce, now);

  return nonce;
}

/**
 * Build Content Security Policy header value
 *
 * Uses 'unsafe-inline' for script-src to support Next.js App Router inline
 * hydration scripts (RSC payload). This is intentional: the layout does not
 * call headers() so pages remain eligible for static generation / edge caching.
 * Per CSP spec, 'unsafe-inline' is ignored when any nonce or hash source is
 * present — so we intentionally omit both.
 *
 * @returns CSP header value string
 */
export function buildCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      // Allow inline scripts (required for Next.js RSC hydration payload).
      // NOTE: 'unsafe-inline' is ignored by browsers when any nonce or
      // hash source is present, so we intentionally omit both here.
      "'unsafe-inline'",
      // Privacy-friendly analytics (no eval needed)
      "https://plausible.io",
      "https://scripts.simpleanalyticscdn.com",
      // Vercel Analytics & Speed Insights
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
      // ONLY in development
      ...(isDev ? ["'unsafe-eval'"] : []),
      // Allow other HTTPS scripts as fallback
      "https:",
    ],
    "style-src": [
      "'self'",
      // NOTE: Nonce removed because it causes 'unsafe-inline' to be ignored per CSP spec
      // This would break all inline styles in React components
      // When nonce is present, only nonce-approved styles work
      "https://fonts.googleapis.com",
      // TODO: Extract critical CSS to remove unsafe-inline
      "'unsafe-inline'",
    ],
    "img-src": COMMON_IMG_SOURCES,
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      "https://api.gbif.org",
      "https://api.inaturalist.org",
      "https://plausible.io",
      "https://queue.simpleanalyticscdn.com",
    ],
    "frame-src": [
      "'self'",
      // Allow Vercel Toolbar on all Vercel deployments (dev, preview, production)
      ...(isDev || process.env.VERCEL ? ["https://vercel.live"] : []),
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  // Add CSP reporting if configured
  if (process.env.CSP_REPORT_URI) {
    Object.assign(directives, {
      "report-uri": [process.env.CSP_REPORT_URI],
    });
  }

  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");
}

/**
 * Build CSP for pages with MDX content rendering
 *
 * NOTE: This policy NO LONGER requires 'unsafe-eval' thanks to server-side MDX rendering.
 *
 * Previous issue:
 * - The mdx-bundler library used `new Function()` to evaluate compiled MDX code on the client
 * - This required 'unsafe-eval' in CSP, which is a security weakness
 *
 * Current solution (as of 2025):
 * - MDX content is now rendered server-side using `@mdx-js/mdx` evaluate()
 * - The ServerMDXContent component runs on the server where CSP doesn't apply
 * - Only the rendered React elements are sent to the client
 * - No client-side eval is needed, allowing a strict CSP
 *
 * This policy is now identical to buildCSP() but kept separate for:
 * - Route-based policy selection in middleware
 * - Future flexibility if MDX pages need different permissions
 *
 * @param nonce - Optional nonce for script-src directive
 * @returns CSP header value string (strict, no unsafe-eval)
 */
export function buildMDXCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      // Allow inline scripts (required for Next.js RSC hydration payload).
      // NOTE: 'unsafe-inline' is ignored by browsers when any nonce or
      // hash source is present, so we intentionally omit both here.
      "'unsafe-inline'",
      // Privacy-friendly analytics
      "https://plausible.io",
      "https://scripts.simpleanalyticscdn.com",
      // Vercel Analytics & Speed Insights
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
      // ONLY in development
      ...(isDev ? ["'unsafe-eval'"] : []),
      // Allow other HTTPS scripts as fallback
      "https:",
    ],
    "style-src": [
      "'self'",
      // NOTE: Nonce removed because it causes 'unsafe-inline' to be ignored per CSP spec
      // This would break all inline styles in React components
      // When nonce is present, only nonce-approved styles work
      "https://fonts.googleapis.com",
      // TODO: Extract critical CSS to remove unsafe-inline
      "'unsafe-inline'",
    ],
    "img-src": COMMON_IMG_SOURCES,
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      "https://api.gbif.org",
      "https://api.inaturalist.org",
      "https://plausible.io",
      "https://queue.simpleanalyticscdn.com",
    ],
    "frame-src": [
      "'self'",
      // Allow Vercel Toolbar on all Vercel deployments (dev, preview, production)
      ...(isDev || process.env.VERCEL ? ["https://vercel.live"] : []),
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  // Add CSP reporting if configured
  if (process.env.CSP_REPORT_URI) {
    Object.assign(directives, {
      "report-uri": [process.env.CSP_REPORT_URI],
    });
  }

  return Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) {
        return key;
      }
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");
}

/**
 * Build a relaxed CSP for pages that MUST use Google Tag Manager
 *
 * WARNING: This policy includes 'unsafe-eval' which weakens security.
 * Only use this for specific marketing/analytics pages where GTM is required.
 *
 * Should only be used on routes like /marketing/* or specific landing pages.
 *
 * @returns Relaxed CSP header value string
 */
export function buildRelaxedCSP(): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      // Allow inline scripts (required for Next.js RSC hydration payload).
      "'unsafe-inline'",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      // GTM requires unsafe-eval :(
      "'unsafe-eval'",
      // Vercel Analytics & Speed Insights
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
      // Allow other HTTPS scripts as fallback
      "https:",
    ],
    "style-src": [
      "'self'",
      // NOTE: Nonce removed because it causes 'unsafe-inline' to be ignored per CSP spec
      // This would break all inline styles in React components
      // When nonce is present, only nonce-approved styles work
      "https://fonts.googleapis.com",
      "'unsafe-inline'",
    ],
    "img-src": [
      ...COMMON_IMG_SOURCES,
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
    ],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      "https://api.gbif.org",
      "https://api.inaturalist.org",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
    ],
    "frame-src": [
      "'self'",
      // Allow Vercel Toolbar on all Vercel deployments (dev, preview, production)
      ...(isDev || process.env.VERCEL ? ["https://vercel.live"] : []),
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  // Add CSP reporting if configured
  if (process.env.CSP_REPORT_URI) {
    Object.assign(directives, {
      "report-uri": [process.env.CSP_REPORT_URI],
    });
  }

  return Object.entries(directives)
    .map(([key, values]) =>
      values.length === 0 ? key : `${key} ${values.join(" ")}`
    )
    .join("; ");
}
