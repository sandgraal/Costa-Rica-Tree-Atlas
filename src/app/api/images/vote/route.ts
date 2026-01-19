/**
 * Public Image Voting API
 *
 * POST - Submit a vote or flag for an image
 * GET  - Get vote stats for an image
 *
 * Anonymous voting with session-based tracking
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";
import {
  type ImageType,
  type ImageFlagReason,
  IMAGE_TYPES,
  IMAGE_FLAG_REASONS,
} from "@/types/image-review";

// Get or create a session ID for anonymous voting
function getSessionId(request: NextRequest): string {
  const cookies = request.cookies;
  const existingSession = cookies.get("vote-session")?.value;
  if (existingSession) return existingSession;

  // Generate a new session ID
  const newSession = createHash("sha256")
    .update(`${Date.now()}-${Math.random()}`)
    .digest("hex")
    .substring(0, 64);
  return newSession;
}

// Hash IP address for rate limiting (privacy-preserving)
function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256").update(ip).digest("hex").substring(0, 64);
}

// Check if tables exist
async function checkTablesExist(): Promise<boolean> {
  try {
    await (
      prisma as unknown as {
        $queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
      }
    ).$queryRaw`SELECT 1 FROM image_votes LIMIT 1`;
    return true;
  } catch {
    return false;
  }
}

// Rate limit check (100 votes per hour per session)
async function checkRateLimit(sessionId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const counts = await (
    prisma as unknown as {
      $queryRaw: (
        query: TemplateStringsArray,
        ...args: unknown[]
      ) => Promise<{ count: bigint }[]>;
    }
  ).$queryRaw`
    SELECT COUNT(*) as count
    FROM image_votes
    WHERE session_id = ${sessionId}
      AND created_at > ${oneHourAgo}
  `;

  return Number(counts[0]?.count ?? 0) < 100;
}

interface VoteRequest {
  proposalId?: string;
  treeSlug: string;
  imageType: ImageType;
  isUpvote?: boolean; // true=upvote, false=downvote
  isFlag?: boolean;
  flagReason?: ImageFlagReason;
  flagNotes?: string;
}

/**
 * POST /api/images/vote
 * Submit a vote or flag
 */
export async function POST(request: NextRequest) {
  try {
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        {
          error: "Voting system not initialized",
          message: "Database migration required",
        },
        { status: 503 }
      );
    }

    const sessionId = getSessionId(request);
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip");
    const ipHash = hashIp(ip);

    // Check rate limit
    const withinLimit = await checkRateLimit(sessionId);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as VoteRequest;

    // Validate required fields
    if (!body.treeSlug || !body.imageType) {
      return NextResponse.json(
        { error: "Missing required fields: treeSlug, imageType" },
        { status: 400 }
      );
    }

    // Validate imageType
    if (!IMAGE_TYPES.includes(body.imageType)) {
      return NextResponse.json(
        {
          error: `Invalid imageType. Must be one of: ${IMAGE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Must provide either vote or flag
    if (body.isUpvote === undefined && !body.isFlag) {
      return NextResponse.json(
        { error: "Must provide either a vote (isUpvote) or flag (isFlag)" },
        { status: 400 }
      );
    }

    // Validate flag reason if flagging
    if (
      body.isFlag &&
      body.flagReason &&
      !IMAGE_FLAG_REASONS.includes(body.flagReason)
    ) {
      return NextResponse.json(
        {
          error: `Invalid flagReason. Must be one of: ${IMAGE_FLAG_REASONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check for existing vote from this session
    const existingVotes = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<{ id: string }[]>;
      }
    ).$queryRaw`
      SELECT id FROM image_votes
      WHERE session_id = ${sessionId}
        AND tree_slug = ${body.treeSlug}
        AND image_type = ${body.imageType}
        AND (${body.proposalId}::text IS NULL OR proposal_id = ${body.proposalId})
      LIMIT 1
    `;

    if (existingVotes.length > 0) {
      // Update existing vote
      await (
        prisma as unknown as {
          $executeRaw: (
            query: TemplateStringsArray,
            ...args: unknown[]
          ) => Promise<number>;
        }
      ).$executeRaw`
        UPDATE image_votes
        SET 
          is_upvote = ${body.isUpvote ?? null},
          is_flag = ${body.isFlag ?? false},
          flag_reason = ${body.flagReason ?? null},
          flag_notes = ${body.flagNotes ?? null}
        WHERE id = ${existingVotes[0].id}
      `;

      return NextResponse.json({
        data: { id: existingVotes[0].id, updated: true },
        message: "Vote updated",
      });
    }

    // Create new vote
    const voteId = `clv${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;

    await (
      prisma as unknown as {
        $executeRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<number>;
      }
    ).$executeRaw`
      INSERT INTO image_votes (
        id, proposal_id, tree_slug, image_type,
        is_upvote, is_flag, flag_reason, flag_notes,
        session_id, ip_hash, created_at
      ) VALUES (
        ${voteId}, ${body.proposalId ?? null}, ${body.treeSlug}, ${body.imageType},
        ${body.isUpvote ?? null}, ${body.isFlag ?? false}, ${body.flagReason ?? null}, ${body.flagNotes ?? null},
        ${sessionId}, ${ipHash}, NOW()
      )
    `;

    // Update proposal vote counts if voting on a proposal
    if (body.proposalId) {
      if (body.isUpvote === true) {
        await (
          prisma as unknown as {
            $executeRaw: (
              query: TemplateStringsArray,
              ...args: unknown[]
            ) => Promise<number>;
          }
        )
          .$executeRaw`UPDATE image_proposals SET upvotes = upvotes + 1, updated_at = NOW() WHERE id = ${body.proposalId}`;
      } else if (body.isUpvote === false) {
        await (
          prisma as unknown as {
            $executeRaw: (
              query: TemplateStringsArray,
              ...args: unknown[]
            ) => Promise<number>;
          }
        )
          .$executeRaw`UPDATE image_proposals SET downvotes = downvotes + 1, updated_at = NOW() WHERE id = ${body.proposalId}`;
      }
      if (body.isFlag) {
        await (
          prisma as unknown as {
            $executeRaw: (
              query: TemplateStringsArray,
              ...args: unknown[]
            ) => Promise<number>;
          }
        )
          .$executeRaw`UPDATE image_proposals SET flag_count = flag_count + 1, updated_at = NOW() WHERE id = ${body.proposalId}`;
      }
    }

    // Create audit entry for flags (they may need admin attention)
    if (body.isFlag) {
      const auditId = `cla${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
      await (
        prisma as unknown as {
          $executeRaw: (
            query: TemplateStringsArray,
            ...args: unknown[]
          ) => Promise<number>;
        }
      ).$executeRaw`
        INSERT INTO image_audits (
          id, proposal_id, tree_slug, image_type,
          action, actor_session, ip_address, new_value, notes, created_at
        ) VALUES (
          ${auditId}, ${body.proposalId ?? null}, ${body.treeSlug}, ${body.imageType},
          'FLAG_SUBMITTED', ${sessionId}, ${ip ?? null},
          ${JSON.stringify({ reason: body.flagReason, notes: body.flagNotes })},
          ${body.flagNotes ?? null},
          NOW()
        )
      `;
    }

    // Set session cookie in response
    const response = NextResponse.json(
      {
        data: { id: voteId, created: true },
        message: body.isFlag ? "Flag submitted" : "Vote recorded",
      },
      { status: 201 }
    );

    response.cookies.set("vote-session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error("Error submitting vote:", error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/images/vote?treeSlug=xxx&imageType=xxx
 * Get vote stats for an image
 */
export async function GET(request: NextRequest) {
  try {
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        { error: "Voting system not initialized" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const treeSlug = searchParams.get("treeSlug");
    const imageType = searchParams.get("imageType") as ImageType;
    const proposalId = searchParams.get("proposalId");

    if (!treeSlug || !imageType) {
      return NextResponse.json(
        { error: "Missing required parameters: treeSlug, imageType" },
        { status: 400 }
      );
    }

    // Get vote counts
    const stats = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<{ upvotes: bigint; downvotes: bigint; flags: bigint }[]>;
      }
    ).$queryRaw`
      SELECT 
        COALESCE(SUM(CASE WHEN is_upvote = true THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN is_upvote = false THEN 1 ELSE 0 END), 0) as downvotes,
        COALESCE(SUM(CASE WHEN is_flag = true THEN 1 ELSE 0 END), 0) as flags
      FROM image_votes
      WHERE tree_slug = ${treeSlug}
        AND image_type = ${imageType}
        AND (${proposalId}::text IS NULL OR proposal_id = ${proposalId})
    `;

    // Check if current session has voted
    const sessionId = getSessionId(request);
    const sessionVotes = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<{ is_upvote: boolean | null; is_flag: boolean }[]>;
      }
    ).$queryRaw`
      SELECT is_upvote, is_flag
      FROM image_votes
      WHERE session_id = ${sessionId}
        AND tree_slug = ${treeSlug}
        AND image_type = ${imageType}
        AND (${proposalId}::text IS NULL OR proposal_id = ${proposalId})
      LIMIT 1
    `;

    return NextResponse.json({
      data: {
        upvotes: Number(stats[0]?.upvotes ?? 0),
        downvotes: Number(stats[0]?.downvotes ?? 0),
        flags: Number(stats[0]?.flags ?? 0),
        score:
          Number(stats[0]?.upvotes ?? 0) - Number(stats[0]?.downvotes ?? 0),
        userVote:
          sessionVotes.length > 0
            ? {
                isUpvote: sessionVotes[0].is_upvote,
                isFlag: sessionVotes[0].is_flag,
              }
            : null,
      },
    });
  } catch (error) {
    console.error("Error fetching vote stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch vote stats" },
      { status: 500 }
    );
  }
}
