import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { RATE_LIMITS } from "./config";

// Type for API rate limits (excludes 'admin' which is handled separately)
type ApiRateLimitType = Exclude<keyof typeof RATE_LIMITS, "admin">;

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null;

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
 *
 * This function enforces per-IP rate limits on API endpoints to prevent abuse
 * and protect external service costs. Rate limits are configured in ./config.ts
 *
 * @param request - The incoming Next.js request
 * @param type - The type of endpoint being rate limited (default: "default")
 *               - "identify": AI image identification (10 req/hour) - expensive paid API
 *               - "species": Species data fetching (60 req/minute)
 *               - "images": iNaturalist images (30 req/minute)
 *               - "random": Random tree selection (100 req/minute)
 *               - "default": General endpoints (100 req/minute)
 *
 * @returns Either a 429 response if rate limit exceeded, or headers to add to successful response
 *
 * Rate limiting behavior:
 * - Production: Uses Upstash Redis for persistent rate limits across deployments
 * - Development: Disabled by default (unless UPSTASH_REDIS_REST_URL is set)
 * - All limits are per IP address using sliding window algorithm
 * - Returns standard rate limit headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 *
 * @example
 * ```typescript
 * const rateLimitResult = await rateLimit(request, "identify");
 * if ("response" in rateLimitResult) {
 *   return rateLimitResult.response; // Rate limit exceeded
 * }
 * // Continue with normal response, adding rate limit headers
 * return NextResponse.json(data, { headers: rateLimitResult.headers });
 * ```
 */
export async function rateLimit(
  request: NextRequest,
  type: ApiRateLimitType = "default"
): Promise<{ response: NextResponse } | { headers: Record<string, string> }> {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === "development" && !redis) {
    return { headers: {} }; // Allow request with no headers
  }

  // If Redis is not configured in production, log warning and allow
  if (!redis) {
    console.warn(
      "⚠️  Rate limiting disabled: UPSTASH_REDIS_REST_URL not configured"
    );
    return { headers: {} };
  }

  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters![type] || rateLimiters!.default;

  try {
    const result = await limiter.limit(identifier);

    // Prepare rate limit headers
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": result.limit.toString(),
      "X-RateLimit-Remaining": result.remaining.toString(),
      "X-RateLimit-Reset": result.reset.toString(),
    };

    if (!result.success) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      headers["Retry-After"] = retryAfter.toString();

      return {
        response: new NextResponse(
          JSON.stringify({
            error: "Too many requests. Please try again later.",
            retryAfter,
            limit: result.limit,
          }),
          {
            status: 429,
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
          }
        ),
      };
    }

    // Rate limit passed - return headers to add to successful response
    return { headers };
  } catch (error) {
    // If rate limiting fails, log error but allow request
    console.error("Rate limiting error:", error);
    return { headers: {} };
  }
}
