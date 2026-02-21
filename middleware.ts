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
import { getSessionFromRequest } from "@/lib/auth/session";
import { buildCSP, buildMDXCSP, buildRelaxedCSP } from "@/lib/security/csp";

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

  // Check if this is an admin route
  // Note: Locale pattern matches routing.locales from i18n/routing.ts
  if (ADMIN_ROUTE_REGEX.test(pathname)) {
    // Skip authentication for login page
    if (pathname.includes("/admin/login")) {
      const response = intlMiddleware(request);
      const csp = buildCSP();
      response.headers.set("Content-Security-Policy", csp);
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "SAMEORIGIN");
      return response;
    }

    // 1. HTTPS enforcement in production
    if (
      process.env.NODE_ENV === "production" &&
      request.headers.get("x-forwarded-proto") !== "https"
    ) {
      return new NextResponse("HTTPS required", { status: 403 });
    }

    // 2. Verify NextAuth JWT session
    const session = await getSessionFromRequest(request);

    if (session) {
      // Authenticated via NextAuth - allow access
      const response = intlMiddleware(request);

      // Add security headers
      const csp = buildCSP();
      response.headers.set("Content-Security-Policy", csp);
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "SAMEORIGIN");

      return response;
    }

    // 3. No valid session - redirect to login page
    const localeMatch = pathname.match(/^\/(en|es)\//);
    const locale = localeMatch ? localeMatch[1] : "en";
    const loginUrl = new URL(`/${locale}/admin/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
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
    csp = buildRelaxedCSP();
  } else if (isMDXPage) {
    // Tree and glossary detail pages: MDX-specific CSP (currently identical
    // to standard CSP since server-side rendering removed unsafe-eval need,
    // but kept separate for future route-based policy flexibility)
    csp = buildMDXCSP();
  } else {
    // All other pages: Strict CSP
    csp = buildCSP();
  }

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Edge caching for public pages
  //
  // Previously, MDX pages used `no-cache, no-store` to keep CSP nonces fresh.
  // That is unnecessary because:
  //   1. Middleware runs on EVERY request (even for edge-cached pages) and
  //      sets fresh CSP headers each time — nonces are never stale.
  //   2. `buildMDXCSP()` no longer requires `unsafe-eval` in production
  //      (server-side MDX rendering eliminated client-side eval).
  //   3. Tree and glossary pages are statically generated via
  //      `generateStaticParams` and contain no inline scripts with nonce
  //      attributes — the HTML body is nonce-agnostic.
  //
  // Using `s-maxage` lets Vercel's CDN serve cached HTML at the edge while
  // middleware still applies per-request CSP headers on top.
  // `stale-while-revalidate` serves stale content instantly while
  // revalidating in the background, providing a smooth user experience.
  if (isMDXPage) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    response.headers.set("Vary", "Accept-Encoding");
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
