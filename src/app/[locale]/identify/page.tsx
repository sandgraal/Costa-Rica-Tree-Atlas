import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import IdentifyClient from "./IdentifyClient";

interface IdentifyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: IdentifyPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Identificar Árboles - Atlas de Árboles de Costa Rica"
        : "Identify Trees - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Sube una foto de un árbol y usa inteligencia artificial para identificar especies de árboles de Costa Rica."
        : "Upload a photo of a tree and use AI to identify Costa Rican tree species.",
    alternates: {
      languages: {
        en: "/en/identify",
        es: "/es/identify",
      },
    },
  };
}

export default async function IdentifyPage({ params }: IdentifyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Structured data for Identify page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name:
      locale === "es"
        ? "Identificador de Árboles de Costa Rica"
        : "Costa Rica Tree Identifier",
    description:
      locale === "es"
        ? "Herramienta de identificación de árboles mediante inteligencia artificial."
        : "AI-powered tree identification tool.",
    url: `https://costaricatreeatlas.com/${locale}/identify`,
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
      <IdentifyClient locale={locale} />
    </>
  );
}
