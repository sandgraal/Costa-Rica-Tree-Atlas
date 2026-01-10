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

    // Check for javascript: protocol
    if (/javascript:/i.test(obj)) {
      issues.push(`${path}: Contains javascript: protocol`);
    }

    // Check for data: URI with HTML
    if (/data:text\/html/i.test(obj)) {
      issues.push(`${path}: Contains data:text/html URI`);
    }

    // Check for Unicode homoglyphs
    if (/[＜＞＆]/.test(obj)) {
      issues.push(`${path}: Contains fullwidth HTML characters`);
    }

    // Check for zero-width characters
    if (/[\u200B-\u200F\uFEFF]/.test(obj)) {
      issues.push(`${path}: Contains zero-width characters`);
    }

    // Check for HTML comment escapes
    if (/-->/.test(obj)) {
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
      // Remove any script/style tags, event handlers, etc.
      let clean = value
        .replace(/<script[^>]*>.*?<\/script>/gis, "")
        .replace(/<style[^>]*>.*?<\/style>/gis, "")
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/data:text\/html/gi, "");

      // Remove fullwidth variants
      clean = clean.replace(/[＜＞＆]/g, "");

      // Remove zero-width characters
      clean = clean.replace(/[\u200B-\u200F\uFEFF]/g, "");

      // Remove HTML comment and CDATA escapes
      clean = clean.replace(/-->/g, "");
      clean = clean.replace(/]]>/g, "");

      sanitized[key] = clean;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "object" && item !== null
          ? sanitizeJsonLd(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeJsonLd(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
