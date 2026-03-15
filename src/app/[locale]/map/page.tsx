import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "map" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
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
    .filter((tr) => tr.locale === locale)
    .map((tr) => ({
      slug: tr.slug,
      title: tr.title,
      scientificName: tr.scientificName,
      distribution: tr.distribution?.filter(
        (d): d is Distribution => isProvince(d) || isRegion(d)
      ),
      tags: tr.tags?.filter((tag): tag is TreeTag => VALID_TAGS.has(tag)),
      floweringSeason: tr.floweringSeason?.filter((m): m is Month =>
        VALID_MONTH_STRINGS.has(m)
      ),
      fruitingSeason: tr.fruitingSeason?.filter((m): m is Month =>
        VALID_MONTH_STRINGS.has(m)
      ),
      featuredImage: tr.featuredImage,
      conservationStatus: tr.conservationStatus,
      maxHeight: tr.maxHeight,
    }));

  // Structured data for Map page
  const t = await getTranslations("map");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("structuredName"),
    description: t("structuredDescription"),
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
