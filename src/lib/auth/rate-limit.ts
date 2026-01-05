import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Use Upstash Redis for persistent rate limiting
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "auth_attempts",
    })
  : null;

// Fallback in-memory rate limiting for local dev
const localAttempts = new Map<string, { count: number; resetAt: number }>();

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

  if (!record || now > record.resetAt) {
    localAttempts.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return { success: true, remaining: 4, reset: now + 15 * 60 * 1000 };
  }

  if (record.count >= 5) {
    return { success: false, remaining: 0, reset: record.resetAt };
  }

  record.count++;
  return { success: true, remaining: 5 - record.count, reset: record.resetAt };
}
