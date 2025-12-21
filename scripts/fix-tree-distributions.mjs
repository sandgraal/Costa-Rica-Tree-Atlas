#!/usr/bin/env node
/**
 * Tree Distribution Correction Script
 *
 * This script applies corrections to tree distribution data based on
 * botanical research of actual species ranges in Costa Rica.
 *
 * Run with: node scripts/fix-tree-distributions.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TREES_DIR = path.join(__dirname, "../content/trees");

// Distribution corrections based on botanical research
// Format: { file: string, correctedDistribution: string[] }
const CORRECTIONS = [
  // HIGH PRIORITY CORRECTIONS
  {
    file: "aceituno.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "limon",
      "san-jose",
      "heredia",
    ],
    reason: "Added heredia (Atlantic lowlands), fixed san-jose formatting",
  },
  {
    file: "almendro.mdx",
    correctedDistribution: ["limon", "alajuela", "heredia", "puntarenas"],
    reason: "Added puntarenas (Osa Peninsula populations)",
  },
  {
    file: "caoba.mdx",
    correctedDistribution: [
      "limon",
      "alajuela",
      "heredia",
      "puntarenas",
      "guanacaste",
    ],
    reason: "Added guanacaste (historical dry-wet transition forests)",
  },
  {
    file: "carao.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "san-jose",
      "limon",
    ],
    reason: "Added san-jose (ornamental), limon (natural lowlands)",
  },
  {
    file: "carboncillo.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (Puriscal, Acosta dry areas)",
  },
  {
    file: "ceiba.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "limon",
      "alajuela",
      "heredia",
      "san-jose",
    ],
    reason:
      "Added heredia, san-jose (widespread in lowlands and Central Valley)",
  },
  {
    file: "cocobolo.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela"],
    reason: "Added alajuela (northern dry forest areas)",
  },
  {
    file: "cortez-negro.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "san-jose",
      "heredia",
      "limon",
    ],
    reason: "Added heredia, limon (widely planted ornamental)",
  },
  {
    file: "corteza-amarilla.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (western drier regions, ornamental)",
  },
  {
    file: "guanacaste.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "san-jose",
      "limon",
    ],
    reason: "Added san-jose, limon (national tree planted nationwide)",
  },
  {
    file: "guapinol.mdx",
    correctedDistribution: [
      "limon",
      "alajuela",
      "heredia",
      "puntarenas",
      "guanacaste",
      "san-jose",
    ],
    reason: "Added san-jose (Pacific slope lowlands)",
  },
  {
    file: "indio-desnudo.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "limon",
      "san-jose",
      "heredia",
    ],
    reason: "Added limon, san-jose, heredia (widespread lowland species)",
  },
  {
    file: "jicaro.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (western dry regions)",
  },
  {
    file: "jobo.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "limon",
      "san-jose",
      "heredia",
    ],
    reason: "Added heredia (Caribbean slope lowlands)",
  },
  {
    file: "jocote.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "san-jose",
      "heredia",
      "cartago",
      "limon",
    ],
    reason: "Added heredia, cartago, limon (cultivated nationwide)",
  },
  {
    file: "madrono.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (western dry regions)",
  },
  {
    file: "nance.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (Puriscal, Acosta areas)",
  },
  {
    file: "nazareno.mdx",
    correctedDistribution: ["limon", "puntarenas", "heredia", "alajuela"],
    reason: "Added heredia, alajuela (Sarapiquí, Northern Zone wet forests)",
  },
  {
    file: "panama.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (dry forest extensions)",
  },
  {
    file: "papaturro.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (western dry regions)",
  },
  {
    file: "pochote.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela"],
    reason: "Added alajuela (western dry forest regions)",
  },
  {
    file: "roble-de-sabana.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "san-jose",
      "limon",
      "heredia",
      "cartago",
    ],
    reason: "Added limon, heredia, cartago (widely planted nationwide)",
  },
  {
    file: "tempisque.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (western dry regions)",
  },

  // MEDIUM PRIORITY CORRECTIONS
  {
    file: "aguacatillo.mdx",
    correctedDistribution: [
      "cartago",
      "san-jose",
      "alajuela",
      "heredia",
      "puntarenas",
    ],
    reason: "Added puntarenas (Monteverde, Los Santos highlands)",
  },
  {
    file: "cacao.mdx",
    correctedDistribution: [
      "limon",
      "heredia",
      "cartago",
      "puntarenas",
      "alajuela",
    ],
    reason: "Added alajuela (Northern Zone plantations)",
  },
  {
    file: "gavilan.mdx",
    correctedDistribution: ["limon", "heredia", "alajuela", "puntarenas"],
    reason: "Added puntarenas (Osa Peninsula wet forests)",
  },
  {
    file: "guaba.mdx",
    correctedDistribution: [
      "limon",
      "alajuela",
      "heredia",
      "san-jose",
      "cartago",
      "puntarenas",
      "guanacaste",
    ],
    reason: "Added guanacaste (cultivated throughout)",
  },
  {
    file: "guachipelin.mdx",
    correctedDistribution: ["guanacaste", "puntarenas", "alajuela", "san-jose"],
    reason: "Added san-jose (western dry regions)",
  },
  {
    file: "jaboncillo.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "san-jose",
      "limon",
    ],
    reason: "Added limon (coastal dry areas)",
  },
  {
    file: "laurel-negro.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "san-jose",
      "limon",
    ],
    reason: "Added limon (scattered Caribbean populations)",
  },
  {
    file: "ojoche.mdx",
    correctedDistribution: [
      "limon",
      "alajuela",
      "heredia",
      "puntarenas",
      "guanacaste",
      "san-jose",
    ],
    reason: "Added san-jose (lower elevation forests)",
  },
  {
    file: "orey.mdx",
    correctedDistribution: ["limon", "heredia", "puntarenas", "alajuela"],
    reason: "Added alajuela (Northern Zone wetlands)",
  },
  {
    file: "ron-ron.mdx",
    correctedDistribution: [
      "limon",
      "alajuela",
      "heredia",
      "puntarenas",
      "guanacaste",
      "san-jose",
    ],
    reason:
      "Added guanacaste, san-jose (widespread in both wet and dry forests)",
  },
  {
    file: "sangrillo.mdx",
    correctedDistribution: ["limon", "heredia", "puntarenas", "alajuela"],
    reason: "Added alajuela (Northern Zone wetlands)",
  },
  {
    file: "tamarindo.mdx",
    correctedDistribution: [
      "guanacaste",
      "puntarenas",
      "alajuela",
      "san-jose",
      "limon",
    ],
    reason: "Added limon (planted in coastal lowlands)",
  },
];

// Function to update distribution in MDX frontmatter
function updateDistribution(content, newDistribution) {
  // Only process the frontmatter (between first two ---)
  // The content structure is: ---\nfrontmatter\n---\nbody
  const firstDelim = content.indexOf("---");
  if (firstDelim !== 0) return null;

  const secondDelim = content.indexOf("---", 3);
  if (secondDelim === -1) return null;

  const frontmatter = content.substring(3, secondDelim);
  const body = content.substring(secondDelim + 3);

  // Parse frontmatter line by line
  const lines = frontmatter.split("\n");
  const newLines = [];
  let inDistribution = false;
  let distributionAdded = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("distribution:")) {
      // Start of distribution section - add our new values
      newLines.push("distribution:");
      for (const d of newDistribution) {
        newLines.push(`  - "${d}"`);
      }
      inDistribution = true;
      distributionAdded = true;
    } else if (inDistribution && /^\s+-/.test(line)) {
      // Skip old distribution items
      continue;
    } else {
      // Not in distribution section, keep the line
      inDistribution = false;
      newLines.push(line);
    }
  }

  if (!distributionAdded) {
    console.log("  No distribution found");
    return null;
  }

  return `---${newLines.join("\n")}---${body}`;
}

// Function to fix san jose -> san-jose formatting
function fixSanJoseFormatting(content) {
  // Fix "san jose" to "san-jose" in frontmatter only
  const frontmatterMatch = content.match(/^(---\n[\s\S]*?\n---)/);
  if (!frontmatterMatch) return content;

  let frontmatter = frontmatterMatch[1];
  frontmatter = frontmatter.replace(/["']?san jose["']?/gi, '"san-jose"');

  return content.replace(frontmatterMatch[0], frontmatter);
}

// Main execution
async function main() {
  console.log("🌳 Tree Distribution Correction Script\n");
  console.log("=".repeat(50));

  let updated = 0;
  let errors = 0;

  for (const locale of ["en", "es"]) {
    console.log(`\n📁 Processing ${locale.toUpperCase()} locale...\n`);

    for (const correction of CORRECTIONS) {
      const filePath = path.join(TREES_DIR, locale, correction.file);

      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠️  ${correction.file} not found in ${locale}`);
        continue;
      }

      try {
        let content = fs.readFileSync(filePath, "utf-8");

        // First fix san jose formatting
        content = fixSanJoseFormatting(content);

        // Then update distribution
        const updatedContent = updateDistribution(
          content,
          correction.correctedDistribution
        );

        if (updatedContent) {
          fs.writeFileSync(filePath, updatedContent);
          console.log(`  ✅ ${correction.file}`);
          console.log(`     → ${correction.reason}`);
          updated++;
        } else {
          console.log(`  ❌ ${correction.file} - Could not parse frontmatter`);
          errors++;
        }
      } catch (err) {
        console.log(`  ❌ ${correction.file} - Error: ${err.message}`);
        errors++;
      }
    }
  }

  // Additional pass: fix san jose formatting in all files
  console.log('\n📝 Fixing "san jose" → "san-jose" formatting...\n');

  for (const locale of ["en", "es"]) {
    const localeDir = path.join(TREES_DIR, locale);
    if (!fs.existsSync(localeDir)) continue;

    const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));

    for (const file of files) {
      const filePath = path.join(localeDir, file);
      let content = fs.readFileSync(filePath, "utf-8");

      if (
        content.includes("san jose") ||
        content.includes('"san jose"') ||
        content.includes("'san jose'")
      ) {
        content = fixSanJoseFormatting(content);
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ Fixed formatting in ${locale}/${file}`);
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log(`\n✅ Updated: ${updated} files`);
  console.log(`❌ Errors: ${errors} files`);
  console.log("\n🌳 Distribution corrections complete!\n");
}

main().catch(console.error);
