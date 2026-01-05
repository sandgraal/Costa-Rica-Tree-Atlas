import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { RATE_LIMITS } from "./config";

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? Redis.fromEnv()
  : null;

// Create rate limiters for each endpoint type
const rateLimiters = redis
  ? {
      identify: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMITS.identify.requests,
          RATE_LIMITS.identify.window
        ),
        prefix: "ratelimit:identify",
        analytics: true,
      }),
      species: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMITS.species.requests,
          RATE_LIMITS.species.window
        ),
        prefix: "ratelimit:species",
        analytics: true,
      }),
      images: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMITS.images.requests,
          RATE_LIMITS.images.window
        ),
        prefix: "ratelimit:images",
        analytics: true,
      }),
      random: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMITS.random.requests,
          RATE_LIMITS.random.window
        ),
        prefix: "ratelimit:random",
        analytics: true,
      }),
      default: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          RATE_LIMITS.default.requests,
          RATE_LIMITS.default.window
        ),
        prefix: "ratelimit:default",
        analytics: true,
      }),
    }
  : null;

/**
 * Get client identifier from request
 * Prioritizes x-real-ip over x-forwarded-for to prevent spoofing
 */
function getClientIdentifier(request: NextRequest): string {
  // In production, Vercel sets x-real-ip with the actual client IP
  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  // Fallback to x-forwarded-for (take first IP)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // Last resort
  return "anonymous";
}

/**
 * Apply rate limiting to an API route
 */
export async function rateLimit(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = "default"
): Promise<NextResponse | null> {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === "development" && !redis) {
    return null; // Allow request
  }

  // If Redis is not configured in production, log warning and allow
  if (!redis) {
    console.warn(
      "⚠️  Rate limiting disabled: UPSTASH_REDIS_REST_URL not configured"
    );
    return null;
  }

  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters![type] || rateLimiters!.default;

  try {
    const result = await limiter.limit(identifier);

    // Add rate limit headers to response
    const headers = new Headers({
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": result.reset.toString(),
    });

    if (!result.success) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      headers.set("Retry-After", retryAfter.toString());

      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter,
          limit: result.limit,
        }),
        {
          status: 429,
          headers: {
            ...Object.fromEntries(headers),
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Rate limit passed - return null to continue with request
    // Caller should add these headers to their response
    return null;
  } catch (error) {
    // If rate limiting fails, log error but allow request
    console.error("Rate limiting error:", error);
    return null;
  }
}

/**
 * Helper to add rate limit headers to a successful response
 */
export async function getRateLimitHeaders(
  request: NextRequest,
  type: keyof typeof RATE_LIMITS = "default"
): Promise<Record<string, string>> {
  if (!redis) return {};

  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters![type] || rateLimiters!.default;

  try {
    const result = await limiter.limit(identifier);
    return {
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": result.reset.toString(),
    };
  } catch {
    return {};
  }
}
