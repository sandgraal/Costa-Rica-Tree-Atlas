import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { APIDocumentation } from "@/components/APIDocumentation";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "api" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function APIDocsPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "api" });

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {t("subtitle")}
          </p>
        </div>

        <APIDocumentation locale={locale} />
      </div>
    </main>
  );
}
