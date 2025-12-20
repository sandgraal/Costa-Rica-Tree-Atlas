"use client";

import { useState } from "react";

interface DistributionMapProps {
  distribution?: string[];
  elevation?: string;
  locale: string;
}

// Costa Rica provinces with their SVG paths (simplified polygons)
const provinces = {
  guanacaste: {
    name: { en: "Guanacaste", es: "Guanacaste" },
    path: "M45,75 L95,45 L135,55 L130,75 L140,90 L125,110 L100,120 L80,105 L55,110 L40,95 Z",
    center: { x: 90, y: 85 },
  },
  alajuela: {
    name: { en: "Alajuela", es: "Alajuela" },
    path: "M130,75 L170,65 L185,80 L190,110 L175,125 L155,135 L140,130 L125,110 L140,90 Z",
    center: { x: 160, y: 100 },
  },
  heredia: {
    name: { en: "Heredia", es: "Heredia" },
    path: "M185,80 L205,75 L215,95 L210,115 L190,125 L175,125 L190,110 Z",
    center: { x: 195, y: 100 },
  },
  "san-jose": {
    name: { en: "San José", es: "San José" },
    path: "M155,135 L175,125 L190,125 L210,115 L220,130 L215,155 L195,170 L165,165 L150,150 Z",
    center: { x: 185, y: 145 },
  },
  cartago: {
    name: { en: "Cartago", es: "Cartago" },
    path: "M210,115 L215,95 L235,100 L250,120 L245,145 L220,160 L215,155 L220,130 Z",
    center: { x: 230, y: 130 },
  },
  limon: {
    name: { en: "Limón", es: "Limón" },
    path: "M235,100 L280,60 L320,55 L340,80 L335,130 L310,170 L275,195 L245,185 L220,160 L245,145 L250,120 Z",
    center: { x: 285, y: 125 },
  },
  puntarenas: {
    name: { en: "Puntarenas", es: "Puntarenas" },
    path: "M40,95 L55,110 L80,105 L100,120 L125,110 L140,130 L155,135 L150,150 L165,165 L195,170 L215,155 L220,160 L245,185 L230,210 L200,230 L170,245 L140,250 L110,240 L85,225 L60,195 L45,165 L35,135 L30,110 Z",
    center: { x: 130, y: 185 },
  },
};

// Additional geographic regions (not provinces)
const regions = {
  "pacific-coast": {
    name: { en: "Pacific Coast", es: "Costa Pacífica" },
    provinces: ["guanacaste", "puntarenas"],
  },
  "caribbean-coast": {
    name: { en: "Caribbean Coast", es: "Costa Caribeña" },
    provinces: ["limon"],
  },
  "central-valley": {
    name: { en: "Central Valley", es: "Valle Central" },
    provinces: ["san-jose", "alajuela", "heredia", "cartago"],
  },
  "northern-zone": {
    name: { en: "Northern Zone", es: "Zona Norte" },
    provinces: ["alajuela", "heredia"],
  },
};

// Expand region references to actual provinces
function expandDistribution(distribution: string[]): string[] {
  const expanded = new Set<string>();

  distribution.forEach((item) => {
    const region = regions[item as keyof typeof regions];
    if (region) {
      region.provinces.forEach((p) => expanded.add(p));
    } else if (provinces[item as keyof typeof provinces]) {
      expanded.add(item);
    }
  });

  return Array.from(expanded);
}

export function DistributionMap({
  distribution = [],
  elevation,
  locale,
}: DistributionMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const expandedDistribution = expandDistribution(distribution);
  const hasDistribution = expandedDistribution.length > 0;

  const labels = {
    title:
      locale === "es"
        ? "Distribución en Costa Rica"
        : "Distribution in Costa Rica",
    elevation: locale === "es" ? "Elevación" : "Elevation",
    present: locale === "es" ? "Presente" : "Present",
    notRecorded: locale === "es" ? "No registrado" : "Not recorded",
    clickForInfo:
      locale === "es"
        ? "Pasa el cursor para más información"
        : "Hover for details",
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
            viewBox="0 20 360 250"
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

            {/* Costa Rica outline background */}
            <path
              d="M45,75 L95,45 L135,55 L170,65 L205,75 L235,100 L280,60 L320,55 L340,80 L335,130 L310,170 L275,195 L245,185 L230,210 L200,230 L170,245 L140,250 L110,240 L85,225 L60,195 L45,165 L35,135 L30,110 L40,95 Z"
              className="text-gray-200 dark:text-gray-700 stroke-gray-300 dark:stroke-gray-600"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Province shapes */}
            {Object.entries(provinces).map(([key, province]) => {
              const isHighlighted = expandedDistribution.includes(key);
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
                    onMouseEnter={() => setHoveredProvince(key)}
                    onMouseLeave={() => setHoveredProvince(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${province.name[locale as "en" | "es"]}: ${isHighlighted ? labels.present : labels.notRecorded}`}
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
                    style={{ fontSize: "8px" }}
                  >
                    {province.name[locale as "en" | "es"]}
                  </text>
                </g>
              );
            })}

            {/* Nicaragua label (north) */}
            <text
              x="180"
              y="35"
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              className="text-gray-400 dark:text-gray-500 italic"
            >
              Nicaragua
            </text>

            {/* Panama label (south) */}
            <text
              x="300"
              y="200"
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              className="text-gray-400 dark:text-gray-500 italic"
            >
              Panamá
            </text>

            {/* Pacific Ocean label */}
            <text
              x="60"
              y="200"
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              className="text-blue-400 dark:text-blue-500 italic"
            >
              {locale === "es" ? "Océano Pacífico" : "Pacific Ocean"}
            </text>

            {/* Caribbean Sea label */}
            <text
              x="320"
              y="100"
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              className="text-blue-400 dark:text-blue-500 italic"
            >
              {locale === "es" ? "Mar Caribe" : "Caribbean Sea"}
            </text>
          </svg>

          {/* Hover info */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            {hoveredProvince ? (
              <span>
                <strong>
                  {
                    provinces[hoveredProvince as keyof typeof provinces]?.name[
                      locale as "en" | "es"
                    ]
                  }
                </strong>
                :{" "}
                {expandedDistribution.includes(hoveredProvince)
                  ? labels.present
                  : labels.notRecorded}
              </span>
            ) : (
              labels.clickForInfo
            )}
          </p>
        </div>

        {/* Legend and Info */}
        <div className="md:w-48 space-y-4">
          {/* Legend */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: "rgba(45, 90, 39, 0.4)" }}
              />
              <span className="text-sm">{labels.present}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm">{labels.notRecorded}</span>
            </div>
          </div>

          {/* Elevation */}
          {elevation && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-1">
                {labels.elevation}
              </p>
              <p className="font-medium flex items-center gap-2">
                <MountainIcon className="h-4 w-4 text-primary" />
                {elevation}
              </p>
            </div>
          )}

          {/* Distribution regions listed */}
          {hasDistribution && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                {locale === "es" ? "Regiones" : "Regions"}
              </p>
              <div className="flex flex-wrap gap-1">
                {expandedDistribution.map((region) => (
                  <span
                    key={region}
                    className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                  >
                    {
                      provinces[region as keyof typeof provinces]?.name[
                        locale as "en" | "es"
                      ]
                    }
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function MountainIcon({ className }: { className?: string }) {
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
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      <path d="m4.14 15.08 2.86-2.86" />
      <path d="m10 15 3-3" />
    </svg>
  );
}
