import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import TreeJournalClient from "./TreeJournalClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Diario del Árbol - Atlas de Árboles de Costa Rica"
        : "Tree Journal - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Adopta un árbol y documenta sus cambios durante todo el año escolar."
        : "Adopt a tree and document its changes throughout the school year.",
  };
}

export default async function TreeJournalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((t) => t.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title, locale))
    .map((t) => ({
      title: t.title,
      scientificName: t.scientificName,
      family: t.family,
      slug: t.slug,
      featuredImage: t.featuredImage || undefined,
      floweringSeason: t.floweringSeason || undefined,
      fruitingSeason: t.fruitingSeason || undefined,
      maxHeight: t.maxHeight || undefined,
    }));

  return <TreeJournalClient trees={trees} locale={locale} />;
}
