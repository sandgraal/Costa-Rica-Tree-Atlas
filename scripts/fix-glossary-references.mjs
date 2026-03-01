#!/usr/bin/env node

/**
 * Copyright (c) 2024-present sandgraal
 * SPDX-License-Identifier: LicenseRef-Proprietary
 *
 * Fix glossary exampleSpecies and relatedTerms references.
 *
 * Problems:
 * 1. exampleSpecies uses common names instead of tree slugs
 * 2. relatedTerms references non-existent glossary slugs
 *
 * Usage:
 *   node scripts/fix-glossary-references.mjs           # Apply fixes
 *   node scripts/fix-glossary-references.mjs --dry-run  # Preview only
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const GLOSSARY_DIR = join(process.cwd(), "content", "glossary");
const TREES_DIR = join(process.cwd(), "content", "trees");

// Build valid sets
const validTreeSlugs = new Set(
  readdirSync(join(TREES_DIR, "en"))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""))
);

const validGlossarySlugs = new Set(
  readdirSync(join(GLOSSARY_DIR, "en"))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(".mdx", ""))
);

/**
 * Map common names / incorrect slugs → valid tree slugs.
 * null = remove (not a tree in our atlas)
 */
const EXAMPLE_SPECIES_MAP = {
  // Direct slug corrections (close matches)
  acacia: "acacia-mangium",
  cecropia: "guarumo", // Cecropia = guarumo
  cedar: "cedro-amargo",
  cedro: "cedro-amargo",
  cocoa: "cacao",
  ficus: "higueron",
  guayacan: "guayacan-real",
  "higuer on": "higueron",
  higuerón: "higueron",
  kapok: "ceiba",
  mahogany: "caoba",
  mangrove: "mangle-rojo",
  naranja: null, // not in atlas (citrus)
  oak: "roble-encino",
  oleander: "yellow-oleander",
  "palma-real": "palmera-real",
  "roble-de-altura": "roble-encino",
  "roble-sabana": "roble-de-sabana",
  rosewood: "cocobolo",
  sterculia: "panama",
  teak: "teca",
  // Not trees in our atlas — remove
  almond: null,
  "all-trees": null,
  bamboo: "bambu-gigante",
  beans: null,
  "black-walnut": null,
  cacti: null,
  carrot: null,
  casuarina: null,
  "cloud-forest-trees": null,
  coffee: null,
  corn: null,
  dandelion: null,
  "dry-forest-trees": null,
  eucalyptus: "eucalipto",
  "fig-trees": "higueron",
  "forest-ecosystem": null,
  "fruit trees": null,
  ginkgo: null,
  grasses: null,
  holly: null,
  "many dry forest trees": null,
  "many-species": null,
  maple: null,
  "most flowering plants": null,
  palms: "palmera-real",
  pine: "pino-caribeno",
  rainforest: null,
  "some-oaks": "roble-encino",
  succulents: null,
  "tree-ferns": null,
  "tropical-forest": null,
  vetiver: null,
  walnut: null,
  willow: null,
  // Accented names that appear in EN files
  poró: "poro",
  guachipelín: "guachipelin",
};

// Also map ES-specific common names to slugs
const ES_EXAMPLE_SPECIES_MAP = {
  ...EXAMPLE_SPECIES_MAP,
  // Spanish common names that appear in ES glossary files
  acacia: "acacia-mangium",
  "roble sabana": "roble-de-sabana",
  "cedro amargo": "cedro-amargo",
  palmas: "palmera-real",
  pinos: "pino-caribeno",
  manglar: "mangle-rojo",
  "manglar rojo": "mangle-rojo",
  poró: "poro",
  guachipelín: "guachipelin",
  pastos: null,
  maíz: null,
  bambú: "bambu-gigante",
  frijoles: null,
  roble: "roble-encino",
  pino: "pino-caribeno",
  arce: null,
  citricos: null,
  "bosque-tropical": null,
  "bosque-lluvioso": null,
  jinocuabe: "indio-desnudo",
  "almendro-de-montana": "almendro",
  "mayoría de plantas con flores": null,
  "árboles frutales": null,
  zanahoria: null,
  cactus: null,
  suculentas: null,
  "muchos árboles de bosque seco": null,
};

let stats = {
  exampleSpeciesFixed: 0,
  exampleSpeciesRemoved: 0,
  relatedTermsFixed: 0,
  relatedTermsRemoved: 0,
  filesModified: 0,
};

const details = [];

function processFile(filePath, locale) {
  const content = readFileSync(filePath, "utf-8");

  // Split frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return;

  let frontmatter = fmMatch[1];
  const body = content.slice(fmMatch[0].length);
  let fileChanged = false;
  const shortPath = filePath.replace(process.cwd() + "/", "");
  const map = locale === "es" ? ES_EXAMPLE_SPECIES_MAP : EXAMPLE_SPECIES_MAP;

  // Fix exampleSpecies
  const esMatch = frontmatter.match(/exampleSpecies:\s*\[([^\]]*)\]/);
  if (esMatch) {
    const rawItems = esMatch[1];
    // Parse items, handling quoted strings
    const items = rawItems
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s.length > 0);

    const newItems = [];
    let changed = false;

    for (const item of items) {
      if (validTreeSlugs.has(item)) {
        // Already a valid slug
        newItems.push(item);
      } else if (item in map) {
        const mapped = map[item];
        if (mapped === null) {
          // Remove — not a tree in our atlas
          changed = true;
          stats.exampleSpeciesRemoved++;
          details.push({
            type: "exampleSpecies",
            action: "removed",
            file: shortPath,
            from: item,
            reason: "not in atlas",
          });
        } else {
          newItems.push(mapped);
          changed = true;
          stats.exampleSpeciesFixed++;
          details.push({
            type: "exampleSpecies",
            action: "mapped",
            file: shortPath,
            from: item,
            to: mapped,
          });
        }
      } else {
        // Unknown — keep as-is (might be a valid reference we don't know about)
        // But log it for review
        newItems.push(item);
        details.push({
          type: "exampleSpecies",
          action: "kept-unknown",
          file: shortPath,
          from: item,
        });
      }
    }

    if (changed) {
      // Deduplicate while preserving order
      const dedupedItems = [...new Set(newItems)];
      const newValue =
        dedupedItems.length > 0
          ? `exampleSpecies: [${dedupedItems.map((i) => `"${i}"`).join(", ")}]`
          : "";
      if (newValue) {
        frontmatter = frontmatter.replace(esMatch[0], newValue);
      } else {
        // Remove the entire line if no items left
        frontmatter = frontmatter.replace(
          new RegExp(`\\n?${escapeRegex(esMatch[0])}`),
          ""
        );
      }
      fileChanged = true;
    }
  }

  // Fix relatedTerms
  const rtMatch = frontmatter.match(/relatedTerms:\s*\[([^\]]*)\]/);
  if (rtMatch) {
    const rawItems = rtMatch[1];
    const items = rawItems
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter((s) => s.length > 0);

    const newItems = [];
    let changed = false;

    for (const item of items) {
      if (validGlossarySlugs.has(item)) {
        newItems.push(item);
      } else {
        // Not a valid glossary slug — remove it
        changed = true;
        stats.relatedTermsRemoved++;
        details.push({
          type: "relatedTerms",
          action: "removed",
          file: shortPath,
          from: item,
          reason: "not a valid glossary slug",
        });
      }
    }

    if (changed) {
      const newValue =
        newItems.length > 0
          ? `relatedTerms: [${newItems.map((i) => `"${i}"`).join(", ")}]`
          : "";
      if (newValue) {
        frontmatter = frontmatter.replace(rtMatch[0], newValue);
      } else {
        frontmatter = frontmatter.replace(
          new RegExp(`\\n?${escapeRegex(rtMatch[0])}`),
          ""
        );
      }
      fileChanged = true;
    }
  }

  if (fileChanged) {
    stats.filesModified++;
    const newContent = `---\n${frontmatter}\n---${body}`;
    if (!dryRun) {
      writeFileSync(filePath, newContent, "utf-8");
    }
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function processLocale(locale) {
  const dir = join(GLOSSARY_DIR, locale);
  const files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    processFile(join(dir, file), locale);
  }
}

console.log(
  `\n📖 Fixing glossary references${dryRun ? " (DRY RUN)" : ""}...\n`
);
console.log(`Valid tree slugs: ${validTreeSlugs.size}`);
console.log(`Valid glossary slugs: ${validGlossarySlugs.size}\n`);

processLocale("en");
processLocale("es");

// Print summary
console.log(`\n--- Summary ---`);
console.log(
  `exampleSpecies: ${stats.exampleSpeciesFixed} mapped to valid slugs, ${stats.exampleSpeciesRemoved} removed`
);
console.log(
  `relatedTerms: ${stats.relatedTermsRemoved} invalid references removed`
);
console.log(`Files modified: ${stats.filesModified}`);

// Print details grouped by type
const grouped = {};
for (const d of details) {
  const key = `${d.type}:${d.action}`;
  if (!grouped[key]) grouped[key] = [];
  grouped[key].push(d);
}

if (grouped["exampleSpecies:mapped"]?.length) {
  console.log(
    `\n📋 exampleSpecies mapped (${grouped["exampleSpecies:mapped"].length}):`
  );
  for (const d of grouped["exampleSpecies:mapped"]) {
    console.log(`  ${d.file}: "${d.from}" → "${d.to}"`);
  }
}

if (grouped["exampleSpecies:removed"]?.length) {
  console.log(
    `\n🗑️  exampleSpecies removed (${grouped["exampleSpecies:removed"].length}):`
  );
  for (const d of grouped["exampleSpecies:removed"]) {
    console.log(`  ${d.file}: "${d.from}" (${d.reason})`);
  }
}

if (grouped["relatedTerms:removed"]?.length) {
  console.log(
    `\n🗑️  relatedTerms removed (${grouped["relatedTerms:removed"].length}):`
  );
  for (const d of grouped["relatedTerms:removed"]) {
    console.log(`  ${d.file}: "${d.from}"`);
  }
}

if (grouped["exampleSpecies:kept-unknown"]?.length) {
  console.log(
    `\n⚠️  exampleSpecies kept (unknown — review manually) (${grouped["exampleSpecies:kept-unknown"].length}):`
  );
  const unique = [
    ...new Set(grouped["exampleSpecies:kept-unknown"].map((d) => d.from)),
  ];
  console.log(`  ${unique.join(", ")}`);
}

if (dryRun) {
  console.log(
    `\n⚠️  Dry run — no files modified. Run without --dry-run to apply.\n`
  );
} else {
  console.log(`\n✅ ${stats.filesModified} files updated successfully.\n`);
}
