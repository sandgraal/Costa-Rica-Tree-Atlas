import type { Locale } from "@/types/tree";

// Conservation area ecosystem types
export type ConservationAreaType =
  | "cloud-forest"
  | "rainforest"
  | "wetland"
  | "volcano"
  | "coastal"
  | "dry-forest"
  | "highland"
  | "transition-forest";

export interface ConservationArea {
  id: string;
  name: Record<Locale, string>;
  position: { x: number; y: number };
  type: ConservationAreaType;
  icon: string;
}

// Conservation areas with approximate locations
// Data source: SINAC (Sistema Nacional de Áreas de Conservación)
export const CONSERVATION_AREAS: ConservationArea[] = [
  {
    id: "monteverde",
    name: { en: "Monteverde Cloud Forest", es: "Bosque Nuboso Monteverde" },
    position: { x: 150, y: 95 },
    type: "cloud-forest",
    icon: "🌲",
  },
  {
    id: "corcovado",
    name: { en: "Corcovado National Park", es: "Parque Nacional Corcovado" },
    position: { x: 115, y: 235 },
    type: "rainforest",
    icon: "🦜",
  },
  {
    id: "tortuguero",
    name: {
      en: "Tortuguero National Park",
      es: "Parque Nacional Tortuguero",
    },
    position: { x: 295, y: 75 },
    type: "wetland",
    icon: "🐢",
  },
  {
    id: "arenal",
    name: {
      en: "Arenal Volcano National Park",
      es: "Parque Nacional Volcán Arenal",
    },
    position: { x: 165, y: 85 },
    type: "volcano",
    icon: "🌋",
  },
  {
    id: "manuel-antonio",
    name: {
      en: "Manuel Antonio National Park",
      es: "Parque Nacional Manuel Antonio",
    },
    position: { x: 155, y: 175 },
    type: "coastal",
    icon: "🏖️",
  },
  {
    id: "santa-rosa",
    name: {
      en: "Santa Rosa National Park",
      es: "Parque Nacional Santa Rosa",
    },
    position: { x: 65, y: 60 },
    type: "dry-forest",
    icon: "🌵",
  },
  {
    id: "la-amistad",
    name: {
      en: "La Amistad Int'l Park",
      es: "P.N. La Amistad",
    },
    position: { x: 230, y: 200 },
    type: "highland",
    icon: "⛰️",
  },
  {
    id: "rincon-de-la-vieja",
    name: {
      en: "Rincón de la Vieja N.P.",
      es: "P.N. Rincón de la Vieja",
    },
    position: { x: 95, y: 55 },
    type: "volcano",
    icon: "🌋",
  },
  {
    id: "poas",
    name: { en: "Poás Volcano N.P.", es: "P.N. Volcán Poás" },
    position: { x: 175, y: 95 },
    type: "volcano",
    icon: "🌋",
  },
  {
    id: "cahuita",
    name: { en: "Cahuita National Park", es: "Parque Nacional Cahuita" },
    position: { x: 305, y: 140 },
    type: "coastal",
    icon: "🏖️",
  },
  {
    id: "carara",
    name: { en: "Carara National Park", es: "Parque Nacional Carara" },
    position: { x: 145, y: 160 },
    type: "transition-forest",
    icon: "🦜",
  },
  {
    id: "chirripo",
    name: { en: "Chirripó National Park", es: "Parque Nacional Chirripó" },
    position: { x: 215, y: 175 },
    type: "highland",
    icon: "🏔️",
  },
];

/** Color scale for biodiversity density */
export function getBiodiversityColor(count: number, max: number): string {
  const intensity = Math.min(count / max, 1);
  if (intensity < 0.2) return "#bbf7d0";
  if (intensity < 0.4) return "#86efac";
  if (intensity < 0.6) return "#4ade80";
  if (intensity < 0.8) return "#22c55e";
  return "#16a34a";
}

/** Get localized ecosystem label for a conservation area type */
export function getEcosystemLabel(
  type: ConservationAreaType,
  locale: Locale
): string {
  const labels: Record<ConservationAreaType, Record<Locale, string>> = {
    "cloud-forest": { en: "Cloud Forest", es: "Bosque Nuboso" },
    rainforest: { en: "Rainforest", es: "Bosque Lluvioso" },
    wetland: { en: "Wetland", es: "Humedal" },
    volcano: { en: "Volcano", es: "Volcán" },
    coastal: { en: "Coastal", es: "Costero" },
    "dry-forest": { en: "Dry Forest", es: "Bosque Seco" },
    highland: { en: "Highland", es: "Tierras Altas" },
    "transition-forest": {
      en: "Transition Forest",
      es: "Bosque de Transición",
    },
  };
  return labels[type][locale];
}
