# Security Module

This module provides security utilities for hardening the application against common web vulnerabilities.

## Content Security Policy (CSP)

### Overview

The CSP module (`csp.ts`) provides utilities for generating and managing Content Security Policy headers to prevent XSS attacks and other code injection vulnerabilities.

### Functions

#### `generateNonce()`

Generates a cryptographically secure random nonce for use in CSP headers.

```typescript
import { generateNonce } from "@/lib/security/csp";

const nonce = generateNonce();
// Returns: Base64-encoded 16-byte random string (e.g., "mPpdj+xX0CfKcPRSvldgqg==")
```

**Use case**: Include nonces in inline script tags for stronger CSP:

```tsx
const nonce = generateNonce();
return <script nonce={nonce}>// Inline script code</script>;
```

#### `buildCSP(nonce?)`

Builds a complete CSP header value with support for nonces and environment-specific policies.

```typescript
import { buildCSP } from "@/lib/security/csp";

// Basic usage (no nonce)
const csp = buildCSP();

// With nonce for inline scripts
const nonce = generateNonce();
const csp = buildCSP(nonce);
```

### CSP Directives

The generated CSP includes the following directives:

| Directive                   | Values                                                            | Purpose                               |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------- |
| `default-src`               | `'self'`                                                          | Default policy for all resource types |
| `script-src`                | `'self'`, analytics domains, maps API, `'unsafe-eval'` (dev only) | Control script sources                |
| `style-src`                 | `'self'`, `'unsafe-inline'`, Google Fonts                         | Control stylesheet sources            |
| `img-src`                   | `'self'`, `data:`, `blob:`, `https:`, `http:`                     | Control image sources                 |
| `font-src`                  | `'self'`, Google Fonts                                            | Control font sources                  |
| `connect-src`               | `'self'`, biodiversity APIs, analytics                            | Control AJAX/WebSocket sources        |
| `frame-src`                 | `'self'`                                                          | Control iframe sources                |
| `object-src`                | `'none'`                                                          | Disable plugins (Flash, Java, etc.)   |
| `base-uri`                  | `'self'`                                                          | Restrict base tag URLs                |
| `form-action`               | `'self'`                                                          | Restrict form submission targets      |
| `frame-ancestors`           | `'self'`                                                          | Control who can embed this site       |
| `upgrade-insecure-requests` | (no value)                                                        | Automatically upgrade HTTP to HTTPS   |

### Development vs Production

**Development Mode** (NODE_ENV=development):

- Includes `'unsafe-eval'` in `script-src` for Next.js Fast Refresh
- Suitable for local development

**Production Mode**:

- Removes `'unsafe-eval'` from `script-src`
- Maintains `'unsafe-inline'` in `style-src` (required for CSS-in-JS)
- Stronger security posture

### Allowed Third-Party Services

**Analytics Providers**:

- Plausible Analytics (`*.plausible.io`)
- Simple Analytics (`scripts.simpleanalyticscdn.com`, `queue.simpleanalyticscdn.com`)
- Google Analytics (`www.googletagmanager.com`, `www.google-analytics.com`)

**Maps**:

- Google Maps API (`maps.googleapis.com`)

**Biodiversity Data**:

- GBIF API (`api.gbif.org`)
- iNaturalist API (`api.inaturalist.org`)

**Fonts & Styles**:

- Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`)

### CSP Violation Reporting

Enable CSP violation reporting by setting the `CSP_REPORT_URI` environment variable:

```bash
CSP_REPORT_URI=/api/csp-report
```

When configured, CSP violations will be reported to the specified endpoint. The `buildCSP()` function automatically adds `report-uri` and `report-to` directives when this variable is set.

### Usage in next.config.ts

```typescript
import { buildCSP } from "./src/lib/security/csp";

const nextConfig = {
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: buildCSP(),
        },
      ],
    },
  ],
};
```

### Testing

The CSP implementation has been tested with:

- ✅ Next.js 16 (App Router with Turbopack)
- ✅ Plausible Analytics
- ✅ Simple Analytics
- ✅ Google Analytics (GA4)
- ✅ Google Maps JavaScript API
- ✅ Tailwind CSS 4
- ✅ next/image optimization
- ✅ MDX content rendering

### Security Considerations

1. **No unsafe-inline for scripts**: Scripts must be loaded from allowed sources or use nonces
2. **Nonce-based inline scripts**: Use `generateNonce()` for any inline script needs
3. **Style exceptions**: `'unsafe-inline'` is required for CSS-in-JS and Tailwind
4. **Image sources**: Broad policy allows images from any HTTPS source for content flexibility
5. **Development exceptions**: `'unsafe-eval'` only in development for Fast Refresh

### Migration from Inline CSP

If migrating from inline CSP definition:

**Before**:

```typescript
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' ..."
}
```

**After**:

```typescript
import { buildCSP } from './src/lib/security/csp';

{
  key: 'Content-Security-Policy',
  value: buildCSP()
}
```

### Future Enhancements

Potential improvements for the CSP module:

1. **Strict CSP**: Remove `'unsafe-inline'` from styles using hashed styles
2. **Per-page CSP**: Different policies for different route groups
3. **Report monitoring**: Integration with security monitoring services (Sentry, etc.)
4. **CSP Level 3**: Use `strict-dynamic` for better script control
5. **Trusted Types**: Prevent DOM XSS with Trusted Types API

## Related Documentation

- [SECURITY.md](../../SECURITY.md) - Complete security documentation
- [CSP Report API](../../src/app/api/csp-report/route.ts) - Violation reporting endpoint
