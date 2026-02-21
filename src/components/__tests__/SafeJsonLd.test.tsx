import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SafeJsonLd, sanitizeJsonForHtml } from "../SafeJsonLd";

/**
 * Helper to get the rendered script tag content from container.
 * Since SafeJsonLd is now a server component that renders a <script> tag
 * directly, we find it in the render container instead of document.head.
 */
function getScriptContent(container: HTMLElement): string | null {
  const script = container.querySelector('script[type="application/ld+json"]');
  return script?.innerHTML ?? null;
}

function getScriptElement(container: HTMLElement): HTMLScriptElement | null {
  return container.querySelector('script[type="application/ld+json"]');
}

describe("SafeJsonLd Component", () => {
  it("should escape </script> tags", () => {
    const malicious = {
      name: "</script><script>alert(1)</script>",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("</script>");
    expect(content).toContain("\\u003c/script\\u003e");
  });

  it("should escape unicode line separators", () => {
    const data = {
      description: "Line 1\u2028Line 2\u2029Line 3",
    };

    const { container } = render(<SafeJsonLd data={data} />);
    const content = getScriptContent(container);

    expect(content).toContain("\\u2028");
    expect(content).toContain("\\u2029");
  });

  it("should render valid JSON-LD correctly", () => {
    const valid = {
      "@context": "https://schema.org",
      "@type": "Article",
      name: "Test Tree",
    };

    const { container } = render(<SafeJsonLd data={valid} />);
    const script = getScriptElement(container);

    expect(script?.getAttribute("type")).toBe("application/ld+json");
    expect(script?.innerHTML).toContain("Test Tree");
  });

  it("should escape all angle brackets", () => {
    const data = {
      name: "<div>Test</div>",
      description: "A < B > C",
    };

    const { container } = render(<SafeJsonLd data={data} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("<div>");
    expect(content).toContain("\\u003c");
    expect(content).toContain("\\u003e");
  });

  it("should handle case variation attacks", () => {
    const malicious = {
      name: "</ScRiPt><ScRiPt>alert(1)</ScRiPt>",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("</ScRiPt>");
    expect(content).toContain("\\u003c");
  });

  it("should remove fullwidth characters", () => {
    const malicious = {
      name: "Test＜script＞alert(1)＜/script＞",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("＜");
    expect(content).not.toContain("＞");
  });

  it("should remove zero-width characters", () => {
    const malicious = {
      name: "Test\u200Bmalicious\u200C",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("\u200B");
    expect(content).not.toContain("\u200C");
  });

  it("should handle event handlers", () => {
    const malicious = {
      name: 'Test<img onerror="alert(1)">',
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("onerror=");
  });

  it("should escape style tags", () => {
    const malicious = {
      name: "</style><style>body{display:none}</style>",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("</style>");
    expect(content).toContain("\\u003c");
  });

  it("should handle HTML comment escapes", () => {
    const malicious = {
      name: "Test-->",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("-->");
  });

  it("should handle CDATA escapes", () => {
    const malicious = {
      name: "Test]]>",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("]]>");
  });

  it("should include nonce attribute when provided", () => {
    const data = {
      "@context": "https://schema.org",
      name: "Test",
    };

    const { container } = render(<SafeJsonLd data={data} nonce="test-nonce" />);
    const script = getScriptElement(container);

    expect(script?.getAttribute("nonce")).toBe("test-nonce");
  });

  it("should handle nested objects with malicious content", () => {
    const malicious = {
      author: {
        name: "<script>alert(1)</script>",
      },
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const content = getScriptContent(container);

    expect(content).not.toContain("<script>");
  });

  it("should produce valid parseable JSON (double-quotes must not be escaped)", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Costa Rica Tree Atlas",
      description: 'A site with "quoted" content',
    };

    const { container } = render(<SafeJsonLd data={data} />);
    const content = getScriptContent(container);

    // Ensure script content is present
    expect(content).not.toBeNull();

    // The output must be valid JSON — parseable without errors
    expect(() => JSON.parse(content as string)).not.toThrow();

    // Double-quotes must NOT be escaped to \u0022 (that would break JSON)
    expect(content).not.toContain("\\u0022");

    // Single-quotes must NOT be escaped to \u0027
    expect(content).not.toContain("\\u0027");
  });

  it("should allow legitimate content with 'script' or 'style' substrings", () => {
    const legitimate = {
      "@context": "https://schema.org",
      "@type": "Article",
      name: "Costa Rican Style Tree",
      description: "A tree described in ancient manuscripts",
      keywords: "lifestyle, description, prescription",
    };

    const { container } = render(<SafeJsonLd data={legitimate} />);
    const script = getScriptElement(container);
    const content = getScriptContent(container);

    expect(script?.getAttribute("type")).toBe("application/ld+json");
    expect(content).toContain("Costa Rican Style Tree");
    expect(content).toContain("manuscripts");
    expect(content).toContain("lifestyle");
    expect(content).toContain("description");
  });
});

describe("sanitizeJsonForHtml", () => {
  it("should escape angle brackets to Unicode sequences", () => {
    const result = sanitizeJsonForHtml("<div>test</div>");
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
    expect(result).toContain("\\u003c");
    expect(result).toContain("\\u003e");
  });

  it("should return safe content unchanged", () => {
    const result = sanitizeJsonForHtml("safe content");
    expect(result).toBe("safe content");
  });
});
