import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import FlashcardsClient from "./FlashcardsClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "flashcards" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/education/printables/flashcards",
        es: "/es/education/printables/flashcards",
      },
    },
  };
}

export default async function FlashcardsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((tr) => tr.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title, locale))
    .map((tr) => ({
      title: tr.title,
      scientificName: tr.scientificName,
      family: tr.family,
      slug: tr.slug,
      description: tr.description,
      conservationStatus: tr.conservationStatus || undefined,
      maxHeight: tr.maxHeight || undefined,
      featuredImage: tr.featuredImage || undefined,
    }));

  return <FlashcardsClient trees={trees} />;
}
