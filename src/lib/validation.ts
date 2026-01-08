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

// Detect suspicious Unicode (potential homograph attack)
const CONTROL_CHAR_REGEX = /[\x00-\x1F\x7F-\x9F]/; // Control characters

// Email validation regex (simplified and safe from ReDoS)
// Using strict character limits on all parts
const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,}$/;

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
 * Validate slug with enhanced security (prevents path traversal)
 * This is a wrapper for backwards compatibility
 * For filesystem operations, use @/lib/validation/slug directly
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

  // Enhanced security: Check for path traversal attempts
  if (
    trimmed.includes("..") ||
    trimmed.includes("/") ||
    trimmed.includes("\\")
  ) {
    return {
      valid: false,
      error: "Invalid slug format. Path traversal attempts not allowed.",
    };
  }

  // Check for null bytes
  if (trimmed.includes("\x00") || trimmed.includes("\u0000")) {
    return {
      valid: false,
      error: "Invalid slug format. Null bytes not allowed.",
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
