/**
 * Search Analytics API
 *
 * POST - Record an anonymous search query (public, rate-limited)
 * GET  - Retrieve aggregated analytics (admin-only)
 *
 * Anonymous searches are tracked by session hash to enable
 * content gap analysis and search UX improvement.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { rateLimit } from "@/lib/ratelimit";
import { captureApiError } from "@/lib/error-tracking";
import prisma from "@/lib/prisma";

// Type-safe Prisma client with SearchQuery model
type PrismaWithSearchQuery = {
  searchQuery: {
    create: (args: {
      data: {
        query: string;
        normalizedQuery: string;
        locale: string;
        resultsCount: number;
        selectedResult?: string | null;
        sessionId: string;
      };
    }) => Promise<unknown>;
    groupBy: (args: {
      by: string[];
      _count: Record<string, boolean>;
      _avg?: Record<string, boolean>;
      where?: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
      take?: number;
    }) => Promise<
      Array<{
        normalizedQuery?: string;
        locale?: string;
        _count: Record<string, number>;
        _avg?: Record<string, number | null>;
      }>
    >;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    findMany: (args: {
      where?: Record<string, unknown>;
      select?: Record<string, boolean>;
      orderBy?: Record<string, unknown>;
      take?: number;
      distinct?: string[];
    }) => Promise<Array<Record<string, unknown>>>;
  };
  $queryRaw: <T = unknown>(
    query: TemplateStringsArray,
    ...values: unknown[]
  ) => Promise<T>;
};

/** Check if search_queries table exists */
async function tableExists(): Promise<boolean> {
  try {
    await (prisma as unknown as PrismaWithSearchQuery)
      .$queryRaw`SELECT 1 FROM search_queries LIMIT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * POST /api/search-analytics
 *
 * Records an anonymous search event. Body:
 * { query, locale, resultsCount, selectedResult?, sessionId }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const rl = await rateLimit(request, "search");
    if ("response" in rl) return rl.response;

    const body = await request.json();
    const { query, locale, resultsCount, selectedResult, sessionId } = body;

    // Validate required fields
    if (
      typeof query !== "string" ||
      typeof locale !== "string" ||
      typeof resultsCount !== "number" ||
      typeof sessionId !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid fields" },
        { status: 400 }
      );
    }

    // Sanitize
    const trimmedQuery = query.trim().slice(0, 500);
    if (trimmedQuery.length === 0) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }

    if (!["en", "es"].includes(locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    // Ensure table exists
    if (!(await tableExists())) {
      // Silently succeed — table not yet migrated
      return NextResponse.json({ ok: true }, { headers: rl.headers });
    }

    const db = prisma as unknown as PrismaWithSearchQuery;
    await db.searchQuery.create({
      data: {
        query: trimmedQuery,
        normalizedQuery: trimmedQuery.toLowerCase(),
        locale,
        resultsCount: Math.max(0, resultsCount),
        selectedResult: selectedResult || null,
        sessionId: sessionId.slice(0, 64),
      },
    });

    return NextResponse.json({ ok: true }, { headers: rl.headers });
  } catch (error) {
    captureApiError(error, "/api/search-analytics", "POST");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/search-analytics
 *
 * Admin-only. Returns aggregated search analytics.
 * Query params:
 *   days  — lookback window (default 30)
 *   limit — top-N queries (default 50)
 *
 * NOTE: Auth checks that the caller is any authenticated user. This app uses a
 * single-credentials provider, so in practice only the one registered admin
 * account can log in.  If multi-user accounts are ever introduced, add an
 * explicit role or email allowlist check here (consistent with other
 * /api/admin/* routes in this codebase).
 */
export async function GET(request: NextRequest) {
  try {
    // Admin auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await tableExists())) {
      return NextResponse.json({
        data: {
          totalSearches: 0,
          uniqueQueries: 0,
          topQueries: [],
          zeroResultQueries: [],
          localeBreakdown: [],
          recentSearches: [],
        },
      });
    }

    const { searchParams } = request.nextUrl;
    const days = Math.min(
      Math.max(parseInt(searchParams.get("days") || "30", 10), 1),
      365
    );
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "50", 10), 1),
      200
    );

    const since = new Date();
    since.setDate(since.getDate() - days);

    const db = prisma as unknown as PrismaWithSearchQuery;

    // Run queries in parallel
    const [
      totalSearches,
      topQueries,
      uniqueQueryCount,
      zeroResultQueries,
      localeBreakdown,
      recentSearches,
    ] = await Promise.all([
      // Total search count
      db.searchQuery.count({
        where: { createdAt: { gte: since } },
      }),

      // Top queries by frequency
      db.searchQuery.groupBy({
        by: ["normalizedQuery"],
        _count: { normalizedQuery: true },
        _avg: { resultsCount: true },
        where: { createdAt: { gte: since } },
        orderBy: { _count: { normalizedQuery: "desc" } },
        take: limit,
      }),

      // Distinct query count — COUNT(DISTINCT) at the DB level so only a
      // scalar is returned, regardless of window size or limit value.
      db.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT normalized_query)::bigint AS count
        FROM search_queries
        WHERE created_at >= ${since}
      `,

      // Zero-result queries
      db.searchQuery.groupBy({
        by: ["normalizedQuery"],
        _count: { normalizedQuery: true },
        where: {
          createdAt: { gte: since },
          resultsCount: 0,
        },
        orderBy: { _count: { normalizedQuery: "desc" } },
        take: limit,
      }),

      // Breakdown by locale
      db.searchQuery.groupBy({
        by: ["locale"],
        _count: { locale: true },
        where: { createdAt: { gte: since } },
      }),

      // Most recent searches (for live feed)
      db.searchQuery.findMany({
        where: { createdAt: { gte: since } },
        select: {
          query: true,
          locale: true,
          resultsCount: true,
          selectedResult: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return NextResponse.json({
      data: {
        totalSearches,
        uniqueQueries: Number(uniqueQueryCount[0]?.count ?? 0),
        topQueries: topQueries.map((q) => ({
          query: q.normalizedQuery,
          count: q._count.normalizedQuery,
          avgResults: q._avg?.resultsCount ?? null,
        })),
        zeroResultQueries: zeroResultQueries.map((q) => ({
          query: q.normalizedQuery,
          count: q._count.normalizedQuery,
        })),
        localeBreakdown: localeBreakdown.map((l) => ({
          locale: l.locale,
          count: l._count.locale,
        })),
        recentSearches,
      },
    });
  } catch (error) {
    captureApiError(error, "/api/search-analytics", "GET");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
