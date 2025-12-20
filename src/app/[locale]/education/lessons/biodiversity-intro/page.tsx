import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import BiodiversityLessonClient from "./BiodiversityLessonClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Introducción a la Biodiversidad - Atlas de Árboles de Costa Rica"
        : "Introduction to Biodiversity - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Lección interactiva sobre biodiversidad y los árboles de Costa Rica."
        : "Interactive lesson about biodiversity and Costa Rica's trees.",
    alternates: {
      languages: {
        en: "/en/education/lessons/biodiversity-intro",
        es: "/es/education/lessons/biodiversity-intro",
      },
    },
  };
}

export default async function BiodiversityLessonPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Sort deterministically by title hash to get varied but consistent selection
  const trees = allTrees
    .filter((t) => t.locale === locale)
    .sort((a, b) => {
      // Simple hash-based sorting for variety without randomness
      const hashA = a.title
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hashB = b.title
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return hashA - hashB;
    })
    .slice(0, 20)
    .map((t) => ({
      title: t.title,
      scientificName: t.scientificName,
      family: t.family,
      slug: t.slug,
      description: t.description?.slice(0, 150) + "..." || "",
      featuredImage: t.featuredImage || undefined,
      conservationStatus: t.conservationStatus || undefined,
      nativeRegion: t.nativeRegion || undefined,
    }));

  const families = [
    ...new Set(
      allTrees.filter((t) => t.locale === locale).map((t) => t.family)
    ),
  ];

  return (
    <BiodiversityLessonClient
      trees={trees}
      locale={locale}
      totalSpecies={allTrees.filter((t) => t.locale === locale).length}
      totalFamilies={families.length}
    />
  );
}
