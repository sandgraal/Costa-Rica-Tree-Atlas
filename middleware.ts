/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * This file is part of Costa Rica Tree Atlas.
 * See LICENSE file in the project root for full license information.
 */

/**
 * Middleware for authentication, internationalization, and security headers.
 *
 * Scope note: `/api/**` is deliberately NOT handled here (see the early return
 * below and the `matcher` at the bottom). API authentication is enforced
 * per-route via `getServerSession`, and API responses do not receive the CSP or
 * frame headers set here.
 */
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { buildCSP, buildMDXCSP } from "@/lib/security/csp";

const intlMiddleware = createMiddleware(routing);

const SUPPORTED_LOCALES = routing.locales;

// Regex for matching static file extensions - compiled once at module level for performance
const STATIC_FILE_REGEX =
  /\.(js|css|woff2?|ttf|otf|eot|svg|png|jpg|jpeg|gif|webp|ico|map)$/;

function getLocaleFromPath(pathname: string): string | null {
  const locale = pathname.split("/")[1];
  return SUPPORTED_LOCALES.includes(
    locale as (typeof SUPPORTED_LOCALES)[number]
  )
    ? locale
    : null;
}

function isAdminRoute(pathname: string): boolean {
  return SUPPORTED_LOCALES.some(
    (locale) =>
      pathname === `/${locale}/admin` ||
      pathname.startsWith(`/${locale}/admin/`)
  );
}

function isLocalizedDetailRoute(
  pathname: string,
  baseSegment: "trees" | "glossary"
): boolean {
  return SUPPORTED_LOCALES.some((locale) => {
    const prefix = `/${locale}/${baseSegment}/`;
    if (!pathname.startsWith(prefix)) {
      return false;
    }

    const remainder = pathname.slice(prefix.length).replace(/\/$/, "");
    return remainder.length > 0 && !remainder.includes("/");
  });
}

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
  if (isAdminRoute(pathname)) {
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
    const locale = getLocaleFromPath(pathname) ?? "en";
    const loginUrl = new URL(`/${locale}/admin/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For non-admin routes, use i18n middleware with security headers
  const response = intlMiddleware(request);

  // Add security headers with appropriate CSP based on route
  let csp: string;

  // Determine which CSP policy to use based on route.
  //
  // A `/{locale}/marketing/**` branch used to sit here, serving buildRelaxedCSP()
  // (which permits Google Tag Manager). No such route has ever existed in
  // src/app, so the branch was dead — and it was a footgun: adding a marketing
  // route later would have silently inherited a weakened CSP. If those pages
  // arrive, re-add the branch deliberately alongside them.
  const isTreeDetailPage = isLocalizedDetailRoute(pathname, "trees");
  const isGlossaryDetailPage = isLocalizedDetailRoute(pathname, "glossary");
  const isMDXPage = isTreeDetailPage || isGlossaryDetailPage;

  if (isMDXPage) {
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
