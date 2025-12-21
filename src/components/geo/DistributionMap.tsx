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
            {/* Gradient definitions */}
            <defs>
              {/* Water gradient */}
              <linearGradient
                id="waterGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient
                id="waterGradientDark"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#1e3a5f" />
                <stop offset="50%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>

              {/* Present province gradient */}
              <linearGradient
                id="presentGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="50%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#16a34a" />
              </linearGradient>
              <linearGradient
                id="presentHoverGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#16a34a" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>

              {/* Land texture gradient */}
              <linearGradient
                id="landGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f5f5f4" />
                <stop offset="100%" stopColor="#e7e5e4" />
              </linearGradient>
              <linearGradient
                id="landGradientDark"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#44403c" />
                <stop offset="100%" stopColor="#292524" />
              </linearGradient>

              {/* Drop shadow filter */}
              <filter
                id="dropShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="2"
                  dy="2"
                  stdDeviation="3"
                  floodOpacity="0.2"
                />
              </filter>
            </defs>

            {/* Water background */}
            <rect
              x="0"
              y="0"
              width="360"
              height="280"
              className="fill-[url(#waterGradient)] dark:fill-[url(#waterGradientDark)]"
            />

            {/* Country outline with shadow */}
            <path
              d={COUNTRY_OUTLINE}
              className="fill-[url(#landGradient)] dark:fill-[url(#landGradientDark)]"
              stroke="#78716c"
              strokeWidth="2.5"
              filter="url(#dropShadow)"
            />

            {/* Province shapes */}
            {Object.entries(PROVINCES).map(([key, province]) => {
              const isHighlighted = expandedDistribution.includes(
                key as Province
              );
              const isHovered = hoveredProvince === key;

              // Determine fill based on state
              let fillValue: string;
              if (isHighlighted) {
                fillValue = isHovered
                  ? "url(#presentHoverGradient)"
                  : "url(#presentGradient)";
              } else {
                fillValue = isHovered ? "#d1d5db" : "transparent";
              }

              return (
                <g key={key}>
                  <path
                    d={province.path}
                    stroke="#57534e"
                    strokeWidth="1.5"
                    className="cursor-pointer dark:stroke-stone-400"
                    style={{
                      fill: fillValue,
                      opacity: isHighlighted ? 0.9 : isHovered ? 0.5 : 1,
                      transition: "all 0.2s ease-in-out",
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
                    fontWeight="600"
                    className="pointer-events-none select-none fill-stone-700 dark:fill-stone-200"
                    style={{
                      textShadow: "0 0 3px rgba(255,255,255,0.8)",
                    }}
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
                className="pointer-events-none select-none italic fill-blue-300 dark:fill-blue-400"
                style={{ fontStyle: "italic" }}
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
                <div
                  className="w-4 h-4 rounded border border-green-600"
                  style={{
                    background:
                      "linear-gradient(to bottom, #4ade80, #22c55e, #16a34a)",
                  }}
                />
                <span className="text-sm">{labels.present}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded border border-stone-400"
                  style={{
                    background: "linear-gradient(to bottom, #f5f5f4, #e7e5e4)",
                  }}
                />
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
