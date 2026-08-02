import { MetadataRoute } from "next";
import {
  allTrees,
  allGlossaryTerms,
  allSpeciesComparisons,
} from "contentlayer/generated";

const BASE_URL = "https://costaricatreeatlas.org";
const locales = ["en", "es"] as const;

/**
 * Stable timestamp for pages with no content-derived date.
 *
 * Static entries previously used `new Date().toISOString()` evaluated per
 * request, stamping every page as "modified today" on every deploy. That trains
 * crawlers to ignore the field entirely. Content pages below use their real
 * frontmatter dates.
 */
const BUILD_TIME = new Date().toISOString();

export default function sitemap(): MetadataRoute.Sitemap {
  // Helper to generate entries for both locales, with hreflang alternates.
  const bilingualPages = (
    path: string,
    options: {
      changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
      priority: number;
    }
  ): MetadataRoute.Sitemap =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: BUILD_TIME,
      changeFrequency: options.changeFrequency,
      priority: options.priority,
      alternates: {
        languages: Object.fromEntries(
          locales.map((alt) => [alt, `${BASE_URL}/${alt}${path}`])
        ),
      },
    }));

  // Static section pages for both locales.
  //
  // `/identify`, `/favorites`, `/api-docs`, `/contribute/photo`,
  // `/oral-histories` and every `/education/*` sub-route were missing here
  // despite being live and carrying full `alternates.languages` page metadata —
  // including `/oral-histories`, which had no inbound link of any kind and was
  // therefore reachable only by typing the URL.
  const staticPages: MetadataRoute.Sitemap = [
    ...bilingualPages("", { changeFrequency: "weekly", priority: 1.0 }),
    ...bilingualPages("/trees", { changeFrequency: "weekly", priority: 0.9 }),
    ...bilingualPages("/identify", {
      changeFrequency: "monthly",
      priority: 0.8,
    }),
    ...bilingualPages("/compare", {
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingualPages("/education", {
      changeFrequency: "monthly",
      priority: 0.8,
    }),
    ...bilingualPages("/education/lessons", {
      changeFrequency: "monthly",
      priority: 0.6,
    }),
    ...bilingualPages("/education/printables", {
      changeFrequency: "monthly",
      priority: 0.6,
    }),
    ...bilingualPages("/education/teacher", {
      changeFrequency: "monthly",
      priority: 0.6,
    }),
    ...bilingualPages("/education/classroom", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    ...bilingualPages("/education/field-trip", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    ...bilingualPages("/education/scavenger-hunt", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    ...bilingualPages("/education/tree-journal", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    ...bilingualPages("/education/map-game", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    ...bilingualPages("/seasonal", {
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingualPages("/about", { changeFrequency: "monthly", priority: 0.6 }),
    ...bilingualPages("/glossary", {
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingualPages("/oral-histories", {
      changeFrequency: "monthly",
      priority: 0.6,
    }),
    ...bilingualPages("/safety", { changeFrequency: "monthly", priority: 0.7 }),
    ...bilingualPages("/conservation", {
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingualPages("/map", { changeFrequency: "monthly", priority: 0.7 }),
    ...bilingualPages("/field-guide", {
      changeFrequency: "monthly",
      priority: 0.6,
    }),
    ...bilingualPages("/wizard", { changeFrequency: "monthly", priority: 0.6 }),
    ...bilingualPages("/quiz", { changeFrequency: "monthly", priority: 0.5 }),
    ...bilingualPages("/diagnose", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    ...bilingualPages("/contribute", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
    ...bilingualPages("/contribute/photo", {
      changeFrequency: "monthly",
      priority: 0.4,
    }),
    ...bilingualPages("/favorites", {
      changeFrequency: "monthly",
      priority: 0.4,
    }),
    ...bilingualPages("/api-docs", {
      changeFrequency: "monthly",
      priority: 0.4,
    }),
    ...bilingualPages("/use-cases", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  ];

  /** Per-locale hreflang alternates for a slug-based content route. */
  const contentAlternates = (segment: string, slug: string) => ({
    languages: Object.fromEntries(
      locales.map((alt) => [alt, `${BASE_URL}/${alt}/${segment}/${slug}`])
    ),
  });

  // Dynamic tree pages
  const treePages: MetadataRoute.Sitemap = allTrees.map((tree) => ({
    url: `${BASE_URL}/${tree.locale}/trees/${tree.slug}`,
    lastModified: tree.updatedAt || tree.publishedAt || BUILD_TIME,
    changeFrequency: "monthly",
    priority: 0.8,
    alternates: contentAlternates("trees", tree.slug),
  }));

  // Dynamic glossary term pages
  const glossaryPages: MetadataRoute.Sitemap = allGlossaryTerms.map((term) => ({
    url: `${BASE_URL}/${term.locale}/glossary/${term.slug}`,
    lastModified: term.publishedAt || BUILD_TIME,
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: contentAlternates("glossary", term.slug),
  }));

  // Dynamic comparison pages
  const comparisonPages: MetadataRoute.Sitemap = allSpeciesComparisons.map(
    (comparison) => ({
      url: `${BASE_URL}/${comparison.locale}/compare/${comparison.slug}`,
      lastModified: comparison.publishedAt || BUILD_TIME,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: contentAlternates("compare", comparison.slug),
    })
  );

  return [...staticPages, ...treePages, ...glossaryPages, ...comparisonPages];
}
