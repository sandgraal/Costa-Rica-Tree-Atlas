import { NextRequest, NextResponse } from "next/server";
import { fetchBiodiversityData } from "@/lib/api/biodiversity";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const scientificName = searchParams.get("species");

  if (!scientificName) {
    return NextResponse.json(
      { error: "Missing species parameter" },
      { status: 400 }
    );
  }

  // Validate input length to prevent abuse
  if (scientificName.length > 200) {
    return NextResponse.json({ error: "Parameter too long" }, { status: 400 });
  }

  try {
    const data = await fetchBiodiversityData(scientificName);

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
