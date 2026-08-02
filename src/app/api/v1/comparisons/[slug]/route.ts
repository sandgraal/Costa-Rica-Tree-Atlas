/**
 * Private API — Get Single Comparison
 *
 * GET /api/v1/comparisons/[slug] — detailed comparison with species links.
 *
 * Internal private API for approved consumers.
 */

import { NextRequest, NextResponse } from "next/server";
import { allSpeciesComparisons, allTrees } from "contentlayer/generated";
import { captureApiError } from "@/lib/error-tracking";
import {
  getClientId,
  checkRateLimit,
  addRateLimitHeaders,
} from "@/lib/api-rate-limit";
import { requireApiV1Access } from "@/lib/api-access";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const locale = searchParams.get("locale") || "en";

    const comparison = allSpeciesComparisons.find(
      (c) => c.slug === slug && c.locale === locale
    );

    if (!comparison) {
      // Check if it exists in another locale
      const any = allSpeciesComparisons.find((c) => c.slug === slug);
      if (any) {
        const headers = new Headers();
        addRateLimitHeaders(headers, rateLimit);
        return NextResponse.json(
          {
            error: {
              code: "LOCALE_NOT_FOUND",
              message: `Comparison "${slug}" not found in locale "${locale}". Available in: ${allSpeciesComparisons
                .filter((c) => c.slug === slug)
                .map((c) => c.locale)
                .join(", ")}`,
            },
            _links: {
              documentation: "/api/docs",
              alternatives: allSpeciesComparisons
                .filter((c) => c.slug === slug)
                .map(
                  (c) =>
                    `${baseUrl}/api/v1/comparisons/${slug}?locale=${c.locale}`
                ),
            },
          },
          { status: 404, headers }
        );
      }

      const headers = new Headers();
      addRateLimitHeaders(headers, rateLimit);
      return NextResponse.json(
        {
          error: {
            code: "NOT_FOUND",
            message: `Comparison "${slug}" not found`,
          },
          _links: {
            documentation: "/api/docs",
            comparisons: `${baseUrl}/api/v1/comparisons`,
          },
        },
        { status: 404, headers }
      );
    }

    // Enrich with species details
    const speciesDetails = comparison.species.map((s) => {
      const tree = allTrees.find((t) => t.slug === s && t.locale === locale);
      return {
        slug: s,
        title: tree?.title ?? s,
        scientificName: tree?.scientificName,
        family: tree?.family,
        _links: {
          self: `${baseUrl}/api/v1/trees/${s}?locale=${locale}`,
          html: `${baseUrl}/${locale}/trees/${s}`,
        },
      };
    });

    const data = {
      slug: comparison.slug,
      locale: comparison.locale,
      title: comparison.title,
      species: comparison.species,
      keyDifference: comparison.keyDifference,
      description: comparison.description,
      difficulty: comparison.difficulty,
      confusionRating: comparison.confusionRating,
      comparisonTags: comparison.comparisonTags,
      seasonalNote: comparison.seasonalNote,
      publishedAt: comparison.publishedAt,
      _links: {
        self: `${baseUrl}/api/v1/comparisons/${comparison.slug}?locale=${locale}`,
        html: `${baseUrl}/${locale}/compare/${comparison.slug}`,
      },
      _embedded: { species: speciesDetails },
    };

    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    headers.set("Cache-Control", "public, max-age=300, s-maxage=600");

    return NextResponse.json({ data }, { headers });
  } catch (error) {
    captureApiError(error, "/api/v1/comparisons/[slug]", "GET");
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
