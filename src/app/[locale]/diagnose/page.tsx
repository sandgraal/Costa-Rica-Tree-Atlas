import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import DiagnoseClient from "./DiagnoseClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Herramienta de Diagnóstico de Salud de Árboles - Atlas de Árboles de Costa Rica"
        : "Tree Health Diagnostic Tool - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Diagnostica problemas de salud de árboles basado en síntomas y recibe recomendaciones de tratamiento."
        : "Diagnose tree health problems based on symptoms and receive treatment recommendations.",
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

  return <DiagnoseClient locale={locale} />;
}
