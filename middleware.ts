import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Check if this is an admin route
  if (request.nextUrl.pathname.match(/^\/(en|es)\/admin\//)) {
    const basicAuth = request.headers.get("authorization");
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If no password is configured, deny access
    if (!adminPassword) {
      return new NextResponse("Admin access disabled - ADMIN_PASSWORD not configured", {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    // Check for authentication
    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      if (authValue) {
        try {
          const [user, pwd] = atob(authValue).split(":");

          if (user === "admin" && pwd === adminPassword) {
            // Authentication successful, continue with i18n middleware
            return intlMiddleware(request);
          }
        } catch (error) {
          // Invalid base64 or malformed auth header
          console.error("Invalid authorization header:", error);
        }
      }
    }

    // Authentication failed or missing
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
        "Content-Type": "text/plain",
      },
    });
  }

  // For non-admin routes, just use i18n middleware
  return intlMiddleware(request);
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
