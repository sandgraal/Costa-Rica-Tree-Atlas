/**
 * Prisma 7 Configuration
 * https://pris.ly/d/config-datasource
 */
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need a SESSION-mode connection, so they use DIRECT_URL
    // (Supabase port 5432) rather than the transaction-mode pooler on 6543
    // that the app runs against. Advisory locks and DDL do not survive a
    // transaction pooler.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
