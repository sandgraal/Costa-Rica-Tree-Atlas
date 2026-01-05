import { NextRequest, NextResponse } from "next/server";
import { fetchBiodiversityData } from "@/lib/api/biodiversity";
import { validateScientificName } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const scientificName = searchParams.get("species");

  // Validate input
  const validation = validateScientificName(scientificName);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    // Use sanitized value
    const data = await fetchBiodiversityData(validation.sanitized!);

    return NextResponse.json(data, {
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
