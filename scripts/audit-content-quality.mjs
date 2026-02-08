#!/usr/bin/env node

/**
 * Content Quality Auditor for Costa Rica Tree Atlas
 *
 * This script audits all tree MDX files to identify quality issues:
 * - Pages under 600 lines (content too short)
 * - Missing sections per CONTENT_STANDARDIZATION_GUIDE.md
 * - Bilingual parity between EN/ES versions
 * - Gallery image count (target: 5+ images)
 * - External resources presence
 *
 * Usage:
 *   node scripts/audit-content-quality.mjs              # Audit all trees
 *   node scripts/audit-content-quality.mjs --tree=slug  # Audit single tree
 *   node scripts/audit-content-quality.mjs --threshold=600  # Custom line threshold
 *   node scripts/audit-content-quality.mjs --verbose    # Show detailed output
 *   node scripts/audit-content-quality.mjs --json       # Output as JSON
 */

import fs from "node:fs/promises";
import path from "node:path";

// Configuration
const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const TREES_ES_DIR = path.join(ROOT_DIR, "content/trees/es");

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes("--verbose") || args.includes("-v");
const jsonOutput = args.includes("--json");
const treeArg = args.find((arg) => arg.startsWith("--tree="));
const singleTree = treeArg ? treeArg.split("=")[1] : null;
const thresholdArg = args.find((arg) => arg.startsWith("--threshold="));
const LINE_THRESHOLD = thresholdArg
  ? parseInt(thresholdArg.split("=")[1], 10)
  : 600;

// Required sections per CONTENT_STANDARDIZATION_GUIDE.md
const REQUIRED_SECTIONS = [
  "Photo Gallery",
  "Taxonomy",
  "Geographic Distribution",
  "Habitat",
  "Botanical Description",
  "Applications",
  "Cultural",
  "Conservation",
];

// Optional but recommended sections
const RECOMMENDED_SECTIONS = [
  "Growing",
  "Cultivation",
  "Where to See",
  "External Resources",
  "References",
];

// Audit results
const results = {
  total: 0,
  analyzed: 0,
  shortPages: [],
  missingSections: [],
  bilingualIssues: [],
  lowImageCount: [],
  missingResources: [],
  summary: {
    under600Lines: 0,
    under700Lines: 0,
    over700Lines: 0,
    avgLineCount: 0,
    avgEnLineCount: 0,
    avgEsLineCount: 0,
  },
};

/**
 * Count lines in a file
 */
async function countLines(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return content.split("\n").length;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * Extract frontmatter and content from MDX file
 */
async function parseMDX(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  // Extract frontmatter
  let frontmatterEnd = -1;
  let frontmatterStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      if (frontmatterStart === -1) {
        frontmatterStart = i;
      } else {
        frontmatterEnd = i;
        break;
      }
    }
  }

  const frontmatter = {};
  if (frontmatterStart !== -1 && frontmatterEnd !== -1) {
    const frontmatterLines = lines.slice(frontmatterStart + 1, frontmatterEnd);
    for (const line of frontmatterLines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        frontmatter[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  }

  const bodyContent = lines.slice(frontmatterEnd + 1).join("\n");

  return {
    frontmatter,
    content: bodyContent,
    fullContent: content,
  };
}

/**
 * Check for missing sections in content
 */
function checkSections(content) {
  const missingSections = [];
  const missingRecommended = [];

  for (const section of REQUIRED_SECTIONS) {
    // Check for section heading (## Section Name)
    const regex = new RegExp(`##\\s+${section}`, "i");
    if (!regex.test(content)) {
      missingSections.push(section);
    }
  }

  for (const section of RECOMMENDED_SECTIONS) {
    const regex = new RegExp(`##\\s+${section}`, "i");
    if (!regex.test(content)) {
      missingRecommended.push(section);
    }
  }

  return { missingSections, missingRecommended };
}

/**
 * Count gallery images
 */
function countGalleryImages(content) {
  // Look for gallery section and count ImageCard components
  const galleryMatch = content.match(/##\s+Gallery\s+([\s\S]*?)(?=##\s+|$)/i);
  if (!galleryMatch) return 0;

  const galleryContent = galleryMatch[1];
  const imageCards = galleryContent.match(/<ImageCard/g);
  return imageCards ? imageCards.length : 0;
}

/**
 * Check for external resources
 */
function hasExternalResources(content) {
  const hasIUCN = /IUCN|Red List/i.test(content);
  const hasINaturalist = /iNaturalist/i.test(content);
  const hasGBIF = /GBIF|Global Biodiversity Information/i.test(content);

  return { hasIUCN, hasINaturalist, hasGBIF };
}

/**
 * Audit a single tree (both locales)
 */
async function auditTree(slug) {
  const enPath = path.join(TREES_EN_DIR, `${slug}.mdx`);
  const esPath = path.join(TREES_ES_DIR, `${slug}.mdx`);

  // Check if both files exist
  try {
    await fs.access(enPath);
  } catch {
    if (verbose) console.log(`⚠️  Missing EN file: ${slug}`);
    return null;
  }

  try {
    await fs.access(esPath);
  } catch {
    if (verbose) console.log(`⚠️  Missing ES file: ${slug}`);
    results.bilingualIssues.push({
      slug,
      issue: "Missing Spanish version",
    });
    return null;
  }

  // Count lines
  const enLines = await countLines(enPath);
  const esLines = await countLines(esPath);

  // Parse content
  const enData = await parseMDX(enPath);
  const esData = await parseMDX(esPath);

  // Check sections
  const enSections = checkSections(enData.content);
  const esSections = checkSections(esData.content);

  // Count gallery images
  const enGalleryCount = countGalleryImages(enData.content);
  const esGalleryCount = countGalleryImages(esData.content);

  // Check external resources
  const enResources = hasExternalResources(enData.content);
  const esResources = hasExternalResources(esData.content);

  const treeData = {
    slug,
    en: {
      lines: enLines,
      missingSections: enSections.missingSections,
      missingRecommended: enSections.missingRecommended,
      galleryCount: enGalleryCount,
      resources: enResources,
    },
    es: {
      lines: esLines,
      missingSections: esSections.missingSections,
      missingRecommended: esSections.missingRecommended,
      galleryCount: esGalleryCount,
      resources: esResources,
    },
  };

  // Track issues
  if (enLines < LINE_THRESHOLD || esLines < LINE_THRESHOLD) {
    results.shortPages.push(treeData);
    if (enLines < 600 || esLines < 600) results.summary.under600Lines++;
    else if (enLines < 700 || esLines < 700) results.summary.under700Lines++;
  } else {
    results.summary.over700Lines++;
  }

  if (
    enSections.missingSections.length > 0 ||
    esSections.missingSections.length > 0
  ) {
    results.missingSections.push(treeData);
  }

  if (Math.abs(enLines - esLines) > 50) {
    results.bilingualIssues.push({
      slug,
      enLines,
      esLines,
      difference: Math.abs(enLines - esLines),
      issue: "Significant line count difference",
    });
  }

  if (enGalleryCount < 5 || esGalleryCount < 5) {
    results.lowImageCount.push({
      slug,
      enCount: enGalleryCount,
      esCount: esGalleryCount,
    });
  }

  const hasAllResources =
    enResources.hasIUCN && enResources.hasINaturalist && enResources.hasGBIF;
  if (!hasAllResources) {
    results.missingResources.push({
      slug,
      missing: Object.keys(enResources).filter((k) => !enResources[k]),
    });
  }

  return treeData;
}

/**
 * Generate report
 */
function generateReport() {
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log("\n" + "=".repeat(70));
  console.log("📊 CONTENT QUALITY AUDIT REPORT");
  console.log("=".repeat(70) + "\n");

  console.log(`📝 Total trees analyzed: ${results.analyzed}`);
  console.log(`📏 Line threshold: ${LINE_THRESHOLD}`);
  console.log("");

  // Summary
  console.log("📈 Line Count Summary:");
  console.log(`   • Under 600 lines: ${results.summary.under600Lines}`);
  console.log(`   • 600-700 lines: ${results.summary.under700Lines}`);
  console.log(`   • Over 700 lines: ${results.summary.over700Lines}`);
  if (results.analyzed > 0) {
    const avgLines = results.summary.avgLineCount / results.analyzed;
    console.log(`   • Average: ${Math.round(avgLines)} lines`);
  }
  console.log("");

  // Short pages
  if (results.shortPages.length > 0) {
    console.log(
      `🔍 SHORT PAGES (under ${LINE_THRESHOLD} lines): ${results.shortPages.length}`
    );
    console.log("-".repeat(70));

    // Sort by line count (ascending)
    const sorted = results.shortPages.sort(
      (a, b) =>
        Math.min(a.en.lines, a.es.lines) - Math.min(b.en.lines, b.es.lines)
    );

    for (const tree of sorted) {
      const minLines = Math.min(tree.en.lines, tree.es.lines);
      const maxLines = Math.max(tree.en.lines, tree.es.lines);
      console.log(
        `   ${tree.slug.padEnd(30)} EN: ${tree.en.lines.toString().padStart(3)} | ES: ${tree.es.lines.toString().padStart(3)} lines`
      );

      if (verbose) {
        if (tree.en.missingSections.length > 0) {
          console.log(
            `      ⚠️  EN missing: ${tree.en.missingSections.join(", ")}`
          );
        }
        if (tree.es.missingSections.length > 0) {
          console.log(
            `      ⚠️  ES missing: ${tree.es.missingSections.join(", ")}`
          );
        }
        if (tree.en.galleryCount < 5 || tree.es.galleryCount < 5) {
          console.log(
            `      🖼️  Gallery: EN: ${tree.en.galleryCount}, ES: ${tree.es.galleryCount} (target: 5+)`
          );
        }
      }
    }
    console.log("");
  }

  // Missing sections
  if (results.missingSections.length > 0 && verbose) {
    console.log(
      `📋 MISSING REQUIRED SECTIONS: ${results.missingSections.length}`
    );
    console.log("-".repeat(70));
    for (const tree of results.missingSections.slice(0, 10)) {
      console.log(`   ${tree.slug}:`);
      if (tree.en.missingSections.length > 0) {
        console.log(`      EN: ${tree.en.missingSections.join(", ")}`);
      }
      if (tree.es.missingSections.length > 0) {
        console.log(`      ES: ${tree.es.missingSections.join(", ")}`);
      }
    }
    if (results.missingSections.length > 10) {
      console.log(`   ... and ${results.missingSections.length - 10} more`);
    }
    console.log("");
  }

  // Bilingual issues
  if (results.bilingualIssues.length > 0 && verbose) {
    console.log(
      `🌍 BILINGUAL PARITY ISSUES: ${results.bilingualIssues.length}`
    );
    console.log("-".repeat(70));
    for (const issue of results.bilingualIssues.slice(0, 10)) {
      if (issue.enLines) {
        console.log(
          `   ${issue.slug}: ${issue.difference} line difference (EN: ${issue.enLines}, ES: ${issue.esLines})`
        );
      } else {
        console.log(`   ${issue.slug}: ${issue.issue}`);
      }
    }
    if (results.bilingualIssues.length > 10) {
      console.log(`   ... and ${results.bilingualIssues.length - 10} more`);
    }
    console.log("");
  }

  // Low image count
  if (results.lowImageCount.length > 0 && verbose) {
    console.log(
      `🖼️  LOW IMAGE COUNT (< 5 images): ${results.lowImageCount.length}`
    );
    console.log("-".repeat(70));
    for (const tree of results.lowImageCount.slice(0, 10)) {
      console.log(
        `   ${tree.slug}: EN: ${tree.enCount}, ES: ${tree.esCount} images`
      );
    }
    if (results.lowImageCount.length > 10) {
      console.log(`   ... and ${results.lowImageCount.length - 10} more`);
    }
    console.log("");
  }

  // Missing resources
  if (results.missingResources.length > 0 && verbose) {
    console.log(
      `🔗 MISSING EXTERNAL RESOURCES: ${results.missingResources.length}`
    );
    console.log("-".repeat(70));
    for (const tree of results.missingResources.slice(0, 10)) {
      console.log(
        `   ${tree.slug}: Missing ${tree.missing.map((m) => m.replace("has", "")).join(", ")}`
      );
    }
    if (results.missingResources.length > 10) {
      console.log(`   ... and ${results.missingResources.length - 10} more`);
    }
    console.log("");
  }

  console.log("=".repeat(70));
  console.log(
    "💡 Tip: Use --verbose flag for detailed section and resource analysis"
  );
  console.log("💡 Tip: Use --json flag to output results in JSON format");
  console.log("=".repeat(70) + "\n");
}

/**
 * Main execution
 */
async function main() {
  console.log("🔍 Content Quality Auditor");
  console.log(`📏 Line threshold: ${LINE_THRESHOLD}`);

  if (singleTree) {
    console.log(`🌳 Auditing single tree: ${singleTree}\n`);
    const treeData = await auditTree(singleTree);
    if (treeData) {
      results.analyzed = 1;
      results.total = 1;
      results.summary.avgLineCount =
        (treeData.en.lines + treeData.es.lines) / 2;
    }
  } else {
    console.log("🌲 Auditing all trees...\n");

    // Get all tree slugs from EN directory
    const enFiles = await fs.readdir(TREES_EN_DIR);
    const slugs = enFiles
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => file.replace(".mdx", ""));

    results.total = slugs.length;

    for (const slug of slugs) {
      const treeData = await auditTree(slug);
      if (treeData) {
        results.analyzed++;
        results.summary.avgLineCount += treeData.en.lines;
        results.summary.avgEnLineCount += treeData.en.lines;
        results.summary.avgEsLineCount += treeData.es.lines;
      }
    }
  }

  generateReport();

  // Exit with error code if issues found
  const hasIssues =
    results.shortPages.length > 0 ||
    results.missingSections.length > 0 ||
    results.bilingualIssues.length > 0;

  process.exit(hasIssues ? 1 : 0);
}

main();
