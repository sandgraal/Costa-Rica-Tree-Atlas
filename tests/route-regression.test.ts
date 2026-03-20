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
 * 7. Locale ternary count regression guard
 * 8. No ad-hoc locale selection branches outside shared i18n helpers
 * 9. Route family coverage
 * 10. Education data files use t() helper (no array-level ternaries)
 * 11. Tree detail mobile wayfinding anchors remain present
 * 12. Compare page keeps guides/tool switcher anchors
 * 13. No unguarded console.log in page/component source (console-cleanliness)
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
    const ARIA_LABEL_LITERAL =
      /aria-label\s*=\s*(?:"(?!\{)[^"]*"|'(?!\{)[^']*')/g;

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

// ---------------------------------------------------------------------------
// 7. Locale ternary count regression guard
// ---------------------------------------------------------------------------

describe("Locale ternary regression guard", () => {
  const srcDir = path.join(ROOT, "src");
  const tsFiles = walkFiles(
    srcDir,
    (n) => n.endsWith(".ts") || n.endsWith(".tsx")
  );

  it("should not increase the count of locale === 'es' ternaries beyond baseline", () => {
    const LOCALE_TERNARY = /(?:locale|lang)\s*===\s*["']es["']\s*\?/g;

    let totalCount = 0;
    const perFile: { file: string; count: number }[] = [];
    for (const file of tsFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(LOCALE_TERNARY);
      if (matches) {
        totalCount += matches.length;
        perFile.push({
          file: path.relative(ROOT, file),
          count: matches.length,
        });
      }
    }

    // Baseline: 0 locale ternaries remain after the helper consolidation pass.
    // Normalize locale via shared helpers instead of reintroducing ad-hoc
    // `locale === "es" ? ... : ...` branches across route/component code.
    const KNOWN_TERNARY_COUNT = 0;

    if (totalCount > KNOWN_TERNARY_COUNT) {
      console.log(
        `NEW locale ternaries found (${totalCount} > baseline ${KNOWN_TERNARY_COUNT}):\n` +
          perFile.map((f) => `  ${f.file}: ${f.count}`).join("\n")
      );
    }
    expect(totalCount).toBeLessThanOrEqual(KNOWN_TERNARY_COUNT);
  });
});

// ---------------------------------------------------------------------------
// 8. Locale selection helper usage
// ---------------------------------------------------------------------------

describe("Locale selection helper usage", () => {
  const srcDir = path.join(ROOT, "src");
  const sourceFiles = walkFiles(
    srcDir,
    (n) => n.endsWith(".ts") || n.endsWith(".tsx")
  );
  const ALLOW_LIST = new Set(["src/lib/i18n/translations.ts"]);

  it("should not contain ad-hoc locale selection branches outside shared helpers", () => {
    const STARTS_WITH_ES = /\b(?:locale|lang)\.startsWith\(\s*["']es["']\s*\)/g;
    const RETURN_BRANCH =
      /if\s*\(\s*(?:lang|locale|normalizeLocale\(locale\))\s*===\s*["']es["']\s*\)\s*\{\s*return\s+/g;

    const violators: { file: string; count: number }[] = [];

    for (const file of sourceFiles) {
      const rel = path.relative(ROOT, file);
      if (ALLOW_LIST.has(rel)) continue;

      const content = fs.readFileSync(file, "utf-8");
      const count = [STARTS_WITH_ES, RETURN_BRANCH].reduce(
        (sum, pattern) => sum + (content.match(pattern)?.length ?? 0),
        0
      );

      if (count > 0) {
        violators.push({ file: rel, count });
      }
    }

    if (violators.length > 0) {
      console.log(
        `Files with ad-hoc locale selection branches (use shared i18n helpers instead):\n` +
          violators.map((v) => `  ${v.file}: ${v.count} matches`).join("\n")
      );
    }

    expect(violators).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 9. Route family coverage
// ---------------------------------------------------------------------------

describe("Route family coverage", () => {
  const localeDir = path.join(ROOT, "src/app/[locale]");

  const EXPECTED_ROUTE_FAMILIES = [
    "", // root page (homepage)
    "trees",
    "trees/[slug]",
    "compare",
    "compare/[slug]",
    "education",
    "glossary",
    "about",
  ];

  it("should have page.tsx for all major route families", () => {
    const missing: string[] = [];
    for (const route of EXPECTED_ROUTE_FAMILIES) {
      const pageFile = path.join(localeDir, route, "page.tsx");
      if (!fs.existsSync(pageFile)) {
        missing.push(route || "(root)");
      }
    }
    if (missing.length > 0) {
      console.log(
        `Missing page.tsx for route families:\n` +
          missing.map((r) => `  - [locale]/${r}`).join("\n")
      );
    }
    expect(missing).toEqual([]);
  });

  it("should have layout.tsx at the [locale] root", () => {
    const layoutFile = path.join(localeDir, "layout.tsx");
    expect(fs.existsSync(layoutFile)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 10. Education data files use t() helper (no array-level ternaries)
// ---------------------------------------------------------------------------

describe("Education data: no array-level locale ternaries", () => {
  const educationDir = path.join(ROOT, "src/app/[locale]/education");
  const dataFiles = walkFiles(educationDir, (n) => n.endsWith("-data.ts"));

  it("should find education data files", () => {
    expect(dataFiles.length).toBeGreaterThan(0);
  });

  it("should not have array-level locale ternaries in data files", () => {
    // Matches patterns like:
    // - lang === "es" ? ["Spanish", ...] : ["English", ...]
    // - locale === "es" ? ["Spanish", ...] : ["English", ...]
    // - isEs ? ["Spanish", ...] : ["English", ...]
    // These should be converted to per-property t() calls.
    const ARRAY_TERNARY =
      /\b(?:lang|locale)\s*===\s*["']es["']\s*\?\s*\[|\bisEs\s*\?\s*\[/g;

    const violators: { file: string; count: number }[] = [];
    for (const file of dataFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(ARRAY_TERNARY);
      if (matches) {
        violators.push({
          file: path.relative(ROOT, file),
          count: matches.length,
        });
      }
    }

    if (violators.length > 0) {
      console.log(
        `Education data files with array-level ternaries (should use t() helper):\n` +
          violators.map((v) => `  ${v.file}: ${v.count} occurrences`).join("\n")
      );
    }
    expect(violators).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 11. Tree detail mobile wayfinding anchors
// ---------------------------------------------------------------------------

describe("Tree detail mobile wayfinding", () => {
  const treeDetailFile = path.join(
    ROOT,
    "src/app/[locale]/trees/[slug]/page.tsx"
  );

  it("should keep the mobile TOC and anchor ids for priority sections", () => {
    const content = fs.readFileSync(treeDetailFile, "utf-8");

    expect(content).toContain('<TableOfContents variant="mobile" />');

    for (const anchorId of [
      'id="quick-facts"',
      'id="safety"',
      'id="distribution"',
      'id="seasonal-information"',
      'id="biodiversity"',
      'id="how-to-identify"',
    ]) {
      expect(content).toContain(anchorId);
    }
  });
});

// ---------------------------------------------------------------------------
// 12. Compare page guides/tool switcher
// ---------------------------------------------------------------------------

describe("Compare page wayfinding", () => {
  const comparePageFile = path.join(ROOT, "src/app/[locale]/compare/page.tsx");

  it("should keep the guides/tool switcher and section anchors near the top", () => {
    const content = fs.readFileSync(comparePageFile, "utf-8");

    expect(content).toContain('aria-label={t("comparisonModeSwitcher")}');
    expect(content).toContain('href="#comparison-guides"');
    expect(content).toContain('href="#interactive-tool"');
    expect(content).toContain('id="comparison-guides"');
    expect(content).toContain('id="interactive-tool"');
  });
});

// ---------------------------------------------------------------------------
// 13. Console-cleanliness: no stray console.log in page/component source
// ---------------------------------------------------------------------------

describe("Console cleanliness: no unguarded console.log", () => {
  // Stray console.log() calls in page/component source leak debug noise in
  // production.  console.warn/error in catch blocks or error boundaries are
  // fine — we only flag bare `console.log(`.
  const srcDir = path.join(ROOT, "src");
  const sourceFiles = walkFiles(srcDir, (n) => /\.(tsx?|jsx?)$/.test(n));

  // Files that legitimately use console (error tracking, instrumentation)
  const ALLOW_LIST = new Set([
    "src/lib/error-tracking.ts",
    "src/instrumentation.ts",
    "src/lib/logger.ts",
  ]);

  it("should find source files", () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it("should not contain bare console.log calls in page/component files", () => {
    const CONSOLE_LOG = /\bconsole\.log\s*\(/g;
    const violators: { file: string; count: number }[] = [];

    for (const file of sourceFiles) {
      const rel = path.relative(ROOT, file);
      const normalizedRel = rel.split(path.sep).join("/");
      if (ALLOW_LIST.has(normalizedRel)) continue;

      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(CONSOLE_LOG);
      if (matches) {
        violators.push({ file: normalizedRel, count: matches.length });
      }
    }

    if (violators.length > 0) {
      console.log(
        `Files with console.log (remove or convert to proper logging):\n` +
          violators.map((v) => `  ${v.file}: ${v.count} calls`).join("\n")
      );
    }

    // Baseline: allow up to a small number to avoid blocking on existing calls.
    // Reduce this to 0 over time.
    expect(violators.length).toBeLessThanOrEqual(5);
  });
});
