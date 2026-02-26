import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import TreeJournalClient from "./TreeJournalClient";
import { getTreeJournalLessonData } from "./tree-journal-data";

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
        ? "Adopta un árbol de Costa Rica y documenta sus cambios durante el año escolar. Diario fenológico con insignias y certificados."
        : "Adopt a Costa Rican tree and document its changes through the school year. Phenology journal with badges and certificates.",
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

  // Build locale-specific lesson data on the server so it ships as RSC
  // payload (serialized data) rather than executable client JS.
  const lessonData = getTreeJournalLessonData(locale);

  return (
    <TreeJournalClient trees={trees} locale={locale} lessonData={lessonData} />
  );
}
