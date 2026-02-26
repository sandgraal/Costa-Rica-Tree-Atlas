/**
 * User Photo Upload API
 *
 * POST - Upload a photo for a tree species (via Cloudinary)
 *
 * Allows authenticated users to submit photos which create
 * ImageProposals for admin review. Images are stored in Cloudinary
 * for CDN-backed delivery with automatic format negotiation.
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import sharp from "sharp";
import prisma from "@/lib/prisma";
import { captureApiError } from "@/lib/error-tracking";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { type ImageType, IMAGE_TYPES } from "@/types/image-review";
import {
  uploadImage,
  isCloudinaryConfigured,
  MAX_UPLOAD_BYTES,
  ALLOWED_MIME_TYPES,
} from "@/lib/cloudinary";

// Minimum dimensions
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;

// Check if image tables exist
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

// Rate limit check (5 uploads per hour per user)
async function checkRateLimit(userId: string): Promise<boolean> {
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
    FROM image_proposals
    WHERE submitted_by = ${userId}
      AND source = 'USER_UPLOAD'
      AND created_at > ${oneHourAgo}
  `;

  return Number(counts[0]?.count ?? 0) < 5;
}

interface UploadResponse {
  data?: {
    proposalId: string;
    imageUrl: string;
    treeSlug: string;
    imageType: ImageType;
  };
  error?: string;
  message?: string;
}

/**
 * POST /api/images/upload
 * Upload a photo for a tree species
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
  try {
    // Check database tables exist
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      return NextResponse.json(
        {
          error: "Upload system not initialized",
          message: "Database migration required",
        },
        { status: 503 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to upload photos." },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check rate limit
    const withinLimit = await checkRateLimit(userId);
    if (!withinLimit) {
      return NextResponse.json(
        { error: "Upload limit reached. You can upload 5 photos per hour." },
        { status: 429 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const treeSlug = formData.get("treeSlug") as string | null;
    const imageType = formData.get("imageType") as ImageType | null;
    const attribution = formData.get("attribution") as string | null;
    const notes = formData.get("notes") as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!treeSlug) {
      return NextResponse.json(
        { error: "Tree slug is required" },
        { status: 400 }
      );
    }

    if (!imageType || !IMAGE_TYPES.includes(imageType)) {
      return NextResponse.json(
        {
          error: `Invalid image type. Must be one of: ${IMAGE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (
      !ALLOWED_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MIME_TYPES)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Check Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error: "Image storage not configured",
          message: "Cloud storage is not yet set up. Please contact the admin.",
        },
        { status: 503 }
      );
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Get image metadata and validate dimensions
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: "Could not read image dimensions" },
        { status: 400 }
      );
    }

    if (metadata.width < MIN_WIDTH || metadata.height < MIN_HEIGHT) {
      return NextResponse.json(
        {
          error: `Image too small. Minimum dimensions: ${MIN_WIDTH}x${MIN_HEIGHT}px`,
        },
        { status: 400 }
      );
    }

    // Upload to Cloudinary (handles optimisation and CDN delivery)
    const uploadResult = await uploadImage(buffer, {
      treeSlug,
      imageType,
      tags: [
        `user:${userId}`,
        `uploaded:${new Date().toISOString().slice(0, 10)}`,
      ],
    });

    const imageUrl = uploadResult.url;
    const resolution = `${uploadResult.width}x${uploadResult.height}`;
    const fileSize = uploadResult.bytes;

    // Calculate quality score based on resolution
    const qualityScore = Math.min(
      100,
      Math.round((uploadResult.width * uploadResult.height) / 10800)
    );

    // Create proposal ID
    const proposalId = `clp${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;

    // Build attribution string
    const attributionText = attribution
      ? `Uploaded by ${session.user.name || "contributor"}: ${attribution}`
      : `Uploaded by ${session.user.name || "contributor"}`;

    // Create image proposal
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
        proposed_url, proposed_source, proposed_alt,
        quality_score, resolution, file_size,
        source, reason, submitted_by,
        status, upvotes, downvotes, flags,
        created_at, updated_at
      ) VALUES (
        ${proposalId}, ${treeSlug}, ${imageType},
        ${imageUrl}, ${attributionText}, ${`${imageType} image of ${treeSlug}`},
        ${qualityScore}, ${resolution}, ${fileSize},
        'USER_UPLOAD', ${notes || "User uploaded photo"}, ${userId},
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
        id, proposal_id, action, performed_by, notes, created_at
      ) VALUES (
        ${auditId}, ${proposalId}, 'PROPOSAL_CREATED', ${userId},
        ${`User uploaded ${imageType} image for ${treeSlug} (Cloudinary: ${uploadResult.publicId})`}, NOW()
      )
    `;

    return NextResponse.json({
      data: {
        proposalId,
        imageUrl,
        treeSlug,
        imageType,
      },
      message: "Photo uploaded successfully! It will be reviewed by our team.",
    });
  } catch (error) {
    captureApiError(error, "/api/images/upload", "POST");
    return NextResponse.json(
      { error: "Failed to upload photo. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/images/upload
 * Get upload guidelines and limits
 */
export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    data: {
      authenticated: !!session?.user,
      cloudinaryConfigured: isCloudinaryConfigured(),
      limits: {
        maxFileSize: MAX_UPLOAD_BYTES,
        maxFileSizeMB: MAX_UPLOAD_BYTES / (1024 * 1024),
        allowedTypes: [...ALLOWED_MIME_TYPES],
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        uploadsPerHour: 5,
      },
      imageTypes: IMAGE_TYPES,
    },
  });
}
