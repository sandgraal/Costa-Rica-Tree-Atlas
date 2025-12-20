"use client";

import { useState, useMemo } from "react";
import {
  PROVINCES,
  MAP_VIEWBOX,
  COUNTRY_OUTLINE,
  NEIGHBORS,
  expandDistribution,
  getDistributionName,
} from "@/lib/geo";
import { getUILabel } from "@/lib/i18n";
import type { Distribution, Locale, Province } from "@/types/tree";

// ============================================================================
// Types
// ============================================================================

interface DistributionMapProps {
  distribution?: string[] | Distribution[];
  elevation?: string;
  locale: Locale;
  interactive?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function DistributionMap({
  distribution = [],
  elevation,
  locale,
  interactive = true,
}: DistributionMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);

  const expandedDistribution = useMemo(
    () => expandDistribution((distribution || []) as Distribution[]),
    [distribution]
  );

  const hasDistribution = expandedDistribution.length > 0;

  const labels = {
    title:
      locale === "es"
        ? "Distribución en Costa Rica"
        : "Distribution in Costa Rica",
    elevation: getUILabel("elevation", locale),
    present: getUILabel("present", locale),
    notRecorded: getUILabel("notRecorded", locale),
  };

  if (!hasDistribution && !elevation) {
    return null;
  }

  return (
    <div className="bg-muted rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-2">
        <MapPinIcon className="h-5 w-5" />
        {labels.title}
      </h3>

      <div className="flex flex-col md:flex-row gap-6">
        {/* SVG Map */}
        <div className="flex-1 min-w-0">
          <svg
            viewBox={MAP_VIEWBOX}
            className="w-full h-auto max-h-64"
            role="img"
            aria-label={labels.title}
          >
            {/* Water background */}
            <rect
              x="0"
              y="0"
              width="360"
              height="280"
              fill="currentColor"
              className="text-blue-100 dark:text-blue-900/30"
            />

            {/* Country outline */}
            <path
              d={COUNTRY_OUTLINE}
              className="text-gray-200 dark:text-gray-700 stroke-gray-300 dark:stroke-gray-600"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Province shapes */}
            {Object.entries(PROVINCES).map(([key, province]) => {
              const isHighlighted = expandedDistribution.includes(
                key as Province
              );
              const isHovered = hoveredProvince === key;

              return (
                <g key={key}>
                  <path
                    d={province.path}
                    className="stroke-gray-400 dark:stroke-gray-500 cursor-pointer"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{
                      fill: isHighlighted
                        ? isHovered
                          ? "rgb(45, 90, 39)"
                          : "rgba(45, 90, 39, 0.4)"
                        : isHovered
                          ? "rgba(156, 163, 175, 0.3)"
                          : "transparent",
                      transition: "fill 0.2s ease-in-out",
                    }}
                    onMouseEnter={() =>
                      interactive && setHoveredProvince(key as Province)
                    }
                    onMouseLeave={() => interactive && setHoveredProvince(null)}
                    tabIndex={interactive ? 0 : -1}
                    role={interactive ? "button" : undefined}
                    aria-label={`${province.name[locale]}: ${isHighlighted ? labels.present : labels.notRecorded}`}
                  />
                  {/* Province labels */}
                  <text
                    x={province.center.x}
                    y={province.center.y}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="500"
                    fill="currentColor"
                    className="text-gray-600 dark:text-gray-300 pointer-events-none select-none"
                  >
                    {province.name[locale]}
                  </text>
                </g>
              );
            })}

            {/* Neighbor labels */}
            {Object.entries(NEIGHBORS).map(([key, neighbor]) => (
              <text
                key={key}
                x={neighbor.label.x}
                y={neighbor.label.y}
                textAnchor="middle"
                fontSize="9"
                fill="currentColor"
                className="text-gray-400 dark:text-gray-500 pointer-events-none select-none italic"
              >
                {neighbor.name[locale]}
              </text>
            ))}
          </svg>
        </div>

        {/* Legend and info */}
        <div className="md:w-48 space-y-4">
          {/* Legend */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              {locale === "es" ? "Leyenda" : "Legend"}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[rgba(45,90,39,0.4)] border border-gray-400" />
                <span className="text-sm">{labels.present}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-transparent border border-gray-400" />
                <span className="text-sm">{labels.notRecorded}</span>
              </div>
            </div>
          </div>

          {/* Elevation */}
          {elevation && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {labels.elevation}
              </h4>
              <p className="text-sm font-medium">{elevation}</p>
            </div>
          )}

          {/* Hovered province info */}
          {hoveredProvince && (
            <div className="p-3 bg-background rounded-lg border border-border">
              <p className="font-medium">
                {PROVINCES[hoveredProvince].name[locale]}
              </p>
              <p className="text-sm text-muted-foreground">
                {expandedDistribution.includes(hoveredProvince)
                  ? labels.present
                  : labels.notRecorded}
              </p>
            </div>
          )}

          {/* Distribution list */}
          {distribution.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                {locale === "es" ? "Regiones" : "Regions"}
              </h4>
              <ul className="text-sm space-y-1">
                {distribution.map((dist) => (
                  <li key={dist} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {getDistributionName(dist as Distribution, locale)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function MapPinIcon({ className }: { className?: string }) {
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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
