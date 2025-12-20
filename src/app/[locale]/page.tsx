import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";
import { TreeCard } from "@/components/TreeCard";
import { RandomTree } from "@/components/RandomTree";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees for current locale
  const trees = allTrees.filter((tree) => tree.locale === locale);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-secondary py-24 px-4">
        <div className="absolute inset-0 bg-[url('/images/leaf-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <HeroContent />
        </div>
      </section>

      {/* Random Tree Discovery Section */}
      <section className="py-12 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <RandomTreeSection trees={trees} />
        </div>
      </section>

      {/* Featured Trees Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <FeaturedTreesSection trees={trees} />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <AboutSection />
        </div>
      </section>
    </div>
  );
}

function HeroContent() {
  const t = useTranslations("home");

  return (
    <>
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
        {t("title")}
      </h1>
      <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
        {t("description")}
      </p>
      <Link
        href="/trees"
        className="inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-primary-dark font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        {t("exploreButton")}
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
    </>
  );
}

function FeaturedTreesSection({ trees }: { trees: typeof allTrees }) {
  const t = useTranslations("home");

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light">
          {t("featuredTrees")}
        </h2>
        <Link
          href="/trees"
          className="text-primary hover:text-primary-light transition-colors font-medium"
        >
          {t("viewAll")} →
        </Link>
      </div>

      {trees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.slice(0, 6).map((tree) => (
            <TreeCard key={tree._id} tree={tree} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          No trees found. Add some content to get started!
        </p>
      )}
    </>
  );
}

function AboutSection() {
  const t = useTranslations("footer");

  return (
    <>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 22V8M5 12l7-10 7 10M5 12a7 7 0 0 0 14 0" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4">
        Open Source Project
      </h2>
      <p className="text-muted-foreground text-lg">{t("description")}</p>
    </>
  );
}

function RandomTreeSection({ trees }: { trees: typeof allTrees }) {
  const t = useTranslations("home");

  return (
    <RandomTree
      trees={trees}
      translations={{
        discover: t("randomTree.discover"),
        newTree: t("randomTree.newTree"),
        learnMore: t("randomTree.learnMore"),
      }}
    />
  );
}
