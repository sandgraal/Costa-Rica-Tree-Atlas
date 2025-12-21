import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import FieldTripClient from "./FieldTripClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Modo Excursión - Atlas de Árboles de Costa Rica"
        : "Field Trip Mode - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Lista de verificación offline para excursiones de campo."
        : "Offline checklist for field trip expeditions.",
  };
}

export default async function FieldTripPage({ params }: Props) {
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
      conservationStatus: t.conservationStatus || undefined,
      nativeRegion: t.nativeRegion || undefined,
      tags: t.tags || undefined,
    }));

  return <FieldTripClient trees={trees} locale={locale} />;
}
