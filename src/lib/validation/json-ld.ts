/**
 * Validate JSON-LD structured data before rendering
 * Prevents injection of malicious @context URLs
 */
export function validateJsonLd(data: unknown): {
  valid: boolean;
  error?: string;
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

  // Check for suspicious patterns
  const json = JSON.stringify(data);

  if (json.includes("</script>")) {
    return { valid: false, error: "JSON-LD contains </script> tag" };
  }

  if (json.includes("<script>")) {
    return { valid: false, error: "JSON-LD contains <script> tag" };
  }

  if (json.includes("javascript:")) {
    return { valid: false, error: "JSON-LD contains javascript: protocol" };
  }

  return { valid: true };
}
