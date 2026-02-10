/**
 * Prisma Client Singleton
 *
 * Ensures a single Prisma Client instance is used across the application
 * to prevent connection pool exhaustion in serverless environments.
 *
 * NOTE: This module gracefully handles missing Prisma Client (when DATABASE_URL is not set).
 * Admin features will be unavailable but the application will still build and run.
 *
 * We intentionally use `any` types here because the Prisma generated client types
 * are only available after `prisma generate` runs, which requires DATABASE_URL.
 * Using explicit type imports would break the build in environments without a database.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let PrismaClient: any;
let prisma: any;

try {
  // Try to import Prisma Client - may not be available if DATABASE_URL wasn't set during build
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- require() is needed for conditional import
  const prismaModule = require("@prisma/client");
  PrismaClient = prismaModule.PrismaClient;

  if (!PrismaClient) {
    throw new Error("PrismaClient not found in @prisma/client module");
  }

  const prismaClientSingleton = () => {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  };

  const g = globalThis as any;
  prisma = g.prismaGlobal ?? prismaClientSingleton();

  if (process.env.NODE_ENV !== "production") g.prismaGlobal = prisma;
} catch (_error) {
  // Prisma Client not available - admin features will be disabled
  console.warn(
    "Prisma Client not available. Admin authentication features are disabled."
  );
  console.warn(
    "To enable admin features, set DATABASE_URL and rebuild the application."
  );

  // Create a proxy that throws helpful errors if someone tries to use it
  prisma = new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Prisma Client is not available. DATABASE_URL was not set during build. Admin features are disabled."
        );
      },
    }
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export default prisma;
