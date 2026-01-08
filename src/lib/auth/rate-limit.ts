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
