import { describe, it, expect } from "@jest/globals";
import { calculateEntropy, validateEntropy } from "../entropy";

describe("calculateEntropy", () => {
  it("should return 0 for empty string", () => {
    const entropy = calculateEntropy("");
    expect(entropy).toBe(0);
  });

  it("should return 0 for single repeated character", () => {
    const entropy = calculateEntropy("aaaaaaa");
    expect(entropy).toBe(0);
  });

  it("should return low entropy for mostly repeated characters", () => {
    const entropy = calculateEntropy("aaaaaab");
    expect(entropy).toBeLessThan(1);
  });

  it("should return higher entropy for diverse characters", () => {
    const entropy = calculateEntropy("Quercus robur");
    expect(entropy).toBeGreaterThan(2.5);
    expect(entropy).toBeLessThan(4.5);
  });

  it("should return high entropy for random characters", () => {
    const entropy = calculateEntropy("xQz9!Kp2@W");
    expect(entropy).toBeGreaterThan(3);
  });

  it("should be consistent for same input", () => {
    const name = "Quercus robur";
    const entropy1 = calculateEntropy(name);
    const entropy2 = calculateEntropy(name);
    expect(entropy1).toBe(entropy2);
  });

  it("should calculate different values for different strings", () => {
    const entropy1 = calculateEntropy("aaaaaa");
    const entropy2 = calculateEntropy("abcdef");
    expect(entropy1).not.toBe(entropy2);
  });
});

describe("validateEntropy", () => {
  it("should accept typical scientific names", () => {
    const names = [
      "Quercus robur",
      "Pinus sylvestris",
      "Acer pseudoplatanus",
      "Fagus grandifolia",
    ];

    names.forEach((name) => {
      const result = validateEntropy(name);
      expect(result.valid).toBe(true);
      expect(result.entropy).toBeGreaterThan(2.0);
      expect(result.entropy).toBeLessThan(4.5);
    });
  });

  it("should reject strings with too many repeated characters", () => {
    const result = validateEntropy("aaaaaaaaaa");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("repeated");
    expect(result.entropy).toBeLessThan(2.0);
  });

  it("should reject strings with excessive randomness", () => {
    const result = validateEntropy("xQz9!Kp2@W$v%H^");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("randomness");
    expect(result.entropy).toBeGreaterThan(4.5);
  });

  it("should accept names near the lower entropy threshold", () => {
    const result = validateEntropy("Aaa aaa");
    // Should pass even with lower diversity
    expect(result.valid).toBe(true);
  });

  it("should accept names near the upper entropy threshold", () => {
    const result = validateEntropy("Quercus robur var. fastigiata");
    expect(result.valid).toBe(true);
  });

  it("should return entropy value in result", () => {
    const result = validateEntropy("Quercus robur");
    expect(result.entropy).toBeDefined();
    expect(typeof result.entropy).toBe("number");
  });

  it("should handle Unicode characters correctly", () => {
    const result = validateEntropy("Piña colada");
    expect(result.valid).toBe(true);
    expect(result.entropy).toBeGreaterThan(2.0);
  });

  it("should detect suspicious patterns", () => {
    // Very low entropy - suspicious
    const result1 = validateEntropy("AAAA AAAA");
    expect(result1.valid).toBe(false);

    // Very high entropy - suspicious
    const result2 = validateEntropy("x1Q2z3!K4@");
    expect(result2.valid).toBe(false);
  });
});
