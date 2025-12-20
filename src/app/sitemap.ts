import { MetadataRoute } from "next";
import { allTrees } from "contentlayer/generated";

const BASE_URL = "https://costaricatreeatlas.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Static pages for both locales
  const staticPages: MetadataRoute.Sitemap = [
    // English static pages
    {
      url: `${BASE_URL}/en`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/en/trees`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/en/identify`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/en/education`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Spanish static pages
    {
      url: `${BASE_URL}/es`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/es/trees`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/es/identify`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/es/education`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/es/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic tree pages
  const treePages: MetadataRoute.Sitemap = allTrees.map((tree) => ({
    url: `${BASE_URL}/${tree.locale}/trees/${tree.slug}`,
    lastModified: tree.updatedAt || tree.publishedAt || now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...treePages];
}
