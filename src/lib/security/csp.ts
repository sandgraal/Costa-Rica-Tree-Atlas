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

/** Optional per-directive overrides for building variant CSP policies */
interface CSPOverrides {
  /** Extra entries appended to script-src */
  extraScriptSrc?: string[];
  /** Extra entries appended to img-src */
  extraImgSrc?: string[];
  /** Extra entries appended to connect-src */
  extraConnectSrc?: string[];
}

/**
 * Build the base CSP directives shared by all policy tiers.
 *
 * Uses 'unsafe-inline' for script-src to support Next.js App Router inline
 * hydration scripts (RSC payload). Per CSP spec, 'unsafe-inline' is ignored
 * when any nonce or hash source is present — so we intentionally omit both.
 */
function buildBaseDirectives(
  overrides: CSPOverrides = {}
): Record<string, readonly string[]> {
  const isDev = process.env.NODE_ENV === "development";

  const directives: Record<string, readonly string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      // Privacy-friendly analytics
      "https://plausible.io",
      "https://scripts.simpleanalyticscdn.com",
      // Vercel Analytics & Speed Insights
      "https://va.vercel-scripts.com",
      "https://vitals.vercel-insights.com",
      // ONLY in development
      ...(isDev ? ["'unsafe-eval'"] : []),
      ...(overrides.extraScriptSrc ?? []),
    ],
    "style-src": [
      "'self'",
      "https://fonts.googleapis.com",
      // TODO: Extract critical CSS to remove unsafe-inline
      "'unsafe-inline'",
    ],
    "img-src": [...COMMON_IMG_SOURCES, ...(overrides.extraImgSrc ?? [])],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      "https://api.gbif.org",
      "https://api.inaturalist.org",
      "https://plausible.io",
      "https://queue.simpleanalyticscdn.com",
      ...(overrides.extraConnectSrc ?? []),
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
    (directives as Record<string, string[]>)["report-uri"] = [
      process.env.CSP_REPORT_URI,
    ];
  }

  return directives;
}

/** Serialize a directives map into a CSP header string */
function serializeCSP(directives: Record<string, readonly string[]>): string {
  return Object.entries(directives)
    .map(([key, values]) =>
      values.length === 0 ? key : `${key} ${values.join(" ")}`
    )
    .join("; ");
}

/**
 * Build Content Security Policy header value (strict).
 *
 * Used for most pages. No 'unsafe-eval' in production.
 *
 * @returns CSP header value string
 */
export function buildCSP(): string {
  return serializeCSP(buildBaseDirectives());
}

/**
 * Build CSP for pages with MDX content rendering.
 *
 * Server-side MDX rendering eliminated the need for 'unsafe-eval'.
 * Kept separate from buildCSP() for route-based policy selection
 * and future flexibility if MDX pages need different permissions.
 *
 * @returns CSP header value string (strict, no unsafe-eval in production)
 */
export function buildMDXCSP(): string {
  return serializeCSP(buildBaseDirectives());
}

/**
 * Build a relaxed CSP for pages that MUST use Google Tag Manager.
 *
 * WARNING: This policy includes 'unsafe-eval' which weakens security.
 * Only use this for specific marketing/analytics pages where GTM is required.
 *
 * @returns Relaxed CSP header value string
 */
export function buildRelaxedCSP(): string {
  return serializeCSP(
    buildBaseDirectives({
      extraScriptSrc: [
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        // GTM requires unsafe-eval :(
        "'unsafe-eval'",
      ],
      extraImgSrc: [
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
      ],
      extraConnectSrc: [
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
      ],
    })
  );
}
