import { randomBytes } from "crypto";

/**
 * Generate a cryptographic nonce for CSP
 * @returns Base64-encoded random nonce
 */
export function generateNonce(): string {
  return randomBytes(16).toString("base64");
}

/**
 * Build Content Security Policy header value
 * NO unsafe-inline, NO unsafe-eval in production
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
      // Analytics - specific domains only
      "https://plausible.io",
      "https://scripts.simpleanalyticscdn.com",
      // Development only
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
