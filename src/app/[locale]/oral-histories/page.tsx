import { Metadata } from "next";
/* eslint-disable security/detect-object-injection -- oral-history theme lookups use curated theme ids from content schema. */
import { getTranslations, setRequestLocale } from "next-intl/server";
import * as contentlayerGenerated from "contentlayer/generated";
import { Link } from "@i18n/navigation";
import type { Locale } from "@/types";
import type { Tree } from "@/types/tree";
import { Breadcrumbs } from "@/components/Breadcrumbs";

interface OralHistory {
  locale: string;
  slug: string;
  title: string;
  description: string;
  narrator: string;
  community: string;
  region?: string;
  relatedTrees?: string[];
  themes?: string[];
  publishedAt?: string;
}

const allOralHistories =
  (contentlayerGenerated as { allOralHistories?: OralHistory[] })
    .allOralHistories ?? [];
const allTrees = contentlayerGenerated.allTrees as Tree[];

interface OralHistoriesPageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({
  params,
}: OralHistoriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "oralHistories" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const THEME_LABEL_KEYS: Record<string, string> = {
  medicine: "themeMedicine",
  ceremony: "themeCeremony",
  food: "themeFood",
  construction: "themeConstruction",
  mythology: "themeMythology",
  crafts: "themeCrafts",
  ecology: "themeEcology",
};

export default async function OralHistoriesPage({
  params,
}: OralHistoriesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("oralHistories");

  const entries: OralHistory[] = allOralHistories
    .filter((entry: OralHistory) => entry.locale === locale)
    .sort((a: OralHistory, b: OralHistory) => {
      if (a.publishedAt && b.publishedAt) {
        return (
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      }
      return a.title.localeCompare(b.title, locale);
    });

  const trees: Tree[] = allTrees.filter((tr: Tree) => tr.locale === locale);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Breadcrumbs
          locale={locale}
          pathname="/oral-histories"
          customLabels={{
            "oral-histories": t("title"),
          }}
        />
      </div>

      <header className="mb-12">
        <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-3">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">{t("noEntries")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {entries.map((entry: OralHistory) => {
            const relatedTreeData = (entry.relatedTrees ?? [])
              .map((slug: string) => trees.find((tr: Tree) => tr.slug === slug))
              .filter((tr: Tree | undefined): tr is Tree => tr !== undefined);

            return (
              <article
                key={entry.slug}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <Link
                      href={`/oral-histories/${entry.slug}`}
                      className="text-xl font-semibold text-primary-dark dark:text-primary-light hover:underline"
                    >
                      {entry.title}
                    </Link>
                    <p className="text-muted-foreground mt-2">
                      {entry.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      <strong>{t("narrator")}:</strong> {entry.narrator}
                    </span>
                    <span>
                      <strong>{t("community")}:</strong> {entry.community}
                    </span>
                    {entry.region && (
                      <span>
                        <strong>{t("region")}:</strong> {entry.region}
                      </span>
                    )}
                  </div>

                  {entry.themes && entry.themes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {entry.themes.map((theme: string) => (
                        <span
                          key={theme}
                          className="px-2 py-1 bg-accent/10 text-accent-dark dark:text-accent rounded-full text-xs font-medium"
                        >
                          {THEME_LABEL_KEYS[theme]
                            ? t(THEME_LABEL_KEYS[theme])
                            : theme}
                        </span>
                      ))}
                    </div>
                  )}

                  {relatedTreeData.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="text-muted-foreground font-medium">
                        {t("relatedTrees")}:
                      </span>
                      {relatedTreeData.map((tree: Tree) => (
                        <Link
                          key={tree.slug}
                          href={`/trees/${tree.slug}`}
                          className="text-primary hover:underline"
                        >
                          {tree.title}
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/oral-histories/${entry.slug}`}
                    className="inline-flex items-center gap-1 text-primary font-medium hover:underline w-fit"
                  >
                    {t("readMore")} →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
