import { NextRequest, NextResponse } from "next/server";
import { allTrees } from "contentlayer/generated";
import type { FamiliesResponse } from "@/types/api";

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

function getClientId(request: NextRequest): string {
  const apiKey = request.headers.get("X-API-Key");
  if (apiKey) return `key:${apiKey}`;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";
  return `ip:${ip}`;
}

function checkRateLimit(clientId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(clientId);
  if (!record || record.resetAt < now) {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + RATE_WINDOW });
    return {
      allowed: true,
      remaining: RATE_LIMIT - 1,
      resetAt: now + RATE_WINDOW,
    };
  }
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  record.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT - record.count,
    resetAt: record.resetAt,
  };
}

function addRateLimitHeaders(
  headers: Headers,
  rateLimit: { remaining: number; resetAt: number }
): void {
  headers.set("X-RateLimit-Limit", String(RATE_LIMIT));
  headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimit.resetAt / 1000)));
}

/**
 * GET /api/v1/families - Get all tree families with species count
 */
export async function GET(request: NextRequest) {
  const clientId = getClientId(request);
  const rateLimit = checkRateLimit(clientId);

  if (!rateLimit.allowed) {
    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
        _links: { documentation: "/api/docs" },
      },
      { status: 429, headers }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const locale = searchParams.get("locale") || "en";

    // Get unique trees for the locale (avoid counting both en and es)
    const treesInLocale = allTrees.filter((t) => t.locale === locale);

    // Build family counts
    const familyCounts = new Map<string, number>();
    for (const tree of treesInLocale) {
      const current = familyCounts.get(tree.family) || 0;
      familyCounts.set(tree.family, current + 1);
    }

    // Sort by name
    const families = Array.from(familyCounts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, speciesCount]) => ({
        name,
        speciesCount,
        _links: {
          species: `${baseUrl}/api/v1/trees?family=${encodeURIComponent(name)}&locale=${locale}`,
        },
      }));

    const response: FamiliesResponse = {
      data: families,
      meta: {
        totalFamilies: families.length,
        totalSpecies: treesInLocale.length,
        locale,
      },
      _links: {
        self: `${baseUrl}/api/v1/families?locale=${locale}`,
        trees: `${baseUrl}/api/v1/trees?locale=${locale}`,
      },
    };

    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=7200");

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        },
        _links: { documentation: "/api/docs" },
      },
      { status: 500 }
    );
  }
}
