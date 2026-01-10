import { NextRequest, NextResponse } from "next/server";
import { fetchBiodiversityData } from "@/lib/api/biodiversity";
import { validateScientificName } from "@/lib/validation";
import { rateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, "species");
  if ("response" in rateLimitResult) return rateLimitResult.response;

  const { searchParams } = request.nextUrl;
  const scientificName = searchParams.get("species");

  // Validate input
  const validation = validateScientificName(scientificName);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    // Use sanitized value with a timeout wrapper
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 15000)
    );

    const dataPromise = fetchBiodiversityData(validation.sanitized!);

    const data = await Promise.race([dataPromise, timeoutPromise]);

    return NextResponse.json(data, {
      headers: {
        // Cache for 1 hour on CDN, 24 hours stale-while-revalidate
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        ...rateLimitResult.headers,
      },
    });
  } catch (error) {
    console.error("Biodiversity API error:", error);

    // Return partial/empty data instead of error to prevent page breaks
    return NextResponse.json(
      {
        gbif: null,
        inaturalist: null,
        iucn: null,
        lastUpdated: new Date().toISOString(),
      },
      {
        status: 200, // Return 200 with empty data instead of 500
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          ...rateLimitResult.headers,
        },
      }
    );
  }
}
