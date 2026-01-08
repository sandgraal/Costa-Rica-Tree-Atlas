import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { allTrees } from "contentlayer/generated";
import { SkeletonGrid } from "@/components/skeletons/SkeletonGrid";
import ScavengerHuntClient from "./ScavengerHuntClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Búsqueda del Tesoro de Árboles - Atlas de Árboles de Costa Rica"
        : "Tree Scavenger Hunt - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Una búsqueda del tesoro interactiva para encontrar árboles con características específicas."
        : "An interactive scavenger hunt to find trees with specific characteristics.",
  };
}

export default async function ScavengerHuntPage({ params }: Props) {
  return (
    <Suspense fallback={<ScavengerHuntLoading />}>
      <ScavengerHuntContent params={params} />
    </Suspense>
  );
}

async function ScavengerHuntContent({ params }: { params: Promise<{ locale: string }> }) {
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
      tags: t.tags || undefined,
      conservationStatus: t.conservationStatus || undefined,
      nativeRegion: t.nativeRegion || undefined,
      maxHeight: t.maxHeight || undefined,
      floweringSeason: t.floweringSeason || undefined,
      fruitingSeason: t.fruitingSeason || undefined,
      uses: t.uses || undefined,
    }));

  return <ScavengerHuntClient trees={trees} locale={locale} />;
}

function ScavengerHuntLoading() {
  return (
    <div className="container py-8">
      <div className="h-12 bg-muted rounded w-64 mb-8 animate-pulse" />
      <SkeletonGrid count={12} columns={4} />
    </div>
  );
}
