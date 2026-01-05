import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateNonceEdge } from "@/lib/csp/nonce";
import { generateCSP } from "@/lib/csp/policy";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Generate nonce for this request using Edge-compatible function
  const nonce = generateNonceEdge();
  
  // Get response from i18n middleware first for admin routes
  let response: NextResponse;
  
  // Check if this is an admin route
  // Note: Locale pattern matches routing.locales from i18n/routing.ts
  if (pathname.match(/^\/(en|es)\/admin\//)) {
    const basicAuth = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If no password is configured, deny access
    if (!adminPassword) {
      response = new NextResponse("Admin access disabled - ADMIN_PASSWORD not configured", {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
        },
      });
      // Add nonce and CSP even to error responses
      response.headers.set("x-nonce", nonce);
      response.headers.set("Content-Security-Policy", generateCSP(nonce));
      return response;
    }

    // Check for authentication
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      if (authValue) {
        try {
          const decoded = atob(authValue);
          const parts = decoded.split(":");
          
          // Ensure we have both username and password
          if (parts.length >= 2) {
            const user = parts[0];
            const pwd = parts.slice(1).join(":"); // Handle passwords with colons

            if (user === "admin" && pwd === adminPassword) {
              // Authentication successful, continue with i18n middleware
              response = intlMiddleware(request);
              // Add nonce and CSP headers
              response.headers.set("x-nonce", nonce);
              response.headers.set("Content-Security-Policy", generateCSP(nonce));
              return response;
            }
          }
        } catch (_error) {
          // Invalid base64 or malformed auth header
          // Silently fail and return 401 below
        }
      }
    }

    // Authentication failed or missing
    response = new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
        "Content-Type": "text/plain",
      },
    });
    // Add nonce and CSP even to error responses
    response.headers.set("x-nonce", nonce);
    response.headers.set("Content-Security-Policy", generateCSP(nonce));
    return response;
  }

  // For non-admin routes, use i18n middleware and add CSP
  response = intlMiddleware(request);
  
  // Add nonce to request headers (accessible in layouts/pages)
  response.headers.set("x-nonce", nonce);
  
  // Add CSP header with nonce
  response.headers.set("Content-Security-Policy", generateCSP(nonce));
  
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
