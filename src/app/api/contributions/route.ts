import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createHash, randomBytes } from "crypto";
import type {
  ContributionType,
  ContributionStatus,
  ContributionPriority,
  ContributionFilters,
} from "@/types/contributions";

/**
 * Hash an IP address for privacy-preserving rate limiting
 */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").substring(0, 64);
}

/**
 * Generate or retrieve session ID from cookies
 */
function getSessionId(request: NextRequest): string {
  const sessionCookie = request.cookies.get("contribution_session");
  if (sessionCookie) {
    return sessionCookie.value;
  }
  // Generate new session ID using cryptographically secure random bytes
  return createHash("sha256")
    .update(`${Date.now()}-${randomBytes(32).toString("hex")}`)
    .digest("hex")
    .substring(0, 64);
}

/**
 * Rate limiting: max 10 contributions per hour per session
 */
async function checkRateLimit(
  sessionId: string,
  ipHash: string
): Promise<{ allowed: boolean; remaining: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const recentCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM contributions
      WHERE (session_id = ${sessionId} OR ip_hash = ${ipHash})
      AND created_at > ${oneHourAgo}
    `;

    const count = Number(recentCount[0]?.count || 0);
    const maxPerHour = 10;

    return {
      allowed: count < maxPerHour,
      remaining: Math.max(0, maxPerHour - count),
    };
  } catch {
    // If database check fails, allow the request but log
    console.warn("Rate limit check failed, allowing request");
    return { allowed: true, remaining: 10 };
  }
}

/**
 * POST /api/contributions - Submit a new contribution
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get session info
    const session = await getServerSession(authOptions);
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ipHash = hashIp(ip);
    const sessionId = getSessionId(request);

    // Check rate limit
    const rateLimit = await checkRateLimit(sessionId, ipHash);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          remaining: rateLimit.remaining,
        },
        { status: 429 }
      );
    }

    // Validate required fields
    const { type, title, description } = body;

    if (!type || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: type, title, and description",
        },
        { status: 400 }
      );
    }

    // Validate contribution type
    const validTypes: ContributionType[] = [
      "NEW_SPECIES",
      "CORRECTION",
      "LOCAL_KNOWLEDGE",
      "TRANSLATION",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid contribution type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate tree slug for non-NEW_SPECIES types
    if (type !== "NEW_SPECIES" && !body.treeSlug) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tree slug is required for corrections, local knowledge, and translations",
        },
        { status: 400 }
      );
    }

    // Sanitize and prepare contribution data
    const contributionData = {
      type: type as ContributionType,
      treeSlug: body.treeSlug?.trim() || null,
      targetField: body.targetField?.trim() || null,
      title: title.trim().substring(0, 255),
      description: description.trim().substring(0, 10000),
      evidence: body.evidence?.trim().substring(0, 5000) || null,
      scientificName: body.scientificName?.trim().substring(0, 255) || null,
      commonNameEn: body.commonNameEn?.trim().substring(0, 255) || null,
      commonNameEs: body.commonNameEs?.trim().substring(0, 255) || null,
      family: body.family?.trim().substring(0, 100) || null,
      proposedImages: Array.isArray(body.proposedImages)
        ? body.proposedImages.slice(0, 10).map((url: string) => url.trim())
        : [],
      contributorName: body.contributorName?.trim().substring(0, 255) || null,
      contributorEmail: body.contributorEmail?.trim().substring(0, 255) || null,
      sessionId,
      ipHash,
      userId: session?.user?.id || null,
      locale: body.locale?.trim().substring(0, 5) || "en",
    };

    // Insert contribution using raw SQL (Prisma types may not be generated yet)
    const result = await prisma.$queryRaw<[{ id: string }]>`
      INSERT INTO contributions (
        id, type, tree_slug, target_field, title, description, evidence,
        scientific_name, common_name_en, common_name_es, family, proposed_images,
        contributor_name, contributor_email, session_id, ip_hash, user_id,
        status, priority, locale, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::text,
        ${contributionData.type}::"ContributionType",
        ${contributionData.treeSlug},
        ${contributionData.targetField},
        ${contributionData.title},
        ${contributionData.description},
        ${contributionData.evidence},
        ${contributionData.scientificName},
        ${contributionData.commonNameEn},
        ${contributionData.commonNameEs},
        ${contributionData.family},
        ${contributionData.proposedImages}::text[],
        ${contributionData.contributorName},
        ${contributionData.contributorEmail},
        ${contributionData.sessionId},
        ${contributionData.ipHash},
        ${contributionData.userId},
        'PENDING'::"ContributionStatus",
        'MEDIUM'::"ContributionPriority",
        ${contributionData.locale},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    const contributionId = result[0]?.id;

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Thank you for your contribution! It will be reviewed soon.",
        contributionId,
        remaining: rateLimit.remaining - 1,
      },
      { status: 201 }
    );

    // Set session cookie if new
    if (!request.cookies.get("contribution_session")) {
      response.cookies.set("contribution_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    return response;
  } catch (error) {
    console.error("Error creating contribution:", error);

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      (error.message.includes("P1001") ||
        error.message.includes("contributions"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Contribution system is being set up. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit contribution. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contributions - List contributions (public: own contributions only, admin: all)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = !!session?.user?.id;
    const sessionId = getSessionId(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: ContributionFilters = {
      type: searchParams.get("type") as ContributionType | undefined,
      status: searchParams.get("status") as ContributionStatus | undefined,
      treeSlug: searchParams.get("treeSlug") || undefined,
      priority: searchParams.get("priority") as
        | ContributionPriority
        | undefined,
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: Math.min(
        parseInt(searchParams.get("pageSize") || "20", 10),
        100
      ),
    };

    const offset = ((filters.page || 1) - 1) * (filters.pageSize || 20);
    const limit = filters.pageSize || 20;

    // Build query conditions
    // For non-admin users, only show their own contributions
    let whereClause = isAdmin ? "1=1" : `session_id = '${sessionId}'`;

    if (filters.type) {
      whereClause += ` AND type = '${filters.type}'`;
    }
    if (filters.status) {
      whereClause += ` AND status = '${filters.status}'`;
    }
    if (filters.treeSlug) {
      whereClause += ` AND tree_slug = '${filters.treeSlug}'`;
    }
    if (filters.priority) {
      whereClause += ` AND priority = '${filters.priority}'`;
    }

    // Query contributions
    interface ContributionRow {
      id: string;
      type: string;
      tree_slug: string | null;
      target_field: string | null;
      title: string;
      description: string;
      evidence: string | null;
      scientific_name: string | null;
      common_name_en: string | null;
      common_name_es: string | null;
      family: string | null;
      proposed_images: string[];
      contributor_name: string | null;
      contributor_email: string | null;
      session_id: string;
      user_id: string | null;
      status: string;
      priority: string;
      reviewed_by: string | null;
      reviewed_at: Date | null;
      review_notes: string | null;
      resolved_pr_id: string | null;
      locale: string;
      created_at: Date;
      updated_at: Date;
    }

    const contributions = (await prisma.$queryRawUnsafe(
      `SELECT * FROM contributions WHERE ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    )) as ContributionRow[];

    // Get total count
    const countResult = (await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as count FROM contributions WHERE ${whereClause}`
    )) as [{ count: bigint }];
    const total = Number(countResult[0]?.count || 0);

    // Transform to camelCase
    const transformedContributions = contributions.map(
      (c: ContributionRow) => ({
        id: c.id,
        type: c.type,
        treeSlug: c.tree_slug,
        targetField: c.target_field,
        title: c.title,
        description: c.description,
        evidence: c.evidence,
        scientificName: c.scientific_name,
        commonNameEn: c.common_name_en,
        commonNameEs: c.common_name_es,
        family: c.family,
        proposedImages: c.proposed_images,
        contributorName: isAdmin ? c.contributor_name : null, // Hide from non-admins
        contributorEmail: isAdmin ? c.contributor_email : null, // Hide from non-admins
        sessionId: c.session_id,
        userId: c.user_id,
        status: c.status,
        priority: c.priority,
        reviewedBy: c.reviewed_by,
        reviewedAt: c.reviewed_at,
        reviewNotes: c.review_notes,
        resolvedPrId: c.resolved_pr_id,
        locale: c.locale,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })
    );

    return NextResponse.json({
      contributions: transformedContributions,
      total,
      page: filters.page || 1,
      pageSize: filters.pageSize || 20,
      hasMore: offset + contributions.length < total,
    });
  } catch (error) {
    console.error("Error listing contributions:", error);

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      (error.message.includes("P1001") ||
        error.message.includes("contributions"))
    ) {
      return NextResponse.json(
        {
          contributions: [],
          total: 0,
          page: 1,
          pageSize: 20,
          hasMore: false,
          message: "Contribution system is being set up.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contributions.",
      },
      { status: 500 }
    );
  }
}
