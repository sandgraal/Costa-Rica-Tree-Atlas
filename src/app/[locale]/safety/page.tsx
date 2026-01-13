import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { SafetyPageClient } from "./SafetyPageClient";
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

  return <SafetyPageClient trees={trees} locale={locale} />;
}
