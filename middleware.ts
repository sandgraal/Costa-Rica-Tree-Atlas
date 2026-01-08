import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { constantTimeRateLimitCheck } from "@/lib/auth/constant-time-ratelimit";
import { secureCompare } from "@/lib/auth/secure-compare";
import { serverEnv } from "@/lib/env/schema";
import { generateNonce, buildCSP } from "@/lib/security/csp";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Generate nonce for this request
  const nonce = generateNonce();

  // Check if this is an admin route
  // Note: Locale pattern matches routing.locales from i18n/routing.ts
  if (pathname.match(/^\/(en|es)\/admin\//)) {
    // 1. HTTPS enforcement in production
    if (
      process.env.NODE_ENV === "production" &&
      request.headers.get("x-forwarded-proto") !== "https"
    ) {
      return new NextResponse("HTTPS required", { status: 403 });
    }

    // 2. Check if admin is configured
    const adminPassword = serverEnv.ADMIN_PASSWORD;
    const adminUsername = serverEnv.ADMIN_USERNAME;

    // With validation, these can never be undefined

    // 3. Rate limiting check
    const rateLimitResult = await constantTimeRateLimitCheck(request);

    if (!rateLimitResult.allowed) {
      // Rate limit exceeded - return generic error
      return new NextResponse("Too many requests. Please try again later.", {
        status: 429,
        headers: {
          "Retry-After": rateLimitResult.retryAfter.toString(),
          "Content-Type": "text/plain",
          // NO X-RateLimit-Remaining header!
        },
      });
    }

    // 4. Check authentication
    const basicAuth = request.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      if (authValue) {
        try {
          const decoded = atob(authValue);
          const colonIndex = decoded.indexOf(":");

          if (colonIndex !== -1) {
            const user = decoded.substring(0, colonIndex);
            const pwd = decoded.substring(colonIndex + 1);

            // CRITICAL: Check BOTH credentials ALWAYS, regardless of individual results
            // This prevents timing attacks and username enumeration
            const userValid = secureCompare(user, adminUsername);
            const pwdValid = secureCompare(pwd, adminPassword);

            // IMPORTANT: Both comparisons above are evaluated before this check
            // This ensures consistent timing regardless of which credential is wrong
            const isAuthenticated = userValid && pwdValid;

            if (isAuthenticated) {
              // Authentication successful
              const response = intlMiddleware(request);

              // Add security headers
              const csp = buildCSP(nonce);
              response.headers.set("Content-Security-Policy", csp);
              response.headers.set("X-Content-Type-Options", "nosniff");
              response.headers.set("X-Frame-Options", "SAMEORIGIN");
              response.headers.set("X-Nonce", nonce);

              return response;
            }
          }
        } catch (error) {
          // Invalid base64 or malformed auth header
          console.error("Auth parsing error:", error);
        }
      }
    }

    // 5. Authentication failed - return GENERIC error with NO details
    // Do NOT include rate limit remaining in the response (prevents enumeration)
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
        "Content-Type": "text/plain",
        // DO NOT include X-RateLimit-Remaining here!
      },
    });
  }

  // For non-admin routes, use i18n middleware with security headers
  const response = intlMiddleware(request);

  // Add security headers
  const csp = buildCSP(nonce);
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Nonce", nonce);

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(en|es)/:path*",
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
