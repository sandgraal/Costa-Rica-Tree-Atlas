import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { captureApiError } from "@/lib/error-tracking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createHash, randomBytes } from "crypto";
import type {
  ContributionType,
  ContributionStatus,
  ContributionPriority,
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
      region: body.region?.trim().substring(0, 255) || null,
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
        scientific_name, common_name_en, common_name_es, family, region,
        proposed_images, contributor_name, contributor_email, session_id,
        ip_hash, user_id, status, priority, locale, created_at, updated_at
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
        ${contributionData.region},
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
    captureApiError(error, "/api/contributions", "POST");

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

// Valid enum values for input validation
const VALID_TYPES: ContributionType[] = [
  "NEW_SPECIES",
  "CORRECTION",
  "LOCAL_KNOWLEDGE",
  "TRANSLATION",
];
const VALID_STATUSES: ContributionStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "IMPLEMENTED",
  "REJECTED",
  "DUPLICATE",
];
const VALID_PRIORITIES: ContributionPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

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
  region: string | null;
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
  // Joined from contributor_profiles (admin only)
  trust_level: string | null;
  reputation_score: number | null;
}

function transformContribution(c: ContributionRow, isAdmin: boolean) {
  return {
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
    region: c.region,
    proposedImages: c.proposed_images,
    contributorName: isAdmin ? c.contributor_name : null,
    contributorEmail: isAdmin ? c.contributor_email : null,
    sessionId: c.session_id,
    userId: c.user_id,
    status: c.status,
    priority: c.priority,
    contributorTrustLevel: isAdmin ? c.trust_level : null,
    contributorReputationScore: isAdmin ? c.reputation_score : null,
    reviewedBy: c.reviewed_by,
    reviewedAt: c.reviewed_at,
    reviewNotes: c.review_notes,
    resolvedPrId: c.resolved_pr_id,
    locale: c.locale,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

/**
 * GET /api/contributions - List contributions (public: own contributions only, admin: all)
 *
 * Uses parameterized queries to prevent SQL injection. All filter values are
 * validated against known enum values before use.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = !!session?.user?.id;
    const sessionId = getSessionId(request);

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Validate filter values against known enums (prevent injection via enum cast)
    const typeFilter = searchParams.get("type") as ContributionType | null;
    const statusFilter = searchParams.get(
      "status"
    ) as ContributionStatus | null;
    const priorityFilter = searchParams.get(
      "priority"
    ) as ContributionPriority | null;
    const treeSlugFilter = searchParams.get("treeSlug")?.trim() || null;

    if (typeFilter && !VALID_TYPES.includes(typeFilter)) {
      return NextResponse.json(
        { success: false, error: "Invalid type filter" },
        { status: 400 }
      );
    }
    if (statusFilter && !VALID_STATUSES.includes(statusFilter)) {
      return NextResponse.json(
        { success: false, error: "Invalid status filter" },
        { status: 400 }
      );
    }
    if (priorityFilter && !VALID_PRIORITIES.includes(priorityFilter)) {
      return NextResponse.json(
        { success: false, error: "Invalid priority filter" },
        { status: 400 }
      );
    }

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)),
      100
    );
    const offset = (page - 1) * pageSize;

    // Build WHERE conditions dynamically using Prisma.sql fragments so that any
    // combination of filters is supported without a combinatorial if/else tree.
    // All values are validated above, so enum casts are safe.
    const conditions: Prisma.Sql[] = [];
    if (!isAdmin) conditions.push(Prisma.sql`c.session_id = ${sessionId}`);
    if (typeFilter)
      conditions.push(Prisma.sql`c.type = ${typeFilter}::"ContributionType"`);
    if (statusFilter)
      conditions.push(
        Prisma.sql`c.status = ${statusFilter}::"ContributionStatus"`
      );
    if (priorityFilter)
      conditions.push(
        Prisma.sql`c.priority = ${priorityFilter}::"ContributionPriority"`
      );
    if (treeSlugFilter)
      conditions.push(Prisma.sql`c.tree_slug = ${treeSlugFilter}`);

    const whereClause =
      conditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`
        : Prisma.empty;

    const contributions = await prisma.$queryRaw<ContributionRow[]>`
      SELECT c.*, cp.trust_level, cp.reputation_score
      FROM contributions c
      LEFT JOIN contributor_profiles cp ON c.session_id = cp.session_id
      ${whereClause}
      ORDER BY c.created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
    const countResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM contributions c
      ${whereClause}`;

    const total = Number(countResult[0]?.count || 0);
    const transformedContributions = contributions.map((c: ContributionRow) =>
      transformContribution(c, isAdmin)
    );

    return NextResponse.json({
      contributions: transformedContributions,
      total,
      page,
      pageSize,
      hasMore: offset + contributions.length < total,
    });
  } catch (error) {
    captureApiError(error, "/api/contributions", "GET");

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
