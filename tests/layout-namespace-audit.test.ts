/**
 * Layout Namespace Audit Tests
 *
 * Validates that CLIENT_NAMESPACES in the root layout covers all
 * useTranslations() calls in source files. Missing namespaces cause
 * MISSING_MESSAGE errors because the client provider doesn't ship those keys.
 *
 * This is a static analysis test that scans source files.
 */

import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

function extractClientNamespaces(): string[] {
  const layoutPath = path.join(ROOT, "src/app/[locale]/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");

  // Extract the CLIENT_NAMESPACES array entries
  const match = content.match(
    /const CLIENT_NAMESPACES\s*=\s*\[([\s\S]*?)\]\s*as\s*const/
  );
  if (!match) return [];

  const entries = match[1].match(/"([^"]+)"/g);
  return entries ? entries.map((e) => e.replace(/"/g, "")) : [];
}

function extractUseTranslationsNamespaces(): string[] {
  // Find all useTranslations("namespace") calls in src/
  const result = execSync(
    `grep -rn 'useTranslations(' "${ROOT}/src/" --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".test."`,
    { encoding: "utf-8" }
  );

  const namespaces = new Set<string>();
  for (const line of result.split("\n")) {
    const match = line.match(/useTranslations\("([^"]+)"\)/);
    if (match) {
      // Get the top-level namespace (before any dot)
      const topLevel = match[1].split(".")[0];
      namespaces.add(topLevel);
    }
  }
  return [...namespaces].sort();
}

describe("Layout CLIENT_NAMESPACES Audit", () => {
  const clientNamespaces = new Set(extractClientNamespaces());
  const usedNamespaces = extractUseTranslationsNamespaces();

  it("should include all useTranslations namespaces in CLIENT_NAMESPACES", () => {
    const missing = usedNamespaces.filter((ns) => !clientNamespaces.has(ns));
    if (missing.length > 0) {
      console.log(
        `Namespaces used by useTranslations() but missing from CLIENT_NAMESPACES:\n` +
          missing.map((ns) => `  - "${ns}"`).join("\n")
      );
    }
    expect(missing).toEqual([]);
  });
});
