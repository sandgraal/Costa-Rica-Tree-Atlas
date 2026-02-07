#!/usr/bin/env node

/**
 * Script: propose-image-changes.mjs
 * Description: Generate image change proposals for admin review (never auto-applies).
 *
 * Scans all tree species, checks for missing, broken, or low-quality images,
 * finds better alternatives from iNaturalist, and creates proposals via the
 * admin API for human review.
 *
 * This replaces the old auto-apply workflow with a human-in-the-loop approach.
 *
 * Usage:
 *   node scripts/propose-image-changes.mjs                    # Generate proposals for all trees
 *   node scripts/propose-image-changes.mjs --tree=guanacaste   # Single tree
 *   node scripts/propose-image-changes.mjs --dry-run           # Preview without creating proposals
 *   node scripts/propose-image-changes.mjs --help              # Show help
 *
 * @see docs/IMAGE_REVIEW_SYSTEM.md
 */

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";

// Configuration
const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const IMAGES_DIR = path.join(ROOT_DIR, "public/images/trees");

const COSTA_RICA_PLACE_ID = 6924;
const MIN_IMAGE_SIZE = 20_000; // 20KB minimum for valid images

// API configuration
const API_BASE_URL =
  process.env.API_BASE_URL ||
  "http://localhost:3000/api/admin/images/proposals";
const WORKFLOW_TOKEN =
  process.env.WORKFLOW_TOKEN ||
  `Bearer workflow-${process.env.GITHUB_RUN_ID || "local"}`;

// Parse arguments
const args = process.argv.slice(2);
const SHOW_HELP = args.includes("--help") || args.includes("-h");
const DRY_RUN = args.includes("--dry-run");
const VERBOSE = args.includes("--verbose");
const SPECIFIC_TREE = args.find((a) => a.startsWith("--tree="))?.split("=")[1];

// Stats tracking
const stats = {
  treesScanned: 0,
  proposalsCreated: 0,
  missingImages: 0,
  lowQualityImages: 0,
  errors: 0,
};

/**
 * Show usage information
 */
function showHelp() {
  console.log(`
Image Proposal Generator

Generates image change proposals for admin review.
NEVER auto-applies changes — all proposals require human approval.

Usage:
  node scripts/propose-image-changes.mjs [options]

Options:
  --tree=<slug>   Process only this tree
  --dry-run       Preview proposals without creating them
  --verbose       Show detailed output
  --help, -h      Show this help message

Environment Variables:
  API_BASE_URL    Base URL for the proposals API (default: http://localhost:3000/api/admin/images/proposals)
  WORKFLOW_TOKEN  Authentication token for workflow requests
  GITHUB_RUN_ID   GitHub Actions run ID (auto-set in CI)
`);
  process.exit(0);
}

if (SHOW_HELP) showHelp();

/**
 * Log helpers
 */
const log = {
  info: (msg) => console.log(msg),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  verbose: (msg) => VERBOSE && console.log(`   ${msg}`),
  proposal: (slug, reason) => console.log(`📋 ${slug}: ${reason}`),
};

/**
 * Parse MDX frontmatter to extract tree metadata
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();

    // Remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    frontmatter[key] = value;
  }

  return frontmatter;
}

/**
 * Check if a local image exists and meets minimum quality standards
 */
async function checkImageQuality(imagePath) {
  if (!fsSync.existsSync(imagePath)) {
    return { exists: false, quality: "missing", size: 0 };
  }

  try {
    const { size } = await fs.stat(imagePath);

    if (size < MIN_IMAGE_SIZE) {
      return { exists: true, quality: "too_small", size };
    }

    return { exists: true, quality: "ok", size };
  } catch {
    return { exists: false, quality: "error", size: 0 };
  }
}

/**
 * Fetch JSON from a URL with timeout
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "CostaRicaTreeAtlas/2.0 (Educational Project)",
        },
        timeout: 30000,
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchJson(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
        res.on("error", reject);
      }
    );

    request.on("error", reject);
    request.on("timeout", () => {
      request.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

/**
 * Search iNaturalist for better images of a species
 */
async function findBetterImages(scientificName) {
  try {
    const query = encodeURIComponent(scientificName);
    const url = `https://api.inaturalist.org/v1/observations?taxon_name=${query}&place_id=${COSTA_RICA_PLACE_ID}&quality_grade=research&photos=true&per_page=10&order_by=votes`;

    const data = await fetchJson(url);

    if (!data.results || data.results.length === 0) {
      log.verbose(`No iNaturalist results for ${scientificName}`);
      return [];
    }

    const candidates = [];

    for (const obs of data.results) {
      if (!obs.photos || obs.photos.length === 0) continue;

      for (const photo of obs.photos) {
        // Get the medium/large URL
        const photoUrl = photo.url
          ?.replace("/square.", "/medium.")
          ?.replace("/small.", "/medium.");

        if (!photoUrl) continue;

        // Try to get a larger version
        const largeUrl = photoUrl.replace("/medium.", "/large.");

        candidates.push({
          url: largeUrl,
          fallbackUrl: photoUrl,
          source: "iNaturalist",
          observationId: obs.id,
          attribution: photo.attribution || "iNaturalist",
          qualityScore: calculateQualityScore(obs, photo),
        });
      }
    }

    // Sort by quality score, return top candidates
    candidates.sort((a, b) => b.qualityScore - a.qualityScore);
    return candidates.slice(0, 3);
  } catch (err) {
    log.verbose(
      `iNaturalist search failed for ${scientificName}: ${err.message}`
    );
    return [];
  }
}

/**
 * Calculate a quality score for an iNaturalist photo (0-100)
 */
function calculateQualityScore(observation, photo) {
  let score = 50; // Base score

  // Research grade bonus
  if (observation.quality_grade === "research") {
    score += 15;
  }

  // Community votes
  const votes = observation.faves_count || 0;
  score += Math.min(votes * 3, 15); // Up to 15 points for votes

  // Identification confidence
  const identifications = observation.identifications_count || 0;
  if (identifications >= 3) score += 10;
  else if (identifications >= 2) score += 5;

  // Photo position (first photo is usually best)
  const photoIndex = observation.photos?.indexOf(photo) ?? 0;
  if (photoIndex === 0) score += 5;

  // Place bonus (Costa Rica)
  if (observation.place_ids?.includes(COSTA_RICA_PLACE_ID)) {
    score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Create a proposal via the API
 */
async function createProposal(proposalData) {
  if (DRY_RUN) {
    log.proposal(
      proposalData.treeSlug,
      `[DRY RUN] Would propose ${proposalData.imageType}: ${proposalData.reason}`
    );
    return { dryRun: true };
  }

  const body = JSON.stringify(proposalData);

  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE_URL);
    const isHttps = url.protocol === "https:";
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
        Authorization: WORKFLOW_TOKEN,
      },
      timeout: 15000,
    };

    const protocol = isHttps ? https : http;
    {
      const req = protocol.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const result = JSON.parse(data);
            if (res.statusCode === 201) {
              resolve(result);
            } else if (res.statusCode === 409) {
              // Duplicate - already a pending proposal
              resolve({ duplicate: true, ...result });
            } else {
              reject(new Error(`API error ${res.statusCode}: ${data}`));
            }
          } catch {
            reject(new Error(`Invalid response: ${data}`));
          }
        });
      });

      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("API request timeout"));
      });

      req.write(body);
      req.end();
    }
  });
}

/**
 * Process a single tree species
 */
async function processTree(slug, frontmatter) {
  const { scientificName } = frontmatter;
  if (!scientificName) {
    log.warn(`${slug}: No scientificName in frontmatter, skipping`);
    return;
  }

  log.verbose(`Processing ${slug} (${scientificName})`);

  // Check featured image quality
  const featuredImagePath = path.join(IMAGES_DIR, `${slug}.jpg`);
  const featuredQuality = await checkImageQuality(featuredImagePath);

  if (featuredQuality.quality === "missing") {
    stats.missingImages++;
    log.proposal(slug, "Featured image missing");

    // Search for replacement
    const candidates = await findBetterImages(scientificName);
    if (candidates.length > 0) {
      const best = candidates[0];
      try {
        await createProposal({
          treeSlug: slug,
          imageType: "FEATURED",
          currentUrl: null,
          proposedUrl: best.url,
          proposedSource: best.source,
          proposedAlt: `${frontmatter.title || slug} (${scientificName})`,
          qualityScore: best.qualityScore,
          source: "WORKFLOW",
          reason: "Missing featured image - found candidate on iNaturalist",
          workflowRunId: process.env.GITHUB_RUN_ID || null,
        });
        stats.proposalsCreated++;
      } catch (err) {
        log.error(`${slug}: Failed to create proposal: ${err.message}`);
        stats.errors++;
      }
    }
  } else if (featuredQuality.quality === "too_small") {
    stats.lowQualityImages++;
    log.proposal(
      slug,
      `Featured image too small (${featuredQuality.size} bytes)`
    );

    const candidates = await findBetterImages(scientificName);
    if (candidates.length > 0) {
      const best = candidates[0];
      try {
        await createProposal({
          treeSlug: slug,
          imageType: "FEATURED",
          currentUrl: `/images/trees/${slug}.jpg`,
          currentSource: "local",
          proposedUrl: best.url,
          proposedSource: best.source,
          proposedAlt: `${frontmatter.title || slug} (${scientificName})`,
          qualityScore: best.qualityScore,
          fileSize: featuredQuality.size,
          source: "WORKFLOW",
          reason: `Low quality image (${(featuredQuality.size / 1024).toFixed(1)}KB < ${MIN_IMAGE_SIZE / 1024}KB minimum)`,
          workflowRunId: process.env.GITHUB_RUN_ID || null,
        });
        stats.proposalsCreated++;
      } catch (err) {
        log.error(`${slug}: Failed to create proposal: ${err.message}`);
        stats.errors++;
      }
    }
  }

  // Rate limit: small delay between iNaturalist API calls
  await new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * Get all tree slugs and their frontmatter
 */
async function getAllTrees() {
  const trees = [];
  const files = await fs.readdir(TREES_EN_DIR);

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;

    const slug = file.replace(".mdx", "");
    if (SPECIFIC_TREE && slug !== SPECIFIC_TREE) continue;

    try {
      const content = await fs.readFile(path.join(TREES_EN_DIR, file), "utf-8");
      const frontmatter = parseFrontmatter(content);

      if (frontmatter) {
        trees.push({ slug, frontmatter });
      }
    } catch (err) {
      log.error(`Failed to read ${file}: ${err.message}`);
      stats.errors++;
    }
  }

  return trees;
}

/**
 * Main execution
 */
async function main() {
  console.log("=".repeat(60));
  console.log("📋 Image Proposal Generator");
  console.log("=".repeat(60));
  console.log();

  if (DRY_RUN) {
    log.info("🔍 DRY RUN mode - no proposals will be created\n");
  }

  const trees = await getAllTrees();

  if (trees.length === 0) {
    log.warn("No trees found to process");
    if (SPECIFIC_TREE) {
      log.info(`Check that ${SPECIFIC_TREE}.mdx exists in content/trees/en/`);
    }
    process.exit(0);
  }

  log.info(`Found ${trees.length} trees to scan\n`);

  for (const { slug, frontmatter } of trees) {
    stats.treesScanned++;
    await processTree(slug, frontmatter);
  }

  // Summary
  console.log();
  console.log("=".repeat(60));
  console.log("📊 Summary");
  console.log("=".repeat(60));
  console.log(`Trees scanned:      ${stats.treesScanned}`);
  console.log(`Missing images:     ${stats.missingImages}`);
  console.log(`Low quality images: ${stats.lowQualityImages}`);
  console.log(`Proposals created:  ${stats.proposalsCreated}`);
  console.log(`Errors:             ${stats.errors}`);

  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN complete - no proposals were created");
  } else if (stats.proposalsCreated > 0) {
    console.log(
      `\n✅ Created ${stats.proposalsCreated} proposals for admin review`
    );
    console.log("   Visit /admin/images/proposals to review them");
  } else {
    console.log("\n✅ All images look good - no proposals needed");
  }
}

main().catch((err) => {
  log.error(`Fatal error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
