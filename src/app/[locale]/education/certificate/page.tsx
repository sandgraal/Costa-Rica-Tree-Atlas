import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import CertificateClient from "./CertificateClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Certificado de Logros - Atlas de Árboles de Costa Rica"
        : "Achievement Certificate - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Genera tu certificado personalizado de logros en el Atlas de Árboles de Costa Rica."
        : "Generate your personalized achievement certificate from Costa Rica Tree Atlas.",
  };
}

export default async function CertificatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = {
    title: locale === "es" ? "Certificado de Logros" : "Achievement Certificate",
    subtitle:
      locale === "es"
        ? "Genera tu certificado personalizado al completar lecciones"
        : "Generate your personalized certificate upon completing lessons",
    backToEducation:
      locale === "es"
        ? "← Volver a Recursos Educativos"
        : "← Back to Education",
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link
          href="/education"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          {t.backToEducation}
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/10 rounded-full mb-6">
            <span className="text-4xl" role="img" aria-hidden="true">
              📜
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <CertificateClient locale={locale} />
      </div>
    </div>
  );
}
