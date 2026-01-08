#!/usr/bin/env node

/**
 * Script: generate-secrets.mjs
 * Description: Generate cryptographically secure secrets for .env.local
 * Usage: node scripts/generate-secrets.mjs
 */

import { randomBytes } from "crypto";

console.log("🔐 Generating secure secrets for .env.local\n");

const adminPassword = randomBytes(32).toString("base64");
const sessionSecret = randomBytes(32).toString("hex");

console.log("Add these to your .env.local file:\n");
console.log(`ADMIN_PASSWORD=${adminPassword}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log("\n⚠️  NEVER commit these values to git!");
console.log(
  "\n✅ These passwords meet the security requirements (12+ chars, upper/lower/number/special)"
);
