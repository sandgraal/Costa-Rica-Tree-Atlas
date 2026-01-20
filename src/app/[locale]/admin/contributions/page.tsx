import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect as nextRedirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ContributionsListClient } from "./ContributionsListClient";

export const metadata: Metadata = {
  title: "Review Contributions | Admin",
  description: "Review and manage community contributions",
};

export default async function AdminContributionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    nextRedirect(`/${locale}/admin/login` as never);
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Community Contributions</h1>
        <p className="text-muted-foreground mb-8">
          Review suggestions, corrections, and local knowledge submitted by the
          community.
        </p>
        <ContributionsListClient />
      </div>
    </main>
  );
}
