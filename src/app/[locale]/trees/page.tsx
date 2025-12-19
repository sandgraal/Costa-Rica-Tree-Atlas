import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { TreeCard } from "@/components/TreeCard";
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
        <TreesContent trees={trees} />
      </div>
    </div>
  );
}

function TreesContent({ trees }: { trees: typeof allTrees }) {
  const t = useTranslations("trees");

  return (
    <>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Tree Grid */}
      {trees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trees.map((tree) => (
            <TreeCard key={tree._id} tree={tree} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <TreePlaceholderIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">{t("noResults")}</p>
        </div>
      )}
    </>
  );
}

function TreePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22V8" />
      <path d="M5 12l7-10 7 10" />
      <path d="M5 12a7 7 0 0 0 14 0" />
    </svg>
  );
}
