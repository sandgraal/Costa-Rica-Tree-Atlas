/**
 * Rate-Limited JWT Verification Error Logger
 *
 * Provides non-sensitive, rate-limited logging for JWT verification failures.
 * Prevents log spam while maintaining operational visibility.
 */

import { captureException } from "@/lib/sentry";

// Common JWT error patterns for classification
const JWT_ERROR_PATTERNS = {
  EXPIRED: ["JWTExpired", "exp claim"],
  INVALID_SIGNATURE: ["JWSSignatureVerificationFailed", "signature"],
  MALFORMED: ["malformed", "parse"],
  INVALID: ["invalid", "JWTInvalid"],
} as const;

/**
 * Rate limiter for JWT error logging
 * Tracks last log time per error type to prevent spam
 */
class JWTErrorRateLimiter {
  private lastLogTimes: Map<string, number> = new Map();
  private readonly cooldownMs: number;

  constructor(cooldownSeconds: number = 60) {
    this.cooldownMs = cooldownSeconds * 1000;
  }

  /**
   * Check if we should log this error type
   * Returns true if enough time has passed since last log
   */
  shouldLog(errorType: string): boolean {
    const now = Date.now();
    const lastLog = this.lastLogTimes.get(errorType);

    if (!lastLog || now - lastLog >= this.cooldownMs) {
      this.lastLogTimes.set(errorType, now);
      return true;
    }

    return false;
  }

  /**
   * Reset rate limiter (useful for testing)
   */
  reset(): void {
    this.lastLogTimes.clear();
  }
}

// Global rate limiter instance (60 second cooldown per error type)
const rateLimiter = new JWTErrorRateLimiter(60);

/**
 * Extract safe, non-sensitive error information from JWT verification error
 */
function extractSafeErrorInfo(error: unknown): {
  type: string;
  code?: string;
  message: string;
} {
  if (error instanceof Error) {
    // Common JWT error types from jose library
    const errorName = error.name;
    const errorMessage = error.message;

    // Classify error types using predefined patterns
    if (
      errorName === JWT_ERROR_PATTERNS.EXPIRED[0] ||
      errorMessage.includes(JWT_ERROR_PATTERNS.EXPIRED[1])
    ) {
      return {
        type: "expired",
        code: "JWT_EXPIRED",
        message: "Token has expired",
      };
    }

    if (
      errorName === JWT_ERROR_PATTERNS.INVALID_SIGNATURE[0] ||
      errorMessage.includes(JWT_ERROR_PATTERNS.INVALID_SIGNATURE[1])
    ) {
      return {
        type: "invalid_signature",
        code: "INVALID_SIGNATURE",
        message: "Token signature verification failed",
      };
    }

    if (
      errorMessage.includes(JWT_ERROR_PATTERNS.MALFORMED[0]) ||
      errorMessage.includes(JWT_ERROR_PATTERNS.MALFORMED[1])
    ) {
      return {
        type: "malformed",
        code: "MALFORMED_TOKEN",
        message: "Token is malformed or cannot be parsed",
      };
    }

    if (
      errorMessage.includes(JWT_ERROR_PATTERNS.INVALID[0]) ||
      errorName === JWT_ERROR_PATTERNS.INVALID[1]
    ) {
      return {
        type: "invalid",
        code: "INVALID_TOKEN",
        message: "Token is invalid",
      };
    }

    // Generic error
    return {
      type: "unknown",
      code: errorName || "UNKNOWN_ERROR",
      message: "Token verification failed",
    };
  }

  // Non-Error object
  return {
    type: "unknown",
    message: "Unknown error during token verification",
  };
}

/**
 * Log JWT verification error with rate limiting and no sensitive data
 *
 * Features:
 * - Rate limited to prevent log spam (1 log per error type per minute)
 * - No JWT payload or token data logged
 * - Integrates with Sentry for production monitoring
 * - Respects DEBUG flag for verbose output
 *
 * @param error - The error that occurred during JWT verification
 */
export function logJWTVerificationError(error: unknown): void {
  const errorInfo = extractSafeErrorInfo(error);
  const isDebugMode =
    process.env.DEBUG === "true" ||
    process.env.DEBUG === "1" ||
    process.env.NODE_ENV === "development";

  // Always log in debug mode, otherwise rate limit
  if (!isDebugMode && !rateLimiter.shouldLog(errorInfo.type)) {
    // Skip logging - within cooldown period
    return;
  }

  // Create sanitized error message
  const sanitizedMessage = `[JWT Verification] ${errorInfo.message}`;

  // Log to console with appropriate level
  if (isDebugMode) {
    console.warn(sanitizedMessage, {
      errorType: errorInfo.type,
      errorCode: errorInfo.code,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Production: minimal console output
    console.warn(sanitizedMessage);
  }

  // Send to error tracking service (Sentry) in production
  if (process.env.NODE_ENV === "production") {
    captureException(
      error instanceof Error ? error : new Error(errorInfo.message),
      {
        tags: {
          errorType: "jwt_verification",
          jwtErrorType: errorInfo.type,
          jwtErrorCode: errorInfo.code || "unknown",
        },
        extra: {
          rateLimited: true,
          cooldownSeconds: 60,
          // Do NOT include token or payload data
        },
      }
    );
  }
}

/**
 * Export rate limiter and helper functions for testing purposes
 * @internal
 */
export const __testing__ = {
  rateLimiter,
  extractSafeErrorInfo,
  JWTErrorRateLimiter, // Export class for proper testing
};
