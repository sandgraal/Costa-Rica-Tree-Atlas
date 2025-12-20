#!/usr/bin/env node

/**
 * Download and process tree images from iNaturalist
 *
 * This script:
 * 1. Reads all tree MDX files to find those with placeholder images
 * 2. Searches iNaturalist for research-grade photos
 * 3. Downloads the best available images
 * 4. Resizes/optimizes for web (1200px width)
 * 5. Saves to public/images/trees/
 * 6. Updates the MDX frontmatter to use local paths
 *
 * Usage: node scripts/download-tree-images.mjs [--dry-run] [--tree=name]
 */

import fs from "fs";
import path from "path";
import https from "https";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const TREES_DIR = path.join(ROOT_DIR, "content/trees/en");
const IMAGES_DIR = path.join(ROOT_DIR, "public/images/trees");
const IMAGE_WIDTH = 1200;
const COSTA_RICA_PLACE_ID = 6924;

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const specificTree = args.find((a) => a.startsWith("--tree="))?.split("=")[1];
const forceAll = args.includes("--force");

// Trees that need images (placeholder URL: 12345678)
const PLACEHOLDER_URL = "12345678";

// Mapping for special cases where scientific name differs or needs adjustment
const SCIENTIFIC_NAME_FIXES = {
  matapalo: "Ficus aurea", // Use specific Ficus species common in Costa Rica
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "CostaRicaTreeAtlas/1.0 (Educational Project)",
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse JSON from ${url}`));
            }
          });
        }
      )
      .on("error", reject);
  });
}

async function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    // Handle different URL patterns
    const urlObj = new URL(url);

    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "CostaRicaTreeAtlas/1.0 (Educational Project)",
          },
        },
        (res) => {
          // Handle redirects
          if (res.statusCode === 301 || res.statusCode === 302) {
            downloadImage(res.headers.location, destPath)
              .then(resolve)
              .catch(reject);
            return;
          }

          if (res.statusCode !== 200) {
            reject(new Error(`Failed to download: ${res.statusCode}`));
            return;
          }

          const fileStream = fs.createWriteStream(destPath);
          res.pipe(fileStream);
          fileStream.on("finish", () => {
            fileStream.close();
            resolve(destPath);
          });
          fileStream.on("error", reject);
        }
      )
      .on("error", reject);
  });
}

async function searchTaxon(scientificName) {
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&rank=species&is_active=true&per_page=5`;
  const data = await fetchJson(url);

  if (!data.results || data.results.length === 0) {
    return null;
  }

  // Find the best match (exact scientific name match preferred)
  const exactMatch = data.results.find(
    (t) => t.name.toLowerCase() === scientificName.toLowerCase()
  );

  return exactMatch || data.results[0];
}

async function getTopPhotos(taxonId, limit = 10) {
  // Get research-grade observations with photos from Costa Rica first
  const crUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&place_id=${COSTA_RICA_PLACE_ID}&photos=true&quality_grade=research&order_by=votes&per_page=${limit}`;
  let data = await fetchJson(crUrl);

  let observations = data.results || [];

  // If not enough from Costa Rica, expand search
  if (observations.length < 3) {
    const globalUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&quality_grade=research&order_by=votes&per_page=${limit}`;
    data = await fetchJson(globalUrl);
    observations = [...observations, ...(data.results || [])];
  }

  // Extract photos with metadata
  const photos = [];
  for (const obs of observations) {
    if (obs.photos && obs.photos.length > 0) {
      for (const photo of obs.photos) {
        // Get the original/large size URL
        let url = photo.url || "";
        // Convert from square to original/large
        url = url
          .replace("/square.", "/original.")
          .replace("/small.", "/original.")
          .replace("/medium.", "/large.");

        photos.push({
          url,
          attribution: photo.attribution || "iNaturalist user",
          observationId: obs.id,
          quality: obs.quality_grade,
          votes: obs.faves_count || 0,
          place: obs.place_guess || "Unknown location",
        });
      }
    }
  }

  // Sort by votes/favorites
  photos.sort((a, b) => b.votes - a.votes);

  return photos.slice(0, limit);
}

async function processImage(inputPath, outputPath, targetWidth = IMAGE_WIDTH) {
  // Use sips (macOS built-in) to resize
  try {
    // Get current dimensions
    const result = execSync(
      `sips -g pixelWidth -g pixelHeight "${inputPath}"`,
      { encoding: "utf8" }
    );
    const widthMatch = result.match(/pixelWidth:\s*(\d+)/);
    const heightMatch = result.match(/pixelHeight:\s*(\d+)/);

    if (!widthMatch || !heightMatch) {
      throw new Error("Could not read image dimensions");
    }

    const currentWidth = parseInt(widthMatch[1]);
    const currentHeight = parseInt(heightMatch[1]);

    // Only resize if larger than target
    if (currentWidth > targetWidth) {
      const newHeight = Math.round(
        (targetWidth / currentWidth) * currentHeight
      );
      execSync(
        `sips -z ${newHeight} ${targetWidth} "${inputPath}" --out "${outputPath}"`,
        { encoding: "utf8" }
      );
    } else {
      // Just copy if already smaller
      fs.copyFileSync(inputPath, outputPath);
    }

    // Optimize quality/size with sips
    execSync(
      `sips -s format jpeg -s formatOptions 85 "${outputPath}" --out "${outputPath}"`,
      { encoding: "utf8" }
    );

    return true;
  } catch (error) {
    console.error(`  Error processing image: ${error.message}`);
    return false;
  }
}

function readFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove quotes
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      frontmatter[key] = value;
    }
  }

  return { frontmatter, fullContent: content };
}

function updateFrontmatter(filePath, newImagePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const updated = content.replace(
    /featuredImage:\s*["']?[^"'\n]+["']?/,
    `featuredImage: "${newImagePath}"`
  );
  fs.writeFileSync(filePath, updated, "utf8");
}

async function processTree(treeName, scientificName) {
  console.log(`\n📗 Processing: ${treeName} (${scientificName})`);

  // Fix scientific name if needed
  const searchName = SCIENTIFIC_NAME_FIXES[treeName] || scientificName;
  if (searchName !== scientificName) {
    console.log(`  Using adjusted name: ${searchName}`);
  }

  // Search for taxon
  console.log(`  Searching iNaturalist...`);
  const taxon = await searchTaxon(searchName);

  if (!taxon) {
    console.log(`  ❌ Taxon not found on iNaturalist`);
    return { success: false, reason: "Taxon not found" };
  }

  console.log(`  Found taxon: ${taxon.name} (ID: ${taxon.id})`);

  // Get top photos
  await sleep(500); // Rate limiting
  const photos = await getTopPhotos(taxon.id);

  if (photos.length === 0) {
    console.log(`  ❌ No research-grade photos found`);
    return { success: false, reason: "No photos found" };
  }

  console.log(`  Found ${photos.length} candidate photos`);

  // Try to download the best photo
  for (let i = 0; i < Math.min(3, photos.length); i++) {
    const photo = photos[i];
    console.log(`  Trying photo ${i + 1}: ${photo.url.substring(0, 80)}...`);

    const tempPath = path.join(IMAGES_DIR, `${treeName}-temp.jpg`);
    const finalPath = path.join(IMAGES_DIR, `${treeName}.jpg`);

    if (dryRun) {
      console.log(`  [DRY RUN] Would download and save to: ${finalPath}`);
      return {
        success: true,
        dryRun: true,
        photo: {
          url: photo.url,
          attribution: photo.attribution,
          source: `https://www.inaturalist.org/observations/${photo.observationId}`,
        },
      };
    }

    try {
      // Download
      await downloadImage(photo.url, tempPath);
      console.log(`  Downloaded successfully`);

      // Check if it's a valid image
      const stats = fs.statSync(tempPath);
      if (stats.size < 10000) {
        console.log(`  Image too small (${stats.size} bytes), trying next...`);
        fs.unlinkSync(tempPath);
        continue;
      }

      // Process and resize
      const processed = await processImage(tempPath, finalPath);

      if (processed && fs.existsSync(finalPath)) {
        // Clean up temp file
        if (fs.existsSync(tempPath) && tempPath !== finalPath) {
          fs.unlinkSync(tempPath);
        }

        const finalStats = fs.statSync(finalPath);
        console.log(
          `  ✅ Saved: ${finalPath} (${Math.round(finalStats.size / 1024)}KB)`
        );

        return {
          success: true,
          path: `/images/trees/${treeName}.jpg`,
          photo: {
            url: photo.url,
            attribution: photo.attribution,
            source: `https://www.inaturalist.org/observations/${photo.observationId}`,
          },
        };
      }
    } catch (error) {
      console.log(`  Download failed: ${error.message}`);
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  return { success: false, reason: "All download attempts failed" };
}

async function main() {
  console.log("🌳 Costa Rica Tree Atlas - Image Downloader");
  console.log("=".repeat(50));

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No files will be modified\n");
  }

  // Ensure images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // Read all tree files
  const treeFiles = fs.readdirSync(TREES_DIR).filter((f) => f.endsWith(".mdx"));

  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  for (const file of treeFiles) {
    const treeName = file.replace(".mdx", "");

    // Skip if specific tree requested and this isn't it
    if (specificTree && treeName !== specificTree) {
      continue;
    }

    const filePath = path.join(TREES_DIR, file);
    const { frontmatter } = readFrontmatter(filePath);

    if (!frontmatter) {
      console.log(`\n⚠️  Could not read frontmatter: ${file}`);
      results.failed.push({ name: treeName, reason: "Invalid frontmatter" });
      continue;
    }

    const currentImage = frontmatter.featuredImage || "";
    const scientificName = frontmatter.scientificName || "";

    // Check if it's a placeholder or external URL
    const isPlaceholder = currentImage.includes(PLACEHOLDER_URL);
    const isExternal = currentImage.startsWith("http");
    const isLocal = currentImage.startsWith("/images/");

    // Check if local file exists
    const localPath = path.join(ROOT_DIR, "public", currentImage);
    const localExists = isLocal && fs.existsSync(localPath);

    // Skip if already has a good local image (unless forcing)
    if (localExists && !forceAll) {
      console.log(`\n⏭️  Skipping ${treeName} - already has local image`);
      results.skipped.push({ name: treeName, reason: "Has local image" });
      continue;
    }

    // Skip if has real external image and not placeholder (unless forcing)
    if (isExternal && !isPlaceholder && !forceAll) {
      console.log(`\n⏭️  Skipping ${treeName} - has external image`);
      results.skipped.push({
        name: treeName,
        reason: "Has external image",
        url: currentImage,
      });
      continue;
    }

    // Process this tree
    const result = await processTree(treeName, scientificName);

    if (result.success && !dryRun) {
      // Update MDX file with new local path
      const enFilePath = path.join(TREES_DIR, file);
      const esFilePath = path.join(ROOT_DIR, "content/trees/es", file);

      updateFrontmatter(enFilePath, result.path);
      if (fs.existsSync(esFilePath)) {
        updateFrontmatter(esFilePath, result.path);
      }

      results.success.push({
        name: treeName,
        path: result.path,
        attribution: result.photo?.attribution,
        source: result.photo?.source,
      });
    } else if (result.success && dryRun) {
      results.success.push({
        name: treeName,
        dryRun: true,
        attribution: result.photo?.attribution,
        source: result.photo?.source,
      });
    } else {
      results.failed.push({
        name: treeName,
        reason: result.reason,
      });
    }

    // Rate limiting
    await sleep(1000);
  }

  // Print summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));

  if (results.success.length > 0) {
    console.log(`\n✅ Successfully processed (${results.success.length}):`);
    for (const item of results.success) {
      console.log(`   - ${item.name}${item.dryRun ? " [DRY RUN]" : ""}`);
      if (item.attribution) {
        console.log(`     Attribution: ${item.attribution}`);
      }
    }
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Failed (${results.failed.length}):`);
    for (const item of results.failed) {
      console.log(`   - ${item.name}: ${item.reason}`);
    }
  }

  if (results.skipped.length > 0) {
    console.log(`\n⏭️  Skipped (${results.skipped.length}):`);
    for (const item of results.skipped) {
      console.log(`   - ${item.name}: ${item.reason}`);
    }
  }

  // Save attribution log
  if (!dryRun && results.success.length > 0) {
    const logPath = path.join(IMAGES_DIR, "attributions.json");
    let attributions = {};

    if (fs.existsSync(logPath)) {
      attributions = JSON.parse(fs.readFileSync(logPath, "utf8"));
    }

    for (const item of results.success) {
      if (!item.dryRun) {
        attributions[item.name] = {
          attribution: item.attribution,
          source: item.source,
          downloadedAt: new Date().toISOString(),
        };
      }
    }

    fs.writeFileSync(logPath, JSON.stringify(attributions, null, 2));
    console.log(`\n📝 Attribution log saved to: ${logPath}`);
  }
}

main().catch(console.error);
