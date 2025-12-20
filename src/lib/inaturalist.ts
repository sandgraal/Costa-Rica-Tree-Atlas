// iNaturalist API integration
// Provides observation counts and research-grade data for Costa Rica

const INATURALIST_API_BASE = "https://api.inaturalist.org/v1";
const COSTA_RICA_PLACE_ID = 6924; // iNaturalist place ID for Costa Rica

export interface INaturalistTaxon {
  id: number;
  name: string;
  preferred_common_name?: string;
  observations_count: number;
  iconic_taxon_name: string;
  wikipedia_url?: string;
  default_photo?: {
    medium_url: string;
    square_url: string;
    attribution: string;
  };
}

export interface INaturalistObservationStats {
  total: number;
  researchGrade: number;
  needsId: number;
  casual: number;
}

export interface INaturalistSpeciesData {
  taxonId: number;
  scientificName: string;
  commonName?: string;
  observationsInCostaRica: number;
  researchGradeCount: number;
  photoUrl?: string;
  photoAttribution?: string;
  inatUrl: string;
}

// Search for a taxon by scientific name
export async function searchTaxon(
  scientificName: string
): Promise<INaturalistTaxon | null> {
  try {
    const response = await fetch(
      `${INATURALIST_API_BASE}/taxa?q=${encodeURIComponent(scientificName)}&rank=species&is_active=true&per_page=1`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) return null;

    return results[0];
  } catch (error) {
    console.error("iNaturalist taxon search error:", error);
    return null;
  }
}

// Get observation count for a taxon in Costa Rica
export async function getCostaRicaObservationCount(
  taxonId: number
): Promise<INaturalistObservationStats> {
  const defaultStats = {
    total: 0,
    researchGrade: 0,
    needsId: 0,
    casual: 0,
  };

  try {
    // Get all observations in Costa Rica
    const response = await fetch(
      `${INATURALIST_API_BASE}/observations?taxon_id=${taxonId}&place_id=${COSTA_RICA_PLACE_ID}&per_page=0&verifiable=true`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) return defaultStats;

    const data = await response.json();
    const total = data.total_results || 0;

    // Get research grade count
    const rgResponse = await fetch(
      `${INATURALIST_API_BASE}/observations?taxon_id=${taxonId}&place_id=${COSTA_RICA_PLACE_ID}&quality_grade=research&per_page=0`,
      {
        next: { revalidate: 86400 },
      }
    );

    let researchGrade = 0;
    if (rgResponse.ok) {
      const rgData = await rgResponse.json();
      researchGrade = rgData.total_results || 0;
    }

    return {
      total,
      researchGrade,
      needsId: total - researchGrade,
      casual: 0,
    };
  } catch (error) {
    console.error("iNaturalist observation count error:", error);
    return defaultStats;
  }
}

// Get comprehensive species data from iNaturalist
export async function getSpeciesData(
  scientificName: string
): Promise<INaturalistSpeciesData | null> {
  const taxon = await searchTaxon(scientificName);

  if (!taxon) return null;

  const stats = await getCostaRicaObservationCount(taxon.id);

  return {
    taxonId: taxon.id,
    scientificName: taxon.name,
    commonName: taxon.preferred_common_name,
    observationsInCostaRica: stats.total,
    researchGradeCount: stats.researchGrade,
    photoUrl: taxon.default_photo?.medium_url,
    photoAttribution: taxon.default_photo?.attribution,
    inatUrl: `https://www.inaturalist.org/taxa/${taxon.id}`,
  };
}

// Get recent observations with photos
export interface INaturalistObservation {
  id: number;
  observed_on_string?: string;
  place_guess?: string;
  quality_grade: string;
  photos: Array<{
    url: string;
    attribution: string;
  }>;
  user: {
    login: string;
  };
}

export async function getRecentObservationsWithPhotos(
  taxonId: number,
  limit: number = 4
): Promise<INaturalistObservation[]> {
  try {
    const response = await fetch(
      `${INATURALIST_API_BASE}/observations?taxon_id=${taxonId}&place_id=${COSTA_RICA_PLACE_ID}&photos=true&quality_grade=research&order_by=observed_on&order=desc&per_page=${limit}`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("iNaturalist observations error:", error);
    return [];
  }
}
