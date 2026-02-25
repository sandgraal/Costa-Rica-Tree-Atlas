import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { SafetyPageClient } from "./SafetyPageClient";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import type { Locale } from "@/types";

interface SafetyPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: SafetyPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es" ? "Guía de Seguridad de Árboles" : "Tree Safety Guide",
    description:
      locale === "es"
        ? "Información completa sobre la seguridad de los árboles de Costa Rica, incluyendo toxicidad, riesgos físicos, contactos de emergencia y primeros auxilios."
        : "Complete safety information about Costa Rican trees, including toxicity, physical hazards, emergency contacts, and first aid procedures.",
    alternates: {
      languages: {
        en: "/en/safety",
        es: "/es/safety",
      },
    },
  };
}

export default async function SafetyPage({ params }: SafetyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees for current locale
  const trees = allTrees.filter((tree) => tree.locale === locale);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      locale === "es" ? "Guía de Seguridad de Árboles" : "Tree Safety Guide",
    description:
      locale === "es"
        ? "Información completa sobre la seguridad de los árboles de Costa Rica."
        : "Complete safety information about Costa Rican trees.",
    url: `https://costaricatreeatlas.com/${locale}/safety`,
    mainEntity: {
      "@type": "MedicalWebPage",
      name:
        locale === "es"
          ? "Toxicidad y Primeros Auxilios de Árboles"
          : "Tree Toxicity and First Aid",
      description:
        locale === "es"
          ? "Niveles de toxicidad, riesgos de contacto con la piel y contactos de emergencia para árboles de Costa Rica."
          : "Toxicity levels, skin contact risks, and emergency contacts for Costa Rican trees.",
    },
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <SafetyPageClient trees={trees} locale={locale} />
    </>
  );
}
