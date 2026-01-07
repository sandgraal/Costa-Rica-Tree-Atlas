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
 */
function getOptimizedDir(slug: string): string {
  return path.join(
    process.cwd(),
    "public",
    "images",
    "trees",
    "optimized",
    slug
  );
}

/**
 * Check if optimized variants exist for an image
 */
export function getOptimizedVariants(
  slug: string,
  imageType: "featured" | string = "featured"
): OptimizedImageVariants | null {
  const optimizedDir = getOptimizedDir(slug);

  if (!fs.existsSync(optimizedDir)) {
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
  // Try optimized variants first
  const variants = getOptimizedVariants(slug, imageType);

  if (variants) {
    // Prefer AVIF, fallback to WebP, then JPEG
    const src = variants.avif || variants.webp || variants.jpeg!;

    return {
      src,
      type: "optimized",
      fallback: externalUrl,
    };
  }

  // Try local original image
  const localPath = path.join(
    process.cwd(),
    "public",
    "images",
    "trees",
    `${slug}.jpg`
  );
  if (fs.existsSync(localPath)) {
    return {
      src: `/images/trees/${slug}.jpg`,
      type: "local",
      fallback: externalUrl,
    };
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

  if (!fs.existsSync(optimizedDir)) {
    return undefined;
  }

  const srcSetEntries: string[] = [];
  const sizes = [
    { width: 400, file: "400w.webp" },
    { width: 800, file: "800w.webp" },
    { width: 1200, file: "1200w.webp" },
    { width: 1600, file: "1600w.webp" },
  ];

  for (const { width, file } of sizes) {
    const filePath = path.join(optimizedDir, file);
    if (fs.existsSync(filePath)) {
      srcSetEntries.push(`/images/trees/optimized/${slug}/${file} ${width}w`);
    }
  }

  return srcSetEntries.length > 0 ? srcSetEntries.join(", ") : undefined;
}
