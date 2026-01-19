import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import ProposalsListClient from "./ProposalsListClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Image Proposals - Admin",
    robots: { index: false, follow: false },
  };
}

/**
 * Admin page for reviewing image proposals.
 * Shows all pending, approved, denied, and archived proposals.
 * Protected by NextAuth authentication.
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */
export default async function ProposalsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/images"
            className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
          >
            ← Back to Image Review
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            📋 Image Proposals
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and manage proposed image changes from workflows and user
            flags.
          </p>
        </div>

        {/* Client component for interactive review */}
        <ProposalsListClient />
      </div>
    </div>
  );
}
