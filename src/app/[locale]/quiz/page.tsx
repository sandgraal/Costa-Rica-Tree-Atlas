import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import QuizClient from "./QuizClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quiz" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/quiz",
        es: "/es/quiz",
      },
    },
  };
}

export default async function QuizPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Filter trees with safety data and images for quiz
  const trees = allTrees
    .filter((t) => t.locale === locale)
    .filter((t) => t.featuredImage || (t.images && t.images.length > 0))
    .map((t) => ({
      title: t.title,
      scientificName: t.scientificName,
      slug: t.slug,
      family: t.family,
      tags: t.tags || [],
      featuredImage: t.featuredImage || undefined,
      toxicityLevel: t.toxicityLevel || undefined,
      childSafe: t.childSafe,
      petSafe: t.petSafe,
    }));

  return <QuizClient trees={trees} />;
}
