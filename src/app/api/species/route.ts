import { NextRequest, NextResponse } from "next/server";
import { fetchBiodiversityData } from "@/lib/api/biodiversity";
import { validateScientificName } from "@/lib/validation";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limiting
  const identifier = getRateLimitIdentifier(request);
  const { allowed, remaining, resetTime } = rateLimit(identifier, {
    interval: 60000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  });

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetTime - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

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
        "X-RateLimit-Remaining": String(remaining),
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
