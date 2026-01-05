import { setRequestLocale } from "next-intl/server";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import type { Metadata } from "next";
import TreeMapClient from "./TreeMapClient";

interface MapPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: MapPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Explorar por Región - Atlas de Árboles de Costa Rica"
        : "Explore by Region - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Explora la distribución de árboles nativos de Costa Rica por provincia y región. Descubre la biodiversidad de cada zona del país."
        : "Explore the distribution of Costa Rican native trees by province and region. Discover the biodiversity of each area of the country.",
    alternates: {
      languages: {
        en: "/en/map",
        es: "/es/map",
      },
    },
  };
}

export default async function MapPage({ params }: MapPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Structured data for Map page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name:
      locale === "es"
        ? "Explorar Regiones de Costa Rica"
        : "Explore Costa Rica Regions",
    description:
      locale === "es"
        ? "Mapa interactivo para explorar la distribución de árboles nativos por provincia y región en Costa Rica."
        : "Interactive map for exploring native tree distribution by province and region in Costa Rica.",
    url: `https://costaricatreeatlas.com/${locale}/map`,
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    provider: {
      "@type": "Organization",
      name: "Costa Rica Tree Atlas",
      url: "https://costaricatreeatlas.com",
    },
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <TreeMapClient locale={locale} />
    </>
  );
}
