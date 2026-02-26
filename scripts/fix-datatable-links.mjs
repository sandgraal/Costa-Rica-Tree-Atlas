#!/usr/bin/env node

/**
 * Script: fix-datatable-links.mjs
 * Description: Fixes MDX build errors caused by markdown links injected before
 *              DataTable components in External Resources sections. Converts the
 *              injected markdown links into DataTable rows instead.
 * Usage: node scripts/fix-datatable-links.mjs [--dry-run]
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const AFFECTED_FILES = [
  "araza",
  "burio",
  "chirraca",
  "copal",
  "flor-de-itabo",
  "guacimo-molenillo",
  "guitite",
  "lengua-de-vaca",
  "palma-suita",
  "palma-yolillo",
  "papayillo",
  "peine-de-mico",
];

const LOCALES = ["en", "es"];

function removeInjectedMarkdownLinks(content) {
  // Remove lines like:
  //   - [GBIF Species Profile](https://www.gbif.org/...)
  //   - [IUCN Red List](https://www.iucnredlist.org/search?...)
  // that appear between "## External Resources"/"## Recursos Externos" and <DataTable
  let modified = false;

  // Pattern: after External Resources heading, remove any "- [...](...)" lines
  const pattern =
    /(## (?:External Resources|Recursos Externos)\s*?\n)\s*\n?(- \[(?:GBIF|IUCN)[^\n]*\n)+/g;
  const newContent = content.replace(pattern, (match, heading) => {
    modified = true;
    return heading + "\n";
  });

  return { content: newContent, modified };
}

function ensureGbifInDataTable(content, scientificName) {
  // Check if GBIF is already in the DataTable rows
  if (content.includes("gbif.org")) return content;

  // Find the DataTable after External Resources heading and add a GBIF row
  const extResMatch = content.match(
    /## (?:External Resources|Recursos Externos)[\s\S]*?<DataTable[\s\S]*?rows=\{?\[/
  );
  if (!extResMatch) return content;

  const insertPos = extResMatch.index + extResMatch[0].length;
  const gbifRow = `\n    ["GBIF", "Distribution Data", "https://www.gbif.org/species/search?q=${encodeURIComponent(scientificName)}"],`;

  return content.slice(0, insertPos) + gbifRow + content.slice(insertPos);
}

function ensureIucnInDataTable(content, scientificName) {
  if (content.includes("iucnredlist.org")) return content;

  const extResMatch = content.match(
    /## (?:External Resources|Recursos Externos)[\s\S]*?<DataTable[\s\S]*?rows=\{?\[/
  );
  if (!extResMatch) return content;

  const insertPos = extResMatch.index + extResMatch[0].length;
  const iucnRow = `\n    ["IUCN Red List", "Conservation", "https://www.iucnredlist.org/search?query=${encodeURIComponent(scientificName)}"],`;

  return content.slice(0, insertPos) + iucnRow + content.slice(insertPos);
}

function getScientificName(content) {
  const match = content.match(/scientificName:\s*"([^"]+)"/);
  return match ? match[1] : null;
}

async function main() {
  console.log("🔧 Fixing DataTable External Resources sections...\n");
  if (dryRun) console.log("🔍 DRY RUN MODE\n");

  let fixed = 0;

  for (const tree of AFFECTED_FILES) {
    for (const locale of LOCALES) {
      const filePath = path.join(
        ROOT_DIR,
        `content/trees/${locale}/${tree}.mdx`
      );

      try {
        let content = await fs.readFile(filePath, "utf8");
        const scientificName = getScientificName(content);
        let changed = false;

        // Step 1: Remove injected markdown links
        const { content: cleaned, modified } =
          removeInjectedMarkdownLinks(content);
        if (modified) {
          content = cleaned;
          changed = true;
        }

        // Step 2: Ensure GBIF and IUCN are in the DataTable
        if (scientificName) {
          const withGbif = ensureGbifInDataTable(content, scientificName);
          if (withGbif !== content) {
            content = withGbif;
            changed = true;
          }

          const withIucn = ensureIucnInDataTable(content, scientificName);
          if (withIucn !== content) {
            content = withIucn;
            changed = true;
          }
        }

        if (changed) {
          if (!dryRun) {
            await fs.writeFile(filePath, content, "utf8");
          }
          console.log(
            `  ${dryRun ? "🔍" : "✅"} ${locale}/${tree}: ${dryRun ? "would fix" : "fixed"}`
          );
          if (locale === "en") fixed++;
        }
      } catch {
        // File doesn't exist in this locale
      }
    }
  }

  console.log(`\n📊 Fixed: ${fixed} trees (both locales)`);
}

main().catch(console.error);
