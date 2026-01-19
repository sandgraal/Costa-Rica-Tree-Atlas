/**
 * Backup Code Verification
 *
 * Verifies backup codes for MFA authentication.
 * Codes are stored as Argon2id hashes for security.
 */

import { verify, hash } from "argon2";
import prisma from "@/lib/prisma";

export interface BackupCodeResult {
  valid: boolean;
  codesRemaining?: number;
}

/**
 * Verify a backup code for a user
 * If valid, marks the code as used
 */
export async function verifyBackupCode(
  userId: string,
  code: string
): Promise<BackupCodeResult> {
  try {
    // Normalize code (uppercase, remove dashes for comparison)
    const normalizedCode = code.toUpperCase().replace(/-/g, "");

    // Get user's MFA secrets
    const mfaSecret = await prisma.mFASecret.findUnique({
      where: { userId },
    });

    if (
      !mfaSecret ||
      !mfaSecret.backupCodes ||
      mfaSecret.backupCodes.length === 0
    ) {
      return { valid: false };
    }

    // Check each backup code (they're stored as hashes)
    const usedIndices = mfaSecret.backupCodesUsed || [];

    for (let i = 0; i < mfaSecret.backupCodes.length; i++) {
      // Skip already used codes
      if (usedIndices.includes(i)) {
        continue;
      }

      const hashedCode = mfaSecret.backupCodes[i];

      try {
        // Verify against the hash
        const isValid = await verify(hashedCode, normalizedCode);

        if (isValid) {
          // Mark this code as used
          const newUsedIndices = [...usedIndices, i];

          await prisma.mFASecret.update({
            where: { userId },
            data: {
              backupCodesUsed: newUsedIndices,
              updatedAt: new Date(),
            },
          });

          // Log backup code usage
          await prisma.auditLog.create({
            data: {
              userId,
              eventType: "backup_code_used",
              metadata: {
                codeIndex: i,
                codesRemaining:
                  mfaSecret.backupCodes.length - newUsedIndices.length,
              },
            },
          });

          return {
            valid: true,
            codesRemaining:
              mfaSecret.backupCodes.length - newUsedIndices.length,
          };
        }
      } catch {
        // Hash verification failed, continue to next code
        continue;
      }
    }

    // No matching code found
    return { valid: false };
  } catch (error) {
    console.error("[BackupCodes] Verification error:", error);
    return { valid: false };
  }
}

/**
 * Hash backup codes for storage
 * Takes plain text codes and returns Argon2id hashes
 */
export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  const hashedCodes: string[] = [];

  for (const code of codes) {
    // Normalize: uppercase, remove dashes
    const normalizedCode = code.toUpperCase().replace(/-/g, "");

    // Hash with Argon2id
    const hashedCode = await hash(normalizedCode, {
      type: 2, // Argon2id
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });

    hashedCodes.push(hashedCode);
  }

  return hashedCodes;
}

/**
 * Get count of remaining backup codes for a user
 */
export async function getRemainingBackupCodesCount(
  userId: string
): Promise<number> {
  const mfaSecret = await prisma.mFASecret.findUnique({
    where: { userId },
    select: {
      backupCodes: true,
      backupCodesUsed: true,
    },
  });

  if (!mfaSecret || !mfaSecret.backupCodes) {
    return 0;
  }

  const usedCount = mfaSecret.backupCodesUsed?.length || 0;
  return mfaSecret.backupCodes.length - usedCount;
}
