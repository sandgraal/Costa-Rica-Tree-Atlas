/**
 * Prisma 7 Configuration
 * https://pris.ly/d/config-datasource
 */
import { defineConfig } from "prisma/config";

const migrationUrl =
  process.env.NEON_DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "Database URL not found. Set NEON_DATABASE_URL_UNPOOLED (Neon direct connection) " +
      "or DATABASE_URL (local PostgreSQL) before running Prisma commands."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer the unpooled (direct) connection for migrations.
    // Falls back to DATABASE_URL for local development without a Neon account.
    url: migrationUrl,
  },
});
