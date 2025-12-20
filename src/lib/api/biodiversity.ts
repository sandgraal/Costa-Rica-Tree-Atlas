/**
 * Unified API client for biodiversity data
 * Handles caching, error states, and data normalization
 */

import type {
  BiodiversityData,
  GBIFData,
  INaturalistData,
  IUCNData,
} from "@/types/tree";

// ============================================================================
// API Configuration
// ============================================================================

const API_CONFIG = {
  gbif: {
    baseUrl: "https://api.gbif.org/v1",
    costaRicaCode: "CR",
  },
  inaturalist: {
    baseUrl: "https://api.inaturalist.org/v1",
    costaRicaPlaceId: 6924,
  },
  cache: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    staleWhileRevalidate: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// ============================================================================
// GBIF API
// ============================================================================

interface GBIFSpeciesMatch {
  usageKey: number;
  scientificName: string;
  canonicalName?: string;
  rank?: string;
  status?: string;
  confidence?: number;
  matchType: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

export async function matchGBIFSpecies(
  scientificName: string
): Promise<GBIFSpeciesMatch | null> {
  const url = `${API_CONFIG.gbif.baseUrl}/species/match?name=${encodeURIComponent(scientificName)}&verbose=true`;

  try {
    const response = await fetch(url, {
      next: { revalidate: API_CONFIG.cache.ttl / 1000 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.matchType === "NONE") return null;

    return data;
  } catch (error) {
    console.error("[GBIF] Species match error:", error);
    return null;
  }
}

export async function getGBIFOccurrences(
  taxonKey: number,
  country?: string
): Promise<number> {
  const params = new URLSearchParams({ taxonKey: String(taxonKey) });
  if (country) params.set("country", country);

  const url = `${API_CONFIG.gbif.baseUrl}/occurrence/count?${params}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: API_CONFIG.cache.ttl / 1000 },
    });

    if (!response.ok) return 0;

    const count = await response.json();
    return typeof count === "number" ? count : 0;
  } catch (error) {
    console.error("[GBIF] Occurrence count error:", error);
    return 0;
  }
}

export async function fetchGBIFData(
  scientificName: string
): Promise<GBIFData | null> {
  const match = await matchGBIFSpecies(scientificName);
  if (!match) return null;

  const [costaRicaOccurrences, globalOccurrences] = await Promise.all([
    getGBIFOccurrences(match.usageKey, API_CONFIG.gbif.costaRicaCode),
    getGBIFOccurrences(match.usageKey),
  ]);

  return {
    taxonKey: match.usageKey,
    scientificName: match.scientificName,
    globalOccurrences,
    costaRicaOccurrences,
    gbifUrl: `https://www.gbif.org/species/${match.usageKey}`,
  };
}

// ============================================================================
// iNaturalist API
// ============================================================================

interface INaturalistTaxon {
  id: number;
  name: string;
  preferred_common_name?: string;
  observations_count?: number;
  iconic_taxon_name?: string;
  wikipedia_url?: string;
  default_photo?: {
    medium_url: string;
    square_url: string;
    attribution: string;
  };
}

export async function searchINaturalistTaxon(
  scientificName: string
): Promise<INaturalistTaxon | null> {
  const url = `${API_CONFIG.inaturalist.baseUrl}/taxa?q=${encodeURIComponent(scientificName)}&rank=species&is_active=true&per_page=1`;

  try {
    const response = await fetch(url, {
      next: { revalidate: API_CONFIG.cache.ttl / 1000 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.results?.[0] ?? null;
  } catch (error) {
    console.error("[iNaturalist] Taxon search error:", error);
    return null;
  }
}

export async function getINaturalistObservationCount(
  taxonId: number
): Promise<{ total: number; researchGrade: number }> {
  const baseParams = `taxon_id=${taxonId}&place_id=${API_CONFIG.inaturalist.costaRicaPlaceId}&per_page=0`;

  try {
    const [totalResponse, rgResponse] = await Promise.all([
      fetch(
        `${API_CONFIG.inaturalist.baseUrl}/observations?${baseParams}&verifiable=true`,
        { next: { revalidate: API_CONFIG.cache.ttl / 1000 } }
      ),
      fetch(
        `${API_CONFIG.inaturalist.baseUrl}/observations?${baseParams}&quality_grade=research`,
        { next: { revalidate: API_CONFIG.cache.ttl / 1000 } }
      ),
    ]);

    const totalData = totalResponse.ok ? await totalResponse.json() : null;
    const rgData = rgResponse.ok ? await rgResponse.json() : null;

    return {
      total: totalData?.total_results ?? 0,
      researchGrade: rgData?.total_results ?? 0,
    };
  } catch (error) {
    console.error("[iNaturalist] Observation count error:", error);
    return { total: 0, researchGrade: 0 };
  }
}

export async function fetchINaturalistData(
  scientificName: string
): Promise<INaturalistData | null> {
  const taxon = await searchINaturalistTaxon(scientificName);
  if (!taxon) return null;

  const counts = await getINaturalistObservationCount(taxon.id);

  return {
    taxonId: taxon.id,
    scientificName: taxon.name,
    commonName: taxon.preferred_common_name,
    observationsInCostaRica: counts.total,
    researchGradeCount: counts.researchGrade,
    photoUrl: taxon.default_photo?.medium_url,
    inatUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
  };
}

// ============================================================================
// IUCN Data (via GBIF)
// ============================================================================

export async function fetchIUCNData(
  taxonKey: number
): Promise<IUCNData | null> {
  const url = `${API_CONFIG.gbif.baseUrl}/species/${taxonKey}/iucnRedListCategory`;

  try {
    const response = await fetch(url, {
      next: { revalidate: API_CONFIG.cache.ttl / 1000 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.category) return null;

    return {
      category: data.category,
      populationTrend: data.populationTrend ?? "unknown",
      assessmentDate: data.assessmentDate,
      iucnUrl: data.source
        ? `https://www.iucnredlist.org/species/${data.taxonKey}`
        : undefined,
    };
  } catch (error) {
    console.error("[IUCN] Data fetch error:", error);
    return null;
  }
}

// ============================================================================
// Unified Biodiversity Data Fetcher
// ============================================================================

export async function fetchBiodiversityData(
  scientificName: string
): Promise<BiodiversityData> {
  // First get GBIF match for the taxon key (needed for IUCN)
  const gbifMatch = await matchGBIFSpecies(scientificName);
  const taxonKey = gbifMatch?.usageKey;

  // Fetch all data sources in parallel
  const [gbif, inaturalist, iucn] = await Promise.all([
    fetchGBIFData(scientificName),
    fetchINaturalistData(scientificName),
    taxonKey ? fetchIUCNData(taxonKey) : Promise.resolve(null),
  ]);

  return {
    gbif,
    inaturalist,
    iucn,
    lastUpdated: new Date().toISOString(),
  };
}

// ============================================================================
// React Query Integration
// ============================================================================

export const biodiversityQueryKeys = {
  all: ["biodiversity"] as const,
  species: (scientificName: string) =>
    [...biodiversityQueryKeys.all, scientificName] as const,
};

export function biodiversityQueryFn(scientificName: string) {
  return () => fetchBiodiversityData(scientificName);
}
