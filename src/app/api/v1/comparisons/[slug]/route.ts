/**
 * Public API — Get Single Comparison
 *
 * GET /api/v1/comparisons/[slug] — detailed comparison with species links.
 *
 * Part of P6.3: Public API for researchers.
 */

import { NextRequest, NextResponse } from "next/server";
import { allSpeciesComparisons, allTrees } from "contentlayer/generated";
import { captureApiError } from "@/lib/error-tracking";
import {
  rateLimitOrNull,
  getClientId,
  checkRateLimit,
  addRateLimitHeaders,
} from "@/lib/api-rate-limit";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const blocked = rateLimitOrNull(request);
  if (blocked) return blocked;

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
        const clientId = getClientId(request);
        const rl = checkRateLimit(clientId);
        const headers = new Headers();
        addRateLimitHeaders(headers, rl);
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

      const clientId = getClientId(request);
      const rl = checkRateLimit(clientId);
      const headers = new Headers();
      addRateLimitHeaders(headers, rl);
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

    const clientId = getClientId(request);
    const rl = checkRateLimit(clientId);
    const headers = new Headers();
    addRateLimitHeaders(headers, rl);
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
