import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allSpeciesComparisons, allTrees } from "contentlayer/generated";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";
import { ServerMDXContent } from "@/components/ServerMDXContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { PrintButton } from "@/components/PrintButton";
import type { Locale } from "@/types/tree";
import Image from "next/image";
import { ConfusionRatingBadge } from "@/components/comparison/ConfusionRatingBadge";
import { ComparisonTagPill } from "@/components/comparison/ComparisonTagPill";
import { getSpeciesImageUrl } from "@/lib/comparison";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  allSpeciesComparisons.forEach((comparison) => {
    params.push({
      locale: comparison.locale,
      slug: comparison.slug,
    });
  });

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const comparison = allSpeciesComparisons.find(
    (c) => c.locale === locale && c.slug === slug
  );

  if (!comparison) {
    return {
      title: "Comparison Not Found",
    };
  }

  return {
    title: comparison.title,
    description: comparison.description,
    openGraph: {
      title: comparison.title,
      description: comparison.description,
      type: "article",
      locale: locale === "es" ? "es_CR" : "en_US",
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const comparison = allSpeciesComparisons.find(
    (c) => c.locale === locale && c.slug === slug
  );

  if (!comparison) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "comparison" });

  // Get the tree objects for the species being compared
  const speciesTrees = comparison.species
    .map((speciesSlug) =>
      allTrees.find((t) => t.slug === speciesSlug && t.locale === locale)
    )
    .filter((tree): tree is (typeof allTrees)[number] => Boolean(tree));

  const leftTree = speciesTrees[0];
  const rightTree = speciesTrees[1];

  // Get images using shared helper
  const leftImage = leftTree
    ? comparison.featuredImages?.[0] || getSpeciesImageUrl(leftTree, 0)
    : "";

  const rightImage = rightTree
    ? comparison.featuredImages?.[1] || getSpeciesImageUrl(rightTree, 0)
    : "";

  return (
    <article className="min-h-screen">
      {/* Hero Section with Split Images */}
      <div className="relative h-[40vh] min-h-[300px] max-h-[500px] overflow-hidden">
        {/* Split Background Images */}
        <div className="absolute inset-0 grid grid-cols-2">
          {/* Left Species */}
          <div className="relative overflow-hidden">
            {leftTree && (
              <>
                <Image
                  src={leftImage}
                  alt={leftTree.title}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/70" />
              </>
            )}
          </div>
          {/* Right Species */}
          <div className="relative overflow-hidden">
            {rightTree && (
              <>
                <Image
                  src={rightImage}
                  alt={rightTree.title}
                  fill
                  className="object-cover"
                  sizes="50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-black/70" />
              </>
            )}
          </div>
        </div>

        {/* Center Divider */}
        <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white/30 -translate-x-1/2 z-10" />

        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl md:text-2xl shadow-2xl border-4 border-white">
            VS
          </div>
        </div>

        {/* Species Labels */}
        <div className="absolute inset-0 flex">
          {/* Left Label */}
          <div className="flex-1 flex flex-col justify-end p-6 md:p-10">
            {leftTree && (
              <div className="text-white">
                <h2 className="text-2xl md:text-4xl font-bold drop-shadow-lg mb-1">
                  {leftTree.title}
                </h2>
                <p className="text-sm md:text-lg italic opacity-90 drop-shadow">
                  {leftTree.scientificName}
                </p>
              </div>
            )}
          </div>
          {/* Right Label */}
          <div className="flex-1 flex flex-col justify-end items-end p-6 md:p-10 text-right">
            {rightTree && (
              <div className="text-white">
                <h2 className="text-2xl md:text-4xl font-bold drop-shadow-lg mb-1">
                  {rightTree.title}
                </h2>
                <p className="text-sm md:text-lg italic opacity-90 drop-shadow">
                  {rightTree.scientificName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            locale={locale as Locale}
            customLabels={{
              compare: t("navLink"),
              [comparison.slug]: comparison.title,
            }}
          />
        </div>

        {/* Two-Column Layout: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main Content Column */}
          <div>
            {/* Title & Actions */}
            <header className="mb-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light">
                  {comparison.title}
                </h1>
                <div className="flex items-center gap-2 no-print">
                  <ShareButton
                    title={comparison.title}
                    scientificName=""
                    slug={`compare/${comparison.slug}`}
                  />
                  <PrintButton label={locale === "es" ? "Imprimir" : "Print"} />
                </div>
              </div>

              {/* Metadata: Rating, Tags, Seasonal Note */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {comparison.confusionRating && (
                  <ConfusionRatingBadge
                    rating={comparison.confusionRating}
                    locale={locale as Locale}
                    variant="detailed"
                  />
                )}
              </div>

              {comparison.comparisonTags &&
                comparison.comparisonTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {comparison.comparisonTags.map((tag) => (
                      <ComparisonTagPill
                        key={tag}
                        tag={tag}
                        variant="primary"
                      />
                    ))}
                  </div>
                )}

              {comparison.seasonalNote && (
                <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 border border-accent/30 rounded-xl text-sm mb-6">
                  <span className="text-xl">📅</span>
                  <span className="text-foreground/90">
                    {comparison.seasonalNote}
                  </span>
                </div>
              )}

              {/* Key Difference Callout */}
              <div className="p-5 bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary rounded-r-xl">
                <p className="text-sm font-bold text-primary uppercase tracking-wide mb-2">
                  {t("keyDifference")}
                </p>
                <p className="text-lg text-foreground">
                  {comparison.keyDifference}
                </p>
              </div>
            </header>

            {/* MDX Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <ServerMDXContent source={comparison.body.raw} />
            </div>

            {/* Interactive Tool CTA */}
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 md:p-8 text-center border border-primary/20 mb-8">
              <h3 className="text-xl font-bold mb-2">
                {locale === "es"
                  ? "¿Quieres explorar más?"
                  : "Want to explore more?"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {locale === "es"
                  ? "Usa nuestra herramienta interactiva para comparar estas especies lado a lado."
                  : "Use our interactive tool to compare these species side by side."}
              </p>
              <Link
                href={`/compare?species=${comparison.species.join(",")}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                {locale === "es"
                  ? "Comparar en herramienta interactiva"
                  : "Compare in interactive tool"}
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Back to Compare Page */}
            <div className="text-center pt-8 border-t border-border">
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-medium"
              >
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
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
                {t("backToComparisons")}
              </Link>
            </div>
          </div>

          {/* Sidebar - Sticky Quick Reference */}
          <aside className="hidden lg:block no-print">
            <div className="sticky top-24 space-y-6">
              {/* Species Quick Links */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">
                  {locale === "es" ? "Especies Comparadas" : "Compared Species"}
                </h3>
                <div className="space-y-3">
                  {speciesTrees.map((tree) => (
                    <Link
                      key={tree.slug}
                      href={`/trees/${tree.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={getSpeciesImageUrl(tree, 0)}
                          alt={tree.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                          {tree.title}
                        </p>
                        <p className="text-xs text-muted-foreground italic truncate">
                          {tree.scientificName}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Summary Card */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-border rounded-xl p-5">
                <h3 className="font-bold text-sm uppercase tracking-wide text-primary mb-3">
                  {locale === "es" ? "Resumen Rápido" : "Quick Summary"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {comparison.description}
                </p>
              </div>

              {/* Difficulty Badge (if available) */}
              {comparison.difficulty && (
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                    {locale === "es" ? "Dificultad" : "Difficulty"}
                  </h3>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm ${
                      comparison.difficulty === "easy"
                        ? "bg-success/10 text-success"
                        : comparison.difficulty === "moderate"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <span>
                      {comparison.difficulty === "easy"
                        ? "🟢"
                        : comparison.difficulty === "moderate"
                          ? "🟡"
                          : "🔴"}
                    </span>
                    <span className="capitalize">
                      {locale === "es"
                        ? comparison.difficulty === "easy"
                          ? "Fácil"
                          : comparison.difficulty === "moderate"
                            ? "Moderado"
                            : "Desafiante"
                        : comparison.difficulty.charAt(0).toUpperCase() +
                          comparison.difficulty.slice(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
