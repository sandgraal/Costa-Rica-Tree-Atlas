import { NextRequest, NextResponse } from "next/server";
import { validateScientificName } from "@/lib/validation";
import { rateLimit, getRateLimitHeaders } from "@/lib/ratelimit";

const INATURALIST_API = "https://api.inaturalist.org/v1";

interface INaturalistPhoto {
  url: string;
  attribution: string;
  license_code: string;
}

interface INaturalistObservation {
  id: number;
  photos: INaturalistPhoto[];
  user: {
    login: string;
    name: string | null;
  };
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await rateLimit(request, "images");
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = request.nextUrl.searchParams;
  const scientificName = searchParams.get("name");

  // Validate input
  const validation = validateScientificName(scientificName);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    // First, get the taxon ID for the scientific name
    // Use sanitized value
    const taxonResponse = await fetch(
      `${INATURALIST_API}/taxa?q=${encodeURIComponent(validation.sanitized!)}&per_page=1`
    );

    if (!taxonResponse.ok) {
      throw new Error("Failed to fetch taxon data");
    }

    const taxonData = await taxonResponse.json();
    const taxon = taxonData.results?.[0];

    if (!taxon) {
      return NextResponse.json({ images: [] });
    }

    // Fetch observations with photos from Costa Rica
    // place_id=6924 is Costa Rica in iNaturalist
    const observationsResponse = await fetch(
      `${INATURALIST_API}/observations?taxon_id=${taxon.id}&place_id=6924&photos=true&quality_grade=research&per_page=20&order=desc&order_by=votes`
    );

    if (!observationsResponse.ok) {
      throw new Error("Failed to fetch observations");
    }

    const observationsData = await observationsResponse.json();
    const observations: INaturalistObservation[] =
      observationsData.results || [];

    // Extract unique photos with attribution
    const seenUrls = new Set<string>();
    const images: Array<{
      url: string;
      attribution: string;
      observationId: number;
    }> = [];

    for (const obs of observations) {
      for (const photo of obs.photos || []) {
        // Get medium-sized photo URL
        // iNaturalist URLs are like: https://static.inaturalist.org/photos/123456/square.jpg
        // We want medium: https://static.inaturalist.org/photos/123456/medium.jpg
        const mediumUrl = photo.url?.replace(/\/square\./, "/medium.");

        if (mediumUrl && !seenUrls.has(mediumUrl)) {
          seenUrls.add(mediumUrl);

          // Format attribution
          let attribution = photo.attribution || "";
          if (!attribution && obs.user) {
            attribution = `© ${obs.user.name || obs.user.login}`;
            if (photo.license_code) {
              attribution += ` (${photo.license_code.toUpperCase()})`;
            }
          }

          images.push({
            url: mediumUrl,
            attribution,
            observationId: obs.id,
          });
        }
      }
    }

    const rateLimitHeaders = await getRateLimitHeaders(request, "images");

    return NextResponse.json({
      taxonId: taxon.id,
      taxonName: taxon.name,
      commonName: taxon.preferred_common_name,
      images: images.slice(0, 12), // Limit to 12 images
    }, {
      headers: rateLimitHeaders,
    });
  } catch (error) {
    console.error("Error fetching species images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
