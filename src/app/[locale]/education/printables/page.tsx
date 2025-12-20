import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Recursos Imprimibles - Atlas de Árboles de Costa Rica"
        : "Printable Resources - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Descarga e imprime materiales educativos sobre los árboles de Costa Rica."
        : "Download and print educational materials about Costa Rica trees.",
    alternates: {
      languages: {
        en: "/en/education/printables",
        es: "/es/education/printables",
      },
    },
  };
}

export default async function PrintablesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const trees = allTrees.filter((t) => t.locale === locale);
  const families = [...new Set(trees.map((t) => t.family))].sort();

  const t = {
    title: locale === "es" ? "Recursos Imprimibles" : "Printable Resources",
    subtitle:
      locale === "es"
        ? "Materiales educativos gratuitos para descargar e imprimir"
        : "Free educational materials to download and print",
    backToEducation:
      locale === "es"
        ? "← Volver a Recursos Educativos"
        : "← Back to Education",
    speciesChecklist:
      locale === "es" ? "Lista de Especies" : "Species Checklist",
    speciesChecklistDesc:
      locale === "es"
        ? "Lista completa de todas las especies del atlas para verificar durante excursiones."
        : "Complete checklist of all atlas species for field trip verification.",
    flashcards: locale === "es" ? "Tarjetas de Estudio" : "Study Flashcards",
    flashcardsDesc:
      locale === "es"
        ? "Tarjetas con imágenes y datos clave de cada especie para memorización."
        : "Cards with images and key facts for each species to aid memorization.",
    familyGuide:
      locale === "es" ? "Guía de Familias Botánicas" : "Botanical Family Guide",
    familyGuideDesc:
      locale === "es"
        ? "Referencia rápida de familias botánicas con especies representativas."
        : "Quick reference of botanical families with representative species.",
    identificationKey:
      locale === "es" ? "Clave de Identificación" : "Identification Key",
    identificationKeyDesc:
      locale === "es"
        ? "Guía paso a paso para identificar árboles por sus características."
        : "Step-by-step guide to identify trees by their characteristics.",
    viewPrint: locale === "es" ? "Ver e Imprimir" : "View & Print",
    species: locale === "es" ? "especies" : "species",
    families: locale === "es" ? "familias" : "families",
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back link */}
        <Link
          href="/education"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          {t.backToEducation}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
            <span className="text-4xl" role="img" aria-hidden="true">
              🖨️
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {trees.length}
            </div>
            <div className="text-sm text-muted-foreground">{t.species}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {families.length}
            </div>
            <div className="text-sm text-muted-foreground">{t.families}</div>
          </div>
        </div>

        {/* Printables Grid */}
        <div className="grid gap-6">
          {/* Species Checklist */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">✅</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t.speciesChecklist}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t.speciesChecklistDesc}
                </p>
                <Link
                  href="/education/printables/checklist"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t.viewPrint}
                </Link>
              </div>
            </div>
          </div>

          {/* Flashcards */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">🃏</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t.flashcards}
                </h2>
                <p className="text-muted-foreground mb-4">{t.flashcardsDesc}</p>
                <Link
                  href="/education/printables/flashcards"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t.viewPrint}
                </Link>
              </div>
            </div>
          </div>

          {/* Family Guide */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">🌳</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t.familyGuide}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t.familyGuideDesc}
                </p>
                <Link
                  href="/education/printables/families"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t.viewPrint}
                </Link>
              </div>
            </div>
          </div>

          {/* Identification Key */}
          <div className="bg-card rounded-2xl border border-border p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">🔑</div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {t.identificationKey}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {t.identificationKeyDesc}
                </p>
                <Link
                  href="/education/printables/identification-key"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <span>📄</span>
                  {t.viewPrint}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Print Tips */}
        <div className="mt-12 bg-primary/5 rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-3">
            {locale === "es" ? "💡 Consejos de Impresión" : "💡 Printing Tips"}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>
              •{" "}
              {locale === "es"
                ? "Use papel de buena calidad para mejores resultados"
                : "Use good quality paper for best results"}
            </li>
            <li>
              •{" "}
              {locale === "es"
                ? "Imprima a color cuando sea posible para las imágenes"
                : "Print in color when possible for images"}
            </li>
            <li>
              •{" "}
              {locale === "es"
                ? "Plastifique las tarjetas para mayor durabilidad en campo"
                : "Laminate cards for field durability"}
            </li>
            <li>
              •{" "}
              {locale === "es"
                ? "Use Ctrl/Cmd + P para abrir el diálogo de impresión"
                : "Use Ctrl/Cmd + P to open print dialog"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
