/**
 * Geographic data for Costa Rica
 * Data-driven SVG paths and province information
 */

import type { Province, Region, Distribution, Locale } from "@/types/tree";

// ============================================================================
// Province Definitions
// ============================================================================

export interface ProvinceData {
  id: Province;
  name: Record<Locale, string>;
  path: string;
  center: { x: number; y: number };
  area: number; // km²
  population: number;
}

export const PROVINCES: Record<Province, ProvinceData> = {
  guanacaste: {
    id: "guanacaste",
    name: { en: "Guanacaste", es: "Guanacaste" },
    path: "M45,75 L95,45 L135,55 L130,75 L140,90 L125,110 L100,120 L80,105 L55,110 L40,95 Z",
    center: { x: 90, y: 85 },
    area: 10141,
    population: 354154,
  },
  alajuela: {
    id: "alajuela",
    name: { en: "Alajuela", es: "Alajuela" },
    path: "M130,75 L170,65 L185,80 L190,110 L175,125 L155,135 L140,130 L125,110 L140,90 Z",
    center: { x: 160, y: 100 },
    area: 9757,
    population: 1018001,
  },
  heredia: {
    id: "heredia",
    name: { en: "Heredia", es: "Heredia" },
    path: "M185,80 L205,75 L215,95 L210,115 L190,125 L175,125 L190,110 Z",
    center: { x: 195, y: 100 },
    area: 2657,
    population: 512907,
  },
  "san-jose": {
    id: "san-jose",
    name: { en: "San José", es: "San José" },
    path: "M155,135 L175,125 L190,125 L210,115 L220,130 L215,155 L195,170 L165,165 L150,150 Z",
    center: { x: 185, y: 145 },
    area: 4966,
    population: 1694852,
  },
  cartago: {
    id: "cartago",
    name: { en: "Cartago", es: "Cartago" },
    path: "M210,115 L215,95 L235,100 L250,120 L245,145 L220,160 L215,155 L220,130 Z",
    center: { x: 230, y: 130 },
    area: 3124,
    population: 524818,
  },
  limon: {
    id: "limon",
    name: { en: "Limón", es: "Limón" },
    path: "M235,100 L280,60 L320,55 L340,80 L335,130 L310,170 L275,195 L245,185 L220,160 L245,145 L250,120 Z",
    center: { x: 285, y: 125 },
    area: 9189,
    population: 433082,
  },
  puntarenas: {
    id: "puntarenas",
    name: { en: "Puntarenas", es: "Puntarenas" },
    path: "M40,95 L55,110 L80,105 L100,120 L125,110 L140,130 L155,135 L150,150 L165,165 L195,170 L215,155 L220,160 L245,185 L230,210 L200,230 L170,245 L140,250 L110,240 L85,225 L60,195 L45,165 L35,135 L30,110 Z",
    center: { x: 130, y: 185 },
    area: 11266,
    population: 490420,
  },
};

// ============================================================================
// Region Definitions
// ============================================================================

export interface RegionData {
  id: Region;
  name: Record<Locale, string>;
  provinces: Province[];
  description: Record<Locale, string>;
}

export const REGIONS: Record<Region, RegionData> = {
  "pacific-coast": {
    id: "pacific-coast",
    name: { en: "Pacific Coast", es: "Costa Pacífica" },
    provinces: ["guanacaste", "puntarenas"],
    description: {
      en: "Tropical dry forests and beaches along the Pacific Ocean",
      es: "Bosques secos tropicales y playas a lo largo del Océano Pacífico",
    },
  },
  "caribbean-coast": {
    id: "caribbean-coast",
    name: { en: "Caribbean Coast", es: "Costa Caribeña" },
    provinces: ["limon"],
    description: {
      en: "Tropical rainforests and wetlands along the Caribbean Sea",
      es: "Bosques tropicales húmedos y humedales a lo largo del Mar Caribe",
    },
  },
  "central-valley": {
    id: "central-valley",
    name: { en: "Central Valley", es: "Valle Central" },
    provinces: ["san-jose", "alajuela", "heredia", "cartago"],
    description: {
      en: "Highland plateau with the highest population density",
      es: "Meseta de tierras altas con la mayor densidad de población",
    },
  },
  "northern-zone": {
    id: "northern-zone",
    name: { en: "Northern Zone", es: "Zona Norte" },
    provinces: ["alajuela", "heredia"],
    description: {
      en: "Lowland plains near the Nicaraguan border",
      es: "Llanuras bajas cerca de la frontera con Nicaragua",
    },
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

export function expandDistribution(distribution: Distribution[]): Province[] {
  const provinces = new Set<Province>();

  for (const item of distribution) {
    if (PROVINCES[item as Province]) {
      provinces.add(item as Province);
    } else if (REGIONS[item as Region]) {
      for (const province of REGIONS[item as Region].provinces) {
        provinces.add(province);
      }
    }
  }

  return Array.from(provinces);
}

export function getProvinceName(
  province: Province,
  locale: Locale = "en"
): string {
  return PROVINCES[province]?.name[locale] ?? province;
}

export function getRegionName(region: Region, locale: Locale = "en"): string {
  return REGIONS[region]?.name[locale] ?? region;
}

export function getDistributionName(
  distribution: Distribution,
  locale: Locale = "en"
): string {
  if (PROVINCES[distribution as Province]) {
    return getProvinceName(distribution as Province, locale);
  }
  if (REGIONS[distribution as Region]) {
    return getRegionName(distribution as Region, locale);
  }
  return distribution;
}

export function isProvince(
  distribution: Distribution
): distribution is Province {
  return distribution in PROVINCES;
}

export function isRegion(distribution: Distribution): distribution is Region {
  return distribution in REGIONS;
}

// ============================================================================
// SVG Map Constants
// ============================================================================

export const MAP_VIEWBOX = "0 20 360 250";

export const COUNTRY_OUTLINE =
  "M45,75 L95,45 L135,55 L170,65 L205,75 L235,100 L280,60 L320,55 L340,80 L335,130 L310,170 L275,195 L245,185 L230,210 L200,230 L170,245 L140,250 L110,240 L85,225 L60,195 L45,165 L35,135 L30,110 L40,95 Z";

export const NEIGHBORS = {
  nicaragua: {
    label: { x: 180, y: 35 },
    name: { en: "Nicaragua", es: "Nicaragua" },
  },
  panama: { label: { x: 290, y: 225 }, name: { en: "Panama", es: "Panamá" } },
  pacific: {
    label: { x: 50, y: 200 },
    name: { en: "Pacific Ocean", es: "Océano Pacífico" },
  },
  caribbean: {
    label: { x: 330, y: 100 },
    name: { en: "Caribbean Sea", es: "Mar Caribe" },
  },
};

// ============================================================================
// Elevation Zones
// ============================================================================

export interface ElevationZone {
  id: string;
  name: Record<Locale, string>;
  range: string;
  description: Record<Locale, string>;
}

export const ELEVATION_ZONES: ElevationZone[] = [
  {
    id: "lowland",
    name: { en: "Lowland", es: "Tierras Bajas" },
    range: "0-500m",
    description: {
      en: "Coastal plains and low valleys",
      es: "Planicies costeras y valles bajos",
    },
  },
  {
    id: "premontane",
    name: { en: "Premontane", es: "Premontano" },
    range: "500-1500m",
    description: {
      en: "Foothills and lower mountain slopes",
      es: "Estribaciones y laderas bajas de montañas",
    },
  },
  {
    id: "montane",
    name: { en: "Montane", es: "Montano" },
    range: "1500-2500m",
    description: {
      en: "Cloud forests and highlands",
      es: "Bosques nubosos y tierras altas",
    },
  },
  {
    id: "subalpine",
    name: { en: "Subalpine", es: "Subalpino" },
    range: "2500-3820m",
    description: {
      en: "Páramo and highest peaks",
      es: "Páramo y picos más altos",
    },
  },
];
