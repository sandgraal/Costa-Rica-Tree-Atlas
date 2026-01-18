#!/usr/bin/env node
/**
 * Optimize Hero Image for LCP Performance
 *
 * This script creates optimized versions of the hero image (guanacaste.jpg)
 * specifically for Largest Contentful Paint (LCP) performance.
 *
 * Output formats:
 * - WebP (modern, good compression)
 * - AVIF (best compression, newest browsers)
 * - JPEG (fallback, maximum compatibility)
 *
 * Sizes:
 * - 640w  (mobile portrait)
 * - 828w  (mobile landscape)
 * - 1200w (tablet)
 * - 1920w (desktop)
 * - 2560w (large desktop/retina)
 */

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const HERO_IMAGE_PATH = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "trees",
  "guanacaste.jpg"
);
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "hero");

const SIZES = [
  { width: 640, suffix: "mobile" },
  { width: 828, suffix: "mobile-lg" },
  { width: 1200, suffix: "tablet" },
  { width: 1920, suffix: "desktop" },
  { width: 2560, suffix: "desktop-2x" },
];

const FORMATS = [
  {
    ext: "avif",
    options: { quality: 85, effort: 4 },
    description: "AVIF (best compression)",
  },
  {
    ext: "webp",
    options: { quality: 85, effort: 4 },
    description: "WebP (good compression)",
  },
  {
    ext: "jpg",
    options: { quality: 85, mozjpeg: true },
    description: "JPEG (fallback)",
  },
];

async function optimizeHeroImage() {
  console.log("🎨 Optimizing hero image for LCP performance...\n");

  try {
    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Load original image
    const originalImage = sharp(HERO_IMAGE_PATH);
    const metadata = await originalImage.metadata();

    console.log(`📸 Original image: ${metadata.width}x${metadata.height}`);
    console.log(
      `   Format: ${metadata.format}, Size: ${(metadata.size / 1024).toFixed(2)} KB\n`
    );

    let totalSavings = 0;
    let totalOriginalSize = 0;

    // Process each size
    for (const size of SIZES) {
      console.log(`📏 Processing ${size.width}w (${size.suffix})...`);

      // Process each format
      for (const format of FORMATS) {
        const outputPath = path.join(
          OUTPUT_DIR,
          `guanacaste-${size.suffix}.${format.ext}`
        );

        try {
          // Resize and optimize
          const pipeline = sharp(HERO_IMAGE_PATH).resize(size.width, null, {
            withoutEnlargement: true,
            fit: "inside",
          });

          // Apply format-specific options
          if (format.ext === "avif") {
            await pipeline.avif(format.options).toFile(outputPath);
          } else if (format.ext === "webp") {
            await pipeline.webp(format.options).toFile(outputPath);
          } else if (format.ext === "jpg") {
            await pipeline.jpeg(format.options).toFile(outputPath);
          }

          // Get file size
          const stats = await fs.stat(outputPath);
          const sizeKB = (stats.size / 1024).toFixed(2);

          // Calculate savings compared to proportional original
          const originalProportionalSize =
            (metadata.size * size.width) / metadata.width;
          const savings = originalProportionalSize - stats.size;
          totalSavings += savings;
          totalOriginalSize += originalProportionalSize;

          console.log(
            `   ✓ ${format.description.padEnd(25)} → ${sizeKB.padStart(7)} KB`
          );
        } catch (error) {
          console.error(`   ✗ ${format.description}: ${error.message}`);
        }
      }
      console.log();
    }

    // Create an optimized full-size version
    console.log("📏 Creating full-size optimized versions...");
    for (const format of FORMATS) {
      const outputPath = path.join(
        OUTPUT_DIR,
        `guanacaste-original.${format.ext}`
      );

      try {
        const pipeline = sharp(HERO_IMAGE_PATH);

        if (format.ext === "avif") {
          await pipeline.avif(format.options).toFile(outputPath);
        } else if (format.ext === "webp") {
          await pipeline.webp(format.options).toFile(outputPath);
        } else if (format.ext === "jpg") {
          await pipeline.jpeg(format.options).toFile(outputPath);
        }

        const stats = await fs.stat(outputPath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        const savings = metadata.size - stats.size;
        totalSavings += savings;
        totalOriginalSize += metadata.size;

        console.log(
          `   ✓ ${format.description.padEnd(25)} → ${sizeKB.padStart(7)} KB`
        );
      } catch (error) {
        console.error(`   ✗ ${format.description}: ${error.message}`);
      }
    }

    console.log("\n✅ Hero image optimization complete!\n");
    console.log(`💾 Total savings: ${(totalSavings / 1024).toFixed(2)} KB`);
    console.log(
      `📊 Compression ratio: ${((totalSavings / totalOriginalSize) * 100).toFixed(1)}%`
    );
    console.log(`\n📁 Optimized images saved to: ${OUTPUT_DIR}`);

    console.log("\n📋 Next steps:");
    console.log(
      "1. Update SafeImage component to use picture element with srcset"
    );
    console.log("2. Update preload link to use srcset with all sizes");
    console.log("3. Test with Lighthouse to verify LCP improvement");
  } catch (error) {
    console.error("\n❌ Error optimizing hero image:", error);
    process.exit(1);
  }
}

// Run the optimization
optimizeHeroImage();
