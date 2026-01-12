import { Metadata } from "next";
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

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-3">
            📖 {t("title")}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <p className="mt-3 text-sm text-foreground/70">
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
            className="mb-8 bg-muted/30 rounded-lg p-4 border border-border/50"
            aria-label={t("alphabetNav")}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {letters.map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className="min-w-[2rem] h-8 flex items-center justify-center px-2.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-all hover:scale-105"
                >
                  {letter}
                </a>
              ))}
            </div>
          </nav>
        )}

        {/* Terms List */}
        {letters.length > 0 ? (
          <div className="space-y-12">
            {letters.map((letter) => (
              <section key={letter} id={letter} className="scroll-mt-20">
                <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4 pb-2 border-b border-primary/20 flex items-center gap-2">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-lg">
                    {letter}
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedTerms[letter].map((term) => (
                    <a
                      key={term._id}
                      href={term.url}
                      className="group block bg-card rounded-lg p-4 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {term.term}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap flex-shrink-0">
                          {t(`categories.${term.category}`)}
                        </span>
                      </div>
                      {term.pronunciation && (
                        <p className="text-xs text-muted-foreground italic mb-2">
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
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-lg text-muted-foreground">{t("noResults")}</p>
          </div>
        )}

        {/* Back to Top */}
        {letters.length > 0 && (
          <div className="mt-12 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all hover:shadow-md font-medium text-sm"
            >
              ↑ {t("backToTop")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
