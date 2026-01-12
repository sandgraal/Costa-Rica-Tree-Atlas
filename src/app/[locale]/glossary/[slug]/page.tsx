import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { allGlossaryTerms, allTrees } from "contentlayer/generated";
import { getMDXComponent } from "next-contentlayer2/hooks";
import { mdxComponents } from "@/components/mdx";
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

  const MDXContent = getMDXComponent(term.body.code);

  // Get related terms
  const relatedTerms = term.relatedTerms
    ? allGlossaryTerms.filter(
        (t) => term.relatedTerms!.includes(t.slug) && t.locale === locale
      )
    : [];

  // Get example species
  const exampleSpecies = term.exampleSpecies
    ? allTrees.filter(
        (t) => term.exampleSpecies!.includes(t.slug) && t.locale === locale
      )
    : [];

  return (
    <div className="min-h-screen py-8 bg-background">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <span>←</span> Back to Glossary
          </Link>
        </nav>

        {/* Term Header */}
        <header className="mb-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-dark dark:text-primary-light">
              {term.term}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                {term.category}
              </span>
              <ShareLink title="Copy Link" />
            </div>
          </div>

          {term.pronunciation && (
            <p className="text-xl md:text-2xl text-muted-foreground italic mb-6">
              {term.pronunciation}
            </p>
          )}

          {/* Simple Definition */}
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
              Simple Definition
            </h2>
            <p className="text-lg md:text-xl text-foreground leading-relaxed">
              {term.simpleDefinition}
            </p>
          </div>

          {/* Technical Definition */}
          {term.technicalDefinition && (
            <div className="mt-5 bg-muted/40 border border-border rounded-lg p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                Technical Definition
              </h2>
              <p className="text-foreground/90 leading-relaxed">
                {term.technicalDefinition}
              </p>
            </div>
          )}

          {/* Etymology */}
          {term.etymology && (
            <div className="mt-5 border-l-4 border-secondary/30 bg-secondary/5 rounded-r-lg pl-5 pr-5 py-4">
              <h3 className="text-sm font-semibold text-secondary-dark dark:text-secondary-light mb-2 flex items-center gap-2">
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
          className="prose prose-lg dark:prose-invert max-w-none mb-12 
          prose-headings:text-primary-dark dark:prose-headings:text-primary-light 
          prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl
          prose-p:leading-relaxed prose-li:leading-relaxed"
        >
          <MDXContent components={mdxComponents} />
        </article>

        {/* Example Species */}
        {exampleSpecies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-6 flex items-center gap-3">
              <span className="text-4xl">🌳</span> Example Species
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {exampleSpecies.map((species) => (
                <Link
                  key={species._id}
                  href={`/trees/${species.slug}`}
                  className="group block bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {species.title}
                  </h3>
                  <p className="text-sm italic text-muted-foreground mb-3">
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
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-6 flex items-center gap-3">
              <span className="text-4xl">🔗</span> Related Terms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {relatedTerms.map((related) => (
                <Link
                  key={related._id}
                  href={`/glossary/${related.slug}`}
                  className="group block bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
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
        <div className="text-center pt-12 border-t border-border">
          <Link
            href="/glossary"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all hover:shadow-lg hover:-translate-y-0.5 font-medium text-lg"
          >
            <span className="text-2xl">📖</span> Back to Full Glossary
          </Link>
        </div>
      </div>
    </div>
  );
}
