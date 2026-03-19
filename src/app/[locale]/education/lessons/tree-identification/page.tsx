import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import TreeIdentificationClient from "./TreeIdentificationClient";
import { getTreeIdentificationLessonData } from "./tree-identification-data";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "education" });

  return {
    title: t("treeIdentificationMetaTitle"),
    description: t("treeIdentificationMetaDescription"),
    alternates: {
      languages: {
        en: "/en/education/lessons/tree-identification",
        es: "/es/education/lessons/tree-identification",
      },
    },
  };
}

export default async function TreeIdentificationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees and organize by identifying features
  const trees = allTrees
    .filter((tree) => tree.locale === locale)
    .map((tree) => ({
      title: tree.title,
      scientificName: tree.scientificName,
      family: tree.family,
      slug: tree.slug,
      description: tree.description || "",
      featuredImage: tree.featuredImage,
      conservationStatus: tree.conservationStatus,
      tags: tree.tags || [],
      maxHeight: tree.maxHeight,
      floweringSeason: tree.floweringSeason || [],
      fruitingSeason: tree.fruitingSeason || [],
    }));

  const uniqueFamilies = [...new Set(trees.map((t) => t.family))].length;

  // Build locale-specific lesson data on the server so it ships as RSC
  // payload (serialized data) rather than executable client JS.
  const lessonData = getTreeIdentificationLessonData(locale);

  return (
    <TreeIdentificationClient
      trees={trees}
      locale={locale}
      totalSpecies={trees.length}
      totalFamilies={uniqueFamilies}
      lessonData={lessonData}
    />
  );
}
