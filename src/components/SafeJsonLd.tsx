"use client";

import { useEffect, useRef } from "react";

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
function sanitizeJsonForHtml(json: string): string {
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
    console.error(
      "⚠️ JSON-LD sanitization failed - dangerous content detected"
    );
    // Return safe empty object instead of potentially dangerous content
    return "{}";
  }

  return sanitized;
}

/**
 * Safe JSON-LD component that prevents XSS attacks
 *
 * Features:
 * - Comprehensive sanitization of JSON content
 * - Client-side only rendering (no hydration mismatches)
 * - CSP nonce support
 * - Validation of output before injection
 *
 * @param data - JSON-LD structured data object
 * @param nonce - CSP nonce for inline script
 */
export function SafeJsonLd({ data, nonce }: SafeJsonLdProps) {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // Serialize to JSON
      let json = JSON.stringify(data, null, 0);

      // Sanitize for HTML context
      json = sanitizeJsonForHtml(json);

      // Create script element
      const script = document.createElement("script");
      script.type = "application/ld+json";

      if (nonce) {
        script.setAttribute("nonce", nonce);
      }

      // Use textContent instead of innerHTML (safer)
      script.textContent = json;

      // Remove old script if exists
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }

      // Append new script
      document.head.appendChild(script);
      scriptRef.current = script;

      // Cleanup
      return () => {
        if (scriptRef.current?.parentNode) {
          scriptRef.current.parentNode.removeChild(scriptRef.current);
        }
      };
    } catch (error) {
      console.error("Failed to render JSON-LD:", error);
    }
  }, [data, nonce]);

  // This component doesn't render anything visible
  return null;
}
