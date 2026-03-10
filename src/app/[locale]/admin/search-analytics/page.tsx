import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SearchAnalyticsClient } from "./SearchAnalyticsClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.searchAnalytics");
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function SearchAnalyticsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("admin.searchAnalytics");

  return (
    <div className="py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("heading")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <SearchAnalyticsClient />
      </div>
    </div>
  );
}
