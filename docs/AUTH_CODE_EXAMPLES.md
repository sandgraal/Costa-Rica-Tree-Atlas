# Authentication Code Examples

**Purpose:** Reference implementations demonstrating correct patterns for avoiding the issues identified in code review

## Table of Contents

1. [Middleware - URL Preservation](#middleware---url-preservation)
2. [Login Page - CallbackUrl Handling](#login-page---callbackurl-handling)
3. [NextAuth Route - MFA Verification](#nextauth-route---mfa-verification)
4. [User Management - Locale-Aware Sign Out](#user-management---locale-aware-sign-out)
5. [Admin Page - Locale-Aware Redirects](#admin-page---locale-aware-redirects)
6. [MFA Crypto - Unbiased Random Generation](#mfa-crypto---unbiased-random-generation)

---

## Middleware - URL Preservation

**Issue:** Preserve full original URL (including query) in callbackUrl and ensure locale handling is robust.

**Correct Implementation:**

```typescript
// src/middleware.ts (authentication portion)
import { routing } from "./i18n/routing";

// Build regex from routing.locales for consistency
const localePattern = routing.locales.join("|");
const ADMIN_ROUTE_REGEX = new RegExp(`^/(${localePattern})/admin/`);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search; // Query string

  // Check if this is an admin route
  if (ADMIN_ROUTE_REGEX.test(pathname)) {
    // Check authentication...
    const session = await getServerSession(authOptions);

    if (!session) {
      // Preserve FULL URL including query parameters
      const fullPath = pathname + search;

      // Extract locale from pathname using central i18n utility
      const localeMatch = pathname.match(new RegExp(`^/(${localePattern})/`));
      const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

      // Construct login URL with callback
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", fullPath);

      return NextResponse.redirect(loginUrl);
    }
  }

  // Continue with i18n middleware
  return intlMiddleware(request);
}
```

**Key Points:**

- Uses `pathname + search` to preserve query parameters
- Uses central `routing.locales` configuration instead of hardcoded regex
- Constructs callback URL with full relative path
- Extracts locale from path using the same pattern

---

## Login Page - CallbackUrl Handling

**Issue:** Use NextAuth callbackUrl instead of hardcoding the post-login redirect.

**Correct Implementation:**

```typescript
// src/app/[locale]/admin/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams, useParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useParams<{ locale: string }>();

  // State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  // CORRECT: Read callbackUrl from query params, with locale-aware fallback
  const callbackUrl =
    searchParams.get("callbackUrl") || `/${locale}/admin/images`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        totpCode: mfaRequired ? totpCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "MFA_REQUIRED") {
          setMfaRequired(true);
          setError("Please enter your 2FA code");
        } else {
          setError("Invalid credentials. Please try again.");
        }
      } else if (result?.ok) {
        // CORRECT: Use callbackUrl from params, not hardcoded path
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields... */}
    </form>
  );
}
```

**Key Points:**

- Reads `callbackUrl` from search params
- Falls back to locale-aware default (`/${locale}/admin/images`)
- Never hardcodes the redirect destination
- Preserves deep-linking and "return to previous page" behavior

---

## NextAuth Route - MFA Verification

**Issue:** MFA verification uses encrypted secret directly; should decrypt before verification.

**Correct Implementation:**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticator } from "otplib";
import { decryptTotpSecret } from "@/lib/auth/mfa-crypto";

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
        totpCode: { type: "text", optional: true },
      },
      async authorize(credentials) {
        // ... username and password verification ...

        // Check if MFA is enabled
        if (user.mfaEnabled) {
          if (!credentials.totpCode) {
            throw new Error("MFA_REQUIRED");
          }

          const mfaSecret = user.mfaSecrets[0];

          if (!mfaSecret || !mfaSecret.totpSecret) {
            throw new Error("MFA configuration error");
          }

          // CORRECT: Decrypt TOTP secret before verification
          const decryptedSecret = decryptTotpSecret(mfaSecret.totpSecret);

          const isValidTotp = authenticator.verify({
            token: credentials.totpCode,
            secret: decryptedSecret, // Use decrypted secret
          });

          if (!isValidTotp) {
            // Also check backup codes
            const isValidBackup = await verifyBackupCode(
              user.id,
              credentials.totpCode
            );

            if (!isValidBackup) {
              throw new Error("Invalid 2FA code");
            }
          }
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**Alternative Approach (Recommended):**

Route MFA verification through dedicated endpoint for single source of truth:

```typescript
// In authorize callback
if (user.mfaEnabled) {
  if (!credentials.totpCode) {
    throw new Error("MFA_REQUIRED");
  }

  // Delegate to dedicated MFA verification endpoint
  const mfaResult = await fetch("/api/auth/mfa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      totpCode: credentials.totpCode,
    }),
  });

  if (!mfaResult.ok) {
    throw new Error("Invalid 2FA code");
  }
}
```

**Key Points:**

- Always decrypt TOTP secrets before verification using `decryptTotpSecret()`
- Maintain consistency between setup and verification flows
- Consider using dedicated MFA verification endpoint for single source of truth

---

## User Management - Locale-Aware Sign Out

**Issue:** Preserve locale (and optionally target page) when signing out of all sessions.

**Correct Implementation:**

```typescript
// src/app/[locale]/admin/users/UserManagementClient.tsx
"use client";

import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface UserManagementClientProps {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export function UserManagementClient({ user }: UserManagementClientProps) {
  const { locale } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState(false);

  // CORRECT: Preserve locale when signing out
  const handleSignOutAllSessions = async (targetPath?: string) => {
    try {
      setLoading(true);

      // Construct locale-aware login path
      const localeLoginPath = `/${locale}/admin/login`;

      // If a target path is provided, include it as callbackUrl
      const callbackUrl = targetPath
        ? `/${locale}${targetPath.startsWith("/") ? targetPath : `/${targetPath}`}`
        : localeLoginPath;

      await signOut({
        callbackUrl, // Locale-aware callback
      });
    } catch (error) {
      console.error("Error signing out of all sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>User Management</h2>

      <button
        type="button"
        onClick={() => handleSignOutAllSessions("/admin")}
        disabled={loading}
        className="btn"
      >
        Sign out of all sessions
      </button>
    </div>
  );
}
```

**Key Points:**

- Uses `useParams` to get current locale
- Constructs locale-aware callback URLs
- Supports optional target path for returning to specific admin page
- Never hardcodes `/admin/login` without locale prefix

---

## Admin Page - Locale-Aware Redirects

**Issue:** Use locale-aware redirect for unauthenticated access to admin pages.

**Correct Implementation:**

```typescript
// src/app/[locale]/admin/users/page.tsx
import { getServerSession } from "next-auth";
import { redirect as nextRedirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function UsersPage({ params }: PageProps) {
  // Await params to get locale
  const { locale } = await params;

  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    // CORRECT: Use locale-aware redirect
    nextRedirect(`/${locale}/admin/login`);
  }

  // Render page content...
  return (
    <div>
      <h1>User Management</h1>
      {/* Page content */}
    </div>
  );
}
```

**Key Points:**

- Gets `locale` from `params` prop
- Constructs redirect URL with locale prefix
- Never uses hardcoded `/admin/login`
- Maintains localized routing throughout the app

---

## MFA Crypto - Unbiased Random Generation

**Issue:** Using `random % characters.length` introduces modulo bias in character selection.

**Correct Implementation:**

```typescript
// src/lib/auth/mfa-crypto.ts

/**
 * Generate backup codes with unbiased random character selection
 * Format: XXXX-XXXX-XXXX (12 characters total)
 */
export function generateBackupCodes(count: number = 10): string[] {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars (no 0, O, 1, I for clarity)
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const segments: string[] = [];

    for (let j = 0; j < 3; j++) {
      let segment = "";

      for (let k = 0; k < 4; k++) {
        // CORRECT: Avoid modulo bias by rejecting values outside largest multiple
        const maxUnbiased =
          Math.floor(2 ** 32 / characters.length) * characters.length;
        let randomIndex: number;

        // This loop is extremely unlikely to iterate more than once
        // since the discarded range is strictly less than characters.length
        while (true) {
          const randomValue = crypto.getRandomValues(new Uint32Array(1))[0];

          if (randomValue < maxUnbiased) {
            randomIndex = randomValue % characters.length;
            break;
          }
          // If randomValue >= maxUnbiased, discard it and try again
        }

        // eslint-disable-next-line security/detect-object-injection
        segment += characters[randomIndex];
      }

      segments.push(segment);
    }

    codes.push(segments.join("-"));
  }

  return codes;
}

/**
 * Hash backup code before storing in database
 */
export async function hashBackupCode(code: string): Promise<string> {
  // Use Argon2id for backup code hashing
  const argon2 = await import("argon2");

  return argon2.hash(code, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verify backup code against hash
 */
export async function verifyBackupCode(
  code: string,
  hash: string
): Promise<boolean> {
  const argon2 = await import("argon2");
  return argon2.verify(hash, code);
}
```

**Why This Matters:**

Without bias correction:

- Some characters appear slightly more often than others
- Reduces effective entropy of backup codes
- Makes brute-force attacks marginally easier

With bias correction:

- All characters have equal probability
- Maximum entropy for given code length
- Stronger security against brute-force attacks

**Performance Impact:**

- Negligible - rejection sampling has < 1% retry rate
- For 32-character alphabet, discarded range is only ~1.6% of total range
- Expected iterations per character: 1.016

---

## Environment Variable Validation

**Best Practice:** Validate all critical environment variables at startup.

```typescript
// src/lib/env/schema.ts
import { z } from "zod";

const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth - REQUIRED
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url(),

  // MFA - REQUIRED if MFA features are enabled
  MFA_ENCRYPTION_KEY: z
    .string()
    .min(32, "MFA_ENCRYPTION_KEY must be at least 32 characters"),

  // Admin (legacy) - OPTIONAL
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

// Validate at module load time (fails fast)
export const serverEnv = serverEnvSchema.parse(process.env);
```

**Key Points:**

- Fails at startup, not at runtime
- Clear error messages indicate which variables are invalid
- Prevents runtime null/undefined errors
- Documents required environment configuration

---

## Translation Hooks

**Issue:** Don't import translation hooks if not using them.

**Option 1: Use Translations (Preferred)**

```typescript
"use client";

import { useTranslations } from "next-intl";

export default function AdminLoginPage() {
  const t = useTranslations("admin");

  return (
    <div>
      <h1>{t("login.title")}</h1>
      <button>{t("login.submit")}</button>
      <p>{t("login.forgotPassword")}</p>
    </div>
  );
}
```

**Option 2: Remove Unused Import**

```typescript
"use client";

// If not using translations, don't import the hook
// import { useTranslations } from "next-intl"; // REMOVE THIS

export default function AdminLoginPage() {
  return (
    <div>
      <h1>Admin Login</h1>
      <button>Log In</button>
      <p>Forgot password?</p>
    </div>
  );
}
```

**Key Points:**

- Either use translations or remove the import
- Don't leave unused imports in production code
- Consider long-term i18n strategy for admin pages

---

## Summary

All examples above demonstrate the CORRECT implementations that avoid the issues identified in the code review:

1. ✅ Preserve full URL with query parameters in callbackUrl
2. ✅ Use callbackUrl from params instead of hardcoding
3. ✅ Decrypt MFA secrets before verification
4. ✅ Preserve locale in sign-out redirects
5. ✅ Use locale-aware redirects in server components
6. ✅ Avoid modulo bias in random generation
7. ✅ Validate environment variables at startup
8. ✅ Remove unused translation imports or actually use them

These patterns should be followed when implementing authentication features.
