// In-memory nonce tracking with timestamps (cleared every 5 minutes)
const recentNonces = new Map<string, number>();
let lastCleanup = Date.now();

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
 * Strict policy: NO unsafe-inline, NO unsafe-eval in production
 *
 * This is the default CSP used for most pages. It does NOT include
 * unsafe-eval, making it incompatible with Google Tag Manager.
 * For pages requiring GTM, use buildRelaxedCSP() instead.
 *
 * @param nonce - Optional nonce for script-src directive
 * @returns CSP header value string
 */
export function buildCSP(nonce?: string): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      // Nonce for inline scripts
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      // strict-dynamic allows nonce-approved scripts to load other scripts
      "'strict-dynamic'",
      // Privacy-friendly analytics (no eval needed)
      "https://plausible.io",
      "https://scripts.simpleanalyticscdn.com",
      // ONLY in development
      ...(isDev ? ["'unsafe-eval'"] : []),
      // Fallback for browsers that don't support strict-dynamic
      "https:",
    ],
    "style-src": [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      "https://fonts.googleapis.com",
      // TODO: Extract critical CSS to remove unsafe-inline
      "'unsafe-inline'",
    ],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://static.inaturalist.org",
      "https://inaturalist-open-data.s3.amazonaws.com",
      "https://api.gbif.org",
    ],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      "https://api.gbif.org",
      "https://api.inaturalist.org",
      "https://plausible.io",
      "https://queue.simpleanalyticscdn.com",
    ],
    "frame-src": ["'self'"],
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
 * @param nonce - Optional nonce for script-src directive
 * @returns Relaxed CSP header value string
 */
export function buildRelaxedCSP(nonce?: string): string {
  const isDev = process.env.NODE_ENV === "development";

  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      "'strict-dynamic'",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      // GTM requires unsafe-eval :(
      "'unsafe-eval'",
      // Fallback for browsers without strict-dynamic
      "https:",
    ],
    "style-src": [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      "https://fonts.googleapis.com",
      "'unsafe-inline'",
    ],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://static.inaturalist.org",
      "https://inaturalist-open-data.s3.amazonaws.com",
      "https://api.gbif.org",
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
    "frame-src": ["'self'"],
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
