import { checkAuthRateLimit } from "./rate-limit";
import { NextRequest } from "next/server";

/**
 * Minimum duration for rate limit checks in milliseconds
 * This artificial delay ensures all checks take at least this long,
 * preventing timing-based detection of rate limit status.
 *
 * Can be overridden via RATE_LIMIT_MIN_DURATION_MS environment variable.
 */
const MIN_DURATION_MS = parseInt(
  process.env.RATE_LIMIT_MIN_DURATION_MS || "50",
  10
);

/**
 * Check rate limit in constant time, preventing information leakage
 *
 * Always returns the same structure regardless of result to prevent timing attacks
 */
export async function constantTimeRateLimitCheck(
  request: NextRequest
): Promise<{
  allowed: boolean;
  retryAfter: number;
}> {
  const startTime = performance.now();

  const result = await checkAuthRateLimit(request);

  // Add artificial delay to make all checks take the same time
  const elapsed = performance.now() - startTime;

  if (elapsed < MIN_DURATION_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_DURATION_MS - elapsed)
    );
  }

  // Always return same structure
  if (result.success) {
    return { allowed: true, retryAfter: 0 };
  } else {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    return { allowed: false, retryAfter };
  }
}
