/**
 * User Photo Upload API
 *
 * POST - Upload a photo for a tree species
 *
 * Allows authenticated users to submit photos which create
 * ImageProposals for admin review.
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import sharp from "sharp";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { type ImageType, IMAGE_TYPES } from "@/types/image-review";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Allowed file types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Minimum dimensions
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
// Target dimensions for optimized images
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 900;

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
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
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

    // Generate unique filename
    const hash = createHash("sha256")
      .update(buffer)
      .update(Date.now().toString())
      .digest("hex")
      .substring(0, 16);
    const filename = `${treeSlug}-${imageType.toLowerCase()}-${hash}.webp`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "images", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Optimize and save image
    const optimizedBuffer = await sharp(buffer)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, optimizedBuffer);

    // Get optimized file size
    const fileSize = optimizedBuffer.length;
    const optimizedMetadata = await sharp(optimizedBuffer).metadata();
    const resolution = `${optimizedMetadata.width}x${optimizedMetadata.height}`;

    // Calculate simple quality score based on resolution
    const qualityScore = Math.min(
      100,
      Math.round(
        ((optimizedMetadata.width || 0) * (optimizedMetadata.height || 0)) /
          10800
      )
    );

    // Create image URL
    const imageUrl = `/images/uploads/${filename}`;

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
        ${`User uploaded ${imageType} image for ${treeSlug}`}, NOW()
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
    console.error("Upload error:", error);
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
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    data: {
      authenticated: !!session?.user,
      limits: {
        maxFileSize: MAX_FILE_SIZE,
        maxFileSizeMB: MAX_FILE_SIZE / (1024 * 1024),
        allowedTypes: ALLOWED_TYPES,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        uploadsPerHour: 5,
      },
      imageTypes: IMAGE_TYPES,
    },
  });
}
