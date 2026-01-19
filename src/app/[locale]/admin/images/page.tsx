import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import ImageReviewClient from "./ImageReviewClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Image Review - Admin",
    robots: { index: false, follow: false },
  };
}

/**
 * Admin page for reviewing tree images.
 * Protected by HTTP Basic Authentication (see middleware.ts).
 * Requires ADMIN_PASSWORD environment variable to be set.
 * Votes are stored in localStorage and must be processed manually.
 */
export default async function ImageReviewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

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
          <Link
            href="/trees"
            className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
          >
            ← Back to Trees
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            🖼️ Tree Image Review
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and manage featured images for each tree species. Vote on
            images to mark them for local storage.
          </p>
        </div>

        {/* Admin Navigation */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/images/proposals"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              📋 Manage Proposals
              <span className="bg-primary-foreground/20 px-2 py-0.5 rounded text-xs">
                New
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
            <div className="text-sm text-muted-foreground">Total Trees</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.placeholder}
            </div>
            <div className="text-sm text-red-600/80">Need Photos</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">
              {stats.external}
            </div>
            <div className="text-sm text-amber-600/80">External URLs</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.local}
            </div>
            <div className="text-sm text-green-600/80">Local Images</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.missing}
            </div>
            <div className="text-sm text-gray-600/80">No Image</div>
          </div>
        </div>

        {/* Client component for interactive review */}
        <ImageReviewClient trees={trees} />
      </div>
    </div>
  );
}
