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
        ? "Lista de Especies Imprimible - Atlas de Árboles de Costa Rica"
        : "Printable Species Checklist - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Lista verificable de todas las especies de árboles en el atlas."
        : "Checkable list of all tree species in the atlas.",
  };
}

export default async function ChecklistPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees
    .filter((t) => t.locale === locale)
    .sort((a, b) => a.title.localeCompare(b.title, locale));

  const families = [...new Set(trees.map((t) => t.family))].sort();
  const treesByFamily = families.map((family) => ({
    family,
    trees: trees.filter((t) => t.family === family),
  }));

  const t = {
    title: locale === "es" ? "Lista de Especies" : "Species Checklist",
    subtitle:
      locale === "es"
        ? "Atlas de Árboles de Costa Rica"
        : "Costa Rica Tree Atlas",
    instructions:
      locale === "es"
        ? "Marca las especies que observes durante tu excursión"
        : "Check off species as you observe them during your field trip",
    printButton: locale === "es" ? "🖨️ Imprimir" : "🖨️ Print",
    backLink: locale === "es" ? "← Volver" : "← Back",
    species: locale === "es" ? "especies" : "species",
    date: locale === "es" ? "Fecha" : "Date",
    location: locale === "es" ? "Ubicación" : "Location",
    observer: locale === "es" ? "Observador" : "Observer",
    notes: locale === "es" ? "Notas" : "Notes",
    totalSpecies: locale === "es" ? "Total de especies" : "Total species",
  };

  return (
    <>
      {/* Screen header - hidden when printing */}
      <div className="print:hidden py-8 px-4 bg-muted">
        <div className="container mx-auto max-w-4xl">
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
      <div className="print-checklist px-4 py-8 print:py-0 print:px-0">
        <div className="container mx-auto max-w-4xl print:max-w-none">
          {/* Print header */}
          <div className="text-center mb-8 print:mb-6">
            <h1 className="text-3xl font-bold text-primary print:text-black print:text-2xl">
              🌳 {t.title}
            </h1>
            <p className="text-lg text-muted-foreground print:text-gray-600 print:text-base">
              {t.subtitle}
            </p>
            <p className="text-sm text-muted-foreground mt-2 print:text-gray-500">
              {trees.length} {t.species} • {families.length}{" "}
              {locale === "es" ? "familias" : "families"}
            </p>
          </div>

          {/* Field info section */}
          <div className="grid grid-cols-2 gap-4 mb-8 print:mb-6 print:gap-3">
            <div className="border border-border print:border-gray-300 rounded-lg p-3 print:p-2">
              <span className="text-xs text-muted-foreground print:text-gray-500 block mb-1">
                {t.date}
              </span>
              <div className="h-6 border-b border-dashed border-border print:border-gray-400"></div>
            </div>
            <div className="border border-border print:border-gray-300 rounded-lg p-3 print:p-2">
              <span className="text-xs text-muted-foreground print:text-gray-500 block mb-1">
                {t.location}
              </span>
              <div className="h-6 border-b border-dashed border-border print:border-gray-400"></div>
            </div>
            <div className="border border-border print:border-gray-300 rounded-lg p-3 print:p-2">
              <span className="text-xs text-muted-foreground print:text-gray-500 block mb-1">
                {t.observer}
              </span>
              <div className="h-6 border-b border-dashed border-border print:border-gray-400"></div>
            </div>
            <div className="border border-border print:border-gray-300 rounded-lg p-3 print:p-2">
              <span className="text-xs text-muted-foreground print:text-gray-500 block mb-1">
                {t.notes}
              </span>
              <div className="h-6 border-b border-dashed border-border print:border-gray-400"></div>
            </div>
          </div>

          {/* Species list by family */}
          <div className="space-y-6 print:space-y-4">
            {treesByFamily.map(({ family, trees: familyTrees }) => (
              <div key={family} className="break-inside-avoid">
                <h2 className="text-lg font-semibold text-primary print:text-black border-b-2 border-primary print:border-gray-800 pb-1 mb-3 print:text-base print:mb-2">
                  {family}{" "}
                  <span className="text-sm font-normal text-muted-foreground print:text-gray-500">
                    ({familyTrees.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-6 gap-y-1 print:gap-y-0.5">
                  {familyTrees.map((tree) => (
                    <div
                      key={tree.slug}
                      className="flex items-start gap-2 py-1 print:py-0.5"
                    >
                      <span className="mt-1 h-4 w-4 print:h-3 print:w-3 border border-border print:border-gray-400 rounded shrink-0"></span>
                      <span className="flex-1">
                        <span className="text-foreground print:text-black print:text-sm">
                          {tree.title}
                        </span>
                        <span className="text-xs text-muted-foreground print:text-gray-500 block italic">
                          {tree.scientificName}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary footer */}
          <div className="mt-8 pt-4 border-t border-border print:border-gray-300 print:mt-6">
            <div className="flex justify-between text-sm text-muted-foreground print:text-gray-600">
              <span>
                {t.totalSpecies}: _____ / {trees.length}
              </span>
              <span>costaricatreeatlas.com</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
