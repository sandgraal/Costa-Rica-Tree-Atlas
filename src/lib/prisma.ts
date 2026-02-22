/**
 * Prisma Client Singleton
 *
 * Ensures a single Prisma Client instance is used across the application
 * to prevent connection pool exhaustion in serverless environments.
 *
 * Uses the Neon serverless driver adapter (required by Prisma 7).
 * Gracefully degrades when database env vars are not present at build time
 * so the app still builds and runs without a database.
 *
 * Runtime connection uses the pooled URL (NEON_DATABASE_URL) which is
 * optimised for serverless/edge environments, with a fallback to DATABASE_URL
 * for local/non-Neon environments.
 *
 * We intentionally use `any` types here because the Prisma generated client
 * types are only available after `prisma generate` runs, which requires a
 * database URL. Using explicit type imports would break the build in
 * environments without a database.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let prisma: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaNeon } = require("@prisma/adapter-neon");

  if (!PrismaClient) throw new Error("PrismaClient not found");

  const connectionString =
    process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!connectionString) throw new Error("No database URL set");

  const prismaClientSingleton = () => {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  };

  const g = globalThis as any;
  prisma = g.prismaGlobal ?? prismaClientSingleton();

  if (process.env.NODE_ENV !== "production") g.prismaGlobal = prisma;
} catch (error) {
  // Prisma Client or database URL not available — admin features disabled
  const reason = error instanceof Error ? error.message : String(error);
  console.warn(
    `Prisma Client not available (${reason}). Admin authentication features are disabled.`
  );
  console.warn(
    "To enable admin features, set NEON_DATABASE_URL or DATABASE_URL and rebuild the application."
  );

  prisma = new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Prisma Client is not available. NEON_DATABASE_URL or DATABASE_URL was not set during build. Admin features are disabled."
        );
      },
    }
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export default prisma;

