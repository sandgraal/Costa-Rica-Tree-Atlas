import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import * as contentlayerGenerated from "contentlayer/generated";
import { Link } from "@i18n/navigation";
import type { Metadata } from "next";
import { ServerMDXContent } from "@/components/ServerMDXContent";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { Locale, Tree } from "@/types/tree";

interface OralHistory {
  locale: string;
  slug: string;
  title: string;
  description: string;
  narrator: string;
  community: string;
  region?: string;
  recordedDate?: string;
  relatedTrees?: string[];
  themes?: string[];
  body: {
    raw: string;
  };
}

const allOralHistories =
  (contentlayerGenerated as { allOralHistories?: OralHistory[] })
    .allOralHistories ?? [];
const allTrees = contentlayerGenerated.allTrees as Tree[];

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  allOralHistories.forEach((entry: OralHistory) => {
    params.push({
      locale: entry.locale,
      slug: entry.slug,
    });
  });

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const entry = allOralHistories.find(
    (e: OralHistory) => e.locale === locale && e.slug === slug
  );

  if (!entry) {
    return { title: "Not Found" };
  }

  return {
    title: entry.title,
    description: entry.description,
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: "article",
    },
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

export default async function OralHistoryDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const entry = allOralHistories.find(
    (e: OralHistory) => e.locale === locale && e.slug === slug
  );

  if (!entry) notFound();

  const t = await getTranslations("oralHistories");

  const trees: Tree[] = allTrees.filter((tr: Tree) => tr.locale === locale);

  const relatedTreeData = (entry.relatedTrees ?? [])
    .map((treeSlug: string) => trees.find((tr: Tree) => tr.slug === treeSlug))
    .filter((tr: Tree | undefined): tr is Tree => tr !== undefined);

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Breadcrumbs
          locale={locale as Locale}
          pathname={`/oral-histories/${entry.slug}`}
          customLabels={{
            "oral-histories": t("title"),
            [entry.slug]: entry.title,
          }}
        />
      </div>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-4">
            {entry.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
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
            {entry.recordedDate && (
              <span>
                <strong>{t("recordedDate")}:</strong> {entry.recordedDate}
              </span>
            )}
          </div>

          {entry.themes && entry.themes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {entry.themes.map((theme: string) => (
                <span
                  key={theme}
                  className="px-2 py-1 bg-accent/10 text-accent-dark dark:text-accent rounded-full text-xs font-medium"
                >
                  {THEME_LABEL_KEYS[theme] ? t(THEME_LABEL_KEYS[theme]) : theme}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ServerMDXContent source={entry.body.raw} locale={locale} />
        </div>

        {relatedTreeData.length > 0 && (
          <aside className="mt-12 p-6 bg-muted rounded-xl">
            <h2 className="text-lg font-semibold mb-4">{t("relatedTrees")}</h2>
            <div className="flex flex-wrap gap-3">
              {relatedTreeData.map((tree: Tree) => (
                <Link
                  key={tree.slug}
                  href={`/trees/${tree.slug}`}
                  className="px-4 py-2 bg-background border border-border rounded-lg hover:shadow-sm transition-shadow text-sm font-medium"
                >
                  {tree.title}{" "}
                  <span className="text-muted-foreground italic">
                    ({tree.scientificName})
                  </span>
                </Link>
              ))}
            </div>
          </aside>
        )}

        <div className="mt-8">
          <Link
            href="/oral-histories"
            className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            ← {t("backToList")}
          </Link>
        </div>
      </article>
    </main>
  );
}
