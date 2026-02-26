import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";
import LessonsClient from "./LessonsClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Planes de Lección - Atlas de Árboles de Costa Rica"
        : "Lesson Plans - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Planes de lección interactivos sobre árboles y ecosistemas de Costa Rica. Biodiversidad, conservación, servicios ecosistémicos e identificación."
        : "Interactive lesson plans about Costa Rican trees and ecosystems. Biodiversity, conservation, ecosystem services, and identification.",
    alternates: {
      languages: {
        en: "/en/education/lessons",
        es: "/es/education/lessons",
      },
    },
  };
}

export default async function LessonsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees.filter((t) => t.locale === locale);
  const treeCount = trees.length;

  const t = {
    title: locale === "es" ? "Planes de Lección" : "Lesson Plans",
    subtitle:
      locale === "es"
        ? "Lecciones interactivas diseñadas para diferentes niveles educativos"
        : "Interactive lessons designed for different grade levels",
    backToEducation:
      locale === "es"
        ? "← Volver a Recursos Educativos"
        : "← Back to Education",
    startLesson: locale === "es" ? "Comenzar Lección" : "Start Lesson",
    grades: locale === "es" ? "Grados" : "Grades",
    duration: locale === "es" ? "Duración" : "Duration",
    minutes: locale === "es" ? "minutos" : "minutes",
    activities: locale === "es" ? "Actividades" : "Activities",
    objectives: locale === "es" ? "Objetivos" : "Objectives",
    interactive: locale === "es" ? "Interactivo" : "Interactive",
    printable: locale === "es" ? "Imprimible" : "Printable",
    multimedia: locale === "es" ? "Multimedia" : "Multimedia",
  };

  const lessonPlans = [
    {
      id: "biodiversity-intro",
      icon: "🌿",
      color: "from-green-500/20 to-emerald-500/20",
      grades: "3-5",
      duration: "45",
      activityCount: 4,
      features: ["interactive", "printable"],
      title:
        locale === "es"
          ? "Introducción a la Biodiversidad"
          : "Introduction to Biodiversity",
      description:
        locale === "es"
          ? "Los estudiantes exploran qué significa biodiversidad y por qué Costa Rica es uno de los lugares más biodiversos de la Tierra."
          : "Students explore what biodiversity means and why Costa Rica is one of the most biodiverse places on Earth.",
      objectives:
        locale === "es"
          ? [
              "Definir biodiversidad y explicar su importancia",
              "Identificar al menos 5 especies de árboles nativos de Costa Rica",
              "Crear un mapa de biodiversidad local",
            ]
          : [
              "Define biodiversity and explain its importance",
              "Identify at least 5 native Costa Rican tree species",
              "Create a local biodiversity map",
            ],
    },
    {
      id: "tree-identification",
      icon: "🔍",
      color: "from-blue-500/20 to-cyan-500/20",
      grades: "4-8",
      duration: "60",
      activityCount: 5,
      features: ["interactive", "printable", "multimedia"],
      title:
        locale === "es"
          ? "Habilidades de Identificación de Árboles"
          : "Tree Identification Skills",
      description:
        locale === "es"
          ? "Aprende a identificar árboles usando hojas, corteza, flores y frutos mediante observación práctica."
          : "Learn to identify trees using leaves, bark, flowers, and fruits through hands-on observation.",
      objectives:
        locale === "es"
          ? [
              "Usar una clave dicotómica para identificar especies de árboles",
              "Describir características clave que distinguen diferentes árboles",
              "Documentar observaciones de campo sistemáticamente",
            ]
          : [
              "Use a dichotomous key to identify tree species",
              "Describe key features that distinguish different trees",
              "Document field observations systematically",
            ],
    },
    {
      id: "conservation",
      icon: "🛡️",
      color: "from-orange-500/20 to-amber-500/20",
      grades: "6-12",
      duration: "90",
      activityCount: 6,
      features: ["interactive", "multimedia"],
      title:
        locale === "es"
          ? "Conservación y Amenazas"
          : "Conservation and Threats",
      description:
        locale === "es"
          ? "Comprende las amenazas que enfrentan los bosques tropicales y los esfuerzos de conservación que los protegen."
          : "Understand the threats facing tropical forests and the conservation efforts protecting them.",
      objectives:
        locale === "es"
          ? [
              "Analizar los impactos humanos en los ecosistemas forestales tropicales",
              "Evaluar estrategias de conservación y su efectividad",
              "Diseñar un plan de acción de conservación local",
            ]
          : [
              "Analyze human impacts on tropical forest ecosystems",
              "Evaluate conservation strategies and their effectiveness",
              "Design a local conservation action plan",
            ],
    },
    {
      id: "ecosystem-services",
      icon: "🌍",
      color: "from-purple-500/20 to-violet-500/20",
      grades: "7-12",
      duration: "60",
      activityCount: 4,
      features: ["interactive", "printable"],
      title: locale === "es" ? "Servicios Ecosistémicos" : "Ecosystem Services",
      description:
        locale === "es"
          ? "Descubre cómo los árboles proporcionan servicios esenciales como aire limpio, filtración de agua y hábitat."
          : "Discover how trees provide essential services like clean air, water filtration, and habitat.",
      objectives:
        locale === "es"
          ? [
              "Listar servicios ecosistémicos proporcionados por árboles tropicales",
              "Calcular el valor de los servicios ecosistémicos en un área determinada",
              "Crear infografías sobre beneficios de los árboles",
            ]
          : [
              "List ecosystem services provided by tropical trees",
              "Calculate the value of ecosystem services in a given area",
              "Create infographics about tree benefits",
            ],
    },
  ];

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Back link */}
        <Link
          href="/education"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          {t.backToEducation}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <span className="text-4xl" role="img" aria-hidden="true">
              📋
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {lessonPlans.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {locale === "es" ? "Lecciones" : "Lessons"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{treeCount}</div>
            <div className="text-sm text-muted-foreground">
              {locale === "es" ? "Especies" : "Species"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">K-12</div>
            <div className="text-sm text-muted-foreground">
              {locale === "es" ? "Niveles" : "Grade Levels"}
            </div>
          </div>
        </div>

        {/* Lesson Cards */}
        <LessonsClient lessonPlans={lessonPlans} locale={locale} t={t} />
      </div>
    </div>
  );
}
