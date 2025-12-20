import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Recursos Educativos - Atlas de Árboles de Costa Rica"
        : "Educational Resources - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Planes de lecciones, actividades de aula y materiales educativos sobre los árboles de Costa Rica para maestros y estudiantes."
        : "Lesson plans, classroom activities, and educational materials about Costa Rica trees for teachers and students.",
    alternates: {
      languages: {
        en: "/en/education",
        es: "/es/education",
      },
    },
  };
}

export default async function EducationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get tree count for stats
  const treeCount = allTrees.filter((t) => t.locale === locale).length;

  // Structured data for Education page
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      locale === "es"
        ? "Recursos Educativos - Atlas de Árboles de Costa Rica"
        : "Educational Resources - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Planes de lecciones, actividades de aula y materiales educativos sobre los árboles de Costa Rica."
        : "Lesson plans, classroom activities, and educational materials about Costa Rica trees.",
    url: `https://costaricatreeatlas.com/${locale}/education`,
    mainEntity: {
      "@type": "Course",
      name:
        locale === "es"
          ? "Aprendiendo sobre Árboles de Costa Rica"
          : "Learning About Costa Rica Trees",
      description:
        locale === "es"
          ? "Recursos educativos gratuitos para aprender sobre la flora arbórea costarricense."
          : "Free educational resources to learn about Costa Rican tree flora.",
      provider: {
        "@type": "Organization",
        name: "Costa Rica Tree Atlas",
        url: "https://costaricatreeatlas.com",
      },
      isAccessibleForFree: true,
      audience: {
        "@type": "EducationalAudience",
        educationalRole: "teacher",
      },
      educationalLevel: "K-12",
      inLanguage: locale === "es" ? "es" : "en",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <EducationContent treeCount={treeCount} />
        </div>
      </div>
    </>
  );
}

function EducationContent({ treeCount }: { treeCount: number }) {
  const t = useTranslations("education");

  const lessonPlans = [
    {
      id: "biodiversity-intro",
      icon: "🌿",
      grades: "3-5",
      duration: "45",
    },
    {
      id: "tree-identification",
      icon: "🔍",
      grades: "4-8",
      duration: "60",
    },
    {
      id: "conservation",
      icon: "🛡️",
      grades: "6-12",
      duration: "90",
    },
    {
      id: "ecosystem-services",
      icon: "🌍",
      grades: "7-12",
      duration: "60",
    },
  ];

  const activities = [
    {
      id: "tree-journal",
      icon: "📓",
      type: "individual",
    },
    {
      id: "scavenger-hunt",
      icon: "🗺️",
      type: "group",
    },
    {
      id: "leaf-collection",
      icon: "🍃",
      type: "field",
    },
    {
      id: "compare-contrast",
      icon: "⚖️",
      type: "classroom",
    },
  ];

  const printables = [
    {
      id: "tree-cards",
      icon: "🃏",
      format: "PDF",
    },
    {
      id: "identification-key",
      icon: "🔑",
      format: "PDF",
    },
    {
      id: "coloring-pages",
      icon: "🎨",
      format: "PDF",
    },
    {
      id: "species-checklist",
      icon: "✅",
      format: "PDF",
    },
  ];

  return (
    <article>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
          <span className="text-4xl" role="img" aria-hidden="true">
            📚
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats Banner */}
      <div className="bg-primary/5 rounded-2xl p-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">{treeCount}</div>
            <div className="text-sm text-muted-foreground">
              {t("stats.species")}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">
              {t("stats.lessonPlans")}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">4</div>
            <div className="text-sm text-muted-foreground">
              {t("stats.activities")}
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">2</div>
            <div className="text-sm text-muted-foreground">
              {t("stats.languages")}
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="mb-12">
        <div className="bg-card rounded-2xl p-8 border border-border">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            {t("intro.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t("intro.description")}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              <span>🎯</span> {t("intro.alignedCurriculum")}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
              <span>🌐</span> {t("intro.bilingualMaterials")}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm">
              <span>📱</span> {t("intro.digitalReady")}
            </span>
          </div>
        </div>
      </section>

      {/* Lesson Plans */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="text-3xl">📋</span>
          {t("lessons.title")}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {lessonPlans.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{lesson.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(`lessons.${lesson.id}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t(`lessons.${lesson.id}.description`)}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                      {t("lessons.grades")}: {lesson.grades}
                    </span>
                    <span className="px-2 py-1 bg-secondary/10 text-secondary rounded">
                      {lesson.duration} {t("lessons.minutes")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  {t("lessons.objectives")}:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {t(`lessons.${lesson.id}.objective1`)}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {t(`lessons.${lesson.id}.objective2`)}
                  </li>
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activities */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="text-3xl">🎯</span>
          {t("activities.title")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors text-center"
            >
              <div className="text-4xl mb-3">{activity.icon}</div>
              <h3 className="font-semibold text-foreground mb-2">
                {t(`activities.${activity.id}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {t(`activities.${activity.id}.description`)}
              </p>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs">
                {t(`activities.types.${activity.type}`)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Printable Resources */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="text-3xl">🖨️</span>
          {t("printables.title")}
        </h2>
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6">
          <p className="text-muted-foreground mb-6">
            {t("printables.description")}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {printables.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-lg p-4 border border-border flex items-center gap-3"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-foreground text-sm">
                    {t(`printables.${item.id}.title`)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.format}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4 italic">
            {t("printables.comingSoon")}
          </p>
        </div>
      </section>

      {/* Using the Atlas in Classroom */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
          <span className="text-3xl">💡</span>
          {t("tips.title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-foreground mb-2">
              {t("tips.explore.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("tips.explore.description")}
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="text-3xl mb-3">📷</div>
            <h3 className="font-semibold text-foreground mb-2">
              {t("tips.identify.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("tips.identify.description")}
            </p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="font-semibold text-foreground mb-2">
              {t("tips.compare.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("tips.compare.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-primary/5 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          {t("cta.title")}
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {t("cta.description")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/trees"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            🌳 {t("cta.exploreTrees")}
          </Link>
          <Link
            href="/identify"
            className="inline-flex items-center gap-2 px-6 py-3 bg-card text-foreground border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            📷 {t("cta.tryIdentify")}
          </Link>
        </div>
      </section>
    </article>
  );
}
