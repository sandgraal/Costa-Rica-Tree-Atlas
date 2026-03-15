import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import type { Metadata } from "next";
import type { Distribution, TreeTag, Month } from "@/types/tree";
import { isProvince, isRegion } from "@/lib/geo";
import TreeMapClient from "./TreeMapClient";
import type { MapTreeSummary } from "./TreeMapClient";

// Mirrors the TreeTag union in @/types/tree — used to filter non-canonical
// ES MDX tag strings (e.g. "nativo") at the contentlayer boundary.
const VALID_TAGS = new Set<string>([
  "native",
  "endemic",
  "introduced",
  "deciduous",
  "evergreen",
  "flowering",
  "fruit-bearing",
  "endangered",
  "national",
  "nitrogen-fixing",
  "shade-tree",
  "wildlife-food",
  "dry-forest",
  "rainforest",
  "cloud-forest",
  "timber",
  "medicinal",
  "ornamental",
]);

// Mirrors the Month union in @/types/tree (including "all-year") — used to filter
// non-canonical ES month strings (e.g. "todo-el-ano") at the contentlayer boundary.
const VALID_MONTH_STRINGS = new Set<string>([
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "all-year",
]);

interface MapPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: MapPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Explorar por Región - Atlas de Árboles de Costa Rica"
        : "Explore by Region - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Explora la distribución de árboles nativos de Costa Rica por provincia y región. Descubre la biodiversidad de cada zona del país."
        : "Explore the distribution of Costa Rican native trees by province and region. Discover the biodiversity of each area of the country.",
    alternates: {
      languages: {
        en: "/en/map",
        es: "/es/map",
      },
    },
  };
}

export default async function MapPage({ params }: MapPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Project only the fields TreeMapClient needs — avoids shipping the full
  // 32 MB contentlayer dataset (MDX bodies) to the client.
  // Contentlayer generates string[] for list fields; filter to known-valid union
  // values so MapTreeSummary types are accurate at runtime (ES MDX files contain
  // non-canonical strings like "nativo", "todo-el-ano" that are outside the unions).
  const trees: MapTreeSummary[] = allTrees
    .filter((t) => t.locale === locale)
    .map((t) => ({
      slug: t.slug,
      title: t.title,
      scientificName: t.scientificName,
      distribution: t.distribution?.filter(
        (d): d is Distribution => isProvince(d) || isRegion(d)
      ),
      tags: t.tags?.filter((tag): tag is TreeTag => VALID_TAGS.has(tag)),
      floweringSeason: t.floweringSeason?.filter((m): m is Month =>
        VALID_MONTH_STRINGS.has(m)
      ),
      fruitingSeason: t.fruitingSeason?.filter((m): m is Month =>
        VALID_MONTH_STRINGS.has(m)
      ),
      featuredImage: t.featuredImage,
      conservationStatus: t.conservationStatus,
      maxHeight: t.maxHeight,
    }));

  // Structured data for Map page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name:
      locale === "es"
        ? "Explorar Regiones de Costa Rica"
        : "Explore Costa Rica Regions",
    description:
      locale === "es"
        ? "Mapa interactivo para explorar la distribución de árboles nativos por provincia y región en Costa Rica."
        : "Interactive map for exploring native tree distribution by province and region in Costa Rica.",
    url: `https://costaricatreeatlas.com/${locale}/map`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "Costa Rica Tree Atlas",
      url: "https://costaricatreeatlas.com",
    },
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <TreeMapClient locale={locale} trees={trees} />
    </>
  );
}
