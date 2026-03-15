import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "printablesHub" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/education/printables",
        es: "/es/education/printables",
      },
    },
  };
}

export default async function PrintablesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("printablesHub");

  const trees = allTrees.filter((tr) => tr.locale === locale);
  const families = [...new Set(trees.map((tr) => tr.family))].sort();

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
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
              🖨️
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
              {trees.length}
            </div>
            <div className="text-sm text-muted-foreground">{t("species")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {families.length}
            </div>
            <div className="text-sm text-muted-foreground">{t("families")}</div>
          </div>
        </div>

        {/* Printables Grid */}
        <div className="grid gap-6">
          {/* Species Checklist */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">✅</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t("speciesChecklist")}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t("speciesChecklistDesc")}
                </p>
                <Link
                  href="/education/printables/checklist"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t("viewPrint")}
                </Link>
              </div>
            </div>
          </div>

          {/* Flashcards */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">🃏</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t("flashcards")}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t("flashcardsDesc")}
                </p>
                <Link
                  href="/education/printables/flashcards"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t("viewPrint")}
                </Link>
              </div>
            </div>
          </div>

          {/* Family Guide */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">🌳</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t("familyGuide")}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t("familyGuideDesc")}
                </p>
                <Link
                  href="/education/printables/families"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t("viewPrint")}
                </Link>
              </div>
            </div>
          </div>

          {/* Identification Key */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">🔑</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t("identificationKey")}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t("identificationKeyDesc")}
                </p>
                <Link
                  href="/education/printables/identification-key"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t("viewPrint")}
                </Link>
              </div>
            </div>
          </div>

          {/* Coloring Pages */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">🎨</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t("coloringPages")}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t("coloringPagesDesc")}
                </p>
                <Link
                  href="/education/printables/coloring-pages"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t("viewPrint")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Print Tips */}
        <div className="mt-12 bg-primary/5 rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-3">
            {t("printingTips")}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• {t("printTip1")}</li>
            <li>• {t("printTip2")}</li>
            <li>• {t("printTip3")}</li>
            <li>• {t("printTip4")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
