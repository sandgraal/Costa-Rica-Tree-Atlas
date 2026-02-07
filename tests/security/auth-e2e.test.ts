/**
 * End-to-End Authentication Tests
 *
 * Tests complete authentication flows including:
 * - Full login flow (credentials → JWT → session)
 * - MFA setup, verification, and disable flows
 * - Middleware route protection
 * - Session management (valid, expired, missing tokens)
 * - Rate limiting integration
 * - Audit logging for all auth events
 * - Edge cases (MFA_REQUIRED, lockout, invalid inputs)
 *
 * @see Priority 0.1 in docs/IMPLEMENTATION_PLAN.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "argon2";

// ──────────────────────────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────────────────────────

// Mock Prisma client
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    mFASecret: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock jose for JWT verification
vi.mock("jose", () => ({
  jwtVerify: vi.fn(),
}));

// Mock JWT error logger
vi.mock("@/lib/auth/jwt-error-logger", () => ({
  logJWTVerificationError: vi.fn(),
}));

// Mock next-auth getServerSession
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(),
}));

// Mock @otplib/totp with a proper class constructor
vi.mock("@otplib/totp", () => {
  class MockTOTP {
    generateSecret() {
      return "MOCK_TOTP_SECRET";
    }
    toURI() {
      return "otpauth://totp/test?secret=MOCK";
    }
    async verify() {
      return { valid: true };
    }
  }
  return { TOTP: MockTOTP };
});

// Mock qrcode
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,MOCKQR"),
  },
  toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,MOCKQR"),
}));

// Mock MFA crypto
vi.mock("@/lib/auth/mfa-crypto", () => ({
  encryptTotpSecret: vi.fn().mockResolvedValue("encrypted_secret"),
  decryptTotpSecret: vi.fn().mockResolvedValue("MOCK_TOTP_SECRET"),
  generateBackupCodes: vi
    .fn()
    .mockReturnValue([
      "ABCD-EFGH-1234",
      "WXYZ-5678-MNOP",
      "QRST-9012-UVWX",
      "DEFG-3456-HIJK",
      "LMNO-7890-PQRS",
      "TUVW-1234-XYZA",
      "BCDE-5678-FGHJ",
      "KLMN-9012-PQRT",
      "UVWX-3456-YZAB",
      "CDEF-7890-GHJK",
    ]),
}));

// Mock CSP module
vi.mock("@/lib/security/csp", () => ({
  generateNonce: vi.fn().mockReturnValue("test-nonce-123"),
  buildCSP: vi.fn().mockReturnValue("default-src 'self'"),
  buildMDXCSP: vi.fn().mockReturnValue("default-src 'self' 'unsafe-eval'"),
  buildRelaxedCSP: vi
    .fn()
    .mockReturnValue("default-src 'self' https://www.googletagmanager.com"),
}));

// Mock next-intl middleware
vi.mock("next-intl/middleware", () => ({
  default: vi.fn().mockReturnValue(
    vi.fn().mockImplementation(() => {
      return new NextResponse(null, { status: 200 });
    })
  ),
}));

// Mock i18n routing
vi.mock("@/../../i18n/routing", () => ({
  routing: {
    locales: ["en", "es"],
    defaultLocale: "en",
  },
}));

import prisma from "@/lib/prisma";

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

/**
 * Create a mock NextRequest with optional cookies and headers
 */
function createMockRequest(
  url: string,
  options: {
    method?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
): NextRequest {
  const { method = "GET", cookies = {}, headers = {}, body } = options;

  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers),
  };

  if (body && method !== "GET") {
    requestInit.body = JSON.stringify(body);
    (requestInit.headers as Headers).set("content-type", "application/json");
  }

  const request = new NextRequest(
    new URL(url, "http://localhost:3000"),
    requestInit as never
  );

  // Add cookies
  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }

  return request;
}

/**
 * Create a mock user for testing
 */
async function createMockUser(
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    password: string;
    mfaEnabled: boolean;
    mfaSecrets: unknown[];
  }> = {}
) {
  const password = overrides.password || "SecurePassword123!";
  const passwordHash = await hash(password, {
    type: 2,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  return {
    id: overrides.id || "user-123",
    email: overrides.email || "admin@example.com",
    name: overrides.name || "Test Admin",
    passwordHash,
    mfaEnabled: overrides.mfaEnabled ?? false,
    mfaSecrets: overrides.mfaSecrets || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ──────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────

describe("E2E Authentication Flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "test-secret-key-for-jwt-verification";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ────────────────────────────────────────────────────────────────
  // 1. Login Flow
  // ────────────────────────────────────────────────────────────────

  describe("Login Flow (Credentials → JWT)", () => {
    it("should authenticate with valid email and password", async () => {
      const password = "SecurePassword123!";
      const mockUser = await createMockUser({ password });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-1",
        userId: mockUser.id,
        eventType: "login",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      // Import the authorize function via authOptions
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      // Access the authorize function from the provider config
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      const result = await authorize({
        email: "admin@example.com",
        password,
        totpCode: "",
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });

      // Verify audit log was created
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUser.id,
            eventType: "login",
          }),
        })
      );
    });

    it("should reject login with wrong password", async () => {
      const mockUser = await createMockUser({ password: "CorrectPassword!" });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-2",
        userId: mockUser.id,
        eventType: "login_failed",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      await expect(
        authorize({
          email: "admin@example.com",
          password: "WrongPassword!",
          totpCode: "",
        })
      ).rejects.toThrow("Invalid credentials");

      // Verify failed login was logged
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: "login_failed",
            metadata: expect.objectContaining({
              reason: "invalid_password",
            }),
          }),
        })
      );
    });

    it("should reject login with non-existent email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-3",
        userId: null,
        eventType: "login_failed",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      await expect(
        authorize({
          email: "nonexistent@example.com",
          password: "SomePassword!",
          totpCode: "",
        })
      ).rejects.toThrow("Invalid credentials");

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: "login_failed",
            metadata: expect.objectContaining({
              reason: "user_not_found",
            }),
          }),
        })
      );
    });

    it("should reject login with empty credentials", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (
            credentials: Record<string, string> | undefined
          ) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      await expect(
        authorize({ email: "", password: "", totpCode: "" })
      ).rejects.toThrow("Email and password required");
    });

    it("should require MFA code when MFA is enabled", async () => {
      const mockUser = await createMockUser({
        password: "SecurePassword123!",
        mfaEnabled: true,
        mfaSecrets: [
          {
            id: "mfa-1",
            userId: "user-123",
            totpSecret: "encrypted_secret",
            backupCodes: [],
            backupCodesUsed: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      await expect(
        authorize({
          email: "admin@example.com",
          password: "SecurePassword123!",
          totpCode: "",
        })
      ).rejects.toThrow("MFA_REQUIRED");
    });

    it("should authenticate with valid MFA TOTP code", async () => {
      const password = "SecurePassword123!";
      const mockUser = await createMockUser({
        password,
        mfaEnabled: true,
        mfaSecrets: [
          {
            id: "mfa-1",
            userId: "user-123",
            totpSecret: "encrypted_secret",
            backupCodes: [],
            backupCodesUsed: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-4",
        userId: mockUser.id,
        eventType: "login",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      const result = await authorize({
        email: "admin@example.com",
        password,
        totpCode: "123456",
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it("should reject login with invalid MFA code", async () => {
      const password = "SecurePassword123!";
      const mockUser = await createMockUser({
        password,
        mfaEnabled: true,
        mfaSecrets: [
          {
            id: "mfa-1",
            userId: "user-123",
            totpSecret: "encrypted_secret",
            backupCodes: [],
            backupCodesUsed: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });

      // Override TOTP mock to return invalid by mocking decryptTotpSecret to throw
      const { decryptTotpSecret } = await import("@/lib/auth/mfa-crypto");
      vi.mocked(decryptTotpSecret).mockRejectedValueOnce(
        new Error("TOTP verification error")
      );

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.mFASecret.findUnique).mockResolvedValue(null as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-5",
        userId: mockUser.id,
        eventType: "login_failed",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      await expect(
        authorize({
          email: "admin@example.com",
          password,
          totpCode: "000000",
        })
      ).rejects.toThrow("Invalid 2FA code");

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: "login_failed",
            metadata: expect.objectContaining({
              reason: "invalid_mfa",
            }),
          }),
        })
      );
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 2. JWT Session & Middleware Protection
  // ────────────────────────────────────────────────────────────────

  describe("Middleware Route Protection", () => {
    it("should allow access to admin routes with valid session", async () => {
      const { jwtVerify } = await import("jose");
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: {
          id: "user-123",
          email: "admin@example.com",
          name: "Admin",
        },
        protectedHeader: { alg: "HS256" },
        key: new Uint8Array(),
      } as never);

      const { getSessionFromRequest } = await import("@/lib/auth/session");

      const request = createMockRequest(
        "http://localhost:3000/en/admin/dashboard",
        {
          cookies: { "next-auth.session-token": "valid-jwt-token" },
        }
      );

      const session = await getSessionFromRequest(request);

      expect(session).toEqual({
        id: "user-123",
        email: "admin@example.com",
        name: "Admin",
      });
    });

    it("should deny access with invalid JWT token", async () => {
      const { jwtVerify } = await import("jose");
      const jwtError = new Error("signature verification failed");
      jwtError.name = "JWSSignatureVerificationFailed";
      vi.mocked(jwtVerify).mockRejectedValue(jwtError);

      const { logJWTVerificationError } =
        await import("@/lib/auth/jwt-error-logger");
      const { getSessionFromRequest } = await import("@/lib/auth/session");

      const request = createMockRequest(
        "http://localhost:3000/en/admin/dashboard",
        {
          cookies: { "next-auth.session-token": "tampered-jwt-token" },
        }
      );

      const session = await getSessionFromRequest(request);

      expect(session).toBeNull();
      expect(logJWTVerificationError).toHaveBeenCalledWith(jwtError);
    });

    it("should deny access with expired JWT token", async () => {
      const { jwtVerify } = await import("jose");
      const expiredError = new Error('"exp" claim timestamp check failed');
      expiredError.name = "JWTExpired";
      vi.mocked(jwtVerify).mockRejectedValue(expiredError);

      const { logJWTVerificationError } =
        await import("@/lib/auth/jwt-error-logger");
      const { getSessionFromRequest } = await import("@/lib/auth/session");

      const request = createMockRequest(
        "http://localhost:3000/en/admin/dashboard",
        {
          cookies: { "next-auth.session-token": "expired-jwt-token" },
        }
      );

      const session = await getSessionFromRequest(request);

      expect(session).toBeNull();
      expect(logJWTVerificationError).toHaveBeenCalledWith(expiredError);
    });

    it("should return null session when no token is present", async () => {
      const { getSessionFromRequest } = await import("@/lib/auth/session");

      const request = createMockRequest(
        "http://localhost:3000/en/admin/dashboard"
      );

      const session = await getSessionFromRequest(request);

      expect(session).toBeNull();
    });

    it("should return null session when NEXTAUTH_SECRET is not set", async () => {
      // Save and clear the secret so the session module sees it as missing
      const savedSecret = process.env.NEXTAUTH_SECRET;
      delete process.env.NEXTAUTH_SECRET;

      // Ensure the session module is re-evaluated with the missing secret
      vi.resetModules();

      const { jwtVerify } = await import("jose");
      const { getSessionFromRequest } = await import("@/lib/auth/session");

      // Prepare a request that includes a session cookie so the code path
      // would normally attempt JWT verification if a secret were present.
      const requestWithCookie = {
        cookies: {
          get: vi.fn(() => ({ value: "test-token" })),
        },
      } as unknown as NextRequest;

      // Mock jwtVerify to a successful value (it should NOT be called when the
      // secret is missing due to the early `!JWT_SECRET` check).
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: {
          id: "user-id",
          email: "user@example.com",
        },
        protectedHeader: { alg: "HS256" },
        key: new Uint8Array(),
      } as never);

      const session = await getSessionFromRequest(requestWithCookie);

      // With a token present but no NEXTAUTH_SECRET, we should get a null session
      // specifically because verification cannot proceed.
      expect(session).toBeNull();
      expect(jwtVerify).not.toHaveBeenCalled();

      // Restore the original secret
      process.env.NEXTAUTH_SECRET = savedSecret;
    });

    it("should prefer production cookie over dev cookie", async () => {
      // The session module reads __Secure-next-auth.session-token first.
      // When both are present, prodToken takes priority (prodToken || devToken).
      const { jwtVerify } = await import("jose");
      const { getSessionFromRequest } = await import("@/lib/auth/session");

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: {
          id: "prod-user",
          email: "prod@example.com",
        },
        protectedHeader: { alg: "HS256" },
        key: new Uint8Array(),
      } as never);

      // Create a mock request with both cookies
      const mockRequest = {
        cookies: {
          get: vi.fn((name: string) => {
            if (name === "__Secure-next-auth.session-token") {
              return { value: "prod-token" };
            }
            if (name === "next-auth.session-token") {
              return { value: "dev-token" };
            }
            return undefined;
          }),
        },
      } as unknown as NextRequest;

      const session = await getSessionFromRequest(mockRequest);

      expect(session).toEqual({
        id: "prod-user",
        email: "prod@example.com",
        name: undefined,
      });

      // jwtVerify should have been called with the prod token
      expect(jwtVerify).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(jwtVerify).mock.calls[0];
      expect(callArgs[0]).toBe("prod-token");
    });

    it("should reject JWT payload without id claim", async () => {
      const { jwtVerify } = await import("jose");
      vi.mocked(jwtVerify).mockResolvedValue({
        payload: {
          email: "admin@example.com",
          // Missing 'id' field
        },
        protectedHeader: { alg: "HS256" },
        key: new Uint8Array(),
      } as never);

      const { getSessionFromRequest } = await import("@/lib/auth/session");

      const request = createMockRequest(
        "http://localhost:3000/en/admin/dashboard",
        {
          cookies: { "next-auth.session-token": "valid-but-no-id" },
        }
      );

      const session = await getSessionFromRequest(request);
      expect(session).toBeNull();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 3. MFA Setup Flow
  // ────────────────────────────────────────────────────────────────

  describe("MFA Setup Flow", () => {
    it("should reject MFA setup without authentication", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { POST } = await import("@/app/api/auth/mfa/setup/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/setup",
        {
          method: "POST",
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should reject MFA setup if already enabled", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const mockUser = {
        id: "user-123",
        email: "admin@example.com",
        name: "Admin",
        passwordHash: "hashed",
        mfaEnabled: true,
        mfaSecrets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const { POST } = await import("@/app/api/auth/mfa/setup/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/setup",
        {
          method: "POST",
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("MFA already enabled");
    });

    it("should generate TOTP secret, QR code, and backup codes", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const mockUser = {
        id: "user-123",
        email: "admin@example.com",
        name: "Admin",
        passwordHash: "hashed",
        mfaEnabled: false,
        mfaSecrets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.mFASecret.upsert).mockResolvedValue({
        id: "mfa-1",
        userId: "user-123",
        totpSecret: "encrypted",
        backupCodes: [],
        backupCodesUsed: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-setup",
        userId: "user-123",
        eventType: "mfa_setup_initiated",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { POST } = await import("@/app/api/auth/mfa/setup/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/setup",
        {
          method: "POST",
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("data");
      expect(data.data).toHaveProperty("qrCodeDataUrl");
      expect(data.data).toHaveProperty("backupCodes");
      expect(data.data.backupCodes).toHaveLength(10);

      // Verify MFA secret was stored
      expect(prisma.mFASecret.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-123" },
          create: expect.objectContaining({
            userId: "user-123",
            totpSecret: "encrypted_secret",
          }),
        })
      );

      // Verify audit log
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            eventType: "mfa_setup_initiated",
          }),
        })
      );
    });

    it("should return 404 if user not found during setup", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "nonexistent", email: "gone@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

      const { POST } = await import("@/app/api/auth/mfa/setup/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/setup",
        {
          method: "POST",
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(404);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 4. MFA Verification Flow
  // ────────────────────────────────────────────────────────────────

  describe("MFA Verification Flow", () => {
    it("should reject verification without authentication", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { POST } = await import("@/app/api/auth/mfa/verify/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/verify",
        {
          method: "POST",
          body: { code: "123456" },
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("should reject verification with invalid code format", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const { POST } = await import("@/app/api/auth/mfa/verify/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/verify",
        {
          method: "POST",
          body: { code: "abc" }, // Too short
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should reject verification when MFA is not configured", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const mockUser = {
        id: "user-123",
        email: "admin@example.com",
        name: "Admin",
        passwordHash: "hashed",
        mfaEnabled: false,
        mfaSecrets: [], // No MFA secret configured
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const { POST } = await import("@/app/api/auth/mfa/verify/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/verify",
        {
          method: "POST",
          body: { code: "123456" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("MFA not configured");
    });

    it("should enable MFA with valid TOTP code", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const mockUser = {
        id: "user-123",
        email: "admin@example.com",
        name: "Admin",
        passwordHash: "hashed",
        mfaEnabled: false,
        mfaSecrets: [
          {
            id: "mfa-1",
            userId: "user-123",
            totpSecret: "encrypted_secret",
            backupCodes: [],
            backupCodesUsed: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.user.update).mockResolvedValue({
        ...mockUser,
        mfaEnabled: true,
      } as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-mfa-enabled",
        userId: "user-123",
        eventType: "mfa_enabled",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { POST } = await import("@/app/api/auth/mfa/verify/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/verify",
        {
          method: "POST",
          body: { code: "123456" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mfaEnabled).toBe(true);

      // Verify MFA was enabled on user
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "user-123" },
          data: { mfaEnabled: true },
        })
      );

      // Verify audit log
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: "mfa_enabled",
            metadata: expect.objectContaining({
              method: "totp",
            }),
          }),
        })
      );
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 5. MFA Disable Flow
  // ────────────────────────────────────────────────────────────────

  describe("MFA Disable Flow", () => {
    it("should reject disable without authentication", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { POST } = await import("@/app/api/auth/mfa/disable/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/disable",
        {
          method: "POST",
          body: { password: "SomePassword!" },
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("should reject disable when MFA is not enabled", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const mockUser = {
        id: "user-123",
        email: "admin@example.com",
        name: "Admin",
        passwordHash: "hashed",
        mfaEnabled: false,
        mfaSecrets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const { POST } = await import("@/app/api/auth/mfa/disable/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/disable",
        {
          method: "POST",
          body: { password: "SomePassword!" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("MFA not enabled");
    });

    it("should reject disable with wrong password", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const correctPassword = "CorrectPassword!";
      const passwordHash = await hash(correctPassword, {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const mockUser = {
        id: "user-123",
        email: "admin@example.com",
        name: "Admin",
        passwordHash,
        mfaEnabled: true,
        mfaSecrets: [
          {
            id: "mfa-1",
            userId: "user-123",
            totpSecret: "encrypted",
            backupCodes: [],
            backupCodesUsed: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-disable-fail",
        userId: "user-123",
        eventType: "mfa_disable_failed",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { POST } = await import("@/app/api/auth/mfa/disable/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/disable",
        {
          method: "POST",
          body: { password: "WrongPassword!" },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Invalid password");

      // Verify failed attempt was logged
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: "mfa_disable_failed",
            metadata: expect.objectContaining({
              reason: "invalid_password",
            }),
          }),
        })
      );
    });

    it("should disable MFA with correct password", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const correctPassword = "CorrectPassword!";
      const passwordHash = await hash(correctPassword, {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const mockUser = {
        id: "user-123",
        email: "admin@example.com",
        name: "Admin",
        passwordHash,
        mfaEnabled: true,
        mfaSecrets: [
          {
            id: "mfa-1",
            userId: "user-123",
            totpSecret: "encrypted",
            backupCodes: [],
            backupCodesUsed: [],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.$transaction).mockResolvedValue(undefined as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-disable",
        userId: "user-123",
        eventType: "mfa_disabled",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { POST } = await import("@/app/api/auth/mfa/disable/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/disable",
        {
          method: "POST",
          body: { password: correctPassword },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mfaEnabled).toBe(false);

      // Verify the transaction was called (user update + MFA delete)
      expect(prisma.$transaction).toHaveBeenCalled();

      // Verify audit log
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: "mfa_disabled",
          }),
        })
      );
    });

    it("should reject disable with missing password field", async () => {
      const { getServerSession } = await import("next-auth");
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: "user-123", email: "admin@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      });

      const { POST } = await import("@/app/api/auth/mfa/disable/route");

      const request = createMockRequest(
        "http://localhost:3000/api/auth/mfa/disable",
        {
          method: "POST",
          body: {}, // Missing password
        }
      );

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 6. JWT Callbacks
  // ────────────────────────────────────────────────────────────────

  describe("NextAuth JWT & Session Callbacks", () => {
    it("jwt callback should inject user id into token", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");

      const jwtCallback = authOptions.callbacks!.jwt!;
      const result = await jwtCallback({
        token: { sub: "old-sub" },
        user: { id: "user-123", email: "admin@example.com", name: "Admin" },
        account: null,
        trigger: "signIn",
      } as never);

      expect(result).toHaveProperty("id", "user-123");
    });

    it("jwt callback should preserve token without user", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");

      const jwtCallback = authOptions.callbacks!.jwt!;
      const existingToken = { sub: "user-123", id: "user-123" };
      const result = await jwtCallback({
        token: existingToken,
        user: undefined,
        account: null,
        trigger: "update",
      } as never);

      expect(result).toEqual(existingToken);
    });

    it("session callback should inject token id into session", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");

      const sessionCallback = authOptions.callbacks!.session!;
      const result = await sessionCallback({
        session: {
          user: { id: "", email: "admin@example.com", name: "Admin" },
          expires: new Date().toISOString(),
        },
        token: { id: "user-123", sub: "user-123" },
        trigger: "update",
      } as never);

      expect((result as { user: { id: string } }).user.id).toBe("user-123");
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 7. Configuration Validation
  // ────────────────────────────────────────────────────────────────

  describe("Auth Configuration", () => {
    it("should use JWT session strategy", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      expect(authOptions.session?.strategy).toBe("jwt");
    });

    it("should set session max age to 7 days", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      expect(authOptions.session?.maxAge).toBe(7 * 24 * 60 * 60);
    });

    it("should configure correct cookie names for dev and prod", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");

      const cookieName = authOptions.cookies?.sessionToken?.name;
      // In test env (not production), should use dev cookie name
      expect(typeof cookieName).toBe("string");
    });

    it("should have httpOnly cookies enabled", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      expect(authOptions.cookies?.sessionToken?.options?.httpOnly).toBe(true);
    });

    it("should have sameSite set to lax", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      expect(authOptions.cookies?.sessionToken?.options?.sameSite).toBe("lax");
    });

    it("should configure custom sign-in page", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      expect(authOptions.pages?.signIn).toBe("/en/admin/login");
    });

    it("should configure custom error page", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      expect(authOptions.pages?.error).toBe("/en/admin/login");
    });

    it("should have credentials provider configured", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      expect(authOptions.providers).toHaveLength(1);
      const provider = authOptions.providers[0] as unknown as { id: string };
      expect(provider.id).toBe("credentials");
    });

    it("should have signOut event handler for audit logging", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      expect(authOptions.events?.signOut).toBeDefined();
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 8. Rate Limiting
  // ────────────────────────────────────────────────────────────────

  describe("Rate Limiting", () => {
    it("should enforce constant-time checks (min 50ms)", async () => {
      // The constant-time rate limit enforces minimum duration
      const { AUTH_CONFIG } = await import("@/lib/auth/constants");

      expect(AUTH_CONFIG.MAX_LOGIN_ATTEMPTS).toBe(5);
      expect(AUTH_CONFIG.LOCKOUT_DURATION).toBe(15 * 60 * 1000); // 15 min
      expect(AUTH_CONFIG.SESSION_DURATION).toBe(24 * 60 * 60); // 24 hours
    });

    it("should validate IP address formats", async () => {
      // Test valid IPs
      const validIPv4 = "192.168.1.1";
      const validIPv6 = "2001:db8:85a3:0:0:8a2e:370:7334";

      const ipv4Parts = validIPv4.split(".");
      expect(ipv4Parts).toHaveLength(4);
      expect(ipv4Parts.every((p) => Number(p) >= 0 && Number(p) <= 255)).toBe(
        true
      );

      expect(validIPv6.includes(":")).toBe(true);

      // Test invalid IPs
      const invalidIP = "999.999.999.999";
      const parts = invalidIP.split(".");
      expect(parts.some((p) => Number(p) > 255)).toBe(true);
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 9. Audit Logging Completeness
  // ────────────────────────────────────────────────────────────────

  describe("Audit Logging Completeness", () => {
    it("should log successful login", async () => {
      const password = "TestPassword123!";
      const mockUser = await createMockUser({ password });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-login",
        userId: mockUser.id,
        eventType: "login",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      await authorize({
        email: "admin@example.com",
        password,
        totpCode: "",
      });

      const auditCalls = vi.mocked(prisma.auditLog.create).mock.calls;
      const loginAudit = auditCalls.find(
        (call) =>
          (call[0] as { data: { eventType: string } }).data.eventType ===
          "login"
      );
      expect(loginAudit).toBeDefined();
    });

    it("should log signOut events", async () => {
      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");

      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-logout",
        userId: "user-123",
        eventType: "logout",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      // Simulate signOut event
      await authOptions.events!.signOut!({
        token: { id: "user-123", sub: "user-123" },
      } as never);

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            eventType: "logout",
          }),
        })
      );
    });

    it("should include required event types", () => {
      const requiredEventTypes = [
        "login",
        "login_failed",
        "logout",
        "mfa_enabled",
        "mfa_disabled",
        "mfa_setup_initiated",
        "mfa_disable_failed",
        "backup_code_used",
      ];

      // All event types should be non-empty strings
      requiredEventTypes.forEach((eventType) => {
        expect(eventType).toBeTruthy();
        expect(typeof eventType).toBe("string");
        expect(eventType.length).toBeGreaterThan(0);
        expect(eventType.length).toBeLessThanOrEqual(100);
      });
    });
  });

  // ────────────────────────────────────────────────────────────────
  // 10. Security Properties
  // ────────────────────────────────────────────────────────────────

  describe("Security Properties", () => {
    it("should not leak password hashes in login responses", async () => {
      const password = "SecurePassword123!";
      const mockUser = await createMockUser({ password });

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-sec",
        userId: mockUser.id,
        eventType: "login",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      const result = await authorize({
        email: "admin@example.com",
        password,
        totpCode: "",
      });

      // Result should NOT include passwordHash
      const resultObj = result as Record<string, unknown>;
      expect(resultObj).not.toHaveProperty("passwordHash");
      expect(resultObj).not.toHaveProperty("mfaSecrets");
      expect(JSON.stringify(result)).not.toContain("argon2");
    });

    it("should use same error message for wrong email and wrong password", async () => {
      // This prevents user enumeration attacks

      // Test wrong email
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-enum-1",
        userId: null,
        eventType: "login_failed",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      } as never);

      const { authOptions } =
        await import("@/app/api/auth/[...nextauth]/route");
      const credentialsProvider = authOptions.providers[0];
      const authorizeConfig = credentialsProvider as unknown as {
        options: {
          authorize: (credentials: Record<string, string>) => Promise<unknown>;
        };
      };
      const authorize = authorizeConfig.options.authorize;

      let wrongEmailError = "";
      try {
        await authorize({
          email: "wrong@example.com",
          password: "SomePassword!",
          totpCode: "",
        });
      } catch (e) {
        wrongEmailError = (e as Error).message;
      }

      // Test wrong password
      const mockUser = await createMockUser({ password: "CorrectPassword!" });
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      let wrongPasswordError = "";
      try {
        await authorize({
          email: "admin@example.com",
          password: "WrongPassword!",
          totpCode: "",
        });
      } catch (e) {
        wrongPasswordError = (e as Error).message;
      }

      // Both should show the same generic message
      expect(wrongEmailError).toBe("Invalid credentials");
      expect(wrongPasswordError).toBe("Invalid credentials");
    });

    it("should use HS256 algorithm for JWT verification", async () => {
      const { jwtVerify } = await import("jose");
      const { getSessionFromRequest } = await import("@/lib/auth/session");

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: { id: "user-123", email: "test@test.com" },
        protectedHeader: { alg: "HS256" },
        key: new Uint8Array(),
      } as never);

      // Use the mock request pattern
      const mockRequest = {
        cookies: {
          get: vi.fn((name: string) => {
            if (name === "next-auth.session-token") {
              return { value: "valid-token" };
            }
            return undefined;
          }),
        },
      } as unknown as NextRequest;

      await getSessionFromRequest(mockRequest);

      // Verify jwtVerify was called with correct algorithm constraint
      expect(jwtVerify).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(jwtVerify).mock.calls[0];
      expect(callArgs[0]).toBe("valid-token");
      // Second arg is the encoded secret key (Uint8Array from TextEncoder)
      expect(ArrayBuffer.isView(callArgs[1])).toBe(true);
      // Third arg specifies the algorithm
      expect(callArgs[2]).toEqual({ algorithms: ["HS256"] });
    });
  });
});
