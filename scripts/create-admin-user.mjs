/**
 * Create Admin User Script
 *
 * Creates an admin user with email/password authentication.
 * Run with: node scripts/create-admin-user.mjs
 */

import { readFileSync } from "fs";
import { hash } from "argon2";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { randomBytes } from "crypto";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

// Load .env / .env.local for the connection string
function parseEnvFile(file) {
  try {
    return Object.fromEntries(
      readFileSync(file, "utf8")
        .split("\n")
        .filter((l) => l && !l.startsWith("#") && l.includes("="))
        .map((l) => {
          const i = l.indexOf("=");
          return [
            l.slice(0, i).trim(),
            l
              .slice(i + 1)
              .trim()
              .replace(/^"|"$/g, ""),
          ];
        })
    );
  } catch {
    // File not found or unreadable; ignore and return empty object
    return {};
  }
}

function loadEnv() {
  // Merge base .env first, then override with .env.local if present
  const env = {};
  for (const file of [".env", ".env.local"]) {
    Object.assign(env, parseEnvFile(file));
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const connectionString =
  env.NEON_DATABASE_URL_UNPOOLED ?? env.NEON_DATABASE_URL ?? env.DATABASE_URL;
if (!connectionString) {
  console.error("No database URL found in .env");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });
const rl = readline.createInterface({ input, output });

// Simple CUID generator (compatible with Prisma's default)
function createId() {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(12).toString("base64url").substring(0, 16);
  return `c${timestamp}${randomPart}`;
}

async function createAdminUser() {
  console.log("\n🔐 Costa Rica Tree Atlas - Create Admin User\n");

  try {
    // Get user input
    const email = await rl.question("Email: ");
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const name = await rl.question("Name (optional): ");
    const password = await rl.question("Password (min 8 characters): ");

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Hash password with Argon2id
    console.log("\n⏳ Hashing password...");
    const passwordHash = await hash(password, {
      type: 2, // Argon2id
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    // Create user
    console.log("⏳ Creating user...");
    const user = await prisma.user.create({
      data: {
        id: createId(),
        email,
        name: name || null,
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
        metadata: { email: user.email, method: "script" },
      },
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("\n📋 User Details:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || "(not set)"}`);
    console.log(`   MFA: ${user.mfaEnabled ? "Enabled" : "Disabled"}`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);
    console.log(
      "\n🔗 You can now login at: http://localhost:3000/admin/login\n"
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

createAdminUser();
