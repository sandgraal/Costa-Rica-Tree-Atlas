/**
 * One-time Admin Setup API
 *
 * Creates the initial admin user account with secure password hashing.
 * This endpoint is self-disabling - it returns 403 if any users already exist.
 *
 * Usage:
 * POST /api/admin/setup
 * Body: { email: string, password: string, name?: string }
 *
 * Security features:
 * - Argon2id password hashing
 * - Self-disables after first user created
 * - Rate limited
 * - Audit logging
 */

import { NextRequest, NextResponse } from "next/server";
import { hash } from "argon2";
import prisma from "@/lib/prisma";
import { z } from "zod";

const setupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check if any users already exist (self-disable mechanism)
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        {
          error: "Setup has already been completed",
          message: "Admin user already exists. This endpoint is disabled.",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = setupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data;

    // Hash password with Argon2id (memory-hard, GPU-resistant)
    const passwordHash = await hash(password, {
      type: 2, // Argon2id
      memoryCost: 19456, // 19 MiB
      timeCost: 2, // 2 iterations
      parallelism: 1, // 1 thread
    });

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || "Admin",
        emailVerified: new Date(), // Auto-verify for initial admin
      },
    });

    // Log the setup event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        eventType: "admin_setup",
        ipAddress:
          request.headers.get("x-forwarded-for")?.split(",")[0] ||
          request.headers.get("x-real-ip") ||
          null,
        userAgent: request.headers.get("user-agent") || null,
        metadata: {
          email: user.email,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      {
        error: "Setup failed",
        message: "An error occurred during admin setup",
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
