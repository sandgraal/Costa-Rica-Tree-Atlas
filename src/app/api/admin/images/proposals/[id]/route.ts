/**
 * Individual Image Proposal Admin API
 *
 * GET    - Get proposal details
 * PATCH  - Update proposal status (approve/deny/archive)
 * DELETE - Delete a proposal
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import {
  type ImageProposalStatus,
  IMAGE_PROPOSAL_STATUSES,
} from "@/types/image-review";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Check if image review tables exist
async function checkTablesExist(): Promise<boolean> {
  try {
    await (
      prisma as unknown as {
        $queryRaw: (query: TemplateStringsArray) => Promise<unknown>;
      }
    ).$queryRaw`SELECT 1 FROM image_proposals LIMIT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * GET /api/admin/images/proposals/[id]
 * Get proposal details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        { error: "Image review system not initialized" },
        { status: 503 }
      );
    }

    const proposals = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<unknown[]>;
      }
    ).$queryRaw`
      SELECT 
        id, tree_slug as "treeSlug", image_type as "imageType",
        current_url as "currentUrl", current_source as "currentSource", current_alt as "currentAlt",
        proposed_url as "proposedUrl", proposed_source as "proposedSource", proposed_alt as "proposedAlt",
        quality_score as "qualityScore", resolution, file_size as "fileSize",
        source, reason, workflow_run_id as "workflowRunId",
        status, reviewed_by as "reviewedBy", reviewed_at as "reviewedAt", review_notes as "reviewNotes",
        upvotes, downvotes, flag_count as "flagCount",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM image_proposals
      WHERE id = ${id}
    `;

    if (proposals.length === 0) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    // Get vote counts
    const voteCounts = await (
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
      WHERE proposal_id = ${id}
    `;

    // Get audit history
    const auditHistory = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<unknown[]>;
      }
    ).$queryRaw`
      SELECT 
        id, action, actor_id as "actorId", 
        previous_value as "previousValue", new_value as "newValue",
        notes, created_at as "createdAt"
      FROM image_audits
      WHERE proposal_id = ${id}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return NextResponse.json({
      data: {
        ...(proposals[0] as Record<string, unknown>),
        votes: {
          upvotes: Number(voteCounts[0]?.upvotes ?? 0),
          downvotes: Number(voteCounts[0]?.downvotes ?? 0),
          flags: Number(voteCounts[0]?.flags ?? 0),
        },
        auditHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching proposal:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposal" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/images/proposals/[id]
 * Update proposal status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        { error: "Image review system not initialized" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { status, reviewNotes } = body as {
      status: ImageProposalStatus;
      reviewNotes?: string;
    };

    // Validate status
    if (!status || !IMAGE_PROPOSAL_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${IMAGE_PROPOSAL_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Get current proposal
    const currentProposals = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<
          {
            id: string;
            status: string;
            tree_slug: string;
            image_type: string;
          }[]
        >;
      }
    ).$queryRaw`
      SELECT id, status, tree_slug, image_type
      FROM image_proposals
      WHERE id = ${id}
    `;

    if (currentProposals.length === 0) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    const currentProposal = currentProposals[0];
    const previousStatus = currentProposal.status;

    // Update the proposal
    await (
      prisma as unknown as {
        $executeRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<number>;
      }
    ).$executeRaw`
      UPDATE image_proposals
      SET 
        status = ${status},
        reviewed_by = ${session.user.id ?? null},
        reviewed_at = NOW(),
        review_notes = ${reviewNotes ?? null},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    // Determine audit action
    let auditAction: string;
    switch (status) {
      case "APPROVED":
        auditAction = "PROPOSAL_APPROVED";
        break;
      case "DENIED":
        auditAction = "PROPOSAL_DENIED";
        break;
      case "APPLIED":
        auditAction = "PROPOSAL_APPLIED";
        break;
      case "ARCHIVED":
        auditAction = "PROPOSAL_ARCHIVED";
        break;
      default:
        auditAction = "PROPOSAL_APPROVED"; // fallback
    }

    // Create audit log entry
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
        action, actor_id, previous_value, new_value, notes, created_at
      ) VALUES (
        ${auditId}, ${id}, ${currentProposal.tree_slug}, ${currentProposal.image_type},
        ${auditAction}, ${session.user.id ?? null},
        ${JSON.stringify({ status: previousStatus })},
        ${JSON.stringify({ status, reviewNotes })},
        ${reviewNotes ?? null},
        NOW()
      )
    `;

    return NextResponse.json({
      data: { id, status, reviewedAt: new Date() },
      message: `Proposal ${status.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json(
      { error: "Failed to update proposal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/images/proposals/[id]
 * Delete a proposal (only PENDING or DENIED)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        { error: "Image review system not initialized" },
        { status: 503 }
      );
    }

    // Check if proposal exists and is deletable
    const proposals = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<{ id: string; status: string }[]>;
      }
    ).$queryRaw`
      SELECT id, status
      FROM image_proposals
      WHERE id = ${id}
    `;

    if (proposals.length === 0) {
      return NextResponse.json(
        { error: "Proposal not found" },
        { status: 404 }
      );
    }

    const proposal = proposals[0];
    if (proposal.status === "APPLIED") {
      return NextResponse.json(
        { error: "Cannot delete an applied proposal" },
        { status: 400 }
      );
    }

    // Delete votes first (foreign key)
    await (
      prisma as unknown as {
        $executeRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<number>;
      }
    ).$executeRaw`DELETE FROM image_votes WHERE proposal_id = ${id}`;

    // Update audit logs to remove proposal reference (keep history)
    await (
      prisma as unknown as {
        $executeRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<number>;
      }
    )
      .$executeRaw`UPDATE image_audits SET proposal_id = NULL WHERE proposal_id = ${id}`;

    // Delete the proposal
    await (
      prisma as unknown as {
        $executeRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<number>;
      }
    ).$executeRaw`DELETE FROM image_proposals WHERE id = ${id}`;

    return NextResponse.json({ message: "Proposal deleted" });
  } catch (error) {
    console.error("Error deleting proposal:", error);
    return NextResponse.json(
      { error: "Failed to delete proposal" },
      { status: 500 }
    );
  }
}
