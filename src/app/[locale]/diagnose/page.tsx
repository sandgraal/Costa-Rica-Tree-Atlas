import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import DiagnoseClient from "./DiagnoseClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "diagnose" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/diagnose",
        es: "/es/diagnose",
      },
    },
  };
}

export default async function DiagnosePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DiagnoseClient />;
}
