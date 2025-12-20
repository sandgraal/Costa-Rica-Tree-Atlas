import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { TreeComparison } from "@/components/TreeComparison";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "comparison" });
  const siteT = await getTranslations({ locale });

  return {
    title: `${t("title")} | ${siteT("siteTitle")}`,
    description: t("subtitle"),
  };
}

export default async function ComparePage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get all trees for the current locale
  const trees = allTrees
    .filter((tree) => tree.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title));

  return <ComparePageClient locale={locale} trees={trees} />;
}

function ComparePageClient({
  locale,
  trees,
}: {
  locale: string;
  trees: (typeof allTrees)[number][];
}) {
  const t = useTranslations("comparison");

  const translations = {
    title: t("title"),
    selectTree: t("selectTree"),
    selectPlaceholder: t("selectPlaceholder"),
    addTree: t("addTree"),
    removeTree: t("removeTree"),
    noTreesSelected: t("noTreesSelected"),
    properties: {
      image: t("properties.image"),
      commonName: t("properties.commonName"),
      scientificName: t("properties.scientificName"),
      family: t("properties.family"),
      maxHeight: t("properties.maxHeight"),
      nativeRegion: t("properties.nativeRegion"),
      conservationStatus: t("properties.conservationStatus"),
      uses: t("properties.uses"),
      tags: t("properties.tags"),
    },
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-2">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      <TreeComparison
        trees={trees}
        locale={locale}
        translations={translations}
      />
    </main>
  );
}
