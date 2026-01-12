import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { FieldGuideGenerator } from "@/components/field-guide/FieldGuideGenerator";
import type { Metadata } from "next";

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
