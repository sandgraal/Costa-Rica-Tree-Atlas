/**
 * Shared Rate Limiter for Public API v1 Routes
 *
 * Simple in-memory rate limiter for the public API.
 * For production scale, replace with Redis/Upstash (see @/lib/ratelimit).
 *
 * Supports X-API-Key header for client identification.
 */

import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

// ---------------------------------------------------------------------------
// In-memory store (shared across all v1 routes within one instance)
// ---------------------------------------------------------------------------

const store = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup to prevent memory leaks in long-running processes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let lastCleanup = Date.now();

function cleanupExpired(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, record] of store) {
    if (record.resetAt < now) store.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** Derive a stable client identifier from the request. */
export function getClientId(request: NextRequest): string {
  const apiKey = request.headers.get("X-API-Key");
  if (apiKey) return `key:${apiKey}`;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";
  return `ip:${ip}`;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/** Check (and consume) one request for the given client. */
export function checkRateLimit(clientId: string): RateLimitResult {
  cleanupExpired();
  const now = Date.now();
  const record = store.get(clientId);

  if (!record || record.resetAt < now) {
    store.set(clientId, { count: 1, resetAt: now + RATE_WINDOW });
    return {
      allowed: true,
      remaining: RATE_LIMIT - 1,
      resetAt: now + RATE_WINDOW,
    };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT - record.count,
    resetAt: record.resetAt,
  };
}

/** Append standard X-RateLimit-* headers. */
export function addRateLimitHeaders(
  headers: Headers,
  result: RateLimitResult
): void {
  headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  headers.set("X-RateLimit-Remaining", String(result.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
}

