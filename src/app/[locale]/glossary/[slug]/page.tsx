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
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link
            href="/glossary"
            className="hover:text-primary transition-colors"
          >
            ← Back to Glossary
          </Link>
        </nav>

        {/* Term Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-dark dark:text-primary-light">
              {term.term}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {term.category}
              </span>
              <ShareLink title="Copy Link" />
            </div>
          </div>

          {term.pronunciation && (
            <p className="text-xl text-muted-foreground italic mb-4">
              {term.pronunciation}
            </p>
          )}

          {/* Simple Definition */}
          <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-5">
            <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
              Simple Definition
            </h2>
            <p className="text-lg text-foreground">{term.simpleDefinition}</p>
          </div>

          {/* Technical Definition */}
          {term.technicalDefinition && (
            <div className="mt-4 bg-muted/50 rounded-lg p-5">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-2">
                Technical Definition
              </h2>
              <p className="text-foreground/90">{term.technicalDefinition}</p>
            </div>
          )}

          {/* Etymology */}
          {term.etymology && (
            <div className="mt-4 border-l-2 border-secondary/30 pl-4">
              <h3 className="text-sm font-semibold text-secondary-dark dark:text-secondary-light mb-1">
                📚 Etymology
              </h3>
              <p className="text-sm text-foreground/80">{term.etymology}</p>
            </div>
          )}
        </header>

        {/* Main Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <MDXContent components={mdxComponents} />
        </article>

        {/* Example Species */}
        {exampleSpecies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4">
              🌳 Example Species
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleSpecies.map((species) => (
                <Link
                  key={species._id}
                  href={`/trees/${species.slug}`}
                  className="block bg-card rounded-xl p-4 border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {species.title}
                  </h3>
                  <p className="text-sm italic text-muted-foreground mb-2">
                    {species.scientificName}
                  </p>
                  <p className="text-sm text-foreground/80">
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
            <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4">
              🔗 Related Terms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTerms.map((related) => (
                <Link
                  key={related._id}
                  href={`/glossary/${related.slug}`}
                  className="block bg-card rounded-xl p-4 border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {related.term}
                  </h3>
                  <p className="text-sm text-foreground/80">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            📖 Back to Full Glossary
          </Link>
        </div>
      </div>
    </div>
  );
}
