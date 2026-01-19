/**
 * MFA Setup API
 *
 * Generates TOTP secret, creates QR code, and generates backup codes.
 * Requires authentication via NextAuth session.
 *
 * Usage:
 * POST /api/auth/mfa/setup
 * Headers: Cookie: next-auth.session-token=...
 *
 * Returns: { secret, qrCodeUrl, backupCodes }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { TOTP } from "otplib";
import QRCode from "qrcode";
import { hash } from "argon2";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { encryptTotpSecret, generateBackupCodes } from "@/lib/auth/mfa-crypto";

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

    // 2. Check if MFA is already enabled
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { mfaSecrets: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.mfaEnabled) {
      return NextResponse.json(
        {
          error: "MFA already enabled",
          message:
            "Two-factor authentication is already configured for this account",
        },
        { status: 400 }
      );
    }

    // 3. Generate TOTP secret
    const totp = new TOTP();
    const secret = totp.generateSecret();

    // 4. Create OTP Auth URL for QR code
    const otpauthUrl = totp.toString({
      label: user.email,
      issuer: "Costa Rica Tree Atlas",
      secret,
    });

    // 5. Generate QR code as Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // 6. Generate backup codes
    const backupCodes = generateBackupCodes(10);

    // 7. Hash backup codes with Argon2id
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) =>
        hash(code, {
          type: 2, // Argon2id
          memoryCost: 19456,
          timeCost: 2,
          parallelism: 1,
        })
      )
    );

    // 8. Encrypt TOTP secret
    const encryptedSecret = await encryptTotpSecret(secret);

    // 9. Store in database (but don't enable MFA yet - requires verification)
    await prisma.mFASecret.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totpSecret: encryptedSecret,
        backupCodes: hashedBackupCodes,
        backupCodesUsed: [],
      },
      update: {
        totpSecret: encryptedSecret,
        backupCodes: hashedBackupCodes,
        backupCodesUsed: [],
      },
    });

    // 10. Log the event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        eventType: "mfa_setup_initiated",
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          null,
        userAgent: request.headers.get("user-agent") || null,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });

    // 11. Return secret and QR code (DO NOT store these - show once only)
    return NextResponse.json({
      success: true,
      message: "MFA setup initiated. Please verify with a code to enable.",
      data: {
        secret, // Plain secret for manual entry
        qrCodeDataUrl, // QR code for scanning
        backupCodes, // Plain backup codes (save these securely!)
      },
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        message: "An error occurred during MFA setup",
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
