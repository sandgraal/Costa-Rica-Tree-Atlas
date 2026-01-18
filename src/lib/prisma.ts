/**
 * Prisma Client Singleton
 *
 * Ensures a single Prisma Client instance is used across the application
 * to prevent connection pool exhaustion in serverless environments.
 *
 * NOTE: This module gracefully handles missing Prisma Client (when DATABASE_URL is not set).
 * Admin features will be unavailable but the application will still build and run.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

// Import PrismaClient type if available
type PrismaClientType = typeof import("@prisma/client").PrismaClient;
type PrismaClientInstance = InstanceType<PrismaClientType>;
// Proxy type for when Prisma is unavailable
type PrismaClientProxy = Record<string, never>;

// Type declaration for global scope - must be at module level
declare global {
  var prismaGlobal: PrismaClientInstance | undefined;
}

let PrismaClient: PrismaClientType | undefined;
let prisma: PrismaClientInstance | PrismaClientProxy;

try {
  // Try to import Prisma Client - may not be available if DATABASE_URL wasn't set during build
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- require() is needed for conditional import
  const prismaModule = require("@prisma/client") as {
    PrismaClient: PrismaClientType;
  };

  // Verify PrismaClient exists on the module
  if (!prismaModule.PrismaClient) {
    throw new Error("PrismaClient not found in @prisma/client module");
  }

  PrismaClient = prismaModule.PrismaClient;

  const prismaClientSingleton = (): PrismaClientInstance => {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  };

  prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

  if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
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
  ) as PrismaClientProxy;
}

export default prisma;
