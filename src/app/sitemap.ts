import { MetadataRoute } from "next";
import {
  allTrees,
  allGlossaryTerms,
  allSpeciesComparisons,
} from "contentlayer/generated";

const BASE_URL = "https://costaricatreeatlas.com";
const locales = ["en", "es"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Helper to generate entries for both locales
  const bilingualPages = (
    path: string,
    options: {
      changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
      priority: number;
    }
  ): MetadataRoute.Sitemap =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: options.changeFrequency,
      priority: options.priority,
    }));

  // Static section pages for both locales
  const staticPages: MetadataRoute.Sitemap = [
    ...bilingualPages("", { changeFrequency: "weekly", priority: 1.0 }),
    ...bilingualPages("/trees", { changeFrequency: "weekly", priority: 0.9 }),
    ...bilingualPages("/compare", {
      changeFrequency: "monthly",
      priority: 0.7,
    }),
    ...bilingualPages("/education", {
      changeFrequency: "monthly",
      priority: 0.8,
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
    ...bilingualPages("/use-cases", {
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  ];

  // Dynamic tree pages
  const treePages: MetadataRoute.Sitemap = allTrees.map((tree) => ({
    url: `${BASE_URL}/${tree.locale}/trees/${tree.slug}`,
    lastModified: tree.updatedAt || tree.publishedAt || now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Dynamic glossary term pages
  const glossaryPages: MetadataRoute.Sitemap = allGlossaryTerms.map((term) => ({
    url: `${BASE_URL}/${term.locale}/glossary/${term.slug}`,
    lastModified: term.publishedAt || now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // Dynamic comparison pages
  const comparisonPages: MetadataRoute.Sitemap = allSpeciesComparisons.map(
    (comparison) => ({
      url: `${BASE_URL}/${comparison.locale}/compare/${comparison.slug}`,
      lastModified: comparison.publishedAt || now,
      changeFrequency: "monthly",
      priority: 0.7,
    })
  );

  return [...staticPages, ...treePages, ...glossaryPages, ...comparisonPages];
}
