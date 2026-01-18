/**
 * Copyright (c) 2024-present sandgraal
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This file is part of Costa Rica Tree Atlas.
 * See LICENSE file in the project root for full license information.
 */

import { z } from "zod";

/**
 * Server-side environment variables schema
 * These are NEVER exposed to the client
 */
const serverSchema = z.object({
  // Authentication (Legacy - will be deprecated)
  // Note: ADMIN_PASSWORD validation is intentionally simple here.
  // The middleware returns 404 if not set, hiding admin routes.
  // When set, it should be strong (12+ chars, mixed case, numbers, special chars)
  // but we don't enforce at build time to allow builds without admin configured.
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_USERNAME: z.string().min(3).default("admin"),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // MFA
  MFA_ENCRYPTION_KEY: z.string().length(64).optional(), // 32-byte hex string

  // Redis (optional but recommended)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(32).optional(),

  // Google Cloud (optional)
  GOOGLE_VISION_API_KEY: z.string().min(32).optional(),
  GOOGLE_MAPS_API_KEY: z.string().min(32).optional(),

  // CSP Reporting (optional)
  CSP_REPORT_URI: z.string().url().optional(),

  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

/**
 * Client-side environment variables schema
 * These ARE exposed to the browser bundle
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_ANALYTICS_DOMAIN: z.string().optional(),
});

/**
 * Validate and parse environment variables at startup
 * Throws error if validation fails
 */
export function validateEnv() {
  // Validate server env
  const serverEnv = serverSchema.safeParse(process.env);
  if (!serverEnv.success) {
    console.error("❌ Invalid server environment variables:");
    console.error(JSON.stringify(serverEnv.error.format(), null, 2));
    throw new Error("Invalid server environment variables");
  }

  // Validate client env
  const clientEnv = clientSchema.safeParse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ANALYTICS_DOMAIN: process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN,
  });

  if (!clientEnv.success) {
    console.error("❌ Invalid client environment variables:");
    console.error(JSON.stringify(clientEnv.error.format(), null, 2));
    throw new Error("Invalid client environment variables");
  }

  console.log("✅ Environment variables validated successfully");

  return {
    server: serverEnv.data,
    client: clientEnv.data,
  };
}

/**
 * Type-safe environment variable access
 */
export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

// Cache for validated environment
let env: ReturnType<typeof validateEnv> | null = null;

// Get validated environment (lazy initialization)
function getEnv() {
  if (!env) {
    env = validateEnv();
  }
  return env;
}

// Export with lazy evaluation using Proxy for compatibility with Edge runtime
export const serverEnv = new Proxy({} as ServerEnv, {
  get(_target, prop) {
    return getEnv().server[prop as keyof ServerEnv];
  },
});

export const clientEnv = new Proxy({} as ClientEnv, {
  get(_target, prop) {
    return getEnv().client[prop as keyof ClientEnv];
  },
});
