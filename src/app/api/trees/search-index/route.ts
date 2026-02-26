/**
 * Lightweight search index API for QuickSearch component.
 * Returns only the fields needed for search — avoids shipping the entire
 * contentlayer bundle (30 MB uncompressed) to the client.
 */

import { NextResponse } from "next/server";
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

export function GET() {
  const index: Record<string, SearchIndexEntry[]> = {};

  for (const locale of routing.locales) {
    index[locale] = allTrees
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
      }));
  }

  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
