import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import ImageReviewClient from "./ImageReviewClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.images" });
  return {
    title: t("pageTitle"),
    robots: { index: false, follow: false },
  };
}

/**
 * Admin page for reviewing tree images.
 * Protected by session authentication.
 * Votes are stored in the database via /api/admin/image-votes.
 */
export default async function ImageReviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin.images" });

  // Get all trees with their image info
  const trees = allTrees
    .filter((t) => t.locale === locale)
    .map((tree) => ({
      slug: tree.slug,
      title: tree.title,
      scientificName: tree.scientificName,
      family: tree.family,
      featuredImage: tree.featuredImage || null,
      hasPlaceholder: tree.featuredImage?.includes("12345678") || false,
      hasLocalImage: tree.featuredImage?.startsWith("/images") || false,
    }))
    .sort((a, b) => {
      // Sort: placeholders first, then external, then local
      if (a.hasPlaceholder && !b.hasPlaceholder) return -1;
      if (!a.hasPlaceholder && b.hasPlaceholder) return 1;
      if (a.hasLocalImage && !b.hasLocalImage) return 1;
      if (!a.hasLocalImage && b.hasLocalImage) return -1;
      return a.title.localeCompare(b.title);
    });

  const stats = {
    total: trees.length,
    placeholder: trees.filter((t) => t.hasPlaceholder).length,
    external: trees.filter(
      (t) => !t.hasPlaceholder && !t.hasLocalImage && t.featuredImage
    ).length,
    local: trees.filter((t) => t.hasLocalImage).length,
    missing: trees.filter((t) => !t.featuredImage).length,
  };

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("heading")}</h1>
          <p className="text-muted-foreground mt-2">{t("description")}</p>
        </div>

        {/* Admin Navigation */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/images/proposals"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              📋 {t("manageProposals").replace("📋 ", "")}
              <span className="bg-primary-foreground/20 px-2 py-0.5 rounded text-xs">
                {t("newBadge")}
              </span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {stats.total}
            </div>
            <div className="text-sm text-muted-foreground">
              {t("totalTrees")}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.placeholder}
            </div>
            <div className="text-sm text-red-600/80">{t("needPhotos")}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {stats.external}
            </div>
            <div className="text-sm text-amber-600/80">{t("externalUrls")}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.local}
            </div>
            <div className="text-sm text-green-600/80">{t("localImages")}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.missing}
            </div>
            <div className="text-sm text-gray-600/80">{t("noImage")}</div>
          </div>
        </div>

        {/* Client component for interactive review */}
        <ImageReviewClient trees={trees} />
      </div>
    </div>
  );
}
