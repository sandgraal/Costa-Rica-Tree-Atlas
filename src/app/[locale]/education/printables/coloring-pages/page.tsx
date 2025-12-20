import { setRequestLocale } from "next-intl/server";
import { allTrees } from "contentlayer/generated";
import type { Metadata } from "next";
import { Link } from "@i18n/navigation";
import { ColoringPagesClient } from "./ColoringPagesClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title:
      locale === "es"
        ? "Páginas para Colorear - Atlas de Árboles de Costa Rica"
        : "Coloring Pages - Costa Rica Tree Atlas",
    description:
      locale === "es"
        ? "Descarga páginas para colorear de árboles de Costa Rica. Perfecto para actividades educativas."
        : "Download coloring pages of Costa Rica trees. Perfect for educational activities.",
    alternates: {
      languages: {
        en: "/en/education/printables/coloring-pages",
        es: "/es/education/printables/coloring-pages",
      },
    },
  };
}

export default async function ColoringPagesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Get trees with featured images for coloring pages
  const trees = allTrees
    .filter((t) => t.locale === locale && t.featuredImage)
    .sort((a, b) => a.title.localeCompare(b.title, locale))
    .slice(0, 24); // Limit to 24 trees for coloring pages

  const t = {
    title: locale === "es" ? "Páginas para Colorear" : "Coloring Pages",
    subtitle:
      locale === "es"
        ? "Atlas de Árboles de Costa Rica"
        : "Costa Rica Tree Atlas",
    instructions:
      locale === "es"
        ? "Imprime y colorea los árboles. Aprende sus nombres mientras te diviertes."
        : "Print and color the trees. Learn their names while having fun.",
    printButton: locale === "es" ? "🖨️ Imprimir" : "🖨️ Print",
    printAll: locale === "es" ? "Imprimir Todo" : "Print All",
    backLink: locale === "es" ? "← Volver" : "← Back",
    colorMe: locale === "es" ? "¡Coloréame!" : "Color me!",
    family: locale === "es" ? "Familia" : "Family",
    selectAll: locale === "es" ? "Seleccionar Todo" : "Select All",
    deselectAll: locale === "es" ? "Deseleccionar Todo" : "Deselect All",
    selected: locale === "es" ? "seleccionadas" : "selected",
    printSelected:
      locale === "es" ? "Imprimir Seleccionadas" : "Print Selected",
    tip:
      locale === "es"
        ? "💡 Consejo: Usa colores realistas o tu imaginación. ¡Ambos están bien!"
        : "💡 Tip: Use realistic colors or your imagination. Both are great!",
  };

  return (
    <>
      {/* Screen header - hidden when printing */}
      <div className="print:hidden py-8 px-4 bg-muted">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/education/printables"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          >
            {t.backLink}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-muted-foreground">{t.instructions}</p>
          </div>
        </div>
      </div>

      <ColoringPagesClient trees={trees} locale={locale} t={t} />
    </>
  );
}
