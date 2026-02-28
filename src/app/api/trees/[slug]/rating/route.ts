import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { captureApiError } from "@/lib/error-tracking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createHash, randomBytes } from "crypto";
import { allTrees } from "contentlayer/generated";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Hash an IP address for privacy-preserving abuse prevention
 */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").substring(0, 64);
}

/**
 * Get or generate a session ID for anonymous rating
 */
function getSessionId(request: NextRequest): string {
  const sessionCookie = request.cookies.get("rating_session");
  if (sessionCookie) {
    return sessionCookie.value;
  }
  return createHash("sha256")
    .update(`${Date.now()}-${randomBytes(32).toString("hex")}`)
    .digest("hex")
    .substring(0, 64);
}

/**
 * Validate that a tree slug exists in the content
 */
function isValidTreeSlug(slug: string): boolean {
  return allTrees.some((t) => t.slug === slug);
}

interface RatingAggregation {
  avg_rating: number | null;
  total_count: bigint;
}

interface RatingRow {
  rating: number;
}

/**
 * GET /api/trees/[slug]/rating - Get aggregate rating for a tree
 *
 * Returns average rating and total count. Also returns the current
 * user's rating if they have one.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug || !isValidTreeSlug(slug)) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    const sessionId = getSessionId(request);

    // Get aggregate rating
    const aggregation = await prisma.$queryRaw<RatingAggregation[]>`
      SELECT
        AVG(rating)::float as avg_rating,
        COUNT(*) as total_count
      FROM tree_ratings
      WHERE tree_slug = ${slug}
    `;

    // Get current user's rating
    const userRating = await prisma.$queryRaw<RatingRow[]>`
      SELECT rating FROM tree_ratings
      WHERE tree_slug = ${slug} AND session_id = ${sessionId}
    `;

    const avg = aggregation[0]?.avg_rating;
    const count = Number(aggregation[0]?.total_count || 0);

    return NextResponse.json({
      treeSlug: slug,
      averageRating: avg ? Math.round(avg * 10) / 10 : null,
      totalRatings: count,
      userRating: userRating[0]?.rating || null,
    });
  } catch (error) {
    captureApiError(error, `/api/trees/${(await params).slug}/rating`, "GET");

    // Handle missing table gracefully
    if (
      error instanceof Error &&
      (error.message.includes("tree_ratings") ||
        error.message.includes("P1001"))
    ) {
      return NextResponse.json({
        treeSlug: (await params).slug,
        averageRating: null,
        totalRatings: 0,
        userRating: null,
        message: "Rating system is being set up.",
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch rating" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trees/[slug]/rating - Submit or update a rating
 *
 * Accepts: { rating: 1-5 }
 * Uses session cookie for identity. One rating per session per tree.
 * If the user already rated this tree, the rating is updated (upsert).
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug || !isValidTreeSlug(slug)) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    const body = await request.json();
    const { rating } = body;

    // Validate rating value
    if (
      typeof rating !== "number" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Get identity
    const session = await getServerSession(authOptions);
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = hashIp(ip);
    const sessionId = getSessionId(request);

    // Rate limiting: max 50 rating actions per hour per IP.
    // Uses updated_at so that upserts (re-ratings) are counted, not just new inserts.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const rateCheck = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM tree_ratings
      WHERE ip_hash = ${ipHash}
      AND updated_at > ${oneHourAgo}
    `;
    const recentCount = Number(rateCheck[0]?.count || 0);
    if (recentCount >= 50) {
      return NextResponse.json(
        { error: "Too many ratings. Please try again later." },
        { status: 429 }
      );
    }

    // Upsert: insert or update existing rating
    await prisma.$executeRaw`
      INSERT INTO tree_ratings (id, tree_slug, rating, session_id, ip_hash, user_id, created_at, updated_at)
      VALUES (
        gen_random_uuid()::text,
        ${slug},
        ${rating},
        ${sessionId},
        ${ipHash},
        ${session?.user?.id || null},
        NOW(),
        NOW()
      )
      ON CONFLICT (tree_slug, session_id)
      DO UPDATE SET
        rating = ${rating},
        updated_at = NOW()
    `;

    // Get updated aggregate
    const aggregation = await prisma.$queryRaw<RatingAggregation[]>`
      SELECT
        AVG(rating)::float as avg_rating,
        COUNT(*) as total_count
      FROM tree_ratings
      WHERE tree_slug = ${slug}
    `;

    const avg = aggregation[0]?.avg_rating;
    const count = Number(aggregation[0]?.total_count || 0);

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        treeSlug: slug,
        userRating: rating,
        averageRating: avg ? Math.round(avg * 10) / 10 : rating,
        totalRatings: count,
      },
      { status: 200 }
    );

    // Set session cookie if new
    if (!request.cookies.get("rating_session")) {
      response.cookies.set("rating_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    captureApiError(error, `/api/trees/${(await params).slug}/rating`, "POST");

    // Handle missing table gracefully
    if (
      error instanceof Error &&
      (error.message.includes("tree_ratings") ||
        error.message.includes("P1001"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating system is being set up. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
