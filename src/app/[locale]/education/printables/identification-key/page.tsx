import { getTranslations, setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { PrintButton } from "../PrintButton";
import type { Locale } from "@i18n/routing";

type Props = {
  params: Promise<{ locale: Locale }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "identificationKey" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      languages: {
        en: "/en/education/printables/identification-key",
        es: "/es/education/printables/identification-key",
      },
    },
  };
}

export default async function IdentificationKeyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "identificationKey" });

  const trees = allTrees.filter((tr) => tr.locale === locale);

  // Group trees by observable characteristics
  const deciduousTrees = trees.filter((tr) => tr.tags?.includes("deciduous"));
  const palmTrees = trees.filter((tr) => tr.family === "Arecaceae");
  const coniferTrees = trees.filter((tr) => tr.family === "Cupressaceae");
  const nitrogenFixing = trees.filter((tr) =>
    tr.tags?.includes("nitrogen-fixing")
  );

  const keySteps = [
    {
      id: 1,
      question: {
        en: "What is the general growth form?",
        es: "¿Cuál es la forma de crecimiento general?",
      },
      options: [
        {
          text: {
            en: "Palm - single unbranched trunk with crown of large leaves",
            es: "Palma - tronco único sin ramas con corona de hojas grandes",
          },
          result: "palms",
        },
        {
          text: {
            en: "Conifer - evergreen with needle-like or scale leaves, cones",
            es: "Conífera - siempreverde con hojas aciculares o escamosas, conos",
          },
          result: "conifers",
        },
        {
          text: { en: "Broadleaf tree", es: "Árbol de hoja ancha" },
          goTo: 2,
        },
      ],
    },
    {
      id: 2,
      question: {
        en: "Does the tree lose its leaves seasonally?",
        es: "¿El árbol pierde sus hojas estacionalmente?",
      },
      options: [
        {
          text: {
            en: "Yes - deciduous (loses leaves in dry season)",
            es: "Sí - deciduo (pierde hojas en época seca)",
          },
          result: "deciduous",
        },
        {
          text: {
            en: "No - evergreen (keeps leaves year-round)",
            es: "No - siempreverde (mantiene hojas todo el año)",
          },
          goTo: 3,
        },
      ],
    },
    {
      id: 3,
      question: {
        en: "Check the leaf arrangement and type:",
        es: "Verifica la disposición y tipo de hoja:",
      },
      options: [
        {
          text: {
            en: "Compound leaves (multiple leaflets)",
            es: "Hojas compuestas (múltiples folíolos)",
          },
          goTo: 4,
        },
        {
          text: {
            en: "Simple leaves (single blade)",
            es: "Hojas simples (lámina única)",
          },
          goTo: 5,
        },
      ],
    },
    {
      id: 4,
      question: {
        en: "Compound leaf characteristics:",
        es: "Características de la hoja compuesta:",
      },
      options: [
        {
          text: {
            en: "Pinnate (leaflets along a central stem) with pod fruits",
            es: "Pinnada (folíolos a lo largo de un eje central) con frutos en vaina",
          },
          result: "legumes",
        },
        {
          text: {
            en: "Bipinnate (twice divided) or large pinnate leaves",
            es: "Bipinnada (dividida dos veces) o hojas pinnadas grandes",
          },
          result: "meliaceae",
        },
        {
          text: {
            en: "Palmate compound (leaflets radiate from one point)",
            es: "Palmaticompuesta (folíolos irradian de un punto)",
          },
          result: "palmate",
        },
      ],
    },
    {
      id: 5,
      question: {
        en: "Simple leaf and tree characteristics:",
        es: "Características de hoja simple y árbol:",
      },
      options: [
        {
          text: {
            en: "Has milky latex when cut",
            es: "Tiene látex lechoso al cortarlo",
          },
          result: "latex",
        },
        {
          text: {
            en: "Showy tubular flowers, often opposite leaves",
            es: "Flores tubulares vistosas, hojas frecuentemente opuestas",
          },
          result: "bignoniaceae",
        },
        {
          text: {
            en: "Aromatic leaves when crushed",
            es: "Hojas aromáticas al estrujarlas",
          },
          result: "aromatic",
        },
        {
          text: {
            en: "Fleshy edible fruits",
            es: "Frutos carnosos comestibles",
          },
          result: "fruiting",
        },
      ],
    },
  ];

  const resultGroups: Record<
    string,
    { title: { en: string; es: string }; trees: typeof trees }
  > = {
    palms: {
      title: { en: "Palms (Arecaceae)", es: "Palmas (Arecaceae)" },
      trees: palmTrees,
    },
    conifers: {
      title: { en: "Conifers", es: "Coníferas" },
      trees: coniferTrees,
    },
    deciduous: {
      title: { en: "Deciduous Trees", es: "Árboles Deciduos" },
      trees: deciduousTrees,
    },
    legumes: {
      title: {
        en: "Legumes (Fabaceae) - Nitrogen-fixing",
        es: "Leguminosas (Fabaceae) - Fijadoras de nitrógeno",
      },
      trees: nitrogenFixing,
    },
    meliaceae: {
      title: {
        en: "Mahogany Family & relatives",
        es: "Familia de las Caobas y relacionadas",
      },
      trees: trees.filter((tree) => tree.family === "Meliaceae"),
    },
    palmate: {
      title: {
        en: "Trees with Palmate Leaves",
        es: "Árboles con Hojas Palmaticompuestas",
      },
      trees: trees.filter(
        (tree) =>
          tree.family === "Malvaceae" ||
          tree.title.toLowerCase().includes("ceiba") ||
          tree.title.toLowerCase().includes("pochote")
      ),
    },
    latex: {
      title: {
        en: "Latex-producing Trees (Moraceae, Sapotaceae)",
        es: "Árboles con Látex (Moraceae, Sapotaceae)",
      },
      trees: trees.filter(
        (tree) => tree.family === "Moraceae" || tree.family === "Sapotaceae"
      ),
    },
    bignoniaceae: {
      title: {
        en: "Trumpet Trees (Bignoniaceae)",
        es: "Árboles Trompeta (Bignoniaceae)",
      },
      trees: trees.filter((tree) => tree.family === "Bignoniaceae"),
    },
    aromatic: {
      title: {
        en: "Aromatic Trees (Lauraceae, Myrtaceae)",
        es: "Árboles Aromáticos (Lauraceae, Myrtaceae)",
      },
      trees: trees.filter(
        (tree) => tree.family === "Lauraceae" || tree.family === "Myrtaceae"
      ),
    },
    fruiting: {
      title: {
        en: "Fruit Trees",
        es: "Árboles Frutales",
      },
      trees: trees.filter((tree) => tree.tags?.includes("edible-fruit")),
    },
  };

  return (
    <>
      {/* Screen header */}
      <div className="print:hidden py-8 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/education/printables"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            {t("backLink")}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("title")}
              </h1>
              <p className="text-muted-foreground">{t("intro")}</p>
            </div>
            <PrintButton label={t("printButton")} />
          </div>
        </div>
      </div>

      {/* Printable content */}
      <div className="print-key px-4 py-8 print:py-0 print:px-0">
        <div className="container mx-auto max-w-4xl print:max-w-none">
          {/* Print header */}
          <div className="text-center mb-8 print:mb-4">
            <h1 className="text-3xl font-bold text-primary print:text-black print:text-2xl">
              🔑 {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground print:text-gray-600 print:text-sm">
              {t("subtitle")}
            </p>
          </div>

          {/* Field Tips Box */}
          <div className="bg-primary/5 print:bg-gray-50 print:border print:border-gray-300 rounded-xl print:rounded-lg p-5 print:p-3 mb-8 print:mb-4">
            <h2 className="font-bold text-foreground print:text-black mb-3 print:mb-2 print:text-sm">
              💡 {t("tips")}
            </h2>
            <ul className="text-sm print:text-xs text-muted-foreground print:text-gray-600 space-y-1 print:space-y-0.5">
              <li>• {t("tip1")}</li>
              <li>• {t("tip2")}</li>
              <li>• {t("tip3")}</li>
              <li>• {t("tip4")}</li>
              <li>• {t("tip5")}</li>
            </ul>
          </div>

          {/* Dichotomous Key Steps */}
          <div className="space-y-6 print:space-y-3 mb-8 print:mb-4">
            {keySteps.map((step) => (
              <div
                key={step.id}
                className="border-2 border-primary/20 print:border-gray-400 rounded-xl print:rounded-lg p-5 print:p-3 break-inside-avoid"
              >
                <h3 className="text-lg print:text-base font-bold text-primary print:text-black mb-3 print:mb-2">
                  {t("step")} {step.id}: {step.question[locale as "en" | "es"]}
                </h3>
                <div className="space-y-2 print:space-y-1">
                  {step.options.map((option, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 print:gap-2 bg-muted/50 print:bg-gray-50 rounded-lg p-3 print:p-2"
                    >
                      <span className="text-lg print:text-base font-bold text-primary/60 print:text-gray-500">
                        {String.fromCharCode(97 + idx)})
                      </span>
                      <div className="flex-1">
                        <p className="text-foreground print:text-black print:text-sm">
                          {option.text[locale as "en" | "es"]}
                        </p>
                        <p className="text-sm print:text-xs text-primary print:text-gray-700 font-semibold mt-1">
                          {option.goTo
                            ? `→ ${t("goTo")} ${t("step")} ${option.goTo}`
                            : `→ ${resultGroups[option.result!]?.title[locale as "en" | "es"] || option.result}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Result Groups */}
          <div className="print:break-before-page">
            <h2 className="text-2xl print:text-lg font-bold text-foreground print:text-black mb-6 print:mb-3 border-b-2 border-primary print:border-gray-800 pb-2">
              📋 {t("examples")}
            </h2>
            <div className="grid md:grid-cols-2 gap-4 print:gap-2 print:grid-cols-2">
              {Object.entries(resultGroups).map(([key, group]) => {
                if (group.trees.length === 0) return null;
                return (
                  <div
                    key={key}
                    className="bg-card border border-border print:border-gray-300 rounded-lg p-4 print:p-2 break-inside-avoid"
                  >
                    <h3 className="font-bold text-primary print:text-black text-sm print:text-xs mb-2 print:mb-1">
                      {group.title[locale as "en" | "es"]}
                    </h3>
                    <ul className="text-sm print:text-[8pt] text-muted-foreground print:text-gray-600 space-y-0.5">
                      {group.trees.slice(0, 4).map((tree) => (
                        <li key={tree.slug}>
                          • {tree.title}{" "}
                          <span className="italic">
                            ({tree.scientificName.split(" ")[0]})
                          </span>
                        </li>
                      ))}
                      {group.trees.length > 4 && (
                        <li className="italic text-muted-foreground/60">
                          + {group.trees.length - 4} more...
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-border print:border-gray-300 print:mt-4 print:pt-2">
            <div className="flex justify-between text-sm text-muted-foreground print:text-gray-500 print:text-xs">
              <span>
                {trees.length} {t("species")}
              </span>
              <span>costaricatreeatlas.com</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
