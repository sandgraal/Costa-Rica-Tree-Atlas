import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import ClassroomClient from "./ClassroomClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Aula Virtual - Atlas de Árboles de Costa Rica"
        : "Classroom - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Crea o únete a un aula virtual para seguir el progreso de tu clase."
        : "Create or join a virtual classroom to track your class progress.",
  };
}

export default async function ClassroomPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = {
    title: locale === "es" ? "Aula Virtual" : "Virtual Classroom",
    subtitle:
      locale === "es"
        ? "Crea o únete a un aula para competir con tus compañeros"
        : "Create or join a classroom to compete with classmates",
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full mb-6">
            <span className="text-4xl" role="img" aria-hidden="true">
              🏆
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        <ClassroomClient locale={locale} />
      </div>
    </div>
  );
}
