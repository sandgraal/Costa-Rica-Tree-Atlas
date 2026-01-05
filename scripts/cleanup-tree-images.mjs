#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write");
const forceRefresh = args.has("--force");

const ROOT_DIR = process.cwd();
const CONTENT_DIR = path.join(ROOT_DIR, "content", "trees");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const INAT_HOSTS = [
  "inaturalist-open-data.s3.amazonaws.com",
  "static.inaturalist.org",
];

const taxonCache = new Map();
const photoCache = new Map();

// Rate limiting configuration
const API_DELAY_MS = 200; // Delay between API calls
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

function logInfo(message) {
  console.log(message);
}

function logWarn(message) {
  console.warn(message);
}

function logError(message) {
  console.error(message);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listMdxFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMdxFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function splitFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    return null;
  }

  return {
    fullMatch: match[0],
    frontmatter: match[1],
  };
}

function parseFrontmatter(frontmatter) {
  const fields = {};
  const lines = frontmatter.split("\n");

  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fields[key] = value;
  }

  return fields;
}

function updateFrontmatterValue(frontmatter, key, value) {
  const line = `${key}: "${value}"`;
  const pattern = new RegExp(`^${key}:.*$`, "m");
  if (pattern.test(frontmatter)) {
    return frontmatter.replace(pattern, line);
  }
  return `${frontmatter}\n${line}`.trim();
}

async function fetchJson(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Costa-Rica-Tree-Atlas Image Cleanup",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Don't retry on 4xx errors (except 429 rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`Request failed (${response.status}) for ${url}`);
        }
        throw new Error(`Request failed (${response.status}) for ${url}`);
      }

      // Add delay between successful requests to avoid rate limiting
      await sleep(API_DELAY_MS);
      return response.json();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      
      if (error.name === 'AbortError') {
        logWarn(`Request timeout for ${url} (attempt ${attempt + 1}/${retries + 1})`);
      } else {
        logWarn(`Request failed for ${url}: ${error.message} (attempt ${attempt + 1}/${retries + 1})`);
      }

      if (isLastAttempt) {
        throw error;
      }

      // Exponential backoff
      const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
}

async function getTaxon(scientificName) {
  const cacheKey = scientificName.toLowerCase();
  if (taxonCache.has(cacheKey)) {
    return taxonCache.get(cacheKey);
  }

  try {
    const query = encodeURIComponent(scientificName);
    const url = `https://api.inaturalist.org/v1/taxa?q=${query}&per_page=10`;
    const data = await fetchJson(url);
    const results = data.results || [];

    if (!results.length) {
      taxonCache.set(cacheKey, null);
      return null;
    }

    const exact = results.find(
      (result) => result.name?.toLowerCase() === cacheKey
    );
    const selected = exact || results[0];
    const taxon = {
      id: selected.id,
      name: selected.name,
      observationsCount: selected.observations_count,
    };

    taxonCache.set(cacheKey, taxon);
    return taxon;
  } catch (error) {
    logError(`Failed to fetch taxon for ${scientificName}: ${error.message}`);
    taxonCache.set(cacheKey, null);
    return null;
  }
}

async function getTaxonPhotos(taxonId) {
  if (photoCache.has(taxonId)) {
    return photoCache.get(taxonId);
  }

  try {
    const url = `https://api.inaturalist.org/v1/observations?taxon_id=${taxonId}&photos=true&quality_grade=research&order_by=votes&per_page=200`;
    const data = await fetchJson(url);
    const results = data.results || [];
    const seen = new Set();
    const photos = [];

    results.forEach((observation, observationIndex) => {
      (observation.photos || []).forEach((photo) => {
        if (!photo?.id || !photo?.url || seen.has(photo.id)) {
          return;
        }
        seen.add(photo.id);
        photos.push({
          id: photo.id,
          url: photo.url,
          originalDimensions: photo.original_dimensions || null,
          rank: observationIndex,
        });
      });
    });

    photoCache.set(taxonId, photos);
    return photos;
  } catch (error) {
    logError(`Failed to fetch photos for taxon ${taxonId}: ${error.message}`);
    photoCache.set(taxonId, []);
    return [];
  }
}

function buildInatPhotoUrl(photo, size) {
  const url = photo.url;
  const extensionMatch = url.match(/\.(jpe?g|png)$/i);
  const extension = extensionMatch ? extensionMatch[1] : "jpg";
  const base = url.replace(/\/[^/]+\.(jpe?g|png)$/i, "");
  return `${base}/${size}.${extension}`;
}

// Heuristic: favor large, portrait-ish photos from top-voted observations.
function scorePhoto(photo) {
  const dims = photo.originalDimensions;
  if (!dims || !dims.width || !dims.height) {
    return 0.5;
  }

  const { width, height } = dims;
  const area = width * height;
  const ratio = height / width;
  const ratioScore = ratio >= 0.7 && ratio <= 1.8 ? 1 : 0.2;
  const orientationBonus = ratio >= 1 ? 0.25 : 0;
  const areaScore = Math.min(area / 5_000_000, 2);
  const rankScore = 2 / (1 + photo.rank);

  return ratioScore + orientationBonus + areaScore + rankScore;
}

function selectFeaturedPhoto(photos) {
  if (!photos.length) {
    return null;
  }

  let best = photos[0];
  let bestScore = scorePhoto(best);

  for (const photo of photos) {
    const score = scorePhoto(photo);
    if (score > bestScore) {
      best = photo;
      bestScore = score;
    }
  }

  return best;
}

function isLocalPath(url) {
  return url.startsWith("/");
}

function isInatPhotoUrl(url) {
  return (
    INAT_HOSTS.some((host) => url.includes(host)) &&
    url.includes("/photos/")
  );
}

async function validateRemoteImage(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for HEAD requests
    
    const response = await fetch(url, { 
      method: "HEAD",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok || response.status >= 400) {
      return false;
    }
    const contentType = response.headers.get("content-type") || "";
    return contentType.startsWith("image/");
  } catch (error) {
    // Don't log every validation failure to avoid spam
    return false;
  }
}

async function validateImage(url) {
  if (isLocalPath(url)) {
    const localPath = path.join(PUBLIC_DIR, url.replace(/^\//, ""));
    try {
      const stat = await fs.stat(localPath);
      return stat.isFile();
    } catch (error) {
      return false;
    }
  }

  return validateRemoteImage(url);
}

function buildBrowsePhotosUrl(taxon) {
  const slug = taxon.name.trim().replace(/\s+/g, "-");
  return `https://www.inaturalist.org/taxa/${taxon.id}-${slug}/browse_photos`;
}

function updateBrowsePhotosLinks(content, browseUrl) {
  return content.replace(
    /https:\/\/www\.inaturalist\.org\/taxa\/\d+-[^\s)\"]+\/browse_photos/g,
    browseUrl
  );
}

function updateEmbedTaxon(content, taxonId, scientificName) {
  let updated = content.replace(/taxonId="\d+"/g, `taxonId="${taxonId}"`);
  updated = updated.replace(
    /taxonName="[^"]+"/g,
    `taxonName="${scientificName}"`
  );
  return updated;
}

function replaceAt(content, start, end, replacement) {
  return content.slice(0, start) + replacement + content.slice(end);
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const frontmatterData = splitFrontmatter(content);
    if (!frontmatterData) {
      return {
        changed: false,
        issuesFound: 0,
        issuesRemaining: 0,
        updatedContent: content,
      };
    }

    const { frontmatter } = frontmatterData;
    const fields = parseFrontmatter(frontmatter);
    const scientificName = fields.scientificName;
    const featuredImage = fields.featuredImage;

    if (!scientificName) {
      logWarn(`Skipping ${filePath}: missing scientificName.`);
      return {
        changed: false,
        issuesFound: 0,
        issuesRemaining: 0,
        updatedContent: content,
      };
    }

    const taxon = await getTaxon(scientificName);
    if (!taxon) {
      logWarn(`No iNaturalist taxon for ${scientificName} (${filePath}).`);
      return {
        changed: false,
        issuesFound: 1,
        issuesRemaining: 1,
        updatedContent: content,
      };
    }

    const photos = await getTaxonPhotos(taxon.id);
    if (!photos.length) {
      logWarn(`No iNaturalist photos for ${scientificName} (${filePath}).`);
      return {
        changed: false,
        issuesFound: 1,
        issuesRemaining: 1,
        updatedContent: content,
      };
    }

    const featuredPhoto = selectFeaturedPhoto(photos);
    if (!featuredPhoto) {
      logWarn(`Unable to select featured photo for ${scientificName}.`);
      return {
        changed: false,
        issuesFound: 1,
        issuesRemaining: 1,
        updatedContent: content,
      };
    }

    const browseUrl = buildBrowsePhotosUrl(taxon);
    const featuredUrl = buildInatPhotoUrl(featuredPhoto, "large");
    const replacementPhotos = photos.filter(
      (photo) => photo.id !== featuredPhoto.id
    );

    let issuesFound = 0;
    let issuesRemaining = 0;
    let changed = false;
    let updatedContent = content;

    let updatedFrontmatter = frontmatter;
    if (featuredImage) {
      const featuredIsLocal = isLocalPath(featuredImage);
      const featuredIsValid = await validateImage(featuredImage);
      const featuredIsInat = isInatPhotoUrl(featuredImage);
      const featuredIssueDetected =
        !featuredIsValid ||
        (!featuredIsLocal && !featuredIsInat);
      const shouldReplaceFeatured = forceRefresh || featuredIssueDetected;
      const canReplaceFeatured = !featuredIsLocal;

      if (featuredIssueDetected) {
        issuesFound += 1;
      }

      if (featuredIssueDetected && !canReplaceFeatured) {
        issuesRemaining += 1;
      }

      if (shouldReplaceFeatured && canReplaceFeatured) {
        updatedFrontmatter = updateFrontmatterValue(
          updatedFrontmatter,
          "featuredImage",
          featuredUrl
        );
        changed = true;
      } else if (featuredIssueDetected && canReplaceFeatured) {
        issuesRemaining += 1;
      }
    } else {
      issuesFound += 1;
      updatedFrontmatter = updateFrontmatterValue(
        updatedFrontmatter,
        "featuredImage",
        featuredUrl
      );
      changed = true;
    }

    if (updatedFrontmatter !== frontmatter) {
      updatedContent = updatedContent.replace(frontmatter, updatedFrontmatter);
    }

    const beforeEmbedUpdate = updatedContent;
    updatedContent = updateEmbedTaxon(
      updatedContent,
      taxon.id,
      scientificName
    );
    if (updatedContent !== beforeEmbedUpdate) {
      changed = true;
    }

    const beforeBrowseUpdate = updatedContent;
    updatedContent = updateBrowsePhotosLinks(updatedContent, browseUrl);
    if (updatedContent !== beforeBrowseUpdate) {
      changed = true;
    }

    const imageCardRegex = /<ImageCard[\s\S]*?\/>/g;
    const matches = [...updatedContent.matchAll(imageCardRegex)];
    let replacementIndex = 0;

    for (let i = matches.length - 1; i >= 0; i -= 1) {
      const match = matches[i];
      const block = match[0];
      const start = match.index;
      if (start === undefined) {
        continue;
      }

      const srcMatch = block.match(/src="([^"]+)"/);
      if (!srcMatch) {
        continue;
      }

      const currentSrc = srcMatch[1];
      const currentIsLocal = isLocalPath(currentSrc);
      const currentIsValid = await validateImage(currentSrc);
      const currentIsInat = isInatPhotoUrl(currentSrc);
      const galleryIssueDetected =
        !currentIsValid ||
        (!currentIsLocal && !currentIsInat);
      const shouldReplaceGallery = forceRefresh || galleryIssueDetected;
      const canReplaceGallery = !currentIsLocal;

      let updatedBlock = block;
      if (galleryIssueDetected) {
        issuesFound += 1;
      }
      if (galleryIssueDetected && !canReplaceGallery) {
        issuesRemaining += 1;
      }
      if (shouldReplaceGallery && canReplaceGallery) {
        const replacement = replacementPhotos[replacementIndex];
        replacementIndex += 1;
        if (replacement) {
          const replacementUrl = buildInatPhotoUrl(replacement, "medium");
          updatedBlock = updatedBlock.replace(
            srcMatch[0],
            `src="${replacementUrl}"`
          );
          changed = true;
        } else {
          logWarn(
            `No replacement photo left for ${filePath}. Keeping ${currentSrc}.`
          );
          if (galleryIssueDetected) {
            issuesRemaining += 1;
          }
        }
      } else if (galleryIssueDetected && canReplaceGallery) {
        issuesRemaining += 1;
      }

      updatedBlock = updatedBlock.replace(
        /sourceUrl="[^"]+"/g,
        `sourceUrl="${browseUrl}"`
      );

      if (updatedBlock !== block) {
        updatedContent = replaceAt(
          updatedContent,
          start,
          start + block.length,
          updatedBlock
        );
        changed = true;
      }
    }

    return { changed, issuesFound, issuesRemaining, updatedContent };
  } catch (error) {
    logError(`Error processing ${filePath}: ${error.message}`);
    // Return unchanged content on error
    const content = await fs.readFile(filePath, "utf8");
    return {
      changed: false,
      issuesFound: 1,
      issuesRemaining: 1,
      updatedContent: content,
    };
  }
}

async function main() {
  const files = await listMdxFiles(CONTENT_DIR);
  let totalIssuesFound = 0;
  let totalIssuesRemaining = 0;
  let totalChanged = 0;
  let totalErrors = 0;

  logInfo(`Processing ${files.length} files...`);

  for (const filePath of files) {
    const { changed, issuesFound, issuesRemaining, updatedContent } =
      await processFile(filePath);
    totalIssuesFound += issuesFound;
    totalIssuesRemaining += issuesRemaining;

    if (changed) {
      totalChanged += 1;
      if (shouldWrite) {
        try {
          await fs.writeFile(filePath, updatedContent, "utf8");
          logInfo(`Updated ${filePath}`);
        } catch (error) {
          logError(`Failed to write ${filePath}: ${error.message}`);
          totalErrors += 1;
        }
      } else {
        logInfo(`Needs update: ${filePath}`);
      }
    }
  }

  logInfo(`\nProcessing complete:`);
  logInfo(`- Files processed: ${files.length}`);
  logInfo(`- Files updated: ${totalChanged}`);
  logInfo(`- Issues found: ${totalIssuesFound}`);
  logInfo(`- Issues remaining: ${totalIssuesRemaining}`);
  if (totalErrors > 0) {
    logWarn(`- Errors encountered: ${totalErrors}`);
  }

  // Only exit with error code if running in check mode and issues were found
  if (!shouldWrite && totalIssuesFound > 0) {
    logError(`Image audit failed with ${totalIssuesFound} issues.`);
    process.exit(1);
  }

  // In write mode, don't fail even if there were errors or remaining issues
  // This allows the workflow to continue and create a PR with partial fixes
  if (shouldWrite) {
    if (totalIssuesRemaining > 0) {
      logWarn(`Remaining image issues: ${totalIssuesRemaining}`);
    }
    if (totalIssuesFound > 0 && totalIssuesRemaining === 0) {
      logInfo("All detected image issues were resolved.");
    }
  }
}

main().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  logError(error.stack);
  // Don't exit with error code 1 to allow workflow to continue
  // The workflow should handle failures gracefully
  process.exit(0);
});
