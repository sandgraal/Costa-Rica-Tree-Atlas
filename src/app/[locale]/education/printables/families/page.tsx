import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { PrintButton } from "../PrintButton";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Guía de Familias Botánicas - Atlas de Árboles de Costa Rica"
        : "Botanical Family Guide - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Guía de referencia de familias botánicas con especies representativas de Costa Rica."
        : "Reference guide of botanical families with representative Costa Rica species.",
  };
}

export default async function FamiliesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees.filter((t) => t.locale === locale);
  const familyData = [...new Set(trees.map((t) => t.family))]
    .sort()
    .map((family) => {
      const familyTrees = trees.filter((t) => t.family === family);
      return {
        family,
        count: familyTrees.length,
        trees: familyTrees
          .sort((a, b) => a.title.localeCompare(b.title, locale))
          .slice(0, 5),
      };
    });

  const t = {
    title:
      locale === "es" ? "Guía de Familias Botánicas" : "Botanical Family Guide",
    subtitle:
      locale === "es"
        ? "Atlas de Árboles de Costa Rica"
        : "Costa Rica Tree Atlas",
    instructions:
      locale === "es"
        ? "Referencia rápida de familias botánicas representadas en el atlas"
        : "Quick reference of botanical families represented in the atlas",
    printButton: locale === "es" ? "🖨️ Imprimir" : "🖨️ Print",
    backLink: locale === "es" ? "← Volver" : "← Back",
    species: locale === "es" ? "especies" : "species",
    families: locale === "es" ? "familias" : "families",
    representativeSpecies:
      locale === "es" ? "Especies representativas" : "Representative species",
    andMore: locale === "es" ? "y más..." : "and more...",
  };

  // Family characteristics (simplified botanical info)
  const familyInfo: Record<string, { en: string; es: string }> = {
    Fabaceae: {
      en: "Legume family - nitrogen-fixing, compound leaves, pod fruits",
      es: "Familia de las leguminosas - fijación de nitrógeno, hojas compuestas, frutos en vaina",
    },
    Bignoniaceae: {
      en: "Trumpet vine family - showy flowers, often opposite leaves",
      es: "Familia de las bignonias - flores vistosas, hojas frecuentemente opuestas",
    },
    Meliaceae: {
      en: "Mahogany family - pinnate leaves, valuable timber",
      es: "Familia de las caobas - hojas pinnadas, madera valiosa",
    },
    Malvaceae: {
      en: "Mallow family - often mucilaginous, 5-petaled flowers",
      es: "Familia de las malvas - mucilaginosas, flores de 5 pétalos",
    },
    Moraceae: {
      en: "Fig family - milky latex, multiple fruits",
      es: "Familia de los higos - látex lechoso, frutos múltiples",
    },
    Anacardiaceae: {
      en: "Cashew family - resinous, drupes, some allergenic",
      es: "Familia del marañón - resinosas, drupas, algunas alergénicas",
    },
    Boraginaceae: {
      en: "Borage family - rough hairy leaves, coiled flower clusters",
      es: "Familia de las borrajas - hojas ásperas y peludas, flores en racimos enrollados",
    },
    Sapotaceae: {
      en: "Sapote family - milky latex, sweet edible fruits",
      es: "Familia del zapote - látex lechoso, frutos dulces comestibles",
    },
    Arecaceae: {
      en: "Palm family - unbranched stems, large compound leaves",
      es: "Familia de las palmas - tallos no ramificados, hojas compuestas grandes",
    },
    Myrtaceae: {
      en: "Myrtle family - aromatic, opposite leaves with oil glands",
      es: "Familia del mirto - aromáticas, hojas opuestas con glándulas de aceite",
    },
    Rubiaceae: {
      en: "Coffee family - opposite leaves with stipules",
      es: "Familia del café - hojas opuestas con estípulas",
    },
    Lauraceae: {
      en: "Laurel family - aromatic, simple alternate leaves",
      es: "Familia del laurel - aromáticas, hojas simples alternas",
    },
    Euphorbiaceae: {
      en: "Spurge family - milky latex, varied fruit types",
      es: "Familia de las euforbias - látex lechoso, frutos variados",
    },
    Chrysobalanaceae: {
      en: "Cocoplum family - often buttressed, drupes",
      es: "Familia del icaco - frecuentemente con aletones, drupas",
    },
    Urticaceae: {
      en: "Nettle family - often with stinging hairs, simple leaves",
      es: "Familia de las ortigas - frecuentemente con pelos urticantes, hojas simples",
    },
    Cupressaceae: {
      en: "Cypress family - scale-like leaves, woody cones",
      es: "Familia de los cipreses - hojas escamosas, conos leñosos",
    },
  };

  return (
    <>
      {/* Screen header */}
      <div className="print:hidden py-8 px-4 bg-muted">
        <div className="container mx-auto max-w-5xl">
          <Link
            href="/education/printables"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            {t.backLink}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
              <p className="text-muted-foreground">{t.instructions}</p>
            </div>
            <PrintButton label={t.printButton} />
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="print-families px-4 py-8 print:py-0 print:px-0">
        <div className="container mx-auto max-w-5xl print:max-w-none">
          {/* Print header */}
          <div className="text-center mb-8 print:mb-4">
            <h1 className="text-3xl font-bold text-primary print:text-black print:text-2xl">
              🌳 {t.title}
            </h1>
            <p className="text-lg text-muted-foreground print:text-gray-600 print:text-sm">
              {t.subtitle}
            </p>
            <p className="text-sm text-muted-foreground mt-1 print:text-gray-500 print:text-xs">
              {familyData.length} {t.families} • {trees.length} {t.species}
            </p>
          </div>

          {/* Family grid */}
          <div className="grid md:grid-cols-2 gap-6 print:gap-3 print:grid-cols-2">
            {familyData.map(({ family, count, trees: familyTrees }) => (
              <div
                key={family}
                className="bg-card border border-border print:border-gray-300 rounded-xl print:rounded-lg p-5 print:p-3 break-inside-avoid"
              >
                <div className="flex items-start justify-between mb-2 print:mb-1">
                  <h2 className="text-xl print:text-base font-bold text-primary print:text-black">
                    {family}
                  </h2>
                  <span className="text-sm print:text-xs text-muted-foreground print:text-gray-500 bg-muted print:bg-gray-100 px-2 py-0.5 rounded-full">
                    {count} {count === 1 ? "sp." : "spp."}
                  </span>
                </div>

                {familyInfo[family] && (
                  <p className="text-xs text-muted-foreground print:text-gray-500 mb-3 print:mb-2 italic">
                    {locale === "es"
                      ? familyInfo[family].es
                      : familyInfo[family].en}
                  </p>
                )}

                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground print:text-gray-600 uppercase tracking-wide mb-2 print:mb-1">
                    {t.representativeSpecies}
                  </h3>
                  <ul className="space-y-1 print:space-y-0.5">
                    {familyTrees.map((tree) => (
                      <li
                        key={tree.slug}
                        className="text-sm print:text-xs flex justify-between"
                      >
                        <span className="text-foreground print:text-black">
                          {tree.title}
                        </span>
                        <span className="text-muted-foreground print:text-gray-500 italic">
                          {tree.scientificName.split(" ").slice(0, 2).join(" ")}
                        </span>
                      </li>
                    ))}
                    {count > 5 && (
                      <li className="text-xs text-muted-foreground print:text-gray-400 italic">
                        + {count - 5} {t.andMore}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-border print:border-gray-300 print:mt-4 print:pt-2">
            <div className="flex justify-between text-sm text-muted-foreground print:text-gray-500 print:text-xs">
              <span>
                {familyData.length} {t.families}
              </span>
              <span>costaricatreeatlas.com</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
