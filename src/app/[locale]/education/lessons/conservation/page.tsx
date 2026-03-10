import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import ConservationLessonClient from "./ConservationLessonClient";
import { getConservationLessonData } from "./conservation-data";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Conservación y Amenazas - Lección Educativa"
        : "Conservation and Threats - Educational Lesson",
    description:
      locale === "es"
        ? "Aprende sobre amenazas a los bosques de Costa Rica y estrategias de conservación. Actividades interactivas con datos UICN."
        : "Learn about threats to Costa Rican forests and conservation strategies. Interactive activities with IUCN data.",
  };
}

export default async function ConservationPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees with conservation status
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
      nativeRegion: tree.nativeRegion,
    }));

  // Count trees by conservation status
  const statusCounts = trees.reduce(
    (acc, tree) => {
      const status = tree.conservationStatus || "Not Evaluated";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const endangeredTrees = trees.filter((t) =>
    [
      "Endangered",
      "Critically Endangered",
      "Vulnerable",
      "En Peligro",
      "En Peligro Crítico",
      "Vulnerable",
    ].includes(t.conservationStatus || "")
  );

  // Build locale-specific lesson data on the server so it ships as RSC
  // payload (serialized data) rather than executable client JS.
  const lessonData = getConservationLessonData(locale);

  return (
    <ConservationLessonClient
      trees={trees}
      locale={locale}
      statusCounts={statusCounts}
      endangeredTrees={endangeredTrees}
      lessonData={lessonData}
    />
  );
}
