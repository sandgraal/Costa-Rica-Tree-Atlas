/**
 * Copyright (c) 2024-present sandgraal
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This file is part of Costa Rica Tree Atlas.
 * See LICENSE file in the project root for full license information.
 */

/**
 * Middleware for authentication, internationalization, and security headers
 * @verified 2026-01-09 - All authentication paths complete and functional
 */
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { constantTimeRateLimitCheck } from "@/lib/auth/constant-time-ratelimit";
import { secureCompare } from "@/lib/auth/secure-compare";
import { serverEnv } from "@/lib/env/schema";
import {
  generateNonce,
  buildCSP,
  buildMDXCSP,
  buildRelaxedCSP,
} from "@/lib/security/csp";

const intlMiddleware = createMiddleware(routing);

// Build regex pattern from routing.locales for consistent locale matching
const localePattern = routing.locales.join("|");

// Regex for matching static file extensions - compiled once at module level for performance
const STATIC_FILE_REGEX =
  /\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico|map)$/;

// Regex patterns for route matching - compiled once at module level for performance
const ADMIN_ROUTE_REGEX = new RegExp(`^/(${localePattern})/admin/`);
const MARKETING_ROUTE_REGEX = new RegExp(`^/(${localePattern})/marketing/`);
const TREE_DETAIL_ROUTE_REGEX = new RegExp(
  `^/(${localePattern})/trees/[^/]+/?$`
);
const GLOSSARY_DETAIL_ROUTE_REGEX = new RegExp(
  `^/(${localePattern})/glossary/[^/]+/?$`
);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets, API routes, and Next.js internals
  // These should not have CSP headers applied
  if (
    pathname.startsWith("/_next/") || // Next.js internal routes
    pathname.startsWith("/api/") || // API routes
    pathname.startsWith("/_vercel/") || // Vercel internals
    STATIC_FILE_REGEX.test(pathname) // Static files
  ) {
    // Let the request pass through without modification
    return NextResponse.next();
  }

  // Generate nonce for this request
  const nonce = generateNonce();

  // Check if this is an admin route
  // Note: Locale pattern matches routing.locales from i18n/routing.ts
  if (ADMIN_ROUTE_REGEX.test(pathname)) {
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

    // If admin password is not configured, return 404 to hide admin routes
    if (!adminPassword) {
      return new NextResponse("Not Found", { status: 404 });
    }

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
            const userValid = await secureCompare(user, adminUsername);
            const pwdValid = await secureCompare(pwd, adminPassword);

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

  // Add security headers with appropriate CSP based on route
  let csp: string;

  // Determine which CSP policy to use based on route
  const isTreeDetailPage = TREE_DETAIL_ROUTE_REGEX.test(pathname);
  const isGlossaryDetailPage = GLOSSARY_DETAIL_ROUTE_REGEX.test(pathname);
  const isMarketingPage = MARKETING_ROUTE_REGEX.test(pathname);
  const isMDXPage = isTreeDetailPage || isGlossaryDetailPage;

  if (isMarketingPage) {
    // Marketing pages: Relaxed CSP for Google Tag Manager
    csp = buildRelaxedCSP(nonce);
  } else if (isMDXPage) {
    // Tree and glossary detail pages: MDX CSP (requires unsafe-eval for MDX rendering)
    csp = buildMDXCSP(nonce);
  } else {
    // All other pages: Strict CSP (no unsafe-eval)
    csp = buildCSP(nonce);
  }

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Nonce", nonce);

  // For MDX pages, prevent caching of the HTML response to ensure CSP headers
  // are always fresh. This is critical because MDX rendering requires unsafe-eval,
  // and cached pages might have incorrect CSP headers from previous requests.
  // Static assets are still cached normally (handled by early return above).
  if (isMDXPage) {
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate"
    );
    response.headers.set("Vary", "Cookie, Accept-Encoding");
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames and exclude static assets
  // The early return in middleware handles additional filtering
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",
    // Match all localized routes
    "/(en|es)/:path*",
  ],
};
