import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";
import { RATE_LIMITS } from "./config";
import { CircuitBreaker, InMemoryRateLimiter } from "./circuit-breaker";

// Type for API rate limits (excludes 'admin' which is handled separately)
type ApiRateLimitType = Exclude<keyof typeof RATE_LIMITS, "admin">;

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null;

// Initialize circuit breaker and fallback limiter
const circuitBreaker = new CircuitBreaker();
const memoryLimiter = new InMemoryRateLimiter();

/**
 * Lua script for atomic rate limiting
 * Ensures no race conditions between concurrent requests
 */
const rateLimitScript = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local current = redis.call('GET', key)
if current and tonumber(current) >= limit then
  local ttl = redis.call('TTL', key)
  return {0, tonumber(current), now + (ttl * 1000)}
end

local count = redis.call('INCR', key)
if count == 1 then
  redis.call('EXPIRE', key, window)
end

return {1, count, now + (window * 1000)}
`;

/**
 * Atomic rate limit check using Lua script
 * Prevents race conditions in concurrent serverless instances
 */
async function atomicRateLimit(
  redis: Redis,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; count: number; reset: number }> {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  const result = (await redis.eval(
    rateLimitScript,
    [key],
    [limit.toString(), windowSeconds.toString(), now.toString()]
  )) as [number, number, number];

  return {
    success: result[0] === 1,
    count: result[1],
    reset: result[2],
  };
}

/**
 * Validate if a string is a valid IPv4 or IPv6 address
 */
function isValidIP(ip: string): boolean {
  // Basic length check to prevent ReDoS
  if (!ip || ip.length > 45) return false; // Max IPv6 length is 39, giving some margin

  // IPv4 validation
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every((part) => {
      const num = Number(part);
      return /^\d{1,3}$/.test(part) && num >= 0 && num <= 255;
    });
  }

  // IPv6 validation - check if it contains colons and has valid hex characters
  if (ip.includes(":")) {
    // Basic structural check: should have at least 2 colons and only valid characters
    const validChars = /^[0-9a-fA-F:]+$/;
    if (!validChars.test(ip)) return false;

    const parts = ip.split(":");
    // IPv6 should have at most 8 groups (or less with :: compression)
    if (parts.length > 8) return false;

    // Each part should be 0-4 hex digits (empty parts are ok for :: compression)
    return parts.every((part) => part.length <= 4);
  }

  return false;
}

/**
 * Check if IPv6 address belongs to a known mobile carrier
 * Mobile carriers use /64 subnets, others use /48
 */
function isMobileIPv6(ip: string): boolean {
  const mobileIPv6Prefixes = [
    "2600:", // T-Mobile US
    "2607:fb90:", // T-Mobile US
    "2001:4888:", // Sprint/T-Mobile
    "2a00:23c5:", // Telefonica/O2
    "2a00:23c6:", // Telefonica/O2
    // Add more known mobile carrier prefixes as needed
  ];

  return mobileIPv6Prefixes.some((prefix) => ip.startsWith(prefix));
}

/**
 * Normalize IP address with smarter IPv6 handling
 * - IPv4: return as-is
 * - IPv6: use /64 for mobile carriers, /48 for others
 */
function normalizeIP(ip: string): string {
  if (ip.includes(":")) {
    // IPv6 - check if it's a mobile carrier
    const isMobile = isMobileIPv6(ip);
    const parts = ip.split(":");

    if (isMobile) {
      // Mobile: use /64 subnet (first 4 groups)
      return parts.slice(0, 4).join(":") + "::/64";
    } else {
      // Corporate/residential: use /48 subnet (first 3 groups)
      return parts.slice(0, 3).join(":") + "::/48";
    }
  }

  // IPv4 - return as-is
  return ip;
}

/**
 * Get trusted client IP with configurable proxy hop count
 * Handles multiple proxy layers (Cloudflare + Vercel)
 *
 * Security notes:
 * - x-real-ip is set by trusted reverse proxy (Vercel/Cloudflare) and cannot be spoofed
 * - For x-forwarded-for, we account for trusted proxy hops to get the real client IP
 * - All IPs are validated to prevent injection attacks
 * - IPv6 addresses are normalized to /48 or /64 subnets based on carrier type
 */
function getTrustedClientIP(request: NextRequest): string {
  // Vercel sets x-real-ip with the actual client IP (trusted)
  const realIP = request.headers.get("x-real-ip");
  if (realIP && isValidIP(realIP)) {
    return normalizeIP(realIP);
  }

  // For x-forwarded-for, account for trusted proxy hops
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());

    // In production behind Cloudflare + Vercel:
    // Format: client-ip, cloudflare-proxy, vercel-proxy
    // We want client-ip (3rd from end, or index 0 if only 3 IPs)
    const trustedProxyCount = process.env.TRUSTED_PROXY_COUNT
      ? parseInt(process.env.TRUSTED_PROXY_COUNT, 10)
      : 2; // Default: Cloudflare + Vercel

    const clientIndex = Math.max(0, ips.length - trustedProxyCount - 1);
    const clientIP = ips[clientIndex];

    if (isValidIP(clientIP)) {
      return normalizeIP(clientIP);
    }
  }

  // Unknown IPs get strictest rate limits (using "unknown" as identifier)
  return "unknown";
}

/**
 * Parse window strings like "1 h" to seconds
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*([hms])$/);
  if (!match) {
    console.warn(
      `Invalid rate limit window format: "${window}". Using default 60 seconds.`
    );
    return 60;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "h":
      return value * 3600;
    case "m":
      return value * 60;
    case "s":
      return value;
    default:
      console.warn(
        `Unknown time unit in window: "${window}". Using default 60 seconds.`
      );
      return 60;
  }
}

/**
 * Apply rate limiting to an API route with circuit breaker protection
 *
 * This function enforces per-IP rate limits on API endpoints to prevent abuse
 * and protect external service costs. Rate limits are configured in ./config.ts
 *
 * Features:
 * - Atomic Lua-based rate limiting (no race conditions)
 * - Circuit breaker for Redis failures (graceful degradation)
 * - In-memory fallback when Redis is unavailable
 * - Smart IPv6 normalization (/48 vs /64 based on carrier)
 * - Configurable proxy hop count (TRUSTED_PROXY_COUNT env var)
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
 * - Production: Uses Upstash Redis with Lua scripts for atomic operations
 * - Development: Disabled by default (unless UPSTASH_REDIS_REST_URL is set)
 * - Redis failure: Falls back to in-memory rate limiting (circuit breaker)
 * - All limits are per IP address using fixed window with atomic operations
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

  const identifier = getTrustedClientIP(request);
  const config = RATE_LIMITS[type];
  const windowSeconds = parseWindow(config.window);

  // Use circuit breaker with fallback
  const result = await circuitBreaker.execute(
    async () => {
      // Double-check redis is available before using
      if (!redis) {
        throw new Error("Redis not configured");
      }
      return atomicRateLimit(redis, identifier, config.requests, windowSeconds);
    },
    () => {
      // Fallback to in-memory rate limiting
      const fallback = memoryLimiter.check(
        identifier,
        config.requests,
        windowSeconds * 1000
      );
      return {
        success: fallback.success,
        count: config.requests - fallback.remaining,
        reset: fallback.reset,
      };
    }
  );

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": config.requests.toString(),
    "X-RateLimit-Remaining": Math.max(
      0,
      config.requests - result.count
    ).toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    headers["Retry-After"] = retryAfter.toString();

    return {
      response: new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
          retryAfter,
          limit: config.requests,
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
}
