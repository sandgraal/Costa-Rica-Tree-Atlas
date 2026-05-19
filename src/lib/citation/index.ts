/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Citation helpers for the species pages and Darwin Core Archive.
 *
 * The DOI below is a PLACEHOLDER until the first Zenodo deposit lands —
 * the script that builds the deposit lives at
 * scripts/export-dwca.mjs. Replace the constant in one place when the
 * real DOI is minted; the entire UI + JSON-LD picks it up.
 *
 * Master Plan v6.0 lane L12 — SEO / GEO / Citation.
 */

import type { Locale } from "@/types/tree";

/**
 * Placeholder DOI. When Zenodo issues the first stable deposit, swap
 * this constant for the real `10.5281/zenodo.<id>` and tag a release.
 *
 * The placeholder format is intentionally invalid so that downstream
 * tools (Crossref, AI overviews) treat it as "no DOI yet" rather than a
 * resolvable record. Citation UI still renders, but the BibTeX `doi`
 * field is omitted when the placeholder is detected.
 */
export const DATASET_DOI = "10.5281/zenodo.20279670";

export function hasMintedDOI(doi: string): boolean {
  return /^10\.5281\/zenodo\.\d+$/.test(doi);
}

export const DATASET_TITLE: Record<Locale, string> = {
  en: "Costa Rica Tree Atlas — Species Corpus",
  es: "Atlas de Árboles de Costa Rica — Corpus de Especies",
};

export const DATASET_PUBLISHER: Record<Locale, string> = {
  en: "Costa Rica Tree Atlas contributors",
  es: "Contribuyentes del Atlas de Árboles de Costa Rica",
};

export const DATASET_LICENSE_URL =
  "https://creativecommons.org/licenses/by/4.0/";
export const DATASET_LICENSE_LABEL = "CC BY 4.0";

export const SITE_BASE_URL = "https://costaricatreeatlas.com";

interface TreeForCitation {
  title: string;
  scientificName: string;
  slug: string;
  nameAuthority?: string;
  updatedAt?: string;
  publishedAt?: string;
}

function citationYear(tree: TreeForCitation): string {
  const d = tree.updatedAt || tree.publishedAt;
  if (!d) return String(new Date().getFullYear());
  return String(new Date(d).getFullYear() || new Date().getFullYear());
}

function pageUrl(slug: string, locale: Locale): string {
  return `${SITE_BASE_URL}/${locale}/trees/${slug}`;
}

function fullScientificName(tree: TreeForCitation): string {
  const auth = tree.nameAuthority ? ` ${tree.nameAuthority}` : "";
  return `${tree.scientificName}${auth}`;
}

/**
 * APA 7 — generic web-page citation form, adapted for a corpus entry.
 *
 *   Costa Rica Tree Atlas contributors. (YYYY). <i>Title (Sci. name)</i>.
 *   Costa Rica Tree Atlas — Species Corpus. https://…[/locale/trees/slug]
 *
 * The italic span is rendered visibly via the React component (the
 * helper returns a plain-string fallback for crawlers / copy-paste).
 */
export function formatAPA(tree: TreeForCitation, locale: Locale): string {
  const year = citationYear(tree);
  const sci = fullScientificName(tree);
  return `${DATASET_PUBLISHER[locale]}. (${year}). ${tree.title} (${sci}). ${DATASET_TITLE[locale]}. ${pageUrl(tree.slug, locale)}`;
}

/**
 * MLA 9 — web source citation form.
 *
 *   "Title (Sci. name)." Costa Rica Tree Atlas — Species Corpus,
 *   Costa Rica Tree Atlas contributors, YYYY, URL.
 */
export function formatMLA(tree: TreeForCitation, locale: Locale): string {
  const year = citationYear(tree);
  const sci = fullScientificName(tree);
  return `"${tree.title} (${sci})." ${DATASET_TITLE[locale]}, ${DATASET_PUBLISHER[locale]}, ${year}, ${pageUrl(tree.slug, locale)}.`;
}

/**
 * BibTeX `@misc` entry — research-tool-friendly. DOI field is included
 * only when a real Zenodo DOI has been minted.
 */
export function formatBibTeX(tree: TreeForCitation, locale: Locale): string {
  const year = citationYear(tree);
  const key = `crta-${tree.slug}-${year}`;
  const url = pageUrl(tree.slug, locale);
  const doiField = hasMintedDOI(DATASET_DOI)
    ? `\n  doi          = {${DATASET_DOI}},`
    : "";
  return `@misc{${key},
  author       = {{${DATASET_PUBLISHER[locale]}}},
  title        = {{${tree.title} (${tree.scientificName}${tree.nameAuthority ? " " + tree.nameAuthority : ""})}},
  howpublished = {${DATASET_TITLE[locale]}},
  year         = {${year}},
  url          = {${url}},${doiField}
  note         = {Licensed under ${DATASET_LICENSE_LABEL}.}
}`;
}

/**
 * Build the Schema.org `Dataset` JSON-LD describing the corpus this
 * species page is part of. Renders alongside the existing Article
 * JSON-LD so AI overviews and search engines understand both the
 * individual page and the citeable parent dataset.
 */
const DATASET_DESCRIPTION: Record<Locale, string> = {
  en: "Bilingual corpus of Costa Rican tree species with canonical identifiers (POWO, GBIF, IUCN), vernacular names, descriptions, and references. Exportable as a Darwin Core Archive.",
  es: "Corpus bilingüe de especies arbóreas de Costa Rica con identificadores canónicos (POWO, GBIF, IUCN), nombres vernáculos, descripciones y referencias. Exportable como Darwin Core Archive.",
};

export function datasetJsonLd(locale: Locale): Record<string, unknown> {
  const minted = hasMintedDOI(DATASET_DOI);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: DATASET_TITLE[locale],
    description: DATASET_DESCRIPTION[locale],
    url: `${SITE_BASE_URL}/${locale}/trees`,
    license: DATASET_LICENSE_URL,
    inLanguage: ["en", "es"],
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: DATASET_PUBLISHER[locale],
      url: SITE_BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: DATASET_PUBLISHER[locale],
      url: SITE_BASE_URL,
    },
    spatialCoverage: {
      "@type": "Place",
      name: "Costa Rica",
    },
    keywords: [
      "Costa Rica",
      "trees",
      "flora",
      "biodiversity",
      "ethnobotany",
      "Darwin Core",
      "IUCN",
      "POWO",
      "GBIF",
    ],
    ...(minted && { identifier: `https://doi.org/${DATASET_DOI}` }),
  };
}

/**
 * Per-page citation metadata for <meta> injection. Currently we ship
 * citation_title and citation_publication_date even when the DOI is a
 * placeholder; citation_doi is gated on a real mint.
 */
export function citationMetaTags(
  tree: TreeForCitation,
  locale: Locale
): Record<string, string> {
  const out: Record<string, string> = {
    citation_title: `${tree.title} (${tree.scientificName})`,
    citation_author: DATASET_PUBLISHER[locale],
    citation_publication_date: citationYear(tree),
    citation_journal_title: DATASET_TITLE[locale],
    citation_language: locale,
    citation_public_url: pageUrl(tree.slug, locale),
  };
  if (hasMintedDOI(DATASET_DOI)) {
    out.citation_doi = DATASET_DOI;
  }
  return out;
}
