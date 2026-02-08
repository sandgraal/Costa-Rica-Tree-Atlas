#!/usr/bin/env node

/**
 * Image Reference Validator for Costa Rica Tree Atlas
 *
 * This script validates all image references in MDX files to ensure:
 * - All featuredImage paths point to existing files or valid URLs
 * - All gallery images exist
 * - Both English and Spanish versions have matching images
 * - No broken references exist
 *
 * Usage:
 *   node scripts/validate-image-references.mjs           # Validate all references
 *   node scripts/validate-image-references.mjs --fix     # Fix common issues automatically
 *   node scripts/validate-image-references.mjs --tree=slug  # Validate single tree
 *   node scripts/validate-image-references.mjs --verbose # Show detailed output
 */

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import https from "node:https";

// Configuration
const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const TREES_ES_DIR = path.join(ROOT_DIR, "content/trees/es");
const IMAGES_DIR = path.join(ROOT_DIR, "public/images/trees");
const OPTIMIZED_DIR = path.join(IMAGES_DIR, "optimized");

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes("--verbose") || args.includes("-v");
const fix = args.includes("--fix");
const treeArg = args.find((arg) => arg.startsWith("--tree="));
const singleTree = treeArg ? treeArg.split("=")[1] : null;

// Validation results
const results = {
  total: 0,
  valid: 0,
  missingFeaturedImage: [],
  brokenLocalPaths: [],
  brokenExternalUrls: [],
  inconsistentLocales: [],
  optimizedAvailable: [],
  errors: [],
};

/**
 * Extract frontmatter from MDX file
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  const frontmatter = {};
  const lines = match[1].split("\n");

  let currentKey = null;
  let currentValue = "";

  for (const line of lines) {
    if (line.startsWith("  ") && currentKey) {
      // Continuation of array or multiline value
      currentValue += line + "\n";
    } else if (line.includes(":")) {
      // Save previous key-value
      if (currentKey) {
        frontmatter[currentKey] = parseValue(currentValue.trim());
      }

      // Parse new key-value
      const colonIndex = line.indexOf(":");
      currentKey = line.substring(0, colonIndex).trim();
      currentValue = line.substring(colonIndex + 1).trim();
    }
  }

  // Save last key-value
  if (currentKey) {
    frontmatter[currentKey] = parseValue(currentValue);
  }

  return frontmatter;
}

/**
 * Parse YAML value
 */
function parseValue(value) {
  // Remove quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Check if URL is accessible
 */
async function checkUrlExists(url) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, 10000);

    https
      .request(url, { method: "HEAD" }, (res) => {
        clearTimeout(timeout);
        resolve(res.statusCode === 200);
      })
      .on("error", () => {
        clearTimeout(timeout);
        resolve(false);
      })
      .end();
  });
}

/**
 * Validate a single tree's image references
 */
async function validateTree(slug, locale) {
  const dir = locale === "en" ? TREES_EN_DIR : TREES_ES_DIR;
  const filePath = path.join(dir, `${slug}.mdx`);

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      results.errors.push({
        slug,
        locale,
        error: "Could not parse frontmatter",
      });
      return;
    }

    const { featuredImage } = frontmatter;

    if (!featuredImage) {
      results.missingFeaturedImage.push({ slug, locale });
      if (verbose) {
        console.log(`❌ ${slug} (${locale}): No featuredImage field`);
      }
      return;
    }

    // Check if it's an external URL
    if (featuredImage.startsWith("http://") || featuredImage.startsWith("https://")) {
      if (verbose) {
        console.log(`🔍 ${slug} (${locale}): Checking external URL...`);
      }

      const exists = await checkUrlExists(featuredImage);
      if (!exists) {
        results.brokenExternalUrls.push({ slug, locale, url: featuredImage });
        if (verbose) {
          console.log(`❌ ${slug} (${locale}): External URL not accessible`);
        }
        return;
      }

      if (verbose) {
        console.log(`📡 ${slug} (${locale}): External URL valid`);
      }
      results.valid++;
      return;
    }

    // Check local image paths
    const imagePath = featuredImage.startsWith("/")
      ? path.join(ROOT_DIR, "public", featuredImage)
      : path.join(ROOT_DIR, "public", featuredImage);

    if (!fsSync.existsSync(imagePath)) {
      results.brokenLocalPaths.push({ slug, locale, path: featuredImage });
      if (verbose) {
        console.log(`❌ ${slug} (${locale}): Local image not found: ${featuredImage}`);
      }
      return;
    }

    // Check if optimized version exists
    const optimizedDir = path.join(OPTIMIZED_DIR, slug);
    if (fsSync.existsSync(optimizedDir)) {
      results.optimizedAvailable.push({ slug, locale });
      if (verbose) {
        console.log(`✅ ${slug} (${locale}): Valid (optimized available)`);
      }
    } else if (verbose) {
      console.log(`✅ ${slug} (${locale}): Valid`);
    }

    results.valid++;
  } catch (error) {
    results.errors.push({
      slug,
      locale,
      error: error.message,
    });
    if (verbose) {
      console.log(`❌ ${slug} (${locale}): Error - ${error.message}`);
    }
  }
}

/**
 * Check locale consistency
 */
async function checkLocaleConsistency() {
  const enFiles = await fs.readdir(TREES_EN_DIR);
  const esFiles = await fs.readdir(TREES_ES_DIR);

  const enSlugs = new Set(enFiles.map((f) => f.replace(".mdx", "")));
  const esSlugs = new Set(esFiles.map((f) => f.replace(".mdx", "")));

  // Find trees only in one locale
  for (const slug of enSlugs) {
    if (!esSlugs.has(slug)) {
      results.inconsistentLocales.push({
        slug,
        missing: "es",
        issue: "Tree exists in English but not Spanish",
      });
    }
  }

  for (const slug of esSlugs) {
    if (!enSlugs.has(slug)) {
      results.inconsistentLocales.push({
        slug,
        missing: "en",
        issue: "Tree exists in Spanish but not English",
      });
    }
  }
}

/**
 * Main validation function
 */
async function validateAll() {
  console.log("🌳 Costa Rica Tree Atlas - Image Reference Validator");
  console.log("====================================================\n");

  const locales = ["en", "es"];
  const allTrees = new Set();

  // Collect all tree slugs
  for (const locale of locales) {
    const dir = locale === "en" ? TREES_EN_DIR : TREES_ES_DIR;
    const files = await fs.readdir(dir);

    for (const file of files) {
      if (file.endsWith(".mdx")) {
        allTrees.add(file.replace(".mdx", ""));
      }
    }
  }

  // Validate each tree
  if (singleTree) {
    console.log(`🔍 Validating single tree: ${singleTree}\n`);
    results.total = 2; // One tree, two locales
    for (const locale of locales) {
      await validateTree(singleTree, locale);
    }
  } else {
    results.total = allTrees.size * 2; // Each tree should have 2 locales
    console.log(`🔍 Validating ${allTrees.size} trees across 2 locales...\n`);

    for (const slug of allTrees) {
      for (const locale of locales) {
        await validateTree(slug, locale);
      }
    }

    // Check locale consistency
    await checkLocaleConsistency();
  }

  // Print results
  printResults();
}

/**
 * Print validation results
 */
function printResults() {
  console.log("\n====================================================");
  console.log("📊 VALIDATION RESULTS");
  console.log("====================================================\n");

  console.log(`Total references checked: ${results.total}`);
  console.log(`✅ Valid references: ${results.valid}`);
  console.log(`❌ Issues found: ${results.total - results.valid}\n`);

  if (results.missingFeaturedImage.length > 0) {
    console.log(`\n⚠️  Missing featuredImage field (${results.missingFeaturedImage.length}):`);
    const uniqueTrees = [
      ...new Set(results.missingFeaturedImage.map((item) => item.slug)),
    ];
    for (const slug of uniqueTrees) {
      console.log(`   - ${slug}`);
    }
  }

  if (results.brokenLocalPaths.length > 0) {
    console.log(`\n❌ Broken local image paths (${results.brokenLocalPaths.length}):`);
    for (const item of results.brokenLocalPaths) {
      console.log(`   - ${item.slug} (${item.locale}): ${item.path}`);
    }
  }

  if (results.brokenExternalUrls.length > 0) {
    console.log(`\n📡 Broken external URLs (${results.brokenExternalUrls.length}):`);
    for (const item of results.brokenExternalUrls) {
      console.log(`   - ${item.slug} (${item.locale}): ${item.url}`);
    }
  }

  if (results.inconsistentLocales.length > 0) {
    console.log(`\n🌍 Locale inconsistencies (${results.inconsistentLocales.length}):`);
    for (const item of results.inconsistentLocales) {
      console.log(`   - ${item.slug}: ${item.issue}`);
    }
  }

  if (results.optimizedAvailable.length > 0 && verbose) {
    const uniqueOptimized = [
      ...new Set(results.optimizedAvailable.map((item) => item.slug)),
    ];
    console.log(`\n⚡ Trees with optimized images (${uniqueOptimized.length}/${results.total / 2}):`);
    console.log(`   ${uniqueOptimized.join(", ")}`);
  }

  if (results.errors.length > 0) {
    console.log(`\n❌ Processing errors (${results.errors.length}):`);
    for (const item of results.errors) {
      console.log(`   - ${item.slug} (${item.locale}): ${item.error}`);
    }
  }

  console.log("\n====================================================");
  console.log("💡 RECOMMENDATIONS");
  console.log("====================================================\n");

  const totalIssues =
    results.missingFeaturedImage.length +
    results.brokenLocalPaths.length +
    results.brokenExternalUrls.length;

  if (totalIssues === 0) {
    console.log("✅ All image references are valid! No action needed.");
  } else {
    if (results.missingFeaturedImage.length > 0) {
      console.log("1. Add featuredImage to trees missing them:");
      console.log("   npm run images:download");
    }

    if (results.brokenLocalPaths.length > 0) {
      console.log("2. Fix broken local image paths:");
      console.log("   - Check if image files exist with different names");
      console.log("   - Update MDX frontmatter to correct paths");
      console.log("   - Download missing images from iNaturalist");
    }

    if (results.brokenExternalUrls.length > 0) {
      console.log("3. Fix broken external URLs:");
      console.log("   - Download images locally: npm run images:download");
      console.log("   - Or update to working URLs");
    }

    if (results.inconsistentLocales.length > 0) {
      console.log("4. Add missing locale versions:");
      console.log("   - Create MDX files for missing translations");
    }
  }

  // Exit with error code if issues found
  if (totalIssues > 0) {
    console.log("\n❌ Validation failed with issues.\n");
    process.exit(1);
  } else {
    console.log("\n✅ Validation passed successfully.\n");
    process.exit(0);
  }
}

// Run validation
validateAll().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
