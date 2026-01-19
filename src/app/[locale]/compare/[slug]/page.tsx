import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { allSpeciesComparisons, allTrees } from "contentlayer/generated";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";
import { ServerMDXContent } from "@/components/ServerMDXContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ShareButton } from "@/components/ShareButton";
import { PrintButton } from "@/components/PrintButton";
import type { Locale } from "@/types/tree";

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

  // Get the tree objects for the species being compared
  const speciesTrees = comparison.species
    .map((speciesSlug) =>
      allTrees.find((t) => t.slug === speciesSlug && t.locale === locale)
    )
    .filter(Boolean);

  return (
    <article className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          locale={locale as Locale}
          customLabels={{
            compare: locale === "es" ? "Comparar" : "Compare",
            [comparison.slug]: comparison.title,
          }}
        />

        {/* Actions Bar */}
        <div className="mb-8 flex justify-end items-center gap-2 no-print">
          <ShareButton
            title={comparison.title}
            scientificName=""
            slug={`compare/${comparison.slug}`}
          />
          <PrintButton label={locale === "es" ? "Imprimir" : "Print"} />
        </div>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
            {comparison.title}
          </h1>

          {/* Species Being Compared */}
          {speciesTrees.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {speciesTrees.map((tree) => (
                <Link
                  key={tree?.slug}
                  href={`/trees/${tree?.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                >
                  <span className="font-medium">{tree?.title}</span>
                  <span className="text-sm italic opacity-80">
                    {tree?.scientificName}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Key Difference Callout */}
          <div className="p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
            <p className="text-sm font-semibold text-primary mb-1">
              {locale === "es" ? "Diferencia Clave" : "Key Difference"}:
            </p>
            <p className="text-foreground">{comparison.keyDifference}</p>
          </div>
        </header>

        {/* MDX Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <ServerMDXContent source={comparison.body.raw} />
        </div>

        {/* Back to Compare Page */}
        <div className="text-center pt-8 border-t border-border">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
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
            {locale === "es" ? "Volver a Comparaciones" : "Back to Comparisons"}
          </Link>
        </div>
      </div>
    </article>
  );
}
