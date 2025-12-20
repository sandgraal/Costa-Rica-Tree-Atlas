import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import ConservationLessonClient from "./ConservationLessonClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Conservación y Amenazas - Lección Educativa"
        : "Conservation and Threats - Educational Lesson",
    description:
      locale === "es"
        ? "Aprende sobre las amenazas a los bosques y cómo proteger los árboles de Costa Rica"
        : "Learn about threats to forests and how to protect Costa Rican trees",
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

  return (
    <ConservationLessonClient
      trees={trees}
      locale={locale}
      statusCounts={statusCounts}
      endangeredTrees={endangeredTrees}
    />
  );
}
