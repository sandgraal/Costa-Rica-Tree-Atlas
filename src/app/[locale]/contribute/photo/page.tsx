import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import PhotoUploadClient from "./PhotoUploadClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contribute" });

  return {
    title: t("uploadPhoto.title"),
    description: t("uploadPhoto.description"),
  };
}

/**
 * Contribute Photo Page
 *
 * Allows authenticated users to upload photos of tree species.
 * Photos are submitted as proposals for admin review.
 *
 * Part of Priority 4 - Community Features
 */
export default async function ContributePhotoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get all tree slugs for the dropdown
  const trees = allTrees
    .filter((t) => t.locale === locale)
    .map((tree) => ({
      slug: tree.slug,
      title: tree.title,
      scientificName: tree.scientificName,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return <PhotoUploadClient trees={trees} />;
}
