/**
 * Image Resolution Utility
 *
 * Resolves image sources with fallback chain:
 * 1. Local optimized (AVIF → WebP → JPEG)
 * 2. Local original (/images/trees/{slug}.jpg)
 * 3. External URL
 */

import path from "path";
import fs from "fs";
import { validateSlug } from "@/lib/validation/slug";
import { safePath } from "@/lib/filesystem/safe-path";

export interface OptimizedImageVariants {
  avif?: string;
  webp?: string;
  jpeg?: string;
  original?: string;
}

export interface ImageResolution {
  src: string;
  srcSet?: string;
  fallback?: string;
  type: "optimized" | "local" | "external";
}

/**
 * Get path to optimized image directory for a given slug
 * Validates slug to prevent path traversal attacks
 */
function getOptimizedDir(slug: string): string | null {
  // Validate slug for security
  const validation = validateSlug(slug);
  if (!validation.valid) {
    console.error(`Invalid slug in getOptimizedDir: ${validation.error}`);
    return null;
  }

  try {
    const baseDir = path.join(process.cwd(), "public", "images", "trees");
    return safePath(baseDir, "optimized", validation.sanitized!);
  } catch (error) {
    console.error(`Path traversal attempt detected: ${error}`);
    return null;
  }
}

/**
 * Check if optimized variants exist for an image
 */
export function getOptimizedVariants(
  slug: string,
  imageType: "featured" | string = "featured"
): OptimizedImageVariants | null {
  const optimizedDir = getOptimizedDir(slug);

  if (!optimizedDir || !fs.existsSync(optimizedDir)) {
    return null;
  }

  const variants: OptimizedImageVariants = {};

  // For featured images, we want the largest size (original)
  // For gallery images, we want medium size (800w)
  const targetSize = imageType === "featured" ? "original" : "800w";

  const avifPath = path.join(optimizedDir, `${targetSize}.avif`);
  const webpPath = path.join(optimizedDir, `${targetSize}.webp`);
  const jpegPath = path.join(optimizedDir, `${targetSize}.jpg`);

  if (fs.existsSync(avifPath)) {
    variants.avif = `/images/trees/optimized/${slug}/${targetSize}.avif`;
  }

  if (fs.existsSync(webpPath)) {
    variants.webp = `/images/trees/optimized/${slug}/${targetSize}.webp`;
  }

  if (fs.existsSync(jpegPath)) {
    variants.jpeg = `/images/trees/optimized/${slug}/${targetSize}.jpg`;
  }

  return Object.keys(variants).length > 0 ? variants : null;
}

/**
 * Resolve best image source with fallback chain:
 * 1. Local optimized (AVIF → WebP → JPEG)
 * 2. Local original (/images/trees/{slug}.jpg)
 * 3. External URL
 */
export function resolveImageSource(
  slug: string,
  externalUrl?: string,
  imageType: "featured" | string = "featured"
): ImageResolution {
  // Validate slug first
  const slugValidation = validateSlug(slug);
  if (!slugValidation.valid) {
    console.error(
      `Invalid slug in resolveImageSource: ${slugValidation.error}`
    );
    // Fallback to external URL or empty
    if (externalUrl) {
      return {
        src: externalUrl,
        type: "external",
      };
    }
    return {
      src: "",
      type: "external",
    };
  }

  // Try optimized variants first
  const variants = getOptimizedVariants(slug, imageType);

  if (variants) {
    // Prefer AVIF, fallback to WebP, then JPEG
    const src = variants.avif || variants.webp || variants.jpeg;

    if (src) {
      return {
        src,
        type: "optimized",
        fallback: externalUrl,
      };
    }
  }

  // Try local original image
  try {
    const baseDir = path.join(process.cwd(), "public", "images", "trees");
    const localPath = safePath(baseDir, `${slugValidation.sanitized!}.jpg`);

    if (fs.existsSync(localPath)) {
      return {
        src: `/images/trees/${slugValidation.sanitized!}.jpg`,
        type: "local",
        fallback: externalUrl,
      };
    }
  } catch (error) {
    console.error(`Error checking local image: ${error}`);
  }

  // Fallback to external URL
  if (externalUrl) {
    return {
      src: externalUrl,
      type: "external",
    };
  }

  // No image available
  return {
    src: "",
    type: "external",
  };
}

/**
 * Generate responsive srcSet for optimized images
 */
export function generateSrcSet(slug: string): string | undefined {
  const optimizedDir = getOptimizedDir(slug);

  if (!optimizedDir || !fs.existsSync(optimizedDir)) {
    return undefined;
  }

  const srcSetEntries: string[] = [];
  const sizes = [
    { width: 400, file: "400w.webp" },
    { width: 800, file: "800w.webp" },
    { width: 1200, file: "1200w.webp" },
    { width: 1600, file: "1600w.webp" },
  ];

  // Validate slug for URL construction
  const slugValidation = validateSlug(slug);
  if (!slugValidation.valid) {
    return undefined;
  }

  for (const { width, file } of sizes) {
    const filePath = path.join(optimizedDir, file);
    if (fs.existsSync(filePath)) {
      srcSetEntries.push(
        `/images/trees/optimized/${slugValidation.sanitized!}/${file} ${width}w`
      );
    }
  }

  return srcSetEntries.length > 0 ? srcSetEntries.join(", ") : undefined;
}
