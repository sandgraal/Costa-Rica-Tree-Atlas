import path from "path";
import fs from "fs";

export interface ImageSource {
  src: string;
  srcSet?: string;
  type: "optimized" | "original" | "external";
}

/**
 * Simplified image resolution with 3-tier fallback:
 * 1. Optimized local image (AVIF/WebP)
 * 2. Original local image
 * 3. External URL or placeholder
 */
export function resolveImageSource(
  slug: string,
  externalUrl?: string
): ImageSource {
  // Tier 1: Check for optimized images
  const optimizedDir = path.join(
    process.cwd(),
    "public",
    "images",
    "trees",
    "optimized",
    slug
  );

  if (fs.existsSync(optimizedDir)) {
    // Prefer AVIF, fallback to WebP
    const avifPath = path.join(optimizedDir, "800w.avif");
    const webpPath = path.join(optimizedDir, "800w.webp");

    if (fs.existsSync(avifPath)) {
      return {
        src: `/images/trees/optimized/${slug}/800w.avif`,
        srcSet: generateSrcSet(slug, "avif"),
        type: "optimized",
      };
    }

    if (fs.existsSync(webpPath)) {
      return {
        src: `/images/trees/optimized/${slug}/800w.webp`,
        srcSet: generateSrcSet(slug, "webp"),
        type: "optimized",
      };
    }
  }

  // Tier 2: Check for original local image
  const originalPath = path.join(
    process.cwd(),
    "public",
    "images",
    "trees",
    `${slug}.jpg`
  );

  if (fs.existsSync(originalPath)) {
    return {
      src: `/images/trees/${slug}.jpg`,
      type: "original",
    };
  }

  // Tier 3: Use external URL or placeholder
  return {
    src: externalUrl || "/images/placeholder-tree.svg",
    type: "external",
  };
}

function generateSrcSet(slug: string, format: "avif" | "webp"): string {
  const sizes = [400, 800, 1200];
  return sizes
    .map((w) => `/images/trees/optimized/${slug}/${w}w.${format} ${w}w`)
    .join(", ");
}
