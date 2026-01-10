import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { Link } from "@i18n/navigation";
import type { Locale } from "@/types";

interface ConservationPageProps {
  params: Promise<{ locale: Locale }>;
}

type ConservationStatus =
  | "EX"
  | "EW"
  | "CR"
  | "EN"
  | "VU"
  | "NT"
  | "LC"
  | "DD"
  | "NE";

const STATUS_COLORS: Record<ConservationStatus, string> = {
  EX: "bg-black text-white",
  EW: "bg-gray-800 text-white",
  CR: "bg-red-600 text-white",
  EN: "bg-orange-600 text-white",
  VU: "bg-yellow-600 text-white",
  NT: "bg-blue-500 text-white",
  LC: "bg-green-600 text-white",
  DD: "bg-gray-500 text-white",
  NE: "bg-gray-400 text-white",
};

export async function generateMetadata({
  params,
}: ConservationPageProps): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Dashboard de Conservación - Atlas de Árboles de Costa Rica"
        : "Conservation Dashboard - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Estado de conservación de los árboles de Costa Rica según la Lista Roja de la UICN."
        : "Conservation status of Costa Rica's trees according to the IUCN Red List.",
    alternates: {
      canonical: `/${locale}/conservation`,
      languages: {
        en: "/en/conservation",
        es: "/es/conservation",
      },
    },
  };
}

export default async function ConservationPage({
  params,
}: ConservationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees.filter((tree) => tree.locale === locale);

  const treesByStatus = trees.reduce(
    (acc, tree) => {
      const status = (tree.conservationStatus || "NE") as ConservationStatus;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(tree);
      return acc;
    },
    {} as Record<ConservationStatus, typeof trees>
  );

  const statusOrder: ConservationStatus[] = [
    "EX",
    "EW",
    "CR",
    "EN",
    "VU",
    "NT",
    "LC",
    "DD",
    "NE",
  ];

  const endemicTrees = trees.filter((tree) => tree.tags?.includes("endemic"));

  const totalTrees = trees.length;
  const threatened = [
    ...(treesByStatus.CR || []),
    ...(treesByStatus.EN || []),
    ...(treesByStatus.VU || []),
  ];
  const threatenedCount = threatened.length;
  const threatenedPercent = ((threatenedCount / totalTrees) * 100).toFixed(1);

  const statusLabels: Record<ConservationStatus, { en: string; es: string }> = {
    EX: { en: "Extinct", es: "Extinta" },
    EW: { en: "Extinct in Wild", es: "Extinta en Estado Silvestre" },
    CR: { en: "Critically Endangered", es: "En Peligro Crítico" },
    EN: { en: "Endangered", es: "En Peligro" },
    VU: { en: "Vulnerable", es: "Vulnerable" },
    NT: { en: "Near Threatened", es: "Casi Amenazada" },
    LC: { en: "Least Concern", es: "Preocupación Menor" },
    DD: { en: "Data Deficient", es: "Datos Insuficientes" },
    NE: { en: "Not Evaluated", es: "No Evaluada" },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      locale === "es" ? "Dashboard de Conservación" : "Conservation Dashboard",
    description:
      locale === "es"
        ? "Estado de conservación de los árboles de Costa Rica"
        : "Conservation status of Costa Rica's trees",
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {locale === "es"
              ? "Dashboard de Conservación"
              : "Conservation Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {locale === "es"
              ? "Estado de conservación de los árboles de Costa Rica según la Lista Roja de la UICN"
              : "Conservation status of Costa Rica's trees according to the IUCN Red List"}
          </p>
        </div>

        <section className="mb-8 grid md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-xl p-6">
            <div className="text-3xl font-bold text-primary mb-1">
              {totalTrees}
            </div>
            <div className="text-sm text-muted-foreground">
              {locale === "es" ? "Especies Documentadas" : "Species Documented"}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {threatenedCount}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              {locale === "es" ? "Especies Amenazadas" : "Threatened Species"}
              <span className="block text-xs opacity-70">
                CR + EN + VU ({threatenedPercent}%)
              </span>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {endemicTrees.length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              {locale === "es" ? "Especies Endémicas" : "Endemic Species"}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {locale === "es"
              ? "Estado de Conservación por Categoría"
              : "Conservation Status by Category"}
          </h2>

          <div className="space-y-4">
            {statusOrder.map((status) => {
              const speciesInStatus = treesByStatus[status] || [];
              if (speciesInStatus.length === 0) return null;

              const label = statusLabels[status][locale];
              const color = STATUS_COLORS[status];
              const percentage = (
                (speciesInStatus.length / totalTrees) *
                100
              ).toFixed(1);

              return (
                <div
                  key={status}
                  className="bg-muted rounded-lg overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}
                        >
                          {status}
                        </span>
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {speciesInStatus.length} species ({percentage}%)
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                      {speciesInStatus.map((tree) => (
                        <Link
                          key={tree.slug}
                          href={`/trees/${tree.slug}`}
                          className="text-sm p-2 hover:bg-background rounded transition-colors"
                        >
                          <div className="font-medium">{tree.title}</div>
                          <div className="text-xs text-muted-foreground italic">
                            {tree.scientificName}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {endemicTrees.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              {locale === "es"
                ? "Especies Endémicas de Costa Rica"
                : "Costa Rica Endemic Species"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {locale === "es"
                ? "Estas especies se encuentran solo en Costa Rica."
                : "These species are found only in Costa Rica."}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endemicTrees.map((tree) => (
                <Link
                  key={tree.slug}
                  href={`/trees/${tree.slug}`}
                  className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors"
                >
                  <div className="font-medium">{tree.title}</div>
                  <div className="text-sm text-muted-foreground italic">
                    {tree.scientificName}
                  </div>
                  {tree.conservationStatus && (
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                        STATUS_COLORS[
                          tree.conservationStatus as ConservationStatus
                        ]
                      }`}
                    >
                      {tree.conservationStatus}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-muted rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">
            {locale === "es"
              ? "Acerca de la Lista Roja de la UICN"
              : "About the IUCN Red List"}
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              {locale === "es"
                ? "La Lista Roja de Especies Amenazadas de la UICN es el inventario más completo del mundo sobre el estado de conservación global de especies biológicas."
                : "The IUCN Red List of Threatened Species is the world's most comprehensive inventory of the global conservation status of biological species."}
            </p>
            <div className="mt-4 space-y-2 not-prose">
              <a
                href="https://www.iucnredlist.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-primary hover:underline"
              >
                {locale === "es"
                  ? "Visitar Lista Roja de la UICN →"
                  : "Visit IUCN Red List →"}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
