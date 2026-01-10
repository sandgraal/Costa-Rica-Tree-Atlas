"use client";

import { useMemo, useState } from "react";
import { Link } from "@i18n/navigation";
import { SafetyIcon, SafetyBadge } from "@/components/safety";
import type { Tree as ContentlayerTree } from "contentlayer/generated";
import type { Locale, ToxicityLevel } from "@/types";

interface SafetyPageClientProps {
  trees: ContentlayerTree[];
  locale: Locale;
}

type SafetyCategory = "all" | "severe" | "high" | "moderate" | "low" | "none";

export function SafetyPageClient({ trees, locale }: SafetyPageClientProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<SafetyCategory>("all");

  // Group trees by toxicity level
  const treesByToxicity = useMemo(() => {
    const groups: Record<string, ContentlayerTree[]> = {
      severe: [],
      high: [],
      moderate: [],
      low: [],
      none: [],
      unknown: [],
    };

    trees.forEach((tree) => {
      const level = tree.toxicityLevel || "unknown";
      if (groups[level]) {
        groups[level].push(tree);
      } else {
        groups.unknown.push(tree);
      }
    });

    // Sort trees within each group by title
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.title.localeCompare(b.title));
    });

    return groups;
  }, [trees]);

  // Filter trees based on selected category
  const displayTrees = useMemo(() => {
    if (selectedCategory === "all") {
      return trees;
    }
    return treesByToxicity[selectedCategory] || [];
  }, [selectedCategory, trees, treesByToxicity]);

  const t = {
    title:
      locale === "es" ? "Guía de Seguridad de Árboles" : "Tree Safety Guide",
    subtitle:
      locale === "es"
        ? "Información esencial sobre la seguridad de los árboles de Costa Rica"
        : "Essential safety information about Costa Rican trees",
    disclaimer:
      locale === "es"
        ? "Esta información es solo para referencia educativa. Siempre consulte a profesionales médicos o forestales para asesoramiento específico."
        : "This information is for educational reference only. Always consult medical or forestry professionals for specific advice.",
    emergencyTitle:
      locale === "es" ? "Contactos de Emergencia" : "Emergency Contacts",
    poisonControl:
      locale === "es" ? "Control de Envenenamientos" : "Poison Control",
    emergency:
      locale === "es" ? "Servicios de Emergencia" : "Emergency Services",
    insurance:
      locale === "es"
        ? "Instituto Nacional de Seguros"
        : "National Insurance Institute",
    firstAidTitle:
      locale === "es"
        ? "Procedimientos de Primeros Auxilios"
        : "First Aid Procedures",
    ingestionTitle: locale === "es" ? "En caso de ingestión:" : "If ingested:",
    ingestionSteps:
      locale === "es"
        ? [
            "NO induzca el vómito a menos que lo indique un profesional médico",
            "Enjuague la boca con agua",
            "Llame inmediatamente a Control de Envenenamientos (2223-1028)",
            "Tenga la planta o sus partes listas para identificación",
            "Busque atención médica inmediata",
          ]
        : [
            "DO NOT induce vomiting unless directed by medical professional",
            "Rinse mouth with water",
            "Call Poison Control immediately (2223-1028)",
            "Have plant or plant parts ready for identification",
            "Seek immediate medical attention",
          ],
    skinContactTitle:
      locale === "es"
        ? "En caso de contacto con la piel:"
        : "If skin contact occurs:",
    skinContactSteps:
      locale === "es"
        ? [
            "Retire inmediatamente la ropa contaminada",
            "Lave el área afectada con agua y jabón abundantes durante al menos 15 minutos",
            "NO frote el área",
            "Aplique compresas frías si hay irritación",
            "Busque atención médica si los síntomas persisten o empeoran",
          ]
        : [
            "Remove contaminated clothing immediately",
            "Wash affected area with plenty of soap and water for at least 15 minutes",
            "DO NOT rub the area",
            "Apply cold compresses if irritation occurs",
            "Seek medical attention if symptoms persist or worsen",
          ],
    eyeContactTitle:
      locale === "es"
        ? "En caso de contacto con los ojos:"
        : "If eye contact occurs:",
    eyeContactSteps:
      locale === "es"
        ? [
            "Enjuague inmediatamente con agua limpia durante al menos 15 minutos",
            "Mantenga los párpados abiertos durante el enjuague",
            "Retire los lentes de contacto si es posible",
            "NO frote los ojos",
            "Busque atención médica inmediata",
          ]
        : [
            "Rinse immediately with clean water for at least 15 minutes",
            "Keep eyelids open during rinsing",
            "Remove contact lenses if possible",
            "DO NOT rub eyes",
            "Seek immediate medical attention",
          ],
    categoriesTitle:
      locale === "es"
        ? "Filtrar por Nivel de Toxicidad"
        : "Filter by Toxicity Level",
    allTrees: locale === "es" ? "Todos los árboles" : "All trees",
    severeToxicity: locale === "es" ? "Toxicidad Severa" : "Severe Toxicity",
    highToxicity: locale === "es" ? "Toxicidad Alta" : "High Toxicity",
    moderateToxicity:
      locale === "es" ? "Toxicidad Moderada" : "Moderate Toxicity",
    lowToxicity: locale === "es" ? "Toxicidad Baja" : "Low Toxicity",
    nonToxic: locale === "es" ? "No Tóxico" : "Non-Toxic",
    treeCount: (count: number) =>
      locale === "es" ? `${count} árboles` : `${count} trees`,
    safetyWarning:
      locale === "es"
        ? "⚠️ Advertencia: Algunos árboles de Costa Rica son extremadamente peligrosos"
        : "⚠️ Warning: Some Costa Rican trees are extremely dangerous",
    printButton: locale === "es" ? "Imprimir esta guía" : "Print this guide",
  };

  const categories: Array<{
    value: SafetyCategory;
    label: string;
    color: string;
  }> = [
    { value: "all", label: t.allTrees, color: "bg-gray-500" },
    { value: "severe", label: t.severeToxicity, color: "bg-red-600" },
    { value: "moderate", label: t.moderateToxicity, color: "bg-orange-500" },
    { value: "low", label: t.lowToxicity, color: "bg-yellow-500" },
    { value: "none", label: t.nonToxic, color: "bg-green-600" },
  ];

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">{t.subtitle}</p>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-900 dark:text-yellow-200">
              <strong>{t.safetyWarning}</strong>
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-2">
              {t.disclaimer}
            </p>
          </div>
        </div>

        {/* Print button */}
        <div className="mb-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            🖨️ {t.printButton}
          </button>
        </div>

        {/* Emergency Contacts */}
        <section className="mb-12 bg-card rounded-xl p-6 border border-border print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t.emergencyTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-semibold text-red-900 dark:text-red-200">
                {t.poisonControl}
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                2223-1028
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {locale === "es" ? "24/7 disponible" : "24/7 available"}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-blue-900 dark:text-blue-200">
                {t.emergency}
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                911
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {locale === "es"
                  ? "Policía, Bomberos, Ambulancia"
                  : "Police, Fire, Ambulance"}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="font-semibold text-green-900 dark:text-green-200">
                {t.insurance}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                800-8000-911
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">INS</p>
            </div>
          </div>
        </section>

        {/* First Aid Procedures */}
        <section className="mb-12 bg-card rounded-xl p-6 border border-border print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t.firstAidTitle}
          </h2>

          {/* Ingestion */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t.ingestionTitle}
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {t.ingestionSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Skin Contact */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t.skinContactTitle}
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {t.skinContactSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Eye Contact */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t.eyeContactTitle}
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              {t.eyeContactSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        {/* Category filters */}
        <div className="mb-6 print:hidden">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t.categoriesTitle}
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count =
                cat.value === "all"
                  ? trees.length
                  : treesByToxicity[cat.value]?.length || 0;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.value
                      ? `${cat.color} text-white`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Trees list */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {selectedCategory === "all"
              ? t.treeCount(displayTrees.length)
              : `${categories.find((c) => c.value === selectedCategory)?.label} - ${t.treeCount(displayTrees.length)}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayTrees.map((tree) => (
              <Link
                key={tree.slug}
                href={`/trees/${tree.slug}`}
                className="block p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-all hover:shadow-md print:break-inside-avoid"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <SafetyIcon
                      toxicityLevel={tree.toxicityLevel as ToxicityLevel}
                      skinContactRisk={tree.skinContactRisk}
                      childSafe={tree.childSafe}
                      petSafe={tree.petSafe}
                      className="text-3xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {tree.title}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      {tree.scientificName}
                    </p>
                    {tree.toxicityLevel && (
                      <SafetyBadge
                        level={tree.toxicityLevel as ToxicityLevel}
                        className="mt-2"
                      />
                    )}
                    {tree.toxicityDetails && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {tree.toxicityDetails}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {displayTrees.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              {locale === "es"
                ? "No se encontraron árboles en esta categoría."
                : "No trees found in this category."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
