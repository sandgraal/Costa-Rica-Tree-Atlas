import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import ProposalsListClient from "./ProposalsListClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "admin.images" });

  return {
    title: t("proposals.pageTitle"),
    robots: { index: false, follow: false },
    alternates: {
      languages: {
        en: "/en/admin/images/proposals",
        es: "/es/admin/images/proposals",
      },
    },
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
  const t = await getTranslations({ locale, namespace: "admin.images" });

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/images"
            className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
          >
            {t("proposals.backToImageReview")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            {t("proposals.heading")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("proposals.description")}
          </p>
        </div>

        {/* Client component for interactive review */}
        <ProposalsListClient />
      </div>
    </div>
  );
}
