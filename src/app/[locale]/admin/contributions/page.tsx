import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect as nextRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ContributionsListClient } from "./ContributionsListClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.contributions");
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function AdminContributionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations("admin.contributions");

  if (!session?.user?.id) {
    nextRedirect(`/${locale}/admin/login` as never);
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t("heading")}</h1>
        <p className="text-muted-foreground mb-8">{t("description")}</p>
        <ContributionsListClient />
      </div>
    </section>
  );
}
