import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { allGlossaryTerms } from "contentlayer/generated";
import type { Locale, GlossaryCategory } from "@/types";

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
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-dark dark:text-primary-light mb-4">
            📖 {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
          <p className="mt-4 text-foreground/80">
            {t("termCount", { count: terms.length })}
          </p>
        </header>

        {/* Search and Filters */}
        <div className="mb-8 bg-card rounded-xl p-6 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium mb-2"
              >
                {t("searchLabel")}
              </label>
              <input
                type="search"
                id="search"
                name="search"
                defaultValue={search}
                placeholder={t("searchPlaceholder")}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium mb-2"
              >
                {t("categoryLabel")}
              </label>
              <select
                id="category"
                name="category"
                defaultValue={category || "all"}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="all">{t("categories.all")}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`categories.${cat}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* A-Z Navigation */}
        {letters.length > 0 && (
          <nav
            className="mb-8 bg-muted/50 rounded-xl p-4"
            aria-label={t("alphabetNav")}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {letters.map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className="px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
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
              <section key={letter} id={letter}>
                <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-6 pb-2 border-b-2 border-primary/20">
                  {letter}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedTerms[letter].map((term) => (
                    <a
                      key={term._id}
                      href={term.url}
                      className="block bg-card rounded-xl p-5 border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {term.term}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {t(`categories.${term.category}`)}
                        </span>
                      </div>
                      {term.pronunciation && (
                        <p className="text-sm text-muted-foreground italic mb-2">
                          {term.pronunciation}
                        </p>
                      )}
                      <p className="text-foreground/80 text-sm">
                        {term.simpleDefinition}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">{t("noResults")}</p>
          </div>
        )}

        {/* Back to Top */}
        {letters.length > 0 && (
          <div className="mt-12 text-center">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              ↑ {t("backToTop")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
