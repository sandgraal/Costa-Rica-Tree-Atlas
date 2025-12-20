#!/usr/bin/env node
/**
 * Add flowering and fruiting season data to tree MDX files
 * Data based on Costa Rican tropical climate patterns
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Costa Rica tree flowering/fruiting data
// Based on regional botanical research and phenological studies
const seasonalData = {
  guanacaste: {
    flowering: ["march", "april", "may"],
    fruiting: ["january", "february", "march"],
  },
  ceiba: {
    flowering: ["january", "february", "march"],
    fruiting: ["march", "april", "may"],
  },
  "corteza-amarilla": {
    flowering: ["march", "april"],
    fruiting: ["may", "june", "july"],
  },
  jacaranda: {
    flowering: ["february", "march", "april"],
    fruiting: ["may", "june"],
  },
  "roble-de-sabana": {
    flowering: ["march", "april", "may"],
    fruiting: ["june", "july"],
  },
  tamarindo: {
    flowering: ["may", "june", "july"],
    fruiting: ["december", "january", "february", "march"],
  },
  mango: {
    flowering: ["december", "january", "february"],
    fruiting: ["march", "april", "may", "june"],
  },
  jocote: {
    flowering: ["january", "february"],
    fruiting: ["march", "april", "may"],
  },
  nance: {
    flowering: ["march", "april", "may"],
    fruiting: ["june", "july", "august", "september"],
  },
  guayabo: {
    flowering: ["march", "april", "may"],
    fruiting: ["june", "july", "august"],
  },
  caimito: {
    flowering: ["august", "september", "october"],
    fruiting: ["january", "february", "march", "april"],
  },
  zapote: {
    flowering: ["june", "july"],
    fruiting: ["november", "december", "january", "february"],
  },
  "cana-fistula": {
    flowering: ["march", "april", "may"],
    fruiting: ["august", "september", "october"],
  },
  carao: {
    flowering: ["february", "march", "april"],
    fruiting: ["march", "april", "may"],
  },
  poro: {
    flowering: ["january", "february", "march"],
    fruiting: ["april", "may"],
  },
  "madero-negro": {
    flowering: ["december", "january", "february", "march"],
    fruiting: ["may", "june"],
  },
  maranon: {
    flowering: ["november", "december", "january"],
    fruiting: ["february", "march", "april"],
  },
  jobo: {
    flowering: ["february", "march"],
    fruiting: ["may", "june", "july", "august"],
  },
  nispero: {
    flowering: ["september", "october", "november"],
    fruiting: ["february", "march", "april"],
  },
  guaba: {
    flowering: ["march", "april", "may"],
    fruiting: ["june", "july", "august", "september"],
  },
  cocobolo: {
    flowering: ["april", "may", "june"],
    fruiting: ["july", "august", "september"],
  },
  almendro: {
    flowering: ["february", "march", "april"],
    fruiting: ["june", "july", "august", "september"],
  },
  cenizaro: {
    flowering: ["march", "april"],
    fruiting: ["may", "june", "july"],
  },
  guapinol: {
    flowering: ["march", "april", "may"],
    fruiting: ["october", "november", "december"],
  },
  ojoche: {
    flowering: ["june", "july"],
    fruiting: ["september", "october", "november"],
  },
  espavel: {
    flowering: ["january", "february", "march"],
    fruiting: ["may", "june", "july"],
  },
  javillo: {
    flowering: ["february", "march"],
    fruiting: ["april", "may", "june"],
  },
  pochote: {
    flowering: ["january", "february", "march"],
    fruiting: ["march", "april", "may"],
  },
  balsa: {
    flowering: ["october", "november", "december"],
    fruiting: ["january", "february", "march"],
  },
  caoba: {
    flowering: ["april", "may", "june"],
    fruiting: ["november", "december", "january"],
  },
  "cedro-amargo": {
    flowering: ["march", "april", "may"],
    fruiting: ["june", "july", "august"],
  },
  laurel: {
    flowering: ["february", "march", "april"],
    fruiting: ["may", "june", "july"],
  },
  pilon: {
    flowering: ["march", "april"],
    fruiting: ["july", "august", "september"],
  },
  sura: {
    flowering: ["march", "april", "may"],
    fruiting: ["june", "july", "august"],
  },
  tempisque: {
    flowering: ["march", "april", "may"],
    fruiting: ["april", "may", "june"],
  },
  jicaro: {
    flowering: ["april", "may", "june", "july", "august"],
    fruiting: ["all-year"],
  },
  guarumo: {
    flowering: ["all-year"],
    fruiting: ["all-year"],
  },
  higueron: {
    flowering: ["all-year"],
    fruiting: ["all-year"],
  },
  matapalo: {
    flowering: ["all-year"],
    fruiting: ["all-year"],
  },
  "indio-desnudo": {
    flowering: ["march", "april"],
    fruiting: ["may", "june"],
  },
  cipres: {
    flowering: ["february", "march"],
    fruiting: ["september", "october", "november"],
  },
  coyol: {
    flowering: ["march", "april", "may"],
    fruiting: ["june", "july", "august", "september"],
  },
  guacimo: {
    flowering: ["february", "march", "april"],
    fruiting: ["april", "may", "june"],
  },
  jaboncillo: {
    flowering: ["april", "may", "june"],
    fruiting: ["august", "september", "october"],
  },
  gavilan: {
    flowering: ["february", "march"],
    fruiting: ["april", "may", "june"],
  },
  mora: {
    flowering: ["march", "april"],
    fruiting: ["june", "july", "august"],
  },
  nazareno: {
    flowering: ["april", "may"],
    fruiting: ["july", "august", "september"],
  },
  madrono: {
    flowering: ["april", "may", "june"],
    fruiting: ["july", "august", "september"],
  },
  yos: {
    flowering: ["march", "april"],
    fruiting: ["june", "july"],
  },
  "ron-ron": {
    flowering: ["march", "april", "may"],
    fruiting: ["june", "july", "august"],
  },
  papaturro: {
    flowering: ["february", "march"],
    fruiting: ["april", "may", "june"],
  },
  "manzana-de-agua": {
    flowering: ["march", "april"],
    fruiting: ["june", "july", "august"],
  },
  "guayacan-real": {
    flowering: ["march", "april"],
    fruiting: ["june", "july"],
  },
};

function addSeasonalData(filePath, slug) {
  const data = seasonalData[slug];
  if (!data) {
    console.log(`No seasonal data for: ${slug}`);
    return false;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  // Check if already has seasonal data
  if (
    content.includes("floweringSeason:") ||
    content.includes("fruitingSeason:")
  ) {
    console.log(`Already has seasonal data: ${slug}`);
    return false;
  }

  // Find the position after 'elevation:' or before 'featuredImage:'
  const insertPoints = [
    { pattern: /elevation:\s*"[^"]*"\n/, after: true },
    { pattern: /featuredImage:/, after: false },
  ];

  let inserted = false;

  for (const { pattern, after } of insertPoints) {
    const match = content.match(pattern);
    if (match) {
      const floweringYaml =
        data.flowering.length === 1 && data.flowering[0] === "all-year"
          ? 'floweringSeason:\n  - "all-year"'
          : `floweringSeason:\n${data.flowering.map((m) => `  - "${m}"`).join("\n")}`;

      const fruitingYaml =
        data.fruiting.length === 1 && data.fruiting[0] === "all-year"
          ? 'fruitingSeason:\n  - "all-year"'
          : `fruitingSeason:\n${data.fruiting.map((m) => `  - "${m}"`).join("\n")}`;

      const seasonalBlock = `${floweringYaml}\n${fruitingYaml}\n`;

      if (after) {
        content = content.replace(match[0], match[0] + seasonalBlock);
      } else {
        content = content.replace(match[0], seasonalBlock + match[0]);
      }
      inserted = true;
      break;
    }
  }

  if (inserted) {
    fs.writeFileSync(filePath, content);
    console.log(`Added seasonal data to: ${slug}`);
    return true;
  }

  console.log(`Could not find insert point in: ${slug}`);
  return false;
}

// Process both English and Spanish versions
const contentDir = path.join(__dirname, "..", "content", "trees");
const locales = ["en", "es"];
let updatedCount = 0;

for (const locale of locales) {
  const localeDir = path.join(contentDir, locale);
  const files = fs.readdirSync(localeDir).filter((f) => f.endsWith(".mdx"));

  for (const file of files) {
    const slug = file.replace(".mdx", "");
    const filePath = path.join(localeDir, file);
    if (addSeasonalData(filePath, slug)) {
      updatedCount++;
    }
  }
}

console.log(`\nUpdated ${updatedCount} files with seasonal data`);
