/**
 * Core tree type definitions
 * Single source of truth for tree data structure
 */

export type Locale = "en" | "es";

export type Month =
  | "january"
  | "february"
  | "march"
  | "april"
  | "may"
  | "june"
  | "july"
  | "august"
  | "september"
  | "october"
  | "november"
  | "december"
  | "all-year";

export type ConservationCategory =
  | "EX"
  | "EW"
  | "CR"
  | "EN"
  | "VU"
  | "NT"
  | "LC"
  | "DD"
  | "NE";

export type PopulationTrend =
  | "decreasing"
  | "stable"
  | "increasing"
  | "unknown";

export type Province =
  | "guanacaste"
  | "puntarenas"
  | "alajuela"
  | "heredia"
  | "san-jose"
  | "cartago"
  | "limon";

export type Region =
  | "pacific-coast"
  | "caribbean-coast"
  | "central-valley"
  | "northern-zone";

export type Distribution = Province | Region;

export type TreeTag =
  | "native"
  | "endemic"
  | "introduced"
  | "deciduous"
  | "evergreen"
  | "flowering"
  | "fruit-bearing"
  | "endangered"
  | "national"
  | "nitrogen-fixing"
  | "shade-tree"
  | "wildlife-food"
  | "dry-forest"
  | "rainforest"
  | "cloud-forest"
  | "timber"
  | "medicinal"
  | "ornamental";

export interface TreeBase {
  slug: string;
  locale: Locale;
  title: string;
  scientificName: string;
  family: string;
  description: string;
}

export interface TreeMetadata {
  nativeRegion?: string;
  conservationStatus?: ConservationCategory | string;
  maxHeight?: string;
  elevation?: string;
  uses?: string[];
  tags?: TreeTag[];
  distribution?: Distribution[];
  floweringSeason?: Month[];
  fruitingSeason?: Month[];
}

export interface TreeMedia {
  featuredImage?: string;
  images?: string[];
}

export interface TreeDates {
  publishedAt?: string;
  updatedAt?: string;
}

export interface Tree extends TreeBase, TreeMetadata, TreeMedia, TreeDates {
  _id: string;
  _raw: unknown;
  body: {
    raw: string;
    code: string;
  };
  url: string;
}

// Search and filter types
export interface TreeFilter {
  family?: string;
  conservationStatus?: string;
  tags?: TreeTag[];
  distribution?: Distribution[];
  seasonalFilter?: "all" | "flowering" | "fruiting";
  month?: Month;
}

export type SortField = "title" | "scientificName" | "family";
export type SortDirection = "asc" | "desc";

export interface TreeSort {
  field: SortField;
  direction: SortDirection;
}

// Biodiversity data types
export interface GBIFData {
  taxonKey: number;
  scientificName: string;
  globalOccurrences: number;
  costaRicaOccurrences: number;
  gbifUrl: string;
}

export interface INaturalistData {
  taxonId: number;
  scientificName: string;
  commonName?: string;
  observationsInCostaRica: number;
  researchGradeCount: number;
  photoUrl?: string;
  inatUrl: string;
}

export interface IUCNData {
  category: ConservationCategory;
  populationTrend: PopulationTrend;
  assessmentDate?: string;
  iucnUrl?: string;
}

export interface BiodiversityData {
  gbif: GBIFData | null;
  inaturalist: INaturalistData | null;
  iucn: IUCNData | null;
  lastUpdated: string;
}
