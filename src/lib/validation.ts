/**
 * Security validation utilities for user inputs
 */

// Scientific name: Letters, spaces, hyphens, periods only
const SCIENTIFIC_NAME_REGEX = /^[A-Za-z\s\-\.]+$/;

// Locale: Must be exactly 'en' or 'es'
const LOCALE_REGEX = /^(en|es)$/;

// Slug: Alphanumeric with hyphens only
const SLUG_REGEX = /^[a-z0-9\-]+$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validate and sanitize scientific name input
 */
export function validateScientificName(input: string | null): ValidationResult {
  if (!input) {
    return { valid: false, error: "Scientific name is required" };
  }

  // Length check
  if (input.length < 3) {
    return {
      valid: false,
      error: "Scientific name too short (min 3 characters)",
    };
  }

  if (input.length > 200) {
    return {
      valid: false,
      error: "Scientific name too long (max 200 characters)",
    };
  }

  // Trim whitespace
  const trimmed = input.trim();

  // Character validation
  if (!SCIENTIFIC_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error:
        "Scientific name contains invalid characters. Only letters, spaces, hyphens, and periods allowed.",
    };
  }

  // Check for excessive spaces or hyphens
  if (/\s{2,}/.test(trimmed) || /\-{2,}/.test(trimmed)) {
    return {
      valid: false,
      error: "Scientific name contains consecutive spaces or hyphens",
    };
  }

  return {
    valid: true,
    sanitized: trimmed,
  };
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
 * Validate slug parameter
 */
export function validateSlug(input: string | null): ValidationResult {
  if (!input) {
    return { valid: false, error: "Slug is required" };
  }

  const trimmed = input.trim().toLowerCase();

  if (trimmed.length > 100) {
    return { valid: false, error: "Slug too long" };
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
 * Note: This removes non-ASCII characters to prevent log injection attacks.
 * This is intentional for security purposes when logging user input.
 */
export function sanitizeForLog(input: string): string {
  return input
    .replace(/[\r\n]/g, " ") // Remove newlines
    .replace(/[^\x20-\x7E]/g, "") // Remove non-printable chars
    .slice(0, 200); // Limit length
}
