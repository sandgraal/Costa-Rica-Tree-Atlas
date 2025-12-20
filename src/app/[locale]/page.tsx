import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";
import { TreeCard } from "@/components/TreeCard";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees for current locale
  const trees = allTrees.filter((tree) => tree.locale === locale);

  // Calculate stats
  const families = new Set(trees.map((t) => t.family)).size;
  const conservationTags = new Set(
    trees.filter((t) => t.conservationStatus).map((t) => t.conservationStatus)
  ).size;

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-dark via-primary to-secondary/80 pt-12 pb-20 px-4 md:pt-16 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,rgba(255,255,255,0.25),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_15%_20%,rgba(225,180,71,0.15),transparent_65%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_85%_25%,rgba(79,139,102,0.25),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[url('/images/leaf-pattern.svg')] opacity-15 mix-blend-soft-light"></div>
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(15,26,15,0.35),transparent)]"></div>
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-background"></div>
        <div className="absolute -left-10 top-14 h-28 w-28 rounded-full bg-accent/30 blur-3xl"></div>
        <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-white/20 blur-3xl"></div>
        <div className="absolute left-1/4 top-10 h-2 w-2 rounded-full bg-amber-200/80 shadow-[0_0_18px_rgba(255,226,141,0.8)] animate-pulse"></div>
        <div className="absolute right-1/3 top-20 h-1.5 w-1.5 rounded-full bg-amber-100/80 shadow-[0_0_14px_rgba(255,236,170,0.7)] animate-pulse [animation-delay:1.2s]"></div>
        <div className="absolute left-1/2 top-28 h-1 w-1 rounded-full bg-amber-100/70 shadow-[0_0_12px_rgba(255,236,170,0.65)] animate-pulse [animation-delay:2s]"></div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 px-6 py-8 md:px-10 md:py-10 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <HeroContent />
          </div>
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
          <NowBloomingSection trees={trees} locale={locale} />
        </div>
      </section>

      {/* Tree of the Day */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <TreeOfTheDay trees={trees} locale={locale} />
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

function NowBloomingSection({
  trees,
  locale,
}: {
  trees: typeof allTrees;
  locale: string;
}) {
  const t = useTranslations("home");
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });

  // Filter trees that are flowering or fruiting this month
  const floweringNow = trees.filter((tree) =>
    tree.floweringSeason?.includes(currentMonth)
  );
  const fruitingNow = trees.filter((tree) =>
    tree.fruitingSeason?.includes(currentMonth)
  );

  const activeNow = [
    ...floweringNow.map((t) => ({ ...t, activity: "flowering" as const })),
    ...fruitingNow
      .filter((t) => !floweringNow.some((f) => f._id === t._id))
      .map((t) => ({ ...t, activity: "fruiting" as const })),
  ].slice(0, 8);

  if (activeNow.length === 0) return null;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light flex items-center gap-2">
            <span className="text-3xl">🌸</span>
            {t("nowBlooming")}
          </h2>
          <p className="text-muted-foreground mt-1">
            {locale === "es"
              ? `${floweringNow.length} floreciendo, ${fruitingNow.length} fructificando este mes`
              : `${floweringNow.length} flowering, ${fruitingNow.length} fruiting this month`}
          </p>
        </div>
        <Link
          href="/seasonal"
          className="text-primary hover:text-primary-light transition-colors font-medium"
        >
          {locale === "es" ? "Ver calendario" : "View calendar"} →
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
        {activeNow.map((tree) => (
          <Link
            key={tree._id}
            href={`/trees/${tree.slug}`}
            className="flex-none w-48 bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg snap-start"
          >
            <div className="relative h-32 bg-gradient-to-br from-primary/20 to-secondary/20">
              {tree.featuredImage && (
                <img
                  src={tree.featuredImage}
                  alt={tree.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div
                className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  tree.activity === "flowering"
                    ? "bg-pink-500 text-white"
                    : "bg-orange-500 text-white"
                }`}
              >
                {tree.activity === "flowering"
                  ? locale === "es"
                    ? "🌸 Floreciendo"
                    : "🌸 Flowering"
                  : locale === "es"
                    ? "🍊 Fructificando"
                    : "🍊 Fruiting"}
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-foreground truncate">
                {tree.title}
              </h3>
              <p className="text-xs text-muted-foreground italic truncate">
                {tree.scientificName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function TreeOfTheDay({
  trees,
  locale,
}: {
  trees: typeof allTrees;
  locale: string;
}) {
  const t = useTranslations("home");

  // Get a deterministic tree based on day of year
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const treeIndex = dayOfYear % trees.length;
  const tree = trees[treeIndex];

  if (!tree) return null;

  // Get some interesting facts about the tree
  const facts = [];
  if (tree.maxHeight)
    facts.push({
      icon: "📏",
      text:
        locale === "es"
          ? `Altura: ${tree.maxHeight}`
          : `Height: ${tree.maxHeight}`,
    });
  if (tree.nativeRegion)
    facts.push({
      icon: "🌎",
      text:
        locale === "es"
          ? `Región: ${tree.nativeRegion}`
          : `Region: ${tree.nativeRegion}`,
    });
  if (tree.family)
    facts.push({
      icon: "🌿",
      text:
        locale === "es" ? `Familia: ${tree.family}` : `Family: ${tree.family}`,
    });
  if (tree.uses && tree.uses.length > 0)
    facts.push({
      icon: "🛠️",
      text: tree.uses[0],
    });

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-border overflow-hidden">
      <div className="md:flex">
        {/* Image */}
        <div className="md:w-2/5 relative">
          <div className="aspect-[4/3] md:aspect-auto md:h-full bg-gradient-to-br from-primary/20 to-secondary/20">
            {tree.featuredImage && (
              <img
                src={tree.featuredImage}
                alt={tree.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-accent text-primary-dark rounded-full text-sm font-semibold shadow-lg">
            🌟 {t("treeOfTheDay")}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light mb-2">
            {tree.title}
          </h2>
          <p className="text-lg text-secondary italic mb-4">
            {tree.scientificName}
          </p>
          <p className="text-muted-foreground mb-6 line-clamp-3">
            {tree.description}
          </p>

          {/* Quick Facts */}
          {facts.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {facts.slice(0, 3).map((fact, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-lg text-sm"
                >
                  <span>{fact.icon}</span>
                  <span className="text-muted-foreground">{fact.text}</span>
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/trees/${tree.slug}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-light font-semibold transition-colors"
          >
            {locale === "es" ? "Conocer más" : "Learn more"}
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
        </div>
      </div>
    </div>
  );
}

function StatsSection({
  speciesCount,
  familiesCount,
  statusCount,
  locale,
}: {
  speciesCount: number;
  familiesCount: number;
  statusCount: number;
  locale: string;
}) {
  const stats = [
    {
      value: speciesCount,
      label: locale === "es" ? "Especies Documentadas" : "Documented Species",
      icon: "🌳",
    },
    {
      value: familiesCount,
      label: locale === "es" ? "Familias Botánicas" : "Botanical Families",
      icon: "🌿",
    },
    {
      value: statusCount,
      label:
        locale === "es" ? "Estados de Conservación" : "Conservation Statuses",
      icon: "🛡️",
    },
    {
      value: 2,
      label: locale === "es" ? "Idiomas" : "Languages",
      icon: "🌐",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-xl p-6 border border-border text-center hover:border-primary/50 transition-colors"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className="text-3xl font-bold text-primary mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
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
