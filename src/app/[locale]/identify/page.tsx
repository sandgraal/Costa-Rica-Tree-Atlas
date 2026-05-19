import { NextIntlClientProvider } from "next-intl";
import {
  getTranslations,
  setRequestLocale,
  getMessages,
} from "next-intl/server";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import type { Metadata } from "next";
import type { AbstractIntlMessages } from "next-intl";
import IdentifyClient from "./IdentifyClient";

interface IdentifyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: IdentifyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "identify" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
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
  const t = await getTranslations("identify");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("structuredName"),
    description: t("structuredDescription"),
    url: `https://costaricatreeatlas.org/${locale}/identify`,
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
      url: "https://costaricatreeatlas.org",
    },
  };

  // Provide identify namespace to the client component.
  const messages = await getMessages();
  const castMessages = messages as Record<string, AbstractIntlMessages>;
  const clientMessages = { identify: castMessages.identify };

  return (
    <NextIntlClientProvider messages={clientMessages}>
      <SafeJsonLd data={structuredData} />
      <IdentifyClient />
    </NextIntlClientProvider>
  );
}
