// GBIF (Global Biodiversity Information Facility) API integration
// Provides occurrence data for species in Costa Rica

const GBIF_API_BASE = "https://api.gbif.org/v1";
const COSTA_RICA_CODE = "CR";

export interface GBIFSpeciesMatch {
  usageKey: number;
  scientificName: string;
  canonicalName: string;
  rank: string;
  status: string;
  confidence: number;
  matchType: string;
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface GBIFOccurrenceCount {
  count: number;
  countryCode: string;
}

export interface GBIFSpeciesProfile {
  taxonKey: number;
  scientificName: string;
  vernacularName?: string;
  occurrenceCount: number;
  costaRicaOccurrences: number;
  imageUrl?: string;
  gbifUrl: string;
}

// Match a scientific name to GBIF taxonomy
export async function matchSpecies(
  scientificName: string
): Promise<GBIFSpeciesMatch | null> {
  try {
    const response = await fetch(
      `${GBIF_API_BASE}/species/match?name=${encodeURIComponent(scientificName)}&verbose=true`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.matchType === "NONE") return null;

    return data;
  } catch (error) {
    console.error("GBIF species match error:", error);
    return null;
  }
}

// Get occurrence count for a species in Costa Rica
export async function getCostaRicaOccurrences(
  taxonKey: number
): Promise<number> {
  try {
    const response = await fetch(
      `${GBIF_API_BASE}/occurrence/count?taxonKey=${taxonKey}&country=${COSTA_RICA_CODE}`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) return 0;

    const count = await response.json();
    return typeof count === "number" ? count : 0;
  } catch (error) {
    console.error("GBIF occurrence count error:", error);
    return 0;
  }
}

// Get global occurrence count for a species
export async function getGlobalOccurrences(taxonKey: number): Promise<number> {
  try {
    const response = await fetch(
      `${GBIF_API_BASE}/occurrence/count?taxonKey=${taxonKey}`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) return 0;

    const count = await response.json();
    return typeof count === "number" ? count : 0;
  } catch (error) {
    console.error("GBIF global occurrence count error:", error);
    return 0;
  }
}

// Get a comprehensive species profile
export async function getSpeciesProfile(
  scientificName: string
): Promise<GBIFSpeciesProfile | null> {
  const match = await matchSpecies(scientificName);

  if (!match) return null;

  const [costaRicaOccurrences, globalOccurrences] = await Promise.all([
    getCostaRicaOccurrences(match.usageKey),
    getGlobalOccurrences(match.usageKey),
  ]);

  return {
    taxonKey: match.usageKey,
    scientificName: match.scientificName,
    occurrenceCount: globalOccurrences,
    costaRicaOccurrences,
    gbifUrl: `https://www.gbif.org/species/${match.usageKey}`,
  };
}

// Get recent observations for a species in Costa Rica
export interface GBIFOccurrence {
  key: number;
  scientificName: string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  eventDate?: string;
  stateProvince?: string;
  locality?: string;
  recordedBy?: string;
  institutionCode?: string;
  mediaType?: string[];
}

export async function getRecentObservations(
  taxonKey: number,
  limit: number = 5
): Promise<GBIFOccurrence[]> {
  try {
    const response = await fetch(
      `${GBIF_API_BASE}/occurrence/search?taxonKey=${taxonKey}&country=${COSTA_RICA_CODE}&limit=${limit}&hasCoordinate=true`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("GBIF observations error:", error);
    return [];
  }
}
