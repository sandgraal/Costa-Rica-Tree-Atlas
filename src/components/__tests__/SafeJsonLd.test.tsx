import { describe, it, expect, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { SafeJsonLd } from "../SafeJsonLd";

describe("SafeJsonLd Component", () => {
  afterEach(() => {
    // Clean up any scripts added to head
    const scripts = document.head.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    scripts.forEach((script) => {
      script.remove();
    });
  });

  it("should escape </script> tags", () => {
    const malicious = {
      name: "</script><script>alert(1)</script>",
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.textContent).not.toContain("</script>");
    expect(script?.textContent).toContain("\\u003c/script\\u003e");
  });

  it("should escape unicode line separators", () => {
    const data = {
      description: "Line 1\u2028Line 2\u2029Line 3",
    };

    render(<SafeJsonLd data={data} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.textContent).toContain("\\u2028");
    expect(script?.textContent).toContain("\\u2029");
  });

  it("should render valid JSON-LD correctly", () => {
    const valid = {
      "@context": "https://schema.org",
      "@type": "Article",
      name: "Test Tree",
    };

    render(<SafeJsonLd data={valid} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.getAttribute("type")).toBe("application/ld+json");
    expect(script?.textContent).toContain("Test Tree");
  });

  it("should escape all angle brackets", () => {
    const data = {
      name: "<div>Test</div>",
      description: "A < B > C",
    };

    render(<SafeJsonLd data={data} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.textContent).not.toContain("<div>");
    expect(script?.textContent).toContain("\\u003c");
    expect(script?.textContent).toContain("\\u003e");
  });

  it("should handle case variation attacks", () => {
    const malicious = {
      name: "</ScRiPt><ScRiPt>alert(1)</ScRiPt>",
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    // Should be escaped and not executable
    expect(script?.textContent).not.toContain("</ScRiPt>");
    expect(script?.textContent).toContain("\\u003c");
  });

  it("should remove fullwidth characters", () => {
    const malicious = {
      name: "Test＜script＞alert(1)＜/script＞",
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    // Fullwidth chars should be escaped
    expect(script?.textContent).not.toContain("＜");
    expect(script?.textContent).not.toContain("＞");
  });

  it("should remove zero-width characters", () => {
    const malicious = {
      name: "Test\u200Bmalicious\u200C",
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    // Zero-width characters should be removed
    expect(script?.textContent).not.toContain("\u200B");
    expect(script?.textContent).not.toContain("\u200C");
  });

  it("should handle event handlers", () => {
    const malicious = {
      name: 'Test<img onerror="alert(1)">',
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    // Event handlers should be escaped
    expect(script?.textContent).not.toContain("onerror=");
  });

  it("should escape style tags", () => {
    const malicious = {
      name: "</style><style>body{display:none}</style>",
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.textContent).not.toContain("</style>");
    expect(script?.textContent).toContain("\\u003c");
  });

  it("should handle HTML comment escapes", () => {
    const malicious = {
      name: "Test-->",
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.textContent).not.toContain("-->");
  });

  it("should handle CDATA escapes", () => {
    const malicious = {
      name: "Test]]>",
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.textContent).not.toContain("]]>");
  });

  it("should include nonce attribute when provided", () => {
    const data = {
      "@context": "https://schema.org",
      name: "Test",
    };

    render(<SafeJsonLd data={data} nonce="test-nonce" />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.getAttribute("nonce")).toBe("test-nonce");
  });

  it("should handle nested objects with malicious content", () => {
    const malicious = {
      author: {
        name: "<script>alert(1)</script>",
      },
    };

    render(<SafeJsonLd data={malicious} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.textContent).not.toContain("<script>");
  });

  it("should produce valid parseable JSON (double-quotes must not be escaped)", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Costa Rica Tree Atlas",
      description: 'A site with "quoted" content',
    };

    render(<SafeJsonLd data={data} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    // The output must be valid JSON — parseable without errors
    expect(() => JSON.parse(script!.textContent!)).not.toThrow();

    // Double-quotes must NOT be escaped to \u0022 (that would break JSON)
    expect(script?.textContent).not.toContain("\\u0022");

    // Single-quotes must NOT be escaped to \u0027
    expect(script?.textContent).not.toContain("\\u0027");
  });

  it("should allow legitimate content with 'script' or 'style' substrings", () => {
    const legitimate = {
      "@context": "https://schema.org",
      "@type": "Article",
      name: "Costa Rican Style Tree",
      description: "A tree described in ancient manuscripts",
      keywords: "lifestyle, description, prescription",
    };

    render(<SafeJsonLd data={legitimate} />);
    const script = document.head.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(script?.getAttribute("type")).toBe("application/ld+json");
    expect(script?.textContent).toContain("Costa Rican Style Tree");
    expect(script?.textContent).toContain("manuscripts");
    expect(script?.textContent).toContain("lifestyle");
    expect(script?.textContent).toContain("description");
  });
});
