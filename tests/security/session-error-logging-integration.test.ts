/**
 * Integration Test: JWT Error Logging with Session Module
 *
 * Tests the integration of JWT error logging with getSessionFromRequest.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock jose library before importing session
vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
}));

// Mock the logger
vi.mock("@/lib/auth/jwt-error-logger", () => ({
  logJWTVerificationError: vi.fn(),
}));

describe("Session Module - JWT Error Logging Integration", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.NEXTAUTH_SECRET = "test-secret-key-for-jwt-verification";
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should log JWT verification errors when token is invalid", async () => {
    const { jwtVerify } = await import("jose");
    const { logJWTVerificationError } =
      await import("@/lib/auth/jwt-error-logger");
    const { getSessionFromRequest } = await import("@/lib/auth/session");

    // Mock JWT verification to throw an error
    const jwtError = new Error("signature verification failed");
    jwtError.name = "JWSSignatureVerificationFailed";
    vi.mocked(jwtVerify).mockRejectedValue(jwtError);

    // Create mock request with invalid token
    const mockRequest = {
      cookies: {
        get: vi.fn((name: string) => {
          if (name === "next-auth.session-token") {
            return { value: "invalid-token-here" };
          }
          return undefined;
        }),
        getAll: vi.fn(() => [
          { name: "next-auth.session-token", value: "invalid-token" },
        ]),
      },
    } as unknown as NextRequest;

    // Call getSessionFromRequest
    const session = await getSessionFromRequest(mockRequest);

    // Verify error was logged
    expect(logJWTVerificationError).toHaveBeenCalledWith(jwtError);
    expect(session).toBeNull();
  });

  it("should log JWT verification errors when token is expired", async () => {
    const { jwtVerify } = await import("jose");
    const { logJWTVerificationError } =
      await import("@/lib/auth/jwt-error-logger");
    const { getSessionFromRequest } = await import("@/lib/auth/session");

    // Mock JWT verification to throw expired error
    const jwtError = new Error('"exp" claim timestamp check failed');
    jwtError.name = "JWTExpired";
    vi.mocked(jwtVerify).mockRejectedValue(jwtError);

    // Create mock request with expired token
    const mockRequest = {
      cookies: {
        get: vi.fn((name: string) => {
          if (name === "next-auth.session-token") {
            return { value: "expired-token-here" };
          }
          return undefined;
        }),
        getAll: vi.fn(() => [
          { name: "next-auth.session-token", value: "expired-token" },
        ]),
      },
    } as unknown as NextRequest;

    // Call getSessionFromRequest
    const session = await getSessionFromRequest(mockRequest);

    // Verify error was logged
    expect(logJWTVerificationError).toHaveBeenCalledWith(jwtError);
    expect(session).toBeNull();
  });

  it("should not log when JWT verification succeeds", async () => {
    const { jwtVerify } = await import("jose");
    const { logJWTVerificationError } =
      await import("@/lib/auth/jwt-error-logger");
    const { getSessionFromRequest } = await import("@/lib/auth/session");

    // Mock successful JWT verification
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: {
        id: "user-123",
        email: "user@example.com",
        name: "Test User",
      },
      protectedHeader: { alg: "HS256" },
    });

    // Create mock request with valid token
    const mockRequest = {
      cookies: {
        get: vi.fn((name: string) => {
          if (name === "next-auth.session-token") {
            return { value: "valid-token-here" };
          }
          return undefined;
        }),
        getAll: vi.fn(() => [
          { name: "next-auth.session-token", value: "valid-token" },
        ]),
      },
    } as unknown as NextRequest;

    // Call getSessionFromRequest
    const session = await getSessionFromRequest(mockRequest);

    // Verify error logging was NOT called
    expect(logJWTVerificationError).not.toHaveBeenCalled();
    expect(session).toEqual({
      id: "user-123",
      email: "user@example.com",
      name: "Test User",
    });
  });

  it("should not log when no token is present", async () => {
    const { logJWTVerificationError } =
      await import("@/lib/auth/jwt-error-logger");
    const { getSessionFromRequest } = await import("@/lib/auth/session");

    // Create mock request without token
    const mockRequest = {
      cookies: {
        get: vi.fn(() => undefined),
        getAll: vi.fn(() => []),
      },
    } as unknown as NextRequest;

    // Call getSessionFromRequest
    const session = await getSessionFromRequest(mockRequest);

    // Verify error logging was NOT called (no token is not an error)
    expect(logJWTVerificationError).not.toHaveBeenCalled();
    expect(session).toBeNull();
  });
});
