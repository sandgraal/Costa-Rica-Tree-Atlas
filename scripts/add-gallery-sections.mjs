#!/usr/bin/env node

/**
 * Add Gallery Sections to Trees
 *
 * This script adds photo gallery sections to tree MDX files that don't have them,
 * then fetches photos from iNaturalist.
 *
 * Usage:
 *   node scripts/add-gallery-sections.mjs                  # Process all trees without galleries
 *   node scripts/add-gallery-sections.mjs --tree=ajo       # Process specific tree
 *   node scripts/add-gallery-sections.mjs --dry-run        # Preview changes
 */

import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";

const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const TREES_ES_DIR = path.join(ROOT_DIR, "content/trees/es");
const COSTA_RICA_PLACE_ID = 6924;

// Parse arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const specificTree = args.find((a) => a.startsWith("--tree="))?.split("=")[1];

// Scientific name fixes
const SCIENTIFIC_NAME_FIXES = {
  matapalo: "Ficus aurea",
  pochote: "Ceiba aesculifolia",
  "roble-encino": "Quercus costaricensis",
  orey: "Campnosperma panamense",
};

// HTTP utilities
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent": "CostaRicaTreeAtlas/2.0 (Educational Project)",
          },
        },
        (res) => {
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
              reject(new Error("Invalid JSON"));
            }
          });
        }
      )
      .on("error", reject);
  });
}

async function searchTaxon(scientificName) {
  const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(scientificName)}&rank=species&is_active=true&per_page=5`;
  const data = await fetchJson(url);
  const results = data.results || [];
  if (results.length === 0) return null;
  const exactMatch = results.find(
    (t) => t.name.toLowerCase() === scientificName.toLowerCase()
  );
  return exactMatch || results[0];
}

async function getGalleryPhotos(taxonId, limit = 5) {
  const photos = [];
  const seen = new Set();

  // Costa Rica first
  const crUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&place_id=${COSTA_RICA_PLACE_ID}&photos=true&quality_grade=research&order_by=votes&per_page=${limit * 2}`;

  try {
    const crData = await fetchJson(crUrl);
    for (const obs of crData.results || []) {
      for (const photo of obs.photos || []) {
        if (!photo?.url || seen.has(photo.id)) continue;
        seen.add(photo.id);
        photos.push({
          id: photo.id,
          url: photo.url
            .replace("/square.", "/medium.")
            .replace("/small.", "/medium."),
          attribution: photo.attribution || "iNaturalist Community",
          observationId: obs.id,
          votes: obs.faves_count || 0,
        });
      }
    }
  } catch (err) {
    console.log(`   Costa Rica search failed: ${err.message}`);
  }

  // Global if needed
  if (photos.length < limit) {
    const globalUrl = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&quality_grade=research&order_by=votes&per_page=${limit * 2}`;
    try {
      const globalData = await fetchJson(globalUrl);
      for (const obs of globalData.results || []) {
        for (const photo of obs.photos || []) {
          if (!photo?.url || seen.has(photo.id)) continue;
          seen.add(photo.id);
          photos.push({
            id: photo.id,
            url: photo.url
              .replace("/square.", "/medium.")
              .replace("/small.", "/medium."),
            attribution: photo.attribution || "iNaturalist Community",
            observationId: obs.id,
            votes: obs.faves_count || 0,
          });
        }
      }
    } catch (err) {
      console.log(`   Global search failed: ${err.message}`);
    }
  }

  photos.sort((a, b) => b.votes - a.votes);
  return photos.slice(0, limit);
}

function generateGallerySection(photos, scientificName, taxonId) {
  if (photos.length === 0) return null;

  const imageCards = photos
    .map(
      (photo, idx) => `  <ImageCard
    src="${photo.url}"
    alt="${scientificName}"
    title="Photo ${idx + 1}"
    credit="${photo.attribution}"
    license="CC BY-NC"
    sourceUrl="https://www.inaturalist.org/observations/${photo.observationId}"
  />`
    )
    .join("\n");

  return `## 📸 Photo Gallery

<ImageGallery>
${imageCards}
</ImageGallery>

<Callout type="info">
  Photos sourced from iNaturalist's community science database. [Browse all
  observations →](https://www.inaturalist.org/taxa/${taxonId}-${scientificName.replace(/ /g, "-")}/browse_photos)
</Callout>

---

`;
}

async function readFrontmatter(filePath) {
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
}

async function addGallerySection(filePath, galleryContent) {
  const content = await fs.readFile(filePath, "utf8");

  // Find the Taxonomy section to insert before it
  const taxonomyMatch = content.match(/\n---\n\n## Taxonomy/);
  if (taxonomyMatch) {
    const insertPos = taxonomyMatch.index;
    const newContent =
      content.slice(0, insertPos) +
      "\n---\n\n" +
      galleryContent +
      content.slice(insertPos + 5);
    await fs.writeFile(filePath, newContent, "utf8");
    return true;
  }

  // Alternative: find any ## heading after the initial content
  const headingMatch = content.match(/\n---\n\n## (?!📸)/);
  if (headingMatch) {
    const insertPos = headingMatch.index;
    const newContent =
      content.slice(0, insertPos) +
      "\n---\n\n" +
      galleryContent +
      content.slice(insertPos + 5);
    await fs.writeFile(filePath, newContent, "utf8");
    return true;
  }

  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("🖼️  Adding gallery sections to trees...\n");

  if (dryRun) {
    console.log("🔍 DRY RUN MODE - No files will be modified\n");
  }

  const files = (await fs.readdir(TREES_EN_DIR)).filter((f) =>
    f.endsWith(".mdx")
  );

  const results = { added: [], skipped: [], failed: [] };

  for (const file of files) {
    const treeName = file.replace(".mdx", "");

    if (specificTree && treeName !== specificTree) continue;

    const enPath = path.join(TREES_EN_DIR, file);
    const mdxData = await readFrontmatter(enPath);

    if (!mdxData) continue;

    const content = await fs.readFile(enPath, "utf8");

    // Skip if already has gallery
    if (content.includes("<ImageGallery>")) {
      results.skipped.push({ name: treeName, reason: "Already has gallery" });
      continue;
    }

    const { scientificName } = mdxData.frontmatter;
    if (!scientificName) {
      results.failed.push({ name: treeName, reason: "No scientificName" });
      continue;
    }

    console.log(`📗 ${treeName}: adding gallery (${scientificName})`);

    // Get taxon
    const searchName = SCIENTIFIC_NAME_FIXES[treeName] || scientificName;
    const taxon = await searchTaxon(searchName);

    if (!taxon) {
      results.failed.push({ name: treeName, reason: "Taxon not found" });
      console.log(`   ❌ Taxon not found on iNaturalist`);
      continue;
    }

    await sleep(300);

    // Get photos
    const photos = await getGalleryPhotos(taxon.id, 5);

    if (photos.length === 0) {
      results.failed.push({ name: treeName, reason: "No photos found" });
      console.log(`   ❌ No photos found`);
      continue;
    }

    // Generate gallery content
    const galleryContent = generateGallerySection(photos, searchName, taxon.id);

    if (!galleryContent) {
      results.failed.push({
        name: treeName,
        reason: "Failed to generate gallery",
      });
      continue;
    }

    if (dryRun) {
      console.log(
        `   🔍 [DRY RUN] Would add gallery with ${photos.length} photos`
      );
      results.added.push({ name: treeName, photoCount: photos.length });
      continue;
    }

    // Add to English file
    const enResult = await addGallerySection(enPath, galleryContent);

    // Add to Spanish file if exists
    const esPath = path.join(TREES_ES_DIR, file);
    try {
      await fs.stat(esPath);
      await addGallerySection(esPath, galleryContent);
    } catch {
      // Spanish file doesn't exist
    }

    if (enResult) {
      console.log(`   ✅ Added gallery with ${photos.length} photos`);
      results.added.push({ name: treeName, photoCount: photos.length });
    } else {
      console.log(`   ❌ Failed to add gallery`);
      results.failed.push({
        name: treeName,
        reason: "Could not find insertion point",
      });
    }

    await sleep(500);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  console.log(`✅ Added: ${results.added.length}`);
  console.log(`⏭️  Skipped (already has gallery): ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log("\nFailed trees:");
    for (const item of results.failed) {
      console.log(`  - ${item.name}: ${item.reason}`);
    }
  }
}

main().catch(console.error);
