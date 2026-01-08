import path from "path";
import fs from "fs";
import { validateSlug } from "@/lib/validation/slug";
import { safePath } from "@/lib/filesystem/safe-path";

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
  // Validate slug for security
  const slugValidation = validateSlug(slug);
  if (!slugValidation.valid) {
    console.error(
      `Invalid slug in resolveImageSource: ${slugValidation.error}`
    );
    return {
      src: externalUrl || "/images/placeholder-tree.svg",
      type: "external",
    };
  }

  const sanitizedSlug = slugValidation.sanitized!;

  // Tier 1: Check for optimized images
  try {
    const baseDir = path.join(process.cwd(), "public", "images", "trees");
    const optimizedDir = safePath(baseDir, "optimized", sanitizedSlug);

    if (fs.existsSync(optimizedDir)) {
      // Prefer AVIF, fallback to WebP
      const avifPath = path.join(optimizedDir, "800w.avif");
      const webpPath = path.join(optimizedDir, "800w.webp");

      if (fs.existsSync(avifPath)) {
        return {
          src: `/images/trees/optimized/${sanitizedSlug}/800w.avif`,
          srcSet: generateSrcSet(sanitizedSlug, "avif"),
          type: "optimized",
        };
      }

      if (fs.existsSync(webpPath)) {
        return {
          src: `/images/trees/optimized/${sanitizedSlug}/800w.webp`,
          srcSet: generateSrcSet(sanitizedSlug, "webp"),
          type: "optimized",
        };
      }
    }

    // Tier 2: Check for original local image
    const originalPath = safePath(baseDir, `${sanitizedSlug}.jpg`);

    if (fs.existsSync(originalPath)) {
      return {
        src: `/images/trees/${sanitizedSlug}.jpg`,
        type: "original",
      };
    }
  } catch (error) {
    console.error(`Error resolving image path: ${error}`);
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
