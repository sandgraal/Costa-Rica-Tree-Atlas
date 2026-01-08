export { validateScientificName, detectHomoglyphs } from "./scientific-name";

export { calculateEntropy, validateEntropy } from "./entropy";

export { validateJsonLd } from "./json-ld";

import { validateScientificName, detectHomoglyphs } from "./scientific-name";
import { validateEntropy } from "./entropy";

/**
 * Comprehensive validation for scientific names
 */
export function validateScientificNameStrict(name: string): {
  valid: boolean;
  sanitized?: string;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Basic validation
  const basicValidation = validateScientificName(name);
  if (!basicValidation.valid) {
    errors.push(basicValidation.error!);
    return { valid: false, errors, warnings };
  }

  const sanitized = basicValidation.sanitized!;

  // 2. Entropy check
  const entropyCheck = validateEntropy(sanitized);
  if (!entropyCheck.valid) {
    warnings.push(
      `Low entropy (${entropyCheck.entropy.toFixed(2)}): ${entropyCheck.reason}`
    );
  }

  // 3. Homoglyph detection
  const homoglyphCheck = detectHomoglyphs(sanitized);
  if (homoglyphCheck.suspicious) {
    errors.push(...homoglyphCheck.details);
    return { valid: false, sanitized, errors, warnings };
  }

  return { valid: true, sanitized, errors, warnings };
}
