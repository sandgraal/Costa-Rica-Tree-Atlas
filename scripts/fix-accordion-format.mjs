#!/usr/bin/env node
/**
 * Script to fix markdown formatting inside AccordionItem components
 * Converts inline markdown tables to DataTable components
 * Also fixes numbered lists that are on single lines
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, "../content/trees/en");

function fixInlineNumberedLists(text) {
  // Pattern: "1. **item** description 2. **item** description 3. ..."
  const numberedPattern = /(\d+\.\s+\*\*[^*]+\*\*[^0-9]+?)(?=\d+\.|$)/g;
  const matches = text.match(numberedPattern);

  if (matches && matches.length > 1) {
    // This looks like a numbered list that's all on one line
    let fixed = text;
    for (let i = 1; i <= matches.length; i++) {
      fixed = fixed.replace(new RegExp(`(^|\\s)${i}\\.\\s+`), `\n\n    ${i}. `);
    }
    return fixed.trim();
  }

  return text;
}

function fixInlineBulletLists(text) {
  // Pattern for inline dashes that should be list items
  // "**Label**: - item - item - item"
  const dashPattern = /(\*\*[^*]+\*\*:\s*)((?:-\s+[^-]+)+)/g;

  return text.replace(dashPattern, (match, label, items) => {
    const listItems = items.split(/\s+-\s+/).filter(Boolean);
    if (listItems.length > 1) {
      const formattedItems = listItems
        .map((item) => `\n    - ${item.trim()}`)
        .join("");
      return `${label}${formattedItems}`;
    }
    return match;
  });
}

function parseInlineTable(text) {
  // Try to extract table from inline format
  // Pattern: "| Header1 | Header2 | |---|---| | cell | cell | | cell | cell |"

  // First, find all pipe-separated segments
  const segments = text
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length < 4) return null;

  // Check for separator row (---)
  const sepIndex = segments.findIndex((s) => /^[-\s]+$/.test(s));
  if (sepIndex === -1) return null;

  // Headers are before separator
  const headers = segments
    .slice(0, sepIndex)
    .filter((s) => !/^[-\s]+$/.test(s));
  if (headers.length !== 2) return null; // Only handle 2-column tables

  // Rows are after separator, in pairs
  const dataSegments = segments
    .slice(sepIndex + 1)
    .filter((s) => !/^[-\s]+$/.test(s));
  const rows = [];

  for (let i = 0; i < dataSegments.length; i += 2) {
    if (i + 1 < dataSegments.length) {
      let cell1 = dataSegments[i].replace(/_([^_]+)_/g, "$1").trim();
      let cell2 = dataSegments[i + 1].replace(/_([^_]+)_/g, "$1").trim();
      rows.push([cell1, cell2]);
    }
  }

  if (rows.length === 0) return null;

  return {
    headers: headers.map((h) => h.replace(/_([^_]+)_/g, "$1")),
    rows,
  };
}

function createDataTable(headers, rows) {
  const escapedRows = rows.map((row) => {
    return row.map(
      (cell) => cell.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    );
  });

  const rowsStr = escapedRows
    .map((row) => `        ["${row[0]}", "${row[1]}"]`)
    .join(",\n");

  return `<DataTable
      headers={["${headers[0]}", "${headers[1]}"]}
      rows={[
${rowsStr}
      ]}
    />`;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  // Find AccordionItem blocks with potential formatting issues
  const accordionRegex =
    /<AccordionItem\s+title="([^"]+)">([\s\S]*?)<\/AccordionItem>/g;

  content = content.replace(accordionRegex, (match, title, innerContent) => {
    let newContent = innerContent;

    // Check for inline table patterns
    if (innerContent.includes("|---") || innerContent.includes("| ---")) {
      const parsed = parseInlineTable(innerContent);
      if (parsed) {
        // Extract text before and after the table
        const tableStart = innerContent.indexOf("|");
        const tableEnd = innerContent.lastIndexOf("|") + 1;

        const before = innerContent.substring(0, tableStart).trim();
        const after = innerContent.substring(tableEnd).trim();

        const dataTable = createDataTable(parsed.headers, parsed.rows);

        newContent = "";
        if (before) {
          newContent += `\n    ${before}\n\n    `;
        } else {
          newContent += "\n    ";
        }
        newContent += dataTable;
        if (after) {
          // Clean up the after text
          const cleanAfter = after.replace(/^\s*The\s+/, "\n\n    **The ");
          newContent += `\n\n    ${cleanAfter.trim()}`;
        }
        newContent += "\n  ";

        modified = true;
        console.log(`    Fixed table in "${title}"`);
      }
    }

    // Check for inline numbered lists (1. **item** text 2. **item** text)
    const numberedListPattern = /(\d+\.\s+\*\*[^*]+\*\*[^1-9]+?){3,}/;
    if (
      numberedListPattern.test(innerContent) &&
      !innerContent.includes("\n\n")
    ) {
      // Fix inline numbered list
      let fixedList = innerContent.replace(
        /(\d+)\.\s+(\*\*)/g,
        "\n\n    $1. $2"
      );
      if (fixedList !== innerContent) {
        newContent = fixedList + "\n  ";
        modified = true;
        console.log(`    Fixed numbered list in "${title}"`);
      }
    }

    // Add defaultOpen to first accordion item if it's Key Identification Features
    let attributes = `title="${title}"`;
    if (title.includes("Key Identification") || title.includes("Definitive")) {
      attributes += " defaultOpen={true}";
    }

    return `<AccordionItem ${attributes}>${newContent}</AccordionItem>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
  }

  return modified;
}

// Main execution
console.log("Fixing accordion formatting in MDX files...\n");

const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
let fixedCount = 0;

for (const file of files) {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, "utf-8");

  // Check if file needs processing
  if (
    content.includes("<AccordionItem") &&
    (content.includes("|---") || content.includes("| ---"))
  ) {
    console.log(`Processing: ${file}`);

    if (processFile(filePath)) {
      fixedCount++;
      console.log(`  ✓ Fixed\n`);
    } else {
      console.log(`  - No changes\n`);
    }
  }
}

console.log(`\nDone! Fixed ${fixedCount} files.`);
