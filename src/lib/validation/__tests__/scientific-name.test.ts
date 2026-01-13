import { describe, it, expect } from "vitest";
import { validateScientificName, detectHomoglyphs } from "../scientific-name";

describe("validateScientificName", () => {
  describe("Basic Validation", () => {
    it("should accept valid Latin scientific names", () => {
      const result = validateScientificName("Quercus robur");
      expect(result.valid).toBe(true);
      expect(result.sanitized).toBe("Quercus robur");
    });

    it("should accept names with Latin extended characters", () => {
      const result = validateScientificName("Piña colada");
      expect(result.valid).toBe(true);
    });

    it("should accept names with hyphens and periods", () => {
      const result = validateScientificName("Quercus sp. nov.");
      expect(result.valid).toBe(true);
    });

    it("should reject names that are too short", () => {
      const result = validateScientificName("Q");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too short");
    });

    it("should reject names that are too long", () => {
      const longName = "Q" + "uercus".repeat(40);
      const result = validateScientificName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too long");
    });
  });

  describe("ReDoS Prevention", () => {
    it("should reject oversized input quickly", () => {
      const attack = "Q" + "uercus".repeat(50);
      const start = performance.now();
      const result = validateScientificName(attack);
      const duration = performance.now() - start;

      expect(result.valid).toBe(false);
      expect(duration).toBeLessThan(10); // Should fail fast
    });

    it("should handle maximum allowed length efficiently", () => {
      const maxName = "Q" + "uercus".repeat(32); // ~200 chars
      const start = performance.now();
      validateScientificName(maxName);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(10);
    });
  });

  describe("Control Character Detection", () => {
    it("should reject null bytes", () => {
      const result = validateScientificName("Quercus\x00robur");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("control");
    });

    it("should reject other control characters", () => {
      const result = validateScientificName("Quercus\nrobur");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("control");
    });

    it("should reject tab characters", () => {
      const result = validateScientificName("Quercus\trobur");
      expect(result.valid).toBe(false);
    });
  });

  describe("Zero-Width Character Detection", () => {
    it("should reject zero-width spaces", () => {
      const result = validateScientificName("Quercus\u200Brobur");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Zero-width");
    });

    it("should reject zero-width joiners", () => {
      const result = validateScientificName("Quercus\u200Drobur");
      expect(result.valid).toBe(false);
    });

    it("should reject left-to-right marks", () => {
      const result = validateScientificName("Quercus\u200Erobur");
      expect(result.valid).toBe(false);
    });

    it("should reject right-to-left marks", () => {
      const result = validateScientificName("Quercus\u200Frobur");
      expect(result.valid).toBe(false);
    });
  });

  describe("Homograph Attack Detection", () => {
    it("should reject Cyrillic characters", () => {
      // Cyrillic 'е' instead of Latin 'e'
      const result = validateScientificName("Quеrcus");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Mixed scripts");
    });

    it("should reject Greek characters", () => {
      // Greek 'Α' instead of Latin 'A'
      const result = validateScientificName("Αlpha");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Mixed scripts");
    });

    it("should reject Arabic characters", () => {
      const result = validateScientificName("Quercus\u0627");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Mixed scripts");
    });

    it("should reject Hebrew characters", () => {
      const result = validateScientificName("Quercus\u05D0");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Mixed scripts");
    });

    it("should reject only non-Latin scripts", () => {
      const result = validateScientificName("Кверкус");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Latin script");
    });
  });

  describe("Emoji Detection", () => {
    it("should reject emoji characters", () => {
      const result = validateScientificName("Quercus⚠️");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Emoji");
    });

    it("should reject various emoji ranges", () => {
      const result1 = validateScientificName("Quercus🌳");
      expect(result1.valid).toBe(false);

      const result2 = validateScientificName("Quercus⭐");
      expect(result2.valid).toBe(false);
    });
  });

  describe("Unicode Normalization", () => {
    it("should normalize NFC and NFD to same result", () => {
      const nfc = "Café"; // é as single character
      const nfd = "Cafe\u0301"; // é as e + combining acute

      const result1 = validateScientificName(nfc);
      const result2 = validateScientificName(nfd);

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
      expect(result1.sanitized).toBe(result2.sanitized);
    });

    it("should detect suspicious normalization", () => {
      // Create a string where NFKC differs from NFC
      const suspicious = "Quercus ﬁgaris"; // Contains Latin Small Ligature FI (U+FB01)
      const result = validateScientificName(suspicious);

      // Should be rejected because NFKC normalizes ligatures
      expect(result.valid).toBe(false);
      expect(result.error).toContain("normalization");
    });
  });

  describe("Scientific Name Structure", () => {
    it("should require genus to start with uppercase", () => {
      const result = validateScientificName("quercus robur");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("uppercase");
    });

    it("should require species to start with lowercase", () => {
      const result = validateScientificName("Quercus Robur");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("lowercase");
    });

    it("should accept genus name only", () => {
      const result = validateScientificName("Quercus");
      expect(result.valid).toBe(true);
    });

    it("should accept binomial nomenclature", () => {
      const result = validateScientificName("Quercus robur");
      expect(result.valid).toBe(true);
    });

    it("should accept trinomial nomenclature", () => {
      const result = validateScientificName("Quercus robur subsp");
      expect(result.valid).toBe(true);
    });

    it("should reject too many parts", () => {
      const result = validateScientificName("A b c d e f g");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("structure");
    });
  });

  describe("Invalid Character Detection", () => {
    it("should reject numbers", () => {
      const result = validateScientificName("Quercus123");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid character");
    });

    it("should reject special characters", () => {
      const result = validateScientificName("Quercus@robur");
      expect(result.valid).toBe(false);
    });

    it("should reject parentheses", () => {
      const result = validateScientificName("Quercus (robur)");
      expect(result.valid).toBe(false);
    });
  });
});

describe("detectHomoglyphs", () => {
  it("should detect Cyrillic lookalikes", () => {
    const result = detectHomoglyphs("Quеrcus"); // Cyrillic е
    expect(result.suspicious).toBe(true);
    expect(result.details.length).toBeGreaterThan(0);
    expect(result.details[0]).toContain("Cyrillic");
  });

  it("should detect Greek lookalikes", () => {
    const result = detectHomoglyphs("Αlpha"); // Greek Α
    expect(result.suspicious).toBe(true);
    expect(result.details[0]).toContain("Greek");
  });

  it("should not flag pure Latin text", () => {
    const result = detectHomoglyphs("Quercus robur");
    expect(result.suspicious).toBe(false);
    expect(result.details.length).toBe(0);
  });

  it("should detect multiple lookalikes", () => {
    const result = detectHomoglyphs("Quеrcus rоbur"); // Both Cyrillic
    expect(result.suspicious).toBe(true);
    expect(result.details.length).toBeGreaterThan(1);
  });
});
