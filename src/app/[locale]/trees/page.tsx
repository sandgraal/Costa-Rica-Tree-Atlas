import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { TreeExplorer } from "@/components/tree";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

// Helper to get sorted trees for a locale
function getTreesForLocale(locale: string) {
  return allTrees
    .filter((tree) => tree.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "es" ? "Directorio de Árboles" : "Tree Directory",
    description:
      locale === "es"
        ? "Explora nuestra colección de árboles costarricenses"
        : "Browse our collection of Costa Rican trees",
    alternates: {
      languages: {
        en: "/en/trees",
        es: "/es/trees",
      },
    },
  };
}

export default async function TreesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees for current locale, sorted alphabetically for consistent first image
  const trees = getTreesForLocale(locale);

  // Generate ItemList structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      locale === "es"
        ? "Directorio de Árboles de Costa Rica"
        : "Costa Rica Tree Directory",
    description:
      locale === "es"
        ? "Una colección completa de árboles nativos de Costa Rica"
        : "A comprehensive collection of native Costa Rican trees",
    numberOfItems: trees.length,
    itemListElement: trees.slice(0, 50).map((tree, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Thing",
        name: tree.title,
        description: tree.description,
        url: `https://costaricatreeatlas.com/${locale}/trees/${tree.slug}`,
      },
    })),
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <TreeExplorer trees={trees} />
    </>
  );
}
