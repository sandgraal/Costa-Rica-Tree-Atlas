import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { captureApiError } from "@/lib/error-tracking";
import { calculateReputation, type ContributorStats } from "@/lib/reputation";
import type {
  ContributionStatus,
  ContributionPriority,
} from "@/types/contributions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/contributions/[id] - Get a single contribution (admin only)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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
    }

    const contributions = await prisma.$queryRaw<ContributionRow[]>`
      SELECT * FROM contributions WHERE id = ${id}
    `;

    if (contributions.length === 0) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    const c = contributions[0];
    const contribution = {
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
      contributorName: c.contributor_name,
      contributorEmail: c.contributor_email,
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
    };

    return NextResponse.json({ contribution });
  } catch (error) {
    captureApiError(error, "/api/admin/contributions/[id]", "GET");
    return NextResponse.json(
      { error: "Failed to fetch contribution" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/contributions/[id] - Update contribution status (admin only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { action, notes, priority, resolvedPrId } = body as {
      action: "approve" | "reject" | "review" | "implement" | "duplicate";
      notes?: string;
      priority?: ContributionPriority;
      resolvedPrId?: string;
    };

    // Map action to status
    const statusMap: Record<string, ContributionStatus> = {
      approve: "APPROVED",
      reject: "REJECTED",
      review: "UNDER_REVIEW",
      implement: "IMPLEMENTED",
      duplicate: "DUPLICATE",
    };

    const newStatus = statusMap[action];
    if (!newStatus) {
      return NextResponse.json(
        {
          error: `Invalid action. Must be one of: ${Object.keys(statusMap).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Update the contribution
    await prisma.$executeRaw`
      UPDATE contributions
      SET 
        status = ${newStatus}::"ContributionStatus",
        priority = COALESCE(${priority}::"ContributionPriority", priority),
        reviewed_by = ${session.user.id},
        reviewed_at = NOW(),
        review_notes = COALESCE(${notes || null}, review_notes),
        resolved_pr_id = COALESCE(${resolvedPrId || null}, resolved_pr_id),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    // Recalculate contributor reputation on status changes that affect scoring
    if (["approve", "reject", "implement"].includes(action)) {
      try {
        await recalculateContributorReputation(id);
      } catch (reputationError) {
        // Non-blocking — log but don't fail the review action
        console.warn("Failed to recalculate reputation:", reputationError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Contribution ${action}ed successfully`,
      status: newStatus,
    });
  } catch (error) {
    captureApiError(error, "/api/admin/contributions/[id]", "PATCH");
    return NextResponse.json(
      { error: "Failed to update contribution" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/contributions/[id] - Delete a contribution (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.$executeRaw`
      DELETE FROM contributions WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: "Contribution deleted successfully",
    });
  } catch (error) {
    captureApiError(error, "/api/admin/contributions/[id]", "DELETE");
    return NextResponse.json(
      { error: "Failed to delete contribution" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Reputation recalculation helper
// ---------------------------------------------------------------------------

interface ContributionCountRow {
  type: string;
  status: string;
  count: bigint;
}

interface CountRow {
  count: bigint;
}

/**
 * Recalculate a contributor's reputation after a review action.
 * Looks up the contribution's sessionId, aggregates all their stats,
 * and upserts the ContributorProfile.
 */
async function recalculateContributorReputation(
  contributionId: string
): Promise<void> {
  // Get the session ID for this contribution
  const contributions = await prisma.$queryRaw<
    [{ session_id: string }]
  >`SELECT session_id FROM contributions WHERE id = ${contributionId}`;

  if (contributions.length === 0) return;
  const sessionId = contributions[0].session_id;

  // Aggregate contribution stats
  const contributionCounts = await prisma.$queryRaw<ContributionCountRow[]>`
    SELECT type, status, COUNT(*) as count
    FROM contributions
    WHERE session_id = ${sessionId}
    GROUP BY type, status
  `;

  // Count ratings
  const ratingCounts = await prisma.$queryRaw<CountRow[]>`
    SELECT COUNT(*) as count FROM tree_ratings WHERE session_id = ${sessionId}
  `;

  // Count approved photos
  let photoCounts: CountRow[] = [{ count: BigInt(0) }];
  try {
    photoCounts = await prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*) as count
      FROM image_proposals
      WHERE source = 'USER_UPLOAD'::"ImageProposalSource"
      AND status IN ('APPROVED'::"ImageProposalStatus", 'APPLIED'::"ImageProposalStatus")
      AND id IN (
        SELECT proposal_id FROM image_audits
        WHERE actor_session = ${sessionId}
        AND action = 'PROPOSAL_CREATED'::"ImageAuditAction"
      )
    `;
  } catch {
    // image tables may not exist
  }

  // Check if already EXPERT (preserve admin-granted level)
  const existingProfiles = await prisma.$queryRaw<
    [{ trust_level: string }]
  >`SELECT trust_level FROM contributor_profiles WHERE session_id = ${sessionId}`;
  const isExpert =
    existingProfiles.length > 0 && existingProfiles[0].trust_level === "EXPERT";

  // Build stats
  const stats: ContributorStats = {
    totalContributions: contributionCounts.reduce(
      (sum: number, r: ContributionCountRow) => sum + Number(r.count),
      0
    ),
    approvedContributions: contributionCounts
      .filter(
        (r: ContributionCountRow) =>
          r.status === "APPROVED" || r.status === "IMPLEMENTED"
      )
      .reduce(
        (sum: number, r: ContributionCountRow) => sum + Number(r.count),
        0
      ),
    rejectedContributions: contributionCounts
      .filter((r: ContributionCountRow) => r.status === "REJECTED")
      .reduce(
        (sum: number, r: ContributionCountRow) => sum + Number(r.count),
        0
      ),
    approvedKnowledge: contributionCounts
      .filter(
        (r: ContributionCountRow) =>
          r.type === "LOCAL_KNOWLEDGE" &&
          (r.status === "APPROVED" || r.status === "IMPLEMENTED")
      )
      .reduce(
        (sum: number, r: ContributionCountRow) => sum + Number(r.count),
        0
      ),
    approvedCorrections: contributionCounts
      .filter(
        (r: ContributionCountRow) =>
          r.type === "CORRECTION" &&
          (r.status === "APPROVED" || r.status === "IMPLEMENTED")
      )
      .reduce(
        (sum: number, r: ContributionCountRow) => sum + Number(r.count),
        0
      ),
    totalRatings: Number(ratingCounts[0]?.count || 0),
    totalPhotos: Number(photoCounts[0]?.count || 0),
    isExpert,
  };

  const result = calculateReputation(stats);

  // Upsert the profile
  await prisma.$executeRaw`
    INSERT INTO contributor_profiles (
      id, session_id, total_contributions, approved_contributions,
      rejected_contributions, total_ratings, total_photos,
      reputation_score, trust_level, badges, created_at, updated_at
    ) VALUES (
      gen_random_uuid()::text,
      ${sessionId},
      ${stats.totalContributions},
      ${stats.approvedContributions},
      ${stats.rejectedContributions},
      ${stats.totalRatings},
      ${stats.totalPhotos},
      ${result.reputationScore},
      ${result.trustLevel}::"TrustLevel",
      ${result.badges}::text[],
      NOW(),
      NOW()
    )
    ON CONFLICT (session_id) DO UPDATE SET
      total_contributions = EXCLUDED.total_contributions,
      approved_contributions = EXCLUDED.approved_contributions,
      rejected_contributions = EXCLUDED.rejected_contributions,
      total_ratings = EXCLUDED.total_ratings,
      total_photos = EXCLUDED.total_photos,
      reputation_score = EXCLUDED.reputation_score,
      trust_level = EXCLUDED.trust_level,
      badges = EXCLUDED.badges,
      updated_at = NOW()
  `;
}
