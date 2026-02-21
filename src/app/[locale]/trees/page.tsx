import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { Link } from "@i18n/navigation";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

// Lazy load TreeExplorer — 685-line client component with search, filters, and grid
const TreeExplorer = dynamic(
  () =>
    import("@/components/tree/TreeExplorer").then((m) => ({
      default: m.TreeExplorer,
    })),
  {
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-12 bg-muted rounded-lg flex-1" />
          <div className="h-12 bg-muted rounded-lg w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    ),
  }
);

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
      <noscript>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">
            {locale === "es" ? "Directorio de Árboles" : "Tree Directory"}
          </h1>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trees.map((tree) => (
              <li key={tree.slug}>
                <Link
                  href={`/trees/${tree.slug}`}
                  className="block p-4 border rounded-lg hover:bg-muted"
                >
                  <strong>{tree.title}</strong>
                  <br />
                  <em className="text-sm text-muted-foreground">
                    {tree.scientificName}
                  </em>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </noscript>
    </>
  );
}
