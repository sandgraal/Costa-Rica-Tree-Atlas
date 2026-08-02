/**
 * Shared authentication constants.
 *
 * Brute-force limits are NOT defined here — they live in
 * `src/lib/ratelimit/config.ts` under `RATE_LIMITS.admin` (5 attempts / 15 min),
 * which is what `checkAuthRateLimit` actually enforces. This file previously
 * declared `MAX_LOGIN_ATTEMPTS` and `LOCKOUT_DURATION` alongside it while
 * nothing imported either; two declarations of one policy is one too many.
 */
export const AUTH_CONFIG = {
  /** Admin session lifetime in seconds. Consumed by NextAuth `session.maxAge`. */
  SESSION_DURATION: 24 * 60 * 60, // 24 hours
} as const;
