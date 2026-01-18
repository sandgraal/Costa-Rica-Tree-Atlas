# Authentication Implementation Guidelines

**Status:** Planning Document  
**Last Updated:** 2026-01-18  
**Purpose:** Proactive guidance to avoid common security and usability issues when implementing authentication features

## Overview

This document provides guidelines and issue prevention strategies for implementing authentication, MFA (Multi-Factor Authentication), and admin user management features in the Costa Rica Tree Atlas application.

## Critical Security Issues to Avoid

### 1. Environment Variable Validation

**Issue:** MFA crypto utilities and session handling may rely on optional environment variables that could cause runtime errors.

**Solutions:**

- Make `MFA_ENCRYPTION_KEY` required in the environment schema, OR
- Validate it once at application startup with a clear error message
- Validate `NEXTAUTH_SECRET` / `JWT_SECRET` at startup instead of returning null at runtime
- Use the existing Zod env schema pattern from `src/lib/env/schema.ts`

**Example:**

```typescript
// In src/lib/env/schema.ts
export const serverEnv = {
  // Make required if MFA features are enabled
  MFA_ENCRYPTION_KEY: z.string().min(32).optional(),
  // Or conditionally require based on feature flags:
  MFA_ENCRYPTION_KEY: process.env.ENABLE_MFA
    ? z.string().min(32)
    : z.string().optional(),
};
```

### 2. MFA Secret Encryption

**Issue:** MFA verification in NextAuth's `authorize` callback may use encrypted TOTP secrets directly without decryption.

**Solution:**

- Always decrypt TOTP secrets before verification using `decryptTotpSecret()`
- Maintain a single source of truth for MFA verification logic
- Consider routing MFA checks through `/api/auth/mfa/verify` endpoint
- Ensure consistency between setup and verification flows

**Example:**

```typescript
// WRONG - uses encrypted secret directly
const isValid = authenticator.verify({
  token: credentials.totpCode,
  secret: mfaSecret.totpSecret, // This is encrypted!
});

// RIGHT - decrypt before verifying
import { decryptTotpSecret } from "@/lib/auth/mfa-crypto";
const decryptedSecret = decryptTotpSecret(mfaSecret.totpSecret);
const isValid = authenticator.verify({
  token: credentials.totpCode,
  secret: decryptedSecret,
});
```

### 3. Backup Code Generation - Modulo Bias

**Issue:** Using `random % characters.length` introduces modulo bias in character selection, slightly weakening backup code security.

**Solution:**

Reject random values outside the largest multiple of `characters.length` that fits into 2^32:

```typescript
for (let k = 0; k < 4; k++) {
  // Avoid modulo bias by discarding values outside the largest multiple
  const maxUnbiased =
    Math.floor(2 ** 32 / characters.length) * characters.length;
  let randomIndex: number;

  // Extremely unlikely to iterate more than once
  while (true) {
    const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];
    if (randomValue < maxUnbiased) {
      randomIndex = randomValue % characters.length;
      break;
    }
  }

  // eslint-disable-next-line security/detect-object-injection
  segment += characters[randomIndex];
}
```

## Internationalization Issues to Avoid

### 4. Locale-Aware Redirects

**Issue:** Authentication redirects may ignore the user's current locale, breaking localized routing.

**Affected Areas:**

- Login page post-authentication redirects
- Unauthenticated access redirects
- Sign-out redirects
- Middleware authentication checks

**Solution:**

Always construct URLs using the current locale:

```typescript
// Get locale from route params
const { locale } = useParams<{ locale: string }>();

// Construct locale-aware paths
const loginPath = `/${locale}/admin/login`;
const callbackPath = `/${locale}/admin/images`;

// For redirects
router.push(`/${locale}/admin/images`);

// For NextAuth signOut
signOut({ callbackUrl: `/${locale}/admin/login` });

// For middleware redirects
nextRedirect(`/${locale}/admin/login`);
```

### 5. Preserve Full URL in Callback URLs

**Issue:** Using only `pathname` in redirects drops query strings, losing important state like filters or pagination.

**Solution:**

Preserve the full relative path including query parameters:

```typescript
// WRONG - loses query parameters
const callbackUrl = request.nextUrl.pathname;

// RIGHT - preserves full URL
const { pathname, search } = request.nextUrl;
const callbackUrl = pathname + search;

// Or using URL object
const url = new URL(request.url);
const callbackUrl = url.pathname + url.search;
```

### 6. Use CallbackUrl Instead of Hardcoded Redirects

**Issue:** Hardcoded post-login redirects (e.g., always to `/admin/images`) break deep-linking and expected "return to previous page" behavior.

**Solution:**

Read and respect the `callbackUrl` parameter:

```typescript
// In login page
const searchParams = useSearchParams();
const callbackUrl =
  searchParams.get("callbackUrl") || `/${locale}/admin/images`;

// After successful login
if (result?.ok) {
  router.push(callbackUrl);
  nextRouter.refresh();
}

// In middleware, set callbackUrl when redirecting to login
const loginUrl = new URL(`/${locale}/admin/login`, request.url);
loginUrl.searchParams.set("callbackUrl", pathname + search);
return NextResponse.redirect(loginUrl);
```

## Code Quality Issues to Avoid

### 7. Unused Translation Hooks

**Issue:** Admin components import `useTranslations` but don't use it, leaving hardcoded English strings.

**Solution:**

Either:

- Remove the unused hook import, OR
- Actually use translations for all user-facing text:

```typescript
// If using translations
const t = useTranslations("admin");
<button>{t("login.submit")}</button>;

// If not using translations (temporary)
// Remove the import entirely
// const t = useTranslations("admin"); // DELETE THIS LINE
```

### 8. Robust Locale Detection in Middleware

**Issue:** Hardcoded locale regex patterns become brittle as languages are added.

**Solution:**

Reuse the central i18n routing configuration:

```typescript
import { routing } from "./i18n/routing";

// Build regex from routing.locales
const localePattern = routing.locales.join("|");
const ADMIN_ROUTE_REGEX = new RegExp(`^/(${localePattern})/admin/`);

// Or use a utility function
import { getLocaleFromPath } from "@/lib/i18n/utils";
const locale = getLocaleFromPath(pathname);
```

## Implementation Checklist

When implementing authentication features, ensure:

- [ ] All environment variables are validated at startup
- [ ] MFA secrets are properly encrypted/decrypted
- [ ] Backup codes use unbiased random generation
- [ ] All redirects preserve locale and query parameters
- [ ] CallbackUrl is respected for post-login navigation
- [ ] Translations are either used or imports are removed
- [ ] Locale detection reuses central i18n configuration
- [ ] All auth flows support both English and Spanish
- [ ] Security best practices are followed (see SECURITY.md)
- [ ] Rate limiting is configured for auth endpoints

## Testing Checklist

- [ ] Test authentication with both `/en/` and `/es/` paths
- [ ] Verify deep links work (e.g., `/en/admin/users` → login → back to `/en/admin/users`)
- [ ] Test with query parameters preserved (e.g., `?page=2&filter=active`)
- [ ] Verify MFA setup and verification flows
- [ ] Test backup code generation for bias (statistical tests)
- [ ] Verify environment variable validation at startup
- [ ] Test sign-out from all sessions maintains locale

## Related Documentation

- [SECURITY.md](../SECURITY.md) - Comprehensive security measures
- [SECURITY_SETUP.md](./SECURITY_SETUP.md) - Security scanning setup
- [i18n Instructions](../.github/instructions/i18n.instructions.md) - Internationalization patterns

## References

- NextAuth.js documentation: https://next-auth.js.org/
- RFC 6238 (TOTP): https://tools.ietf.org/html/rfc6238
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
