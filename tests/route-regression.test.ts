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

  it("should use a locale-aware manifest route from the locale layout", () => {
    const layoutFile = path.join(ROOT, "src/app/[locale]/layout.tsx");
    const manifestFile = path.join(ROOT, "src/app/[locale]/manifest.ts");
    const layoutContent = fs.readFileSync(layoutFile, "utf-8");

    expect(fs.existsSync(manifestFile)).toBe(true);
    // Assert that there is a manifest <link> using the locale-aware manifest route,
    // but allow flexible whitespace/attribute formatting.
    expect(layoutContent).toMatch(
      /<link[^>]+rel=["']manifest["'][^>]+href=\{?`\/\$\{locale\}\/manifest\.webmanifest`}?[^>]*\/?>/
    );
    expect(layoutContent).not.toContain('href="/manifest.json"');
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

  it("should not reintroduce hardcoded English favorite button labels in tree cards", () => {
    const treeComponentsDir = path.join(ROOT, "src/components/tree");
    const treeComponentFiles = walkFiles(treeComponentsDir, (n) =>
      n.endsWith(".tsx")
    );
    const HARDCODED_FAVORITE_LABELS = /Add to favorites|Remove from favorites/g;

    const violations: { file: string; matches: string[] }[] = [];
    for (const file of treeComponentFiles) {
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(HARDCODED_FAVORITE_LABELS);

      if (matches && matches.length > 0) {
        violations.push({
          file: path.relative(ROOT, file),
          matches,
        });
      }
    }

    if (violations.length > 0) {
      console.log(
        `Hardcoded English favorite labels found in tree components:\n` +
          violations
            .map((v) => `  ${v.file}: ${v.matches.join(", ")}`)
            .join("\n")
      );
    }

    expect(violations).toEqual([]);
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
      const rel = path.relative(ROOT, file).split(path.sep).join("/");
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

    expect(content).toMatch(
      /<TableOfContents[^>]*\bvariant\s*=\s*["']mobile["'][^>]*\/>/
    );

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

  it("should keep secondary sections in mobile collapsibles and out of the priority jump-nav", () => {
    const content = fs.readFileSync(treeDetailFile, "utf-8");

    expect(content).toContain("<MobileCollapsibleSection");

    for (const secondaryId of [
      'id="uses"',
      'id="comparison-guides"',
      'id="related-trees"',
    ]) {
      expect(content).toContain(secondaryId);
    }

    const tertiaryTocLevels = content.match(/tocLevel=\{3\}/g) ?? [];
    expect(tertiaryTocLevels.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// 12. Compare page guides/tool switcher
// ---------------------------------------------------------------------------

describe("Compare page wayfinding", () => {
  const comparePageFile = path.join(ROOT, "src/app/[locale]/compare/page.tsx");

  it("should keep the guides/tool switcher and section anchors near the top", () => {
    const content = fs.readFileSync(comparePageFile, "utf-8");

    expect(content).toMatch(
      /aria-label\s*=\s*\{t\(\s*["']comparisonModeSwitcher["']\s*\)\}/
    );
    expect(content).toMatch(/href\s*=\s*["']#comparison-guides["']/);
    expect(content).toMatch(/href\s*=\s*["']#interactive-tool["']/);
    expect(content).toMatch(/id\s*=\s*["']comparison-guides["']/);
    expect(content).toMatch(/id\s*=\s*["']interactive-tool["']/);
  });
});

// ---------------------------------------------------------------------------
// 13. High-traffic Spanish surface parity regressions
// ---------------------------------------------------------------------------

describe("High-traffic Spanish surface parity", () => {
  const paritySensitiveFiles = [
    "src/components/data/BiodiversityInfo.tsx",
    "src/components/TreeComparison.tsx",
    "src/app/[locale]/compare/[slug]/page.tsx",
    "src/app/[locale]/compare/[slug]/opengraph-image.tsx",
    "src/app/[locale]/compare/[slug]/twitter-image.tsx",
    "src/app/[locale]/education/page.tsx",
    "src/app/[locale]/oral-histories/[slug]/page.tsx",
  ];

  it("should not reintroduce known English fallback strings on audited high-traffic Spanish surfaces", () => {
    const HARDCODED_ENGLISH_FALLBACKS =
      /GBIF Costa Rica|Comparison Not Found|View all printable resources|Browse Trees|Try Identify|Compare Trees|title: "Not Found"|Clear all|Max \$\{maxTrees\} trees|Remove \$\{tree\.title\}|\+\{tree\.uses\.length - 5\} more/g;

    const violations: { file: string; matches: string[] }[] = [];
    for (const relPath of paritySensitiveFiles) {
      const file = path.join(ROOT, relPath);
      const content = fs.readFileSync(file, "utf-8");
      const matches = content.match(HARDCODED_ENGLISH_FALLBACKS);

      if (matches && matches.length > 0) {
        violations.push({ file: relPath, matches });
      }
    }

    if (violations.length > 0) {
      console.log(
        `Known English fallback strings found on audited high-traffic surfaces:\n` +
          violations
            .map((v) => `  ${v.file}: ${v.matches.join(", ")}`)
            .join("\n")
      );
    }

    expect(violations).toEqual([]);
  });

  it("should keep the Spanish tree-detail alternate-language label localized", () => {
    const esMessagesPath = path.join(ROOT, "messages/es.json");
    const esMessages = JSON.parse(fs.readFileSync(esMessagesPath, "utf-8")) as {
      treeDetail?: { otherLanguage?: string };
    };

    expect(esMessages.treeDetail?.otherLanguage).toBe("Inglés");
  });

  it("should provide localized education CTA labels for both locales", () => {
    const enMessagesPath = path.join(ROOT, "messages/en.json");
    const esMessagesPath = path.join(ROOT, "messages/es.json");
    const enMessages = JSON.parse(fs.readFileSync(enMessagesPath, "utf-8")) as {
      education?: {
        tips?: {
          explore?: { action?: string };
          identify?: { action?: string };
          compare?: { action?: string };
        };
      };
    };
    const esMessages = JSON.parse(fs.readFileSync(esMessagesPath, "utf-8")) as {
      education?: {
        tips?: {
          explore?: { action?: string };
          identify?: { action?: string };
          compare?: { action?: string };
        };
      };
    };

    expect(enMessages.education?.tips?.explore?.action).toBe("Browse Trees");
    expect(enMessages.education?.tips?.identify?.action).toBe(
      "Try Identification"
    );
    expect(enMessages.education?.tips?.compare?.action).toBe("Compare Trees");

    expect(esMessages.education?.tips?.explore?.action).toBe(
      "Explorar Árboles"
    );
    expect(esMessages.education?.tips?.identify?.action).toBe(
      "Probar Identificación"
    );
    expect(esMessages.education?.tips?.compare?.action).toBe(
      "Comparar Árboles"
    );
  });

  it("should provide localized oral-history not-found metadata for both locales", () => {
    const enMessagesPath = path.join(ROOT, "messages/en.json");
    const esMessagesPath = path.join(ROOT, "messages/es.json");
    const enMessages = JSON.parse(fs.readFileSync(enMessagesPath, "utf-8")) as {
      oralHistories?: { notFoundTitle?: string };
    };
    const esMessages = JSON.parse(fs.readFileSync(esMessagesPath, "utf-8")) as {
      oralHistories?: { notFoundTitle?: string };
    };

    expect(enMessages.oralHistories?.notFoundTitle).toBe(
      "Oral History Not Found"
    );
    expect(esMessages.oralHistories?.notFoundTitle).toBe(
      "Historia Oral No Encontrada"
    );
  });

  it("should provide localized interactive comparison helper copy for both locales", () => {
    const enMessagesPath = path.join(ROOT, "messages/en.json");
    const esMessagesPath = path.join(ROOT, "messages/es.json");
    const enMessages = JSON.parse(fs.readFileSync(enMessagesPath, "utf-8")) as {
      comparison?: {
        clearAll?: string;
        maxTreesReached?: string;
        removeSelectedTree?: string;
        moreUses?: string;
      };
    };
    const esMessages = JSON.parse(fs.readFileSync(esMessagesPath, "utf-8")) as {
      comparison?: {
        clearAll?: string;
        maxTreesReached?: string;
        removeSelectedTree?: string;
        moreUses?: string;
      };
    };

    expect(enMessages.comparison?.clearAll).toBe("Clear all");
    expect(enMessages.comparison?.maxTreesReached).toBe(
      "Maximum {count} trees"
    );
    expect(enMessages.comparison?.removeSelectedTree).toBe(
      "Remove {treeTitle}"
    );
    expect(enMessages.comparison?.moreUses).toBe("+{count} more");

    expect(esMessages.comparison?.clearAll).toBe("Limpiar todo");
    expect(esMessages.comparison?.maxTreesReached).toBe(
      "Máximo {count} árboles"
    );
    expect(esMessages.comparison?.removeSelectedTree).toBe(
      "Eliminar {treeTitle}"
    );
    expect(esMessages.comparison?.moreUses).toBe("+{count} más");
  });

  it("should keep public social-image alt text bilingual instead of English-only", () => {
    const socialAltExpectations: Array<{
      file: string;
      spanishFragment: string;
    }> = [
      {
        file: "src/app/[locale]/trees/opengraph-image.tsx",
        spanishFragment: "Directorio de árboles de Costa Rica",
      },
      {
        file: "src/app/[locale]/trees/[slug]/opengraph-image.tsx",
        spanishFragment: "Imagen del perfil del árbol",
      },
      {
        file: "src/app/[locale]/trees/[slug]/twitter-image.tsx",
        spanishFragment: "Imagen del perfil del árbol",
      },
      {
        file: "src/app/[locale]/glossary/opengraph-image.tsx",
        spanishFragment: "Glosario botánico de Costa Rica",
      },
      {
        file: "src/app/[locale]/education/opengraph-image.tsx",
        spanishFragment: "Recursos educativos sobre árboles de Costa Rica",
      },
      {
        file: "src/app/[locale]/compare/opengraph-image.tsx",
        spanishFragment: "Guías de comparación de árboles de Costa Rica",
      },
      {
        file: "src/app/[locale]/compare/[slug]/opengraph-image.tsx",
        spanishFragment: "Guía de comparación de especies",
      },
      {
        file: "src/app/[locale]/compare/[slug]/twitter-image.tsx",
        spanishFragment: "Guía de comparación de especies",
      },
    ];

    const violations: string[] = [];

    for (const { file, spanishFragment } of socialAltExpectations) {
      const content = fs.readFileSync(path.join(ROOT, file), "utf-8");
      const altMatch = content.match(
        /export const alt =\s*"([^"]+)"|export const alt =\s*\n\s*"([^"]+)"/
      );
      const altText = altMatch?.[1] ?? altMatch?.[2] ?? "";

      if (!altText.includes(spanishFragment) || !altText.includes(" / ")) {
        violations.push(`${file}: ${altText || "<missing alt export>"}`);
      }
    }

    if (violations.length > 0) {
      console.log(
        `Public social image alt exports should stay bilingual:\n` +
          violations.map((entry) => `  - ${entry}`).join("\n")
      );
    }

    expect(violations).toEqual([]);
  });

  it("should not reintroduce English-only dynamic aria labels in MDX glossary and lightbox components", () => {
    const componentChecks = [
      {
        file: "src/components/mdx/client/GlossaryTooltip.tsx",
        forbiddenPatterns: [/Definition of \$\{term\}/],
        requiredPatterns: [
          /useTranslations\("glossary"\)/,
          /t\("definitionOf",\s*\{\s*term\s*\}\)/,
        ],
      },
      {
        file: "src/components/mdx/client/SideBySideImages.tsx",
        forbiddenPatterns: [/Image lightbox:/, /\?\?\s*"Image"/],
        requiredPatterns: [
          /t\("ariaImageLightboxWithLabel"/,
          /t\("ariaImageFallbackLabel"\)/,
        ],
      },
    ];

    const violations: string[] = [];

    for (const {
      file,
      forbiddenPatterns,
      requiredPatterns,
    } of componentChecks) {
      const content = fs.readFileSync(path.join(ROOT, file), "utf-8");

      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push(`${file}: matched forbidden pattern ${pattern}`);
        }
      }

      for (const pattern of requiredPatterns) {
        if (!pattern.test(content)) {
          violations.push(`${file}: missing required pattern ${pattern}`);
        }
      }
    }

    if (violations.length > 0) {
      console.log(
        `MDX client components should keep translated dynamic aria labels:\n` +
          violations.map((entry) => `  - ${entry}`).join("\n")
      );
    }

    expect(violations).toEqual([]);
  });

  it("should keep education progress labels and classroom demo fallbacks localized", () => {
    const componentChecks = [
      {
        file: "src/app/[locale]/education/map-game/MapGameClient.tsx",
        forbiddenPatterns: [/label="Quiz progress"/],
        requiredPatterns: [/label=\{t\("quizProgress"\)\}/],
      },
      {
        file: "src/app/[locale]/education/scavenger-hunt/HuntView.tsx",
        forbiddenPatterns: [/label="Hunt progress"/],
        requiredPatterns: [/label=\{t\.huntProgressLabel\}/],
      },
      {
        file: "src/app/[locale]/education/lessons/biodiversity-intro/BiodiversityLessonClient.tsx",
        forbiddenPatterns: [/label="Step progress"/],
        requiredPatterns: [/label=\{t\.stepProgressLabel\}/],
      },
      {
        file: "src/app/[locale]/education/lessons/conservation/ConservationLessonClient.tsx",
        forbiddenPatterns: [/label="Step progress"/],
        requiredPatterns: [/label=\{t\.stepProgressLabel\}/],
      },
      {
        file: "src/app/[locale]/education/lessons/ecosystem-services/EcosystemServicesClient.tsx",
        forbiddenPatterns: [/label="Step progress"/],
        requiredPatterns: [/label=\{t\.stepProgressLabel\}/],
      },
      {
        file: "src/app/[locale]/education/lessons/tree-identification/TreeIdentificationClient.tsx",
        forbiddenPatterns: [
          /label="Trees learned progress"/,
          /alt="Mystery tree"/,
        ],
        requiredPatterns: [
          /label=\{t\.treesLearnedProgressLabel\}/,
          /alt=\{t\.mysteryTreeAlt\}/,
        ],
      },
      {
        file: "src/app/[locale]/education/classroom/ClassroomClient.tsx",
        forbiddenPatterns: [/`Classroom \$\{/, /teacherName:\s*"Teacher"/],
        requiredPatterns: [
          /name:\s*t\("autoGeneratedClassroomName",/,
          /teacherName:\s*t\("defaultTeacherName"\)/,
        ],
      },
      {
        file: "src/components/EducationProgress.tsx",
        forbiddenPatterns: [/\(\{lessonProgress\.totalPoints\} pts\)/],
        requiredPatterns: [
          /\(\{lessonProgress\.totalPoints\} \{t\("pointsUnit"\)\}\)/,
        ],
      },
    ];

    const violations: string[] = [];

    for (const {
      file,
      forbiddenPatterns,
      requiredPatterns,
    } of componentChecks) {
      const content = fs.readFileSync(path.join(ROOT, file), "utf-8");

      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push(`${file}: matched forbidden pattern ${pattern}`);
        }
      }

      for (const pattern of requiredPatterns) {
        if (!pattern.test(content)) {
          violations.push(`${file}: missing required pattern ${pattern}`);
        }
      }
    }

    const enMessagesPath = path.join(ROOT, "messages/en.json");
    const esMessagesPath = path.join(ROOT, "messages/es.json");
    const enMessages = JSON.parse(fs.readFileSync(enMessagesPath, "utf-8")) as {
      mapGame?: { quizProgress?: string };
      classroom?: {
        autoGeneratedClassroomName?: string;
        defaultTeacherName?: string;
      };
      educationProgress?: { pointsUnit?: string };
    };
    const esMessages = JSON.parse(fs.readFileSync(esMessagesPath, "utf-8")) as {
      mapGame?: { quizProgress?: string };
      classroom?: {
        autoGeneratedClassroomName?: string;
        defaultTeacherName?: string;
      };
      educationProgress?: { pointsUnit?: string };
    };

    expect(enMessages.mapGame?.quizProgress).toBe("Quiz progress");
    expect(esMessages.mapGame?.quizProgress).toBe("Progreso del cuestionario");
    expect(enMessages.classroom?.autoGeneratedClassroomName).toBe(
      "Classroom {code}"
    );
    expect(esMessages.classroom?.autoGeneratedClassroomName).toBe(
      "Aula {code}"
    );
    expect(enMessages.classroom?.defaultTeacherName).toBe("Teacher");
    expect(esMessages.classroom?.defaultTeacherName).toBe("Profesor");
    expect(enMessages.educationProgress?.pointsUnit).toBe("points");
    expect(esMessages.educationProgress?.pointsUnit).toBe("puntos");

    if (violations.length > 0) {
      console.log(
        `Education surfaces should keep localized progress labels and demo fallbacks:\n` +
          violations.map((entry) => `  - ${entry}`).join("\n")
      );
    }

    expect(violations).toEqual([]);
  });

  it("should keep share menus localized across tree and collection surfaces", () => {
    const componentChecks = [
      {
        file: "src/components/ShareButton.tsx",
        forbiddenPatterns: [
          /<span>X \(Twitter\)<\/span>/,
          /<span>Facebook<\/span>/,
          /<span>WhatsApp<\/span>/,
          /<span>LinkedIn<\/span>/,
        ],
        requiredPatterns: [
          /useTranslations\("share"\)/,
          /t\("discoverTree",\s*\{\s*treeName:/,
          /t\("failedToCopy"\)/,
          /t\("shareOnX"\)/,
          /t\("shareOnFacebook"\)/,
          /t\("shareOnWhatsApp"\)/,
          /t\("shareOnLinkedIn"\)/,
        ],
      },
      {
        file: "src/components/ShareCollectionButton.tsx",
        forbiddenPatterns: [
          /\{labels\.shareOn\} X\/Twitter/,
          /\{labels\.shareOn\} Facebook/,
          /\{labels\.shareOn\} WhatsApp/,
          /\{labels\.shareOn\} Pinterest/,
          /\{labels\.share\}\.\.\./,
        ],
        requiredPatterns: [
          /useTranslations\("share"\)/,
          /t\("shareNative"\)/,
          /t\("shareOnX"\)/,
          /t\("shareOnFacebook"\)/,
          /t\("shareOnWhatsApp"\)/,
          /t\("shareOnPinterest"\)/,
        ],
      },
    ];

    const violations: string[] = [];

    for (const {
      file,
      forbiddenPatterns,
      requiredPatterns,
    } of componentChecks) {
      const content = fs.readFileSync(path.join(ROOT, file), "utf-8");

      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push(`${file}: matched forbidden pattern ${pattern}`);
        }
      }

      for (const pattern of requiredPatterns) {
        if (!pattern.test(content)) {
          violations.push(`${file}: missing required pattern ${pattern}`);
        }
      }
    }

    const enMessages = JSON.parse(
      fs.readFileSync(path.join(ROOT, "messages/en.json"), "utf-8")
    ) as {
      share?: {
        shareNative?: string;
        shareOnX?: string;
        shareOnFacebook?: string;
        shareOnWhatsApp?: string;
        shareOnLinkedIn?: string;
        shareOnPinterest?: string;
      };
    };
    const esMessages = JSON.parse(
      fs.readFileSync(path.join(ROOT, "messages/es.json"), "utf-8")
    ) as {
      share?: {
        shareNative?: string;
        shareOnX?: string;
        shareOnFacebook?: string;
        shareOnWhatsApp?: string;
        shareOnLinkedIn?: string;
        shareOnPinterest?: string;
      };
    };

    expect(enMessages.share?.shareNative).toBe("Share...");
    expect(esMessages.share?.shareNative).toBe("Compartir...");
    expect(enMessages.share?.shareOnX).toBe("Share on X / Twitter");
    expect(esMessages.share?.shareOnX).toBe("Compartir en X / Twitter");
    expect(enMessages.share?.shareOnFacebook).toBe("Share on Facebook");
    expect(esMessages.share?.shareOnFacebook).toBe("Compartir en Facebook");
    expect(enMessages.share?.shareOnWhatsApp).toBe("Share on WhatsApp");
    expect(esMessages.share?.shareOnWhatsApp).toBe("Compartir en WhatsApp");
    expect(enMessages.share?.shareOnLinkedIn).toBe("Share on LinkedIn");
    expect(esMessages.share?.shareOnLinkedIn).toBe("Compartir en LinkedIn");
    expect(enMessages.share?.shareOnPinterest).toBe("Share on Pinterest");
    expect(esMessages.share?.shareOnPinterest).toBe("Compartir en Pinterest");

    if (violations.length > 0) {
      console.log(
        `Share surfaces should keep localized menu labels:\n` +
          violations.map((entry) => `  - ${entry}`).join("\n")
      );
    }

    expect(violations).toEqual([]);
  });

  it("should keep homepage and seasonal current-month matching locale-safe", () => {
    const filesToCheck = [
      "src/app/[locale]/page.tsx",
      "src/app/[locale]/seasonal/page.tsx",
    ];

    const violations: string[] = [];

    for (const file of filesToCheck) {
      const content = fs.readFileSync(path.join(ROOT, file), "utf-8");

      if (
        /DateTimeFormat\("en-US"/.test(content) ||
        /toLocaleString\("en"/.test(content)
      ) {
        violations.push(`${file}: matched hardcoded English month formatter`);
      }

      if (!/getCurrentMonthInCostaRica\(/.test(content)) {
        violations.push(
          `${file}: missing getCurrentMonthInCostaRica helper usage`
        );
      }

      if (!/seasonIncludesMonth\(/.test(content)) {
        violations.push(`${file}: missing seasonIncludesMonth helper usage`);
      }
    }

    const i18nContent = fs.readFileSync(
      path.join(ROOT, "src/lib/i18n/translations.ts"),
      "utf-8"
    );

    for (const pattern of [
      /export function normalizeSeasonMonthValue/,
      /case "enero":/,
      /case "todo-el-ano":/,
      /export function getCurrentMonthInCostaRica/,
      /timeZone: "America\/Costa_Rica"/,
      /export function seasonIncludesMonth/,
    ]) {
      if (!pattern.test(i18nContent)) {
        violations.push(
          `src/lib/i18n/translations.ts: missing required pattern ${pattern}`
        );
      }
    }

    if (violations.length > 0) {
      console.log(
        `Seasonal current-month matching should stay locale-safe:\n` +
          violations.map((entry) => `  - ${entry}`).join("\n")
      );
    }

    expect(violations).toEqual([]);
  });

  it("should keep shared error and loading fallbacks localized", () => {
    const componentChecks = [
      {
        file: "src/components/LoadingFallback.tsx",
        forbiddenPatterns: [/message = "Loading\.\.\."/],
        requiredPatterns: [
          /useTranslations\("loading"\)/,
          /message \?\? t\("message"\)/,
        ],
      },
      {
        file: "src/app/[locale]/loading.tsx",
        forbiddenPatterns: [/>Loading</],
        requiredPatterns: [
          /useTranslations\("loading"\)/,
          /\{t\("message"\)\}/,
        ],
      },
      {
        file: "src/components/ComponentErrorBoundary.tsx",
        forbiddenPatterns: [
          /\{componentName\} Error/,
          /This component encountered an error/,
          />\s*Retry\s*</,
        ],
        requiredPatterns: [
          /useTranslations\("error"\)/,
          /t\("componentErrorTitle"\)/,
          /t\("componentErrorDescription"\)/,
          /t\("tryAgain"\)/,
          /t\("developmentDetails"\)/,
        ],
      },
      {
        file: "src/components/PageErrorBoundary.tsx",
        forbiddenPatterns: [
          /text-sm text-muted-foreground mb-6 font-mono bg-muted p-4 rounded/,
          />\s*Error Details \(Development Only\)\s*</,
        ],
        requiredPatterns: [
          /t\("pageErrorDescription"\)/,
          /t\("developmentDetails"\)/,
          /error\.stack \?\? error\.message/,
        ],
      },
      {
        file: "src/components/ServerMDXContent.tsx",
        forbiddenPatterns: [
          /Content Rendering Error/,
          /We encountered an issue while rendering this content\./,
          /Technical Details \(Development Only\)/,
        ],
        requiredPatterns: [
          /getTranslations\(\{\s*locale: resolvedLocale,\s*namespace: "error"/,
          /title=\{tError\("contentRenderingErrorTitle"\)\}/,
          /description=\{tError\("contentRenderingErrorDescription"\)\}/,
          /developmentDetails=\{tError\("developmentDetails"\)\}/,
        ],
      },
      {
        file: "src/app/global-error.tsx",
        forbiddenPatterns: [],
        requiredPatterns: [
          /const GLOBAL_ERROR_COPY:/,
          /pathname\.startsWith\("\/es"\)/,
          /const homeHref = `\/\$\{locale\}`/,
          /window\.location\.href = homeHref/,
          /\{copy\.title\}/,
          /\{copy\.description\}/,
        ],
      },
      {
        file: "src/app/[locale]/error.tsx",
        forbiddenPatterns: [/<strong>Error:<\/strong>/],
        requiredPatterns: [
          /useTranslations\("error"\)/,
          /<strong>\{t\("pageError"\)\}:<\/strong>/,
        ],
      },
    ];

    const violations: string[] = [];

    for (const {
      file,
      forbiddenPatterns,
      requiredPatterns,
    } of componentChecks) {
      const content = fs.readFileSync(path.join(ROOT, file), "utf-8");

      for (const pattern of forbiddenPatterns) {
        if (pattern.test(content)) {
          violations.push(`${file}: matched forbidden pattern ${pattern}`);
        }
      }

      for (const pattern of requiredPatterns) {
        if (!pattern.test(content)) {
          violations.push(`${file}: missing required pattern ${pattern}`);
        }
      }
    }

    const localeLayout = fs.readFileSync(
      path.join(ROOT, "src/app/[locale]/layout.tsx"),
      "utf-8"
    );

    if (!/"loading"/.test(localeLayout)) {
      violations.push(
        "src/app/[locale]/layout.tsx: missing loading namespace in client provider allowlist"
      );
    }

    const enMessages = JSON.parse(
      fs.readFileSync(path.join(ROOT, "messages/en.json"), "utf-8")
    ) as {
      error?: {
        componentErrorTitle?: string;
        componentErrorDescription?: string;
        contentRenderingErrorTitle?: string;
        contentRenderingErrorDescription?: string;
        developmentDetails?: string;
      };
      loading?: { message?: string };
    };
    const esMessages = JSON.parse(
      fs.readFileSync(path.join(ROOT, "messages/es.json"), "utf-8")
    ) as {
      error?: {
        componentErrorTitle?: string;
        componentErrorDescription?: string;
        contentRenderingErrorTitle?: string;
        contentRenderingErrorDescription?: string;
        developmentDetails?: string;
      };
      loading?: { message?: string };
    };

    expect(enMessages.error?.componentErrorTitle).toBe(
      "This section couldn't load"
    );
    expect(esMessages.error?.componentErrorTitle).toBe(
      "No se pudo cargar esta sección"
    );
    expect(enMessages.error?.componentErrorDescription).toBe(
      "We ran into a problem loading this part of the page."
    );
    expect(esMessages.error?.componentErrorDescription).toBe(
      "Tuvimos un problema al cargar esta parte de la página."
    );
    expect(enMessages.error?.contentRenderingErrorTitle).toBe(
      "Content rendering error"
    );
    expect(esMessages.error?.contentRenderingErrorTitle).toBe(
      "Error al mostrar el contenido"
    );
    expect(enMessages.error?.contentRenderingErrorDescription).toBe(
      "We ran into a problem rendering this content. Please refresh the page."
    );
    expect(esMessages.error?.contentRenderingErrorDescription).toBe(
      "Tuvimos un problema al mostrar este contenido. Por favor recarga la página."
    );
    expect(enMessages.error?.developmentDetails).toBe(
      "Technical details (development only)"
    );
    expect(esMessages.error?.developmentDetails).toBe(
      "Detalles técnicos (solo en desarrollo)"
    );
    expect(enMessages.loading?.message).toBe("Loading...");
    expect(esMessages.loading?.message).toBe("Cargando...");

    if (violations.length > 0) {
      console.log(
        `Shared error and loading fallbacks should stay localized:\n` +
          violations.map((entry) => `  - ${entry}`).join("\n")
      );
    }

    expect(violations).toEqual([]);
  });

  it("should keep the wizard progress bar localized", () => {
    const wizardClient = fs.readFileSync(
      path.join(ROOT, "src/app/[locale]/wizard/WizardClient.tsx"),
      "utf-8"
    );

    const violations: string[] = [];

    if (/label="Wizard progress"/.test(wizardClient)) {
      violations.push(
        "src/app/[locale]/wizard/WizardClient.tsx: matched forbidden hardcoded progress label"
      );
    }

    for (const pattern of [
      /useTranslations\("wizard"\)/,
      /label=\{t\("progressBarLabel"\)\}/,
    ]) {
      if (!pattern.test(wizardClient)) {
        violations.push(
          `src/app/[locale]/wizard/WizardClient.tsx: missing required pattern ${pattern}`
        );
      }
    }

    const enMessages = JSON.parse(
      fs.readFileSync(path.join(ROOT, "messages/en.json"), "utf-8")
    ) as {
      wizard?: { progressBarLabel?: string };
    };
    const esMessages = JSON.parse(
      fs.readFileSync(path.join(ROOT, "messages/es.json"), "utf-8")
    ) as {
      wizard?: { progressBarLabel?: string };
    };

    expect(enMessages.wizard?.progressBarLabel).toBe("Wizard progress");
    expect(esMessages.wizard?.progressBarLabel).toBe("Progreso del asistente");

    if (violations.length > 0) {
      console.log(
        `Wizard progress surfaces should stay localized:\n` +
          violations.map((entry) => `  - ${entry}`).join("\n")
      );
    }

    expect(violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 14. Conservation lesson status normalization
// ---------------------------------------------------------------------------

describe("Conservation lesson status normalization", () => {
  const conservationLessonPage = path.join(
    ROOT,
    "src/app/[locale]/education/lessons/conservation/page.tsx"
  );
  const conservationLessonData = path.join(
    ROOT,
    "src/app/[locale]/education/lessons/conservation/conservation-data.ts"
  );

  it("should count conservation statuses using IUCN codes from content data", () => {
    const content = fs.readFileSync(conservationLessonPage, "utf-8");

    expect(content).toContain('tree.conservationStatus || "NE"');
    expect(content).toContain('["CR", "EN", "VU"]');
    expect(content).not.toContain('"Not Evaluated"');
    expect(content).not.toContain('"Critically Endangered"');
  });

  it("should map lesson status legend entries to IUCN codes", () => {
    const content = fs.readFileSync(conservationLessonData, "utf-8");

    for (const statusKey of [
      'key: "CR"',
      'key: "EN"',
      'key: "VU"',
      'key: "NT"',
      'key: "LC"',
    ]) {
      expect(content).toContain(statusKey);
    }
  });
});

// ---------------------------------------------------------------------------
// 15. Console-cleanliness: no stray console.log in page/component source
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

    expect(violators).toEqual([]);
  });
});
