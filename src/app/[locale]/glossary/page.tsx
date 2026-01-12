import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { allGlossaryTerms } from "contentlayer/generated";
import { Suspense } from "react";
import type { Locale, GlossaryCategory } from "@/types";
import { GlossaryFilters } from "@/components/glossary/GlossaryFilters";

interface GlossaryPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ category?: string; search?: string }>;
}

export async function generateMetadata({
  params,
}: GlossaryPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function GlossaryPage({
  params,
  searchParams,
}: GlossaryPageProps) {
  const { locale } = await params;
  const { category, search } = await searchParams;

  setRequestLocale(locale);

  const t = await getTranslations("glossary");

  // Filter terms by locale
  let terms = allGlossaryTerms.filter((term) => term.locale === locale);

  // Filter by category if provided
  if (category && category !== "all") {
    terms = terms.filter((term) => term.category === category);
  }

  // Filter by search query if provided
  if (search) {
    const searchLower = search.toLowerCase();
    terms = terms.filter(
      (term) =>
        term.term.toLowerCase().includes(searchLower) ||
        term.simpleDefinition.toLowerCase().includes(searchLower)
    );
  }

  // Sort alphabetically by term
  terms.sort((a, b) => a.term.localeCompare(b.term, locale));

  // Group terms by first letter
  const groupedTerms = terms.reduce(
    (acc, term) => {
      const firstLetter = term.term[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(term);
      return acc;
    },
    {} as Record<string, typeof terms>
  );

  const letters = Object.keys(groupedTerms).sort();

  const categories: GlossaryCategory[] = [
    "anatomy",
    "ecology",
    "taxonomy",
    "morphology",
    "reproduction",
    "general",
    "timber",
  ];

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-dark dark:text-primary-light mb-4">
            📖 {t("title")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
          <p className="mt-4 text-lg text-foreground/70 font-medium">
            {t("termCount", { count: terms.length })}
          </p>
        </header>

        {/* Search and Filters */}
        <Suspense
          fallback={
            <div className="mb-8 h-32 bg-card rounded-xl border border-border animate-pulse" />
          }
        >
          <GlossaryFilters />
        </Suspense>

        {/* A-Z Navigation */}
        {letters.length > 0 && (
          <nav
            className="mb-10 bg-muted/30 rounded-xl p-5 border border-border/50"
            aria-label={t("alphabetNav")}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {letters.map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className="min-w-[2.5rem] h-10 flex items-center justify-center px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-all hover:scale-105 hover:shadow-md"
                >
                  {letter}
                </a>
              ))}
            </div>
          </nav>
        )}

        {/* Terms List */}
        {letters.length > 0 ? (
          <div className="space-y-16">
            {letters.map((letter) => (
              <section key={letter} id={letter} className="scroll-mt-24">
                <h2 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-6 pb-3 border-b-2 border-primary/30 flex items-center gap-3">
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                    {letter}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {groupedTerms[letter].map((term) => (
                    <a
                      key={term._id}
                      href={term.url}
                      className="group block bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                          {term.term}
                        </h3>
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap flex-shrink-0">
                          {t(`categories.${term.category}`)}
                        </span>
                      </div>
                      {term.pronunciation && (
                        <p className="text-sm text-muted-foreground italic mb-3">
                          {term.pronunciation}
                        </p>
                      )}
                      <p className="text-foreground/80 text-sm leading-relaxed">
                        {term.simpleDefinition}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-2xl text-muted-foreground font-medium">
              {t("noResults")}
            </p>
          </div>
        )}

        {/* Back to Top */}
        {letters.length > 0 && (
          <div className="mt-16 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5 font-medium text-lg"
            >
              ↑ {t("backToTop")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
