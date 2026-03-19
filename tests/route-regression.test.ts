/**
 * Route-Level Regression Tests (P9)
 *
 * Static analysis tests that verify structural invariants across all
 * page routes without needing to render them:
 *
 * 1. No page duplicates the <main> landmark (root layout owns it)
 * 2. Content file parity between EN and ES
 * 3. Every page.tsx that uses generateMetadata provides alternates
 * 4. MDX heading hierarchy (h1 is remapped to h2 in the component registry)
 * 5. Translation message key parity between EN and ES
 * 6. No hardcoded English aria-labels in components
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively find all files matching a predicate under `dir`. */
function walkFiles(
  dir: string,
  predicate: (name: string) => boolean
): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  function recurse(d: string) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        recurse(full);
      } else if (entry.isFile() && predicate(entry.name)) {
        results.push(full);
      }
    }
  }
  recurse(dir);
  return results;
}

// ---------------------------------------------------------------------------
// 1. No page should render its own <main> tag
// ---------------------------------------------------------------------------

describe("Landmark: no nested <main>", () => {
  const pagesDir = path.join(ROOT, "src/app/[locale]");
  const pageFiles = walkFiles(pagesDir, (n) => n === "page.tsx");

  it("should find page files to audit", () => {
    expect(pageFiles.length).toBeGreaterThan(0);
  });

  it("should not have any <main tag in page files", () => {
    const violators: string[] = [];
    for (const file of pageFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // Match any occurrence of <main or <main> in the file contents
      if (/<main[\s>]/i.test(content)) {
        violators.push(path.relative(ROOT, file));
      }
    }
    if (violators.length > 0) {
      console.log(
        `Pages rendering their own <main> (root layout already provides one):\n` +
          violators.map((f) => `  - ${f}`).join("\n")
      );
    }
    expect(violators).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Content file parity between EN and ES
// ---------------------------------------------------------------------------

describe("Content file parity", () => {
  const contentDirs = [
    { name: "trees", en: "content/trees/en", es: "content/trees/es" },
    {
      name: "comparisons",
      en: "content/comparisons/en",
      es: "content/comparisons/es",
    },
  ];

  for (const { name, en, es } of contentDirs) {
    const enDir = path.join(ROOT, en);
    const esDir = path.join(ROOT, es);

    it(`${name}: EN and ES should have the same slugs`, () => {
      const enFiles = fs.existsSync(enDir)
        ? fs
            .readdirSync(enDir)
            .filter((f) => f.endsWith(".mdx"))
            .sort()
        : [];
      const esFiles = fs.existsSync(esDir)
        ? fs
            .readdirSync(esDir)
            .filter((f) => f.endsWith(".mdx"))
            .sort()
        : [];

      const missingInEs = enFiles.filter((f) => !esFiles.includes(f));
      const missingInEn = esFiles.filter((f) => !enFiles.includes(f));

      if (missingInEs.length > 0) {
        console.log(
          `${name} MDX files in EN but missing in ES:\n` +
            missingInEs.map((f) => `  - ${f}`).join("\n")
        );
      }
      if (missingInEn.length > 0) {
        console.log(
          `${name} MDX files in ES but missing in EN:\n` +
            missingInEn.map((f) => `  - ${f}`).join("\n")
        );
      }

      expect(missingInEs).toEqual([]);
      expect(missingInEn).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. MDX heading remapping guard
// ---------------------------------------------------------------------------

describe("MDX h1→h2 remapping", () => {
  it("should have an h1 component override in the MDX server components", () => {
    const serverComponents = path.join(
      ROOT,
      "src/components/mdx/server-components.tsx"
    );
    const content = fs.readFileSync(serverComponents, "utf-8");

    // There should be a named function or const that handles h1 → h2
    const hasH1Remap =
      /h1:\s*H1/.test(content) || /function\s+H1/.test(content);
    expect(hasH1Remap).toBe(true);
  });

  it("the H1 component should render as <h2>", () => {
    const serverComponents = path.join(
      ROOT,
      "src/components/mdx/server-components.tsx"
    );
    const content = fs.readFileSync(serverComponents, "utf-8");

    // Find the H1 function and verify it renders <h2>
    const h1FnMatch = content.match(
      /function\s+H1\b[\s\S]*?return\s*\(\s*<(h\d)/
    );
    expect(h1FnMatch).not.toBeNull();
    expect(h1FnMatch?.[1]).toBe("h2");
  });
});

// ---------------------------------------------------------------------------
// 4. generateMetadata alternates guard
// ---------------------------------------------------------------------------

describe("Metadata: locale alternates", () => {
  const pagesDir = path.join(ROOT, "src/app/[locale]");
  const pageFiles = walkFiles(pagesDir, (n) => n === "page.tsx");

  // Only check pages that define generateMetadata
  const pagesWithMetadata = pageFiles.filter((f) => {
    const content = fs.readFileSync(f, "utf-8");
    return content.includes("function generateMetadata");
  });

  it("should find pages with generateMetadata", () => {
    expect(pagesWithMetadata.length).toBeGreaterThan(0);
  });

  it("should not increase the number of pages missing alternates.languages", () => {
    const missing: string[] = [];
    for (const file of pagesWithMetadata) {
      const content = fs.readFileSync(file, "utf-8");
      if (!/alternates[\s\S]*?languages/.test(content)) {
        missing.push(path.relative(ROOT, file));
      }
    }
    // Baseline: 0 pages should be missing alternates.languages.
    // All pages were fixed in the P4 alternates pass.
    // This test prevents new pages from being added without alternates.
    const KNOWN_MISSING_COUNT = 0;
    if (missing.length > KNOWN_MISSING_COUNT) {
      console.log(
        `NEW pages with generateMetadata missing alternates.languages ` +
          `(${missing.length} > baseline ${KNOWN_MISSING_COUNT}):\n` +
          missing.map((f) => `  - ${f}`).join("\n")
      );
    }
    expect(missing.length).toBeLessThanOrEqual(KNOWN_MISSING_COUNT);
  });
});

// ---------------------------------------------------------------------------
// 5. Translation message key parity (EN ↔ ES)
// ---------------------------------------------------------------------------

describe("Locale surface parity: message keys", () => {
  const enPath = path.join(ROOT, "messages/en.json");
  const esPath = path.join(ROOT, "messages/es.json");

  /** Recursively flatten a nested object into dot-separated key paths. */
  function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
    const keys: string[] = [];
    for (const k of Object.keys(obj)) {
      const full = prefix ? `${prefix}.${k}` : k;
      const val = obj[k];
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        keys.push(...flattenKeys(val as Record<string, unknown>, full));
      } else {
        keys.push(full);
      }
    }
    return keys;
  }

  it("EN and ES message files should have identical top-level namespaces", () => {
    const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
    const es = JSON.parse(fs.readFileSync(esPath, "utf-8"));
    const enNs = Object.keys(en).sort();
    const esNs = Object.keys(es).sort();
    expect(enNs).toEqual(esNs);
  });

  it("EN and ES message files should have identical leaf keys", () => {
    const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
    const es = JSON.parse(fs.readFileSync(esPath, "utf-8"));

    const enKeys = flattenKeys(en).sort();
    const esKeys = flattenKeys(es).sort();

    const missingInEs = enKeys.filter((k) => !esKeys.includes(k));
    const missingInEn = esKeys.filter((k) => !enKeys.includes(k));

    if (missingInEs.length > 0) {
      console.log(
        `Keys in EN but missing in ES:\n` +
          missingInEs.map((k) => `  - ${k}`).join("\n")
      );
    }
    if (missingInEn.length > 0) {
      console.log(
        `Keys in ES but missing in EN:\n` +
          missingInEn.map((k) => `  - ${k}`).join("\n")
      );
    }

    expect(missingInEs).toEqual([]);
    expect(missingInEn).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 6. No hardcoded English aria-labels in components
// ---------------------------------------------------------------------------

describe("Locale surface parity: no hardcoded aria-labels", () => {
  const componentsDir = path.join(ROOT, "src/components");
  const tsxFiles = walkFiles(componentsDir, (n) => n.endsWith(".tsx"));

  it("should find component files to audit", () => {
    expect(tsxFiles.length).toBeGreaterThan(0);
  });

  it("should not increase the number of hardcoded aria-label strings", () => {
    // Matches any aria-label with a literal string value (double or single-quoted),
    // including labels starting with punctuation, digits, emoji, or any non-brace char.
    // Only JSX expressions (aria-label={...}) are intentionally excluded.
    const ARIA_LABEL_LITERAL = /aria-label\s*=\s*(?:"(?!\{)[^"]*"|'(?!\{)[^']*')/g;

    const violations: { file: string; labels: string[] }[] = [];
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(ARIA_LABEL_LITERAL);
      if (matches && matches.length > 0) {
        violations.push({
          file: path.relative(ROOT, file),
          labels: matches,
        });
      }
    }

    // Baseline: 0 hardcoded aria-labels remain.
    // All labels were localized in the P3 ARIA audit pass.
    // This test prevents new hardcoded labels from being introduced.
    const totalCount = violations.reduce((n, v) => n + v.labels.length, 0);
    const KNOWN_HARDCODED_COUNT = 0;

    if (totalCount > KNOWN_HARDCODED_COUNT) {
      console.log(
        `NEW hardcoded aria-label strings found ` +
          `(${totalCount} > baseline ${KNOWN_HARDCODED_COUNT}):\n` +
          violations
            .map((v) => `  ${v.file}: ${v.labels.join(", ")}`)
            .join("\n")
      );
    }
    expect(totalCount).toBeLessThanOrEqual(KNOWN_HARDCODED_COUNT);
  });
});
