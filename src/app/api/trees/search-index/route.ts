/**
 * Lightweight search index API, all locales in one payload.
 * Returns only the fields needed for search — avoids shipping the entire
 * contentlayer bundle (30 MB uncompressed) to the client.
 *
 * Prefer `/api/trees/search-index/{locale}` for single-locale consumers: it is
 * roughly half the size. This route previously advertised a `?locale=` filter
 * that could never work — `force-static` means `searchParams` are unavailable
 * at render time, so the filter branch was unreachable and every caller got the
 * full multi-locale payload regardless. The dead branch has been removed rather
 * than left to imply a capability that does not exist.
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
