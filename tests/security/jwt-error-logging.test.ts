/**
 * JWT Error Logging Tests
 *
 * Tests for rate-limited, non-sensitive JWT verification error logging.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  logJWTVerificationError,
  __testing__,
} from "@/lib/auth/jwt-error-logger";

// Mock Sentry
vi.mock("@/lib/sentry", () => ({
  captureException: vi.fn(),
}));

// Import after mocking
import { captureException } from "@/lib/sentry";

describe("JWT Error Logger", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };

    // Reset rate limiter before each test
    __testing__.rateLimiter.reset();

    // Spy on console.warn
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;

    // Restore console
    consoleWarnSpy.mockRestore();

    vi.clearAllMocks();
  });

  describe("extractSafeErrorInfo", () => {
    it("should identify expired JWT errors", () => {
      const error = new Error(
        'Token expired: "exp" claim timestamp check failed'
      );
      error.name = "JWTExpired";

      const info = __testing__.extractSafeErrorInfo(error);

      expect(info.type).toBe("expired");
      expect(info.code).toBe("JWT_EXPIRED");
      expect(info.message).toBe("Token has expired");
    });

    it("should identify invalid signature errors", () => {
      const error = new Error("signature verification failed");
      error.name = "JWSSignatureVerificationFailed";

      const info = __testing__.extractSafeErrorInfo(error);

      expect(info.type).toBe("invalid_signature");
      expect(info.code).toBe("INVALID_SIGNATURE");
      expect(info.message).toBe("Token signature verification failed");
    });

    it("should identify malformed token errors", () => {
      const error = new Error("Token is malformed");

      const info = __testing__.extractSafeErrorInfo(error);

      expect(info.type).toBe("malformed");
      expect(info.code).toBe("MALFORMED_TOKEN");
      expect(info.message).toBe("Token is malformed or cannot be parsed");
    });

    it("should identify invalid token errors", () => {
      const error = new Error("Invalid token");
      error.name = "JWTInvalid";

      const info = __testing__.extractSafeErrorInfo(error);

      expect(info.type).toBe("invalid");
      expect(info.code).toBe("INVALID_TOKEN");
      expect(info.message).toBe("Token is invalid");
    });

    it("should handle unknown errors", () => {
      const error = new Error("Something went wrong");

      const info = __testing__.extractSafeErrorInfo(error);

      expect(info.type).toBe("unknown");
      expect(info.message).toBe("Token verification failed");
    });

    it("should handle non-Error objects", () => {
      const error = "String error";

      const info = __testing__.extractSafeErrorInfo(error);

      expect(info.type).toBe("unknown");
      expect(info.message).toBe("Unknown error during token verification");
    });

    it("should never include sensitive data", () => {
      const error = new Error(
        "JWT verification failed for token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
      );

      const info = __testing__.extractSafeErrorInfo(error);

      // Should not include the actual token
      expect(info.message).not.toContain(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
      );
      expect(JSON.stringify(info)).not.toContain(
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
      );
    });
  });

  describe("Rate Limiting", () => {
    it("should log the first occurrence of an error", () => {
      const error = new Error("Token expired");
      error.name = "JWTExpired";

      logJWTVerificationError(error);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[JWT Verification] Token has expired"
      );
    });

    it("should rate limit repeated errors of the same type", () => {
      const error = new Error("Token expired");
      error.name = "JWTExpired";

      // First call should log
      logJWTVerificationError(error);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      // Second call within cooldown should not log
      logJWTVerificationError(error);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);

      // Third call within cooldown should not log
      logJWTVerificationError(error);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });

    it("should allow logging different error types", () => {
      const expiredError = new Error("Token expired");
      expiredError.name = "JWTExpired";

      const signatureError = new Error("Signature verification failed");
      signatureError.name = "JWSSignatureVerificationFailed";

      // Different error types should both log
      logJWTVerificationError(expiredError);
      logJWTVerificationError(signatureError);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenNthCalledWith(
        1,
        "[JWT Verification] Token has expired"
      );
      expect(consoleWarnSpy).toHaveBeenNthCalledWith(
        2,
        "[JWT Verification] Token signature verification failed"
      );
    });

    it("should reset rate limit after cooldown period", async () => {
      // Create a rate limiter with very short cooldown for testing
      const testLimiter = new __testing__.JWTErrorRateLimiter(0.1); // 0.1 seconds

      expect(testLimiter.shouldLog("test")).toBe(true);
      expect(testLimiter.shouldLog("test")).toBe(false);

      // Wait for cooldown
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(testLimiter.shouldLog("test")).toBe(true);
    });
  });

  describe("Debug Mode", () => {
    it("should bypass rate limiting in DEBUG mode", () => {
      process.env.DEBUG = "true";

      const error = new Error("Token expired");
      error.name = "JWTExpired";

      // All calls should log in debug mode
      logJWTVerificationError(error);
      logJWTVerificationError(error);
      logJWTVerificationError(error);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
    });

    it("should provide detailed logging in DEBUG mode", () => {
      process.env.DEBUG = "1";

      const error = new Error("Token expired");
      error.name = "JWTExpired";

      logJWTVerificationError(error);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[JWT Verification] Token has expired",
        expect.objectContaining({
          errorType: "expired",
          errorCode: "JWT_EXPIRED",
          timestamp: expect.any(String),
        })
      );
    });

    it("should bypass rate limiting in development mode", () => {
      process.env.NODE_ENV = "development";

      const error = new Error("Token expired");
      error.name = "JWTExpired";

      // All calls should log in development
      logJWTVerificationError(error);
      logJWTVerificationError(error);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Production Behavior", () => {
    it("should send to Sentry in production", () => {
      process.env.NODE_ENV = "production";

      const error = new Error("Token expired");
      error.name = "JWTExpired";

      logJWTVerificationError(error);

      expect(captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            errorType: "jwt_verification",
            jwtErrorType: "expired",
            jwtErrorCode: "JWT_EXPIRED",
          }),
          extra: expect.objectContaining({
            rateLimited: true,
            cooldownSeconds: 60,
          }),
        })
      );
    });

    it("should not send to Sentry in non-production", () => {
      process.env.NODE_ENV = "development";

      const error = new Error("Token expired");

      logJWTVerificationError(error);

      expect(captureException).not.toHaveBeenCalled();
    });

    it("should use minimal console output in production", () => {
      process.env.NODE_ENV = "production";
      process.env.DEBUG = "false";

      const error = new Error("Token expired");
      error.name = "JWTExpired";

      logJWTVerificationError(error);

      // Should log simple message without details
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[JWT Verification] Token has expired"
      );
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe("Security - No Sensitive Data Leakage", () => {
    it("should never log JWT tokens", () => {
      const tokenFragment = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
      const error = new Error(`Invalid token: ${tokenFragment}`);

      logJWTVerificationError(error);

      // Verify console output doesn't contain token
      const allCalls = consoleWarnSpy.mock.calls.flat().join(" ");
      expect(allCalls).not.toContain(tokenFragment);
    });

    it("should never log JWT payload data", () => {
      const error = new Error(
        "Invalid payload: {id: 'user-123', email: 'user@example.com'}"
      );

      logJWTVerificationError(error);

      // Verify console output doesn't contain payload details
      const allCalls = consoleWarnSpy.mock.calls.flat().join(" ");
      expect(allCalls).not.toContain("user@example.com");
      expect(allCalls).not.toContain("user-123");
    });

    it("should never include error stack traces in production", () => {
      process.env.NODE_ENV = "production";
      process.env.DEBUG = "false";

      const error = new Error("Token verification failed");
      error.stack =
        "Error: Token verification failed\n    at /secret/path/file.ts:123";

      logJWTVerificationError(error);

      const allCalls = consoleWarnSpy.mock.calls.flat().join(" ");
      expect(allCalls).not.toContain(error.stack);
      expect(allCalls).not.toContain("/secret/path");
    });
  });
});
