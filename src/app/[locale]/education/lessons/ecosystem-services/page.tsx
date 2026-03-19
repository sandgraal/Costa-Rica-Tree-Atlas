import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import EcosystemServicesClient from "./EcosystemServicesClient";
import { getEcosystemServicesLessonData } from "./ecosystem-services-data";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ecosystemServices" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/education/lessons/ecosystem-services",
        es: "/es/education/lessons/ecosystem-services",
      },
    },
  };
}

export default async function EcosystemServicesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((tree) => tree.locale === locale)
    .map((tree) => ({
      title: tree.title,
      scientificName: tree.scientificName,
      family: tree.family,
      slug: tree.slug,
      description: tree.description || "",
      featuredImage: tree.featuredImage,
      uses: tree.uses || [],
      tags: tree.tags || [],
    }));

  // Build locale-specific lesson data on the server so it ships as RSC
  // payload (serialized data) rather than executable client JS.
  const lessonData = getEcosystemServicesLessonData(locale);

  return <EcosystemServicesClient trees={trees} lessonData={lessonData} />;
}
