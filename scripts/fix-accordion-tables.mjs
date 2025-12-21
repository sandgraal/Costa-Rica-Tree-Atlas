#!/usr/bin/env node
/**
 * Script to fix markdown tables inside AccordionItem components
 * Converts markdown tables to DataTable components
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, "../content/trees/en");

// Regular expression to match markdown tables within AccordionItem
const accordionWithTableRegex =
  /<AccordionItem\s+title="([^"]+)">\s*([\s\S]*?)\s*<\/AccordionItem>/g;
const markdownTableRegex =
  /\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*\n\|[-|\s]+\|\s*\n((?:\|[^|]+\|[^|]+\|\s*\n?)+)/g;

// Also match inline tables that are all on one line (malformed)
const inlineTableRegex =
  /\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*\|[-|\s]+\|[-|\s]+\|\s*((?:\|[^|]+\|[^|]+\|\s*)+)/g;

function parseMarkdownTable(tableMatch) {
  const [fullMatch, header1, header2, rowsStr] = tableMatch;

  // Clean headers
  const headers = [header1.trim(), header2.trim()];

  // Parse rows
  const rows = [];
  const rowMatches = rowsStr.matchAll(/\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g);

  for (const rowMatch of rowMatches) {
    const cell1 = rowMatch[1]
      .trim()
      .replace(/_([^_]+)_/g, "$1") // Remove italic markers
      .replace(/\*\*([^*]+)\*\*/g, "$1"); // Remove bold markers
    const cell2 = rowMatch[2]
      .trim()
      .replace(/_([^_]+)_/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1");
    rows.push([cell1, cell2]);
  }

  return { headers, rows, fullMatch };
}

function createDataTable(headers, rows) {
  const rowsJson = rows
    .map((row) => `["${row[0]}", "${row[1]}"]`)
    .join(",\n      ");
  return `<DataTable
    headers={["${headers[0]}", "${headers[1]}"]}
    rows={[
      ${rowsJson}
    ]}
  />`;
}

function processAccordionItem(content, title, innerContent) {
  // Check if there's a markdown table inside
  const tableMatch = [...innerContent.matchAll(markdownTableRegex)];

  if (tableMatch.length === 0) {
    // Try inline table format
    const inlineMatch = [...innerContent.matchAll(inlineTableRegex)];
    if (inlineMatch.length === 0) {
      return null; // No table to fix
    }
  }

  let newContent = innerContent;

  // Process all tables found
  for (const match of innerContent.matchAll(markdownTableRegex)) {
    const { headers, rows, fullMatch } = parseMarkdownTable(match);
    const dataTable = createDataTable(headers, rows);
    newContent = newContent.replace(fullMatch, dataTable);
  }

  // Also handle inline/malformed tables
  const remainingText = newContent.replace(/<DataTable[\s\S]*?\/>/g, "");
  if (remainingText.includes("|") && remainingText.includes("---")) {
    // Still has table-like content, try manual parsing
    console.log(`  Note: ${title} may have complex table formatting`);
  }

  return newContent;
}

function fixFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  let modified = false;
  let newContent = content;

  // Find all AccordionItems and check for markdown tables
  const matches = [...content.matchAll(accordionWithTableRegex)];

  for (const match of matches) {
    const [fullMatch, title, innerContent] = match;

    // Check if inner content has markdown table patterns
    if (
      innerContent.includes("|") &&
      (innerContent.includes("---|") || innerContent.includes("| ---"))
    ) {
      console.log(`  Found table in "${title}"`);

      // Try to fix the content
      const fixedContent = processAccordionItem(content, title, innerContent);
      if (fixedContent && fixedContent !== innerContent) {
        const newAccordion = `<AccordionItem title="${title}">\n    ${fixedContent.trim()}\n  </AccordionItem>`;
        newContent = newContent.replace(fullMatch, newAccordion);
        modified = true;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent, "utf-8");
    return true;
  }

  return false;
}

// Main execution
console.log("Scanning for files with markdown tables in AccordionItems...\n");

const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
let fixedCount = 0;
let filesWithIssues = [];

for (const file of files) {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, "utf-8");

  // Quick check if file has AccordionItem with table
  if (content.includes("<AccordionItem") && content.includes("|---")) {
    console.log(`Processing: ${file}`);
    filesWithIssues.push(file);

    if (fixFile(filePath)) {
      fixedCount++;
      console.log(`  ✓ Fixed tables\n`);
    } else {
      console.log(`  ! May need manual review\n`);
    }
  }
}

console.log(`\nSummary:`);
console.log(`- Files with potential issues: ${filesWithIssues.length}`);
console.log(`- Files automatically fixed: ${fixedCount}`);
console.log(
  `- Files needing manual review: ${filesWithIssues.length - fixedCount}`
);

if (filesWithIssues.length - fixedCount > 0) {
  console.log("\nFiles that may need manual review:");
  for (const file of filesWithIssues) {
    console.log(`  - ${file}`);
  }
}
