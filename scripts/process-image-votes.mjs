#!/usr/bin/env node

/**
 * Process Image Votes Script
 *
 * This script reads the exported tree-image-votes JSON file and:
 * 1. Downloads "upvoted" images to public/images/trees/
 * 2. Updates the MDX frontmatter to use local images
 * 3. Logs "downvoted" images that need replacement
 *
 * Usage:
 *   node scripts/process-image-votes.mjs <votes-file.json>
 *
 * Example:
 *   node scripts/process-image-votes.mjs tree-image-votes-2024-01-15.json
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const IMAGES_DIR = path.join(PROJECT_ROOT, "public/images/trees");
const CONTENT_DIR = path.join(PROJECT_ROOT, "content/trees");

async function downloadImage(url, filename) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const filePath = path.join(IMAGES_DIR, filename);
  await fs.writeFile(filePath, Buffer.from(buffer));

  return filePath;
}

async function updateMdxFile(locale, slug, newImagePath) {
  const mdxPath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);

  try {
    const content = await fs.readFile(mdxPath, "utf-8");

    // Update the featuredImage field in frontmatter
    const relativeImagePath = `/images/trees/${path.basename(newImagePath)}`;
    const updatedContent = content.replace(
      /featuredImage:\s*["']?[^"'\n]+["']?/,
      `featuredImage: "${relativeImagePath}"`
    );

    await fs.writeFile(mdxPath, updatedContent);
    return true;
  } catch (error) {
    console.error(`  ❌ Error updating ${mdxPath}:`, error.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: node scripts/process-image-votes.mjs <votes-file.json>"
    );
    console.log(
      "\nExample: node scripts/process-image-votes.mjs tree-image-votes-2024-01-15.json"
    );
    process.exit(1);
  }

  const votesFile = args[0];
  console.log(`\n📁 Reading votes from: ${votesFile}\n`);

  let votesData;
  try {
    const content = await fs.readFile(votesFile, "utf-8");
    votesData = JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading votes file: ${error.message}`);
    process.exit(1);
  }

  const { upvoted = [], downvoted = [] } = votesData;

  // Ensure images directory exists
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  // Process upvoted images
  console.log(`\n👍 Processing ${upvoted.length} upvoted images...\n`);

  for (const vote of upvoted) {
    const { slug, imageUrl } = vote;
    console.log(`  🌳 ${slug}`);

    try {
      // Determine image extension from URL
      const urlObj = new URL(imageUrl);
      const ext = path.extname(urlObj.pathname) || ".jpg";
      const filename = `${slug}${ext}`;

      // Download the image
      console.log(`     ⬇️  Downloading from ${imageUrl.substring(0, 60)}...`);
      const savedPath = await downloadImage(imageUrl, filename);
      console.log(`     ✅ Saved to ${path.relative(PROJECT_ROOT, savedPath)}`);

      // Update both en and es MDX files
      for (const locale of ["en", "es"]) {
        const updated = await updateMdxFile(locale, slug, savedPath);
        if (updated) {
          console.log(`     📝 Updated ${locale}/${slug}.mdx`);
        }
      }
    } catch (error) {
      console.error(`     ❌ Error: ${error.message}`);
    }
  }

  // Report downvoted images
  if (downvoted.length > 0) {
    console.log(`\n\n👎 ${downvoted.length} images marked for replacement:\n`);
    for (const vote of downvoted) {
      console.log(`  - ${vote.slug}`);
    }
    console.log(
      "\n   These trees need new images from iNaturalist or other sources."
    );
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Summary:");
  console.log(`   ✅ ${upvoted.length} images downloaded and saved locally`);
  console.log(`   ❌ ${downvoted.length} images flagged for replacement`);
  console.log("=".repeat(50) + "\n");
}

main();
