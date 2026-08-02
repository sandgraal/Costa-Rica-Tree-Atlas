import { NextRequest, NextResponse } from "next/server";
import { allTrees } from "contentlayer/generated";
import { captureApiError } from "@/lib/error-tracking";
import {
  getClientId,
  checkRateLimit,
  addRateLimitHeaders,
} from "@/lib/api-rate-limit";
import { requireApiV1Access } from "@/lib/api-access";
import type { FamiliesResponse } from "@/types/api";

/**
 * GET /api/v1/families - Get all tree families with species count
 */
export async function GET(request: NextRequest) {
  const accessDenied = await requireApiV1Access(request);
  if (accessDenied) return accessDenied;

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
    captureApiError(error, "/api/v1/families", "GET");
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
