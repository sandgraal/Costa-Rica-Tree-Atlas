import { describe, it, expect } from "vitest";
import { validateScientificName } from "../scientific-name";

/**
 * Upper bound for a single validation call.
 *
 * Several cases here asserted `< 1ms`, which flakes: one cold call includes JIT
 * warm-up and can be interrupted by GC (observed at 1.24ms on an idle laptop).
 * A sub-millisecond wall-clock assertion measures the machine, not the code.
 *
 * What this suite actually guards is the absence of catastrophic backtracking,
 * which shows up as seconds — not fractions of a millisecond. 50ms is far below
 * any real ReDoS and far above scheduler noise. The statistically stable
 * measurement is the 10,000-iteration benchmark at the bottom, which keeps its
 * tight per-call average.
 */
const MAX_SINGLE_CALL_MS = 50;

describe("ReDoS Prevention", () => {
  it("should validate max-length input without backtracking", () => {
    const longName = "Q" + "uercus".repeat(33); // ~200 chars

    const start = performance.now();
    const result = validateScientificName(longName);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(MAX_SINGLE_CALL_MS);
    // Single long word starting with uppercase is structurally valid Latin text
    expect(result.valid).toBe(true);
  });

  it("should reject zero-width character spam without backtracking", () => {
    const attack = "Quercus" + "\u200B".repeat(1000);

    const start = performance.now();
    const result = validateScientificName(attack);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(MAX_SINGLE_CALL_MS);
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
    expect(duration1).toBeLessThan(MAX_SINGLE_CALL_MS);
    expect(duration2).toBeLessThan(MAX_SINGLE_CALL_MS);
  });

  it("should detect homograph attacks quickly", () => {
    // Cyrillic 'е' instead of Latin 'e'
    const attack = "Quеrcus"; // е is U+0435 (Cyrillic)

    const start = performance.now();
    const result = validateScientificName(attack);
    const duration = performance.now() - start;

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Mixed scripts");
    expect(duration).toBeLessThan(MAX_SINGLE_CALL_MS);
  });

  it("should detect emoji injection quickly", () => {
    const attack = "Quercus⚠️";

    const start = performance.now();
    const result = validateScientificName(attack);
    const duration = performance.now() - start;

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Emoji");
    expect(duration).toBeLessThan(MAX_SINGLE_CALL_MS);
  });

  it("should handle repeated pattern attacks efficiently", () => {
    // Attempt to cause backtracking with repeated patterns
    const attack = "Que".repeat(100) + "rcus";

    const start = performance.now();
    const result = validateScientificName(attack);
    const duration = performance.now() - start;

    expect(result.valid).toBe(false);
    expect(duration).toBeLessThan(MAX_SINGLE_CALL_MS); // fails the length check immediately
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
      expect(duration).toBeLessThan(MAX_SINGLE_CALL_MS);
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

    expect(duration).toBeLessThan(MAX_SINGLE_CALL_MS);
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
      expect(duration).toBeLessThan(MAX_SINGLE_CALL_MS);
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
