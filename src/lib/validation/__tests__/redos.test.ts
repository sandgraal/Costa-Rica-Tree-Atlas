import { describe, it, expect } from "vitest";
import { validateScientificName } from "../scientific-name";

describe("ReDoS Prevention", () => {
  it("should validate in <1ms even with max-length input", () => {
    const longName = "Q" + "uercus".repeat(33); // ~200 chars

    const start = performance.now();
    const result = validateScientificName(longName);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1);
    expect(result.valid).toBe(false); // Invalid format, but should reject fast
  });

  it("should reject zero-width character spam instantly", () => {
    const attack = "Quercus" + "\u200B".repeat(1000);

    const start = performance.now();
    const result = validateScientificName(attack);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1);
    expect(result.valid).toBe(false);
  });

  it("should handle Unicode normalization attacks efficiently", () => {
    // NFD vs NFC attack
    const nfc = "Café"; // é as single character
    const nfd = "Cafe\u0301"; // é as e + combining acute

    const start1 = performance.now();
    const result1 = validateScientificName(nfc);
    const duration1 = performance.now() - start1;

    const start2 = performance.now();
    const result2 = validateScientificName(nfd);
    const duration2 = performance.now() - start2;

    // Both should normalize to same result
    expect(result1.sanitized).toBe(result2.sanitized);
    expect(duration1).toBeLessThan(5);
    expect(duration2).toBeLessThan(5);
  });

  it("should detect homograph attacks quickly", () => {
    // Cyrillic 'е' instead of Latin 'e'
    const attack = "Quеrcus"; // е is U+0435 (Cyrillic)

    const start = performance.now();
    const result = validateScientificName(attack);
    const duration = performance.now() - start;

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Mixed scripts");
    expect(duration).toBeLessThan(5);
  });

  it("should detect emoji injection quickly", () => {
    const attack = "Quercus⚠️";

    const start = performance.now();
    const result = validateScientificName(attack);
    const duration = performance.now() - start;

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Emoji");
    expect(duration).toBeLessThan(5);
  });

  it("should handle repeated pattern attacks efficiently", () => {
    // Attempt to cause backtracking with repeated patterns
    const attack = "Que".repeat(100) + "rcus";

    const start = performance.now();
    const result = validateScientificName(attack);
    const duration = performance.now() - start;

    expect(result.valid).toBe(false);
    expect(duration).toBeLessThan(1); // Should fail on length check instantly
  });

  it("should process valid names very quickly", () => {
    const validNames = [
      "Quercus robur",
      "Pinus sylvestris",
      "Acer pseudoplatanus",
      "Fagus grandifolia",
      "Betula pendula",
    ];

    validNames.forEach((name) => {
      const start = performance.now();
      const result = validateScientificName(name);
      const duration = performance.now() - start;

      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(1);
    });
  });

  it("should handle worst-case character validation efficiently", () => {
    // Maximum allowed length with all unique characters
    // eslint-disable-next-line no-secrets/no-secrets
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ";
    const worstCase = chars.repeat(10).substring(0, 200);

    const start = performance.now();
    validateScientificName(worstCase);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(5);
  });

  it("should detect control character attacks quickly", () => {
    const attacks = [
      "Quercus\x00robur", // Null byte
      "Quercus\nrobur", // Newline
      "Quercus\trobur", // Tab
      "Quercus\rrobur", // Carriage return
    ];

    attacks.forEach((attack) => {
      const start = performance.now();
      const result = validateScientificName(attack);
      const duration = performance.now() - start;

      expect(result.valid).toBe(false);
      expect(duration).toBeLessThan(5);
    });
  });

  it("should benchmark 10,000 validations", () => {
    const names = [
      "Quercus robur",
      "Pinus sylvestris",
      "Acer pseudoplatanus",
      "Fagus grandifolia",
      "Betula pendula",
    ];

    const start = performance.now();

    for (let i = 0; i < 10000; i++) {
      const name = names[i % names.length];
      validateScientificName(name);
    }

    const duration = performance.now() - start;
    const avgPerValidation = duration / 10000;

    // Average should be < 0.1ms per validation
    expect(avgPerValidation).toBeLessThan(0.1);

    // Total should complete in reasonable time
    expect(duration).toBeLessThan(1000); // < 1 second for 10k validations
  });
});
