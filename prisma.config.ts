/**
 * Prisma 7 Configuration
 * https://pris.ly/d/config-datasource
 */
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use the unpooled (direct) connection for migrations; pooled URL used by PrismaClient at runtime
    url: env("NEON_DATABASE_URL_UNPOOLED"),
  },
});
