import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

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
        ? "Crea tu propia guía de campo personalizada de árboles de Costa Rica"
        : "Create your own custom field guide of Costa Rican trees",
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

  return <FieldGuideGenerator trees={trees} locale={locale} />;
}
