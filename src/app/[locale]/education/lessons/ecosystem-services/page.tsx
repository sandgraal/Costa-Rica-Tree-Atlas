import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import EcosystemServicesClient from "./EcosystemServicesClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Servicios Ecosistémicos - Lección Educativa"
        : "Ecosystem Services - Educational Lesson",
    description:
      locale === "es"
        ? "Descubre los increíbles beneficios que los árboles brindan a nuestro planeta"
        : "Discover the incredible benefits trees provide to our planet",
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

  return <EcosystemServicesClient trees={trees} locale={locale} />;
}
