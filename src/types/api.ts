/**
 * Public API Types
 *
 * Type definitions for the public REST API for researchers and developers.
 */

/**
 * API version
 */
export const API_VERSION = "v1";

/**
 * Tree data returned by the API (subset of full tree data)
 */
export interface TreeAPIResponse {
  slug: string;
  locale: string;

  // Basic info
  title: string;
  scientificName: string;
  family: string;
  description: string;

  // Physical characteristics
  nativeRegion?: string;
  maxHeight?: string;
  elevation?: string;

  // Conservation
  conservationStatus?: string;

  // Uses and characteristics
  uses?: string[];
  tags?: string[];

  // Distribution
  distribution?: string[];

  // Seasonal info
  floweringSeason?: string[];
  fruitingSeason?: string[];

  // Safety
  toxicityLevel?: string;
  toxicParts?: string[];
  skinContactRisk?: string;
  allergenRisk?: string;

  // Images
  featuredImage?: string;
  images?: string[];

  // Metadata
  publishedAt?: string;
  updatedAt?: string;

  // API metadata
  _links: {
    self: string;
    html: string;
  };
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  _links: {
    self: string;
    first: string;
    last: string;
    next?: string;
    prev?: string;
  };
}

/**
 * API error response
 */
export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  _links: {
    documentation: string;
  };
}

/**
 * Filter options for tree listing
 */
export interface TreeFilterOptions {
  locale?: "en" | "es";
  family?: string;
  conservationStatus?: string;
  tag?: string;
  distribution?: string;
  floweringSeason?: string;
  fruitingSeason?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: "title" | "scientificName" | "family" | "updatedAt";
  order?: "asc" | "desc";
}

/**
 * Family info returned by the API
 */
export interface FamilyInfo {
  name: string;
  speciesCount: number;
  _links: {
    species: string;
  };
}

/**
 * Available families response
 */
export interface FamiliesResponse {
  data: FamilyInfo[];
  meta: {
    totalFamilies: number;
    totalSpecies: number;
    locale: string;
  };
  _links: {
    self: string;
    trees: string;
  };
}

/**
 * API stats response
 */
export interface APIStatsResponse {
  totalSpecies: number;
  totalFamilies: number;
  locales: string[];
  lastUpdated: string;
  _links: {
    trees: string;
    families: string;
    documentation: string;
  };
}

/**
 * Rate limit headers
 */
export interface RateLimitHeaders {
  "X-RateLimit-Limit": string;
  "X-RateLimit-Remaining": string;
  "X-RateLimit-Reset": string;
}

/**
 * Supported filter values
 */
export const VALID_CONSERVATION_STATUSES = [
  "LC", // Least Concern
  "NT", // Near Threatened
  "VU", // Vulnerable
  "EN", // Endangered
  "CR", // Critically Endangered
  "EW", // Extinct in the Wild
  "EX", // Extinct
  "DD", // Data Deficient
  "NE", // Not Evaluated
] as const;

export const VALID_DISTRIBUTION_REGIONS = [
  "guanacaste",
  "puntarenas",
  "limon",
  "san-jose",
  "alajuela",
  "cartago",
  "heredia",
  "pacific-coast",
  "caribbean-coast",
  "central-valley",
  "northern-zone",
] as const;

export const VALID_MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

export const VALID_SORT_FIELDS = [
  "title",
  "scientificName",
  "family",
  "updatedAt",
] as const;
