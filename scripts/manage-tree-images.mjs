#!/usr/bin/env node

/**
 * Unified Tree Image Manager for Costa Rica Tree Atlas
 *
 * This script handles all image-related tasks:
 * - Audit: Check all tree images for validity
 * - Download: Fetch missing or broken images from iNaturalist
 * - Refresh: Update images with better quality versions
 * - Validate: Ensure all images meet quality standards
 *
 * Works in both local (macOS) and CI (Ubuntu) environments.
 *
 * Usage:
 *   node scripts/manage-tree-images.mjs audit              # Check image status
 *   node scripts/manage-tree-images.mjs download           # Download missing images
 *   node scripts/manage-tree-images.mjs download --force   # Re-download all images
 *   node scripts/manage-tree-images.mjs refresh            # Update with better images
 *   node scripts/manage-tree-images.mjs --tree=guanacaste  # Process single tree
 */

import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import https from "node:https";
import { execSync, exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

// Configuration
const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const TREES_ES_DIR = path.join(ROOT_DIR, "content/trees/es");
const IMAGES_DIR = path.join(ROOT_DIR, "public/images/trees");
const ATTRIBUTIONS_FILE = path.join(IMAGES_DIR, "attributions.json");

const COSTA_RICA_PLACE_ID = 6924;
const TARGET_WIDTH = 1200;
const MIN_IMAGE_SIZE = 20000; // 20KB minimum
const PLACEHOLDER_PATTERN = /12345678/;

// Parse arguments
const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("--")) || "audit";
const flags = new Set(args.filter((a) => a.startsWith("--")));
const forceRefresh = flags.has("--force");
const dryRun = flags.has("--dry-run");
const verbose = flags.has("--verbose");
const specificTree = args.find((a) => a.startsWith("--tree="))?.split("=")[1];

// Scientific name fixes for problematic species
const SCIENTIFIC_NAME_FIXES = {
  matapalo: "Ficus aurea",
  pochote: "Ceiba aesculifolia", // Better match than Pachira quinata
};

// Logging utilities
const log = {
  info: (msg) => console.log(msg),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  verbose: (msg) => verbose && console.log(`   ${msg}`),
  tree: (name, status, detail = "") =>
    console.log(`${status} ${name}${detail ? `: ${detail}` : ""}`),
};

// Platform detection
const isMacOS = process.platform === "darwin";
const hasSharp = await checkSharpAvailable();
const hasImageMagick = await checkImageMagickAvailable();

async function checkSharpAvailable() {
  try {
    await import("sharp");
    return true;
  } catch {
    return false;
  }
}

async function checkImageMagickAvailable() {
  try {
    execSync("which convert", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// HTTP utilities
function fetchWithTimeout(url, options = {}, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent": "CostaRicaTreeAtlas/2.0 (Educational Project)",
          ...options.headers,
        },
      },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          fetchWithTimeout(res.headers.location, options, timeout)
            .then(resolve)
            .catch(reject);
          return;
        }
        resolve(res);
      }
    );

    request.on("error", reject);
    request.setTimeout(timeout, () => {
      request.destroy();
      reject(new Error("Request timeout"));
    });
  });
}

async function fetchJson(url) {
  const res = await fetchWithTimeout(url);

  if (res.statusCode !== 200) {
    throw new Error(`HTTP ${res.statusCode}`);
  }

  return new Promise((resolve, reject) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error("Invalid JSON response"));
      }
    });
    res.on("error", reject);
  });
}

async function downloadFile(url, destPath) {
  const res = await fetchWithTimeout(url);

  if (res.statusCode !== 200) {
    throw new Error(`HTTP ${res.statusCode}`);
  }

  return new Promise((resolve, reject) => {
    const fileStream = fsSync.createWriteStream(destPath);
    res.pipe(fileStream);
    fileStream.on("finish", () => {
      fileStream.close();
      resolve(destPath);
    });
    fileStream.on("error", (err) => {
      fsSync.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function checkRemoteImage(url) {
  try {
    const res = await fetchWithTimeout(url, {}, 10000);
    const contentType = res.headers["content-type"] || "";
    res.destroy(); // Don't download the body
    return res.statusCode === 200 && contentType.startsWith("image/");
  } catch {
    return false;
  }
}

// iNaturalist API
async function searchTaxon(scientificName) {
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&rank=species&is_active=true&per_page=5`;

  try {
    const data = await fetchJson(url);
    const results = data.results || [];

    if (results.length === 0) return null;

    // Prefer exact match
    const exactMatch = results.find(
      (t) => t.name.toLowerCase() === scientificName.toLowerCase()
    );

    return exactMatch || results[0];
  } catch (err) {
    log.verbose(`Taxon search failed: ${err.message}`);
    return null;
  }
}

async function getTopPhotos(taxonId, limit = 15) {
  const photos = [];
  const seen = new Set();

  // First try Costa Rica observations
  const crUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&place_id=${COSTA_RICA_PLACE_ID}&photos=true&quality_grade=research&order_by=votes&per_page=${limit}`;

  try {
    const crData = await fetchJson(crUrl);
    extractPhotos(crData.results || [], photos, seen);
  } catch (err) {
    log.verbose(`Costa Rica search failed: ${err.message}`);
  }

  // If not enough, expand globally
  if (photos.length < 5) {
    const globalUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&quality_grade=research&order_by=votes&per_page=${limit}`;

    try {
      const globalData = await fetchJson(globalUrl);
      extractPhotos(globalData.results || [], photos, seen);
    } catch (err) {
      log.verbose(`Global search failed: ${err.message}`);
    }
  }

  // Sort by votes
  photos.sort((a, b) => b.votes - a.votes);

  return photos.slice(0, limit);
}

function extractPhotos(observations, photos, seen) {
  for (const obs of observations) {
    if (!obs.photos) continue;

    for (const photo of obs.photos) {
      if (!photo?.id || !photo?.url || seen.has(photo.id)) continue;

      seen.add(photo.id);

      // Convert to large/original URL
      let url = photo.url
        .replace("/square.", "/original.")
        .replace("/small.", "/original.")
        .replace("/medium.", "/large.");

      photos.push({
        id: photo.id,
        url,
        attribution: photo.attribution || "iNaturalist user",
        observationId: obs.id,
        votes: obs.faves_count || 0,
        place: obs.place_guess || "",
        dimensions: photo.original_dimensions,
      });
    }
  }
}

// Image processing
async function processImage(inputPath, outputPath) {
  // Try Sharp first (best quality, cross-platform)
  if (hasSharp) {
    try {
      const sharp = (await import("sharp")).default;
      await sharp(inputPath)
        .resize(TARGET_WIDTH, null, {
          withoutEnlargement: true,
          fit: "inside",
        })
        .jpeg({ quality: 85 })
        .toFile(outputPath);
      return true;
    } catch (err) {
      log.verbose(`Sharp processing failed: ${err.message}`);
    }
  }

  // Try ImageMagick (common in CI)
  if (hasImageMagick) {
    try {
      await execAsync(
        `convert "${inputPath}" -resize ${TARGET_WIDTH}x\\> -quality 85 "${outputPath}"`
      );
      return true;
    } catch (err) {
      log.verbose(`ImageMagick failed: ${err.message}`);
    }
  }

  // Fall back to sips (macOS only)
  if (isMacOS) {
    try {
      const result = execSync(
        `sips -g pixelWidth -g pixelHeight "${inputPath}"`,
        { encoding: "utf8" }
      );
      const widthMatch = result.match(/pixelWidth:\s*(\d+)/);
      const heightMatch = result.match(/pixelHeight:\s*(\d+)/);

      if (widthMatch && heightMatch) {
        const currentWidth = parseInt(widthMatch[1]);
        const currentHeight = parseInt(heightMatch[1]);

        if (currentWidth > TARGET_WIDTH) {
          const newHeight = Math.round(
            (TARGET_WIDTH / currentWidth) * currentHeight
          );
          execSync(
            `sips -z ${newHeight} ${TARGET_WIDTH} "${inputPath}" --out "${outputPath}"`,
            { stdio: "ignore" }
          );
        } else {
          await fs.copyFile(inputPath, outputPath);
        }

        execSync(
          `sips -s format jpeg -s formatOptions 85 "${outputPath}" --out "${outputPath}"`,
          { stdio: "ignore" }
        );
        return true;
      }
    } catch (err) {
      log.verbose(`sips processing failed: ${err.message}`);
    }
  }

  // Last resort: just copy
  await fs.copyFile(inputPath, outputPath);
  return true;
}

// File utilities
async function readMdxFrontmatter(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const match = content.match(/^---\n([\s\S]*?)\n---/);

    if (!match) return null;

    const frontmatter = {};
    for (const line of match[1].split("\n")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim();
        let value = line.slice(colonIdx + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        frontmatter[key] = value;
      }
    }

    return { frontmatter, content };
  } catch {
    return null;
  }
}

async function updateMdxFeaturedImage(filePath, newImagePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const updated = content.replace(
      /featuredImage:\s*["']?[^"'\n]+["']?/,
      `featuredImage: "${newImagePath}"`
    );
    await fs.writeFile(filePath, updated, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function loadAttributions() {
  try {
    const data = await fs.readFile(ATTRIBUTIONS_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveAttributions(attributions) {
  await fs.writeFile(
    ATTRIBUTIONS_FILE,
    JSON.stringify(attributions, null, 2),
    "utf8"
  );
}

// Image status checking
async function checkImageStatus(treeName, featuredImage) {
  const status = {
    treeName,
    featuredImage,
    isLocal: false,
    isExternal: false,
    isPlaceholder: false,
    isValid: false,
    localPath: null,
    fileSize: 0,
  };

  if (!featuredImage) {
    return { ...status, issue: "missing" };
  }

  status.isPlaceholder = PLACEHOLDER_PATTERN.test(featuredImage);
  status.isLocal = featuredImage.startsWith("/images/");
  status.isExternal = featuredImage.startsWith("http");

  if (status.isPlaceholder) {
    return { ...status, issue: "placeholder" };
  }

  if (status.isLocal) {
    status.localPath = path.join(ROOT_DIR, "public", featuredImage);

    try {
      const stat = await fs.stat(status.localPath);
      status.fileSize = stat.size;
      status.isValid = stat.size >= MIN_IMAGE_SIZE;

      if (!status.isValid) {
        return { ...status, issue: "too_small" };
      }

      return { ...status, issue: null };
    } catch {
      return { ...status, issue: "local_missing" };
    }
  }

  if (status.isExternal) {
    status.isValid = await checkRemoteImage(featuredImage);

    if (!status.isValid) {
      return { ...status, issue: "remote_broken" };
    }

    return { ...status, issue: "external" };
  }

  return { ...status, issue: "unknown" };
}

// Main processing function
async function processTree(treeName, scientificName, options = {}) {
  const { download = false, force = false } = options;

  log.verbose(`Processing ${treeName} (${scientificName})`);

  // Fix scientific name if needed
  const searchName = SCIENTIFIC_NAME_FIXES[treeName] || scientificName;

  // Search iNaturalist
  const taxon = await searchTaxon(searchName);

  if (!taxon) {
    return { success: false, reason: "Taxon not found on iNaturalist" };
  }

  // Get photos
  await sleep(300); // Rate limiting
  const photos = await getTopPhotos(taxon.id);

  if (photos.length === 0) {
    return { success: false, reason: "No research-grade photos found" };
  }

  if (!download) {
    return {
      success: true,
      taxon,
      photosAvailable: photos.length,
      topPhoto: photos[0],
    };
  }

  // Download best photo
  const tempPath = path.join(IMAGES_DIR, `${treeName}-temp.jpg`);
  const finalPath = path.join(IMAGES_DIR, `${treeName}.jpg`);

  for (let i = 0; i < Math.min(3, photos.length); i++) {
    const photo = photos[i];

    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        photo,
      };
    }

    try {
      log.verbose(`Trying photo ${i + 1}: ${photo.url.substring(0, 60)}...`);

      await downloadFile(photo.url, tempPath);

      const stats = await fs.stat(tempPath);
      if (stats.size < MIN_IMAGE_SIZE) {
        log.verbose(`Image too small (${stats.size} bytes)`);
        await fs.unlink(tempPath).catch(() => {});
        continue;
      }

      await processImage(tempPath, finalPath);
      await fs.unlink(tempPath).catch(() => {});

      const finalStats = await fs.stat(finalPath);

      return {
        success: true,
        path: `/images/trees/${treeName}.jpg`,
        localPath: finalPath,
        fileSize: finalStats.size,
        photo,
      };
    } catch (err) {
      log.verbose(`Download failed: ${err.message}`);
      await fs.unlink(tempPath).catch(() => {});
    }
  }

  return { success: false, reason: "All download attempts failed" };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Command handlers
async function auditImages() {
  log.info("🔍 Auditing tree images...\n");

  const files = (await fs.readdir(TREES_EN_DIR)).filter((f) =>
    f.endsWith(".mdx")
  );

  const results = {
    valid: [],
    missing: [],
    placeholder: [],
    broken: [],
    external: [],
    tooSmall: [],
  };

  for (const file of files) {
    const treeName = file.replace(".mdx", "");

    if (specificTree && treeName !== specificTree) continue;

    const mdx = await readMdxFrontmatter(path.join(TREES_EN_DIR, file));
    if (!mdx) continue;

    const status = await checkImageStatus(
      treeName,
      mdx.frontmatter.featuredImage
    );

    switch (status.issue) {
      case null:
        results.valid.push(status);
        log.tree(
          treeName,
          "✅",
          `local (${Math.round(status.fileSize / 1024)}KB)`
        );
        break;
      case "missing":
        results.missing.push(status);
        log.tree(treeName, "❌", "no featuredImage");
        break;
      case "placeholder":
        results.placeholder.push(status);
        log.tree(treeName, "⚠️ ", "placeholder URL");
        break;
      case "local_missing":
        results.broken.push(status);
        log.tree(treeName, "❌", "local file missing");
        break;
      case "remote_broken":
        results.broken.push(status);
        log.tree(treeName, "❌", "remote URL broken");
        break;
      case "external":
        results.external.push(status);
        log.tree(treeName, "📡", "external URL (not local)");
        break;
      case "too_small":
        results.tooSmall.push(status);
        log.tree(treeName, "⚠️ ", `too small (${status.fileSize} bytes)`);
        break;
    }
  }

  // Summary
  log.info("\n" + "=".repeat(50));
  log.info("📊 AUDIT SUMMARY");
  log.info("=".repeat(50));
  log.info(`✅ Valid local images: ${results.valid.length}`);
  log.info(`📡 External URLs: ${results.external.length}`);
  log.info(`⚠️  Placeholders: ${results.placeholder.length}`);
  log.info(`⚠️  Too small: ${results.tooSmall.length}`);
  log.info(
    `❌ Broken/missing: ${results.broken.length + results.missing.length}`
  );

  const issues =
    results.missing.length +
    results.placeholder.length +
    results.broken.length +
    results.tooSmall.length;

  if (issues > 0) {
    log.info(`\n💡 Run 'npm run images:download' to fix ${issues} issues`);
    process.exit(1);
  }

  return results;
}

async function downloadImages() {
  log.info("📥 Downloading tree images...\n");

  if (dryRun) {
    log.info("🔍 DRY RUN MODE - No files will be modified\n");
  }

  // Ensure images directory exists
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const files = (await fs.readdir(TREES_EN_DIR)).filter((f) =>
    f.endsWith(".mdx")
  );

  const results = {
    downloaded: [],
    skipped: [],
    failed: [],
  };

  const attributions = await loadAttributions();

  for (const file of files) {
    const treeName = file.replace(".mdx", "");

    if (specificTree && treeName !== specificTree) continue;

    const mdx = await readMdxFrontmatter(path.join(TREES_EN_DIR, file));
    if (!mdx) continue;

    const scientificName = mdx.frontmatter.scientificName;
    if (!scientificName) {
      results.failed.push({ name: treeName, reason: "No scientificName" });
      continue;
    }

    const status = await checkImageStatus(
      treeName,
      mdx.frontmatter.featuredImage
    );

    // Skip if valid local image exists (unless forcing)
    if (status.issue === null && !forceRefresh) {
      results.skipped.push({ name: treeName, reason: "Valid local image" });
      log.tree(treeName, "⏭️ ", "already has valid local image");
      continue;
    }

    // Process this tree
    log.tree(treeName, "📗", `downloading (${scientificName})`);

    const result = await processTree(treeName, scientificName, {
      download: true,
      force: forceRefresh,
    });

    if (result.success && !result.dryRun) {
      // Update MDX files
      const enPath = path.join(TREES_EN_DIR, file);
      const esPath = path.join(TREES_ES_DIR, file);

      await updateMdxFeaturedImage(enPath, result.path);
      if (
        await fs
          .stat(esPath)
          .then(() => true)
          .catch(() => false)
      ) {
        await updateMdxFeaturedImage(esPath, result.path);
      }

      // Update attributions
      attributions[treeName] = {
        attribution: result.photo.attribution,
        source: `https://www.inaturalist.org/observations/${result.photo.observationId}`,
        downloadedAt: new Date().toISOString(),
      };

      results.downloaded.push({
        name: treeName,
        path: result.path,
        size: result.fileSize,
        attribution: result.photo.attribution,
      });

      log.tree(
        treeName,
        "   ✅",
        `saved (${Math.round(result.fileSize / 1024)}KB)`
      );
    } else if (result.dryRun) {
      results.downloaded.push({ name: treeName, dryRun: true });
      log.tree(treeName, "   🔍", "[DRY RUN] would download");
    } else {
      results.failed.push({ name: treeName, reason: result.reason });
      log.tree(treeName, "   ❌", result.reason);
    }

    await sleep(500); // Rate limiting
  }

  // Save attributions
  if (!dryRun && results.downloaded.length > 0) {
    await saveAttributions(attributions);
  }

  // Summary
  log.info("\n" + "=".repeat(50));
  log.info("📊 DOWNLOAD SUMMARY");
  log.info("=".repeat(50));
  log.info(`✅ Downloaded: ${results.downloaded.length}`);
  log.info(`⏭️  Skipped: ${results.skipped.length}`);
  log.info(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    log.info("\nFailed trees:");
    for (const item of results.failed) {
      log.info(`  - ${item.name}: ${item.reason}`);
    }
  }

  return results;
}

async function refreshImages() {
  log.info("🔄 Checking for better quality images...\n");

  const files = (await fs.readdir(TREES_EN_DIR)).filter((f) =>
    f.endsWith(".mdx")
  );

  const candidates = [];
  const attributions = await loadAttributions();

  for (const file of files) {
    const treeName = file.replace(".mdx", "");

    if (specificTree && treeName !== specificTree) continue;

    const mdx = await readMdxFrontmatter(path.join(TREES_EN_DIR, file));
    if (!mdx) continue;

    const scientificName = mdx.frontmatter.scientificName;
    if (!scientificName) continue;

    // Check current status
    const status = await checkImageStatus(
      treeName,
      mdx.frontmatter.featuredImage
    );

    // Check iNaturalist for potentially better images
    const result = await processTree(treeName, scientificName, {
      download: false,
    });

    if (result.success && result.topPhoto) {
      const currentAttribution = attributions[treeName];

      // Compare: is there a better image?
      const currentVotes = 0; // We don't track this currently
      const newVotes = result.topPhoto.votes;

      if (newVotes > currentVotes + 5 || status.issue !== null) {
        candidates.push({
          treeName,
          currentStatus: status,
          newPhoto: result.topPhoto,
          photosAvailable: result.photosAvailable,
        });
      }
    }

    await sleep(300);
  }

  log.info(
    `\n📊 Found ${candidates.length} trees with potentially better images\n`
  );

  for (const candidate of candidates) {
    log.info(
      `  - ${candidate.treeName}: ${candidate.newPhoto.votes} votes (${candidate.photosAvailable} photos available)`
    );
  }

  if (candidates.length > 0 && !dryRun) {
    log.info(`\n💡 Run 'npm run images:download --force' to update all images`);
  }

  return candidates;
}

// Main entry point
async function main() {
  log.info("🌳 Costa Rica Tree Atlas - Image Manager");
  log.info("=".repeat(50));

  // Log environment
  log.info(`Platform: ${process.platform}`);
  log.info(`Sharp: ${hasSharp ? "✅" : "❌"}`);
  log.info(`ImageMagick: ${hasImageMagick ? "✅" : "❌"}`);
  log.info(`sips (macOS): ${isMacOS ? "✅" : "❌"}`);
  log.info("");

  switch (command) {
    case "audit":
      await auditImages();
      break;
    case "download":
      await downloadImages();
      break;
    case "refresh":
      await refreshImages();
      break;
    default:
      log.error(`Unknown command: ${command}`);
      log.info("\nUsage:");
      log.info("  node scripts/manage-tree-images.mjs audit");
      log.info(
        "  node scripts/manage-tree-images.mjs download [--force] [--dry-run]"
      );
      log.info("  node scripts/manage-tree-images.mjs refresh");
      log.info("  node scripts/manage-tree-images.mjs --tree=<name> <command>");
      process.exit(1);
  }
}

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
