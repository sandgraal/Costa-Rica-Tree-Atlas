/**
 * Validate JSON-LD data before rendering to prevent malicious payloads
 */

/**
 * Recursively scan object for dangerous content
 */
function scanForDangerousContent(
  obj: unknown,
  path: string = "root"
): string[] {
  const issues: string[] = [];

  if (obj === null || obj === undefined) {
    return issues;
  }

  if (typeof obj === "string") {
    // Check for script tags (case-insensitive)
    if (/<script/i.test(obj)) {
      issues.push(`${path}: Contains <script> tag`);
    }

    // Check for closing script tags
    if (/<\/script/i.test(obj)) {
      issues.push(`${path}: Contains </script> tag`);
    }

    // Check for style tags
    if (/<style/i.test(obj) || /<\/style/i.test(obj)) {
      issues.push(`${path}: Contains <style> tag`);
    }

    // Check for event handlers
    if (/on\w+\s*=/i.test(obj)) {
      issues.push(`${path}: Contains event handler`);
    }

    // Check for dangerous URL schemes (comprehensive)
    if (/javascript:/i.test(obj)) {
      issues.push(`${path}: Contains javascript: protocol`);
    }

    if (/vbscript:/i.test(obj)) {
      issues.push(`${path}: Contains vbscript: protocol`);
    }

    // Check for data: URIs (can have many attack vectors)
    // While some data: URIs are safe (like data:image/png), we're conservative here
    // and flag all of them for JSON-LD content which shouldn't need them
    if (/data:/i.test(obj)) {
      issues.push(`${path}: Contains data: URI`);
    }

    // Check for Unicode homoglyphs
    if (/[＜＞＆]/.test(obj)) {
      issues.push(`${path}: Contains fullwidth HTML characters`);
    }

    // Check for zero-width characters
    if (/[\u200B-\u200F\uFEFF]/.test(obj)) {
      issues.push(`${path}: Contains zero-width characters`);
    }

    // Check for HTML comment escapes (all variants)
    if (/-->/.test(obj) || /--!>/.test(obj)) {
      issues.push(`${path}: Contains HTML comment escape`);
    }

    // Check for CDATA escapes
    if (/]]>/.test(obj)) {
      issues.push(`${path}: Contains CDATA escape`);
    }
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      issues.push(...scanForDangerousContent(item, `${path}[${index}]`));
    });
  }

  if (typeof obj === "object") {
    for (const [key, value] of Object.entries(obj)) {
      // Check key itself for dangerous content - only exact matches or HTML brackets
      // Don't flag legitimate keys like "description" that happen to contain "script" as substring
      if (/^(script|style)$/i.test(key) || /<|>/.test(key)) {
        issues.push(`${path}: Dangerous key name "${key}"`);
      }

      issues.push(...scanForDangerousContent(value, `${path}.${key}`));
    }
  }

  return issues;
}

/**
 * Validate JSON-LD data is safe to render
 */
export function validateJsonLd(data: unknown): {
  valid: boolean;
  error?: string;
  issues?: string[];
} {
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "JSON-LD must be an object" };
  }

  const obj = data as Record<string, unknown>;

  // Validate @context if present
  if ("@context" in obj) {
    const context = obj["@context"];

    if (typeof context === "string") {
      // Only allow schema.org contexts
      if (!context.startsWith("https://schema.org")) {
        return {
          valid: false,
          error: "Invalid @context URL - must be schema.org",
        };
      }
    } else if (Array.isArray(context)) {
      // Check all contexts in array
      for (const ctx of context) {
        if (typeof ctx === "string" && !ctx.startsWith("https://schema.org")) {
          return {
            valid: false,
            error: "Invalid @context URL in array",
          };
        }
      }
    }
  }

  // Scan for dangerous content
  const issues = scanForDangerousContent(data);

  if (issues.length > 0) {
    return {
      valid: false,
      error: `JSON-LD contains dangerous content: ${issues[0]}`,
      issues,
    };
  }

  return { valid: true };
}

/**
 * Sanitize a string value by removing dangerous content
 * Addresses CodeQL security findings:
 * - Comprehensive URL scheme filtering (data:, javascript:, vbscript:)
 * - Robust tag filtering with all whitespace variants
 * - Multiple passes to handle incomplete sanitization
 * - HTML comment variants (-->, --!>)
 *
 * Note: This is a backup sanitization layer. The primary defense is validation
 * at the input level which should reject malicious content entirely.
 */
function sanitizeString(value: string): string {
  let clean = value;

  // Helper: remove HTML attributes whose name starts with "on" (event handlers)
  const removeEventHandlerAttributes = (input: string): string => {
    let previous: string;
    let current = input;

    // Safe regex approach: match attribute names separately from values
    // Split into two simpler patterns to avoid nested quantifiers
    // Pattern 1: attribute with double-quoted value
    const attrDoubleQuote = /\s+([^\s=>\/]+)\s*=\s*"[^"]*"/gi;
    // Pattern 2: attribute with single-quoted value
    const attrSingleQuote = /\s+([^\s=>\/]+)\s*=\s*'[^']*'/gi;
    // Pattern 3: attribute with unquoted value
    const attrUnquoted = /\s+([^\s=>\/]+)\s*=\s*[^\s>]+/gi;
    // Pattern 4: attribute without value
    const attrNoValue = /\s+([^\s=>\/]+)(?=[\s/>])/gi;

    do {
      previous = current;

      // Process each pattern separately
      const patterns = [
        attrDoubleQuote,
        attrSingleQuote,
        attrUnquoted,
        attrNoValue,
      ];

      for (const regex of patterns) {
        regex.lastIndex = 0;
        let match: RegExpExecArray | null;
        let result = "";
        let lastIndex = 0;

        while ((match = regex.exec(current)) !== null) {
          const fullMatch = match[0];
          const attrName = match[1];

          if (/^on/i.test(attrName)) {
            // Skip this attribute entirely (remove it)
            result += current.slice(lastIndex, match.index);
            lastIndex = match.index + fullMatch.length;
          }
        }

        if (lastIndex > 0) {
          // Append remainder of the string after the last removed attribute
          result += current.slice(lastIndex);
          current = result;
        }
      }
    } while (current !== previous);

    return current;
  };

  // Multiple passes to handle overlapping patterns and incomplete sanitization
  for (let i = 0; i < 3; i++) {
    // Remove script tags (handle all whitespace including tabs, newlines, spaces)
    // Use [\s\S] to match any character including newlines in tag content
    // Use \s+ for whitespace before > to handle </script >, </script\t>, etc.
    clean = clean.replace(/<script[\s\S]*?>[\s\S]*?<\/script[\s\S]*?>/gis, "");

    // Remove event handler attributes safely (handles quoted and unquoted values)
    clean = removeEventHandlerAttributes(clean);

    // Remove ALL dangerous URL schemes
    // Remove data: entirely as it has many attack vectors (data:text/html, data:image/svg+xml with scripts, etc.)
    clean = clean.replace(/javascript:/gi, "");
    clean = clean.replace(/vbscript:/gi, "");
    clean = clean.replace(/data:/gi, ""); // Comprehensive - removes all data: URIs
  }

  // Ensure no residual <style or </style sequences remain (case-insensitive, with optional whitespace)
  // Apply repeatedly in case earlier replacements create new <style / </style sequences
  while (true) {
    const beforeStyleClean = clean;
    clean = clean.replace(/<\s*style/gi, "");
    clean = clean.replace(/<\/\s*style/gi, "");
    if (clean === beforeStyleClean) {
      break;
    }
  }

  // Remove fullwidth variants (Unicode lookalikes)
  clean = clean.replace(/[＜＞＆]/g, "");

  // Remove zero-width characters
  clean = clean.replace(/[\u200B-\u200F\uFEFF]/g, "");

  // Remove HTML comment and CDATA escapes (all variants)
  clean = clean.replace(/-->/g, "");
  clean = clean.replace(/--!>/g, "");
  clean = clean.replace(/]]>/g, "");

  return clean;
}

/**
 * Sanitize JSON-LD data by removing dangerous fields
 */
export function sanitizeJsonLd(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip keys with dangerous names - only exact matches or obvious XSS vectors
    // Don't flag legitimate keys like "description" that happen to contain "script" as substring
    if (/^(script|style)$/i.test(key) || /<|>/.test(key)) {
      console.warn(`Skipping dangerous key: ${key}`);
      continue;
    }

    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) => {
        if (typeof item === "string") {
          return sanitizeString(item);
        } else if (typeof item === "object" && item !== null) {
          return sanitizeJsonLd(item as Record<string, unknown>);
        }
        return item;
      });
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeJsonLd(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
