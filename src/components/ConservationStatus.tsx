"use client";

import {
  IUCN_CATEGORIES,
  POPULATION_TRENDS,
  getIUCNLabels,
  getUILabel,
} from "@/lib/i18n";
import type { PopulationTrend } from "@/types/tree";

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

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
        style={{
          backgroundColor: categoryData.color,
          color: getTextColor(categoryData.color),
        }}
        title={`${labels.conservationStatus}: ${localizedCategory}`}
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
            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-sm"
            style={{
              backgroundColor: categoryData.color,
              color: getTextColor(categoryData.color),
            }}
          >
            {category}
          </span>
          <div>
            <p className="font-medium text-foreground">{localizedCategory}</p>
            <p className="text-xs text-muted-foreground">IUCN Red List</p>
          </div>
        </div>

        {/* Population Trend */}
        {populationTrend && (
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
  const categories = ["NE", "DD", "LC", "NT", "VU", "EN", "CR", "EW", "EX"];

  return (
    <div className="mt-4">
      <div className="flex items-stretch h-3 rounded-full overflow-hidden">
        {categories.map((cat) => {
          const catData = IUCN_CATEGORIES[cat];
          const isCurrent = cat === currentCategory;
          return (
            <div
              key={cat}
              className={`flex-1 relative ${isCurrent ? "ring-2 ring-foreground ring-offset-1" : ""}`}
              style={{ backgroundColor: catData.color }}
              title={labels.categories[cat] || catData.name}
            >
              {isCurrent && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full shadow" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
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
