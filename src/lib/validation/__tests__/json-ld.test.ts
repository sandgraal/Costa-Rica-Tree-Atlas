import { describe, it, expect } from "vitest";
import { validateJsonLd } from "../json-ld";

describe("validateJsonLd", () => {
  it("should accept valid schema.org context", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Article",
      name: "Test",
    };
    const result = validateJsonLd(data);
    expect(result.valid).toBe(true);
  });

  it("should reject non-schema.org contexts", () => {
    const data = {
      "@context": "https://evil.com/schema",
      name: "Test",
    };
    const result = validateJsonLd(data);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("schema.org");
  });

  it("should reject script tags in content", () => {
    const data = {
      name: "<script>alert(1)</script>",
    };
    const result = validateJsonLd(data);
    expect(result.valid).toBe(false);
  });

  it("should reject javascript: protocol", () => {
    const data = {
      url: "javascript:alert(1)",
    };
    const result = validateJsonLd(data);
    expect(result.valid).toBe(false);
  });

  it("should accept array context with valid schema.org URLs", () => {
    const data = {
      "@context": ["https://schema.org", "https://schema.org/extensions/v2"],
      "@type": "Article",
      name: "Test",
    };
    const result = validateJsonLd(data);
    expect(result.valid).toBe(true);
  });

  it("should reject array context with non-schema.org URL", () => {
    const data = {
      "@context": ["https://schema.org", "https://evil.com/schema"],
      name: "Test",
    };
    const result = validateJsonLd(data);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid @context URL in array");
  });

  it("should reject closing script tag", () => {
    const data = {
      name: "Test</script>",
    };
    const result = validateJsonLd(data);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("</script>");
  });

  it("should reject non-object data", () => {
    const result1 = validateJsonLd(null);
    expect(result1.valid).toBe(false);
    expect(result1.error).toContain("must be an object");

    const result2 = validateJsonLd("string");
    expect(result2.valid).toBe(false);
    expect(result2.error).toContain("must be an object");
  });
});
