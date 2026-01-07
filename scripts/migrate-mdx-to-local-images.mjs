#!/usr/bin/env node

/**
 * Script: migrate-mdx-to-local-images.mjs
 * Description: Update MDX files to use local image paths instead of external URLs
 *
 * Usage:
 *   node scripts/migrate-mdx-to-local-images.mjs          # Update files where local images exist
 *   node scripts/migrate-mdx-to-local-images.mjs --help   # Show help
 */

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const TREES_DIR = path.join(ROOT_DIR, "content/trees");
const IMAGES_DIR = path.join(ROOT_DIR, "public/images/trees");

// Parse command line arguments
const args = process.argv.slice(2);
const SHOW_HELP = args.includes("--help") || args.includes("-h");

/**
 * Show usage information
 */
function showHelp() {
  console.log(`
MDX Image Migration Script

Usage:
  node scripts/migrate-mdx-to-local-images.mjs [options]

Options:
  --help     Show this help message

Description:
  Updates MDX tree files to use local image paths instead of external URLs.
  Only updates files where corresponding local images exist.

  Updates the featuredImage frontmatter field:
    FROM: featuredImage: "https://example.com/image.jpg"
    TO:   featuredImage: "/images/trees/{slug}.jpg"

Example:
  node scripts/migrate-mdx-to-local-images.mjs
  `);
}

/**
 * Get all MDX files recursively
 */
async function getAllMdxFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getAllMdxFiles(fullPath)));
    } else if (entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Update a single MDX file
 */
async function updateMdxFile(filePath) {
  const content = await fs.readFile(filePath, "utf-8");

  // Extract slug from file name
  const slug = path.basename(filePath, ".mdx");

  // Check if local image exists
  const localImagePath = path.join(IMAGES_DIR, `${slug}.jpg`);
  const localImageExists = fsSync.existsSync(localImagePath);

  if (!localImageExists) {
    console.log(`⏭️  Skipping ${slug} - no local image found`);
    return false;
  }

  // Check if already using local path
  if (content.includes(`featuredImage: "/images/trees/${slug}.jpg"`)) {
    console.log(`✓ ${slug} - already using local path`);
    return false;
  }

  // Update featuredImage in frontmatter
  // Match both quoted and unquoted URLs
  const updatedContent = content.replace(
    /featuredImage:\s*["']?https?:\/\/[^"'\n]+["']?/,
    `featuredImage: "/images/trees/${slug}.jpg"`
  );

  if (content !== updatedContent) {
    await fs.writeFile(filePath, updatedContent);
    console.log(`✅ Updated ${slug}`);
    return true;
  }

  return false;
}

/**
 * Main function
 */
async function main() {
  if (SHOW_HELP) {
    showHelp();
    process.exit(0);
  }

  console.log("🔄 Migrating MDX files to use local images...\n");

  const mdxFiles = await getAllMdxFiles(TREES_DIR);
  let updated = 0;
  let skipped = 0;
  let alreadyLocal = 0;

  for (const file of mdxFiles) {
    const result = await updateMdxFile(file);
    if (result === true) {
      updated++;
    } else if (result === false) {
      // Check if already local or skipped
      const content = await fs.readFile(file, "utf-8");
      const slug = path.basename(file, ".mdx");
      if (content.includes(`featuredImage: "/images/trees/${slug}.jpg"`)) {
        alreadyLocal++;
      } else {
        skipped++;
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary");
  console.log("=".repeat(50));
  console.log(`Total MDX files: ${mdxFiles.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Already using local: ${alreadyLocal}`);
  console.log(`Skipped (no local image): ${skipped}`);
  console.log("\n✨ Migration complete!");
}

main().catch(console.error);
