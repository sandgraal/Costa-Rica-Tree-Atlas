#!/usr/bin/env node
/**
 * Reset Admin Password Script
 *
 * Resets the password for an existing admin user.
 * Usage: node scripts/reset-admin-password.mjs <email> <new-password>
 */

import { hash } from "argon2";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { loadEnv } from "./lib/env.mjs";

const env = { ...loadEnv(), ...process.env };
const connectionString =
  env.NEON_DATABASE_URL_UNPOOLED ?? env.NEON_DATABASE_URL ?? env.DATABASE_URL;
if (!connectionString) {
  console.error(
    "No database URL found in environment or .env files. Set NEON_DATABASE_URL or DATABASE_URL."
  );
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function resetPassword(email, newPassword) {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Hash the new password with Argon2id
    const passwordHash = await hash(newPassword, {
      type: 2, // Argon2id
      memoryCost: 19456, // 19 MiB
      timeCost: 2,
      parallelism: 1,
    });

    // Update the password
    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    // Log the change
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        eventType: "password_reset",
        metadata: {
          email,
          resetAt: new Date().toISOString(),
        },
      },
    });

    console.log(`✅ Password reset successfully for ${email}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log(`\n⚠️  Please change this password after first login!`);
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const [email, newPassword] = process.argv.slice(2);

if (!email || !newPassword) {
  console.log(
    "Usage: node scripts/reset-admin-password.mjs <email> <new-password>"
  );
  console.log(
    "Example: node scripts/reset-admin-password.mjs admin@example.com newpassword123"
  );
  process.exit(1);
}

resetPassword(email, newPassword);
