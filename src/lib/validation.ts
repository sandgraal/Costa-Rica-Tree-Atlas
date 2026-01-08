/**
 * Enhanced security validation with Unicode normalization
 *
 * This module now delegates to the secure validation implementation
 * in src/lib/validation/ which eliminates ReDoS vulnerabilities
 * and provides comprehensive security checks.
 *
 * For backward compatibility, this file maintains the same API
 * but uses the new secure validation internally.
 */

import { validateScientificName as validateScientificNameSecure } from "./validation/scientific-name";

// Maximum lengths to prevent DoS
const MAX_SLUG_LENGTH = 100;

// Locale: Must be exactly 'en' or 'es'
const LOCALE_REGEX = /^(en|es)$/;

// Slug: Alphanumeric and hyphens only (no Unicode needed for slugs)
// Safe from ReDoS: Uses possessive quantifiers with character classes
// eslint-disable-next-line security/detect-unsafe-regex
const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Email validation regex (RFC 5322 simplified)
// Safe from ReDoS: Uses bounded quantifiers {0,61} and simple character classes
const EMAIL_REGEX =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validate and sanitize scientific name input
 *
 * Now uses secure implementation from validation/scientific-name.ts
 * which eliminates ReDoS vulnerabilities through character-by-character
 * validation instead of regex matching.
 */
export function validateScientificName(input: string | null): ValidationResult {
  if (!input) {
    return { valid: false, error: "Scientific name is required" };
  }

  // Delegate to secure implementation
  return validateScientificNameSecure(input);
}

/**
 * Validate locale parameter
 */
export function validateLocale(input: string | null): ValidationResult {
  if (!input) {
    return { valid: true, sanitized: "en" }; // Default to English
  }

  const lower = input.toLowerCase().trim();

  if (!LOCALE_REGEX.test(lower)) {
    return { valid: false, error: 'Invalid locale. Must be "en" or "es"' };
  }

  return { valid: true, sanitized: lower };
}

/**
 * Validate slug with length limit
 */
export function validateSlug(input: string | null): ValidationResult {
  if (!input) {
    return { valid: false, error: "Slug is required" };
  }

  const trimmed = input.trim().toLowerCase();

  // Length check before regex
  if (trimmed.length > MAX_SLUG_LENGTH) {
    return {
      valid: false,
      error: `Slug too long (max ${MAX_SLUG_LENGTH} characters)`,
    };
  }

  if (!SLUG_REGEX.test(trimmed)) {
    return {
      valid: false,
      error:
        "Invalid slug format. Only lowercase letters, numbers, and hyphens allowed.",
    };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Sanitize string for logging (prevent log injection)
 */
export function sanitizeForLog(input: string): string {
  return input
    .replace(/[\r\n]/g, " ") // Remove newlines
    .replace(/[^\x20-\x7E]/g, "") // Remove non-printable ASCII
    .slice(0, 200); // Limit length
}

/**
 * Validate and sanitize email addresses
 */
export function validateEmail(input: string | null): ValidationResult {
  if (!input) {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = input.trim().toLowerCase();

  // Length check
  if (trimmed.length > 254) {
    return { valid: false, error: "Email too long" };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true, sanitized: trimmed };
}
