/**
 * MFA Disable API
 *
 * Disables MFA for the authenticated user after password verification.
 * Requires authentication via NextAuth session.
 *
 * Usage:
 * POST /api/auth/mfa/disable
 * Headers: Cookie: next-auth.session-token=...
 * Body: { password: "current-password" }
 *
 * Returns: { success: true, mfaEnabled: false }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { verify } from "argon2";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const disableSchema = z.object({
  password: z.string().min(1, "Password is required"),
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
    const validationResult = disableSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // 3. Get user with MFA secret
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { mfaSecrets: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.mfaEnabled) {
      return NextResponse.json(
        {
          error: "MFA not enabled",
          message: "Two-factor authentication is not currently enabled",
        },
        { status: 400 }
      );
    }

    // 4. Verify password
    const isValidPassword = await verify(user.passwordHash, password);

    if (!isValidPassword) {
      // Log failed attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          eventType: "mfa_disable_failed",
          ipAddress:
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            null,
          userAgent: request.headers.get("user-agent") || null,
          metadata: {
            reason: "invalid_password",
            timestamp: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json(
        { error: "Invalid password", message: "Password verification failed" },
        { status: 403 }
      );
    }

    // 5. Disable MFA and delete secret
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { mfaEnabled: false },
      }),
      prisma.mFASecret.delete({
        where: { userId: user.id },
      }),
    ]);

    // 6. Log the event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        eventType: "mfa_disabled",
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

    return NextResponse.json({
      success: true,
      message: "Two-factor authentication disabled successfully",
      mfaEnabled: false,
    });
  } catch (error) {
    console.error("MFA disable error:", error);
    return NextResponse.json(
      {
        error: "Disable failed",
        message: "An error occurred while disabling MFA",
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
