import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import WizardClient from "./WizardClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Asistente de Selección de Árboles - Atlas de Árboles de Costa Rica"
        : "Tree Selection Wizard - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Encuentra el árbol perfecto para tu espacio con recomendaciones personalizadas."
        : "Find the perfect tree for your space with personalized recommendations.",
    alternates: {
      languages: {
        en: "/en/wizard",
        es: "/es/wizard",
      },
    },
  };
}

export default async function WizardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((t) => t.locale === locale)
    .map((t) => ({
      title: t.title,
      scientificName: t.scientificName,
      slug: t.slug,
      family: t.family,
      tags: t.tags || [],
      uses: t.uses || [],
      matureSize: t.matureSize || t.maxHeight || undefined,
      lightRequirements: t.lightRequirements || undefined,
      waterNeeds: t.waterNeeds || undefined,
      growthRate: t.growthRate || undefined,
      childSafe: t.childSafe,
      petSafe: t.petSafe,
      toxicityLevel: t.toxicityLevel || undefined,
      featuredImage: t.featuredImage || undefined,
      description: t.description,
    }));

  return <WizardClient trees={trees} locale={locale} />;
}
