import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SeasonalCalendar } from "@/components/SeasonalCalendar";
import { allTrees } from "contentlayer/generated";

interface SeasonalPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: SeasonalPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seasonal" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/seasonal`,
      languages: {
        en: "/en/seasonal",
        es: "/es/seasonal",
      },
    },
  };
}

export default async function SeasonalPage({ params }: SeasonalPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "seasonal" });

  // Get trees for this locale with seasonal data
  const trees = allTrees
    .filter((tree) => tree.locale === locale)
    .map((tree) => ({
      title: tree.title,
      slug: tree.slug,
      scientificName: tree.scientificName,
      featuredImage: tree.featuredImage,
      floweringSeason: tree.floweringSeason,
      fruitingSeason: tree.fruitingSeason,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("pageTitle")}
        </h1>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>

      <SeasonalCalendar trees={trees} locale={locale} />

      {/* Costa Rica Climate Info */}
      <section className="mt-12 bg-muted rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">{t("climateTitle")}</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p>{t("climateDescription")}</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4 not-prose">
            <div className="bg-background rounded-lg p-4">
              <h3 className="font-medium text-primary mb-2">
                {t("drySeason")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("drySeasonMonths")}
              </p>
              <p className="text-xs mt-2">{t("drySeasonNote")}</p>
            </div>
            <div className="bg-background rounded-lg p-4">
              <h3 className="font-medium text-primary mb-2">
                {t("wetSeason")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("wetSeasonMonths")}
              </p>
              <p className="text-xs mt-2">{t("wetSeasonNote")}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
