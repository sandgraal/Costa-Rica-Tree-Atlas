/**
 * Private API — List Glossary Terms
 *
 * GET /api/v1/glossary — paginated list with filtering by category and search.
 *
 * Internal private API for approved consumers.
 */

import { NextRequest, NextResponse } from "next/server";
import { allGlossaryTerms, type GlossaryTerm } from "contentlayer/generated";
import { captureApiError } from "@/lib/error-tracking";
import {
  getClientId,
  checkRateLimit,
  addRateLimitHeaders,
} from "@/lib/api-rate-limit";
import { requireApiV1Access } from "@/lib/api-access";
import type {
  GlossaryAPIResponse,
  GlossaryFilterOptions,
  PaginatedResponse,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function transformGlossaryTerm(
  t: GlossaryTerm,
  baseUrl: string
): GlossaryAPIResponse {
  return {
    slug: t.slug,
    locale: t.locale,
    term: t.term,
    simpleDefinition: t.simpleDefinition,
    technicalDefinition: t.technicalDefinition,
    category: t.category,
    pronunciation: t.pronunciation,
    etymology: t.etymology,
    exampleSpecies: t.exampleSpecies,
    relatedTerms: t.relatedTerms,
    image: t.image,
    publishedAt: t.publishedAt,
    _links: {
      self: `${baseUrl}/api/v1/glossary/${t.slug}?locale=${t.locale}`,
      html: `${baseUrl}/${t.locale}/glossary/${t.slug}`,
      ...(t.relatedTerms?.length && {
        relatedTerms: t.relatedTerms.map((rt) => ({
          slug: rt,
          url: `${baseUrl}/api/v1/glossary/${rt}?locale=${t.locale}`,
        })),
      }),
      ...(t.exampleSpecies?.length && {
        exampleSpecies: t.exampleSpecies.map((es) => ({
          slug: es,
          url: `${baseUrl}/api/v1/trees/${es}?locale=${t.locale}`,
        })),
      }),
    },
  };
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

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

    const filters: GlossaryFilterOptions = {
      locale: (searchParams.get("locale") as "en" | "es") || undefined,
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: Math.min(
        Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1),
        100
      ),
      sort:
        (searchParams.get("sort") as GlossaryFilterOptions["sort"]) || "term",
      order: (searchParams.get("order") as "asc" | "desc") || "asc",
    };

    let terms = [...allGlossaryTerms];

    // Locale
    if (filters.locale) {
      terms = terms.filter((t) => t.locale === filters.locale);
    }

    // Category filter
    if (filters.category) {
      const cat = filters.category.toLowerCase();
      terms = terms.filter((t) => t.category.toLowerCase() === cat);
    }

    // Free-text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.simpleDefinition.toLowerCase().includes(q) ||
          t.technicalDefinition?.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortField = filters.sort || "term";
    const sortOrder = filters.order === "desc" ? -1 : 1;
    terms.sort((a, b) => {
      const aVal = a[sortField as keyof GlossaryTerm] ?? "";
      const bVal = b[sortField as keyof GlossaryTerm] ?? "";
      return String(aVal).localeCompare(String(bVal)) * sortOrder;
    });

    // Pagination
    const total = terms.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const offset = (page - 1) * pageSize;
    const paginated = terms.slice(offset, offset + pageSize);

    const data = paginated.map((t) => transformGlossaryTerm(t, baseUrl));

    const buildUrl = (p: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(p));
      return `${baseUrl}/api/v1/glossary?${params}`;
    };

    const response: PaginatedResponse<GlossaryAPIResponse> = {
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

    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    headers.set("Cache-Control", "public, max-age=300, s-maxage=600");

    return NextResponse.json(response, { headers });
  } catch (error) {
    captureApiError(error, "/api/v1/glossary", "GET");
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
