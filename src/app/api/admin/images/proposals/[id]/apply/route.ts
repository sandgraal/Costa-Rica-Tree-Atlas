/**
 * Apply an approved image proposal
 *
 * POST /api/admin/images/proposals/[id]/apply
 *
 * Downloads the proposed image, saves it, replaces the current image,
 * updates the tree MDX frontmatter if needed, and creates an audit trail.
 *
 * Requires admin authentication.
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { existsSync, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { validateSlug } from "@/lib/validation/slug";
import { safePath } from "@/lib/filesystem/safe-path";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ProposalRow {
  id: string;
  tree_slug: string;
  image_type: string;
  current_url: string | null;
  proposed_url: string;
  proposed_source: string | null;
  proposed_alt: string | null;
  status: string;
  quality_score: number | null;
  resolution: string | null;
  file_size: number | null;
}

// Project paths
const ROOT_DIR = process.cwd();
const IMAGES_DIR = path.join(ROOT_DIR, "public/images/trees");
const CONTENT_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const CONTENT_ES_DIR = path.join(ROOT_DIR, "content/trees/es");

// Security limits
const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB max
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

/**
 * Download an image from a URL to a local file path.
 * Streams the response to disk with size limits and content-type validation.
 * Uses temp files to avoid partial writes on errors.
 * Follows redirects (up to 5 levels).
 */
async function downloadImage(
  url: string,
  destPath: string,
  maxRedirects = 5
): Promise<{ size: number; contentType: string }> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, { timeout: 30000 }, (response) => {
      // Handle redirects (301, 302, 303, 307, 308)
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        if (maxRedirects <= 0) {
          reject(new Error("Too many redirects"));
          return;
        }
        const locationHeader = Array.isArray(response.headers.location)
          ? response.headers.location[0]
          : response.headers.location;
        try {
          // Resolve relative URLs using the original URL as base
          const resolvedUrl = new URL(locationHeader, url).toString();
          downloadImage(resolvedUrl, destPath, maxRedirects - 1)
            .then(resolve)
            .catch(reject);
        } catch (err) {
          reject(err as Error);
        }
        return;
      }

      if (response.statusCode !== 200) {
        reject(
          new Error(`Failed to download image: HTTP ${response.statusCode}`)
        );
        return;
      }

      // Validate content type (treat missing as invalid)
      const contentType = response.headers["content-type"];
      if (
        !contentType ||
        !ALLOWED_CONTENT_TYPES.some((type) => contentType.includes(type))
      ) {
        response.destroy(); // Drain/close the socket
        reject(
          new Error(
            `Invalid content type: ${contentType || "missing"}. Expected an image type.`
          )
        );
        return;
      }

      // Write to a temp file first to avoid partial writes
      const tempPath = `${destPath}.tmp`;
      let totalSize = 0;

      // Create a transform stream that enforces size limits and handles backpressure
      const sizeCheckTransform = new Transform({
        transform(chunk: Buffer, encoding, callback) {
          totalSize += chunk.length;

          // Enforce max size limit
          if (totalSize > MAX_IMAGE_SIZE) {
            callback(
              new Error(
                `Image too large: ${totalSize} bytes exceeds ${MAX_IMAGE_SIZE} byte limit`
              )
            );
            return;
          }

          // Pass chunk through (this respects backpressure automatically)
          callback(null, chunk);
        },
      });

      const writeStream = createWriteStream(tempPath);

      // Use pipeline to handle backpressure correctly and cleanup on errors
      pipeline(response, sizeCheckTransform, writeStream)
        .then(async () => {
          // Success: rename temp file to final destination
          try {
            await fs.rename(tempPath, destPath);
            resolve({ size: totalSize, contentType });
          } catch (renameErr) {
            // Cleanup temp file if rename fails
            try {
              await fs.unlink(tempPath);
            } catch {
              // Ignore cleanup errors
            }
            reject(renameErr);
          }
        })
        .catch(async (err) => {
          // Error: cleanup temp file
          try {
            await fs.unlink(tempPath);
          } catch {
            // Ignore cleanup errors
          }
          reject(err);
        });
    });

    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error("Download timed out"));
    });
  });
}

/**
 * Determine the filename for the image based on tree slug and image type.
 */
function getImageFilename(treeSlug: string, imageType: string): string {
  if (imageType === "FEATURED") {
    return `${treeSlug}.jpg`;
  }
  // Gallery images go in a subfolder
  return `gallery/${treeSlug}-${imageType.toLowerCase()}.jpg`;
}

/**
 * Check if tables exist in the database
 */
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
 * POST /api/admin/images/proposals/[id]/apply
 *
 * Apply an approved proposal: download, save, and update records.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

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

    // Fetch the proposal
    const proposals = await (
      prisma as unknown as {
        $queryRaw: (
          query: TemplateStringsArray,
          ...args: unknown[]
        ) => Promise<ProposalRow[]>;
      }
    ).$queryRaw`
      SELECT 
        id, tree_slug, image_type,
        current_url, proposed_url, proposed_source, proposed_alt,
        status, quality_score, resolution, file_size
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

    // Only approved proposals can be applied
    if (proposal.status !== "APPROVED") {
      return NextResponse.json(
        {
          error: `Cannot apply proposal with status "${proposal.status}". Only APPROVED proposals can be applied.`,
        },
        { status: 400 }
      );
    }

    // Validate tree_slug to prevent path traversal
    const slugValidation = validateSlug(proposal.tree_slug);
    if (!slugValidation.valid) {
      return NextResponse.json(
        {
          error: "Invalid tree slug",
          details: slugValidation.error,
        },
        { status: 400 }
      );
    }

    // Validate image_type (should be alphanumeric, safe for filesystem)
    const imageTypeValidation = validateSlug(proposal.image_type);
    if (!imageTypeValidation.valid) {
      return NextResponse.json(
        {
          error: "Invalid image type",
          details: imageTypeValidation.error,
        },
        { status: 400 }
      );
    }

    // Determine local image path using validated values
    const imageFilename = getImageFilename(
      slugValidation.sanitized!,
      proposal.image_type
    );

    let localImagePath: string;
    try {
      // Use safePath to ensure path stays within IMAGES_DIR
      if (imageFilename.includes("/")) {
        // For gallery images (e.g., "gallery/slug-type.jpg")
        const parts = imageFilename.split("/");
        localImagePath = safePath(IMAGES_DIR, ...parts);
      } else {
        // For featured images (e.g., "slug.jpg")
        localImagePath = safePath(IMAGES_DIR, imageFilename);
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: "Path validation failed",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    // Back up existing image if it exists
    const previousState: Record<string, unknown> = {
      imageType: proposal.image_type,
      treeSlug: proposal.tree_slug,
    };

    if (existsSync(localImagePath)) {
      const stats = await fs.stat(localImagePath);
      previousState.previousUrl = proposal.current_url;
      previousState.previousSize = stats.size;
    }

    // Download proposed image
    let downloadResult: { size: number; contentType: string };
    try {
      // Ensure destination directory exists
      await fs.mkdir(path.dirname(localImagePath), { recursive: true });

      downloadResult = await downloadImage(
        proposal.proposed_url,
        localImagePath
      );
    } catch (downloadError) {
      console.error("Failed to download proposed image:", downloadError);
      return NextResponse.json(
        {
          error: "Failed to download proposed image",
          details:
            downloadError instanceof Error
              ? downloadError.message
              : "Unknown error",
        },
        { status: 502 }
      );
    }

    // Update proposal status to APPLIED
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
        status = 'APPLIED',
        reviewed_by = ${session.user.id ?? null},
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
    `;

    // Create audit log entries
    const auditApplyId = `cla${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
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
        ${auditApplyId}, ${id}, ${proposal.tree_slug}, ${proposal.image_type},
        'PROPOSAL_APPLIED', ${session.user.id ?? null},
        ${JSON.stringify(previousState)},
        ${JSON.stringify({
          proposedUrl: proposal.proposed_url,
          localPath: `/images/trees/${imageFilename}`,
          fileSize: downloadResult.size,
          contentType: downloadResult.contentType,
        })},
        ${"Applied approved proposal"},
        NOW()
      )
    `;

    // Log image replacement audit entry
    const auditReplaceId = `cla${Date.now().toString(36)}${Math.random().toString(36).substring(2, 10)}`;
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
        ${auditReplaceId}, ${id}, ${proposal.tree_slug}, ${proposal.image_type},
        'IMAGE_REPLACED', ${session.user.id ?? null},
        ${JSON.stringify({ url: proposal.current_url })},
        ${JSON.stringify({
          url: `/images/trees/${imageFilename}`,
          source: proposal.proposed_source,
          size: downloadResult.size,
        })},
        ${proposal.proposed_alt ?? `Image replaced for ${proposal.tree_slug}`},
        NOW()
      )
    `;

    // Update MDX frontmatter if it's a featured image
    let frontmatterUpdated = false;
    if (proposal.image_type === "FEATURED") {
      const newImagePath = `/images/trees/${imageFilename}`;
      frontmatterUpdated = await updateTreeFrontmatter(
        proposal.tree_slug,
        newImagePath
      );
    }

    return NextResponse.json({
      data: {
        id,
        status: "APPLIED",
        localPath: `/images/trees/${imageFilename}`,
        fileSize: downloadResult.size,
        contentType: downloadResult.contentType,
        frontmatterUpdated,
      },
      message: "Proposal applied successfully",
    });
  } catch (error) {
    console.error("Error applying proposal:", error);
    return NextResponse.json(
      { error: "Failed to apply proposal" },
      { status: 500 }
    );
  }
}

/**
 * Update the featuredImage field in the tree's MDX frontmatter
 * for both EN and ES versions.
 */
async function updateTreeFrontmatter(
  treeSlug: string,
  newImagePath: string
): Promise<boolean> {
  let updated = false;

  for (const contentDir of [CONTENT_EN_DIR, CONTENT_ES_DIR]) {
    const mdxPath = path.join(contentDir, `${treeSlug}.mdx`);

    if (!existsSync(mdxPath)) {
      continue;
    }

    try {
      const content = await fs.readFile(mdxPath, "utf-8");

      // Match frontmatter section
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) continue;

      const frontmatter = frontmatterMatch[1];
      let updatedFrontmatter: string;

      // Replace existing featuredImage or add it
      if (/^featuredImage:/m.test(frontmatter)) {
        updatedFrontmatter = frontmatter.replace(
          /^featuredImage:.*$/m,
          `featuredImage: "${newImagePath}"`
        );
      } else {
        // Add featuredImage after the last frontmatter field
        updatedFrontmatter = frontmatter + `\nfeaturedImage: "${newImagePath}"`;
      }

      const updatedContent = content.replace(
        /^---\n[\s\S]*?\n---/,
        `---\n${updatedFrontmatter}\n---`
      );

      await fs.writeFile(mdxPath, updatedContent, "utf-8");
      updated = true;
    } catch (err) {
      console.error(
        `Failed to update frontmatter for ${treeSlug} in ${contentDir}:`,
        err
      );
    }
  }

  return updated;
}
