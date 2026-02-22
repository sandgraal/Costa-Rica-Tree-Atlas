/**
 * Prisma 7 Configuration
 * https://pris.ly/d/config-datasource
 */
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the unpooled (direct) connection for migrations.
    // Falls back to DATABASE_URL for local/non-Neon environments.
    url: process.env.NEON_DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  },
});
