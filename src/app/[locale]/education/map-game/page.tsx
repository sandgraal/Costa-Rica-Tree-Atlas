import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import MapGameClient from "./MapGameClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Juego del Mapa - Atlas de Árboles de Costa Rica"
        : "Map Game - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Aprende dónde crecen los árboles de Costa Rica en este juego interactivo."
        : "Learn where Costa Rica's trees grow in this interactive game.",
  };
}

export default async function MapGamePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((t) => t.locale === locale)
    .map((t) => ({
      title: t.title,
      scientificName: t.scientificName,
      slug: t.slug,
      nativeRegion: t.nativeRegion || undefined,
      tags: t.tags || [],
      featuredImage: t.featuredImage || undefined,
    }));

  return <MapGameClient trees={trees} locale={locale} />;
}
