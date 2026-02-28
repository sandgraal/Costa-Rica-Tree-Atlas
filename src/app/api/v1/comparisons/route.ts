/**
 * Public API — List Comparisons
 *
 * GET /api/v1/comparisons — paginated list with filtering by species,
 *     difficulty, tag, and free-text search.
 *
 * Part of P6.3: Public API for researchers.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  allSpeciesComparisons,
  type SpeciesComparison,
} from "contentlayer/generated";
import { captureApiError } from "@/lib/error-tracking";
import {
  getClientId,
  checkRateLimit,
  addRateLimitHeaders,
} from "@/lib/api-rate-limit";
import type {
  ComparisonAPIResponse,
  ComparisonFilterOptions,
  PaginatedResponse,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function transformComparison(
  c: SpeciesComparison,
  baseUrl: string
): ComparisonAPIResponse {
  return {
    slug: c.slug,
    locale: c.locale,
    title: c.title,
    species: c.species,
    keyDifference: c.keyDifference,
    description: c.description,
    difficulty: c.difficulty,
    confusionRating: c.confusionRating,
    comparisonTags: c.comparisonTags,
    seasonalNote: c.seasonalNote,
    publishedAt: c.publishedAt,
    _links: {
      self: `${baseUrl}/api/v1/comparisons/${c.slug}?locale=${c.locale}`,
      html: `${baseUrl}/${c.locale}/compare/${c.slug}`,
      species: c.species.map((s) => ({
        slug: s,
        url: `${baseUrl}/api/v1/trees/${s}?locale=${c.locale}`,
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

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
          details: {
            retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
          },
        },
        _links: { documentation: "/api/docs" },
      },
      { status: 429, headers }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Parse filters
    const filters: ComparisonFilterOptions = {
      locale: (searchParams.get("locale") as "en" | "es") || undefined,
      species: searchParams.get("species") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      tag: searchParams.get("tag") || undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: Math.min(
        Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1),
        100
      ),
      sort:
        (searchParams.get("sort") as ComparisonFilterOptions["sort"]) ||
        "title",
      order: (searchParams.get("order") as "asc" | "desc") || "asc",
    };

    let comparisons = [...allSpeciesComparisons];

    // Locale
    if (filters.locale) {
      comparisons = comparisons.filter((c) => c.locale === filters.locale);
    }

    // Species filter — show comparisons involving a given tree slug
    if (filters.species) {
      const slug = filters.species.toLowerCase();
      comparisons = comparisons.filter((c) =>
        c.species.some((s) => s.toLowerCase() === slug)
      );
    }

    // Difficulty filter
    if (filters.difficulty) {
      const diff = filters.difficulty.toLowerCase();
      comparisons = comparisons.filter(
        (c) => c.difficulty?.toLowerCase() === diff
      );
    }

    // Tag filter
    if (filters.tag) {
      const tag = filters.tag.toLowerCase();
      comparisons = comparisons.filter((c) =>
        c.comparisonTags?.some((t) => t.toLowerCase() === tag)
      );
    }

    // Free-text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      comparisons = comparisons.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.keyDifference.toLowerCase().includes(q) ||
          c.species.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Sort
    const sortField = filters.sort || "title";
    const sortOrder = filters.order === "desc" ? -1 : 1;
    comparisons.sort((a, b) => {
      const aVal = a[sortField as keyof SpeciesComparison] ?? "";
      const bVal = b[sortField as keyof SpeciesComparison] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * sortOrder;
      }
      return String(aVal).localeCompare(String(bVal)) * sortOrder;
    });

    // Pagination
    const total = comparisons.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const paginated = comparisons.slice(offset, offset + pageSize);

    const data = paginated.map((c) => transformComparison(c, baseUrl));

    const buildUrl = (p: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(p));
      return `${baseUrl}/api/v1/comparisons?${params}`;
    };

    const response: PaginatedResponse<ComparisonAPIResponse> = {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      _links: {
        self: buildUrl(page),
        first: buildUrl(1),
        last: buildUrl(totalPages),
        ...(page < totalPages && { next: buildUrl(page + 1) }),
        ...(page > 1 && { prev: buildUrl(page - 1) }),
      },
    };

    // Add rate limit + cache headers
    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    headers.set("Cache-Control", "public, max-age=300, s-maxage=600");

    return NextResponse.json(response, { headers });
  } catch (error) {
    captureApiError(error, "/api/v1/comparisons", "GET");
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
