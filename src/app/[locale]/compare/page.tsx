import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { allTrees, allSpeciesComparisons } from "contentlayer/generated";
import { TreeComparison } from "@/components/TreeComparison";
import { Link } from "@i18n/navigation";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "comparison" });
  const siteT = await getTranslations({ locale });

  return {
    title: `${t("title")} | ${siteT("siteTitle")}`,
    description: t("subtitle"),
  };
}

export default async function ComparePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get all trees for the current locale
  const trees = allTrees
    .filter((tree) => tree.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title));

  // Get all comparison guides for the current locale
  const comparisons = allSpeciesComparisons
    .filter((comp) => comp.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <ComparePageClient
      locale={locale}
      trees={trees}
      comparisons={comparisons}
    />
  );
}

function ComparePageClient({
  locale,
  trees,
  comparisons,
}: {
  locale: string;
  trees: (typeof allTrees)[number][];
  comparisons: (typeof allSpeciesComparisons)[number][];
}) {
  const t = useTranslations("comparison");

  const translations = {
    title: t("title"),
    selectTree: t("selectTree"),
    selectPlaceholder: t("selectPlaceholder"),
    addTree: t("addTree"),
    removeTree: t("removeTree"),
    noTreesSelected: t("noTreesSelected"),
    properties: {
      image: t("properties.image"),
      commonName: t("properties.commonName"),
      scientificName: t("properties.scientificName"),
      family: t("properties.family"),
      maxHeight: t("properties.maxHeight"),
      nativeRegion: t("properties.nativeRegion"),
      conservationStatus: t("properties.conservationStatus"),
      uses: t("properties.uses"),
      tags: t("properties.tags"),
    },
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-2">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Comparison Guides Section */}
      {comparisons.length > 0 && (
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-2">
              {t("guidesTitle")}
            </h2>
            <p className="text-muted-foreground">{t("guidesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisons.map((comparison) => {
              // Get the tree objects for the species being compared
              const speciesTrees = comparison.species
                .map((slug) => trees.find((t) => t.slug === slug))
                .filter((tree): tree is (typeof trees)[number] =>
                  Boolean(tree)
                );

              return (
                <Link
                  key={comparison._id}
                  href={`/compare/${comparison.slug}`}
                  className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
                    {comparison.title}
                  </h3>

                  {/* Species Being Compared */}
                  {speciesTrees.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {speciesTrees.map((tree) => (
                        <span
                          key={tree.slug}
                          className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                        >
                          {tree.title}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Key Difference */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <p className="text-xs font-medium text-primary mb-1">
                      {t("keyDifference")}:
                    </p>
                    <p className="text-sm text-foreground/80">
                      {comparison.keyDifference}
                    </p>
                  </div>

                  {/* Read Guide Button */}
                  <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                    {t("readGuide")}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Comparison Tool */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-2">
            {t("toolTitle")}
          </h2>
          <p className="text-muted-foreground">{t("toolSubtitle")}</p>
        </div>

        <TreeComparison
          trees={trees}
          locale={locale}
          translations={translations}
        />
      </section>
    </main>
  );
}
