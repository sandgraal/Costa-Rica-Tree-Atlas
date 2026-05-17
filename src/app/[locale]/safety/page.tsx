import { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { SafetyPageClient } from "./SafetyPageClient";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { buildSafetyFaqJsonLd } from "@/lib/seo/safety-faq";
import type { Locale } from "@/types";

interface SafetyPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: SafetyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "safety.page" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/safety",
        es: "/es/safety",
      },
    },
  };
}

export default async function SafetyPage({ params }: SafetyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "safety.page" });

  // Get trees for current locale
  const trees = allTrees.filter((tree) => tree.locale === locale);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("structuredDataName"),
    description: t("structuredDataDescription"),
    url: `https://costaricatreeatlas.com/${locale}/safety`,
    mainEntity: {
      "@type": "MedicalWebPage",
      name: t("structuredDataMainEntityName"),
      description: t("structuredDataMainEntityDescription"),
    },
  };

  const faqJsonLd = buildSafetyFaqJsonLd({
    locale,
    ingestion: {
      question: t("faqIngestionQuestion"),
      steps: [
        t("ingestionStep1"),
        t("ingestionStep2"),
        t("ingestionStep3"),
        t("ingestionStep4"),
        t("ingestionStep5"),
      ],
    },
    skinContact: {
      question: t("faqSkinContactQuestion"),
      steps: [
        t("skinContactStep1"),
        t("skinContactStep2"),
        t("skinContactStep3"),
        t("skinContactStep4"),
        t("skinContactStep5"),
      ],
    },
    eyeContact: {
      question: t("faqEyeContactQuestion"),
      steps: [
        t("eyeContactStep1"),
        t("eyeContactStep2"),
        t("eyeContactStep3"),
        t("eyeContactStep4"),
        t("eyeContactStep5"),
      ],
    },
    emergency: {
      question: t("faqEmergencyQuestion"),
      answer: t("faqEmergencyAnswer"),
    },
  });

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <SafeJsonLd data={faqJsonLd} />
      <SafetyPageClient trees={trees} />
    </>
  );
}
