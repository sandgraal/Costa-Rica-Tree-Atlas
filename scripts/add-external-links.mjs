#!/usr/bin/env node

/**
 * Script: add-external-links.mjs
 * Description: Adds GBIF and IUCN Red List links to tree MDX files that lack them.
 *              Also fixes the broken url= prop → href= in ExternalLink components.
 * Usage:
 *   node scripts/add-external-links.mjs                  # Process all trees
 *   node scripts/add-external-links.mjs --tree=ajo       # Process specific tree
 *   node scripts/add-external-links.mjs --dry-run        # Preview changes
 *   node scripts/add-external-links.mjs --fix-urls-only  # Only fix url= → href=
 */

import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";

const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const TREES_ES_DIR = path.join(ROOT_DIR, "content/trees/es");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const fixUrlsOnly = args.includes("--fix-urls-only");
const specificTree = args.find((a) => a.startsWith("--tree="))?.split("=")[1];

// ─── HTTP Utilities ──────────────────────────────────────────────────────────

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
            } catch {
              reject(new Error("Invalid JSON"));
            }
          });
        }
      )
      .on("error", reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── GBIF Lookup ─────────────────────────────────────────────────────────────

async function getGbifSpeciesKey(scientificName) {
  const url = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&strict=false`;
  try {
    const data = await fetchJson(url);
    if (data.usageKey && data.matchType !== "NONE") {
      return {
        key: data.usageKey,
        url: `https://www.gbif.org/species/${data.usageKey}`,
        matchType: data.matchType,
        confidence: data.confidence,
      };
    }
  } catch {
    // silently skip API errors
  }
  return null;
}

// ─── Frontmatter Parser ─────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

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
  return frontmatter;
}

// ─── Fix url= → href= in ExternalLink ───────────────────────────────────────

function fixUrlProp(content) {
  // Match <ExternalLink ... url="..." ... /> and replace url= with href=
  // Only inside ExternalLink components
  let fixed = content;
  let count = 0;

  // Pattern: inside <ExternalLink ... /> blocks, replace url=" with href="
  fixed = fixed.replace(
    /(<ExternalLink\b[^>]*?)(\s+)url="([^"]*?)"/g,
    (match, before, space, urlValue) => {
      // Don't fix if href already exists in this tag
      if (before.includes("href=")) return match;
      count++;
      return `${before}${space}href="${urlValue}"`;
    }
  );

  return { content: fixed, fixCount: count };
}

// ─── Add GBIF/IUCN Links ────────────────────────────────────────────────────

function addLinksToExternalLinksGrid(content, gbifLink, iucnSearchLink) {
  const linksToAdd = [];

  if (gbifLink && !content.includes("gbif.org")) {
    linksToAdd.push(`  <ExternalLink
    href="${gbifLink}"
    title="GBIF Species Profile"
    description="Global biodiversity occurrence data and distribution maps"
    icon="🗺️"
  />`);
  }

  if (iucnSearchLink && !content.includes("iucnredlist.org")) {
    linksToAdd.push(`  <ExternalLink
    href="${iucnSearchLink}"
    title="IUCN Red List"
    description="Conservation status and species assessment"
    icon="🔴"
  />`);
  }

  if (linksToAdd.length === 0) return { content, added: [] };

  // Insert before </ExternalLinksGrid>
  const closingTag = "</ExternalLinksGrid>";
  const closingIdx = content.lastIndexOf(closingTag);
  if (closingIdx === -1) return { content, added: [] };

  const newContent =
    content.slice(0, closingIdx) +
    linksToAdd.join("\n") +
    "\n" +
    content.slice(closingIdx);

  const added = [];
  if (gbifLink && !content.includes("gbif.org")) added.push("GBIF");
  if (iucnSearchLink && !content.includes("iucnredlist.org"))
    added.push("IUCN");
  return { content: newContent, added };
}

function addLinksToMarkdownList(content, gbifLink, iucnSearchLink) {
  const linksToAdd = [];

  if (gbifLink && !content.includes("gbif.org")) {
    linksToAdd.push(`- [GBIF Species Profile](${gbifLink})`);
  }

  if (iucnSearchLink && !content.includes("iucnredlist.org")) {
    linksToAdd.push(`- [IUCN Red List](${iucnSearchLink})`);
  }

  if (linksToAdd.length === 0) return { content, added: [] };

  // Find the External Resources section and append to its list
  const sectionMatch = content.match(
    /## External Resources\s*\n((?:- \[.*?\]\(.*?\)\n?)*)/
  );
  if (!sectionMatch) return { content, added: [] };

  const sectionEnd = sectionMatch.index + sectionMatch[0].length;
  const newContent =
    content.slice(0, sectionEnd) +
    "\n" +
    linksToAdd.join("\n") +
    "\n" +
    content.slice(sectionEnd);

  const added = [];
  if (gbifLink && !content.includes("gbif.org")) added.push("GBIF");
  if (iucnSearchLink && !content.includes("iucnredlist.org"))
    added.push("IUCN");
  return { content: newContent, added };
}

function createExternalResourcesSection(
  gbifLink,
  iucnSearchLink,
  scientificName
) {
  const links = [];

  if (gbifLink) {
    links.push(`  <ExternalLink
    href="${gbifLink}"
    title="GBIF Species Profile"
    description="Global biodiversity occurrence data and distribution maps"
    icon="🗺️"
  />`);
  }

  if (iucnSearchLink) {
    links.push(`  <ExternalLink
    href="${iucnSearchLink}"
    title="IUCN Red List"
    description="Conservation status and species assessment"
    icon="🔴"
  />`);
  }

  // Always add iNaturalist search link
  const inatUrl = `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(scientificName)}`;
  links.push(`  <ExternalLink
    href="${inatUrl}"
    title="iNaturalist"
    description="Community observations and photos"
    icon="🌿"
  />`);

  return `

---

## External Resources

<ExternalLinksGrid>
${links.join("\n")}
</ExternalLinksGrid>`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔗  Adding GBIF/IUCN links and fixing ExternalLink props...\n");
  if (dryRun) console.log("🔍 DRY RUN MODE — No files will be modified\n");
  if (fixUrlsOnly)
    console.log("🔧 FIX-URLS-ONLY MODE — Only fixing url= → href=\n");

  const enFiles = (await fs.readdir(TREES_EN_DIR)).filter((f) =>
    f.endsWith(".mdx")
  );

  const results = {
    urlFixed: 0,
    urlFixedFiles: 0,
    gbifAdded: 0,
    iucnAdded: 0,
    sectionsCreated: 0,
    skipped: 0,
    failed: [],
  };

  for (const file of enFiles) {
    const treeName = file.replace(".mdx", "");
    if (specificTree && treeName !== specificTree) continue;

    const enPath = path.join(TREES_EN_DIR, file);
    const esPath = path.join(TREES_ES_DIR, file);

    let enContent = await fs.readFile(enPath, "utf8");
    const frontmatter = parseFrontmatter(enContent);
    const scientificName = frontmatter.scientificName;

    if (!scientificName) {
      results.failed.push({ name: treeName, reason: "No scientificName" });
      continue;
    }

    let enModified = false;

    // ── Step 1: Fix url= → href= ──────────────────────────────────────
    const { content: fixedContent, fixCount } = fixUrlProp(enContent);
    if (fixCount > 0) {
      enContent = fixedContent;
      enModified = true;
      results.urlFixed += fixCount;
      results.urlFixedFiles++;
      if (!dryRun) {
        console.log(`  🔧 ${treeName}: fixed ${fixCount} url= → href=`);
      } else {
        console.log(`  🔍 ${treeName}: would fix ${fixCount} url= → href=`);
      }
    }

    if (fixUrlsOnly) {
      // Write changes and skip link addition
      if (enModified && !dryRun) {
        await fs.writeFile(enPath, enContent, "utf8");
        // Do the same for Spanish
        try {
          let esContent = await fs.readFile(esPath, "utf8");
          const { content: esFixed, fixCount: esFixes } = fixUrlProp(esContent);
          if (esFixes > 0) {
            await fs.writeFile(esPath, esFixed, "utf8");
          }
        } catch {
          /* ES file may not exist */
        }
      }
      continue;
    }

    // ── Step 2: Determine what links are needed ──────────────────────
    const needsGbif = !enContent.includes("gbif.org");
    const needsIucn = !enContent.includes("iucnredlist.org");

    if (!needsGbif && !needsIucn) {
      // Only write if url= was fixed
      if (enModified && !dryRun) {
        await fs.writeFile(enPath, enContent, "utf8");
        try {
          let esContent = await fs.readFile(esPath, "utf8");
          const { content: esFixed } = fixUrlProp(esContent);
          await fs.writeFile(esPath, esFixed, "utf8");
        } catch {
          /* ES file may not exist */
        }
      }
      results.skipped++;
      continue;
    }

    // ── Step 3: Look up GBIF ────────────────────────────────────────
    let gbifLink = null;
    if (needsGbif) {
      const gbifData = await getGbifSpeciesKey(scientificName);
      if (gbifData && gbifData.confidence >= 80) {
        gbifLink = gbifData.url;
      } else {
        // Fallback: search URL
        gbifLink = `https://www.gbif.org/species/search?q=${encodeURIComponent(scientificName)}`;
      }
      await sleep(200);
    }

    // ── Step 4: IUCN search link ────────────────────────────────────
    // IUCN doesn't have a public free API, so we use a search URL
    let iucnSearchLink = null;
    if (needsIucn) {
      iucnSearchLink = `https://www.iucnredlist.org/search?query=${encodeURIComponent(scientificName)}`;
    }

    // ── Step 5: Insert links into content ───────────────────────────
    let added = [];

    if (enContent.includes("<ExternalLinksGrid>")) {
      // Has ExternalLinksGrid — add inside it
      const result = addLinksToExternalLinksGrid(
        enContent,
        gbifLink,
        iucnSearchLink
      );
      enContent = result.content;
      added = result.added;
    } else if (enContent.includes("## External Resources")) {
      // Has markdown list
      const result = addLinksToMarkdownList(
        enContent,
        gbifLink,
        iucnSearchLink
      );
      enContent = result.content;
      added = result.added;
    } else {
      // No External Resources section at all — create one
      const section = createExternalResourcesSection(
        gbifLink,
        iucnSearchLink,
        scientificName
      );
      // Insert before the last --- + ## References section, or at end of file
      const referencesMatch = enContent.match(/\n---\n\n## References/);
      if (referencesMatch) {
        const insertPos = referencesMatch.index;
        enContent =
          enContent.slice(0, insertPos) + section + enContent.slice(insertPos);
      } else {
        // Append at end
        enContent = enContent.trimEnd() + "\n" + section + "\n";
      }
      added = [];
      if (gbifLink) added.push("GBIF");
      if (iucnSearchLink) added.push("IUCN");
      results.sectionsCreated++;
    }

    if (added.length > 0) {
      enModified = true;
      if (added.includes("GBIF")) results.gbifAdded++;
      if (added.includes("IUCN")) results.iucnAdded++;

      if (dryRun) {
        console.log(
          `  🔍 ${treeName}: would add ${added.join(", ")} (${scientificName})`
        );
      } else {
        console.log(
          `  ✅ ${treeName}: added ${added.join(", ")} (${scientificName})`
        );
      }
    }

    // ── Step 6: Write files ─────────────────────────────────────────
    if (enModified && !dryRun) {
      await fs.writeFile(enPath, enContent, "utf8");

      // Apply same changes to Spanish file
      try {
        let esContent = await fs.readFile(esPath, "utf8");

        // Fix url= → href= in Spanish file too
        const { content: esFixed } = fixUrlProp(esContent);
        esContent = esFixed;

        // Add links to Spanish file too (same links, no translation needed for URLs)
        if (esContent.includes("<ExternalLinksGrid>")) {
          const result = addLinksToExternalLinksGrid(
            esContent,
            gbifLink,
            iucnSearchLink
          );
          esContent = result.content;
        } else if (
          esContent.includes("## External Resources") ||
          esContent.includes("## Recursos Externos")
        ) {
          const result = addLinksToMarkdownList(
            esContent,
            gbifLink,
            iucnSearchLink
          );
          esContent = result.content;
        } else {
          const section = createExternalResourcesSection(
            gbifLink,
            iucnSearchLink,
            scientificName
          );
          const referencesMatch = esContent.match(/\n---\n\n## Referenci/);
          if (referencesMatch) {
            const insertPos = referencesMatch.index;
            esContent =
              esContent.slice(0, insertPos) +
              section +
              esContent.slice(insertPos);
          } else {
            esContent = esContent.trimEnd() + "\n" + section + "\n";
          }
        }

        await fs.writeFile(esPath, esContent, "utf8");
      } catch {
        // Spanish file doesn't exist — skip
      }
    }
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("📊 SUMMARY");
  console.log("=".repeat(50));
  console.log(
    `🔧 url= → href= fixes: ${results.urlFixed} props across ${results.urlFixedFiles} files`
  );
  console.log(`🗺️  GBIF links added: ${results.gbifAdded}`);
  console.log(`🔴 IUCN links added: ${results.iucnAdded}`);
  console.log(
    `📄 New External Resources sections created: ${results.sectionsCreated}`
  );
  console.log(`⏭️  Skipped (already has both): ${results.skipped}`);
  if (results.failed.length > 0) {
    console.log(`\n❌ Failed (${results.failed.length}):`);
    for (const item of results.failed) {
      console.log(`  - ${item.name}: ${item.reason}`);
    }
  }
}

main().catch(console.error);
