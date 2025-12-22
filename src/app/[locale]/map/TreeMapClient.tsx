"use client";

import { useState, useMemo } from "react";
import { allTrees } from "contentlayer/generated";
import { Link } from "@i18n/navigation";
import {
  PROVINCES,
  REGIONS,
  MAP_VIEWBOX,
  COUNTRY_OUTLINE,
  NEIGHBORS,
  ELEVATION_ZONES,
} from "@/lib/geo";
import type { Locale, Province, Region, Tree as TreeType } from "@/types/tree";

// Conservation areas with approximate locations
const CONSERVATION_AREAS = [
  {
    id: "monteverde",
    name: { en: "Monteverde", es: "Monteverde" },
    position: { x: 150, y: 95 },
    type: "cloud-forest" as const,
    icon: "🌲",
  },
  {
    id: "corcovado",
    name: { en: "Corcovado", es: "Corcovado" },
    position: { x: 115, y: 235 },
    type: "rainforest" as const,
    icon: "🦜",
  },
  {
    id: "tortuguero",
    name: { en: "Tortuguero", es: "Tortuguero" },
    position: { x: 295, y: 75 },
    type: "wetland" as const,
    icon: "🐢",
  },
  {
    id: "arenal",
    name: { en: "Arenal", es: "Arenal" },
    position: { x: 165, y: 85 },
    type: "volcano" as const,
    icon: "🌋",
  },
  {
    id: "manuel-antonio",
    name: { en: "Manuel Antonio", es: "Manuel Antonio" },
    position: { x: 155, y: 175 },
    type: "coastal" as const,
    icon: "🏖️",
  },
  {
    id: "santa-rosa",
    name: { en: "Santa Rosa", es: "Santa Rosa" },
    position: { x: 65, y: 60 },
    type: "dry-forest" as const,
    icon: "🌵",
  },
];

// Color scale for biodiversity density
function getBiodiversityColor(count: number, max: number): string {
  const intensity = Math.min(count / max, 1);
  if (intensity < 0.2) return "#bbf7d0"; // green-200
  if (intensity < 0.4) return "#86efac"; // green-300
  if (intensity < 0.6) return "#4ade80"; // green-400
  if (intensity < 0.8) return "#22c55e"; // green-500
  return "#16a34a"; // green-600
}

interface TreeMapClientProps {
  locale: string;
}

export default function TreeMapClient({ locale }: TreeMapClientProps) {
  const typedLocale = locale as Locale;
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showConservationAreas, setShowConservationAreas] = useState(true);

  // Get trees for current locale
  const trees = useMemo(() => {
    return allTrees.filter((tree) => tree.locale === locale) as TreeType[];
  }, [locale]);

  // Get trees by province with counts
  const treesByProvince = useMemo(() => {
    const byProvince: Record<Province, TreeType[]> = {
      guanacaste: [],
      puntarenas: [],
      alajuela: [],
      heredia: [],
      "san-jose": [],
      cartago: [],
      limon: [],
    };

    trees.forEach((tree) => {
      if (tree.distribution) {
        tree.distribution.forEach((dist) => {
          if (dist in byProvince) {
            byProvince[dist as Province].push(tree);
          }
        });
      }
    });

    return byProvince;
  }, [trees]);

  // Calculate max for color scaling
  const maxTreeCount = useMemo(() => {
    return Math.max(...Object.values(treesByProvince).map((t) => t.length));
  }, [treesByProvince]);

  // Get trees by region
  const treesByRegion = useMemo(() => {
    const byRegion: Record<Region, Set<TreeType>> = {
      "pacific-coast": new Set(),
      "caribbean-coast": new Set(),
      "central-valley": new Set(),
      "northern-zone": new Set(),
    };

    Object.entries(REGIONS).forEach(([regionId, region]) => {
      region.provinces.forEach((province) => {
        treesByProvince[province].forEach((tree) => {
          byRegion[regionId as Region].add(tree);
        });
      });
    });

    return Object.fromEntries(
      Object.entries(byRegion).map(([k, v]) => [k, Array.from(v)])
    ) as Record<Region, TreeType[]>;
  }, [treesByProvince]);

  // Labels
  const labels = {
    title: typedLocale === "es" ? "Explorar por Región" : "Explore by Region",
    subtitle:
      typedLocale === "es"
        ? "Descubre la distribución de árboles nativos en Costa Rica"
        : "Discover the distribution of native trees across Costa Rica",
    species: typedLocale === "es" ? "especies" : "species",
    viewAll: typedLocale === "es" ? "Ver todos" : "View all",
    selectProvince:
      typedLocale === "es" ? "Selecciona una provincia" : "Select a province",
    conservationAreas:
      typedLocale === "es" ? "Áreas Protegidas" : "Protected Areas",
    regions: typedLocale === "es" ? "Regiones" : "Regions",
    provinces: typedLocale === "es" ? "Provincias" : "Provinces",
    elevation: typedLocale === "es" ? "Zonas de Elevación" : "Elevation Zones",
    biodiversity: typedLocale === "es" ? "Biodiversidad" : "Biodiversity",
    treesFound:
      typedLocale === "es" ? "árboles documentados" : "trees documented",
    clickToExplore:
      typedLocale === "es"
        ? "Haz clic en una provincia para explorar"
        : "Click a province to explore",
    showAreas:
      typedLocale === "es"
        ? "Mostrar áreas protegidas"
        : "Show protected areas",
    totalTrees: typedLocale === "es" ? "Total de especies" : "Total species",
  };

  const selectedTrees = selectedProvince
    ? treesByProvince[selectedProvince]
    : selectedRegion
      ? treesByRegion[selectedRegion]
      : [];

  const displayProvince = hoveredProvince || selectedProvince;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            🗺️ {labels.title}
          </h1>
          <p className="text-lg text-muted-foreground">{labels.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-3xl font-bold text-primary">
              {trees.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {labels.totalTrees}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-3xl font-bold text-green-600">7</div>
            <div className="text-sm text-muted-foreground">
              {labels.provinces}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">4</div>
            <div className="text-sm text-muted-foreground">
              {labels.regions}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">6</div>
            <div className="text-sm text-muted-foreground">
              {labels.conservationAreas}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            {/* Controls */}
            <div className="mb-4 flex gap-4 flex-wrap items-center">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showConservationAreas}
                  onChange={(e) => setShowConservationAreas(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">{labels.showAreas}</span>
              </label>

              {(selectedProvince || selectedRegion) && (
                <button
                  onClick={() => {
                    setSelectedProvince(null);
                    setSelectedRegion(null);
                  }}
                  className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors text-sm"
                >
                  ✕{" "}
                  {typedLocale === "es"
                    ? "Limpiar selección"
                    : "Clear selection"}
                </button>
              )}
            </div>

            {/* SVG Map */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
              <svg
                viewBox={MAP_VIEWBOX}
                className="w-full h-auto"
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
                    <stop offset="0%" stopColor="#bfdbfe" />
                    <stop offset="50%" stopColor="#93c5fd" />
                    <stop offset="100%" stopColor="#60a5fa" />
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
                      dy="3"
                      stdDeviation="4"
                      floodOpacity="0.25"
                    />
                  </filter>

                  {/* Glow filter for selection */}
                  <filter
                    id="glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Dynamic province colors */}
                  {Object.keys(PROVINCES).map((province) => {
                    const count = treesByProvince[province as Province].length;
                    const color = getBiodiversityColor(count, maxTreeCount);
                    return (
                      <linearGradient
                        key={province}
                        id={`provinceGradient-${province}`}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                        <stop
                          offset="100%"
                          stopColor={color}
                          stopOpacity="0.7"
                        />
                      </linearGradient>
                    );
                  })}
                </defs>

                {/* Water background */}
                <rect
                  x="0"
                  y="0"
                  width="360"
                  height="280"
                  className="fill-[url(#waterGradient)] dark:fill-[url(#waterGradientDark)]"
                />

                {/* Wave patterns for ocean */}
                <g opacity="0.3">
                  {[30, 50, 70].map((y) => (
                    <path
                      key={y}
                      d={`M0 ${y + 150} Q20 ${y + 145} 40 ${y + 150} T80 ${y + 150} T120 ${y + 150}`}
                      stroke="#60a5fa"
                      strokeWidth="1"
                      fill="none"
                      className="dark:stroke-blue-400"
                    />
                  ))}
                </g>

                {/* Country outline with shadow */}
                <path
                  d={COUNTRY_OUTLINE}
                  className="fill-[url(#landGradient)] dark:fill-stone-700"
                  stroke="#78716c"
                  strokeWidth="3"
                  filter="url(#dropShadow)"
                />

                {/* Province shapes */}
                {Object.entries(PROVINCES).map(([key, province]) => {
                  const isSelected = selectedProvince === key;
                  const isHovered = hoveredProvince === key;
                  const isInSelectedRegion =
                    selectedRegion &&
                    REGIONS[selectedRegion].provinces.includes(key as Province);
                  const treeCount = treesByProvince[key as Province].length;

                  return (
                    <g key={key}>
                      <path
                        d={province.path}
                        stroke={isSelected || isHovered ? "#166534" : "#57534e"}
                        strokeWidth={isSelected || isHovered ? "2.5" : "1.5"}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          fill:
                            isSelected || isInSelectedRegion
                              ? `url(#provinceGradient-${key})`
                              : isHovered
                                ? `url(#provinceGradient-${key})`
                                : "transparent",
                          filter:
                            isSelected || isHovered ? "url(#glow)" : "none",
                        }}
                        onClick={() => {
                          setSelectedProvince(key as Province);
                          setSelectedRegion(null);
                        }}
                        onMouseEnter={() => setHoveredProvince(key as Province)}
                        onMouseLeave={() => setHoveredProvince(null)}
                        tabIndex={0}
                        role="button"
                        aria-label={`${province.name[typedLocale]}: ${treeCount} ${labels.species}`}
                      />
                      {/* Province name */}
                      <text
                        x={province.center.x}
                        y={province.center.y - 5}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        className="pointer-events-none select-none fill-stone-700 dark:fill-stone-100"
                        style={{
                          textShadow: "0 0 4px rgba(255,255,255,0.9)",
                        }}
                      >
                        {province.name[typedLocale]}
                      </text>
                      {/* Tree count badge */}
                      <text
                        x={province.center.x}
                        y={province.center.y + 8}
                        textAnchor="middle"
                        fontSize="7"
                        className="pointer-events-none select-none fill-stone-500 dark:fill-stone-300"
                      >
                        {treeCount} 🌳
                      </text>
                    </g>
                  );
                })}

                {/* Conservation area markers */}
                {showConservationAreas &&
                  CONSERVATION_AREAS.map((area) => (
                    <g key={area.id} className="cursor-pointer">
                      <circle
                        cx={area.position.x}
                        cy={area.position.y}
                        r="8"
                        fill="white"
                        stroke="#059669"
                        strokeWidth="2"
                        className="dark:fill-stone-800"
                      />
                      <text
                        x={area.position.x}
                        y={area.position.y + 3}
                        textAnchor="middle"
                        fontSize="8"
                        className="pointer-events-none select-none"
                      >
                        {area.icon}
                      </text>
                    </g>
                  ))}

                {/* Neighbor labels */}
                {Object.entries(NEIGHBORS).map(([key, neighbor]) => (
                  <text
                    key={key}
                    x={neighbor.label.x}
                    y={neighbor.label.y}
                    textAnchor="middle"
                    fontSize="10"
                    className="pointer-events-none select-none italic fill-blue-400 dark:fill-blue-300"
                    style={{ fontStyle: "italic" }}
                  >
                    {neighbor.name[typedLocale]}
                  </text>
                ))}
              </svg>

              {/* Biodiversity Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {labels.biodiversity}:
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {typedLocale === "es" ? "Menor" : "Lower"}
                    </span>
                    {[
                      "#bbf7d0",
                      "#86efac",
                      "#4ade80",
                      "#22c55e",
                      "#16a34a",
                    ].map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-4 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground">
                      {typedLocale === "es" ? "Mayor" : "Higher"}
                    </span>
                  </div>
                </div>

                {showConservationAreas && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 rounded-full border-2 border-green-600 bg-white flex items-center justify-center text-xs">
                      🌲
                    </span>
                    <span>{labels.conservationAreas}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Province hover info */}
            {displayProvince && (
              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {PROVINCES[displayProvince].name[typedLocale]}
                    </h3>
                    <p className="text-muted-foreground">
                      {treesByProvince[displayProvince].length}{" "}
                      {labels.treesFound}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>
                      {PROVINCES[displayProvince].area.toLocaleString()} km²
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!displayProvince && !selectedRegion && (
              <p className="mt-4 text-center text-muted-foreground">
                👆 {labels.clickToExplore}
              </p>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Regions Quick Select */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🌎 {labels.regions}
              </h2>
              <div className="space-y-2">
                {Object.entries(REGIONS).map(([key, region]) => {
                  const regionTrees = treesByRegion[key as Region];
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedRegion(key as Region);
                        setSelectedProvince(null);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                        selectedRegion === key
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "hover:bg-muted border border-transparent"
                      }`}
                    >
                      <div>
                        <span className="font-medium">
                          {region.name[typedLocale]}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {region.description[typedLocale]}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">
                        {regionTrees.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Trees */}
            {(selectedProvince || selectedRegion) && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {selectedProvince
                    ? PROVINCES[selectedProvince].name[typedLocale]
                    : selectedRegion
                      ? REGIONS[selectedRegion].name[typedLocale]
                      : ""}
                </h2>

                <p className="text-sm text-muted-foreground mb-4">
                  {selectedTrees.length} {labels.species}
                </p>

                <ul className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedTrees.slice(0, 15).map((tree) => (
                    <li key={tree.slug}>
                      <Link
                        href={`/trees/${tree.slug}`}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="text-lg">🌳</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {tree.title}
                          </p>
                          <p className="text-xs text-muted-foreground italic truncate">
                            {tree.scientificName}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                {selectedTrees.length > 15 && (
                  <Link
                    href={
                      selectedProvince
                        ? `/trees?distribution=${selectedProvince}`
                        : `/trees`
                    }
                    className="block mt-4 text-sm text-primary hover:underline text-center"
                  >
                    {labels.viewAll} ({selectedTrees.length}) →
                  </Link>
                )}
              </div>
            )}

            {/* Elevation Zones */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                ⛰️ {labels.elevation}
              </h2>
              <div className="space-y-3">
                {ELEVATION_ZONES.map((zone, index) => (
                  <div
                    key={zone.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{
                        backgroundColor: [
                          "#22c55e",
                          "#84cc16",
                          "#eab308",
                          "#f97316",
                        ][index],
                      }}
                    >
                      {zone.range.split("-")[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {zone.name[typedLocale]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {zone.range}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conservation Areas List */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🏞️ {labels.conservationAreas}
              </h2>
              <ul className="space-y-2">
                {CONSERVATION_AREAS.map((area) => (
                  <li
                    key={area.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-xl">{area.icon}</span>
                    <span className="text-sm">{area.name[typedLocale]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Province Quick Grid */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {typedLocale === "es"
              ? "Árboles por Provincia"
              : "Trees by Province"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(PROVINCES).map(([key, province]) => {
              const count = treesByProvince[key as Province].length;
              const color = getBiodiversityColor(count, maxTreeCount);
              return (
                <Link
                  key={key}
                  href={`/trees?distribution=${key}`}
                  className="group bg-card rounded-xl border border-border p-4 text-center hover:border-primary hover:shadow-lg transition-all"
                >
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: color }}
                  >
                    🌳
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {province.name[typedLocale]}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {count} {labels.species}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
