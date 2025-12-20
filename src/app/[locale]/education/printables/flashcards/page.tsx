import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import FlashcardsClient from "./FlashcardsClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Tarjetas de Estudio Imprimibles - Atlas de Árboles de Costa Rica"
        : "Printable Study Flashcards - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Tarjetas de estudio imprimibles con información sobre árboles de Costa Rica."
        : "Printable study flashcards with information about Costa Rica trees.",
  };
}

export default async function FlashcardsPage({ params }: Props) {
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
      description: t.description,
      conservationStatus: t.conservationStatus || undefined,
      maxHeight: t.maxHeight || undefined,
      featuredImage: t.featuredImage || undefined,
    }));

  return <FlashcardsClient trees={trees} locale={locale} />;
}
