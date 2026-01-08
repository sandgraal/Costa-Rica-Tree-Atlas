/**
 * Calculate Shannon entropy of a string to detect suspicious patterns
 * Low entropy = repeated characters (e.g., "aaaaaaaaaa")
 * Too high entropy = random garbage (e.g., "xQz9!Kp2@")
 */
export function calculateEntropy(str: string): number {
  if (str.length === 0) return 0;

  const frequencies = new Map<string, number>();

  for (const char of str) {
    frequencies.set(char, (frequencies.get(char) || 0) + 1);
  }

  let entropy = 0;

  frequencies.forEach((count) => {
    const probability = count / str.length;
    entropy -= probability * Math.log2(probability);
  });

  return entropy;
}

/**
 * Validate that string has reasonable entropy for scientific names
 */
export function validateEntropy(name: string): {
  valid: boolean;
  entropy: number;
  reason?: string;
} {
  const entropy = calculateEntropy(name);

  // Scientific names should have entropy between 2.5 and 4.5
  // - Too low: "aaaaaaaaa" (entropy ~0)
  // - Too high: "xQz9!Kp2@" (entropy ~4.5+)
  // - Just right: "Quercus robur" (entropy ~3.2)

  if (entropy < 2.0) {
    return {
      valid: false,
      entropy,
      reason: "Too many repeated characters",
    };
  }

  if (entropy > 4.5) {
    return {
      valid: false,
      entropy,
      reason: "Excessive randomness (not a valid scientific name)",
    };
  }

  return { valid: true, entropy };
}
