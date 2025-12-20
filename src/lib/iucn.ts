// IUCN Red List API integration
// Provides conservation status and population trend data
// Note: IUCN API requires a token for full access. This uses the public assessment data.

const IUCN_API_BASE = "https://apiv3.iucnredlist.org/api/v3";

// IUCN Red List categories with display properties
export const IUCN_CATEGORIES: Record<
  string,
  { code: string; name: string; color: string; priority: number }
> = {
  EX: {
    code: "EX",
    name: "Extinct",
    color: "#000000",
    priority: 8,
  },
  EW: {
    code: "EW",
    name: "Extinct in the Wild",
    color: "#542344",
    priority: 7,
  },
  CR: {
    code: "CR",
    name: "Critically Endangered",
    color: "#D81E05",
    priority: 6,
  },
  EN: {
    code: "EN",
    name: "Endangered",
    color: "#FC7F3F",
    priority: 5,
  },
  VU: {
    code: "VU",
    name: "Vulnerable",
    color: "#F9E814",
    priority: 4,
  },
  NT: {
    code: "NT",
    name: "Near Threatened",
    color: "#CCE226",
    priority: 3,
  },
  LC: {
    code: "LC",
    name: "Least Concern",
    color: "#60C659",
    priority: 2,
  },
  DD: {
    code: "DD",
    name: "Data Deficient",
    color: "#D1D1C6",
    priority: 1,
  },
  NE: {
    code: "NE",
    name: "Not Evaluated",
    color: "#FFFFFF",
    priority: 0,
  },
};

// Population trend icons
export const POPULATION_TRENDS: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  decreasing: {
    label: "Decreasing",
    icon: "↓",
    description: "Population is declining",
  },
  stable: {
    label: "Stable",
    icon: "→",
    description: "Population is stable",
  },
  increasing: {
    label: "Increasing",
    icon: "↑",
    description: "Population is growing",
  },
  unknown: {
    label: "Unknown",
    icon: "?",
    description: "Population trend is unknown",
  },
};

export interface IUCNAssessment {
  taxonid: number;
  scientific_name: string;
  category: string;
  population_trend: string;
  assessment_date?: string;
  criteria?: string;
  main_common_name?: string;
}

export interface IUCNSpeciesData {
  taxonId: number;
  scientificName: string;
  category: string;
  categoryName: string;
  categoryColor: string;
  populationTrend: string;
  populationTrendLabel: string;
  assessmentDate?: string;
  criteria?: string;
  iucnUrl: string;
}

// Normalize scientific name for comparison
function normalizeScientificName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();
}

// Parse the IUCN category code from various formats
function parseCategory(status: string | undefined): string {
  if (!status) return "NE";

  const normalized = status.toUpperCase().trim();

  // Direct match
  if (IUCN_CATEGORIES[normalized]) {
    return normalized;
  }

  // Match by full name
  for (const [code, data] of Object.entries(IUCN_CATEGORIES)) {
    if (data.name.toUpperCase() === normalized) {
      return code;
    }
  }

  // Partial match
  if (normalized.includes("CRITICALLY")) return "CR";
  if (normalized.includes("ENDANGERED") && !normalized.includes("CRITICALLY"))
    return "EN";
  if (normalized.includes("VULNERABLE")) return "VU";
  if (normalized.includes("NEAR THREATENED")) return "NT";
  if (normalized.includes("LEAST CONCERN")) return "LC";
  if (normalized.includes("DATA DEFICIENT")) return "DD";
  if (normalized.includes("EXTINCT IN")) return "EW";
  if (normalized.includes("EXTINCT")) return "EX";

  return "NE";
}

// Parse population trend from various formats
function parsePopulationTrend(trend: string | undefined): string {
  if (!trend) return "unknown";

  const normalized = trend.toLowerCase().trim();

  if (normalized.includes("decreas") || normalized.includes("declin")) {
    return "decreasing";
  }
  if (normalized.includes("increas") || normalized.includes("grow")) {
    return "increasing";
  }
  if (normalized.includes("stable") || normalized.includes("constant")) {
    return "stable";
  }

  return "unknown";
}

// Fetch species data from IUCN Red List via GBIF's IUCN integration
// This is a workaround since direct IUCN API requires authentication
// GBIF provides IUCN data for many species through their API
export async function getIUCNFromGBIF(
  taxonKey: number
): Promise<IUCNSpeciesData | null> {
  try {
    // Get species details from GBIF which includes IUCN data
    const response = await fetch(
      `https://api.gbif.org/v1/species/${taxonKey}`,
      {
        next: { revalidate: 86400 * 7 }, // Cache for 7 days
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    // Check for IUCN threat status in GBIF data
    const threatStatus = data.threatStatus || data.iucnRedListCategory;

    if (!threatStatus) {
      // Try to get from species profile endpoint
      const profileResponse = await fetch(
        `https://api.gbif.org/v1/species/${taxonKey}/iucnRedListCategory`,
        {
          next: { revalidate: 86400 * 7 },
        }
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.category) {
          const category = parseCategory(profileData.category);
          const categoryData = IUCN_CATEGORIES[category];

          return {
            taxonId: taxonKey,
            scientificName: data.canonicalName || data.scientificName,
            category,
            categoryName: categoryData.name,
            categoryColor: categoryData.color,
            populationTrend: parsePopulationTrend(profileData.populationTrend),
            populationTrendLabel:
              POPULATION_TRENDS[
                parsePopulationTrend(profileData.populationTrend)
              ].label,
            iucnUrl: `https://www.iucnredlist.org/search?query=${encodeURIComponent(data.canonicalName || data.scientificName)}`,
          };
        }
      }

      return null;
    }

    const category = parseCategory(threatStatus);
    const categoryData = IUCN_CATEGORIES[category];

    return {
      taxonId: taxonKey,
      scientificName: data.canonicalName || data.scientificName,
      category,
      categoryName: categoryData.name,
      categoryColor: categoryData.color,
      populationTrend: "unknown",
      populationTrendLabel: POPULATION_TRENDS["unknown"].label,
      iucnUrl: `https://www.iucnredlist.org/search?query=${encodeURIComponent(data.canonicalName || data.scientificName)}`,
    };
  } catch (error) {
    console.error("IUCN data fetch error:", error);
    return null;
  }
}

// Get conservation data from multiple sources
// Combines local content data with external API data
export async function getConservationData(
  scientificName: string,
  localStatus?: string
): Promise<IUCNSpeciesData | null> {
  // If we have a local conservation status, use it as baseline
  if (localStatus) {
    const category = parseCategory(localStatus);
    const categoryData = IUCN_CATEGORIES[category];

    return {
      taxonId: 0,
      scientificName,
      category,
      categoryName: categoryData.name,
      categoryColor: categoryData.color,
      populationTrend: "unknown",
      populationTrendLabel: POPULATION_TRENDS["unknown"].label,
      iucnUrl: `https://www.iucnredlist.org/search?query=${encodeURIComponent(scientificName)}`,
    };
  }

  return null;
}

// Localized labels for IUCN data display
export function getIUCNLabels(locale: string) {
  const isSpanish = locale === "es";

  return {
    conservationStatus: isSpanish
      ? "Estado de Conservación"
      : "Conservation Status",
    populationTrend: isSpanish ? "Tendencia Poblacional" : "Population Trend",
    assessedBy: isSpanish ? "Evaluado por" : "Assessed by",
    viewOn: isSpanish ? "Ver en" : "View on",
    iucnRedList: "IUCN Red List",
    decreasing: isSpanish ? "En disminución" : "Decreasing",
    stable: isSpanish ? "Estable" : "Stable",
    increasing: isSpanish ? "En aumento" : "Increasing",
    unknown: isSpanish ? "Desconocida" : "Unknown",
    // Category translations
    categories: {
      EX: isSpanish ? "Extinta" : "Extinct",
      EW: isSpanish ? "Extinta en Estado Silvestre" : "Extinct in the Wild",
      CR: isSpanish ? "En Peligro Crítico" : "Critically Endangered",
      EN: isSpanish ? "En Peligro" : "Endangered",
      VU: isSpanish ? "Vulnerable" : "Vulnerable",
      NT: isSpanish ? "Casi Amenazada" : "Near Threatened",
      LC: isSpanish ? "Preocupación Menor" : "Least Concern",
      DD: isSpanish ? "Datos Insuficientes" : "Data Deficient",
      NE: isSpanish ? "No Evaluada" : "Not Evaluated",
    } as Record<string, string>,
  };
}
