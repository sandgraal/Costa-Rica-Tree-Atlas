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
      // Match <main or <main> but not inside comments or strings that reference "main-content"
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
    // Baseline: 32 pages are currently missing alternates.languages.
    // This test prevents new pages from being added without alternates.
    // As pages are fixed, update the baseline downward.
    const KNOWN_MISSING_COUNT = 32;
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
