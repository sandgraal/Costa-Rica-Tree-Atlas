import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import { SkeletonGrid } from "@/components/skeletons/SkeletonGrid";
import FieldTripClient from "./FieldTripClient";
import { ComponentErrorBoundary } from "@/components/ComponentErrorBoundary";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "fieldTrip" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/education/field-trip",
        es: "/es/education/field-trip",
      },
    },
  };
}

export default async function FieldTripPage({ params }: Props) {
  return (
    <Suspense fallback={<FieldTripLoading />}>
      <FieldTripContent params={params} />
    </Suspense>
  );
}

async function FieldTripContent({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((tr) => tr.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title, locale))
    .map((tr) => ({
      title: tr.title,
      scientificName: tr.scientificName,
      family: tr.family,
      slug: tr.slug,
      featuredImage: tr.featuredImage || undefined,
      conservationStatus: tr.conservationStatus || undefined,
      nativeRegion: tr.nativeRegion || undefined,
      tags: tr.tags || undefined,
    }));

  return (
    <ComponentErrorBoundary componentName="Field Trip">
      <FieldTripClient trees={trees} />
    </ComponentErrorBoundary>
  );
}

function FieldTripLoading() {
  return (
    <div className="container py-8">
      <div className="h-12 bg-muted rounded w-64 mb-8 animate-pulse" />
      <SkeletonGrid count={12} columns={4} />
    </div>
  );
}
