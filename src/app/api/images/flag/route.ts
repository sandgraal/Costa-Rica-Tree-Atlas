/**
 * Public Image Flag API
 *
 * POST - Flag an image with a reason (mislabeled, wrong species, etc.)
 *
 * This is a convenience endpoint that wraps the vote API specifically
 * for flagging images. It creates a vote with isFlag=true and optionally
 * auto-creates a proposal for the flagged image.
 *
 * Anonymous, session-based with rate limiting.
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

// Get or create a session ID for anonymous flagging
function getSessionId(request: NextRequest): string {
  const existingSession = request.cookies.get("vote-session")?.value;
  if (existingSession) return existingSession;

  return createHash("sha256")
    .update(`${Date.now()}-${Math.random()}`)
    .digest("hex")
    .substring(0, 64);
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

// Rate limit check (50 flags per hour per session - stricter than votes)
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
      AND is_flag = true
      AND created_at > ${oneHourAgo}
  `;

  return Number(counts[0]?.count ?? 0) < 50;
}

interface FlagRequest {
  treeSlug: string;
  imageType: ImageType;
  reason: ImageFlagReason;
  details?: string;
  proposalId?: string;
}

/**
 * POST /api/images/flag
 * Flag an image for review
 */
export async function POST(request: NextRequest) {
  try {
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        {
          error: "Flagging system not initialized",
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

    const body = (await request.json()) as FlagRequest;

    // Validate required fields
    if (!body.treeSlug || !body.imageType || !body.reason) {
      return NextResponse.json(
        { error: "Missing required fields: treeSlug, imageType, reason" },
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

    // Validate flag reason
    if (!IMAGE_FLAG_REASONS.includes(body.reason)) {
      return NextResponse.json(
        {
          error: `Invalid reason. Must be one of: ${IMAGE_FLAG_REASONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check for any existing vote from this session for the same image
    const existingVotes = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<{ id: string; is_flag: boolean }[]>;
      }
    ).$queryRaw`
      SELECT id, is_flag FROM image_votes
      WHERE session_id = ${sessionId}
        AND tree_slug = ${body.treeSlug}
        AND image_type = ${body.imageType}
      LIMIT 1
    `;

    if (existingVotes.length > 0) {
      const existingVote = existingVotes[0];

      // If it's already a flag, prevent duplicate flagging
      if (existingVote.is_flag) {
        return NextResponse.json(
          { error: "You have already flagged this image" },
          { status: 409 }
        );
      }

      // Otherwise, convert the existing vote into a flag
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
          is_flag = true,
          flag_reason = ${body.reason},
          flag_notes = ${body.details ?? null},
          proposal_id = ${body.proposalId ?? null}
        WHERE id = ${existingVote.id}
      `;

      return NextResponse.json({ data: { status: "updated_existing_vote_to_flag" } }, { status: 200 });
    }

    // Create the flag vote
    const flagId = `clf${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;

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
        ${flagId}, ${body.proposalId ?? null}, ${body.treeSlug}, ${body.imageType},
        NULL, ${true}, ${body.reason}, ${body.details ?? null},
        ${sessionId}, ${ipHash}, NOW()
      )
    `;

    // Update proposal flag count if flagging a proposal
    if (body.proposalId) {
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

    // Create audit entry for the flag
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
        'FLAG_SUBMITTED', ${sessionId}, ${ipHash ?? null},
        ${JSON.stringify({ reason: body.reason, details: body.details })},
        ${body.details ?? `Flagged: ${body.reason}`},
        NOW()
      )
    `;

    // Check if flag count threshold reached (3+ flags = auto-create proposal)
    const flagCounts = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<{ count: bigint }[]>;
      }
    ).$queryRaw`
      SELECT COUNT(*) as count
      FROM image_votes
      WHERE tree_slug = ${body.treeSlug}
        AND image_type = ${body.imageType}
        AND is_flag = true
    `;

    const totalFlags = Number(flagCounts[0]?.count ?? 0);
    let autoProposalCreated = false;

    // Auto-create a proposal if 3+ unique flags and no existing pending proposal
    if (totalFlags >= 3) {
      const existingProposals = await (
        prisma as unknown as {
          $queryRaw: (
            query: TemplateStringsArray,
            ...args: unknown[]
          ) => Promise<{ id: string }[]>;
        }
      ).$queryRaw`
        SELECT id FROM image_proposals
        WHERE tree_slug = ${body.treeSlug}
          AND image_type = ${body.imageType}
          AND status = 'PENDING'
          AND source = 'USER_FLAG'
        LIMIT 1
      `;

      if (existingProposals.length === 0) {
        // Derive current_url based on image type
        let currentUrl: string;
        if (body.imageType === "FEATURED") {
          currentUrl = `/images/trees/${body.treeSlug}.jpg`;
        } else {
          // For gallery images: /images/trees/gallery/{slug}-{type}.jpg
          currentUrl = `/images/trees/gallery/${body.treeSlug}-${body.imageType.toLowerCase()}.jpg`;
        }

        // For USER_FLAG proposals, proposed_url should be the same as current_url initially
        // The admin will need to find a replacement image themselves
        const proposalId = `clp${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
        await (
          prisma as unknown as {
            $executeRaw: (
              query: TemplateStringsArray,
              ...args: unknown[]
            ) => Promise<number>;
          }
        ).$executeRaw`
          INSERT INTO image_proposals (
            id, tree_slug, image_type,
            current_url, proposed_url, proposed_source,
            source, reason, status,
            flag_count, upvotes, downvotes,
            created_at, updated_at
          ) VALUES (
            ${proposalId}, ${body.treeSlug}, ${body.imageType},
            ${currentUrl}, ${currentUrl}, ${"user_flags"},
            'USER_FLAG', ${`Multiple users flagged this image (${totalFlags} flags). Most common reason: ${body.reason}. Requires admin to find replacement.`},
            'PENDING',
            ${totalFlags}, ${0}, ${0},
            NOW(), NOW()
          )
        `;
        autoProposalCreated = true;
      }
    }

    // Set session cookie in response
    const response = NextResponse.json(
      {
        data: {
          id: flagId,
          totalFlags,
          autoProposalCreated,
        },
        message: "Flag submitted. Thank you for helping improve image quality.",
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
    console.error("Error submitting flag:", error);
    return NextResponse.json(
      { error: "Failed to submit flag" },
      { status: 500 }
    );
  }
}
