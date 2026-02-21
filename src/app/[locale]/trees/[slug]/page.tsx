import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  allTrees,
  allGlossaryTerms,
  allSpeciesComparisons,
} from "contentlayer/generated";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ServerMDXContent } from "@/components/ServerMDXContent";
import { PrintButton } from "@/components/PrintButton";
import { ShareButton } from "@/components/ShareButton";
import { SeasonalInfo } from "@/components/SeasonalInfo";
import { PronunciationButton } from "@/components/PronunciationButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { TrackView } from "@/components/TrackView";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { SafeImage } from "@/components/SafeImage";
import { ImageErrorBoundary } from "@/components/ImageErrorBoundary";
import { SafetyCard } from "@/components/safety";
import { SafetyDisclaimer } from "@/components/safety/SafetyDisclaimer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TableOfContents } from "@/components/TableOfContents";
import { resolveImageSource } from "@/lib/image/image-resolver";
import { validateJsonLd, sanitizeJsonLd } from "@/lib/validation/json-ld";
import type { Locale } from "@/types/tree";

// Dynamic imports for heavy below-fold components
// DistributionMap renders static SVG from props, so SSR is beneficial for SEO
const DistributionMap = dynamic(
  () => import("@/components/geo").then((mod) => mod.DistributionMap),
  {
    loading: () => (
      <div className="bg-muted rounded-xl p-6 mb-8 animate-pulse h-64" />
    ),
  }
);

// BiodiversityInfo fetches data client-side with proper loading states
// SSR renders the loading skeleton, then client-side hydration fetches the data
// This avoids hydration mismatches and provides a good user experience
const BiodiversityInfo = dynamic(
  () => import("@/components/data").then((mod) => mod.BiodiversityInfo),
  {
    loading: () => (
      <div className="bg-muted rounded-xl p-6 mb-8 animate-pulse h-48" />
    ),
  }
);

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

  // Resolve image at build time
  const imageSource = resolveImageSource(slug, tree.featuredImage);

  // Find alternate language version
  const otherLocale = locale === "en" ? "es" : "en";
  const altTree = allTrees.find(
    (t) => t.locale === otherLocale && t.slug === slug
  );

  // Generate structured data (JSON-LD) for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: tree.title,
    headline: tree.title,
    description: tree.description,
    about: {
      "@type": "Thing",
      name: tree.scientificName,
      description: `${tree.title} (${tree.scientificName}) - ${tree.family}`,
    },
    author: {
      "@type": "Organization",
      name: "Costa Rica Tree Atlas",
      url: "https://costaricatreeatlas.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Costa Rica Tree Atlas",
    },
    inLanguage: locale === "es" ? "es-CR" : "en-US",
    ...(tree.featuredImage && { image: tree.featuredImage }),
    ...(tree.publishedAt && { datePublished: tree.publishedAt }),
    ...(tree.updatedAt && { dateModified: tree.updatedAt }),
    keywords: [
      tree.title,
      tree.scientificName,
      tree.family,
      "Costa Rica",
      "tree",
      "botany",
      ...(tree.tags || []),
    ].join(", "),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://costaricatreeatlas.com/${locale}/trees/${slug}`,
    },
  };

  // Breadcrumb structured data for navigation
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "es" ? "Inicio" : "Home",
        item: `https://costaricatreeatlas.com/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "es" ? "Árboles" : "Trees",
        item: `https://costaricatreeatlas.com/${locale}/trees`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tree.title,
        item: `https://costaricatreeatlas.com/${locale}/trees/${slug}`,
      },
    ],
  };

  // Validate structured data before rendering
  let validatedStructuredData: typeof structuredData = structuredData;
  let validatedBreadcrumbData: typeof breadcrumbData = breadcrumbData;

  const structuredDataValidation = validateJsonLd(structuredData);
  const breadcrumbDataValidation = validateJsonLd(breadcrumbData);

  // If validation fails, attempt to sanitize
  if (!structuredDataValidation.valid) {
    console.error(
      "Invalid structured data JSON-LD:",
      structuredDataValidation.error,
      structuredDataValidation.issues
    );
    validatedStructuredData = sanitizeJsonLd(
      structuredData
    ) as typeof structuredData;
    console.log("Sanitized structured data applied");
  }
  if (!breadcrumbDataValidation.valid) {
    console.error(
      "Invalid breadcrumb data JSON-LD:",
      breadcrumbDataValidation.error,
      breadcrumbDataValidation.issues
    );
    validatedBreadcrumbData = sanitizeJsonLd(
      breadcrumbData
    ) as typeof breadcrumbData;
    console.log("Sanitized breadcrumb data applied");
  }

  return (
    <>
      <TrackView slug={tree.slug} />
      <SafeJsonLd data={validatedStructuredData} />
      <SafeJsonLd data={validatedBreadcrumbData} />
      <article className="py-12 px-4 tree-detail">
        <div className="container mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <Breadcrumbs
            locale={locale as Locale}
            pathname={`/trees/${tree.slug}`}
            customLabels={{ [tree.slug]: tree.title }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
            {/* Main Content */}
            <div className="min-w-0">
              {/* Actions Bar */}
              <div className="mb-8 flex justify-end items-center gap-2 no-print">
                <FavoriteButton
                  slug={tree.slug}
                  title={tree.title}
                  locale={locale}
                  showLabel
                />
                <ShareButton
                  title={tree.title}
                  scientificName={tree.scientificName}
                  slug={tree.slug}
                />
                <PrintButton label={locale === "es" ? "Imprimir" : "Print"} />
              </div>

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
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <p className="text-2xl text-secondary italic">
                    {tree.scientificName}
                  </p>
                  <PronunciationButton
                    text={tree.scientificName}
                    label={locale === "es" ? "Pronunciar" : "Pronounce"}
                    locale={locale}
                  />
                </div>

                {/* Reading Time */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5">
                    <ClockIcon className="h-4 w-4" />
                    {(() => {
                      // Estimate reading time from raw MDX content
                      const wordCount = tree.body.raw.split(/\s+/).length;
                      const readingTime = Math.max(
                        1,
                        Math.ceil(wordCount / 200)
                      );
                      return locale === "es"
                        ? `${readingTime} min de lectura`
                        : `${readingTime} min read`;
                    })()}
                  </span>
                </div>

                {/* Alternate Language Link */}
                {altTree && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GlobeIcon className="h-4 w-4" />
                    <span>
                      {locale === "es"
                        ? "También disponible en"
                        : "Also available in"}
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

              {/* Featured Image */}
              {tree.featuredImage ? (
                <ImageErrorBoundary>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-12 bg-muted relative">
                    <SafeImage
                      src={imageSource.src}
                      alt={tree.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 896px"
                      priority
                      quality={80}
                      fallback="placeholder"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </ImageErrorBoundary>
              ) : (
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-12 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
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

              {/* Distribution Map */}
              <DistributionMap
                distribution={tree.distribution}
                elevation={tree.elevation}
                locale={locale as "en" | "es"}
              />

              {/* Seasonal Information */}
              <SeasonalInfo
                floweringSeason={tree.floweringSeason}
                fruitingSeason={tree.fruitingSeason}
                locale={locale}
              />

              {/* Safety Information */}
              <SafetyCard tree={tree} className="mb-12" />

              {/* Biodiversity Data from GBIF and iNaturalist */}
              <BiodiversityInfo
                scientificName={tree.scientificName}
                locale={locale as "en" | "es"}
              />

              {/* MDX Content */}
              <div className="tree-content max-w-none">
                <ServerMDXContent
                  source={tree.body.raw}
                  glossaryTerms={allGlossaryTerms.map((t) => ({
                    term: t.term,
                    slug: t.slug,
                    locale: t.locale,
                    simpleDefinition: t.simpleDefinition,
                  }))}
                  enableGlossaryLinks={true}
                />
              </div>

              {/* Safety Disclaimer */}
              <SafetyDisclaimer />

              {/* Comparison Links */}
              <ComparisonLinks currentTree={tree} locale={locale} />

              {/* Related Trees */}
              <RelatedTrees currentTree={tree} locale={locale} />
            </div>

            {/* Sidebar with Table of Contents - Hidden on mobile */}
            <aside className="hidden lg:block">
              <TableOfContents locale={locale} />
            </aside>
          </div>
        </div>
      </article>
    </>
  );
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

function ClockIcon({ className }: { className?: string }) {
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
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function RelatedTrees({
  currentTree,
  locale,
}: {
  currentTree: (typeof allTrees)[0];
  locale: string;
}) {
  // Find related trees from same family or with similar tags
  const localeTrees = allTrees.filter(
    (t) => t.locale === locale && t.slug !== currentTree.slug
  );

  // Score trees by relatedness
  const scoredTrees = localeTrees.map((tree) => {
    let score = 0;

    // Same family = high score
    if (tree.family === currentTree.family) score += 5;

    // Overlapping tags
    const currentTags = currentTree.tags || [];
    const treeTags = tree.tags || [];
    const sharedTags = currentTags.filter((tag) => treeTags.includes(tag));
    score += sharedTags.length * 2;

    // Similar conservation status
    if (
      tree.conservationStatus &&
      tree.conservationStatus === currentTree.conservationStatus
    ) {
      score += 1;
    }

    // Overlapping seasons
    const currentFlowering = currentTree.floweringSeason || [];
    const treeFlowering = tree.floweringSeason || [];
    const sharedFlowering = currentFlowering.filter((m) =>
      treeFlowering.includes(m)
    );
    if (sharedFlowering.length > 0) score += 1;

    return { tree, score };
  });

  // Get top 4 related trees with score > 0
  const relatedTrees = scoredTrees
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((t) => t.tree);

  if (relatedTrees.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border no-print">
      <h2 className="text-xl font-semibold mb-6 text-primary-dark dark:text-primary-light">
        {locale === "es" ? "Árboles Relacionados" : "Related Trees"}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedTrees.map((tree) => {
          const relatedImageSource = resolveImageSource(
            tree.slug,
            tree.featuredImage
          );
          return (
            <Link
              key={tree._id}
              href={`/trees/${tree.slug}`}
              className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <ImageErrorBoundary>
                <div className="relative h-24 bg-gradient-to-br from-primary/20 to-secondary/20">
                  {tree.featuredImage && (
                    <SafeImage
                      src={relatedImageSource.src}
                      alt={tree.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      quality={75}
                      fallback="hide"
                    />
                  )}
                  {tree.family === currentTree.family && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-primary/80 text-white text-xs rounded">
                      {locale === "es" ? "Misma familia" : "Same family"}
                    </div>
                  )}
                </div>
              </ImageErrorBoundary>
              <div className="p-3">
                <h3 className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                  {tree.title}
                </h3>
                <p className="text-xs text-muted-foreground italic truncate">
                  {tree.scientificName}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ComparisonLinks({
  currentTree,
  locale,
}: {
  currentTree: (typeof allTrees)[0];
  locale: string;
}) {
  // Find comparisons that include this tree
  const relevantComparisons = allSpeciesComparisons.filter(
    (comp) => comp.locale === locale && comp.species.includes(currentTree.slug)
  );

  if (relevantComparisons.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-border no-print">
      <h2 className="text-xl font-semibold mb-6 text-primary-dark dark:text-primary-light">
        {locale === "es" ? "Guías de Comparación" : "Comparison Guides"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relevantComparisons.map((comparison) => {
          // Get the other species in the comparison
          const otherSpeciesSlugs = comparison.species.filter(
            (slug) => slug !== currentTree.slug
          );
          const otherSpecies = otherSpeciesSlugs
            .map((slug) =>
              allTrees.find((t) => t.slug === slug && t.locale === locale)
            )
            .filter((tree): tree is (typeof allTrees)[number] => Boolean(tree));

          // Skip rendering if no other species found
          if (otherSpecies.length === 0) return null;

          return (
            <Link
              key={comparison._id}
              href={`/compare/${comparison.slug}`}
              className="group bg-card rounded-lg border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-primary"
                  >
                    <path d="M18 21a8 8 0 0 0-16 0" />
                    <circle cx="10" cy="8" r="5" />
                    <path d="M22 21a8 8 0 0 0-16 0" />
                    <circle cx="18" cy="8" r="5" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1 text-sm">
                    {locale === "es" ? "Comparar con" : "Compare with"}{" "}
                    {otherSpecies.map((t) => t.title).join(", ")}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {comparison.keyDifference}
                  </p>
                  <div className="mt-2 text-xs text-primary font-medium flex items-center gap-1">
                    {locale === "es" ? "Leer guía" : "Read guide"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
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
    </div>
  );
}
