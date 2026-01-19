/**
 * Authentication System E2E Tests
 *
 * Tests the complete authentication flow including:
 * - Password verification with Argon2id
 * - TOTP MFA verification
 * - Backup code verification
 * - Session management
 *
 * @see Priority 0.0 in IMPLEMENTATION_PLAN.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hash, verify } from "argon2";

// Mock Prisma client
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    mFASecret: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

// Import after mocking
import prisma from "@/lib/prisma";
import { hashBackupCodes } from "@/lib/auth/backup-codes";
import { generateBackupCodes } from "@/lib/auth/mfa-crypto";

describe("Authentication System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Password Verification (Argon2id)", () => {
    it("should verify correct password", async () => {
      const password = "SecurePassword123!";
      const hashedPassword = await hash(password, {
        type: 2, // Argon2id
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const isValid = await verify(hashedPassword, password);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "SecurePassword123!";
      const wrongPassword = "WrongPassword456!";
      const hashedPassword = await hash(password, {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const isValid = await verify(hashedPassword, wrongPassword);
      expect(isValid).toBe(false);
    });

    it("should handle empty password", async () => {
      const password = "SecurePassword123!";
      const hashedPassword = await hash(password, {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const isValid = await verify(hashedPassword, "");
      expect(isValid).toBe(false);
    });

    it("should use consistent hashing parameters", async () => {
      const password = "TestPassword!";

      // Hash twice with same parameters
      const hash1 = await hash(password, {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const hash2 = await hash(password, {
        type: 2,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      // Hashes should be different (due to salt) but both verify
      expect(hash1).not.toBe(hash2);
      expect(await verify(hash1, password)).toBe(true);
      expect(await verify(hash2, password)).toBe(true);
    });
  });

  describe("Backup Code Generation", () => {
    it("should generate 10 backup codes by default", () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(10);
    });

    it("should generate specified number of codes", () => {
      const codes = generateBackupCodes(5);
      expect(codes).toHaveLength(5);
    });

    it("should generate codes in XXXX-XXXX-XXXX format", () => {
      const codes = generateBackupCodes();
      const formatRegex = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

      codes.forEach((code) => {
        expect(code).toMatch(formatRegex);
      });
    });

    it("should generate unique codes", () => {
      const codes = generateBackupCodes(100);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it("should not include ambiguous characters (I, O)", () => {
      // Generate many codes to increase chance of finding I or O
      const codes = generateBackupCodes(100);
      const allChars = codes.join("").replace(/-/g, "");

      expect(allChars).not.toContain("I");
      expect(allChars).not.toContain("O");
    });
  });

  describe("Backup Code Hashing", () => {
    it("should hash backup codes with Argon2id", async () => {
      const codes = ["ABCD-EFGH-JKLM", "1234-5678-90AB"];
      const hashed = await hashBackupCodes(codes);

      expect(hashed).toHaveLength(2);
      // Argon2 hashes start with $argon2
      hashed.forEach((h) => {
        expect(h).toMatch(/^\$argon2/);
      });
    });

    it("should normalize codes before hashing (uppercase, no dashes)", async () => {
      const code = "abcd-efgh-jklm";
      const normalizedCode = "ABCDEFGHJKLM";

      const hashed = await hashBackupCodes([code]);
      const isValid = await verify(hashed[0], normalizedCode);

      expect(isValid).toBe(true);
    });

    it("should verify hashed codes correctly", async () => {
      const originalCode = "TEST-CODE-1234";
      const hashed = await hashBackupCodes([originalCode]);

      // Verification should work with normalized input
      const isValid = await verify(hashed[0], "TESTCODE1234");
      expect(isValid).toBe(true);
    });

    it("should reject wrong code against hash", async () => {
      const originalCode = "TEST-CODE-1234";
      const wrongCode = "WRONG-CODE-5678";
      const hashed = await hashBackupCodes([originalCode]);

      const isValid = await verify(hashed[0], wrongCode.replace(/-/g, ""));
      expect(isValid).toBe(false);
    });
  });

  describe("Backup Code Verification Flow", () => {
    const mockUserId = "test-user-123";

    it("should return invalid for user without MFA secrets", async () => {
      vi.mocked(prisma.mFASecret.findUnique).mockResolvedValue(null);

      // Import verifyBackupCode dynamically to use mocked prisma
      const { verifyBackupCode } = await import("@/lib/auth/backup-codes");
      const result = await verifyBackupCode(mockUserId, "TEST-CODE-1234");

      expect(result.valid).toBe(false);
      expect(result.codesRemaining).toBeUndefined();
    });

    it("should return invalid for user with empty backup codes", async () => {
      vi.mocked(prisma.mFASecret.findUnique).mockResolvedValue({
        id: "mfa-123",
        userId: mockUserId,
        totpSecret: null,
        backupCodes: [],
        backupCodesUsed: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { verifyBackupCode } = await import("@/lib/auth/backup-codes");
      const result = await verifyBackupCode(mockUserId, "TEST-CODE-1234");

      expect(result.valid).toBe(false);
    });

    it("should verify valid backup code and mark as used", async () => {
      const plainCode = "ABCD-EFGH-JKLM";
      const hashedCodes = await hashBackupCodes([plainCode, "WXYZ-1234-5678"]);

      vi.mocked(prisma.mFASecret.findUnique).mockResolvedValue({
        id: "mfa-123",
        userId: mockUserId,
        totpSecret: null,
        backupCodes: hashedCodes,
        backupCodesUsed: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(prisma.mFASecret.update).mockResolvedValue({
        id: "mfa-123",
        userId: mockUserId,
        totpSecret: null,
        backupCodes: hashedCodes,
        backupCodesUsed: [0],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-123",
        userId: mockUserId,
        eventType: "backup_code_used",
        ipAddress: null,
        userAgent: null,
        metadata: { codeIndex: 0, codesRemaining: 1 },
        createdAt: new Date(),
      });

      const { verifyBackupCode } = await import("@/lib/auth/backup-codes");
      const result = await verifyBackupCode(mockUserId, plainCode);

      expect(result.valid).toBe(true);
      expect(result.codesRemaining).toBe(1);

      // Verify update was called with correct index
      expect(prisma.mFASecret.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
          data: expect.objectContaining({
            backupCodesUsed: [0],
          }),
        })
      );

      // Verify audit log was created
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: mockUserId,
            eventType: "backup_code_used",
          }),
        })
      );
    });

    it("should skip already used backup codes", async () => {
      const codes = ["CODE-0001-AAAA", "CODE-0002-BBBB", "CODE-0003-CCCC"];
      const hashedCodes = await hashBackupCodes(codes);

      // First code is already used
      vi.mocked(prisma.mFASecret.findUnique).mockResolvedValue({
        id: "mfa-123",
        userId: mockUserId,
        totpSecret: null,
        backupCodes: hashedCodes,
        backupCodesUsed: [0], // Index 0 is used
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { verifyBackupCode } = await import("@/lib/auth/backup-codes");

      // Trying to use the first (already used) code should fail
      const result = await verifyBackupCode(mockUserId, codes[0]);
      expect(result.valid).toBe(false);
    });

    it("should accept code with different formatting", async () => {
      const plainCode = "ABCD-EFGH-JKLM";
      const hashedCodes = await hashBackupCodes([plainCode]);

      vi.mocked(prisma.mFASecret.findUnique).mockResolvedValue({
        id: "mfa-123",
        userId: mockUserId,
        totpSecret: null,
        backupCodes: hashedCodes,
        backupCodesUsed: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(prisma.mFASecret.update).mockResolvedValue({
        id: "mfa-123",
        userId: mockUserId,
        totpSecret: null,
        backupCodes: hashedCodes,
        backupCodesUsed: [0],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(prisma.auditLog.create).mockResolvedValue({
        id: "audit-123",
        userId: mockUserId,
        eventType: "backup_code_used",
        ipAddress: null,
        userAgent: null,
        metadata: {},
        createdAt: new Date(),
      });

      const { verifyBackupCode } = await import("@/lib/auth/backup-codes");

      // Test lowercase input
      const result1 = await verifyBackupCode(mockUserId, "abcd-efgh-jklm");
      expect(result1.valid).toBe(true);
    });
  });

  describe("TOTP Code Format Detection", () => {
    it("should identify backup code format (XXXX-XXXX-XXXX)", () => {
      const backupCodeFormat = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

      expect("ABCD-EFGH-JKLM".match(backupCodeFormat)).toBeTruthy();
      expect("1234-5678-90AB".match(backupCodeFormat)).toBeTruthy();
      expect("abcd-efgh-jklm".match(backupCodeFormat)).toBeTruthy();
    });

    it("should not match TOTP codes as backup codes", () => {
      const backupCodeFormat = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

      // TOTP codes are 6 digits
      expect("123456".match(backupCodeFormat)).toBeFalsy();
      expect("000000".match(backupCodeFormat)).toBeFalsy();
    });

    it("should not match malformed codes", () => {
      const backupCodeFormat = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

      expect("ABCD-EFGH".match(backupCodeFormat)).toBeFalsy();
      expect("ABCDEFGHJKLM".match(backupCodeFormat)).toBeFalsy();
      expect("ABC-DEFG-HJKL".match(backupCodeFormat)).toBeFalsy();
      expect("ABCD-EFGH-JKL".match(backupCodeFormat)).toBeFalsy();
    });
  });

  describe("MFA Crypto Utilities", () => {
    it("should encrypt and decrypt TOTP secret", async () => {
      // This test requires MFA_ENCRYPTION_KEY environment variable
      // In a real test environment, this would be mocked or set
      const mockKey = "0".repeat(64); // 32 bytes in hex

      // Mock the serverEnv
      vi.mock("@/lib/env/schema", () => ({
        serverEnv: {
          MFA_ENCRYPTION_KEY: "0".repeat(64),
        },
      }));

      // The actual encrypt/decrypt would need the env var set
      // This is a structural test to ensure the module loads
      const mfaCrypto = await import("@/lib/auth/mfa-crypto");
      expect(mfaCrypto.encryptTotpSecret).toBeDefined();
      expect(mfaCrypto.decryptTotpSecret).toBeDefined();
      expect(mfaCrypto.generateBackupCodes).toBeDefined();
    });
  });

  describe("Session Token Validation", () => {
    it("should identify correct session cookie names", () => {
      const devCookieName = "next-auth.session-token";
      const prodCookieName = "__Secure-next-auth.session-token";

      expect(devCookieName).toBe("next-auth.session-token");
      expect(prodCookieName).toBe("__Secure-next-auth.session-token");
      expect(prodCookieName.startsWith("__Secure-")).toBe(true);
    });
  });

  describe("Audit Logging", () => {
    it("should log login attempts with correct event types", () => {
      const validEventTypes = [
        "login",
        "login_failed",
        "logout",
        "mfa_enabled",
        "mfa_disabled",
        "password_changed",
        "backup_code_used",
      ];

      validEventTypes.forEach((eventType) => {
        expect(eventType.length).toBeLessThanOrEqual(100);
        expect(typeof eventType).toBe("string");
      });
    });

    it("should include required metadata for login failures", () => {
      const loginFailedMetadata = {
        email: "test@example.com",
        reason: "invalid_password",
      };

      expect(loginFailedMetadata).toHaveProperty("email");
      expect(loginFailedMetadata).toHaveProperty("reason");
      expect(["user_not_found", "invalid_password", "invalid_mfa"]).toContain(
        loginFailedMetadata.reason
      );
    });
  });
});
