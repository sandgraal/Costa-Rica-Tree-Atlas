#!/usr/bin/env node

/**
 * Optimize tree images for LCP performance.
 *
 * Resizes oversized tree JPEG source images to max 1200px width
 * (sufficient for 3x retina at the largest card display size of ~400px).
 * This reduces the work next/image must do on first request, directly
 * improving LCP for pages that render tree card images.
 *
 * Usage:
 *   node scripts/optimize-tree-images.mjs              # optimize all
 *   node scripts/optimize-tree-images.mjs --dry-run    # preview changes
 *   node scripts/optimize-tree-images.mjs --tree=ajo   # optimize one tree
 */

import { readdir, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const TREES_DIR = "public/images/trees";
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 80;
const SIZE_THRESHOLD = 200 * 1024; // Only optimize images > 200KB

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const treeArg = args.find((a) => a.startsWith("--tree="));
const targetTree = treeArg ? treeArg.split("=")[1] : null;

async function getImageFiles() {
  const entries = await readdir(TREES_DIR, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
    if (targetTree && !entry.name.startsWith(targetTree)) continue;
    files.push(join(TREES_DIR, entry.name));
  }

  // Also check subdirectories (e.g., trees/guarumbo-hembra/featured.jpg)
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "optimized") continue;
    if (targetTree && entry.name !== targetTree) continue;

    try {
      const subEntries = await readdir(join(TREES_DIR, entry.name));
      for (const subFile of subEntries) {
        const ext = extname(subFile).toLowerCase();
        if ([".jpg", ".jpeg", ".png"].includes(ext)) {
          files.push(join(TREES_DIR, entry.name, subFile));
        }
      }
    } catch {
      // Skip unreadable directories
    }
  }

  return files;
}

async function optimizeImage(filePath) {
  const fileStats = await stat(filePath);

  if (fileStats.size < SIZE_THRESHOLD) {
    return { path: filePath, skipped: true, reason: "under threshold" };
  }

  const metadata = await sharp(filePath).metadata();
  const originalSize = fileStats.size;

  if (dryRun) {
    return {
      path: filePath,
      skipped: false,
      dryRun: true,
      originalSize,
      width: metadata.width,
      height: metadata.height,
    };
  }

  // Resize if over max width, then recompress with mozjpeg
  const buffer = await sharp(filePath)
    .resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: "inside",
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  // Only write if we actually saved space
  if (buffer.length >= originalSize) {
    return { path: filePath, skipped: true, reason: "no size improvement" };
  }

  const { writeFile } = await import("node:fs/promises");
  await writeFile(filePath, buffer);

  const newStats = await stat(filePath);

  return {
    path: filePath,
    skipped: false,
    originalSize,
    newSize: newStats.size,
    savedBytes: originalSize - newStats.size,
    savedPercent: Math.round(
      ((originalSize - newStats.size) / originalSize) * 100
    ),
    originalWidth: metadata.width,
    newWidth: Math.min(metadata.width, MAX_WIDTH),
  };
}

async function main() {
  console.log("🖼️  Tree Image Optimizer for LCP Performance");
  console.log(`   Max width: ${MAX_WIDTH}px | JPEG quality: ${JPEG_QUALITY}`);
  console.log(
    `   Size threshold: ${Math.round(SIZE_THRESHOLD / 1024)}KB | Mode: ${dryRun ? "DRY RUN" : "LIVE"}`
  );
  if (targetTree) console.log(`   Target tree: ${targetTree}`);
  console.log("");

  const files = await getImageFiles();
  console.log(`Found ${files.length} image files to check\n`);

  let optimized = 0;
  let skipped = 0;
  let totalSaved = 0;

  for (const file of files) {
    const result = await optimizeImage(file);

    if (result.skipped) {
      skipped++;
      continue;
    }

    optimized++;
    const name = basename(result.path);

    if (result.dryRun) {
      console.log(
        `  📐 ${name}: ${result.width}x${result.height} [${Math.round(result.originalSize / 1024)}KB] — will recompress`
      );
    } else {
      totalSaved += result.savedBytes;
      console.log(
        `  ✅ ${name}: ${result.originalWidth}px → ${result.newWidth}px | ${Math.round(result.originalSize / 1024)}KB → ${Math.round(result.newSize / 1024)}KB (${result.savedPercent}% saved)`
      );
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Checked: ${files.length}`);
  console.log(`Optimized: ${optimized}`);
  console.log(`Skipped: ${skipped}`);
  if (!dryRun && totalSaved > 0) {
    console.log(`Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
  }
}

main().catch(console.error);
