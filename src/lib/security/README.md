# Security Module

This module provides security utilities for hardening the application against common web vulnerabilities.

## Content Security Policy (CSP)

### Overview

The CSP module (`csp.ts`) provides utilities for generating and managing Content Security Policy headers to prevent XSS attacks and other code injection vulnerabilities.

### Functions

#### `buildCSP()`

Builds a complete CSP header value with environment-specific policies.

```typescript
import { buildCSP } from "@/lib/security/csp";

const csp = buildCSP();
```

#### `buildMDXCSP()`

Builds a CSP tailored for pages with MDX content. Currently delegates to `buildCSP()` but kept separate for route-based policy selection and future flexibility.

```typescript
import { buildMDXCSP } from "@/lib/security/csp";

const csp = buildMDXCSP();
```

#### `buildRelaxedCSP()`

Builds a relaxed CSP for pages requiring Google Tag Manager. Adds GTM/GA domains and `'unsafe-eval'`.

```typescript
import { buildRelaxedCSP } from "@/lib/security/csp";

const csp = buildRelaxedCSP();
```

### CSP Directives

The generated CSP includes the following directives:

| Directive                   | Values                                                                    | Purpose                                                     |
| --------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `default-src`               | `'self'`                                                                  | Default policy for all resource types                       |
| `script-src`                | `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, analytics domains, maps API | Control script sources                                      |
| `style-src`                 | `'self'`, `'unsafe-inline'`, Google Fonts                                 | Control stylesheet sources (unsafe-inline required by Next) |
| `img-src`                   | `'self'`, `data:`, `blob:`, `https:`                                      | Control image sources (HTTPS only enforced)                 |
| `font-src`                  | `'self'`, Google Fonts                                                    | Control font sources                                        |
| `connect-src`               | `'self'`, biodiversity APIs, analytics                                    | Control AJAX/WebSocket sources                              |
| `frame-src`                 | `'self'`                                                                  | Control iframe sources                                      |
| `object-src`                | `'none'`                                                                  | Disable plugins (Flash, Java, etc.)                         |
| `base-uri`                  | `'self'`                                                                  | Restrict base tag URLs                                      |
| `form-action`               | `'self'`                                                                  | Restrict form submission targets                            |
| `frame-ancestors`           | `'self'`                                                                  | Control who can embed this site                             |
| `upgrade-insecure-requests` | (no value)                                                                | Automatically upgrade HTTP to HTTPS                         |

### Development vs Production

**Development and Production Modes**:

- Includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src` for Next.js RSC and third-party analytics
- Suitable for both local development and production deployment
- Maintains consistent behavior across environments

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

1. **Inline scripts policy**: Production strict and MDX CSP variants avoid `'unsafe-eval'` and minimize `'unsafe-inline'` where possible. `'unsafe-inline'` is still allowed for certain Next.js runtime scripts, and `'unsafe-eval'` is only enabled in development and in the optional relaxed policy for specific third-party analytics that require it.
2. **Style exceptions**: `'unsafe-inline'` is required for inline styles from Next.js and React components
3. **Image sources**: HTTPS-only policy enforced via `upgrade-insecure-requests` directive
4. **Domain allowlist**: Specific third-party domains are explicitly allowed (analytics, maps, APIs)
5. **CSP reporting**: Uses `report-uri` directive (modern `report-to` requires additional Report-To header)

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
3. **Report monitoring**: Integration with security monitoring services
4. **CSP Level 3**: Use `strict-dynamic` for better script control
5. **Trusted Types**: Prevent DOM XSS with Trusted Types API

## Related Documentation

- [SECURITY.md](../../SECURITY.md) - Complete security documentation
- [CSP Report API](../../src/app/api/csp-report/route.ts) - Violation reporting endpoint
