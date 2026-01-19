import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { allTrees, allSpeciesComparisons } from "contentlayer/generated";
import { TreeComparison } from "@/components/TreeComparison";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import { ConfusionRatingBadge } from "@/components/comparison/ConfusionRatingBadge";
import { ComparisonTagPill } from "@/components/comparison/ComparisonTagPill";
import { getSpeciesImageUrl } from "@/lib/comparison";
import type { Locale } from "@/types/tree";

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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-2">
              {t("guidesTitle")}
            </h2>
            <p className="text-muted-foreground">{t("guidesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {comparisons.map((comparison) => {
              // Get the tree objects for the species being compared
              const speciesTrees = comparison.species
                .map((slug) => trees.find((t) => t.slug === slug))
                .filter((tree): tree is (typeof trees)[number] =>
                  Boolean(tree)
                );

              // Get featured images using shared helper
              const leftTree = speciesTrees[0];
              const rightTree = speciesTrees[1];

              const leftImage = leftTree
                ? comparison.featuredImages?.[0] ||
                  getSpeciesImageUrl(leftTree, 0)
                : "";

              const rightImage = rightTree
                ? comparison.featuredImages?.[1] ||
                  getSpeciesImageUrl(rightTree, 0)
                : "";

              return (
                <Link
                  key={comparison._id}
                  href={`/compare/${comparison.slug}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                >
                  {/* Dual Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    {/* Split Images */}
                    <div className="absolute inset-0 grid grid-cols-2">
                      {/* Left Species Image */}
                      <div className="relative overflow-hidden">
                        {leftTree && (
                          <>
                            <Image
                              src={leftImage}
                              alt={leftTree.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 50vw, 250px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-1">
                              <span className="text-white text-sm font-semibold drop-shadow-lg line-clamp-1">
                                {leftTree.title}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right Species Image */}
                      <div className="relative overflow-hidden">
                        {rightTree && (
                          <>
                            <Image
                              src={rightImage}
                              alt={rightTree.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 768px) 50vw, 250px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-2 left-1 right-2 text-right">
                              <span className="text-white text-sm font-semibold drop-shadow-lg line-clamp-1">
                                {rightTree.title}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
                        VS
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50" />
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-3 line-clamp-2">
                      {comparison.title}
                    </h3>

                    {/* Metadata Row: Confusion Rating + Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {comparison.confusionRating && (
                        <ConfusionRatingBadge
                          rating={comparison.confusionRating}
                          locale={locale as Locale}
                          variant="compact"
                        />
                      )}
                      {comparison.comparisonTags &&
                        comparison.comparisonTags
                          .slice(0, 3)
                          .map((tag) => (
                            <ComparisonTagPill
                              key={tag}
                              tag={tag}
                              variant="muted"
                              locale={locale as Locale}
                            />
                          ))}
                    </div>

                    {/* Key Difference */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border-l-4 border-primary">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                        {t("keyDifference")}
                      </p>
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {comparison.keyDifference}
                      </p>
                    </div>

                    {/* Seasonal Note (if available) */}
                    {comparison.seasonalNote && (
                      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>📅</span>
                        <span className="line-clamp-1">
                          {comparison.seasonalNote}
                        </span>
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-primary font-semibold text-sm group-hover:underline">
                        {t("readGuide")}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-primary group-hover:text-white transition-colors"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </div>
                    </div>
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
