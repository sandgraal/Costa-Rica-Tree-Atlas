import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import MapGameClient from "./MapGameClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mapGame" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/education/map-game",
        es: "/es/education/map-game",
      },
    },
  };
}

export default async function MapGamePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((tr) => tr.locale === locale)
    .map((tr) => ({
      title: tr.title,
      scientificName: tr.scientificName,
      slug: tr.slug,
      nativeRegion: tr.nativeRegion || undefined,
      tags: tr.tags || [],
      featuredImage: tr.featuredImage || undefined,
    }));

  return <MapGameClient trees={trees} />;
}
