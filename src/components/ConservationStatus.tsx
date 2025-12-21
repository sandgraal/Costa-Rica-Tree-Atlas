"use client";

import {
  IUCN_CATEGORIES,
  POPULATION_TRENDS,
  getIUCNLabels,
  getUILabel,
} from "@/lib/i18n";
import type { PopulationTrend } from "@/types/tree";

// Category descriptions for tooltips (bilingual)
const CATEGORY_DESCRIPTIONS: Record<string, { en: string; es: string }> = {
  NE: {
    en: "Not Evaluated - Has not yet been evaluated against the criteria",
    es: "No Evaluado - Aún no ha sido evaluado según los criterios",
  },
  DD: {
    en: "Data Deficient - Not enough data to assess extinction risk",
    es: "Datos Insuficientes - No hay suficientes datos para evaluar el riesgo",
  },
  LC: {
    en: "Least Concern - Low risk of extinction in the wild",
    es: "Preocupación Menor - Bajo riesgo de extinción en estado silvestre",
  },
  NT: {
    en: "Near Threatened - Close to qualifying for a threatened category",
    es: "Casi Amenazado - Próximo a calificar para una categoría amenazada",
  },
  VU: {
    en: "Vulnerable - High risk of endangerment in the wild",
    es: "Vulnerable - Alto riesgo de peligro en estado silvestre",
  },
  EN: {
    en: "Endangered - High risk of extinction in the wild",
    es: "En Peligro - Alto riesgo de extinción en estado silvestre",
  },
  CR: {
    en: "Critically Endangered - Extremely high risk of extinction",
    es: "En Peligro Crítico - Riesgo extremadamente alto de extinción",
  },
  EW: {
    en: "Extinct in the Wild - Only survives in captivity or cultivation",
    es: "Extinto en Estado Silvestre - Solo sobrevive en cautiverio o cultivo",
  },
  EX: {
    en: "Extinct - No known living individuals remaining",
    es: "Extinto - No quedan individuos vivos conocidos",
  },
};

interface ConservationStatusProps {
  category: string;
  populationTrend?: string;
  assessmentDate?: string;
  iucnUrl?: string;
  locale: string;
  compact?: boolean;
}

export function ConservationStatus({
  category,
  populationTrend,
  assessmentDate,
  iucnUrl,
  locale,
  compact = false,
}: ConservationStatusProps) {
  const labels = getIUCNLabels(locale);
  const categoryData = IUCN_CATEGORIES[category] || IUCN_CATEGORIES["NE"];
  const trend = (populationTrend || "unknown") as PopulationTrend;
  const trendData = POPULATION_TRENDS[trend] || POPULATION_TRENDS.unknown;
  const localizedCategory = labels.categories[category] || categoryData.name;

  // Get localized trend label
  const getTrendLabel = (trend: string): string => {
    switch (trend) {
      case "decreasing":
        return labels.decreasing;
      case "stable":
        return labels.stable;
      case "increasing":
        return labels.increasing;
      default:
        return labels.unknown;
    }
  };

  // Determine text color based on background for contrast
  const getTextColor = (bgColor: string): string => {
    // Dark backgrounds need light text
    const darkColors = ["#000000", "#542344", "#D81E05"];
    if (darkColors.includes(bgColor)) {
      return "#FFFFFF";
    }
    // Light backgrounds need dark text
    return "#1a1a1a";
  };

  // Get tooltip description for category
  const getCategoryTooltip = (cat: string): string => {
    const desc = CATEGORY_DESCRIPTIONS[cat];
    return desc ? desc[locale as "en" | "es"] || desc.en : localizedCategory;
  };

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-help"
        style={{
          backgroundColor: categoryData.color,
          color: getTextColor(categoryData.color),
        }}
        title={getCategoryTooltip(category)}
      >
        {category}
        {populationTrend && populationTrend !== "unknown" && (
          <span className="opacity-75">{trendData.icon}</span>
        )}
      </span>
    );
  }

  return (
    <div className="bg-muted rounded-xl p-5">
      <h3 className="text-sm font-semibold text-primary-dark dark:text-primary-light mb-3 flex items-center gap-2">
        <ShieldIcon className="h-4 w-4" />
        {labels.conservationStatus}
      </h3>

      <div className="flex flex-wrap items-center gap-4">
        {/* IUCN Category Badge */}
        <div className="flex items-center gap-3">
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-sm cursor-help"
            style={{
              backgroundColor: categoryData.color,
              color: getTextColor(categoryData.color),
            }}
            title={getCategoryTooltip(category)}
          >
            {category}
          </span>
          <div>
            <p className="font-medium text-foreground">{localizedCategory}</p>
            <p className="text-xs text-muted-foreground">IUCN Red List</p>
          </div>
        </div>

        {/* Population Trend - only show if known */}
        {populationTrend && populationTrend !== "unknown" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg">
            <span
              className={`text-lg ${
                populationTrend === "decreasing"
                  ? "text-red-500"
                  : populationTrend === "increasing"
                    ? "text-green-500"
                    : populationTrend === "stable"
                      ? "text-blue-500"
                      : "text-gray-500"
              }`}
            >
              {trendData.icon}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">
                {getTrendLabel(populationTrend)}
              </p>
              <p className="text-xs text-muted-foreground">
                {labels.populationTrend}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with link and assessment date */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-border">
        {assessmentDate && (
          <p className="text-xs text-muted-foreground">
            {labels.assessedBy}: IUCN{" "}
            {new Date(assessmentDate).getFullYear() || ""}
          </p>
        )}
        {iucnUrl && (
          <a
            href={iucnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#D81E05]/10 text-[#D81E05] hover:bg-[#D81E05]/20 rounded-full transition-colors"
          >
            <IUCNIcon className="h-3.5 w-3.5" />
            {labels.viewOn} {labels.iucnRedList}
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// Conservation Status Scale visualization component
export function ConservationScale({
  currentCategory,
  locale,
}: {
  currentCategory: string;
  locale: string;
}) {
  const labels = getIUCNLabels(locale);
  // Show only the main threat categories for visual scale (LC to EX)
  const scaleCategories = ["LC", "NT", "VU", "EN", "CR", "EW", "EX"];

  const getTooltip = (cat: string): string => {
    const desc = CATEGORY_DESCRIPTIONS[cat];
    return desc
      ? desc[locale as "en" | "es"] || desc.en
      : labels.categories[cat];
  };

  return (
    <div className="mt-4">
      {/* Scale bar with segments */}
      <div className="flex items-stretch h-8 rounded-lg overflow-hidden">
        {scaleCategories.map((cat) => {
          const catData = IUCN_CATEGORIES[cat];
          const isCurrent = cat === currentCategory;
          const textColor = ["EX", "EW", "CR"].includes(cat)
            ? "#FFFFFF"
            : "#1a1a1a";
          return (
            <div
              key={cat}
              className={`flex-1 relative flex items-center justify-center cursor-help transition-all ${
                isCurrent
                  ? "ring-2 ring-foreground ring-offset-2 z-10 scale-105"
                  : "hover:opacity-90"
              }`}
              style={{ backgroundColor: catData.color }}
              title={getTooltip(cat)}
            >
              <span
                className="text-[10px] font-bold"
                style={{ color: textColor }}
              >
                {cat}
              </span>
            </div>
          );
        })}
      </div>
      {/* Labels below scale */}
      <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
        <span>{getUILabel("lowerRisk", locale as "en" | "es")}</span>
        <span>{getUILabel("higherRisk", locale as "en" | "es")}</span>
      </div>
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
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
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
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
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function IUCNIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2v-2zm0-2h2V7h-2v7z" />
    </svg>
  );
}
