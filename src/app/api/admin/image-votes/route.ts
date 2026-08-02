/**
 * Admin Image Votes API
 *
 * GET    - Batch fetch all admin image votes
 * POST   - Save/update an admin vote
 * DELETE - Remove a vote
 *
 * All endpoints require admin authentication.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { captureApiError } from "@/lib/error-tracking";
import prisma from "@/lib/prisma";
import { tableIsQueryable } from "@/lib/db/table-check";

// Shared probe: distinguishes "table missing" from "query failed".
// See src/lib/db/table-check.ts.
async function checkTablesExist(): Promise<boolean> {
  return tableIsQueryable("image_votes");
}

/**
 * GET /api/admin/image-votes
 * Returns all votes for the current admin user, keyed by treeSlug
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json({ data: { votes: {} } });
    }

    const userId = session.user.email;

    const rows = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<
          { id: string; tree_slug: string; is_upvote: boolean | null }[]
        >;
      }
    ).$queryRaw`
      SELECT id, tree_slug, is_upvote
      FROM image_votes
      WHERE user_id = ${userId}
        AND image_type = 'FEATURED'
    `;

    const votes: Record<string, { id: string; vote: "up" | "down" }> = {};
    for (const row of rows) {
      if (row.is_upvote !== null) {
        votes[row.tree_slug] = {
          id: row.id,
          vote: row.is_upvote ? "up" : "down",
        };
      }
    }

    return NextResponse.json({ data: { votes } });
  } catch (error) {
    captureApiError(error, "/api/admin/image-votes", "GET");
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/image-votes
 * Save or update an admin vote
 * Body: { treeSlug: string, vote: "up" | "down" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        { error: "Voting system not initialized" },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      treeSlug: string;
      vote: "up" | "down";
    };

    if (!body.treeSlug || !body.vote) {
      return NextResponse.json(
        { error: "Missing required fields: treeSlug, vote" },
        { status: 400 }
      );
    }

    if (body.vote !== "up" && body.vote !== "down") {
      return NextResponse.json(
        { error: "vote must be 'up' or 'down'" },
        { status: 400 }
      );
    }

    const userId = session.user.email;
    const isUpvote = body.vote === "up";

    // Check for existing vote
    const existing = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<{ id: string }[]>;
      }
    ).$queryRaw`
      SELECT id FROM image_votes
      WHERE user_id = ${userId}
        AND tree_slug = ${body.treeSlug}
        AND image_type = 'FEATURED'
      LIMIT 1
    `;

    if (existing.length > 0) {
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
        SET is_upvote = ${isUpvote}
        WHERE id = ${existing[0].id}
      `;

      return NextResponse.json({
        data: { id: existing[0].id, updated: true },
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
        id, tree_slug, image_type,
        is_upvote, is_flag,
        session_id, user_id, created_at
      ) VALUES (
        ${voteId}, ${body.treeSlug}, 'FEATURED',
        ${isUpvote}, false,
        ${`admin-${userId}`}, ${userId}, NOW()
      )
    `;

    return NextResponse.json(
      { data: { id: voteId, created: true } },
      { status: 201 }
    );
  } catch (error) {
    captureApiError(error, "/api/admin/image-votes", "POST");
    return NextResponse.json({ error: "Failed to save vote" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/image-votes
 * Remove a vote
 * Body: { treeSlug: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json({ data: { deleted: false } });
    }

    const body = (await request.json()) as { treeSlug: string };

    if (!body.treeSlug) {
      return NextResponse.json(
        { error: "Missing required field: treeSlug" },
        { status: 400 }
      );
    }

    const userId = session.user.email;

    await (
      prisma as unknown as {
        $executeRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<number>;
      }
    ).$executeRaw`
      DELETE FROM image_votes
      WHERE user_id = ${userId}
        AND tree_slug = ${body.treeSlug}
        AND image_type = 'FEATURED'
    `;

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    captureApiError(error, "/api/admin/image-votes", "DELETE");
    return NextResponse.json(
      { error: "Failed to delete vote" },
      { status: 500 }
    );
  }
}
