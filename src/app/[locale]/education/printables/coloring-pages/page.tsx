import { getTranslations, setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { ColoringPagesClient } from "./ColoringPagesClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coloringPages" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/education/printables/coloring-pages",
        es: "/es/education/printables/coloring-pages",
      },
    },
  };
}

export default async function ColoringPagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("coloringPages");

  // Get trees with featured images for coloring pages
  const trees = allTrees
    .filter((tr) => tr.locale === locale && tr.featuredImage)
    .sort((a, b) => a.title.localeCompare(b.title, locale))
    .slice(0, 24); // Limit to 24 trees for coloring pages

  return (
    <>
      {/* Screen header - hidden when printing */}
      <div className="print:hidden py-8 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/education/printables"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            {t("backLink")}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-muted-foreground">{t("instructions")}</p>
          </div>
        </div>
      </div>

      <ColoringPagesClient trees={trees} />
    </>
  );
}
