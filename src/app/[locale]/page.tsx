import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";
import { HeroImage } from "@/components/HeroImage";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import dynamic from "next/dynamic";
import { memo } from "react";
import { preload } from "react-dom";
import type { Locale } from "@/types/tree";
import {
  NowBloomingSkeleton,
  TreeOfTheDaySkeleton,
  StatsSkeleton,
  FeaturedTreesSkeleton,
  RecentlyViewedSkeleton,
  AboutSkeleton,
} from "@/components/LoadingSkeletons";

// Lazy load below-the-fold components to improve LCP and reduce TBT
const RecentlyViewedList = dynamic(
  () =>
    import("@/components/RecentlyViewedList").then((mod) => ({
      default: mod.RecentlyViewedList,
    })),
  { loading: () => <RecentlyViewedSkeleton /> }
);
const FeaturedTreesSection = dynamic(
  () =>
    import("@/components/FeaturedTreesSection").then((mod) => ({
      default: mod.FeaturedTreesSection,
    })),
  { loading: () => <FeaturedTreesSkeleton /> }
);

// Lazy load heavy homepage sections with loading states
const NowBloomingSection = dynamic(
  () =>
    import("@/components/home/NowBloomingSection").then((mod) => ({
      default: mod.NowBloomingSection,
    })),
  { loading: () => <NowBloomingSkeleton /> }
);

const TreeOfTheDay = dynamic(
  () =>
    import("@/components/home/TreeOfTheDay").then((mod) => ({
      default: mod.TreeOfTheDay,
    })),
  { loading: () => <TreeOfTheDaySkeleton /> }
);

const StatsSection = dynamic(
  () =>
    import("@/components/home/StatsSection").then((mod) => ({
      default: mod.StatsSection,
    })),
  { loading: () => <StatsSkeleton /> }
);

const AboutSection = dynamic(
  () =>
    import("@/components/home/AboutSection").then((mod) => ({
      default: mod.AboutSection,
    })),
  { loading: () => <AboutSkeleton /> }
);

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Preload hero image only on homepage (not all routes via layout)
  preload("/images/hero/guanacaste-desktop.webp", {
    as: "image",
    fetchPriority: "high",
    imageSrcSet:
      "/images/hero/guanacaste-mobile.webp 640w, /images/hero/guanacaste-mobile-lg.webp 828w, /images/hero/guanacaste-tablet.webp 1200w, /images/hero/guanacaste-desktop.webp 1920w",
    imageSizes: "100vw",
  });

  // Get translations for the page
  const t = await getTranslations({ locale, namespace: "home" });
  const footerT = await getTranslations({ locale, namespace: "footer" });

  // Get trees for current locale
  const trees = allTrees.filter((tree) => tree.locale === locale);

  // Calculate stats
  const families = new Set(trees.map((t) => t.family)).size;
  const conservationTags = new Set(
    trees.filter((t) => t.conservationStatus).map((t) => t.conservationStatus)
  ).size;

  // Structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Costa Rica Tree Atlas",
    alternateName: "Atlas de Árboles de Costa Rica",
    url: "https://costaricatreeatlas.com",
    description:
      locale === "es"
        ? "Descubre los magníficos árboles de Costa Rica. Una guía bilingüe de código abierto de la flora arbórea costarricense."
        : "Discover the magnificent trees of Costa Rica. An open-source bilingual guide to Costa Rican tree flora.",
    inLanguage: [locale === "es" ? "es-CR" : "en-US"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://costaricatreeatlas.com/${locale}/trees?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Costa Rica Tree Atlas",
      url: "https://costaricatreeatlas.com",
      logo: {
        "@type": "ImageObject",
        url: "https://costaricatreeatlas.com/images/cr-tree-atlas-logo.png",
      },
    },
  };

  // Organization structured data
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Costa Rica Tree Atlas",
    url: "https://costaricatreeatlas.com",
    logo: "https://costaricatreeatlas.com/images/cr-tree-atlas-logo.png",
    description:
      locale === "es"
        ? "Un proyecto de código abierto dedicado a documentar los árboles de Costa Rica."
        : "An open-source project dedicated to documenting Costa Rica's trees.",
    sameAs: ["https://github.com/sandgraal/Costa-Rica-Tree-Atlas"],
    knowsAbout: [
      "Costa Rica trees",
      "Tropical botany",
      "Conservation",
      "Biodiversity",
    ],
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <SafeJsonLd data={organizationData} />
      <div className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 px-4 md:pt-20 md:pb-28 min-h-[600px] md:min-h-[700px] flex items-center">
          {/* Hero Background Image - Guanacaste Tree */}
          <HeroImage priority fetchPriority="high" />

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
          {/* Additional overlay for better contrast */}
          <div className="absolute inset-0 bg-primary-dark/30"></div>

          {/* Gradient fade to page content */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background"></div>

          <div className="container mx-auto max-w-5xl relative z-10 text-center">
            <HeroContent
              title={t("title")}
              description={t("description")}
              exploreButton={t("exploreButton")}
              adminButton={t("adminButton")}
            />
          </div>
        </section>

        {/* Stats Banner */}
        <section className="py-12 px-4 bg-background">
          <div className="container mx-auto max-w-4xl">
            <StatsSection
              speciesCount={trees.length}
              familiesCount={families}
              statusCount={conservationTags}
              locale={locale}
            />
          </div>
        </section>

        {/* What's Blooming Now */}
        <section className="py-12 px-4 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20">
          <div className="container mx-auto max-w-6xl">
            <NowBloomingSection
              trees={trees}
              locale={locale}
              nowBlooming={t("nowBlooming")}
            />
          </div>
        </section>

        {/* Tree of the Day */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <TreeOfTheDay
              trees={trees}
              locale={locale}
              treeOfTheDay={t("treeOfTheDay")}
            />
          </div>
        </section>

        {/* Recently Viewed (client-side, only shows if user has history) */}
        <section className="px-4">
          <div className="container mx-auto max-w-6xl">
            <RecentlyViewedList locale={locale} />
          </div>
        </section>

        {/* Featured Trees Section */}
        <section className="py-16 px-4 bg-muted">
          <div className="container mx-auto max-w-6xl">
            <FeaturedTreesSection
              trees={trees}
              locale={locale as Locale}
              featuredTrees={t("featuredTrees")}
              viewAll={t("viewAll")}
            />
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <AboutSection
              openSource={footerT("openSource")}
              description={footerT("description")}
            />
          </div>
        </section>
      </div>
    </>
  );
}

const HeroContent = memo(function HeroContent({
  title,
  description,
  exploreButton,
  adminButton,
}: {
  title: string;
  description: string;
  exploreButton: string;
  adminButton: string;
}) {
  return (
    <>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        {description}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/trees"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-primary-dark font-semibold py-3.5 px-8 rounded-lg transition-all duration-200 shadow-2xl hover:shadow-xl hover:scale-[1.02]"
        >
          {exploreButton}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 border border-white/70 bg-white/10 text-white font-semibold py-3.5 px-6 rounded-lg transition-all duration-200 hover:bg-white/20"
        >
          {adminButton}
        </Link>
      </div>
    </>
  );
});
