interface SafeJsonLdProps {
  data: Record<string, unknown>;
  nonce?: string;
}

/**
 * Comprehensive XSS escape sequences that need to be neutralized
 * Includes case variations, whitespace, and Unicode variants
 */
const DANGEROUS_PATTERNS = [
  // Script tag variations
  /<\/script[^>]*>/gi, // Any </script> with attributes/whitespace
  /<script[^>]*>/gi, // Opening script tags
  /&lt;\/script[^>]*&gt;/gi, // HTML entity encoded

  // Style tag escape
  /<\/style[^>]*>/gi,
  /<style[^>]*>/gi,

  // HTML comment escape
  /-->/g,

  // CDATA escape
  /]]>/g,

  // Event handlers (onclick, onerror, etc.)
  /on\w+\s*=/gi,

  // Javascript: protocol
  /javascript:/gi,

  // Data: URI with script
  /data:text\/html/gi,
];

/**
 * Unicode-aware character escapes
 * Maps dangerous characters to their Unicode escape sequences
 */
const UNICODE_ESCAPES: [RegExp, string][] = [
  // ASCII dangerous chars
  [/</g, "\\u003c"],
  [/>/g, "\\u003e"],
  [/&/g, "\\u0026"],
  [/'/g, "\\u0027"],
  [/"/g, "\\u0022"],

  // Fullwidth variants (U+FF00-FF60)
  [/＜/g, "\\uff1c"], // Fullwidth less-than
  [/＞/g, "\\uff1e"], // Fullwidth greater-than
  [/＆/g, "\\uff06"], // Fullwidth ampersand

  // Mathematical variants
  [/⁄/g, "\\u2044"], // Fraction slash (looks like /)
  [/∕/g, "\\u2215"], // Division slash
  [/⹀/g, "\\u2e40"], // Double hyphen (looks like =)

  // Zero-width and invisible chars
  [/\u200B/g, ""], // Zero-width space
  [/\u200C/g, ""], // Zero-width non-joiner
  [/\u200D/g, ""], // Zero-width joiner
  [/\uFEFF/g, ""], // Zero-width no-break space

  // Unicode line separators
  [/\u2028/g, "\\u2028"],
  [/\u2029/g, "\\u2029"],
];

/**
 * Sanitize JSON string for safe embedding in HTML
 *
 * Security measures:
 * - Escapes HTML special characters to Unicode
 * - Removes dangerous patterns (case-insensitive)
 * - Handles Unicode homoglyphs and variants
 * - Removes zero-width characters
 * - Validates final output
 */
export function sanitizeJsonForHtml(json: string): string {
  // 1. Apply Unicode escapes for all dangerous characters
  let sanitized = json;

  for (const [pattern, replacement] of UNICODE_ESCAPES) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  // 2. Remove or replace dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }

  // 3. Normalize Unicode to prevent homograph attacks
  sanitized = sanitized.normalize("NFC");

  // 4. Final validation - should not contain any raw dangerous characters
  // Note: We only check for actual HTML syntax characters, not substrings like "script" or "style"
  // since those can legitimately appear in content (e.g., "description", "lifestyle")
  if (
    sanitized.includes("<") ||
    sanitized.includes(">") ||
    sanitized.includes("-->") ||
    sanitized.includes("]]>")
  ) {
    // Return safe empty object instead of potentially dangerous content
    return "{}";
  }

  return sanitized;
}

/**
 * Safe JSON-LD component that prevents XSS attacks
 *
 * Renders structured data as a server-side <script> tag for:
 * - Immediate visibility to search engine crawlers (SEO)
 * - Zero client-side JavaScript overhead
 * - No hydration cost
 *
 * Security:
 * - Comprehensive sanitization of JSON content
 * - CSP nonce support
 * - Unicode homoglyph protection
 * - Validation of output before injection
 *
 * @param data - JSON-LD structured data object
 * @param nonce - CSP nonce for inline script
 */
export function SafeJsonLd({ data, nonce }: SafeJsonLdProps) {
  // Serialize and sanitize outside JSX to avoid try/catch around rendering
  let json: string;
  try {
    json = sanitizeJsonForHtml(JSON.stringify(data, null, 0));
  } catch {
    // Silently fail — don't break the page for structured data issues
    return null;
  }

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
