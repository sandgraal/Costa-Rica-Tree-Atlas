/**
 * Image Proposals Admin API
 *
 * GET  - List proposals with filtering and pagination
 * POST - Create a new proposal
 *
 * NOTE: Requires database migration to be applied first.
 * Run: npx prisma migrate dev
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import {
  type ImageProposalStatus,
  type ImageProposalSource,
  type CreateProposalInput,
  IMAGE_TYPES,
  IMAGE_PROPOSAL_SOURCES,
} from "@/types/image-review";

// Check if image review tables exist
async function checkTablesExist(): Promise<boolean> {
  try {
    // Try to query the table - will fail if it doesn't exist
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
 * GET /api/admin/images/proposals
 * List proposals with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if tables exist
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        {
          error: "Image review system not initialized",
          message: "Database migration required. Run: npx prisma migrate dev",
        },
        { status: 503 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ImageProposalStatus | null;
    const treeSlug = searchParams.get("treeSlug");
    const source = searchParams.get("source") as ImageProposalSource | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100
    );
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

    // Build where clause
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (treeSlug) where.treeSlug = treeSlug;
    if (source) where.source = source;

    // Use raw query since Prisma client may not have types yet
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
      WHERE (${status}::text IS NULL OR status = ${status})
        AND (${treeSlug}::text IS NULL OR tree_slug = ${treeSlug})
        AND (${source}::text IS NULL OR source = ${source})
      ORDER BY ${sortBy === "createdAt" ? "created_at" : sortBy} ${sortOrder === "asc" ? "ASC" : "DESC"}
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit}
    `;

    const countResult = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<{ count: bigint }[]>;
      }
    ).$queryRaw`
      SELECT COUNT(*) as count
      FROM image_proposals
      WHERE (${status}::text IS NULL OR status = ${status})
        AND (${treeSlug}::text IS NULL OR tree_slug = ${treeSlug})
        AND (${source}::text IS NULL OR source = ${source})
    `;
    const total = Number(countResult[0]?.count ?? 0);

    return NextResponse.json({
      data: proposals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/images/proposals
 * Create a new proposal
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication for non-workflow sources
    const authHeader = request.headers.get("authorization");
    const isWorkflowRequest = authHeader?.startsWith("Bearer workflow-");

    if (!isWorkflowRequest) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Check if tables exist
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        {
          error: "Image review system not initialized",
          message: "Database migration required. Run: npx prisma migrate dev",
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body = (await request.json()) as CreateProposalInput;

    // Validate required fields
    if (
      !body.treeSlug ||
      !body.imageType ||
      !body.proposedUrl ||
      !body.source
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: treeSlug, imageType, proposedUrl, source",
        },
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

    // Validate source
    if (!IMAGE_PROPOSAL_SOURCES.includes(body.source)) {
      return NextResponse.json(
        {
          error: `Invalid source. Must be one of: ${IMAGE_PROPOSAL_SOURCES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check for duplicate pending proposal using raw query
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
      LIMIT 1
    `;

    if (existingProposals.length > 0) {
      return NextResponse.json(
        {
          error:
            "A pending proposal already exists for this tree and image type",
          existingProposalId: existingProposals[0].id,
        },
        { status: 409 }
      );
    }

    // Generate a CUID for the new proposal
    const proposalId = `clp${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;

    // Create the proposal using raw query
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
        current_url, current_source, current_alt,
        proposed_url, proposed_source, proposed_alt,
        quality_score, resolution, file_size,
        source, reason, workflow_run_id,
        status, upvotes, downvotes, flag_count,
        created_at, updated_at
      ) VALUES (
        ${proposalId}, ${body.treeSlug}, ${body.imageType},
        ${body.currentUrl ?? null}, ${body.currentSource ?? null}, ${body.currentAlt ?? null},
        ${body.proposedUrl}, ${body.proposedSource ?? null}, ${body.proposedAlt ?? null},
        ${body.qualityScore ?? null}, ${body.resolution ?? null}, ${body.fileSize ?? null},
        ${body.source}, ${body.reason ?? null}, ${body.workflowRunId ?? null},
        'PENDING', 0, 0, 0,
        NOW(), NOW()
      )
    `;

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
        action, new_value, notes, created_at
      ) VALUES (
        ${auditId}, ${proposalId}, ${body.treeSlug}, ${body.imageType},
        'PROPOSAL_CREATED',
        ${JSON.stringify({
          proposedUrl: body.proposedUrl,
          source: body.source,
          reason: body.reason,
        })},
        ${body.reason ?? null},
        NOW()
      )
    `;

    // Fetch the created proposal
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
        proposed_url as "proposedUrl", source, status,
        created_at as "createdAt"
      FROM image_proposals
      WHERE id = ${proposalId}
    `;

    return NextResponse.json({ data: proposals[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json(
      { error: "Failed to create proposal" },
      { status: 500 }
    );
  }
}
