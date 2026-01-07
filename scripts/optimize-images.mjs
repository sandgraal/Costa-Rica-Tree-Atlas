#!/usr/bin/env node

/**
 * Script: optimize-images.mjs
 * Description: Batch optimize tree images with Sharp
 *
 * Generates multiple responsive sizes (400w, 800w, 1200w, 1600w, original)
 * and formats (WebP, AVIF, JPEG) for all tree images.
 *
 * Usage:
 *   node scripts/optimize-images.mjs          # Optimize new/changed images
 *   node scripts/optimize-images.mjs --force  # Re-optimize all images
 *   node scripts/optimize-images.mjs --help   # Show help
 */

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// Configuration
const IMAGES_DIR = path.join(ROOT_DIR, "public/images/trees");
const OPTIMIZED_DIR = path.join(ROOT_DIR, "public/images/trees/optimized");

const IMAGE_SIZES = {
  thumbnail: 400,
  small: 800,
  medium: 1200,
  large: 1600,
};

const FORMATS = ["webp", "avif", "jpg"];

const QUALITY_SETTINGS = {
  jpg: 80,
  webp: 75,
  avif: 70,
};

// Performance targets (in bytes)
const SIZE_TARGETS = {
  400: 50 * 1024, // 50KB
  800: 150 * 1024, // 150KB
  1200: 300 * 1024, // 300KB
  1600: 500 * 1024, // 500KB
};

// Parse command line arguments
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const SHOW_HELP = args.includes("--help") || args.includes("-h");

// Statistics
const stats = {
  totalImages: 0,
  optimizedImages: 0,
  skippedImages: 0,
  errors: 0,
  totalSizeBefore: 0,
  totalSizeAfter: 0,
  variantsGenerated: 0,
};

/**
 * Show usage information
 */
function showHelp() {
  console.log(`
Image Optimization Script

Usage:
  node scripts/optimize-images.mjs [options]

Options:
  --force    Re-optimize all images (ignore existing optimized versions)
  --help     Show this help message

Description:
  Optimizes all images in public/images/trees/ by generating:
  - Multiple sizes: 400w, 800w, 1200w, 1600w, original
  - Multiple formats: WebP, AVIF, JPEG
  - Blur placeholder data URLs
  - Metadata JSON files with complete image information

Output:
  public/images/trees/optimized/{slug}/
    400w.webp, 400w.avif, 400w.jpg
    800w.webp, 800w.avif, 800w.jpg
    1200w.webp, 1200w.avif, 1200w.jpg
    1600w.webp, 1600w.avif, 1600w.jpg
    metadata.json
  `);
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Generate a blur placeholder data URL
 */
async function generateBlurPlaceholder(inputPath) {
  try {
    const buffer = await sharp(inputPath)
      .resize(10, 10, { fit: "inside" })
      .blur(1)
      .webp({ quality: 20 })
      .toBuffer();

    return `data:image/webp;base64,${buffer.toString("base64")}`;
  } catch (error) {
    console.error(`  ✗ Error generating blur placeholder: ${error.message}`);
    return undefined;
  }
}

/**
 * Check if image needs optimization
 */
async function needsOptimization(imagePath, outputDir) {
  if (FORCE) return true;

  const metadataPath = path.join(outputDir, "metadata.json");
  
  try {
    // Check if metadata exists
    const metadataExists = fsSync.existsSync(metadataPath);
    if (!metadataExists) return true;

    // Check if source is newer than optimized versions
    const sourceStats = await fs.stat(imagePath);
    const metadataStats = await fs.stat(metadataPath);

    return sourceStats.mtime > metadataStats.mtime;
  } catch {
    return true;
  }
}

/**
 * Optimize a single image
 */
async function optimizeImage(imagePath, slug) {
  const outputDir = path.join(OPTIMIZED_DIR, slug);

  // Check if optimization is needed
  if (!(await needsOptimization(imagePath, outputDir))) {
    console.log(`⊘ ${slug}: Already optimized (use --force to re-optimize)`);
    stats.skippedImages++;
    return;
  }

  console.log(`\n▶ Optimizing: ${slug}`);

  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Get original file size and metadata
    const originalSize = await getFileSize(imagePath);
    const image = sharp(imagePath);
    const imageMetadata = await image.metadata();
    const { width: originalWidth = 0, height: originalHeight = 0 } = imageMetadata;

    console.log(
      `  Original: ${originalWidth}x${originalHeight} (${formatBytes(originalSize)})`
    );

    // Generate blur placeholder
    const blurDataURL = await generateBlurPlaceholder(imagePath);

    const variants = {};
    let totalSizeAfter = 0;

    // Process each size
    const sizes = [
      { key: "thumbnail", width: IMAGE_SIZES.thumbnail },
      { key: "small", width: IMAGE_SIZES.small },
      { key: "medium", width: IMAGE_SIZES.medium },
      { key: "large", width: IMAGE_SIZES.large },
      { key: "original", width: originalWidth },
    ];

    for (const { key, width: targetWidth } of sizes) {
      // Skip if target is larger than or equal to original (except for original)
      if (key !== "original" && targetWidth >= originalWidth) {
        continue;
      }

      // Process each format
      for (const format of FORMATS) {
        try {
          const outputFileName = `${key === "original" ? "original" : `${targetWidth}w`}.${format}`;
          const outputPath = path.join(outputDir, outputFileName);

          // Create Sharp pipeline
          let pipeline = sharp(imagePath)
            .rotate() // Auto-rotate based on EXIF orientation
            .withMetadata({ orientation: undefined }); // Strip EXIF

          // Resize if not original
          if (key !== "original") {
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
          stats.variantsGenerated++;

          // Store variant info
          const variantKey = `${key === "original" ? "original" : `${targetWidth}w`}_${format}`;
          variants[variantKey] = {
            width: outputMetadata.width || 0,
            height: outputMetadata.height || 0,
            size: fileSize,
            path: `/images/trees/optimized/${slug}/${outputFileName}`,
          };

          // Check if within size target
          const target = SIZE_TARGETS[targetWidth];
          const withinTarget = !target || fileSize <= target;
          const targetIndicator = target
            ? withinTarget
              ? "✓"
              : `⚠ (target: ${formatBytes(target)})`
            : "";

          console.log(
            `  ${format.toUpperCase()} ${targetWidth}w: ${outputMetadata.width}x${outputMetadata.height} ${formatBytes(fileSize)} ${targetIndicator}`
          );
        } catch (error) {
          console.error(
            `  ✗ Error processing ${key} in ${format}: ${error.message}`
          );
        }
      }
    }

    // Calculate savings (comparing largest optimized JPG to original)
    const largestJpgVariant = Object.entries(variants)
      .filter(([key]) => key.includes('jpg'))
      .sort((a, b) => b[1].size - a[1].size)[0];
    
    const savings = largestJpgVariant 
      ? originalSize - largestJpgVariant[1].size
      : 0;
    const savingsPercent =
      originalSize > 0 && largestJpgVariant
        ? ((savings / originalSize) * 100).toFixed(1)
        : "0";

    console.log(
      `  Total variants: ${Object.keys(variants).length} files (${formatBytes(totalSizeAfter)} combined)`
    );
    
    if (largestJpgVariant) {
      console.log(
        `  Best JPG: ${formatBytes(largestJpgVariant[1].size)} (${savingsPercent}% smaller than original)`
      );
    }

    // Save metadata
    const metadata = {
      slug,
      originalSize,
      variants,
      blurDataURL,
      generatedAt: new Date().toISOString(),
    };

    const metadataPath = path.join(outputDir, "metadata.json");
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    console.log(`  ✓ Metadata saved to ${path.relative(ROOT_DIR, metadataPath)}`);

    // Update statistics
    stats.totalSizeBefore += originalSize;
    stats.totalSizeAfter += totalSizeAfter;
    stats.optimizedImages++;
  } catch (error) {
    console.error(`  ✗ Error optimizing ${slug}: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Find all tree images to optimize
 */
async function findImages() {
  const images = [];

  try {
    const files = await fs.readdir(IMAGES_DIR);

    for (const file of files) {
      // Skip directories and non-image files
      if (
        file === "optimized" ||
        file === "gallery" ||
        file.endsWith(".json") ||
        !file.match(/\.(jpg|jpeg|png|webp)$/i)
      ) {
        continue;
      }

      const imagePath = path.join(IMAGES_DIR, file);
      const statResult = await fs.stat(imagePath);

      if (statResult.isFile()) {
        const slug = path.parse(file).name;
        images.push({ path: imagePath, slug });
      }
    }
  } catch (error) {
    console.error(`Error reading images directory: ${error.message}`);
  }

  return images;
}

/**
 * Main function
 */
async function main() {
  if (SHOW_HELP) {
    showHelp();
    process.exit(0);
  }

  console.log("🖼️  Image Optimization Script");
  console.log("=" .repeat(50));
  console.log(`Source: ${path.relative(ROOT_DIR, IMAGES_DIR)}`);
  console.log(`Output: ${path.relative(ROOT_DIR, OPTIMIZED_DIR)}`);
  console.log(`Mode: ${FORCE ? "Force re-optimize all" : "Optimize new/changed only"}`);
  console.log("=" .repeat(50));

  // Ensure optimized directory exists
  await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

  // Find all images
  const images = await findImages();
  stats.totalImages = images.length;

  console.log(`\nFound ${images.length} image(s) to process\n`);

  // Process each image
  for (const { path: imagePath, slug } of images) {
    await optimizeImage(imagePath, slug);
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Optimization Summary");
  console.log("=".repeat(50));
  console.log(`Total images: ${stats.totalImages}`);
  console.log(`Optimized: ${stats.optimizedImages}`);
  console.log(`Skipped: ${stats.skippedImages}`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Variants generated: ${stats.variantsGenerated}`);
  console.log(`\nOriginal images total: ${formatBytes(stats.totalSizeBefore)}`);
  console.log(`All variants total: ${formatBytes(stats.totalSizeAfter)}`);
  console.log(`\nNote: Each image generates ${FORMATS.length} formats × ${Object.keys(IMAGE_SIZES).length + 1} sizes`);
  console.log(`Modern formats (WebP/AVIF) typically save 25-50% vs JPEG`);

  console.log("\n✅ Image optimization complete!");
}

// Run the script
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
