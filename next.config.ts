/**
 * Copyright (c) 2024-present sandgraal
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

  // Security headers (CSP now set in middleware with per-request nonces)
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
  ],

  // Experimental optimizations
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      "date-fns",
      "contentlayer2",
      "lucide-react",
      "react-markdown",
      "remark-gfm",
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
    // Remove console.* in production
    removeConsole: process.env.NODE_ENV === "production",
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
