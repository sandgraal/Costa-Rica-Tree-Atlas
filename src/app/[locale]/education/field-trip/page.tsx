import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
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

  return {
    title:
      locale === "es"
        ? "Modo Excursión - Atlas de Árboles de Costa Rica"
        : "Field Trip Mode - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Lista de verificación offline para excursiones de campo."
        : "Offline checklist for field trip expeditions.",
  };
}

export default async function FieldTripPage({ params }: Props) {
  return (
    <Suspense fallback={<FieldTripLoading />}>
      <FieldTripContent params={params} />
    </Suspense>
  );
}

async function FieldTripContent({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((t) => t.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title, locale))
    .map((t) => ({
      title: t.title,
      scientificName: t.scientificName,
      family: t.family,
      slug: t.slug,
      featuredImage: t.featuredImage || undefined,
      conservationStatus: t.conservationStatus || undefined,
      nativeRegion: t.nativeRegion || undefined,
      tags: t.tags || undefined,
    }));

  return (
    <ComponentErrorBoundary componentName="Field Trip">
      <FieldTripClient trees={trees} locale={locale} />
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
