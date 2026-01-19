/**
 * Setup First Admin User
 *
 * Creates the first admin user for the Costa Rica Tree Atlas.
 * Run with: node scripts/setup-first-admin.mjs
 */

import { hash } from "argon2";
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

// Simple CUID generator
function createId() {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(12).toString("base64url").substring(0, 16);
  return `c${timestamp}${randomPart}`;
}

async function setupFirstAdmin() {
  console.log("\n🔐 Setting up first admin user for Costa Rica Tree Atlas\n");

  const email = "admin@costaricatreeatlas.com";
  const name = "Admin";
  const password = "admin123"; // Change this after first login!

  try {
    // Check if any users exist
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log(
        "❌ Admin user already exists. Use create-admin-user.mjs to add more users.\n"
      );
      process.exit(1);
    }

    // Hash password with Argon2id
    console.log("⏳ Hashing password...");
    const passwordHash = await hash(password, {
      type: 2, // Argon2id
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    // Create user
    console.log("⏳ Creating admin user...");
    const user = await prisma.user.create({
      data: {
        id: createId(),
        email,
        name,
        passwordHash,
        mfaEnabled: false,
      },
    });

    // Log creation event
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: user.id,
        eventType: "user_created",
        metadata: { email: user.email, method: "setup-script" },
      },
    });

    console.log("\n✅ First admin user created successfully!");
    console.log("\n📋 Login Credentials:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(
      "\n⚠️  IMPORTANT: Change this password after your first login!"
    );
    console.log("\n🔗 Login at: http://localhost:3000/admin/login\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupFirstAdmin();
