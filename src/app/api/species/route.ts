import { NextRequest, NextResponse } from "next/server";
import { getSpeciesProfile, matchSpecies } from "@/lib/gbif";
import { getSpeciesData } from "@/lib/inaturalist";
import { getIUCNFromGBIF, type IUCNSpeciesData } from "@/lib/iucn";

export interface BiodiversityData {
  gbif: {
    taxonKey: number;
    scientificName: string;
    globalOccurrences: number;
    costaRicaOccurrences: number;
    gbifUrl: string;
  } | null;
  inaturalist: {
    taxonId: number;
    scientificName: string;
    commonName?: string;
    observationsInCostaRica: number;
    researchGradeCount: number;
    photoUrl?: string;
    inatUrl: string;
  } | null;
  iucn: IUCNSpeciesData | null;
  lastUpdated: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const scientificName = searchParams.get("species");

  if (!scientificName) {
    return NextResponse.json(
      { error: "Missing species parameter" },
      { status: 400 }
    );
  }

  try {
    // First, get GBIF match to get taxon key for IUCN lookup
    const gbifMatch = await matchSpecies(scientificName);
    const taxonKey = gbifMatch?.usageKey;

    // Fetch data from all sources in parallel
    const [gbifData, inatData, iucnData] = await Promise.all([
      getSpeciesProfile(scientificName),
      getSpeciesData(scientificName),
      taxonKey ? getIUCNFromGBIF(taxonKey) : Promise.resolve(null),
    ]);

    const response: BiodiversityData = {
      gbif: gbifData
        ? {
            taxonKey: gbifData.taxonKey,
            scientificName: gbifData.scientificName,
            globalOccurrences: gbifData.occurrenceCount,
            costaRicaOccurrences: gbifData.costaRicaOccurrences,
            gbifUrl: gbifData.gbifUrl,
          }
        : null,
      inaturalist: inatData
        ? {
            taxonId: inatData.taxonId,
            scientificName: inatData.scientificName,
            commonName: inatData.commonName,
            observationsInCostaRica: inatData.observationsInCostaRica,
            researchGradeCount: inatData.researchGradeCount,
            photoUrl: inatData.photoUrl,
            inatUrl: inatData.inatUrl,
          }
        : null,
      iucn: iucnData,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      headers: {
        // Cache for 1 hour on CDN, 24 hours stale-while-revalidate
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Biodiversity API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch biodiversity data" },
      { status: 500 }
    );
  }
}
