import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import type { FieldGuideTreeSummary } from "@/types/tree";

// Lazy load FieldGuideGenerator — 225-line client component + 267-line FieldGuidePreview child
const FieldGuideGenerator = dynamic(
  () =>
    import("@/components/field-guide/FieldGuideGenerator").then((m) => ({
      default: m.FieldGuideGenerator,
    })),
  {
    loading: () => (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-12 bg-muted rounded-lg w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    ),
  }
);

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fieldGuide" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/field-guide",
        es: "/es/field-guide",
      },
    },
  };
}

export default async function FieldGuidePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees for current locale
  const trees: FieldGuideTreeSummary[] = allTrees
    .filter((tree) => tree.locale === locale)
    .map((tree) => ({
      slug: tree.slug,
      title: tree.title,
      scientificName: tree.scientificName,
      family: tree.family,
      description: tree.description,
      featuredImage: tree.featuredImage,
      maxHeight: tree.maxHeight,
      toxicityLevel: tree.toxicityLevel,
      uses: tree.uses,
      conservationStatus: tree.conservationStatus,
    }));

  const t = await getTranslations("fieldGuide");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("structuredName"),
    description: t("structuredDescription"),
    url: `https://costaricatreeatlas.com/${locale}/field-guide`,
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <FieldGuideGenerator trees={trees} locale={locale} />
    </>
  );
}
