/**
 * Enhanced security validation with Unicode normalization
 */

// Maximum lengths to prevent DoS
const MAX_SCIENTIFIC_NAME_LENGTH = 200;
const MAX_SLUG_LENGTH = 100;

// Scientific name: Letters (including Unicode), spaces, hyphens, periods
// \p{L} matches all Unicode letters
const SCIENTIFIC_NAME_REGEX = /^[\p{L}\s\-\.]+$/u;

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

/**
 * Normalize Unicode string for consistent comparison
 * NFC (Canonical Composition) is standard for web
 */
function normalizeUnicode(input: string): string {
  return input.normalize("NFC");
}

/**
 * Detect potential homograph attacks
 */
function detectHomographs(input: string): boolean {
  // Check for mixing Latin with Cyrillic/Greek (common homograph tactic)
  const hasLatin = /[a-zA-Z]/.test(input);

  // Early return if no Latin characters
  if (!hasLatin) {
    return false;
  }

  const hasCyrillic = /[\u0400-\u04FF]/.test(input);
  const hasGreek = /[\u0370-\u03FF]/.test(input);

  // If mixing scripts, it's suspicious
  return hasCyrillic || hasGreek;
}

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

  // Length check BEFORE regex to prevent ReDoS
  if (input.length > MAX_SCIENTIFIC_NAME_LENGTH) {
    return {
      valid: false,
      error: `Scientific name too long (max ${MAX_SCIENTIFIC_NAME_LENGTH} characters)`,
    };
  }

  // Normalize Unicode
  const normalized = normalizeUnicode(input.trim());

  if (normalized.length < 3) {
    return {
      valid: false,
      error: "Scientific name too short (min 3 characters)",
    };
  }

  // Check for control characters (including null bytes)
  if (CONTROL_CHAR_REGEX.test(normalized)) {
    return {
      valid: false,
      error: "Scientific name contains invalid control characters",
    };
  }

  // Detect homograph attacks
  if (detectHomographs(normalized)) {
    return {
      valid: false,
      error: "Scientific name contains suspicious character combinations",
    };
  }

  // Character validation (now with Unicode support)
  if (!SCIENTIFIC_NAME_REGEX.test(normalized)) {
    return {
      valid: false,
      error:
        "Scientific name contains invalid characters. Only letters, spaces, hyphens, and periods allowed.",
    };
  }

  // Check for excessive whitespace or hyphens
  if (/\s{2,}/.test(normalized) || /\-{2,}/.test(normalized)) {
    return {
      valid: false,
      error: "Scientific name contains consecutive spaces or hyphens",
    };
  }

  // Additional safety: remove leading/trailing hyphens and spaces
  const cleaned = normalized.trim().replace(/^-+|-+$/g, "");

  return {
    valid: true,
    sanitized: cleaned,
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
