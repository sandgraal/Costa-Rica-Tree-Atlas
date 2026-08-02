/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * This file is part of Costa Rica Tree Atlas.
 * See LICENSE file in the project root for full license information.
 */

import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer2";
import createNextIntlPlugin from "next-intl/plugin";
import { validateEnv } from "./src/lib/env/schema";

// Validate environment variables at build time
validateEnv();

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [40, 55, 60, 75, 80, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.inaturalist.org",
      },
      {
        protocol: "https",
        hostname: "inaturalist-open-data.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "api.gbif.org",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 1 year (31536000 seconds)
    minimumCacheTTL: 31536000,
  },

  // Enable typed routes
  typedRoutes: true,

  // Optimize build output
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Redirect costaricatreeatlas.cr → costaricatreeatlas.org (preserves path)
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: "costaricatreeatlas.cr" }],
      destination: "https://costaricatreeatlas.org/:path*",
      permanent: true,
    },
  ],

  // Security headers. CSP itself is set per-request in middleware.ts.
  // (These headers previously claimed "per-request nonces" — buildCSP() has
  // never generated a nonce; see the note in src/lib/security/csp.ts.)
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
    // Edge caching for static public pages
    // These pages are pre-rendered at build and don't use per-request data.
    // Middleware still applies fresh CSP headers on every request.
    {
      source: "/:locale(en|es)/trees",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/glossary",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/about",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/conservation",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/education",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/safety",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/seasonal",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/map",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/identify",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    // Individual content pages (highest-traffic)
    {
      source: "/:locale(en|es)/trees/:slug",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/compare/:slug",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
    {
      source: "/:locale(en|es)/glossary/:slug",
      headers: [
        {
          key: "Cache-Control",
          value: "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      ],
    },
  ],

  // Experimental optimizations
  experimental: {
    // Optimize package imports for smaller bundles
    // Only list actual dependencies. `lucide-react`, `react-markdown` and
    // `remark-gfm` were listed here and are not in package.json — no-op config.
    optimizePackageImports: [
      "date-fns",
      "contentlayer2",
      "fuse.js",
      "zustand",
      "@tanstack/react-query",
    ],
    // Enable optimized CSS loading
    optimizeCss: true,
    // Enable parallel build workers for faster builds
    webpackBuildWorker: true,
    // Reduce memory usage during builds
    memoryBasedWorkersCount: true,
  },

  // Production optimizations
  compiler: {
    // Strip console noise in production, but KEEP error and warn.
    //
    // This was `removeConsole: true`, which removes every console.* call —
    // including the 77 console.error sites in src/, every fallback path in
    // src/lib/error-tracking.ts, and the operational warnings for "rate
    // limiting unconfigured" and "Prisma unavailable". Since no error-tracking
    // adapter was ever registered (see src/instrumentation.ts), production had
    // no error visibility whatsoever.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Webpack optimizations for better code splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce client bundle size
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: true,
      };
    }
    return config;
  },
};

// Compose plugins: withContentlayer and withNextIntl
export default withNextIntl(withContentlayer(nextConfig));
