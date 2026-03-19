import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import ProposalDetailClient from "./ProposalDetailClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Proposal ${id.slice(0, 8)}... - Admin`,
    robots: { index: false, follow: false },
    alternates: {
      languages: {
        en: `/en/admin/images/proposals/${id}`,
        es: `/es/admin/images/proposals/${id}`,
      },
    },
  };
}

/**
 * Admin page for viewing and managing a single image proposal.
 * Shows side-by-side comparison and full details.
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */
export default async function ProposalDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/images/proposals"
            className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
          >
            ← Back to Proposals
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            🔍 Proposal Details
          </h1>
        </div>

        {/* Client component for interactive review */}
        <ProposalDetailClient proposalId={id} />
      </div>
    </div>
  );
}
