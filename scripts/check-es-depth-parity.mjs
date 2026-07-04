#!/usr/bin/env node

/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * ES depth-parity CI gate for the Costa Rica Tree Atlas.
 *
 * Deliberately narrow: checks ONE thing (does every ES tree page have at
 * least --min-ratio% of its EN counterpart's line count?) and is meant to
 * be safe to run as a hard PR gate. This is NOT a replacement for
 * `content:audit`, which checks a broader set of quality signals (short
 * pages under 600 lines, missing sections, gallery counts) and already
 * fails today because of 6 known stub trees tracked separately under
 * Master Plan lane L6 — that script stays manual-only until those stubs
 * are resolved. This script exists so ES-depth backsliding on NEW or
 * EDITED species can be caught automatically without also gating PRs on
 * pre-existing, already-tracked short-page debt.
 *
 * Usage:
 *   node scripts/check-es-depth-parity.mjs                  # all trees, 80% floor
 *   node scripts/check-es-depth-parity.mjs --min-ratio=80    # explicit floor
 *   node scripts/check-es-depth-parity.mjs --tree=cocobolo   # single tree
 *   node scripts/check-es-depth-parity.mjs --json            # machine-readable
 *   node scripts/check-es-depth-parity.mjs --verbose         # show all ratios, not just failures
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const TREES_ES_DIR = path.join(ROOT_DIR, "content/trees/es");

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const verbose = args.includes("--verbose") || args.includes("-v");
const treeArg = args.find((arg) => arg.startsWith("--tree="));
const singleTree = treeArg ? treeArg.split("=")[1] : null;
const minRatioArg = args.find((arg) => arg.startsWith("--min-ratio="));
const MIN_RATIO = minRatioArg ? Number(minRatioArg.split("=")[1]) : 80;

const HELP_TEXT = `\
ES Depth-Parity Gate\n\
\n\
Fails (exit 1) if any tree's ES line count is below --min-ratio% of its\n\
EN line count. Narrow by design — see file header for why this exists\n\
separately from content:audit.\n\
\n\
Options:\n\
  --min-ratio=<n>   Minimum ES/EN line ratio, as a percentage (default: 80)\n\
  --tree=<slug>     Check only one tree slug\n\
  --json            Output JSON only\n\
  --verbose, -v     Show every tree's ratio, not just failures\n\
  --help            Show this help\n`;

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP_TEXT);
  process.exit(0);
}

async function countLines(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  return content.split("\n").length;
}

async function main() {
  const enFiles = (await fs.readdir(TREES_EN_DIR)).filter((f) =>
    f.endsWith(".mdx")
  );
  const slugs = singleTree
    ? [`${singleTree}.mdx`]
    : enFiles.sort();

  const results = [];
  const failures = [];

  for (const file of slugs) {
    const slug = file.replace(".mdx", "");
    const enPath = path.join(TREES_EN_DIR, file);
    const esPath = path.join(TREES_ES_DIR, file);

    let enLines, esLines;
    try {
      enLines = await countLines(enPath);
    } catch {
      if (singleTree) {
        console.error(`No EN file found for tree "${singleTree}"`);
        process.exit(2);
      }
      continue;
    }
    try {
      esLines = await countLines(esPath);
    } catch {
      // Missing ES file is content-validation.test.ts's job to catch, not
      // this script's — skip rather than double-report.
      continue;
    }

    const ratio = (esLines / enLines) * 100;
    const entry = { slug, enLines, esLines, ratio: Math.round(ratio * 10) / 10 };
    results.push(entry);
    if (ratio < MIN_RATIO) failures.push(entry);
  }

  if (jsonOutput) {
    console.log(
      JSON.stringify({ minRatio: MIN_RATIO, results, failures }, null, 2)
    );
  } else {
    console.log(`🔍 ES depth-parity check (floor: ${MIN_RATIO}%)`);
    console.log(`Trees checked: ${results.length}`);
    if (verbose) {
      for (const r of results) {
        console.log(`  ${r.slug}: EN ${r.enLines} | ES ${r.esLines} | ${r.ratio}%`);
      }
    }
    if (failures.length > 0) {
      console.log(`\n❌ ${failures.length} tree(s) below the ${MIN_RATIO}% floor:`);
      for (const f of failures) {
        console.log(`  ${f.slug}: EN ${f.enLines} | ES ${f.esLines} | ${f.ratio}%`);
      }
    } else {
      console.log(`\n✅ All checked trees meet the ${MIN_RATIO}% ES/EN depth floor.`);
    }
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("❌ ES depth-parity check failed:", error?.stack || error);
  process.exit(2);
});
