/**
 * Per-locale search index for the QuickSearch component.
 *
 * Why this route exists: the sibling `/api/trees/search-index` is
 * `force-static`, which means `searchParams` are not available at render time.
 * Its `?locale=` branch could therefore never run — every client asking for one
 * locale silently received BOTH, roughly doubling the payload of the site's
 * primary search. A defensive reader on the client (`getLocaleSearchIndex`)
 * masked the bug, so it "worked" while shipping twice the bytes.
 *
 * A path segment can be statically generated; a query parameter cannot. This
 * route pre-renders one JSON file per locale at build time.
 */

import { NextResponse } from "next/server";
import { allTrees } from "contentlayer/generated";
import { routing } from "@i18n/routing";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export interface SearchIndexEntry {
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

function toEntry(tree: (typeof allTrees)[number]): SearchIndexEntry {
  return {
    slug: tree.slug,
    title: tree.title,
    scientificName: tree.scientificName,
    family: tree.family,
    description: tree.description,
    uses: tree.uses,
    tags: tree.tags,
    nativeRegion: tree.nativeRegion,
    distribution: tree.distribution,
    conservationStatus: tree.conservationStatus,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 404 });
  }

  const index = allTrees.filter((t) => t.locale === locale).map(toEntry);

  return NextResponse.json(index, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
