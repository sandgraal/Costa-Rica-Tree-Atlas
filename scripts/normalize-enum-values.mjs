#!/usr/bin/env node

/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Normalize non-standard enum values in tree MDX frontmatter.
 *
 * Problem: Some content files (especially ES) use Spanish translations or
 * non-standard compound values for enum fields instead of the schema-defined
 * English enum values from contentlayer.config.ts.
 *
 * Usage:
 *   node scripts/normalize-enum-values.mjs           # Apply fixes
 *   node scripts/normalize-enum-values.mjs --dry-run  # Preview only
 *   node scripts/normalize-enum-values.mjs --tree=mangle-pinuela  # Single tree
 *   node scripts/normalize-enum-values.mjs --help     # Show this help
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "path";

const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log(`
Usage: node scripts/normalize-enum-values.mjs [options]

Options:
  --dry-run       Preview changes without modifying files
  --tree=<slug>   Process only a single tree (by slug)
  --help          Show this help message

Examples:
  node scripts/normalize-enum-values.mjs
  node scripts/normalize-enum-values.mjs --dry-run
  node scripts/normalize-enum-values.mjs --tree=mangle-pinuela
`);
  process.exit(0);
}

const dryRun = args.includes("--dry-run");
const treeArg = args.find((a) => a.startsWith("--tree="));
const targetTree = treeArg ? treeArg.split("=")[1] : null;

const CONTENT_DIR = join(process.cwd(), "content", "trees");

/**
 * Enum normalization mappings.
 * Key: field name
 * Value: Map of (non-standard value → correct schema value)
 *
 * Schema-defined enums from contentlayer.config.ts:
 * - waterNeeds: "low" | "moderate" | "high"
 * - lightRequirements: "full-sun" | "partial-shade" | "shade-tolerant"
 * - growthRate: "slow" | "moderate" | "fast"
 * - toxicityLevel: "none" | "low" | "moderate" | "high" | "severe"
 * - skinContactRisk: "none" | "low" | "moderate" | "high" | "severe"
 * - allergenRisk: "none" | "low" | "moderate" | "high"
 * - propagationDifficulty: "easy" | "moderate" | "difficult"
 */
const NORMALIZATIONS = {
  waterNeeds: {
    // Spanish translations
    "muy-alto": "high",
    moderado: "moderate",
    alto: "high",
    alta: "high",
    "moderada a alta": "high",
    "bajo-a-moderado": "moderate",
    // English compound values (not in schema)
    "very-high": "high",
    "moderate-to-high": "high",
    "moderate to high": "high",
    "low-to-moderate": "moderate",
  },
  lightRequirements: {
    // Spanish translations
    "pleno-sol": "full-sun",
    "sol-pleno": "full-sun",
    "sombra-parcial a pleno-sol": "partial-shade",
    "pleno-sol a sombra-parcial": "partial-shade",
    // Long descriptive ES
    "Pleno sol como emergente; tolerante a la sombra cuando joven":
      "partial-shade",
    // English compound values (not in schema)
    "full-sun-part-shade": "partial-shade",
    "full-shade": "shade-tolerant",
    "partial-shade to full-sun": "partial-shade",
    "partial-shade-to-full-sun": "partial-shade",
    "full-sun to partial-shade": "partial-shade",
    // Long descriptive EN
    "Full sun as emergent; shade tolerant when young": "partial-shade",
  },
  growthRate: {
    // Spanish translations
    lento: "slow",
    moderado: "moderate",
    "lento a moderado": "moderate",
    "moderado-a-rápido": "fast",
    // English compound values (not in schema)
    "very fast": "fast",
    "very-fast": "fast",
    "slow to moderate": "moderate",
    "moderate-to-fast": "fast",
  },
  toxicityLevel: {
    // Spanish translations
    baja: "low",
    moderada: "moderate",
    alta: "high",
    ninguna: "none",
    severa: "severe",
  },
  skinContactRisk: {
    // Spanish translations
    ninguno: "none",
    bajo: "low",
    moderado: "moderate",
    alto: "high",
    severo: "severe",
  },
  allergenRisk: {
    // Spanish translations
    ninguno: "none",
    bajo: "low",
    moderado: "moderate",
    alto: "high",
  },
  propagationDifficulty: {
    // Spanish translations
    fácil: "easy",
    "muy-dificil": "difficult",
    moderada: "moderate",
    // English compound values (not in schema)
    "very difficult": "difficult",
    "very-difficult": "difficult",
    "very easy": "easy",
    "very-easy": "easy",
    "moderate-to-difficult": "difficult",
    intermediate: "moderate",
  },
};

let totalFixed = 0;
let filesModified = 0;
const fixDetails = [];

async function processFile(filePath) {
  const content = await readFile(filePath, "utf-8");

  // Split into frontmatter and body
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return;

  let frontmatter = fmMatch[1];
  const body = content.slice(fmMatch[0].length);
  let fileChanged = false;

  for (const [field, mappings] of Object.entries(NORMALIZATIONS)) {
    // Match the field in frontmatter: fieldName: "value"
    const fieldRegex = new RegExp(`^(${field}:\\s*)"(.+?)"\\s*$`, "m");
    const match = frontmatter.match(fieldRegex);
    if (!match) continue;

    const currentValue = match[2];
    const normalizedValue = mappings[currentValue];

    if (normalizedValue && normalizedValue !== currentValue) {
      const oldLine = match[0];
      const newLine = `${match[1]}"${normalizedValue}"`;
      frontmatter = frontmatter.replace(oldLine, newLine);
      fileChanged = true;
      totalFixed++;

      const shortPath = filePath.replace(process.cwd() + "/", "");
      fixDetails.push({
        file: shortPath,
        field,
        from: currentValue,
        to: normalizedValue,
      });
    }
  }

  if (fileChanged) {
    filesModified++;
    const newContent = `---\n${frontmatter}\n---${body}`;
    if (!dryRun) {
      await writeFile(filePath, newContent, "utf-8");
    }
  }
}

async function processLocale(locale) {
  const dir = join(CONTENT_DIR, locale);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const slug = file.replace(".mdx", "");
    if (targetTree && slug !== targetTree) continue;
    await processFile(join(dir, file));
  }
}

async function main() {
  console.log(
    `\n🌳 Normalizing enum values in tree MDX frontmatter${dryRun ? " (DRY RUN)" : ""}...\n`
  );

  await processLocale("en");
  await processLocale("es");

  if (fixDetails.length === 0) {
    console.log("✅ All enum values already normalized. Nothing to fix.\n");
  } else {
    console.log(
      `Fixed ${totalFixed} enum values across ${filesModified} files:\n`
    );

    // Group by field
    const byField = {};
    for (const fix of fixDetails) {
      if (!byField[fix.field]) byField[fix.field] = [];
      byField[fix.field].push(fix);
    }

    for (const [field, fixes] of Object.entries(byField)) {
      console.log(`  📋 ${field} (${fixes.length} fixes):`);
      for (const fix of fixes) {
        console.log(`     ${fix.file}: "${fix.from}" → "${fix.to}"`);
      }
      console.log();
    }

    if (dryRun) {
      console.log(
        "  ⚠️  Dry run — no files were modified. Run without --dry-run to apply.\n"
      );
    } else {
      console.log(`  ✅ ${filesModified} files updated successfully.\n`);
    }
  }
}

main().catch(console.error);
