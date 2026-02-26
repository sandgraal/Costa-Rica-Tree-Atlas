import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { SafeJsonLd } from "@/components/SafeJsonLd";

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

  return {
    title:
      locale === "es" ? "Generador de Guía de Campo" : "Field Guide Generator",
    description:
      locale === "es"
        ? "Genera una guía de campo personalizada e imprimible de árboles de Costa Rica. Elige entre 175 especies con fotos y datos clave."
        : "Generate a custom printable field guide of Costa Rican trees. Choose from 175 species with photos and key facts.",
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
  const trees = allTrees.filter((tree) => tree.locale === locale);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      locale === "es" ? "Generador de Guía de Campo" : "Field Guide Generator",
    description:
      locale === "es"
        ? "Crea tu propia guía de campo personalizada de árboles de Costa Rica."
        : "Create your own custom field guide of Costa Rican trees.",
    url: `https://costaricatreeatlas.com/${locale}/field-guide`,
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <FieldGuideGenerator trees={trees} locale={locale} />
    </>
  );
}
