/**
 * Cloudinary Integration
 *
 * Provides upload, delete, and URL generation for tree images.
 * Uses the Cloudinary Node.js SDK v2.
 *
 * Required environment variables:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * @see https://cloudinary.com/documentation/node_integration
 */

import { v2 as cloudinary } from "cloudinary";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/** Whether Cloudinary is configured (all three vars present). */
export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && API_KEY && API_SECRET);
}

/** Tracks whether the SDK has already been configured (singleton guard). */
let _sdkConfigured = false;

/** Configures the SDK once. Throws if required env vars are missing. */
function ensureConfigured(): void {
  if (_sdkConfigured) return;

  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true,
  });

  _sdkConfigured = true;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Root folder inside Cloudinary for all atlas images. */
const UPLOAD_FOLDER = "costa-rica-tree-atlas";

/** Max file size in bytes (10 MB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Allowed MIME types for uploads. */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CloudinaryUploadResult {
  /** Cloudinary public_id (e.g. "costa-rica-tree-atlas/ceiba/bark-a1b2c3d4") */
  publicId: string;
  /** Full secure delivery URL */
  url: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** File size in bytes */
  bytes: number;
  /** Detected format (jpg, png, webp, avif) */
  format: string;
}

export interface CloudinaryDeleteResult {
  result: "ok" | "not found";
}

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/**
 * Upload an image buffer to Cloudinary.
 *
 * Images are placed in `costa-rica-tree-atlas/{treeSlug}/` and are
 * automatically optimised on delivery (f_auto, q_auto).
 *
 * @param buffer  - Raw image bytes (already validated by caller)
 * @param options - Tree slug, image type, and optional tags
 * @returns       - Upload result with URL and metadata
 */
export async function uploadImage(
  buffer: Buffer,
  options: {
    treeSlug: string;
    imageType: string;
    tags?: string[];
  }
): Promise<CloudinaryUploadResult> {
  ensureConfigured();

  const { treeSlug, imageType, tags = [] } = options;
  const folder = `${UPLOAD_FOLDER}/${treeSlug}`;

  // Upload with automatic quality & format optimisation
  const result = await new Promise<CloudinaryUploadResult>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          // Descriptive public_id suffix (Cloudinary prepends the folder)
          public_id: `${imageType}-${Date.now().toString(36)}`,
          resource_type: "image",
          // Automatic best-format on delivery (AVIF → WebP → JPEG)
          format: "webp",
          transformation: [
            {
              width: 1200,
              height: 900,
              crop: "limit", // keeps aspect ratio, never upscales
              quality: "auto:good",
            },
          ],
          tags: ["tree-atlas", treeSlug, imageType, ...tags],
          // Overwrite if same public_id exists
          overwrite: false,
          // Return metadata
          eager_async: true,
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
            return;
          }
          if (!result) {
            reject(new Error("Cloudinary upload returned no result"));
            return;
          }
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
          });
        }
      );

      uploadStream.end(buffer);
    }
  );

  return result;
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

/**
 * Delete an image from Cloudinary by its public_id.
 */
export async function deleteImage(
  publicId: string
): Promise<CloudinaryDeleteResult> {
  ensureConfigured();

  const result = await cloudinary.uploader.destroy(publicId);
  return { result: result.result };
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Build an optimised delivery URL for a Cloudinary image.
 *
 * Uses `f_auto` (AVIF/WebP negotiation) and `q_auto` by default.
 */
export function buildImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?:
      | "auto"
      | "auto:best"
      | "auto:good"
      | "auto:eco"
      | "auto:low"
      | number;
    format?: "auto" | "webp" | "avif" | "jpg" | "png";
    crop?: "fill" | "limit" | "fit" | "thumb";
    gravity?: "auto" | "face" | "center";
  } = {}
): string {
  ensureConfigured();

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "limit",
    gravity,
  } = options;

  const transformation: Record<string, unknown> = {
    quality,
    fetch_format: format,
    crop,
  };
  if (width) transformation.width = width;
  if (height) transformation.height = height;
  if (gravity) transformation.gravity = gravity;

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [transformation],
  });
}
