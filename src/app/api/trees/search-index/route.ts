/**
 * Lightweight search index API for QuickSearch component.
 * Returns only the fields needed for search — avoids shipping the entire
 * contentlayer bundle (30 MB uncompressed) to the client.
 */

import { NextRequest, NextResponse } from "next/server";
import { allTrees } from "contentlayer/generated";
import { routing } from "@i18n/routing";

export const dynamic = "force-static";

interface SearchIndexEntry {
  slug: string;
  title: string;
  scientificName: string;
  family: string;
  description?: string;
  uses?: string[];
  tags?: string[];
  nativeRegion?: string;
  distribution?: string[];
  conservationStatus?: string;
}

function isSupportedLocale(
  value: string
): value is (typeof routing.locales)[number] {
  return (routing.locales as readonly string[]).includes(value);
}

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedLocale = searchParams.get("locale");

  if (requestedLocale && isSupportedLocale(requestedLocale)) {
    const localeIndex = allTrees
      .filter((t) => t.locale === requestedLocale)
      .map((t) => ({
        slug: t.slug,
        title: t.title,
        scientificName: t.scientificName,
        family: t.family,
        description: t.description,
        uses: t.uses,
        tags: t.tags,
        nativeRegion: t.nativeRegion,
        distribution: t.distribution,
        conservationStatus: t.conservationStatus,
      }));

    return NextResponse.json(localeIndex, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  }

  const index = Object.fromEntries(
    routing.locales.map((locale) => [
      locale,
      allTrees
        .filter((t) => t.locale === locale)
        .map((t) => ({
          slug: t.slug,
          title: t.title,
          scientificName: t.scientificName,
          family: t.family,
          description: t.description,
          uses: t.uses,
          tags: t.tags,
          nativeRegion: t.nativeRegion,
          distribution: t.distribution,
          conservationStatus: t.conservationStatus,
        })),
    ])
  ) as Record<string, SearchIndexEntry[]>;

  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
