import { setRequestLocale } from "next-intl/server";
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
        ? "Mapa de Árboles - Atlas de Árboles de Costa Rica"
        : "Tree Map - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Explora el mapa interactivo de árboles nativos de Costa Rica. Descubre especies por provincia y encuentra árboles cerca de ti."
        : "Explore the interactive map of Costa Rican native trees. Discover species by province and find trees near you.",
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
      locale === "es" ? "Mapa de Árboles de Costa Rica" : "Costa Rica Tree Map",
    description:
      locale === "es"
        ? "Mapa interactivo para explorar árboles nativos de Costa Rica."
        : "Interactive map for exploring Costa Rican native trees.",
    url: `https://costaricatreeatlas.com/${locale}/map`,
    applicationCategory: "UtilitiesApplication",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <TreeMapClient locale={locale} />
    </>
  );
}
