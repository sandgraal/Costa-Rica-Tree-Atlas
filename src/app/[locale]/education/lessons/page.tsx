import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";
import LessonsClient from "./LessonsClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lessonsHub" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
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

  const trees = allTrees.filter((tr) => tr.locale === locale);
  const treeCount = trees.length;

  const t = await getTranslations({ locale, namespace: "lessonsHub" });

  const lessonPlans = [
    {
      id: "biodiversity-intro",
      icon: "🌿",
      color: "from-green-500/20 to-emerald-500/20",
      grades: "3-5",
      duration: "45",
      activityCount: 4,
      features: ["interactive", "printable"],
      title: t("biodiversityTitle"),
      description: t("biodiversityDescription"),
      objectives: [
        t("biodiversityObj1"),
        t("biodiversityObj2"),
        t("biodiversityObj3"),
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
      title: t("treeIdTitle"),
      description: t("treeIdDescription"),
      objectives: [t("treeIdObj1"), t("treeIdObj2"), t("treeIdObj3")],
    },
    {
      id: "conservation",
      icon: "🛡️",
      color: "from-orange-500/20 to-amber-500/20",
      grades: "6-12",
      duration: "90",
      activityCount: 6,
      features: ["interactive", "multimedia"],
      title: t("conservationTitle"),
      description: t("conservationDescription"),
      objectives: [
        t("conservationObj1"),
        t("conservationObj2"),
        t("conservationObj3"),
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
      title: t("ecosystemTitle"),
      description: t("ecosystemDescription"),
      objectives: [t("ecosystemObj1"), t("ecosystemObj2"), t("ecosystemObj3")],
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
          {t("backToEducation")}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <span className="text-4xl" role="img" aria-hidden="true">
              📋
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {lessonPlans.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {t("lessonsStat")}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{treeCount}</div>
            <div className="text-sm text-muted-foreground">{t("species")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">K-12</div>
            <div className="text-sm text-muted-foreground">
              {t("gradeLevels")}
            </div>
          </div>
        </div>

        {/* Lesson Cards */}
        <LessonsClient lessonPlans={lessonPlans} />
      </div>
    </div>
  );
}
