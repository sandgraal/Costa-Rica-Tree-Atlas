/**
 * Public API — Get Single Glossary Term
 *
 * GET /api/v1/glossary/[slug] — term with related terms and example species.
 *
 * Part of P6.3: Public API for researchers.
 */

import { NextRequest, NextResponse } from "next/server";
import { allGlossaryTerms, allTrees } from "contentlayer/generated";
import { captureApiError } from "@/lib/error-tracking";
import {
  getClientId,
  checkRateLimit,
  addRateLimitHeaders,
} from "@/lib/api-rate-limit";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const term = allGlossaryTerms.find(
      (t) => t.slug === slug && t.locale === locale
    );

    if (!term) {
      const any = allGlossaryTerms.find((t) => t.slug === slug);
      if (any) {
        const headers = new Headers();
        addRateLimitHeaders(headers, rateLimit);
        return NextResponse.json(
          {
            error: {
              code: "LOCALE_NOT_FOUND",
              message: `Glossary term "${slug}" not found in locale "${locale}". Available in: ${allGlossaryTerms
                .filter((t) => t.slug === slug)
                .map((t) => t.locale)
                .join(", ")}`,
            },
            _links: {
              documentation: "/api/docs",
              alternatives: allGlossaryTerms
                .filter((t) => t.slug === slug)
                .map(
                  (t) => `${baseUrl}/api/v1/glossary/${slug}?locale=${t.locale}`
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
            message: `Glossary term "${slug}" not found`,
          },
          _links: {
            documentation: "/api/docs",
            glossary: `${baseUrl}/api/v1/glossary`,
          },
        },
        { status: 404, headers }
      );
    }

    // Enrich related terms
    const relatedTermsData = term.relatedTerms
      ?.map((rtSlug) => {
        const rt = allGlossaryTerms.find(
          (t) => t.slug === rtSlug && t.locale === locale
        );
        return rt
          ? {
              slug: rt.slug,
              term: rt.term,
              simpleDefinition: rt.simpleDefinition,
              category: rt.category,
              _links: {
                self: `${baseUrl}/api/v1/glossary/${rt.slug}?locale=${locale}`,
                html: `${baseUrl}/${locale}/glossary/${rt.slug}`,
              },
            }
          : null;
      })
      .filter(Boolean);

    // Enrich example species
    const exampleSpeciesData = term.exampleSpecies
      ?.map((slug) => {
        const tree = allTrees.find(
          (t) => t.slug === slug && t.locale === locale
        );
        return tree
          ? {
              slug: tree.slug,
              title: tree.title,
              scientificName: tree.scientificName,
              _links: {
                self: `${baseUrl}/api/v1/trees/${tree.slug}?locale=${locale}`,
                html: `${baseUrl}/${locale}/trees/${tree.slug}`,
              },
            }
          : null;
      })
      .filter(Boolean);

    const data = {
      slug: term.slug,
      locale: term.locale,
      term: term.term,
      simpleDefinition: term.simpleDefinition,
      technicalDefinition: term.technicalDefinition,
      category: term.category,
      pronunciation: term.pronunciation,
      etymology: term.etymology,
      exampleSpecies: term.exampleSpecies,
      relatedTerms: term.relatedTerms,
      image: term.image,
      publishedAt: term.publishedAt,
      _links: {
        self: `${baseUrl}/api/v1/glossary/${term.slug}?locale=${locale}`,
        html: `${baseUrl}/${locale}/glossary/${term.slug}`,
      },
      _embedded: {
        ...(relatedTermsData?.length && { relatedTerms: relatedTermsData }),
        ...(exampleSpeciesData?.length && {
          exampleSpecies: exampleSpeciesData,
        }),
      },
    };

    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    headers.set("Cache-Control", "public, max-age=300, s-maxage=600");

    return NextResponse.json({ data }, { headers });
  } catch (error) {
    captureApiError(error, "/api/v1/glossary/[slug]", "GET");
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
