import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
    console.error("Error fetching contribution:", error);
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

    return NextResponse.json({
      success: true,
      message: `Contribution ${action}ed successfully`,
      status: newStatus,
    });
  } catch (error) {
    console.error("Error updating contribution:", error);
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
    console.error("Error deleting contribution:", error);
    return NextResponse.json(
      { error: "Failed to delete contribution" },
      { status: 500 }
    );
  }
}
