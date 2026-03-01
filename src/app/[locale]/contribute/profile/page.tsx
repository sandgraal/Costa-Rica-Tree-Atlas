import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContributorProfileClient } from "./ContributorProfileClient";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reputation" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContributorProfilePage({ params }: PageProps) {
  await params; // ensure locale is resolved
  const t = await getTranslations("reputation");

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">{t("title")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("description")}
          </p>
        </div>

        <ContributorProfileClient />
      </div>
    </main>
  );
}
