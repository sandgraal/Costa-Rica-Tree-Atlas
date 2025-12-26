#!/usr/bin/env node

/**
 * Unified Tree Image Manager for Costa Rica Tree Atlas
 *
 * This script handles all image-related tasks:
 * - Audit: Check all tree images for validity (featured + gallery)
 * - Download: Fetch missing or broken images from iNaturalist
 * - Refresh: Update images with better quality versions
 * - Validate: Ensure all images meet quality standards
 * - Gallery: Audit and update photo gallery images in MDX content
 *
 * Works in both local (macOS) and CI (Ubuntu) environments.
 *
 * Usage:
 *   node scripts/manage-tree-images.mjs audit              # Check image status
 *   node scripts/manage-tree-images.mjs audit-gallery      # Check gallery images only
 *   node scripts/manage-tree-images.mjs download           # Download missing images
 *   node scripts/manage-tree-images.mjs download --force   # Re-download all images
 *   node scripts/manage-tree-images.mjs refresh            # Update with better images
 *   node scripts/manage-tree-images.mjs refresh-gallery    # Update gallery images
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
const GALLERY_TARGET_WIDTH = 800; // Smaller for gallery images
const MIN_IMAGE_SIZE = 20000; // 20KB minimum
const MIN_GALLERY_IMAGE_SIZE = 10000; // 10KB minimum for gallery
const PLACEHOLDER_PATTERN = /12345678/;
const GALLERY_IMAGES_DIR = path.join(IMAGES_DIR, "gallery");

// Gallery image quality criteria
const GALLERY_QUALITY_CRITERIA = {
  minVotes: 3, // Minimum faves/votes on iNaturalist
  preferCR: true, // Prefer Costa Rica observations
  maxAge: 365 * 5, // Prefer photos from last 5 years
  aspectRatioRange: [0.5, 2.0], // Acceptable aspect ratios
};

const GALLERY_CATEGORY_PATTERNS = {
  whole_tree: [/whole tree/, /full tree/, /canopy/, /tree form/],
  // Use word boundaries for short English terms to avoid matching substrings
  // like "leaf" in "leaflet" or "bark" in "embark".
  leaves: [/\bleaf\b/, /\bleaves\b/, /foliage/, /hoja/, /hojas/],
  bark: [/\bbark\b/, /trunk/, /corteza/],
  flowers: [/flower/, /flowers/, /bloom/, /blossom/, /flor/, /flores/],
  fruit: [/fruit/, /fruits/, /\bseed\b/, /pod/, /fruto/, /frutos/],
  habitat: [/habitat/, /forest/, /bosque/],
};

// Parse arguments
const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("--")) || "audit";
const flags = new Set(args.filter((a) => a.startsWith("--")));
const forceRefresh = flags.has("--force");
const dryRun = flags.has("--dry-run");
const verbose = flags.has("--verbose");
const specificTree = args.find((a) => a.startsWith("--tree="))?.split("=")[1];

// Scientific name fixes for problematic species (genus-level or incorrect names)
const SCIENTIFIC_NAME_FIXES = {
  matapalo: "Ficus aurea",
  pochote: "Ceiba aesculifolia", // Better match than Pachira quinata
  "roble-encino": "Quercus costaricensis", // Genus-level "Quercus spp." doesn't work
  orey: "Campnosperma panamense", // Very rare, but correct name
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

// GBIF API - Fallback for rare species
async function getGBIFPhotos(scientificName, limit = 5) {
  const photos = [];

  try {
    // First find the species key
    const matchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}`;
    const matchData = await fetchJson(matchUrl);

    if (!matchData.usageKey) {
      log.verbose(`GBIF: No match for ${scientificName}`);
      return photos;
    }

    // Search for occurrences with images
    const occUrl = `https://api.gbif.org/v1/occurrence/search?taxonKey=${matchData.usageKey}&mediaType=StillImage&limit=${limit * 2}`;
    const occData = await fetchJson(occUrl);

    for (const result of occData.results || []) {
      if (!result.media || result.media.length === 0) continue;

      for (const media of result.media) {
        if (!media.identifier) continue;
        // Skip herbarium specimens URLs (usually have "herbarium" in publisher or specific patterns)
        const url = media.identifier;
        if (
          url.includes("herbarium") ||
          url.includes("collections.nmnh") ||
          url.includes("sweetgum.nybg")
        ) {
          continue;
        }

        photos.push({
          id: `gbif-${result.key}`,
          url: media.identifier,
          attribution: media.creator || media.rightsHolder || "GBIF",
          source: "GBIF",
          license: media.license || "Unknown",
        });

        if (photos.length >= limit) break;
      }
      if (photos.length >= limit) break;
    }
  } catch (err) {
    log.verbose(`GBIF search failed: ${err.message}`);
  }

  return photos;
}

// Wikimedia Commons API - Another fallback
async function getWikimediaPhotos(scientificName, limit = 5) {
  const photos = [];

  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(scientificName)}&srnamespace=6&format=json&srlimit=${limit}`;
    const searchData = await fetchJson(searchUrl);

    for (const result of searchData.query?.search || []) {
      // Get image info
      const title = result.title;
      const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|user&format=json`;

      try {
        const infoData = await fetchJson(infoUrl);
        const pages = infoData.query?.pages || {};
        const page = Object.values(pages)[0];

        if (page?.imageinfo?.[0]?.url) {
          photos.push({
            id: `wikimedia-${page.pageid}`,
            url: page.imageinfo[0].url,
            attribution: page.imageinfo[0].user || "Wikimedia Commons",
            source: "Wikimedia Commons",
            license: "CC BY-SA",
          });
        }
      } catch {
        // Skip this image
      }
    }
  } catch (err) {
    log.verbose(`Wikimedia search failed: ${err.message}`);
  }

  return photos;
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

  // First try Costa Rica observations (research-grade)
  const crUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&place_id=${COSTA_RICA_PLACE_ID}&photos=true&quality_grade=research&order_by=votes&per_page=${limit}`;

  try {
    const crData = await fetchJson(crUrl);
    extractPhotos(crData.results || [], photos, seen);
  } catch (err) {
    log.verbose(`Costa Rica search failed: ${err.message}`);
  }

  // If not enough, expand globally (research-grade)
  if (photos.length < 5) {
    const globalUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&quality_grade=research&order_by=votes&per_page=${limit}`;

    try {
      const globalData = await fetchJson(globalUrl);
      extractPhotos(globalData.results || [], photos, seen);
    } catch (err) {
      log.verbose(`Global search failed: ${err.message}`);
    }
  }

  // FALLBACK: If still no photos, try needs_id quality (less strict)
  if (photos.length === 0) {
    log.verbose(`No research-grade photos, trying needs_id quality...`);
    const needsIdUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&quality_grade=needs_id&order_by=votes&per_page=${limit}`;

    try {
      const needsIdData = await fetchJson(needsIdUrl);
      extractPhotos(needsIdData.results || [], photos, seen);
    } catch (err) {
      log.verbose(`Needs-ID search failed: ${err.message}`);
    }
  }

  // FALLBACK 2: Try any quality grade as last resort
  if (photos.length === 0) {
    log.verbose(`No needs_id photos, trying any quality...`);
    const anyUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&order_by=votes&per_page=${limit}`;

    try {
      const anyData = await fetchJson(anyUrl);
      // Filter out copyright-blocked images
      const filtered = (anyData.results || []).filter((obs) =>
        obs.photos?.some(
          (p) => p.url && !p.url.includes("copyright-infringement")
        )
      );
      extractPhotos(filtered, photos, seen);
    } catch (err) {
      log.verbose(`Any quality search failed: ${err.message}`);
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

// Gallery image extraction from MDX content
function extractGalleryImages(content) {
  const images = [];

  // Match ImageCard components within ImageGallery blocks
  const galleryMatch = content.match(
    /<ImageGallery>([\s\S]*?)<\/ImageGallery>/g
  );

  if (!galleryMatch) return images;

  for (const gallery of galleryMatch) {
    // Extract all ImageCard components
    const cardMatches = gallery.matchAll(/<ImageCard\s+([\s\S]*?)\/>/g);

    for (const match of cardMatches) {
      const attrs = match[1];
      const image = {};

      // Extract src attribute
      const srcMatch = attrs.match(/src=["']([^"']+)["']/);
      if (srcMatch) image.src = srcMatch[1];

      // Extract alt attribute
      const altMatch = attrs.match(/alt=["']([^"']+)["']/);
      if (altMatch) image.alt = altMatch[1];

      // Extract title attribute
      const titleMatch = attrs.match(/title=["']([^"']+)["']/);
      if (titleMatch) image.title = titleMatch[1];

      // Extract credit attribute
      const creditMatch = attrs.match(/credit=["']([^"']+)["']/);
      if (creditMatch) image.credit = creditMatch[1];

      // Extract license attribute
      const licenseMatch = attrs.match(/license=["']([^"']+)["']/);
      if (licenseMatch) image.license = licenseMatch[1];

      // Extract sourceUrl attribute
      const sourceUrlMatch = attrs.match(/sourceUrl=["']([^"']+)["']/);
      if (sourceUrlMatch) image.sourceUrl = sourceUrlMatch[1];

      if (image.src) {
        images.push(image);
      }
    }
  }

  return images;
}

function inferGalleryCategory(image) {
  const text = `${image.title ?? ""} ${image.alt ?? ""}`.toLowerCase();

  for (const [category, patterns] of Object.entries(GALLERY_CATEGORY_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(text))) {
      return category;
    }
  }

  return null;
}

function evaluateGalleryDiversity(images) {
  const categories = new Set();

  for (const image of images) {
    const category = inferGalleryCategory(image);
    if (category) {
      categories.add(category);
    }
  }

  return {
    categories,
    hasWholeTree: categories.has("whole_tree"),
    isDiverse: categories.size >= 3 && categories.has("whole_tree"),
  };
}

// Check if a gallery image URL is valid and high-quality
async function validateGalleryImage(imageUrl) {
  const result = {
    isValid: false,
    isAccessible: false,
    isHighQuality: false,
    isRepresentative: true, // Will be assessed during manual review
    reason: null,
  };

  if (!imageUrl) {
    result.reason = "missing_url";
    return result;
  }

  // Check if it's a placeholder
  if (PLACEHOLDER_PATTERN.test(imageUrl)) {
    result.reason = "placeholder";
    return result;
  }

  // Check if URL is accessible
  try {
    const isAccessible = await checkRemoteImage(imageUrl);
    result.isAccessible = isAccessible;

    if (!isAccessible) {
      result.reason = "url_broken";
      return result;
    }

    // Check if using optimal size (medium/large vs square/small)
    if (imageUrl.includes("/square.") || imageUrl.includes("/small.")) {
      result.isHighQuality = false;
      result.reason = "low_resolution";
    } else {
      result.isHighQuality = true;
    }

    result.isValid = result.isAccessible && result.isHighQuality;
    return result;
  } catch (err) {
    result.reason = `error: ${err.message}`;
    return result;
  }
}

// Get diverse, high-quality photos for gallery (leaves, bark, flowers, fruit, habitat)
async function getGalleryPhotos(taxonId, limit = 5) {
  const photos = [];
  const seen = new Set();
  const categories = {
    whole_tree: [],
    leaves: [],
    bark: [],
    flowers: [],
    fruit: [],
    habitat: [],
  };

  // Fetch more photos to filter for diversity
  const searchLimit = limit * 5;

  // First try Costa Rica observations
  const crUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&place_id=${COSTA_RICA_PLACE_ID}&photos=true&quality_grade=research&order_by=votes&per_page=${searchLimit}`;

  try {
    const crData = await fetchJson(crUrl);
    categorizePhotos(crData.results || [], categories, seen);
  } catch (err) {
    log.verbose(`Costa Rica gallery search failed: ${err.message}`);
  }

  // If not enough diversity, expand globally
  const totalPhotos = Object.values(categories).reduce(
    (sum, arr) => sum + arr.length,
    0
  );
  if (totalPhotos < limit) {
    const globalUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&quality_grade=research&order_by=votes&per_page=${searchLimit}`;

    try {
      const globalData = await fetchJson(globalUrl);
      categorizePhotos(globalData.results || [], categories, seen);
    } catch (err) {
      log.verbose(`Global gallery search failed: ${err.message}`);
    }
  }

  // Select best photos from each category for diversity
  const selected = selectDiversePhotos(categories, limit);

  return selected;
}

// Categorize photos by likely content based on observation fields and tags
function categorizePhotos(observations, categories, seen) {
  for (const obs of observations) {
    if (!obs.photos) continue;

    for (const photo of obs.photos) {
      if (!photo?.id || !photo?.url || seen.has(photo.id)) continue;

      seen.add(photo.id);

      // Convert to large URL
      let url = photo.url
        .replace("/square.", "/medium.")
        .replace("/small.", "/medium.");

      const photoData = {
        id: photo.id,
        url,
        attribution: photo.attribution || "iNaturalist user",
        observationId: obs.id,
        votes: obs.faves_count || 0,
        place: obs.place_guess || "",
        dimensions: photo.original_dimensions,
        description: obs.description || "",
      };

      // Try to categorize based on photo position and description
      const desc = (obs.description || "").toLowerCase();
      const isFirst = obs.photos.indexOf(photo) === 0;

      if (
        desc.includes("leaf") ||
        desc.includes("foliage") ||
        desc.includes("hoja")
      ) {
        categories.leaves.push(photoData);
      } else if (
        desc.includes("bark") ||
        desc.includes("trunk") ||
        desc.includes("corteza")
      ) {
        categories.bark.push(photoData);
      } else if (
        desc.includes("flower") ||
        desc.includes("bloom") ||
        desc.includes("flor")
      ) {
        categories.flowers.push(photoData);
      } else if (
        desc.includes("fruit") ||
        desc.includes("seed") ||
        desc.includes("fruto")
      ) {
        categories.fruit.push(photoData);
      } else if (
        desc.includes("habitat") ||
        desc.includes("forest") ||
        desc.includes("bosque")
      ) {
        categories.habitat.push(photoData);
      } else if (isFirst) {
        // First photo typically shows whole tree
        categories.whole_tree.push(photoData);
      } else {
        // Subsequent photos often show details
        categories.leaves.push(photoData);
      }
    }
  }
}

// Select diverse, high-quality photos across categories
function selectDiversePhotos(categories, limit) {
  const selected = [];
  const order = ["whole_tree", "leaves", "flowers", "fruit", "bark", "habitat"];

  // Sort each category by votes
  for (const key of order) {
    categories[key].sort((a, b) => b.votes - a.votes);
  }

  // Round-robin selection for diversity
  let round = 0;
  while (selected.length < limit) {
    let addedThisRound = false;

    for (const category of order) {
      if (selected.length >= limit) break;

      const arr = categories[category];
      if (arr.length > round) {
        selected.push({
          ...arr[round],
          category,
        });
        addedThisRound = true;
      }
    }

    if (!addedThisRound) break;
    round++;
  }

  return selected;
}

// Update gallery images in MDX content
async function updateMdxGallery(filePath, treeName, newImages, scientificName) {
  try {
    const content = await fs.readFile(filePath, "utf8");

    // Check if gallery section exists
    const hasGallery = content.includes("<ImageGallery>");

    if (!hasGallery) {
      log.verbose(`No gallery section found in ${treeName}`);
      return { updated: false, reason: "no_gallery_section" };
    }

    // Generate new ImageCard components
    const imageCards = newImages
      .map((img, idx) => {
        const title = img.category
          ? `${img.category.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())}`
          : `${scientificName} Photo ${idx + 1}`;

        return `  <ImageCard
    src="${img.url}"
    alt="${scientificName} - ${title}"
    title="${title}"
    credit="${img.attribution}"
    license="CC BY-NC"
    sourceUrl="https://www.inaturalist.org/observations/${img.observationId}"
  />`;
      })
      .join("\n");

    // Replace existing gallery content
    const newGalleryContent = `<ImageGallery>\n${imageCards}\n</ImageGallery>`;

    const updatedContent = content.replace(
      /<ImageGallery>[\s\S]*?<\/ImageGallery>/,
      newGalleryContent
    );

    await fs.writeFile(filePath, updatedContent, "utf8");
    return { updated: true, imagesCount: newImages.length };
  } catch (err) {
    return { updated: false, reason: err.message };
  }
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

  // Get photos from iNaturalist (primary source)
  await sleep(300); // Rate limiting
  let photos = await getTopPhotos(taxon.id);
  let photoSource = "iNaturalist";

  // FALLBACK: Try GBIF if no iNaturalist photos
  if (photos.length === 0) {
    log.verbose(`No iNaturalist photos, trying GBIF...`);
    await sleep(200);
    photos = await getGBIFPhotos(searchName);
    if (photos.length > 0) {
      photoSource = "GBIF";
    }
  }

  // FALLBACK: Try Wikimedia Commons if still no photos
  if (photos.length === 0) {
    log.verbose(`No GBIF photos, trying Wikimedia Commons...`);
    await sleep(200);
    photos = await getWikimediaPhotos(searchName);
    if (photos.length > 0) {
      photoSource = "Wikimedia";
    }
  }

  if (photos.length === 0) {
    return {
      success: false,
      reason: "No photos found in any source (iNaturalist, GBIF, Wikimedia)",
    };
  }

  if (!download) {
    return {
      success: true,
      taxon,
      photosAvailable: photos.length,
      topPhoto: photos[0],
      source: photoSource,
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
        source: photoSource,
      };
    }

    try {
      log.verbose(
        `Trying photo ${i + 1} from ${photoSource}: ${photo.url.substring(0, 60)}...`
      );

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
        source: photoSource,
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

    const { scientificName } = mdx.frontmatter;
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

    const { scientificName } = mdx.frontmatter;
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

// Audit gallery images across all tree pages
async function auditGalleryImages() {
  log.info("🖼️  Auditing photo gallery images...\n");

  const files = (await fs.readdir(TREES_EN_DIR)).filter((f) =>
    f.endsWith(".mdx")
  );

  const results = {
    valid: [],
    broken: [],
    lowQuality: [],
    lowDiversity: [],
    noGallery: [],
    checked: 0,
  };

  for (const file of files) {
    const treeName = file.replace(".mdx", "");

    if (specificTree && treeName !== specificTree) continue;

    const filePath = path.join(TREES_EN_DIR, file);
    const mdxData = await readMdxFrontmatter(filePath);

    if (!mdxData) continue;

    const content = await fs.readFile(filePath, "utf8");
    const galleryImages = extractGalleryImages(content);

    if (galleryImages.length === 0) {
      results.noGallery.push({ treeName });
      log.tree(treeName, "📭", "no gallery section");
      continue;
    }

    results.checked++;
    let treeValid = true;
    let brokenCount = 0;
    let lowQualityCount = 0;

    for (const img of galleryImages) {
      const validation = await validateGalleryImage(img.src);

      if (!validation.isAccessible) {
        brokenCount++;
        treeValid = false;
      } else if (!validation.isHighQuality) {
        lowQualityCount++;
      }

      await sleep(100); // Rate limiting
    }

    const diversityCheck = evaluateGalleryDiversity(galleryImages);

    if (brokenCount > 0) {
      results.broken.push({
        treeName,
        count: brokenCount,
        total: galleryImages.length,
      });
      log.tree(treeName, "❌", `${brokenCount}/${galleryImages.length} broken`);
    } else if (lowQualityCount > 0) {
      results.lowQuality.push({
        treeName,
        count: lowQualityCount,
        total: galleryImages.length,
      });
      log.tree(
        treeName,
        "⚠️ ",
        `${lowQualityCount}/${galleryImages.length} low quality`
      );
    } else if (!diversityCheck.isDiverse) {
      results.lowDiversity.push({
        treeName,
        categories: Array.from(diversityCheck.categories),
      });
      log.tree(
        treeName,
        "⚠️ ",
        `limited diversity (${diversityCheck.categories.size} categories)`
      );
    } else {
      results.valid.push({ treeName, count: galleryImages.length });
      log.tree(treeName, "✅", `${galleryImages.length} images OK`);
    }
  }

  // Summary
  log.info("\n" + "=".repeat(50));
  log.info("📊 GALLERY AUDIT SUMMARY");
  log.info("=".repeat(50));
  log.info(`✅ Valid galleries: ${results.valid.length}`);
  log.info(`⚠️  Low quality: ${results.lowQuality.length}`);
  log.info(`⚠️  Low diversity: ${results.lowDiversity.length}`);
  log.info(`❌ Broken images: ${results.broken.length}`);
  log.info(`📭 No gallery: ${results.noGallery.length}`);

  const issues =
    results.broken.length +
    results.lowQuality.length +
    results.lowDiversity.length;

  if (issues > 0) {
    log.info(
      `\n💡 Run 'npm run images:refresh-gallery' to fix ${issues} galleries`
    );
    process.exit(1);
  }

  return results;
}

// Refresh gallery images with better quality photos
async function refreshGalleryImages() {
  log.info("🔄 Refreshing photo gallery images...\n");

  if (dryRun) {
    log.info("🔍 DRY RUN MODE - No files will be modified\n");
  }

  const files = (await fs.readdir(TREES_EN_DIR)).filter((f) =>
    f.endsWith(".mdx")
  );

  const results = {
    updated: [],
    skipped: [],
    failed: [],
  };

  const attributions = await loadAttributions();

  for (const file of files) {
    const treeName = file.replace(".mdx", "");

    if (specificTree && treeName !== specificTree) continue;

    const enPath = path.join(TREES_EN_DIR, file);
    const mdxData = await readMdxFrontmatter(enPath);

    if (!mdxData) continue;

    const { scientificName } = mdxData.frontmatter;
    if (!scientificName) {
      results.failed.push({ name: treeName, reason: "No scientificName" });
      continue;
    }

    const content = await fs.readFile(enPath, "utf8");
    const existingGallery = extractGalleryImages(content);

    if (existingGallery.length === 0 && !forceRefresh) {
      results.skipped.push({ name: treeName, reason: "No gallery section" });
      log.tree(treeName, "⏭️ ", "no gallery section");
      continue;
    }

    // Check if gallery needs refresh
    const diversityCheck = evaluateGalleryDiversity(existingGallery);
    let needsRefresh = forceRefresh || !diversityCheck.isDiverse;

    if (!needsRefresh) {
      for (const img of existingGallery) {
        const validation = await validateGalleryImage(img.src);
        if (!validation.isValid) {
          needsRefresh = true;
          break;
        }
      }
    }

    if (!needsRefresh) {
      results.skipped.push({ name: treeName, reason: "Gallery is valid" });
      log.tree(treeName, "⏭️ ", "gallery already valid");
      continue;
    }

    log.tree(treeName, "📗", `refreshing gallery (${scientificName})`);

    // Fix scientific name if needed
    const searchName = SCIENTIFIC_NAME_FIXES[treeName] || scientificName;

    // Search for taxon
    const taxon = await searchTaxon(searchName);

    if (!taxon) {
      results.failed.push({ name: treeName, reason: "Taxon not found" });
      log.tree(treeName, "   ❌", "taxon not found on iNaturalist");
      continue;
    }

    await sleep(300); // Rate limiting

    // Get diverse gallery photos
    const newPhotos = await getGalleryPhotos(taxon.id, 5);

    if (newPhotos.length === 0) {
      results.failed.push({
        name: treeName,
        reason: "No quality photos found",
      });
      log.tree(treeName, "   ❌", "no quality photos found");
      continue;
    }

    if (dryRun) {
      results.updated.push({
        name: treeName,
        dryRun: true,
        photoCount: newPhotos.length,
      });
      log.tree(
        treeName,
        "   🔍",
        `[DRY RUN] would update with ${newPhotos.length} photos`
      );
      continue;
    }

    // Update gallery in MDX
    const updateResult = await updateMdxGallery(
      enPath,
      treeName,
      newPhotos,
      scientificName
    );

    // Also update Spanish version if exists
    const esPath = path.join(TREES_ES_DIR, file);
    if (
      await fs
        .stat(esPath)
        .then(() => true)
        .catch(() => false)
    ) {
      await updateMdxGallery(esPath, treeName, newPhotos, scientificName);
    }

    if (updateResult.updated) {
      // Update attributions for gallery
      if (!attributions[treeName]) {
        attributions[treeName] = {};
      }
      attributions[treeName].gallery = {
        photos: newPhotos.map((p) => ({
          id: p.id,
          attribution: p.attribution,
          observationId: p.observationId,
          category: p.category,
        })),
        updatedAt: new Date().toISOString(),
      };

      results.updated.push({ name: treeName, photoCount: newPhotos.length });
      log.tree(
        treeName,
        "   ✅",
        `updated with ${newPhotos.length} high-quality photos`
      );
    } else {
      results.failed.push({ name: treeName, reason: updateResult.reason });
      log.tree(treeName, "   ❌", updateResult.reason);
    }

    await sleep(500); // Rate limiting
  }

  // Save updated attributions
  if (!dryRun && results.updated.length > 0) {
    await saveAttributions(attributions);
  }

  // Summary
  log.info("\n" + "=".repeat(50));
  log.info("📊 GALLERY REFRESH SUMMARY");
  log.info("=".repeat(50));
  log.info(`✅ Updated: ${results.updated.length}`);
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
    case "audit-gallery":
      await auditGalleryImages();
      break;
    case "download":
      await downloadImages();
      break;
    case "refresh":
      await refreshImages();
      break;
    case "refresh-gallery":
      await refreshGalleryImages();
      break;
    default:
      log.error(`Unknown command: ${command}`);
      log.info("\nUsage:");
      log.info(
        "  node scripts/manage-tree-images.mjs audit              # Check featured images"
      );
      log.info(
        "  node scripts/manage-tree-images.mjs audit-gallery      # Check gallery images"
      );
      log.info(
        "  node scripts/manage-tree-images.mjs download [--force] [--dry-run]"
      );
      log.info(
        "  node scripts/manage-tree-images.mjs refresh            # Check for better featured images"
      );
      log.info(
        "  node scripts/manage-tree-images.mjs refresh-gallery    # Update gallery images"
      );
      log.info("  node scripts/manage-tree-images.mjs --tree=<name> <command>");
      process.exit(1);
  }
}

main().catch((err) => {
  log.error(err.message);
  process.exit(1);
});
