# Content Security Policy (CSP) Configuration

## Overview

This document explains the Content Security Policy configuration for the Costa Rica Tree Atlas application.

## CSP Variants

The application uses three different CSP configurations depending on the route:

### 1. Strict CSP (`buildCSP()`)

**Used for:** Most pages (home, about, favorites, etc.)

**Security level:** Highest - No `unsafe-eval`, no `unsafe-inline` for scripts

**Features:**

- Nonce-based script execution
- `strict-dynamic` for script loading
- No eval or Function constructor allowed

### 2. MDX CSP (`buildMDXCSP()`)

**Used for:** Tree detail pages (`/[locale]/trees/[slug]`)

**Security level:** Medium - Requires `unsafe-eval` for MDX rendering

**Why unsafe-eval is needed:**

- MDX content is compiled to JavaScript at build time by `mdx-bundler`
- The library uses `new Function()` to evaluate the compiled code
- This is a controlled use case - we compile the MDX ourselves at build time
- The code is NOT user-generated or from untrusted sources
- MDX source files are part of our codebase (`content/trees/*.mdx`)

**Alternative approaches considered:**

- Migrate to `@next/mdx` (may not require unsafe-eval)
- Pre-render all MDX to static HTML (loses dynamic features)
- Use a different MDX runtime that doesn't use Function constructor

### 3. Relaxed CSP (`buildRelaxedCSP()`)

**Used for:** Marketing pages (`/[locale]/marketing/*`)

**Security level:** Lowest - Includes `unsafe-eval` for Google Tag Manager

**Why unsafe-eval is needed:**

- Google Tag Manager requires it for tag execution
- Only used on specific marketing/analytics pages

## Route Matching

The middleware (`middleware.ts`) applies CSP based on URL patterns:

```typescript
if (pathname.match(new RegExp(`^/(${localePattern})/marketing/`))) {
  // Relaxed CSP for GTM
  csp = buildRelaxedCSP(nonce);
} else if (
  pathname.match(new RegExp(`^/(${localePattern})/trees/[a-zA-Z0-9-]+/?$`))
) {
  // MDX CSP for tree detail pages
  csp = buildMDXCSP(nonce);
} else {
  // Strict CSP for everything else
  csp = buildCSP(nonce);
}
```

## Security Best Practices

### What we DO

1. **Nonce-based script execution:** All inline scripts use cryptographic nonces
2. **No inline event handlers:** No `onclick=`, `onerror=`, etc. in HTML
3. **No string-based eval:** No `setTimeout(string)` or `eval()` in our code
4. **strict-dynamic:** Allows nonce-approved scripts to load other scripts safely

### What we AVOID

1. **Broad `unsafe-inline`:** Only used for styles (TODO: extract critical CSS)
2. **Broad `unsafe-eval`:** Only on specific routes that require it
3. **Inline event handlers:** All events use addEventListener or React handlers
4. **String-based code execution:** All functions use proper callbacks

## Testing CSP

To test CSP headers in production:

```bash
# Build the project
npm run build

# Start production server
npm start

# Check CSP on tree detail page (should have unsafe-eval)
curl -I http://localhost:3000/en/trees/ceiba | grep content-security

# Check CSP on home page (should NOT have unsafe-eval)
curl -I http://localhost:3000/en | grep content-security
```

## Future Improvements

1. **Remove unsafe-inline for styles:** Extract critical CSS to eliminate need
2. **Evaluate MDX alternatives:** Research CSP-compatible MDX runtimes
3. **CSP reporting:** Configure `CSP_REPORT_URI` environment variable
4. **Monitor violations:** Set up monitoring for CSP violation reports

## References

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [mdx-bundler documentation](https://github.com/kentcdodds/mdx-bundler)
