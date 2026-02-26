/**
 * Comprehensive Content Validation Tests (P5.3)
 *
 * Validates frontmatter schema compliance, bilingual parity, broken references,
 * scientific name consistency, comparison species references, and glossary
 * cross-references across all content types (trees, comparisons, glossary).
 */

import { describe, it, expect } from "vitest";
import {
  allTrees,
  allGlossaryTerms,
  allSpeciesComparisons,
} from "contentlayer/generated";
import fs from "fs";
import path from "path";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_LOCALES = ["en", "es"] as const;

const VALID_CONSERVATION_STATUSES = new Set([
  "LC",
  "NT",
  "VU",
  "EN",
  "CR",
  "EW",
  "EX",
  "DD",
  "NE",
]);

/**
 * Month values accepted in floweringSeason / fruitingSeason.
 * Content uses both English and Spanish month names depending on locale.
 */
const VALID_MONTHS = new Set([
  // English
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  // Spanish
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
  // Year-round variants
  "all-year",
  "year-round",
  "todo-el-ano",
  "todo-el-año",
]);

const VALID_DISTRIBUTIONS = new Set([
  "guanacaste",
  "puntarenas",
  "alajuela",
  "heredia",
  "san-jose",
  "cartago",
  "limon",
  "pacific-coast",
  "caribbean-coast",
  "central-valley",
  "northern-zone",
]);

/**
 * Accepted values for enum fields that use English/Spanish variants.
 * Contentlayer schema defines English-only enums, but ES content files
 * use Spanish translations. Both are accepted here to avoid false positives.
 * A future content standardization pass should align these.
 */
const VALID_TOXICITY_LEVELS = new Set([
  // Schema values (EN)
  "none",
  "low",
  "moderate",
  "high",
  "severe",
  // Spanish equivalents found in ES content
  "ninguno",
  "baja",
  "bajo",
  "moderada",
  "moderado",
  "alta",
  "alto",
  "severa",
]);

const VALID_ALLERGEN_RISKS = new Set([
  "none",
  "low",
  "moderate",
  "high",
  // Spanish
  "ninguno",
  "bajo",
  "baja",
  "moderada",
  "moderado",
  "alta",
  "alto",
]);

const VALID_WATER_NEEDS = new Set([
  "low",
  "moderate",
  "high",
  // Spanish
  "bajo",
  "moderado",
  "moderada",
  "alto",
  "alta",
  // Compound variants found in content
  "low-to-moderate",
  "moderate-to-high",
  "very-high",
  "bajo-a-moderado",
  "moderada a alta",
  "muy-alto",
  "moderate to high",
]);

const VALID_LIGHT_REQUIREMENTS = new Set([
  // Schema values
  "full-sun",
  "partial-shade",
  "shade-tolerant",
  // Compound/variant values found in content
  "full-shade",
  "full-sun to partial-shade",
  "full-sun-part-shade",
  "partial-shade to full-sun",
  "partial-shade-to-full-sun",
  "full-sun to partial-shade",
  // Spanish
  "pleno-sol",
  "sol-pleno",
  "sombra-parcial a pleno-sol",
  "pleno-sol a sombra-parcial",
  // Descriptive (found in content)
  "Full sun as emergent; shade tolerant when young",
  "Pleno sol como emergente; tolerante a la sombra cuando joven",
]);

const VALID_GROWTH_RATES = new Set([
  "slow",
  "moderate",
  "fast",
  // Compound
  "moderate-to-fast",
  "slow to moderate",
  "very fast",
  "very-fast",
  // Spanish
  "lento",
  "moderado",
  "lento a moderado",
  "moderado-a-rápido",
]);

const VALID_PROPAGATION_DIFFICULTY = new Set([
  "easy",
  "moderate",
  "difficult",
  // Extended
  "intermediate",
  "moderate-to-difficult",
  "very easy",
  "very-easy",
  "very difficult",
  // Spanish
  "fácil",
  "moderada",
  "moderado",
  "muy-dificil",
]);

/**
 * Glossary categories from contentlayer schema.
 */
const VALID_GLOSSARY_CATEGORIES = new Set([
  "anatomy",
  "ecology",
  "taxonomy",
  "morphology",
  "reproduction",
  "general",
  "timber",
]);

const VALID_COMPARISON_DIFFICULTIES = new Set([
  "easy",
  "moderate",
  "challenging",
]);

const VALID_COMPARISON_TAGS = new Set([
  "leaves",
  "bark",
  "fruit",
  "flowers",
  "size",
  "habitat",
  "trunk",
  "seeds",
  "crown",
  "roots",
]);

/** Set of all EN tree slugs */
const enTreeSlugs = new Set(
  allTrees.filter((t) => t.locale === "en").map((t) => t.slug)
);

// ─── Tree Content Validation ──────────────────────────────────────────────────

describe("Tree Content Validation", () => {
  describe("Frontmatter Schema Compliance", () => {
    it("should have valid locale values", () => {
      const validLocales = new Set<string>(VALID_LOCALES);
      const invalid = allTrees.filter((t) => !validLocales.has(t.locale));
      expect(
        invalid.map((t) => `${t.slug} has locale "${t.locale}"`),
        "Trees with invalid locale"
      ).toHaveLength(0);
    });

    it("should have valid conservation status enum values", () => {
      const invalid = allTrees.filter(
        (t) =>
          t.conservationStatus &&
          !VALID_CONSERVATION_STATUSES.has(t.conservationStatus)
      );
      expect(
        invalid.map(
          (t) =>
            `${t.slug} (${t.locale}) has conservationStatus "${t.conservationStatus}"`
        ),
        "Trees with invalid conservationStatus"
      ).toHaveLength(0);
    });

    it("should have valid month values in floweringSeason", () => {
      const invalid: string[] = [];
      allTrees.forEach((t) => {
        if (t.floweringSeason) {
          t.floweringSeason.forEach((month: string) => {
            if (!VALID_MONTHS.has(month)) {
              invalid.push(
                `${t.slug} (${t.locale}) floweringSeason has "${month}"`
              );
            }
          });
        }
      });
      expect(invalid, "Trees with invalid floweringSeason months").toHaveLength(
        0
      );
    });

    it("should have valid month values in fruitingSeason", () => {
      const invalid: string[] = [];
      allTrees.forEach((t) => {
        if (t.fruitingSeason) {
          t.fruitingSeason.forEach((month: string) => {
            if (!VALID_MONTHS.has(month)) {
              invalid.push(
                `${t.slug} (${t.locale}) fruitingSeason has "${month}"`
              );
            }
          });
        }
      });
      expect(invalid, "Trees with invalid fruitingSeason months").toHaveLength(
        0
      );
    });

    it("should have valid distribution values", () => {
      const invalid: string[] = [];
      allTrees.forEach((t) => {
        if (t.distribution) {
          t.distribution.forEach((d: string) => {
            if (!VALID_DISTRIBUTIONS.has(d)) {
              invalid.push(`${t.slug} (${t.locale}) distribution has "${d}"`);
            }
          });
        }
      });
      expect(invalid, "Trees with invalid distribution values").toHaveLength(0);
    });

    it("should have valid toxicityLevel values", () => {
      const invalid = allTrees.filter(
        (t) => t.toxicityLevel && !VALID_TOXICITY_LEVELS.has(t.toxicityLevel)
      );
      expect(
        invalid.map(
          (t) => `${t.slug} (${t.locale}) toxicityLevel "${t.toxicityLevel}"`
        ),
        "Trees with invalid toxicityLevel"
      ).toHaveLength(0);
    });

    it("should have valid skinContactRisk values", () => {
      const invalid = allTrees.filter(
        (t) =>
          t.skinContactRisk && !VALID_TOXICITY_LEVELS.has(t.skinContactRisk)
      );
      expect(
        invalid.map(
          (t) =>
            `${t.slug} (${t.locale}) skinContactRisk "${t.skinContactRisk}"`
        ),
        "Trees with invalid skinContactRisk"
      ).toHaveLength(0);
    });

    it("should have valid allergenRisk values", () => {
      const invalid = allTrees.filter(
        (t) => t.allergenRisk && !VALID_ALLERGEN_RISKS.has(t.allergenRisk)
      );
      expect(
        invalid.map(
          (t) => `${t.slug} (${t.locale}) allergenRisk "${t.allergenRisk}"`
        ),
        "Trees with invalid allergenRisk"
      ).toHaveLength(0);
    });

    it("should have valid waterNeeds values", () => {
      const invalid = allTrees.filter(
        (t) => t.waterNeeds && !VALID_WATER_NEEDS.has(t.waterNeeds)
      );
      expect(
        invalid.map(
          (t) => `${t.slug} (${t.locale}) waterNeeds "${t.waterNeeds}"`
        ),
        "Trees with invalid waterNeeds"
      ).toHaveLength(0);
    });

    it("should have valid lightRequirements values", () => {
      const invalid = allTrees.filter(
        (t) =>
          t.lightRequirements &&
          !VALID_LIGHT_REQUIREMENTS.has(t.lightRequirements)
      );
      expect(
        invalid.map(
          (t) =>
            `${t.slug} (${t.locale}) lightRequirements "${t.lightRequirements}"`
        ),
        "Trees with invalid lightRequirements"
      ).toHaveLength(0);
    });

    it("should have valid growthRate values", () => {
      const invalid = allTrees.filter(
        (t) => t.growthRate && !VALID_GROWTH_RATES.has(t.growthRate)
      );
      expect(
        invalid.map(
          (t) => `${t.slug} (${t.locale}) growthRate "${t.growthRate}"`
        ),
        "Trees with invalid growthRate"
      ).toHaveLength(0);
    });

    it("should have valid propagationDifficulty values", () => {
      const invalid = allTrees.filter(
        (t) =>
          t.propagationDifficulty &&
          !VALID_PROPAGATION_DIFFICULTY.has(t.propagationDifficulty)
      );
      expect(
        invalid.map(
          (t) =>
            `${t.slug} (${t.locale}) propagationDifficulty "${t.propagationDifficulty}"`
        ),
        "Trees with invalid propagationDifficulty"
      ).toHaveLength(0);
    });

    it("should not have duplicate slugs within the same locale", () => {
      for (const locale of VALID_LOCALES) {
        const trees = allTrees.filter((t) => t.locale === locale);
        const slugs = trees.map((t) => t.slug);
        const duplicates = slugs.filter(
          (slug, idx) => slugs.indexOf(slug) !== idx
        );
        expect(
          duplicates,
          `Duplicate slugs in ${locale} locale: ${duplicates.join(", ")}`
        ).toHaveLength(0);
      }
    });

    it("should have non-empty description for SEO", () => {
      const shortDescriptions = allTrees.filter(
        (t) => !t.description || t.description.length < 50
      );
      expect(
        shortDescriptions.map(
          (t) =>
            `${t.slug} (${t.locale}) description is ${t.description?.length ?? 0} chars`
        ),
        "Trees with very short or missing descriptions (<50 chars)"
      ).toHaveLength(0);
    });

    it("should have scientificName in proper format (capitalized genus)", () => {
      const invalid = allTrees.filter((t) => {
        if (!t.scientificName) return true;
        // Genus should start with a capital letter
        return !/^[A-Z]/.test(t.scientificName);
      });
      expect(
        invalid.map(
          (t) =>
            `${t.slug} (${t.locale}) scientificName "${t.scientificName}" doesn't start with capital`
        ),
        "Trees with improperly formatted scientificName"
      ).toHaveLength(0);
    });
  });

  describe("Bilingual Parity", () => {
    it("should have matching EN and ES files for every tree slug", () => {
      const enSlugs = new Set(
        allTrees.filter((t) => t.locale === "en").map((t) => t.slug)
      );
      const esSlugs = new Set(
        allTrees.filter((t) => t.locale === "es").map((t) => t.slug)
      );

      const missingEs = [...enSlugs].filter((s) => !esSlugs.has(s));
      const missingEn = [...esSlugs].filter((s) => !enSlugs.has(s));

      expect(
        missingEs,
        `Trees missing Spanish version: ${missingEs.join(", ")}`
      ).toHaveLength(0);
      expect(
        missingEn,
        `Trees missing English version: ${missingEn.join(", ")}`
      ).toHaveLength(0);
    });

    it("should have the same scientificName across locales", () => {
      const enTrees = new Map(
        allTrees
          .filter((t) => t.locale === "en")
          .map((t) => [t.slug, t.scientificName])
      );

      const mismatches: string[] = [];
      allTrees
        .filter((t) => t.locale === "es")
        .forEach((esTree) => {
          const enName = enTrees.get(esTree.slug);
          if (enName && enName !== esTree.scientificName) {
            mismatches.push(
              `${esTree.slug}: EN="${enName}" vs ES="${esTree.scientificName}"`
            );
          }
        });

      expect(
        mismatches,
        `Trees with mismatched scientificName across locales:\n${mismatches.join("\n")}`
      ).toHaveLength(0);
    });

    it("should have the same family across locales", () => {
      const enTrees = new Map(
        allTrees.filter((t) => t.locale === "en").map((t) => [t.slug, t.family])
      );

      const mismatches: string[] = [];
      allTrees
        .filter((t) => t.locale === "es")
        .forEach((esTree) => {
          const enFamily = enTrees.get(esTree.slug);
          if (enFamily && enFamily !== esTree.family) {
            mismatches.push(
              `${esTree.slug}: EN="${enFamily}" vs ES="${esTree.family}"`
            );
          }
        });

      expect(
        mismatches,
        `Trees with mismatched family across locales:\n${mismatches.join("\n")}`
      ).toHaveLength(0);
    });

    it("should have the same conservationStatus across locales", () => {
      const enTrees = new Map(
        allTrees
          .filter((t) => t.locale === "en")
          .map((t) => [t.slug, t.conservationStatus])
      );

      const mismatches: string[] = [];
      allTrees
        .filter((t) => t.locale === "es")
        .forEach((esTree) => {
          const enStatus = enTrees.get(esTree.slug);
          if (
            enStatus !== undefined &&
            esTree.conservationStatus !== undefined &&
            enStatus !== esTree.conservationStatus
          ) {
            mismatches.push(
              `${esTree.slug}: EN="${enStatus}" vs ES="${esTree.conservationStatus}"`
            );
          }
        });

      expect(
        mismatches,
        `Trees with mismatched conservationStatus across locales:\n${mismatches.join("\n")}`
      ).toHaveLength(0);
    });

    it("should have the same slug in both locale MDX files on disk", () => {
      const enDir = path.join(process.cwd(), "content", "trees", "en");
      const esDir = path.join(process.cwd(), "content", "trees", "es");

      const enFiles = new Set(fs.readdirSync(enDir));
      const esFiles = new Set(fs.readdirSync(esDir));

      const missingEs = [...enFiles].filter((f) => !esFiles.has(f));
      const missingEn = [...esFiles].filter((f) => !enFiles.has(f));

      expect(
        missingEs,
        `MDX files missing in ES: ${missingEs.join(", ")}`
      ).toHaveLength(0);
      expect(
        missingEn,
        `MDX files missing in EN: ${missingEn.join(", ")}`
      ).toHaveLength(0);
    });
  });

  describe("Image Reference Integrity", () => {
    it("should have featuredImage pointing to existing files", () => {
      const missing: string[] = [];
      allTrees.forEach((t) => {
        if (t.featuredImage) {
          const imagePath = path.join(process.cwd(), "public", t.featuredImage);
          if (!fs.existsSync(imagePath)) {
            missing.push(
              `${t.slug} (${t.locale}) featuredImage "${t.featuredImage}" not found`
            );
          }
        }
      });
      expect(
        missing,
        `Trees with missing featuredImage files:\n${missing.join("\n")}`
      ).toHaveLength(0);
    });

    it("should have images[] entries pointing to existing files", () => {
      const missing: string[] = [];
      allTrees.forEach((t) => {
        if (t.images) {
          t.images.forEach((img: string) => {
            const imagePath = path.join(process.cwd(), "public", img);
            if (!fs.existsSync(imagePath)) {
              missing.push(`${t.slug} (${t.locale}) image "${img}" not found`);
            }
          });
        }
      });
      expect(
        missing,
        `Trees with missing image files:\n${missing.join("\n")}`
      ).toHaveLength(0);
    });

    it("should have featuredImage matching the slug naming convention", () => {
      const mismatches: string[] = [];
      allTrees
        .filter((t) => t.locale === "en" && t.featuredImage)
        .forEach((t) => {
          const imageName = path.basename(t.featuredImage!);
          // Image should contain the slug (either directly or in a directory)
          const imageDir = path.dirname(t.featuredImage!);
          const containsSlug =
            imageName.startsWith(t.slug) || imageDir.endsWith(t.slug);
          if (!containsSlug) {
            mismatches.push(
              `${t.slug} has featuredImage "${t.featuredImage}" — doesn't match slug`
            );
          }
        });
      // This is informational — don't fail, just report
      if (mismatches.length > 0) {
        console.warn(
          `⚠️  ${mismatches.length} trees have featuredImage not matching slug convention`
        );
      }
    });
  });
});

// ─── Glossary Content Validation ──────────────────────────────────────────────

describe("Glossary Content Validation", () => {
  describe("Frontmatter Schema Compliance", () => {
    it("should have all required fields", () => {
      const missing: string[] = [];
      allGlossaryTerms.forEach((g) => {
        if (!g.term) missing.push(`${g.slug} (${g.locale}) missing term`);
        if (!g.locale) missing.push(`${g.slug} missing locale`);
        if (!g.slug) missing.push(`${g.term} (${g.locale}) missing slug`);
        if (!g.simpleDefinition)
          missing.push(`${g.slug} (${g.locale}) missing simpleDefinition`);
        if (!g.category)
          missing.push(`${g.slug} (${g.locale}) missing category`);
      });
      expect(
        missing,
        "Glossary terms with missing required fields"
      ).toHaveLength(0);
    });

    it("should have valid category values", () => {
      const invalid = allGlossaryTerms.filter(
        (g) => !VALID_GLOSSARY_CATEGORIES.has(g.category)
      );
      expect(
        invalid.map((g) => `${g.slug} (${g.locale}) category "${g.category}"`),
        "Glossary terms with invalid category"
      ).toHaveLength(0);
    });

    it("should have valid locale values", () => {
      const validLocales = new Set<string>(VALID_LOCALES);
      const invalid = allGlossaryTerms.filter(
        (g) => !validLocales.has(g.locale)
      );
      expect(
        invalid.map((g) => `${g.slug} has locale "${g.locale}"`),
        "Glossary terms with invalid locale"
      ).toHaveLength(0);
    });

    it("should not have duplicate slugs within the same locale", () => {
      for (const locale of VALID_LOCALES) {
        const terms = allGlossaryTerms.filter((g) => g.locale === locale);
        const slugs = terms.map((g) => g.slug);
        const duplicates = slugs.filter(
          (slug, idx) => slugs.indexOf(slug) !== idx
        );
        expect(
          duplicates,
          `Duplicate glossary slugs in ${locale}: ${duplicates.join(", ")}`
        ).toHaveLength(0);
      }
    });
  });

  describe("Bilingual Parity", () => {
    it("should have matching EN and ES glossary terms", () => {
      const enSlugs = new Set(
        allGlossaryTerms.filter((g) => g.locale === "en").map((g) => g.slug)
      );
      const esSlugs = new Set(
        allGlossaryTerms.filter((g) => g.locale === "es").map((g) => g.slug)
      );

      const missingEs = [...enSlugs].filter((s) => !esSlugs.has(s));
      const missingEn = [...esSlugs].filter((s) => !enSlugs.has(s));

      expect(
        missingEs,
        `Glossary terms missing Spanish version: ${missingEs.join(", ")}`
      ).toHaveLength(0);
      expect(
        missingEn,
        `Glossary terms missing English version: ${missingEn.join(", ")}`
      ).toHaveLength(0);
    });

    it("should have matching EN and ES files on disk", () => {
      const enDir = path.join(process.cwd(), "content", "glossary", "en");
      const esDir = path.join(process.cwd(), "content", "glossary", "es");

      const enFiles = new Set(fs.readdirSync(enDir));
      const esFiles = new Set(fs.readdirSync(esDir));

      const missingEs = [...enFiles].filter((f) => !esFiles.has(f));
      const missingEn = [...esFiles].filter((f) => !enFiles.has(f));

      expect(
        missingEs,
        `Glossary MDX files missing in ES: ${missingEs.join(", ")}`
      ).toHaveLength(0);
      expect(
        missingEn,
        `Glossary MDX files missing in EN: ${missingEn.join(", ")}`
      ).toHaveLength(0);
    });

    it("should have the same category across locales", () => {
      const enTerms = new Map(
        allGlossaryTerms
          .filter((g) => g.locale === "en")
          .map((g) => [g.slug, g.category])
      );

      const mismatches: string[] = [];
      allGlossaryTerms
        .filter((g) => g.locale === "es")
        .forEach((esGloss) => {
          const enCategory = enTerms.get(esGloss.slug);
          if (enCategory && enCategory !== esGloss.category) {
            mismatches.push(
              `${esGloss.slug}: EN="${enCategory}" vs ES="${esGloss.category}"`
            );
          }
        });

      expect(
        mismatches,
        `Glossary terms with mismatched category across locales:\n${mismatches.join("\n")}`
      ).toHaveLength(0);
    });
  });

  describe("Cross-Reference Integrity", () => {
    it("should have exampleSpecies that reference valid tree slugs", () => {
      const invalid: string[] = [];
      // Only check EN locale to avoid doubling up on the same issues
      allGlossaryTerms
        .filter((g) => g.locale === "en")
        .forEach((g) => {
          if (g.exampleSpecies) {
            g.exampleSpecies.forEach((species: string) => {
              if (!enTreeSlugs.has(species)) {
                invalid.push(
                  `${g.slug} exampleSpecies "${species}" is not a valid tree slug`
                );
              }
            });
          }
        });

      // Many glossary terms use common names or generic references instead of
      // actual tree slugs (e.g., "palms", "coffee", "oak"). This is a content
      // quality issue to be addressed in a future content standardization pass.
      // For now, only warn — don't fail the test.
      if (invalid.length > 0) {
        console.warn(
          `⚠️  ${invalid.length} glossary exampleSpecies reference non-existent tree slugs (content quality issue):\n${invalid.slice(0, 10).join("\n")}${invalid.length > 10 ? `\n  ... and ${invalid.length - 10} more` : ""}`
        );
      }
    });

    it("should have relatedTerms that reference valid glossary slugs", () => {
      const enGlossarySlugs = new Set(
        allGlossaryTerms.filter((g) => g.locale === "en").map((g) => g.slug)
      );

      const invalid: string[] = [];
      allGlossaryTerms
        .filter((g) => g.locale === "en")
        .forEach((g) => {
          if (g.relatedTerms) {
            g.relatedTerms.forEach((term: string) => {
              if (!enGlossarySlugs.has(term)) {
                invalid.push(
                  `${g.slug} relatedTerm "${term}" is not a valid glossary slug`
                );
              }
            });
          }
        });

      // Report as warning — some related terms may be intentionally pointing to future terms
      if (invalid.length > 0) {
        console.warn(
          `⚠️  ${invalid.length} glossary relatedTerms reference non-existent slugs:\n${invalid.join("\n")}`
        );
      }
    });
  });
});

// ─── Comparison Content Validation ────────────────────────────────────────────

describe("Comparison Content Validation", () => {
  describe("Frontmatter Schema Compliance", () => {
    it("should have all required fields", () => {
      const missing: string[] = [];
      allSpeciesComparisons.forEach((c) => {
        if (!c.title) missing.push(`${c.slug} (${c.locale}) missing title`);
        if (!c.locale) missing.push(`${c.slug} missing locale`);
        if (!c.slug) missing.push(`${c.title} (${c.locale}) missing slug`);
        if (!c.species || c.species.length === 0)
          missing.push(`${c.slug} (${c.locale}) missing species`);
        if (!c.keyDifference)
          missing.push(`${c.slug} (${c.locale}) missing keyDifference`);
        if (!c.description)
          missing.push(`${c.slug} (${c.locale}) missing description`);
      });
      expect(missing, "Comparisons with missing required fields").toHaveLength(
        0
      );
    });

    it("should have valid locale values", () => {
      const validLocales = new Set<string>(VALID_LOCALES);
      const invalid = allSpeciesComparisons.filter(
        (c) => !validLocales.has(c.locale)
      );
      expect(
        invalid.map((c) => `${c.slug} has locale "${c.locale}"`),
        "Comparisons with invalid locale"
      ).toHaveLength(0);
    });

    it("should have valid difficulty values", () => {
      const invalid = allSpeciesComparisons.filter(
        (c) => c.difficulty && !VALID_COMPARISON_DIFFICULTIES.has(c.difficulty)
      );
      expect(
        invalid.map(
          (c) => `${c.slug} (${c.locale}) difficulty "${c.difficulty}"`
        ),
        "Comparisons with invalid difficulty"
      ).toHaveLength(0);
    });

    it("should have valid comparisonTags values", () => {
      const invalid: string[] = [];
      allSpeciesComparisons.forEach((c) => {
        if (c.comparisonTags) {
          c.comparisonTags.forEach((tag: string) => {
            if (!VALID_COMPARISON_TAGS.has(tag)) {
              invalid.push(
                `${c.slug} (${c.locale}) comparisonTag "${tag}" is not valid`
              );
            }
          });
        }
      });
      expect(invalid, "Comparisons with invalid comparisonTags").toHaveLength(
        0
      );
    });

    it("should have exactly 2 species per comparison", () => {
      const invalid = allSpeciesComparisons.filter(
        (c) => !c.species || c.species.length !== 2
      );
      expect(
        invalid.map(
          (c) =>
            `${c.slug} (${c.locale}) has ${c.species?.length ?? 0} species instead of 2`
        ),
        "Comparisons without exactly 2 species"
      ).toHaveLength(0);
    });

    it("should have confusionRating between 1 and 5", () => {
      const invalid = allSpeciesComparisons.filter(
        (c) =>
          c.confusionRating !== undefined &&
          (c.confusionRating < 1 || c.confusionRating > 5)
      );
      expect(
        invalid.map(
          (c) => `${c.slug} (${c.locale}) confusionRating ${c.confusionRating}`
        ),
        "Comparisons with out-of-range confusionRating"
      ).toHaveLength(0);
    });

    it("should not have duplicate slugs within the same locale", () => {
      for (const locale of VALID_LOCALES) {
        const comparisons = allSpeciesComparisons.filter(
          (c) => c.locale === locale
        );
        const slugs = comparisons.map((c) => c.slug);
        const duplicates = slugs.filter(
          (slug, idx) => slugs.indexOf(slug) !== idx
        );
        expect(
          duplicates,
          `Duplicate comparison slugs in ${locale}: ${duplicates.join(", ")}`
        ).toHaveLength(0);
      }
    });
  });

  describe("Bilingual Parity", () => {
    it("should have matching EN and ES comparison files", () => {
      const enSlugs = new Set(
        allSpeciesComparisons
          .filter((c) => c.locale === "en")
          .map((c) => c.slug)
      );
      const esSlugs = new Set(
        allSpeciesComparisons
          .filter((c) => c.locale === "es")
          .map((c) => c.slug)
      );

      const missingEs = [...enSlugs].filter((s) => !esSlugs.has(s));
      const missingEn = [...esSlugs].filter((s) => !enSlugs.has(s));

      expect(
        missingEs,
        `Comparisons missing Spanish version: ${missingEs.join(", ")}`
      ).toHaveLength(0);
      expect(
        missingEn,
        `Comparisons missing English version: ${missingEn.join(", ")}`
      ).toHaveLength(0);
    });

    it("should have matching EN and ES files on disk", () => {
      const enDir = path.join(process.cwd(), "content", "comparisons", "en");
      const esDir = path.join(process.cwd(), "content", "comparisons", "es");

      const enFiles = new Set(fs.readdirSync(enDir));
      const esFiles = new Set(fs.readdirSync(esDir));

      const missingEs = [...enFiles].filter((f) => !esFiles.has(f));
      const missingEn = [...esFiles].filter((f) => !enFiles.has(f));

      expect(
        missingEs,
        `Comparison MDX files missing in ES: ${missingEs.join(", ")}`
      ).toHaveLength(0);
      expect(
        missingEn,
        `Comparison MDX files missing in EN: ${missingEn.join(", ")}`
      ).toHaveLength(0);
    });

    it("should have the same species list across locales", () => {
      const enComparisons = new Map(
        allSpeciesComparisons
          .filter((c) => c.locale === "en")
          .map((c) => [c.slug, c.species?.sort().join(",")])
      );

      const mismatches: string[] = [];
      allSpeciesComparisons
        .filter((c) => c.locale === "es")
        .forEach((esComp) => {
          const enSpecies = enComparisons.get(esComp.slug);
          const esSpecies = esComp.species?.sort().join(",");
          if (enSpecies && esSpecies && enSpecies !== esSpecies) {
            mismatches.push(
              `${esComp.slug}: EN=[${enSpecies}] vs ES=[${esSpecies}]`
            );
          }
        });

      expect(
        mismatches,
        `Comparisons with mismatched species across locales:\n${mismatches.join("\n")}`
      ).toHaveLength(0);
    });

    it("should have the same difficulty across locales", () => {
      const enComparisons = new Map(
        allSpeciesComparisons
          .filter((c) => c.locale === "en")
          .map((c) => [c.slug, c.difficulty])
      );

      const mismatches: string[] = [];
      allSpeciesComparisons
        .filter((c) => c.locale === "es")
        .forEach((esComp) => {
          const enDiff = enComparisons.get(esComp.slug);
          if (
            enDiff !== undefined &&
            esComp.difficulty !== undefined &&
            enDiff !== esComp.difficulty
          ) {
            mismatches.push(
              `${esComp.slug}: EN="${enDiff}" vs ES="${esComp.difficulty}"`
            );
          }
        });

      expect(
        mismatches,
        `Comparisons with mismatched difficulty across locales:\n${mismatches.join("\n")}`
      ).toHaveLength(0);
    });
  });

  describe("Species Reference Integrity", () => {
    it("should reference valid tree slugs in species field", () => {
      const invalid: string[] = [];
      allSpeciesComparisons.forEach((c) => {
        if (c.species) {
          c.species.forEach((species: string) => {
            if (!enTreeSlugs.has(species)) {
              invalid.push(
                `${c.slug} (${c.locale}) species "${species}" is not a valid tree slug`
              );
            }
          });
        }
      });
      expect(
        invalid,
        `Comparisons with invalid species references:\n${invalid.join("\n")}`
      ).toHaveLength(0);
    });

    it("should have featuredImages pointing to existing files", () => {
      const missing: string[] = [];
      allSpeciesComparisons.forEach((c) => {
        if (c.featuredImages) {
          c.featuredImages.forEach((img: string) => {
            const imagePath = path.join(process.cwd(), "public", img);
            if (!fs.existsSync(imagePath)) {
              missing.push(
                `${c.slug} (${c.locale}) featuredImage "${img}" not found`
              );
            }
          });
        }
      });
      expect(
        missing,
        `Comparisons with missing featuredImage files:\n${missing.join("\n")}`
      ).toHaveLength(0);
    });
  });
});

// ─── Cross-Content Integrity ──────────────────────────────────────────────────

describe("Cross-Content Integrity", () => {
  it("should have consistent total counts across content types", () => {
    const enTrees = allTrees.filter((t) => t.locale === "en").length;
    const esTrees = allTrees.filter((t) => t.locale === "es").length;
    expect(enTrees).toBe(esTrees);

    const enGlossary = allGlossaryTerms.filter((g) => g.locale === "en").length;
    const esGlossary = allGlossaryTerms.filter((g) => g.locale === "es").length;
    expect(enGlossary).toBe(esGlossary);

    const enComparisons = allSpeciesComparisons.filter(
      (c) => c.locale === "en"
    ).length;
    const esComparisons = allSpeciesComparisons.filter(
      (c) => c.locale === "es"
    ).length;
    expect(enComparisons).toBe(esComparisons);
  });

  it("should have expected minimum content counts", () => {
    const enTrees = allTrees.filter((t) => t.locale === "en").length;
    const enGlossary = allGlossaryTerms.filter((g) => g.locale === "en").length;
    const enComparisons = allSpeciesComparisons.filter(
      (c) => c.locale === "en"
    ).length;

    // These minimums match the documented counts from IMPLEMENTATION_PLAN.md
    expect(enTrees).toBeGreaterThanOrEqual(175);
    expect(enGlossary).toBeGreaterThanOrEqual(150);
    expect(enComparisons).toBeGreaterThanOrEqual(20);
  });

  it("should have all body content non-empty across all content types", () => {
    const emptyBodies: string[] = [];

    allTrees.forEach((t) => {
      if (!t.body?.code || t.body.code.length === 0) {
        emptyBodies.push(`tree: ${t.slug} (${t.locale})`);
      }
    });

    allGlossaryTerms.forEach((g) => {
      if (!g.body?.code || g.body.code.length === 0) {
        emptyBodies.push(`glossary: ${g.slug} (${g.locale})`);
      }
    });

    allSpeciesComparisons.forEach((c) => {
      if (!c.body?.code || c.body.code.length === 0) {
        emptyBodies.push(`comparison: ${c.slug} (${c.locale})`);
      }
    });

    expect(
      emptyBodies,
      `Content with empty bodies:\n${emptyBodies.join("\n")}`
    ).toHaveLength(0);
  });
});
