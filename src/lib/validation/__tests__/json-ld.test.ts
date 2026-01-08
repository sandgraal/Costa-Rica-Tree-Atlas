import { describe, it, expect } from "@jest/globals";
import { validateJsonLd, sanitizeJsonLd } from "../json-ld";

describe("JSON-LD XSS Prevention", () => {
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

    it("should detect script tag injection", () => {
      const malicious = {
        "@context": "https://schema.org",
        name: 'Test</script><script>alert("XSS")</script>',
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
      expect(result.issues).toBeDefined();
      expect(result.issues!.length).toBeGreaterThan(0);
    });

    it("should detect case variation attacks", () => {
      const malicious = {
        name: 'Test</ScRiPt><ScRiPt>alert("XSS")</ScRiPt>',
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
    });

    it("should detect fullwidth character attacks", () => {
      const malicious = {
        name: "Test＜/script＞＜script＞alert(1)＜/script＞",
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
    });

    it("should detect event handler injection", () => {
      const malicious = {
        name: 'Test<img src=x onerror="alert(1)">',
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
    });

    it("should detect style tag injection", () => {
      const malicious = {
        name: "Test</style><style>body{display:none}</style>",
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
    });

    it("should detect HTML comment escape", () => {
      const malicious = {
        name: "Test-->",
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
    });

    it("should detect CDATA escape", () => {
      const malicious = {
        name: "Test]]>",
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
    });

    it("should detect zero-width characters", () => {
      const malicious = {
        name: "Test\u200Bmalicious",
      };

      const result = validateJsonLd(malicious);
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

    it("should reject non-object data", () => {
      const result1 = validateJsonLd(null);
      expect(result1.valid).toBe(false);
      expect(result1.error).toContain("must be an object");

      const result2 = validateJsonLd("string");
      expect(result2.valid).toBe(false);
      expect(result2.error).toContain("must be an object");
    });

    it("should handle nested objects", () => {
      const malicious = {
        author: {
          name: 'Evil<script>alert(1)</script>',
        },
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
    });

    it("should detect dangerous key names", () => {
      const malicious = {
        "<script>": "value",
      };

      const result = validateJsonLd(malicious);
      expect(result.valid).toBe(false);
    });
  });

  describe("sanitizeJsonLd", () => {
    it("should sanitize malicious data", () => {
      const malicious = {
        name: 'Test</script><script>alert("XSS")</script>',
        description: "Safe content",
      };

      const sanitized = sanitizeJsonLd(malicious);
      expect(sanitized.name).not.toContain("<script>");
      expect(sanitized.description).toBe("Safe content");
    });

    it("should handle nested objects", () => {
      const malicious = {
        author: {
          name: 'Evil<script>alert(1)</script>',
        },
      };

      const sanitized = sanitizeJsonLd(malicious);
      expect((sanitized.author as any).name).not.toContain("<script>");
    });

    it("should remove fullwidth characters", () => {
      const malicious = {
        name: "Test＜script＞alert(1)＜/script＞",
      };

      const sanitized = sanitizeJsonLd(malicious);
      expect(sanitized.name).not.toContain("＜");
      expect(sanitized.name).not.toContain("＞");
    });

    it("should remove zero-width characters", () => {
      const malicious = {
        name: "Test\u200Bmalicious\u200C\uFEFF",
      };

      const sanitized = sanitizeJsonLd(malicious);
      expect(sanitized.name).not.toContain("\u200B");
      expect(sanitized.name).not.toContain("\u200C");
      expect(sanitized.name).not.toContain("\uFEFF");
    });

    it("should remove event handlers", () => {
      const malicious = {
        name: 'Test<img onerror="alert(1)">',
      };

      const sanitized = sanitizeJsonLd(malicious);
      expect(sanitized.name).not.toContain("onerror=");
    });

    it("should handle arrays", () => {
      const malicious = {
        items: ['Safe', '<script>alert(1)</script>'],
      };

      const sanitized = sanitizeJsonLd(malicious);
      expect((sanitized.items as any[])[0]).toBe("Safe");
      expect((sanitized.items as any[])[1]).not.toContain("<script>");
    });

    it("should skip dangerous keys", () => {
      const malicious = {
        normal: "value",
        "<script>": "dangerous",
      };

      const sanitized = sanitizeJsonLd(malicious);
      expect(sanitized.normal).toBe("value");
      expect(sanitized["<script>"]).toBeUndefined();
    });
  });
});
