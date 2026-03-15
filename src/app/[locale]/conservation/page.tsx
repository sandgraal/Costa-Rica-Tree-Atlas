import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import { SafeJsonLd } from "@/components/SafeJsonLd";
import { Link } from "@i18n/navigation";
import type { Locale } from "@/types";
import type { ConservationCategory } from "@/types/tree";

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
  const t = await getTranslations({ locale, namespace: "conservation" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
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
  const t = await getTranslations({ locale, namespace: "conservation" });

  const trees = allTrees.filter((tr) => tr.locale === locale);

  const treesByStatus = trees.reduce(
    (acc, tr) => {
      const status = (tr.conservationStatus || "NE") as ConservationStatus;
      // eslint-disable-next-line security/detect-object-injection -- `status` is a constrained union (`ConservationStatus`), not user input.
      if (!acc[status]) {
        // eslint-disable-next-line security/detect-object-injection -- Safe write to typed status-indexed record.
        acc[status] = [];
      }
      // eslint-disable-next-line security/detect-object-injection -- Safe push into typed status bucket.
      acc[status].push(tr);
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

  const endemicTrees = trees.filter((tr) => tr.tags?.includes("endemic"));

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
    name: t("heading"),
    description: t("structuredDescription"),
  };

  return (
    <>
      <SafeJsonLd data={structuredData} />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("heading")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <section className="mb-8 grid md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-xl p-6">
            <div className="text-3xl font-bold text-primary mb-1">
              {totalTrees}
            </div>
            <div className="text-sm text-muted-foreground">
              {t("speciesDocumented")}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {threatenedCount}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              {t("threatenedSpecies")}
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
              {t("endemicSpecies")}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t("statusByCategory")}
          </h2>

          <div className="space-y-4">
            {statusOrder.map((status) => {
              // eslint-disable-next-line security/detect-object-injection -- `status` is from `statusOrder` typed as `ConservationStatus`.
              const speciesInStatus = treesByStatus[status] || [];
              if (speciesInStatus.length === 0) return null;

              // eslint-disable-next-line security/detect-object-injection -- Safe lookup in typed labels map by constrained status key.
              const label = statusLabels[status][locale];
              // eslint-disable-next-line security/detect-object-injection -- Safe lookup in typed colors map by constrained status key.
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
                        {t("statusSummary.count", {
                          count: speciesInStatus.length,
                          percentage,
                        })}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 mt-3">
                      {speciesInStatus.map((tr) => (
                        <Link
                          key={tr.slug}
                          href={`/trees/${tr.slug}`}
                          className="text-sm p-2 hover:bg-background rounded transition-colors"
                        >
                          <div className="font-medium">{tr.title}</div>
                          <div className="text-xs text-muted-foreground italic">
                            {tr.scientificName}
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
              {t("endemicHeading")}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("endemicDescription")}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {endemicTrees.map((tr) => (
                <Link
                  key={tr.slug}
                  href={`/trees/${tr.slug}`}
                  className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors"
                >
                  <div className="font-medium">{tr.title}</div>
                  <div className="text-sm text-muted-foreground italic">
                    {tr.scientificName}
                  </div>
                  {tr.conservationStatus &&
                    (() => {
                      const status = tr.conservationStatus;
                      const isKnownStatus = Object.hasOwn(
                        STATUS_COLORS,
                        status as ConservationCategory
                      );
                      const colorClass = isKnownStatus
                        ? STATUS_COLORS[status as ConservationStatus]
                        : "bg-muted text-foreground";
                      const localizedLabel = isKnownStatus
                        ? statusLabels[status as ConservationStatus]?.[locale]
                        : undefined;
                      const fallbackLabel = t("unknownStatus");

                      return (
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${colorClass}`}
                        >
                          {status}
                          {" — "}
                          {localizedLabel ?? t("unknownStatus")}
                        </span>
                      );
                    })()}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-muted rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-3">
            {t("aboutIucnHeading")}
          </h2>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{t("aboutIucnDescription")}</p>
            <div className="mt-4 space-y-2 not-prose">
              <a
                href="https://www.iucnredlist.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-primary hover:underline"
              >
                {t("visitIucn")}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}
