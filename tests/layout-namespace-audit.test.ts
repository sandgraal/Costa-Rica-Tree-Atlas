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
  // Find all useTranslations("namespace") calls in src/ using a pure-Node directory walk
  const srcRoot = path.join(ROOT, "src");
  const namespaces = new Set<string>();

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === "node_modules") {
          continue;
        }
        walk(entryPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const isTsFile = entry.name.endsWith(".ts") || entry.name.endsWith(".tsx");
      const isTestFile = entry.name.includes(".test.");
      if (!isTsFile || isTestFile) {
        continue;
      }

      const content = fs.readFileSync(entryPath, "utf-8");
      const regex = /useTranslations\("([^"]+)"\)/g;
      let match: RegExpExecArray | null;
      // Collect all occurrences in the file
      // eslint-disable-next-line no-cond-assign
      while ((match = regex.exec(content)) !== null) {
        const topLevel = match[1].split(".")[0];
        namespaces.add(topLevel);
      }
    }
  }

  if (fs.existsSync(srcRoot)) {
    walk(srcRoot);
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
