"use client";

import { Tree } from "contentlayer/generated";
import Image from "next/image";
import { QRCodeGenerator } from "./QRCodeGenerator";

interface FieldGuidePreviewProps {
  trees: Tree[];
  locale: string;
  onBack: () => void;
}

export function FieldGuidePreview({
  trees,
  locale,
  onBack,
}: FieldGuidePreviewProps) {
  const t = {
    title:
      locale === "es"
        ? "Mi Guía de Campo de Árboles de Costa Rica"
        : "My Costa Rica Tree Field Guide",
    backToSelection:
      locale === "es" ? "← Volver a Selección" : "← Back to Selection",
    print: locale === "es" ? "Imprimir Guía" : "Print Guide",
    export: locale === "es" ? "Exportar" : "Export",
    generated: locale === "es" ? "Generado desde" : "Generated from",
    site: "Costa Rica Tree Atlas",
    family: locale === "es" ? "Familia" : "Family",
    height: locale === "es" ? "Altura" : "Height",
    safetyLevel: locale === "es" ? "Nivel de Seguridad" : "Safety Level",
    conservationStatus:
      locale === "es" ? "Estado de Conservación" : "Conservation Status",
    identificationTips:
      locale === "es" ? "Tips de Identificación" : "Identification Tips",
    uses: locale === "es" ? "Usos" : "Uses",
    learnMore: locale === "es" ? "Más información" : "Learn more",
    safetyLevels: {
      none: locale === "es" ? "Seguro" : "Safe",
      low: locale === "es" ? "Bajo riesgo" : "Low risk",
      moderate: locale === "es" ? "Riesgo moderado" : "Moderate risk",
      severe: locale === "es" ? "Peligroso" : "Dangerous",
    },
    conservationLevels: {
      LC: locale === "es" ? "Preocupación menor" : "Least Concern",
      NT: locale === "es" ? "Casi amenazado" : "Near Threatened",
      VU: locale === "es" ? "Vulnerable" : "Vulnerable",
      EN: locale === "es" ? "En peligro" : "Endangered",
      CR: locale === "es" ? "En peligro crítico" : "Critically Endangered",
      EW:
        locale === "es" ? "Extinto en estado silvestre" : "Extinct in the Wild",
      EX: locale === "es" ? "Extinto" : "Extinct",
      DD: locale === "es" ? "Datos insuficientes" : "Data Deficient",
      NE: locale === "es" ? "No evaluado" : "Not Evaluated",
    },
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header - Hide on print */}
      <div className="no-print bg-gradient-to-r from-green-600 to-green-700 text-white py-6 px-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-green-100 transition-colors"
          >
            {t.backToSelection}
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-white text-green-700 font-semibold rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2"
          >
            <PrintIcon className="w-4 h-4" />
            {t.print}
          </button>
        </div>
      </div>

      {/* Print Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cover Page */}
        <div className="mb-12 text-center page-break-after print:mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-green-700 dark:text-green-500 mb-4">
            🌳 {t.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {trees.length} {locale === "es" ? "especies" : "species"}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            <p>
              {t.generated} {t.site}
            </p>
            <p className="mt-1">costaricatreeatlas.com</p>
            <p className="mt-1">
              {new Date().toLocaleDateString(
                locale === "es" ? "es-CR" : "en-US"
              )}
            </p>
          </div>
        </div>

        {/* Tree Entries */}
        {trees.map((tree, index) => (
          <article
            key={tree.slug}
            className="tree-detail mb-12 pb-8 border-b border-gray-200 dark:border-gray-700 print:mb-8 print:pb-6 page-break-inside-avoid"
          >
            {/* Tree Header */}
            <div className="mb-4">
              <div className="flex items-baseline gap-3 mb-2">
                <h2 className="text-3xl font-bold text-green-700 dark:text-green-500">
                  {tree.title}
                </h2>
                {tree.conservationStatus &&
                  tree.conservationStatus !== "LC" && (
                    <span className="conservation-status text-xs px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-medium">
                      {t.conservationLevels[
                        tree.conservationStatus as keyof typeof t.conservationLevels
                      ] || tree.conservationStatus}
                    </span>
                  )}
              </div>
              <p className="scientific-name text-xl text-gray-600 dark:text-gray-400 mb-1">
                {tree.scientificName}
              </p>
              <p className="family-badge inline-block text-sm text-gray-700 dark:text-gray-300 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded">
                {t.family}: {tree.family}
              </p>
            </div>

            {/* Featured Image */}
            {tree.featuredImage && (
              <div className="my-4 relative h-64 md:h-80 featured-image overflow-hidden rounded-lg">
                <Image
                  src={tree.featuredImage}
                  alt={tree.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority={index < 3}
                />
              </div>
            )}

            {/* Quick Facts */}
            <div className="quick-facts grid grid-cols-1 md:grid-cols-2 gap-3 my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {tree.maxHeight && (
                <div>
                  <dt className="property-label text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {t.height}
                  </dt>
                  <dd className="property-value text-gray-900 dark:text-gray-100">
                    {tree.maxHeight}
                  </dd>
                </div>
              )}
              {tree.toxicityLevel && (
                <div>
                  <dt className="property-label text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {t.safetyLevel}
                  </dt>
                  <dd className="property-value text-gray-900 dark:text-gray-100">
                    {t.safetyLevels[
                      tree.toxicityLevel as keyof typeof t.safetyLevels
                    ] || tree.toxicityLevel}
                  </dd>
                </div>
              )}
              {tree.uses && tree.uses.length > 0 && (
                <div className="md:col-span-2">
                  <dt className="property-label text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {t.uses}
                  </dt>
                  <dd className="property-value text-gray-900 dark:text-gray-100">
                    {tree.uses.join(", ")}
                  </dd>
                </div>
              )}
            </div>

            {/* Description */}
            {tree.description && (
              <div className="my-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {tree.description}
                </p>
              </div>
            )}

            {/* QR Code - print only */}
            <div className="print-only mt-4 flex items-center gap-3">
              <div className="text-xs text-gray-600">
                <p className="font-semibold">{t.learnMore}:</p>
                <p>
                  costaricatreeatlas.com/{locale}/trees/{tree.slug}
                </p>
              </div>
              <QRCodeGenerator
                url={`https://costaricatreeatlas.com/${locale}/trees/${tree.slug}`}
                size={80}
              />
            </div>
          </article>
        ))}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-green-700 text-center text-sm text-gray-600 dark:text-gray-400 print:mt-8">
          <p className="font-semibold text-green-700 dark:text-green-500">
            {t.site}
          </p>
          <p className="mt-1">costaricatreeatlas.com</p>
          <p className="mt-2 text-xs">
            {t.generated}{" "}
            {new Date().toLocaleDateString(locale === "es" ? "es-CR" : "en-US")}
          </p>
        </div>
      </div>

      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: flex !important;
          }
          .page-break-after {
            page-break-after: always;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function PrintIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
