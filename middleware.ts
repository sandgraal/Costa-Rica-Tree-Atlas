import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAuthRateLimit } from "@/lib/auth/rate-limit";
import { secureCompare } from "@/lib/auth/secure-compare";
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
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";

    if (!adminPassword) {
      return new NextResponse(
        "Admin access disabled - ADMIN_PASSWORD not configured",
        { status: 503 }
      );
    }

    // 3. Rate limiting check
    const rateLimitResult = await checkAuthRateLimit(request);

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return new NextResponse(
        "Too many login attempts. Please try again later.",
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Remaining": "0",
            "Content-Type": "text/plain",
          },
        }
      );
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

            // Use constant-time comparison to prevent timing attacks
            const userValid = secureCompare(user, adminUsername);
            const pwdValid = secureCompare(pwd, adminPassword);

            if (userValid && pwdValid) {
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

    // 5. Authentication failed - generic error message
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
        "Content-Type": "text/plain",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
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
