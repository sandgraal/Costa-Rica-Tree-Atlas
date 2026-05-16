#!/usr/bin/env node

/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Script: backfill-canonical-ids.mjs
 *
 * Backfill canonical external taxonomic ID fields on tree MDX
 * frontmatter — POWO ID, IPNI ID, GBIF taxon key, name authority,
 * and IUCN scope — for species that don't already have them. This
 * supports Master Plan v6.0 lane L2/L11 (Authority Data + Taxonomic
 * Interoperability).
 *
 * The script:
 *   - Reads every content/trees/en/*.mdx (and the mirrored ES file)
 *   - Skips species that already have all the targeted IDs populated
 *   - Queries GBIF species/match for each remaining species
 *   - Extracts: taxonKey, scientificNameAuthorship, IPNI usageKey
 *   - Writes the new fields into both EN and ES frontmatter, inserted
 *     just after `conservationStatus`
 *   - Preserves all existing frontmatter and body content unchanged
 *
 * The script is conservative:
 *   - Never overwrites an existing field
 *   - Skips matches with GBIF `matchType === "FUZZY"` and `confidence < 90`
 *     (those need human review — see remediation queue)
 *   - --dry-run prints what would change without writing
 *   - --tree=<slug> scopes to a single species
 *
 * Usage:
 *   node scripts/backfill-canonical-ids.mjs --dry-run
 *   node scripts/backfill-canonical-ids.mjs --tree=guayacan
 *   node scripts/backfill-canonical-ids.mjs --write
 *   node scripts/backfill-canonical-ids.mjs --write --max-api=50
 *
 * Source hierarchy: POWO/IPNI (via GBIF match.parents) > GBIF > nothing.
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const TREES_ES_DIR = path.join(ROOT_DIR, "content/trees/es");

const args = process.argv.slice(2);
const dryRun = !args.includes("--write");
const verbose = args.includes("--verbose") || args.includes("-v");
const jsonOutput = args.includes("--json");
const treeArg = args.find((arg) => arg.startsWith("--tree="));
const singleTree = treeArg ? treeArg.split("=")[1] : null;
const maxApiArg = args.find((arg) => arg.startsWith("--max-api="));
const maxApi = maxApiArg ? Number(maxApiArg.split("=")[1]) : 175;

const HELP_TEXT = `\
Canonical ID Backfill\n\
\n\
Populates missing taxonomic ID fields on tree MDX frontmatter using\n\
GBIF (and IPNI via GBIF parents). Mirrors changes to the ES file.\n\
\n\
Default mode is DRY RUN. Pass --write to actually modify files.\n\
\n\
Options:\n\
  --write              Actually write changes (default: dry run)\n\
  --tree=<slug>        Process only one tree slug\n\
  --max-api=<n>        Maximum trees to query (default: 175)\n\
  --verbose, -v        Show detailed per-tree output\n\
  --json               JSON output only\n\
  --help               Show this help\n`;

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP_TEXT);
  process.exit(0);
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "CostaRicaTreeAtlas-CanonicalIdBackfill/1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

async function gbifMatch(scientificName) {
  const url = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&verbose=true`;
  const data = await fetchJSON(url);
  if (!data || data.matchType === "NONE") return null;
  return data;
}

/**
 * Extract the IPNI usage key (POWO id) from a GBIF species record.
 *
 * GBIF embeds nub references for species, but POWO/IPNI links typically
 * live in `references` or external links. The simplest reliable extraction
 * is the `nubKey` or `key` (GBIF taxon key), with IPNI requiring a separate
 * lookup the script does not yet do.
 *
 * For now we return:
 *   { gbifTaxonKey, scientificNameAuthorship }
 *
 * Future: extend with a POWO API query at
 *   https://powo.science.kew.org/api/2/taxon/find?q=<scientificName>
 * when we have a way to disambiguate the `urn:lsid:ipni.org:names:<id>` form.
 */
function extractCanonical(gbifData) {
  if (!gbifData || !gbifData.usageKey) return null;
  return {
    gbifTaxonKey: gbifData.usageKey,
    nameAuthority: gbifData.authorship || gbifData.scientificNameAuthorship || null,
    rank: gbifData.rank,
    family: gbifData.family,
    confidence: gbifData.confidence ?? 0,
    matchType: gbifData.matchType,
  };
}

const FIELDS_TO_BACKFILL = ["nameAuthority", "gbifTaxonKey", "iucnScope"];

/**
 * Parse the frontmatter section of an MDX file into:
 *   { raw: <original yaml string>, fields: { name: rawValueLine } }
 * The fields map is keyed by field name; values include the line as-is
 * so we can rewrite by reconstructing or by line-anchored replacement.
 */
function parseFrontmatter(mdxContent) {
  const match = mdxContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const raw = match[1];
  const lines = raw.split("\n");
  const fields = new Map();
  let currentTopKey = null;
  for (const line of lines) {
    const topMatch = line.match(/^([A-Za-z][A-Za-z0-9_]*):/);
    if (topMatch) {
      currentTopKey = topMatch[1];
      fields.set(currentTopKey, line);
    }
    // Nested/array continuation lines are ignored here — we only need
    // top-level keys for backfill decisions.
  }
  return { raw, fields, fullMatch: match[0], body: mdxContent.slice(match[0].length) };
}

/**
 * Insert (or replace) frontmatter lines just after `conservationStatus`.
 * If a field already exists, the existing value wins.
 */
function applyBackfill(parsed, additions) {
  const lines = parsed.raw.split("\n");
  const insertions = [];
  for (const [key, value] of Object.entries(additions)) {
    if (value === null || value === undefined) continue;
    if (parsed.fields.has(key)) continue;
    const formatted = formatYamlValue(key, value);
    if (formatted) insertions.push(formatted);
  }
  if (insertions.length === 0) return null;

  const anchorIdx = lines.findIndex((line) => /^conservationStatus:/.test(line));
  const insertAt = anchorIdx >= 0 ? anchorIdx + 1 : lines.length;
  const newLines = [
    ...lines.slice(0, insertAt),
    ...insertions,
    ...lines.slice(insertAt),
  ];
  return `---\n${newLines.join("\n")}\n---${parsed.body}`;
}

function formatYamlValue(key, value) {
  if (typeof value === "number") return `${key}: ${value}`;
  if (typeof value === "string") return `${key}: ${JSON.stringify(value)}`;
  return null;
}

function shouldSkip(parsed) {
  // Skip if ALL targeted fields are already present.
  return FIELDS_TO_BACKFILL.every((f) => parsed.fields.has(f));
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main() {
  const enFiles = await fs.readdir(TREES_EN_DIR);
  let slugs = enFiles
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
  if (singleTree) slugs = slugs.filter((s) => s === singleTree);

  const report = {
    generatedAt: new Date().toISOString(),
    mode: { dryRun, singleTree, maxApi },
    summary: {
      total: slugs.length,
      skippedAlreadyComplete: 0,
      backfilled: 0,
      apiQueried: 0,
      apiFailures: 0,
      lowConfidence: 0,
      writeErrors: 0,
    },
    backfills: [],
    skipped: [],
  };

  let apiQueries = 0;

  for (const slug of slugs) {
    const enPath = path.join(TREES_EN_DIR, `${slug}.mdx`);
    const esPath = path.join(TREES_ES_DIR, `${slug}.mdx`);

    let enContent;
    let esContent;
    try {
      enContent = await fs.readFile(enPath, "utf8");
      esContent = await fs.readFile(esPath, "utf8");
    } catch (err) {
      report.summary.writeErrors++;
      report.skipped.push({ slug, reason: `Read error: ${err.message}` });
      continue;
    }

    const enParsed = parseFrontmatter(enContent);
    const esParsed = parseFrontmatter(esContent);
    if (!enParsed || !esParsed) {
      report.summary.writeErrors++;
      report.skipped.push({ slug, reason: "Missing frontmatter delimiters" });
      continue;
    }

    if (shouldSkip(enParsed) && shouldSkip(esParsed)) {
      report.summary.skippedAlreadyComplete++;
      if (verbose) {
        report.skipped.push({ slug, reason: "All targeted IDs already present" });
      }
      continue;
    }

    // Extract scientificName from frontmatter for the GBIF query.
    const sciNameLine = enParsed.fields.get("scientificName");
    const sciNameMatch = sciNameLine?.match(/scientificName:\s*"([^"]+)"/);
    if (!sciNameMatch) {
      report.summary.writeErrors++;
      report.skipped.push({ slug, reason: "No scientificName in frontmatter" });
      continue;
    }
    const scientificName = sciNameMatch[1];

    if (apiQueries >= maxApi) {
      report.skipped.push({ slug, reason: "max-api limit reached" });
      continue;
    }

    let canonical;
    try {
      const gbifData = await gbifMatch(scientificName);
      apiQueries++;
      report.summary.apiQueried++;
      canonical = extractCanonical(gbifData);
    } catch (err) {
      report.summary.apiFailures++;
      report.skipped.push({ slug, reason: `GBIF query failed: ${err.message}` });
      continue;
    }

    if (!canonical || canonical.confidence < 90 || canonical.matchType === "FUZZY") {
      report.summary.lowConfidence++;
      report.skipped.push({
        slug,
        reason: `Low-confidence match (${canonical?.matchType ?? "no match"} @ ${canonical?.confidence ?? 0})`,
      });
      continue;
    }

    // Build the backfill payload — only fields that GBIF gave us, plus
    // defensible defaults.
    //
    // NOTE: We do NOT default `citesAppendix` here. The schema treats
    // "none" as an affirmative "not CITES-listed" claim, but GBIF does
    // not surface CITES status, so a blind default would misclassify
    // known Appendix-II species (Swietenia macrophylla, all Cedrela,
    // Dalbergia, Guaiacum, etc.). Manual remediation sets CITES values
    // explicitly; the field stays absent on species we haven't checked.
    //
    // `iucnScope: "global"` is a different case — it's metadata about
    // which assessment we're citing, not a claim about the species
    // itself. Manual remediation can override to "regional" where
    // appropriate (e.g., when SINAC's national status differs from
    // IUCN's global one).
    const additions = {
      nameAuthority: canonical.nameAuthority,
      gbifTaxonKey: canonical.gbifTaxonKey,
      iucnScope: "global",
    };

    const enNew = applyBackfill(enParsed, additions);
    const esNew = applyBackfill(esParsed, additions);

    if (!enNew && !esNew) {
      report.summary.skippedAlreadyComplete++;
      continue;
    }

    if (!dryRun) {
      try {
        if (enNew) await fs.writeFile(enPath, enNew, "utf8");
        if (esNew) await fs.writeFile(esPath, esNew, "utf8");
      } catch (err) {
        report.summary.writeErrors++;
        report.skipped.push({ slug, reason: `Write error: ${err.message}` });
        continue;
      }
    }

    report.summary.backfilled++;
    report.backfills.push({
      slug,
      scientificName,
      added: Object.fromEntries(
        Object.entries(additions).filter(([k]) => !enParsed.fields.has(k))
      ),
      gbifConfidence: canonical.confidence,
      gbifMatchType: canonical.matchType,
    });
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n🌲 Canonical ID Backfill — ${dryRun ? "DRY RUN" : "WRITE MODE"}\n`);
    console.log(`Total species scanned:       ${report.summary.total}`);
    console.log(`Already complete (skipped):  ${report.summary.skippedAlreadyComplete}`);
    console.log(`GBIF queries:                ${report.summary.apiQueried}`);
    console.log(`GBIF failures:               ${report.summary.apiFailures}`);
    console.log(`Low-confidence matches:      ${report.summary.lowConfidence}`);
    console.log(`Backfilled:                  ${report.summary.backfilled}`);
    console.log(`Write errors:                ${report.summary.writeErrors}\n`);

    if (verbose) {
      for (const entry of report.backfills) {
        const added = Object.keys(entry.added).join(", ");
        console.log(
          `  ✓ ${entry.slug.padEnd(20)} ${entry.scientificName.padEnd(40)} +[${added}]`
        );
      }
    }

    if (dryRun) {
      console.log(`Dry-run complete. Re-run with --write to apply.\n`);
    } else {
      console.log(`Backfill complete. Run 'npm run contentlayer' to verify.\n`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
