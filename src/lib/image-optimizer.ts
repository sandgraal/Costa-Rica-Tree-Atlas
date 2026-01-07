/**
 * Image Optimization Utility
 *
 * High-performance image optimization using Sharp.
 * Generates multiple responsive sizes and modern formats (WebP, AVIF, JPEG).
 */

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

/**
 * Available image sizes for responsive images
 */
export const IMAGE_SIZES = {
  thumbnail: 400,
  small: 800,
  medium: 1200,
  large: 1600,
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

/**
 * Supported output formats
 */
export const IMAGE_FORMATS = ["webp", "avif", "jpg"] as const;
export type ImageFormat = (typeof IMAGE_FORMATS)[number];

/**
 * Compression quality settings per format
 */
const QUALITY_SETTINGS = {
  jpg: 80,
  webp: 75,
  avif: 70,
} as const;

/**
 * Configuration for image optimization
 */
export interface OptimizationConfig {
  inputPath: string;
  outputDir: string;
  sizes?: (ImageSize | "original")[];
  formats?: ImageFormat[];
  generateBlurPlaceholder?: boolean;
}

/**
 * Metadata for an optimized image
 */
export interface ImageMetadata {
  slug: string;
  originalSize: number;
  variants: {
    [key: string]: {
      width: number;
      height: number;
      size: number;
      path: string;
    };
  };
  blurDataURL?: string;
  generatedAt: string;
}

/**
 * Result of optimization operation
 */
export interface OptimizationResult {
  success: boolean;
  metadata: ImageMetadata;
  totalSizeBefore: number;
  totalSizeAfter: number;
  savings: number;
  savingsPercent: number;
}

/**
 * Generate a blur placeholder data URL for progressive loading
 */
async function generateBlurPlaceholder(
  inputPath: string
): Promise<string | undefined> {
  try {
    const buffer = await sharp(inputPath)
      .resize(10, 10, { fit: "inside" })
      .blur(1)
      .webp({ quality: 20 })
      .toBuffer();

    return `data:image/webp;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error(`Error generating blur placeholder: ${error}`);
    return undefined;
  }
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // eslint-disable-next-line security/detect-object-injection
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Optimize a single image and generate multiple sizes and formats
 */
export async function optimizeImage(
  config: OptimizationConfig
): Promise<OptimizationResult> {
  const {
    inputPath,
    outputDir,
    sizes = ["thumbnail", "small", "medium", "large", "original"],
    formats = ["webp", "avif", "jpg"],
    generateBlurPlaceholder: shouldGenerateBlur = true,
  } = config;

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Get original file size
  const originalSize = await getFileSize(inputPath);

  // Load and get image metadata
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width: originalWidth = 0 } = metadata;

  // Generate blur placeholder if requested
  const blurDataURL = shouldGenerateBlur
    ? await generateBlurPlaceholder(inputPath)
    : undefined;

  const slug = path.basename(outputDir);
  const variants: ImageMetadata["variants"] = {};
  let totalSizeAfter = 0;

  // Process each size
  for (const sizeKey of sizes) {
    const targetWidth =
      sizeKey === "original" ? originalWidth : IMAGE_SIZES[sizeKey as ImageSize];

    // Skip if target is larger than original
    if (targetWidth && targetWidth >= originalWidth) {
      continue;
    }

    // Process each format
    for (const format of formats) {
      try {
        const outputFileName = `${sizeKey === "original" ? "original" : `${targetWidth}w`}.${format}`;
        const outputPath = path.join(outputDir, outputFileName);

        // Create Sharp pipeline
        let pipeline = sharp(inputPath)
          .rotate() // Auto-rotate based on EXIF orientation
          .withMetadata({ orientation: undefined }); // Strip EXIF but keep color profile

        // Resize if not original
        if (sizeKey !== "original" && targetWidth) {
          pipeline = pipeline.resize(targetWidth, undefined, {
            fit: "inside",
            withoutEnlargement: true,
          });
        }

        // Apply format-specific compression
        switch (format) {
          case "jpg":
            pipeline = pipeline.jpeg({
              quality: QUALITY_SETTINGS.jpg,
              progressive: true,
              mozjpeg: true,
            });
            break;
          case "webp":
            pipeline = pipeline.webp({
              quality: QUALITY_SETTINGS.webp,
              effort: 6,
            });
            break;
          case "avif":
            pipeline = pipeline.avif({
              quality: QUALITY_SETTINGS.avif,
              effort: 6,
            });
            break;
        }

        // Write optimized image
        await pipeline.toFile(outputPath);

        // Get output metadata
        const outputImage = sharp(outputPath);
        const outputMetadata = await outputImage.metadata();
        const fileSize = await getFileSize(outputPath);

        totalSizeAfter += fileSize;

        const variantKey = `${sizeKey === "original" ? "original" : `${targetWidth}w`}_${format}`;
        // eslint-disable-next-line security/detect-object-injection
        variants[variantKey] = {
          width: outputMetadata.width || 0,
          height: outputMetadata.height || 0,
          size: fileSize,
          path: path.relative(
            path.join(process.cwd(), "public"),
            outputPath
          ),
        };

        console.log(
          `  ✓ ${outputFileName}: ${outputMetadata.width}x${outputMetadata.height} (${formatBytes(fileSize)})`
        );
      } catch (error) {
        console.error(
          `  ✗ Error processing ${sizeKey} in ${format}: ${error}`
        );
      }
    }
  }

  const savings = originalSize - totalSizeAfter;
  const savingsPercent =
    originalSize > 0 ? (savings / originalSize) * 100 : 0;

  const result: OptimizationResult = {
    success: Object.keys(variants).length > 0,
    metadata: {
      slug,
      originalSize,
      variants,
      blurDataURL,
      generatedAt: new Date().toISOString(),
    },
    totalSizeBefore: originalSize,
    totalSizeAfter,
    savings,
    savingsPercent,
  };

  return result;
}

/**
 * Save metadata to JSON file
 */
export async function saveMetadata(
  metadata: ImageMetadata,
  outputPath: string
): Promise<void> {
  await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2), "utf-8");
}

/**
 * Load metadata from JSON file
 */
export async function loadMetadata(
  filePath: string
): Promise<ImageMetadata | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}
