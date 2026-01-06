import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "@/lib/ratelimit/config";

// Use Upstash Redis for persistent rate limiting
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

/**
 * Rate limiter for admin authentication attempts
 * Limits: 5 requests per 15 minutes per IP address
 * Purpose: Prevent brute-force attacks on admin login
 */
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.admin.requests,
        RATE_LIMITS.admin.window
      ),
      prefix: "auth_attempts",
    })
  : null;

// Fallback in-memory rate limiting for local dev
const localAttempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if the authentication attempt is within rate limits
 * Uses Upstash Redis in production, falls back to in-memory storage in development
 *
 * @param identifier - Unique identifier (typically "admin:{ip_address}")
 * @returns Object with success status, remaining attempts, and reset timestamp
 *
 * Rate limit: 5 attempts per 15 minutes per IP address
 */
export async function checkAuthRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  if (authRateLimit) {
    const result = await authRateLimit.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  // Fallback for local development
  const now = Date.now();
  const record = localAttempts.get(identifier);
  const windowMs = 15 * 60 * 1000; // 15 minutes in milliseconds
  const maxAttempts = RATE_LIMITS.admin.requests;

  if (!record || now > record.resetAt) {
    localAttempts.set(identifier, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      remaining: maxAttempts - 1,
      reset: now + windowMs,
    };
  }

  if (record.count >= maxAttempts) {
    return { success: false, remaining: 0, reset: record.resetAt };
  }

  record.count++;
  return {
    success: true,
    remaining: maxAttempts - record.count,
    reset: record.resetAt,
  };
}
