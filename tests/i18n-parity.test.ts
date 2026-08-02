/**
 * i18n Parity Tests
 *
 * Validates that translation files (en.json and es.json) have matching
 * key structures. Missing keys cause MISSING_MESSAGE runtime errors
 * during static page generation.
 */

import { describe, it, expect } from "vitest";
import en from "../messages/en.json";
import es from "../messages/es.json";

type MessageTree = { [key: string]: string | MessageTree };

/**
 * Recursively collect all dot-notation keys from a translation object.
 */
function collectKeys(obj: MessageTree, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (typeof value === "object" && value !== null) {
      keys.push(...collectKeys(value as MessageTree, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n Translation Parity", () => {
  const enKeys = new Set(collectKeys(en as unknown as MessageTree));
  const esKeys = new Set(collectKeys(es as unknown as MessageTree));

  it("should have keys in es.json for every key in en.json", () => {
    const missingInEs = [...enKeys].filter((k) => !esKeys.has(k));
    if (missingInEs.length > 0) {
      console.log(
        `Keys in en.json missing from es.json (${missingInEs.length}):\n` +
          missingInEs.map((k) => `  - ${k}`).join("\n")
      );
    }
    expect(missingInEs).toEqual([]);
  });

  it("should have keys in en.json for every key in es.json", () => {
    const missingInEn = [...esKeys].filter((k) => !enKeys.has(k));
    if (missingInEn.length > 0) {
      console.log(
        `Keys in es.json missing from en.json (${missingInEn.length}):\n` +
          missingInEn.map((k) => `  - ${k}`).join("\n")
      );
    }
    expect(missingInEn).toEqual([]);
  });

  it("should have the same top-level namespaces in both locales", () => {
    const enNamespaces = Object.keys(en).sort();
    const esNamespaces = Object.keys(es).sort();
    expect(enNamespaces).toEqual(esNamespaces);
  });

  it("should not have empty string values", () => {
    const emptyEn = [...enKeys].filter((k) => {
      const parts = k.split(".");
      let current: MessageTree | string = en as unknown as MessageTree;
      for (const part of parts) {
        if (typeof current === "object" && current !== null) {
          current = current[part] as MessageTree | string;
        }
      }
      return current === "";
    });

    const emptyEs = [...esKeys].filter((k) => {
      const parts = k.split(".");
      let current: MessageTree | string = es as unknown as MessageTree;
      for (const part of parts) {
        if (typeof current === "object" && current !== null) {
          current = current[part] as MessageTree | string;
        }
      }
      return current === "";
    });

    const allEmpty = [
      ...emptyEn.map((k) => `en: ${k}`),
      ...emptyEs.map((k) => `es: ${k}`),
    ];

    if (allEmpty.length > 0) {
      console.log(
        `Empty translation values (${allEmpty.length}):\n` +
          allEmpty.map((k) => `  - ${k}`).join("\n")
      );
    }
    expect(allEmpty).toEqual([]);
  });
});

/**
 * Literal dotted keys are unresolvable at runtime.
 *
 * next-intl resolves `t("seasonal.monthShort.january")` by walking the object
 * path: `seasonal` -> `monthShort` -> `january`. A key literally NAMED
 * "monthShort.january" is never found by that walk, so the call throws
 * MISSING_MESSAGE even though the translation is sitting right there.
 *
 * This shipped: every Spanish month in `seasonal` was stored flat, and
 * /es/seasonal threw 13 MISSING_MESSAGE errors per render in production.
 *
 * The parity test above could not catch it — it flattens nested objects to
 * dotted paths for comparison, which makes a literal "monthShort.january" key
 * and a nested { monthShort: { january } } look identical. Hence this separate
 * structural check.
 */
describe("message key structure", () => {
  const locales = ["en", "es"] as const;

  function findDottedKeys(
    node: unknown,
    trail: string[] = [],
    found: string[] = []
  ): string[] {
    if (typeof node !== "object" || node === null) return found;
    for (const [key, value] of Object.entries(node)) {
      if (key.includes(".")) found.push([...trail, key].join(" > "));
      findDottedKeys(value, [...trail, key], found);
    }
    return found;
  }

  it.each(locales)(
    "%s.json has no literal dotted keys (next-intl cannot resolve them)",
    (locale) => {
      const messages = locale === "en" ? en : es;
      expect(findDottedKeys(messages)).toEqual([]);
    }
  );
});
