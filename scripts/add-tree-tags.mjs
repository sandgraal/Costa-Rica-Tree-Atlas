#!/usr/bin/env node

/**
 * Script to add tags to tree MDX files based on their content
 * This analyzes existing tree data and adds appropriate tags
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TREES_DIR = path.join(__dirname, "../content/trees");

// Tag assignment rules based on tree characteristics
const TAG_RULES = {
  // National tree
  guanacaste: [
    "native",
    "deciduous",
    "national",
    "nitrogen-fixing",
    "shade-tree",
    "wildlife-food",
    "dry-forest",
  ],

  // Deciduous dry forest trees
  "corteza-amarilla": [
    "native",
    "deciduous",
    "flowering",
    "timber",
    "dry-forest",
    "ornamental",
  ],
  "roble-de-sabana": [
    "native",
    "deciduous",
    "flowering",
    "timber",
    "dry-forest",
    "shade-tree",
  ],
  cenizaro: [
    "native",
    "deciduous",
    "shade-tree",
    "timber",
    "nitrogen-fixing",
    "wildlife-food",
  ],
  "cana-fistula": [
    "native",
    "deciduous",
    "flowering",
    "ornamental",
    "medicinal",
  ],
  tamarindo: [
    "native",
    "deciduous",
    "fruit-bearing",
    "edible",
    "shade-tree",
    "dry-forest",
  ],

  // Evergreen trees
  ceiba: [
    "native",
    "deciduous",
    "sacred",
    "buttressed",
    "wildlife-food",
    "rainforest",
  ],
  almendro: [
    "native",
    "evergreen",
    "timber",
    "wildlife-food",
    "rainforest",
    "endangered",
  ],
  guapinol: [
    "native",
    "evergreen",
    "timber",
    "edible",
    "medicinal",
    "rainforest",
  ],

  // Palms
  coyol: [
    "native",
    "evergreen",
    "spiny",
    "fruit-bearing",
    "edible",
    "wildlife-food",
  ],

  // Fruit trees
  mango: [
    "introduced",
    "evergreen",
    "fruit-bearing",
    "edible",
    "shade-tree",
    "naturalized",
  ],
  guayabo: ["native", "evergreen", "fruit-bearing", "edible", "wildlife-food"],
  nispero: ["introduced", "evergreen", "fruit-bearing", "edible", "ornamental"],
  zapote: ["native", "evergreen", "fruit-bearing", "edible", "timber"],
  caimito: ["native", "evergreen", "fruit-bearing", "edible", "ornamental"],
  jobo: [
    "native",
    "deciduous",
    "fruit-bearing",
    "edible",
    "wildlife-food",
    "pioneer",
  ],
  jocote: ["native", "deciduous", "fruit-bearing", "edible", "dry-forest"],
  nance: [
    "native",
    "deciduous",
    "fruit-bearing",
    "edible",
    "dry-forest",
    "wildlife-food",
  ],
  maranon: [
    "introduced",
    "evergreen",
    "fruit-bearing",
    "edible",
    "naturalized",
  ],
  "manzana-de-agua": [
    "introduced",
    "evergreen",
    "fruit-bearing",
    "edible",
    "ornamental",
  ],

  // Valuable timber
  cocobolo: [
    "native",
    "deciduous",
    "timber",
    "endangered",
    "dry-forest",
    "slow-growing",
  ],
  caoba: ["native", "deciduous", "timber", "vulnerable", "rainforest"],
  "cedro-amargo": ["native", "deciduous", "timber", "medicinal", "rainforest"],
  laurel: ["native", "evergreen", "timber", "pioneer", "fast-growing"],
  pilon: ["native", "evergreen", "timber", "rainforest", "buttressed"],
  sura: ["native", "evergreen", "timber", "rainforest", "buttressed"],
  nazareno: ["native", "evergreen", "timber", "ornamental"],

  // Pioneer/fast-growing
  balsa: [
    "native",
    "evergreen",
    "timber",
    "pioneer",
    "fast-growing",
    "rainforest",
  ],
  guarumo: ["native", "evergreen", "pioneer", "fast-growing", "wildlife-food"],

  // Nitrogen-fixers (legumes)
  guaba: [
    "native",
    "evergreen",
    "nitrogen-fixing",
    "fruit-bearing",
    "shade-tree",
    "edible",
  ],
  poro: [
    "native",
    "deciduous",
    "nitrogen-fixing",
    "flowering",
    "ornamental",
    "shade-tree",
  ],
  "madero-negro": [
    "native",
    "deciduous",
    "nitrogen-fixing",
    "timber",
    "medicinal",
  ],
  gavilan: ["native", "evergreen", "nitrogen-fixing", "timber", "rainforest"],
  carao: ["native", "deciduous", "nitrogen-fixing", "medicinal", "dry-forest"],

  // Ornamental flowering
  jacaranda: [
    "introduced",
    "deciduous",
    "flowering",
    "ornamental",
    "naturalized",
  ],
  madrono: ["native", "deciduous", "flowering", "ornamental", "dry-forest"],

  // Figs and stranglers
  higueron: ["native", "evergreen", "wildlife-food", "rainforest"],
  matapalo: ["native", "evergreen", "wildlife-food", "rainforest"],

  // Unique/special
  "guayacan-real": [
    "native",
    "deciduous",
    "flowering",
    "timber",
    "medicinal",
    "slow-growing",
    "vulnerable",
  ],
  pochote: ["native", "deciduous", "spiny", "timber", "dry-forest"],
  javillo: ["native", "deciduous", "spiny", "timber"],
  espavel: ["native", "evergreen", "timber", "rainforest", "buttressed"],
  ojoche: ["native", "evergreen", "edible", "wildlife-food", "rainforest"],
  "indio-desnudo": [
    "native",
    "deciduous",
    "ornamental",
    "dry-forest",
    "medicinal",
  ],
  jicaro: ["native", "evergreen", "fruit-bearing", "dry-forest"],
  cipres: ["introduced", "evergreen", "timber", "highland", "ornamental"],
  guacimo: [
    "native",
    "semi-deciduous",
    "fruit-bearing",
    "wildlife-food",
    "shade-tree",
    "medicinal",
  ],
  tempisque: [
    "native",
    "evergreen",
    "fruit-bearing",
    "wildlife-food",
    "dry-forest",
  ],
  mora: ["native", "deciduous", "timber", "dry-forest"],
  papaturro: ["native", "evergreen", "edible", "dry-forest"],
  yos: ["native", "deciduous", "timber", "pioneer"],
  "ron-ron": ["native", "evergreen", "timber", "rainforest"],
  jaboncillo: ["native", "evergreen", "medicinal", "ornamental"],
};

// Default tags based on conservation status
function getConservationTags(status) {
  if (!status) return [];
  const lowerStatus = status.toLowerCase();
  if (
    lowerStatus.includes("critically endangered") ||
    lowerStatus.includes("endangered")
  ) {
    return ["endangered"];
  }
  if (lowerStatus.includes("vulnerable")) {
    return ["vulnerable"];
  }
  if (lowerStatus.includes("cites") || lowerStatus.includes("protected")) {
    return ["protected"];
  }
  return [];
}

function addTagsToTree(filePath, tags) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Check if tags already exist
  if (content.includes("tags:")) {
    console.log(`  Skipping ${path.basename(filePath)} - tags already exist`);
    return false;
  }

  // Find the frontmatter section
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.log(`  Skipping ${path.basename(filePath)} - no frontmatter found`);
    return false;
  }

  const frontmatter = frontmatterMatch[1];

  // Create the tags YAML
  const tagsYaml = `tags:\n${tags.map((t) => `  - "${t}"`).join("\n")}`;

  // Insert tags before featuredImage or at end of frontmatter
  let newFrontmatter;
  if (frontmatter.includes("featuredImage:")) {
    newFrontmatter = frontmatter.replace(
      "featuredImage:",
      `${tagsYaml}\nfeaturedImage:`
    );
  } else {
    newFrontmatter = frontmatter + `\n${tagsYaml}`;
  }

  const newContent = content.replace(
    frontmatterMatch[0],
    `---\n${newFrontmatter}\n---`
  );

  fs.writeFileSync(filePath, newContent, "utf-8");
  console.log(`  ✓ Added ${tags.length} tags to ${path.basename(filePath)}`);
  return true;
}

function processLocale(locale) {
  const localeDir = path.join(TREES_DIR, locale);
  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));

  console.log(
    `\nProcessing ${locale.toUpperCase()} locale (${files.length} files):`
  );

  let updated = 0;
  for (const file of files) {
    const slug = file.replace(".mdx", "");
    const filePath = path.join(localeDir, file);

    // Read the file to get conservation status
    const content = fs.readFileSync(filePath, "utf-8");
    const statusMatch = content.match(/conservationStatus:\s*"([^"]+)"/);
    const status = statusMatch ? statusMatch[1] : null;

    // Get tags from rules or use defaults
    let tags = TAG_RULES[slug] || [];

    // Add conservation tags
    const conservationTags = getConservationTags(status);
    tags = [...new Set([...tags, ...conservationTags])];

    // If no tags assigned, use generic ones
    if (tags.length === 0) {
      tags = ["native"];
    }

    if (addTagsToTree(filePath, tags)) {
      updated++;
    }
  }

  console.log(`  Updated ${updated} files in ${locale}`);
}

// Main
console.log("Adding tags to tree MDX files...");
processLocale("en");
processLocale("es");
console.log("\nDone!");
