import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { TreeList } from "@/components/TreeList";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === "es" ? "Directorio de Árboles" : "Tree Directory",
    description:
      locale === "es"
        ? "Explora nuestra colección de árboles costarricenses"
        : "Browse our collection of Costa Rican trees",
    alternates: {
      languages: {
        en: "/en/trees",
        es: "/es/trees",
      },
    },
  };
}

export default async function TreesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees for current locale
  const trees = allTrees.filter((tree) => tree.locale === locale);

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <TreeList trees={trees} />
      </div>
    </div>
  );
}
