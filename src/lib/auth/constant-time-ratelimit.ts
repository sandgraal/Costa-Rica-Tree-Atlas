import { checkAuthRateLimit } from "./rate-limit";
import { NextRequest } from "next/server";

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
  const minDuration = 50; // ms
  const elapsed = performance.now() - startTime;

  if (elapsed < minDuration) {
    await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed));
  }

  // Always return same structure
  if (result.success) {
    return { allowed: true, retryAfter: 0 };
  } else {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
    return { allowed: false, retryAfter };
  }
}
