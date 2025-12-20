import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import TreeIdentificationClient from "./TreeIdentificationClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Education" });

  return {
    title:
      locale === "es"
        ? "Habilidades de Identificación de Árboles - Lección Educativa"
        : "Tree Identification Skills - Educational Lesson",
    description:
      locale === "es"
        ? "Aprende a identificar árboles por sus hojas, corteza, flores y frutos"
        : "Learn to identify trees by their leaves, bark, flowers and fruits",
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

  return (
    <TreeIdentificationClient
      trees={trees}
      locale={locale}
      totalSpecies={trees.length}
      totalFamilies={uniqueFamilies}
    />
  );
}
