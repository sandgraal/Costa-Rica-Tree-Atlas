import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { allGlossaryTerms, allTrees } from "contentlayer/generated";
import { ServerMDXContent } from "@/components/ServerMDXContent";
import { ShareLink } from "@/components/ShareLink";
import type { Locale } from "@/types";
import { Link } from "@i18n/navigation";

interface GlossaryTermPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams() {
  const params = allGlossaryTerms.map((term) => ({
    locale: term.locale,
    slug: term.slug,
  }));

  return params;
}

export async function generateMetadata({
  params,
}: GlossaryTermPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const term = allGlossaryTerms.find(
    (t) => t.slug === slug && t.locale === locale
  );

  if (!term) {
    return {
      title: "Term Not Found",
    };
  }

  return {
    title: `${term.term} - Glossary`,
    description: term.simpleDefinition,
  };
}

export default async function GlossaryTermPage({
  params,
}: GlossaryTermPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const term = allGlossaryTerms.find(
    (t) => t.slug === slug && t.locale === locale
  );

  if (!term) {
    notFound();
  }

  // Get related terms
  const relatedTerms = term.relatedTerms
    ? allGlossaryTerms.filter(
        (t) => term.relatedTerms?.includes(t.slug) && t.locale === locale
      )
    : [];

  // Get example species
  const exampleSpecies = term.exampleSpecies
    ? allTrees.filter(
        (t) => term.exampleSpecies?.includes(t.slug) && t.locale === locale
      )
    : [];

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <span>←</span> Back to Glossary
          </Link>
        </nav>

        {/* Term Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light">
              {term.term}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                {term.category}
              </span>
              <ShareLink title="Copy Link" />
            </div>
          </div>

          {term.pronunciation && (
            <p className="text-base text-muted-foreground italic mb-4">
              {term.pronunciation}
            </p>
          )}

          {/* Simple Definition */}
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4 shadow-sm">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
              Simple Definition
            </h2>
            <p className="text-base text-foreground leading-relaxed">
              {term.simpleDefinition}
            </p>
          </div>

          {/* Technical Definition */}
          {term.technicalDefinition && (
            <div className="mt-4 bg-muted/40 border border-border rounded-lg p-4 shadow-sm">
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                Technical Definition
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {term.technicalDefinition}
              </p>
            </div>
          )}

          {/* Etymology */}
          {term.etymology && (
            <div className="mt-4 border-l-4 border-secondary/30 bg-secondary/5 rounded-r-lg pl-4 pr-4 py-3">
              <h3 className="text-xs font-semibold text-secondary-dark dark:text-secondary-light mb-1.5 flex items-center gap-1.5">
                <span>📚</span> Etymology
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {term.etymology}
              </p>
            </div>
          )}
        </header>

        {/* Main Content */}
        <article
          className="prose prose-base dark:prose-invert max-w-none mb-10 
          prose-headings:text-primary-dark dark:prose-headings:text-primary-light 
          prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl
          prose-p:leading-relaxed prose-li:leading-relaxed"
        >
          <ServerMDXContent source={term.body.raw} />
        </article>

        {/* Example Species */}
        {exampleSpecies.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-2">
              <span className="text-2xl">🌳</span> Example Species
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleSpecies.map((species) => (
                <Link
                  key={species._id}
                  href={`/trees/${species.slug}`}
                  className="group block bg-card rounded-lg p-4 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                >
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-1.5">
                    {species.title}
                  </h3>
                  <p className="text-sm italic text-muted-foreground mb-2">
                    {species.scientificName}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {species.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Terms */}
        {relatedTerms.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-2">
              <span className="text-2xl">🔗</span> Related Terms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTerms.map((related) => (
                <Link
                  key={related._id}
                  href={`/glossary/${related.slug}`}
                  className="group block bg-card rounded-lg p-4 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                >
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {related.term}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {related.simpleDefinition}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to Glossary */}
        <div className="text-center pt-8 border-t border-border">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all hover:shadow-md font-medium text-sm"
          >
            <span className="text-lg">📖</span> Back to Full Glossary
          </Link>
        </div>
      </div>
    </div>
  );
}
