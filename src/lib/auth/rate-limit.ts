import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "@/lib/ratelimit/config";
import { NextRequest } from "next/server";

// Use Upstash Redis for persistent rate limiting
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

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
 * Normalize IP address for rate limiting
 * IPv6 addresses are normalized to /64 subnets to handle mobile user IP rotation
 */
function normalizeIP(ip: string): string {
  if (ip.includes(":")) {
    // IPv6 - use /64 subnet to group mobile users on same network
    const parts = ip.split(":");
    // Take first 4 groups (64 bits) to identify the subnet
    return parts.slice(0, 4).join(":") + "::/64";
  }
  // IPv4 - return as-is
  return ip;
}

/**
 * Get trusted client IP address with proper validation
 * Priority: x-real-ip (set by Vercel/Cloudflare) > rightmost x-forwarded-for > fallback
 */
function getTrustedClientIP(request: NextRequest): string {
  // Vercel sets x-real-ip with the actual client IP (trusted)
  const realIP = request.headers.get("x-real-ip");
  if (realIP && isValidIP(realIP)) {
    return normalizeIP(realIP);
  }

  // Take rightmost IP from x-forwarded-for (closest to server, added by trusted proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ips = forwarded.split(",").map((ip) => ip.trim());
    const clientIP = ips[Math.max(0, ips.length - 1)];
    if (isValidIP(clientIP)) {
      return normalizeIP(clientIP);
    }
  }

  // Unknown IPs get strictest rate limits
  return "unknown";
}

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
      ephemeralCache: undefined, // Disable to ensure atomicity across serverless instances
    })
  : null;

// Fallback in-memory rate limiting for local dev
const localAttempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if the authentication attempt is within rate limits
 * Uses Upstash Redis in production, falls back to in-memory storage in development
 *
 * @param request - The Next.js request object (used to derive IP address)
 * @returns Object with success status, remaining attempts, and reset timestamp
 *
 * Rate limit: 5 attempts per 15 minutes per IP address
 */
export async function checkAuthRateLimit(request: NextRequest): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  const clientIP = getTrustedClientIP(request);
  const identifier = `admin:${clientIP}`;

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
