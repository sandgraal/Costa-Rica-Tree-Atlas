/**
 * Shared Rate Limiter for Private API v1 Routes
 *
 * Simple in-memory rate limiter for the private API.
 * For production scale, replace with Redis/Upstash (see @/lib/ratelimit).
 *
 * Supports X-API-Key header for client identification.
 */

import { NextRequest, NextResponse } from "next/server";

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

/**
 * Derive a stable client identifier from the request.
 *
 * Deliberately keyed on IP only. The previous implementation returned
 * `key:${X-API-Key}` — a value the caller chooses — so sending a fresh random
 * key on every request allocated a fresh bucket and the limit never applied.
 * Access control for these routes is `requireApiV1Access`, which runs first;
 * this function's only job is to produce a bucket the caller cannot pick.
 *
 * `x-real-ip` is preferred because Vercel sets it and it cannot be spoofed by
 * the client. `x-forwarded-for` is client-appendable, so we read the LAST
 * entry — the one written by the closest trusted proxy — rather than the first.
 */
export function getClientId(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return `ip:${realIp}`;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    const nearest = hops.at(-1);
    if (nearest) return `ip:${nearest}`;
  }

  return "ip:anonymous";
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

/**
 * Convenience: if rate-limited, return a 429 response; otherwise null.
 * Usage:
 *   const blocked = rateLimitOrNull(request);
 *   if (blocked) return blocked;
 */
export function rateLimitOrNull(request: NextRequest): NextResponse | null {
  const clientId = getClientId(request);
  const rl = checkRateLimit(clientId);

  if (!rl.allowed) {
    const headers = new Headers();
    addRateLimitHeaders(headers, rl);
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          details: {
            retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
          },
        },
        _links: { documentation: "/api/docs" },
      },
      { status: 429, headers }
    );
  }

  return null;
}

/**
 * Internal helper to read current rate-limit state without consuming a request.
 */
function peekRateLimit(clientId: string): RateLimitResult {
  cleanupExpired();
  const now = Date.now();
  const record = store.get(clientId);

  if (!record || record.resetAt < now) {
    // No active window yet: report full remaining without creating one.
    return {
      allowed: true,
      remaining: RATE_LIMIT,
      resetAt: now + RATE_WINDOW,
    };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Get rate-limit result for adding headers to successful responses.
 *
 * This reads the current state without consuming another request, so it can be
 * safely used in combination with {@link rateLimitOrNull} or direct calls to
 * {@link checkRateLimit} without double-counting.
 */
export function getRateLimitResult(request: NextRequest): RateLimitResult {
  const clientId = getClientId(request);
  return peekRateLimit(clientId);
}
