/**
 * Prisma Client Singleton
 *
 * Ensures a single Prisma Client instance is used across the application
 * to prevent connection pool exhaustion in serverless environments.
 *
 * Uses the node-postgres driver adapter (Prisma 7 requires a driver adapter).
 * Gracefully degrades when database env vars are not present at build time so
 * the app still builds and runs without a database.
 *
 * Connection strategy
 * -------------------
 * `DATABASE_URL` should point at Supabase's transaction-mode pooler
 * (Supavisor, port 6543). Serverless functions open and drop connections
 * constantly, and Postgres cannot take that directly. `DIRECT_URL` (port 5432)
 * is used only by `prisma migrate`, which needs a session-mode connection.
 *
 * `max: 1` is deliberate: each serverless invocation gets its own process, so a
 * larger local pool multiplies across concurrent invocations and exhausts the
 * upstream pooler.
 *
 * We intentionally use `any` types here because the Prisma generated client
 * types are only available after `prisma generate` runs, which requires a
 * database URL. Using explicit type imports would break the build in
 * environments without a database.
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 * @see docs/DATABASE.md
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

let prisma: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");

  if (!PrismaClient) throw new Error("PrismaClient not found");

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const prismaClientSingleton = () => {
    const adapter = new PrismaPg({
      connectionString,
      // One connection per serverless invocation — see note above.
      max: 1,
    });
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
    "To enable admin features, set DATABASE_URL and rebuild the application."
  );

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
