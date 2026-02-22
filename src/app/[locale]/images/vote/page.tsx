import { NextIntlClientProvider } from "next-intl";
import {
  setRequestLocale,
  getMessages,
  getTranslations,
} from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import type { AbstractIntlMessages } from "next-intl";
import VotingClient from "./VotingClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "imageVoting" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

/**
 * Public Image Voting Page
 *
 * Allows anonymous users to vote on tree images.
 * Votes are stored in the database and help prioritize
 * which images need improvement.
 *
 * Part of Priority 0.2 - Image Review System
 */
export default async function ImageVotePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Provide imageVoting namespace to the client component.
  // The root layout only ships global namespaces; page-specific
  // namespaces are provided here to avoid bloating all pages.
  const messages = await getMessages();
  const castMessages = messages as Record<string, AbstractIntlMessages>;
  const clientMessages = { imageVoting: castMessages.imageVoting };

  // Get trees with images for voting
  const treesWithImages = allTrees
    .filter((t) => t.locale === locale && t.featuredImage)
    .map((tree) => ({
      slug: tree.slug,
      title: tree.title,
      scientificName: tree.scientificName,
      family: tree.family,
      featuredImage: tree.featuredImage!,
      hasPlaceholder: tree.featuredImage?.includes("12345678") || false,
      hasLocalImage: tree.featuredImage?.startsWith("/images") || false,
    }))
    .filter((t) => !t.hasPlaceholder); // Exclude placeholders from voting

  return (
    <NextIntlClientProvider messages={clientMessages}>
      <VotingClient trees={treesWithImages} />
    </NextIntlClientProvider>
  );
}
