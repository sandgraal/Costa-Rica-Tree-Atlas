/**
 * MFA Verification API
 *
 * Verifies TOTP code or backup code and enables MFA for the user.
 * Requires authentication via NextAuth session.
 *
 * Usage:
 * POST /api/auth/mfa/verify
 * Headers: Cookie: next-auth.session-token=...
 * Body: { code: "123456" } or { code: "XXXX-XXXX-XXXX" }
 *
 * Returns: { success: true, mfaEnabled: true }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { TOTP } from "@otplib/totp";
import { verify } from "argon2";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decryptTotpSecret } from "@/lib/auth/mfa-crypto";

const verifySchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = verifySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { code } = validationResult.data;

    // 3. Get user and MFA secret
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { mfaSecrets: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const mfaSecret = user.mfaSecrets[0];

    if (!mfaSecret || !mfaSecret.totpSecret) {
      return NextResponse.json(
        {
          error: "MFA not configured",
          message: "Please set up MFA first using /api/auth/mfa/setup",
        },
        { status: 400 }
      );
    }

    // 4. Decrypt TOTP secret
    const decryptedSecret = await decryptTotpSecret(mfaSecret.totpSecret);

    // 5. Try TOTP verification first (6-digit code)
    if (/^\d{6}$/.test(code)) {
      const totp = new TOTP();
      const result = await totp.verify(code, {
        secret: decryptedSecret,
      });

      if (result.valid) {
        // Enable MFA
        await prisma.user.update({
          where: { id: user.id },
          data: { mfaEnabled: true },
        });

        // Log the event
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            eventType: "mfa_enabled",
            ipAddress:
              request.headers.get("x-forwarded-for")?.split(",")[0] ||
              request.headers.get("x-real-ip") ||
              null,
            userAgent: request.headers.get("user-agent") || null,
            metadata: {
              method: "totp",
              timestamp: new Date().toISOString(),
            },
          },
        });

        return NextResponse.json({
          success: true,
          message: "Two-factor authentication enabled successfully",
          mfaEnabled: true,
        });
      }
    }

    // 6. Try backup code verification (format: XXXX-XXXX-XXXX)
    if (/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code.toUpperCase())) {
      const normalizedCode = code.toUpperCase();

      // Check each backup code
      for (let i = 0; i < mfaSecret.backupCodes.length; i++) {
        // Skip already used codes
        if (mfaSecret.backupCodesUsed.includes(i)) {
          continue;
        }

        const isValidBackupCode = await verify(
          // eslint-disable-next-line security/detect-object-injection
          mfaSecret.backupCodes[i],
          normalizedCode
        );

        if (isValidBackupCode) {
          // Mark backup code as used
          await prisma.mFASecret.update({
            where: { id: mfaSecret.id },
            data: {
              backupCodesUsed: {
                push: i,
              },
            },
          });

          // Enable MFA if not already enabled
          if (!user.mfaEnabled) {
            await prisma.user.update({
              where: { id: user.id },
              data: { mfaEnabled: true },
            });
          }

          // Log the event
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              eventType: user.mfaEnabled
                ? "mfa_backup_code_used"
                : "mfa_enabled",
              ipAddress:
                request.headers.get("x-forwarded-for")?.split(",")[0] ||
                request.headers.get("x-real-ip") ||
                null,
              userAgent: request.headers.get("user-agent") || null,
              metadata: {
                method: "backup_code",
                codeIndex: i,
                remainingCodes:
                  mfaSecret.backupCodes.length -
                  mfaSecret.backupCodesUsed.length -
                  1,
                timestamp: new Date().toISOString(),
              },
            },
          });

          return NextResponse.json({
            success: true,
            message: user.mfaEnabled
              ? "Backup code verified successfully"
              : "Two-factor authentication enabled with backup code",
            mfaEnabled: true,
            remainingBackupCodes:
              mfaSecret.backupCodes.length -
              mfaSecret.backupCodesUsed.length -
              1,
          });
        }
      }
    }

    // 7. Invalid code - log failed attempt
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        eventType: "mfa_verification_failed",
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          null,
        userAgent: request.headers.get("user-agent") || null,
        metadata: {
          codeFormat: /^\d{6}$/.test(code) ? "totp" : "backup_code",
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(
      {
        error: "Invalid code",
        message: "The code you entered is incorrect or has expired",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("MFA verification error:", error);
    return NextResponse.json(
      {
        error: "Verification failed",
        message: "An error occurred during MFA verification",
      },
      { status: 500 }
    );
  }
}

// Only POST is allowed
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
