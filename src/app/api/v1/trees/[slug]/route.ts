import { NextRequest, NextResponse } from "next/server";
import { allTrees, type Tree } from "contentlayer/generated";
import { captureApiError } from "@/lib/error-tracking";
import {
  getClientId,
  checkRateLimit,
  addRateLimitHeaders,
} from "@/lib/api-rate-limit";
import { requireApiV1Access } from "@/lib/api-access";
import type { TreeAPIResponse } from "@/types/api";

function transformTree(tree: Tree, baseUrl: string): TreeAPIResponse {
  return {
    slug: tree.slug,
    locale: tree.locale,
    title: tree.title,
    scientificName: tree.scientificName,
    family: tree.family,
    description: tree.description,
    nativeRegion: tree.nativeRegion,
    maxHeight: tree.maxHeight,
    elevation: tree.elevation,
    conservationStatus: tree.conservationStatus,
    uses: tree.uses,
    tags: tree.tags,
    distribution: tree.distribution,
    floweringSeason: tree.floweringSeason,
    fruitingSeason: tree.fruitingSeason,
    toxicityLevel: tree.toxicityLevel,
    toxicParts: tree.toxicParts,
    skinContactRisk: tree.skinContactRisk,
    allergenRisk: tree.allergenRisk,
    featuredImage: tree.featuredImage
      ? `${baseUrl}${tree.featuredImage}`
      : undefined,
    images: tree.images?.map((img) => `${baseUrl}${img}`),
    publishedAt: tree.publishedAt,
    updatedAt: tree.updatedAt,
    _links: {
      self: `${baseUrl}/api/v1/trees/${tree.slug}?locale=${tree.locale}`,
      html: `${baseUrl}/${tree.locale}/trees/${tree.slug}`,
    },
  };
}

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/v1/trees/[slug] - Get a single tree by slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const accessDenied = requireApiV1Access(request);
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
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const locale = searchParams.get("locale") || "en";

    // Find tree by slug and locale
    const tree = allTrees.find((t) => t.slug === slug && t.locale === locale);

    if (!tree) {
      // Try to find in any locale
      const anyLocaleTree = allTrees.find((t) => t.slug === slug);
      if (anyLocaleTree) {
        const headers = new Headers();
        addRateLimitHeaders(headers, rateLimit);
        return NextResponse.json(
          {
            error: {
              code: "LOCALE_NOT_FOUND",
              message: `Tree "${slug}" not found in locale "${locale}". Available in: ${allTrees
                .filter((t) => t.slug === slug)
                .map((t) => t.locale)
                .join(", ")}`,
            },
            _links: {
              documentation: "/api/docs",
              alternatives: allTrees
                .filter((t) => t.slug === slug)
                .map(
                  (t) => `${baseUrl}/api/v1/trees/${slug}?locale=${t.locale}`
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
            message: `Tree "${slug}" not found`,
          },
          _links: {
            documentation: "/api/docs",
            trees: `${baseUrl}/api/v1/trees`,
          },
        },
        { status: 404, headers }
      );
    }

    const data = transformTree(tree, baseUrl);

    // Find related trees (same family, different species)
    const related = allTrees
      .filter(
        (t) =>
          t.family === tree.family &&
          t.slug !== tree.slug &&
          t.locale === locale
      )
      .slice(0, 5)
      .map((t) => ({
        slug: t.slug,
        title: t.title,
        scientificName: t.scientificName,
        _links: {
          self: `${baseUrl}/api/v1/trees/${t.slug}?locale=${locale}`,
        },
      }));

    const headers = new Headers();
    addRateLimitHeaders(headers, rateLimit);
    headers.set("Cache-Control", "public, max-age=300, s-maxage=600");

    return NextResponse.json(
      {
        data,
        _related: related.length > 0 ? related : undefined,
      },
      { headers }
    );
  } catch (error) {
    captureApiError(error, "/api/v1/trees/[slug]", "GET");
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
