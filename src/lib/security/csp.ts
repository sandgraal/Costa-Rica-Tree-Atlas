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
 * @param nonce - Optional nonce for script-src directive
 * @returns CSP header value string
 */
export function buildCSP(nonce?: string): string {
  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      ...(nonce ? [`'nonce-${nonce}'`] : []),
      // Required for Next.js 16 RSC hydration and third-party script execution
      // Note: 'unsafe-inline' and 'unsafe-eval' required for:
      // - Next.js React Server Components
      // - Analytics providers (GTM, Simple Analytics, Plausible) use eval for tracking
      // Additional flexibility for third-party integrations
      "'unsafe-inline'",
      "'unsafe-eval'",
      // Analytics providers
      "https://*.plausible.io",
      "https://scripts.simpleanalyticscdn.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      // Maps
      "https://maps.googleapis.com",
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for inline styles from Next.js and React components
      "https://fonts.googleapis.com",
    ],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      // Biodiversity APIs
      "https://api.gbif.org",
      "https://api.inaturalist.org",
      // Analytics
      "https://*.plausible.io",
      "https://queue.simpleanalyticscdn.com",
      "https://www.google-analytics.com",
      // Maps
      "https://maps.googleapis.com",
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
