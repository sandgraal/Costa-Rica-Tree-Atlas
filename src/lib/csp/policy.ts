/**
 * Generate Content Security Policy with nonce
 */
export function generateCSP(nonce: string): string {
  const policy = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'", // Allows dynamically created scripts by nonce scripts
      "https://plausible.io",
      "https://scripts.simpleanalyticscdn.com",
      "https://www.googletagmanager.com",
      "https://maps.googleapis.com", // Google Maps
      "https://va.vercel-scripts.com", // Vercel Analytics
    ],
    "style-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "https://fonts.googleapis.com",
    ],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://static.inaturalist.org",
      "https://inaturalist-open-data.s3.amazonaws.com",
      "https://api.gbif.org",
      "https://images.unsplash.com",
      "https://maps.googleapis.com",
      "https://maps.gstatic.com",
    ],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      "https://api.gbif.org",
      "https://api.inaturalist.org",
      "https://plausible.io",
      "https://queue.simpleanalyticscdn.com",
      "https://www.google-analytics.com",
      "https://maps.googleapis.com",
      "https://vision.googleapis.com", // Vision API
      "https://vitals.vercel-insights.com", // Vercel Speed Insights
    ],
    "frame-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
    "upgrade-insecure-requests": [],
    "report-uri": ["/api/csp-report"], // CSP violation reporting
  };

  return Object.entries(policy)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}
