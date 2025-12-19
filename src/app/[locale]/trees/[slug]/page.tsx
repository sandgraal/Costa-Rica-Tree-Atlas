import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { useMDXComponent } from "next-contentlayer2/hooks";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  allTrees.forEach((tree) => {
    params.push({
      locale: tree.locale,
      slug: tree.slug,
    });
  });

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tree = allTrees.find((t) => t.locale === locale && t.slug === slug);

  if (!tree) {
    return {
      title: "Tree Not Found",
    };
  }

  const otherLocale = locale === "en" ? "es" : "en";
  const altTree = allTrees.find(
    (t) => t.locale === otherLocale && t.slug === slug
  );

  return {
    title: tree.title,
    description: tree.description,
    keywords: [
      tree.title,
      tree.scientificName,
      tree.family,
      "Costa Rica",
      "tree",
    ],
    openGraph: {
      title: tree.title,
      description: tree.description,
      type: "article",
      locale: locale === "es" ? "es_CR" : "en_US",
    },
    alternates: {
      languages: {
        en: `/en/trees/${slug}`,
        es: `/es/trees/${slug}`,
        ...(altTree && {
          [otherLocale]: `/${otherLocale}/trees/${slug}`,
        }),
      },
    },
  };
}

export default async function TreePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tree = allTrees.find((t) => t.locale === locale && t.slug === slug);

  if (!tree) {
    notFound();
  }

  // Find alternate language version
  const otherLocale = locale === "en" ? "es" : "en";
  const altTree = allTrees.find(
    (t) => t.locale === otherLocale && t.slug === slug
  );

  return (
    <article className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/trees"
            className="text-primary hover:text-primary-light transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {locale === "es" ? "Volver al Directorio" : "Back to Directory"}
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {tree.family}
            </span>
            {tree.conservationStatus && (
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                {tree.conservationStatus}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-primary-dark dark:text-primary-light mb-2">
            {tree.title}
          </h1>
          <p className="text-2xl text-secondary italic mb-6">
            {tree.scientificName}
          </p>

          {/* Alternate Language Link */}
          {altTree && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GlobeIcon className="h-4 w-4" />
              <span>
                {locale === "es"
                  ? "Also available in"
                  : "También disponible en"}
                :
              </span>
              <Link
                href={`/trees/${slug}`}
                locale={otherLocale}
                className="text-primary hover:underline"
              >
                {locale === "es" ? "English" : "Español"}
              </Link>
            </div>
          )}
        </header>

        {/* Featured Image Placeholder */}
        {tree.featuredImage ? (
          <div className="aspect-video rounded-xl overflow-hidden mb-12 bg-muted">
            <img
              src={tree.featuredImage}
              alt={tree.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video rounded-xl overflow-hidden mb-12 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <TreeIcon className="h-24 w-24 text-primary/20" />
          </div>
        )}

        {/* Quick Facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {tree.nativeRegion && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">
                {locale === "es" ? "Región Nativa" : "Native Region"}
              </p>
              <p className="font-medium">{tree.nativeRegion}</p>
            </div>
          )}
          {tree.maxHeight && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">
                {locale === "es" ? "Altura Máxima" : "Max Height"}
              </p>
              <p className="font-medium">{tree.maxHeight}</p>
            </div>
          )}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">
              {locale === "es" ? "Familia" : "Family"}
            </p>
            <p className="font-medium">{tree.family}</p>
          </div>
          {tree.conservationStatus && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">
                {locale === "es" ? "Conservación" : "Conservation"}
              </p>
              <p className="font-medium">{tree.conservationStatus}</p>
            </div>
          )}
        </div>

        {/* Uses */}
        {tree.uses && tree.uses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-primary-dark dark:text-primary-light">
              {locale === "es" ? "Usos" : "Uses"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {tree.uses.map((use, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-accent/10 text-accent-dark dark:text-accent rounded-full text-sm"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* MDX Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-primary-dark dark:prose-headings:text-primary-light prose-a:text-primary hover:prose-a:text-primary-light">
          <MDXContent code={tree.body.code} />
        </div>
      </div>
    </article>
  );
}

function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  return <Component />;
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22V8" />
      <path d="M5 12l7-10 7 10" />
      <path d="M5 12a7 7 0 0 0 14 0" />
    </svg>
  );
}
