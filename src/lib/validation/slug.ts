/**
 * Validates slugs for file system safety
 * Prevents path traversal, null bytes, and other injection attacks
 */

const SLUG_MAX_LENGTH = 100;
const SLUG_MIN_LENGTH = 1;

/**
 * Validate that slug is safe for filesystem operations
 *
 * Security requirements:
 * - Only alphanumeric, hyphens, underscores
 * - No path separators (/ or \)
 * - No parent directory references (..)
 * - No null bytes or control characters
 * - Reasonable length limits
 *
 * @param slug - User-provided slug to validate
 * @returns validation result
 */
export function validateSlug(slug: string): {
  valid: boolean;
  sanitized?: string;
  error?: string;
} {
  // 1. Type and basic checks
  if (typeof slug !== "string" || slug.length === 0) {
    return { valid: false, error: "Slug must be a non-empty string" };
  }

  // 2. Length validation
  if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
    return {
      valid: false,
      error: `Slug length must be between ${SLUG_MIN_LENGTH} and ${SLUG_MAX_LENGTH}`,
    };
  }

  // 3. Check for null bytes (can bypass extension checks)
  if (slug.includes("\x00") || slug.includes("\u0000")) {
    return { valid: false, error: "Null bytes not allowed" };
  }

  // 4. Check for path separators
  if (slug.includes("/") || slug.includes("\\")) {
    return { valid: false, error: "Path separators not allowed" };
  }

  // 5. Check for parent directory references
  if (slug.includes("..")) {
    return { valid: false, error: "Parent directory references not allowed" };
  }

  // 6. Check for control characters
  // This regex is safe: it uses a bounded character class with no backtracking

  if (/[\x00-\x1F\x7F-\x9F]/.test(slug)) {
    return { valid: false, error: "Control characters not allowed" };
  }

  // 7. URL decode and check again (prevent %2F, %2E%2E, etc.)
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    return { valid: false, error: "Invalid URL encoding" };
  }

  if (
    decoded.includes("/") ||
    decoded.includes("\\") ||
    decoded.includes("..") ||
    decoded.includes("\x00")
  ) {
    return {
      valid: false,
      error: "URL-encoded path traversal attempt detected",
    };
  }

  // 8. Whitelist: only allow alphanumeric, hyphens, underscores, and dots
  // (dots only in the middle, not at start/end to prevent .htaccess, etc.)
  // Safe regex: Uses bounded repetition and simple character classes
  // eslint-disable-next-line security/detect-unsafe-regex
  if (!/^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/i.test(slug)) {
    return {
      valid: false,
      error:
        "Slug must contain only alphanumeric characters, hyphens, underscores, and dots",
    };
  }

  // 9. Check for suspicious patterns
  const suspiciousPatterns = [
    /^\./, // Starts with dot (hidden files)
    /\.$/, // Ends with dot
    /\.{2,}/, // Multiple consecutive dots
    /__/, // Double underscore (sometimes used for special files)
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(slug)) {
      return { valid: false, error: "Suspicious pattern detected" };
    }
  }

  // 10. Normalize and return
  const sanitized = slug.toLowerCase().trim();

  return { valid: true, sanitized };
}

/**
 * Validate and sanitize file extension
 */
export function validateExtension(
  filename: string,
  allowedExtensions: string[] = [".jpg", ".jpeg", ".png", ".webp", ".avif"]
): {
  valid: boolean;
  extension?: string;
  error?: string;
} {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Extension '${ext}' not allowed. Allowed: ${allowedExtensions.join(", ")}`,
    };
  }

  return { valid: true, extension: ext };
}
