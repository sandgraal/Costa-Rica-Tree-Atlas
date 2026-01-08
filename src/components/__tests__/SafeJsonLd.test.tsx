import { describe, it, expect } from "@jest/globals";
import { render } from "@testing-library/react";
import { SafeJsonLd } from "../SafeJsonLd";

describe("SafeJsonLd Component", () => {
  it("should escape </script> tags", () => {
    const malicious = {
      name: "</script><script>alert(1)</script>",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    expect(script?.textContent).not.toContain("</script>");
    expect(script?.textContent).toContain("\\u003c/script\\u003e");
  });

  it("should escape unicode line separators", () => {
    const data = {
      description: "Line 1\u2028Line 2\u2029Line 3",
    };

    const { container } = render(<SafeJsonLd data={data} />);
    const script = container.querySelector("script");

    expect(script?.textContent).toContain("\\u2028");
    expect(script?.textContent).toContain("\\u2029");
  });

  it("should render valid JSON-LD correctly", () => {
    const valid = {
      "@context": "https://schema.org",
      "@type": "Article",
      name: "Test Tree",
    };

    const { container } = render(<SafeJsonLd data={valid} />);
    const script = container.querySelector("script");

    expect(script?.getAttribute("type")).toBe("application/ld+json");
    expect(script?.textContent).toContain("Test Tree");
  });

  it("should escape all angle brackets", () => {
    const data = {
      name: "<div>Test</div>",
      description: "A < B > C",
    };

    const { container } = render(<SafeJsonLd data={data} />);
    const script = container.querySelector("script");

    expect(script?.textContent).not.toContain("<div>");
    expect(script?.textContent).toContain("\\u003c");
    expect(script?.textContent).toContain("\\u003e");
  });

  it("should handle case variation attacks", () => {
    const malicious = {
      name: "</ScRiPt><ScRiPt>alert(1)</ScRiPt>",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    // Should be escaped and not executable
    expect(script?.textContent).not.toContain("</ScRiPt>");
    expect(script?.textContent).toContain("\\u003c");
  });

  it("should remove fullwidth characters", () => {
    const malicious = {
      name: "Test＜script＞alert(1)＜/script＞",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    // Fullwidth chars should be escaped
    expect(script?.textContent).not.toContain("＜");
    expect(script?.textContent).not.toContain("＞");
  });

  it("should remove zero-width characters", () => {
    const malicious = {
      name: "Test\u200Bmalicious\u200C",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    // Zero-width characters should be removed
    expect(script?.textContent).not.toContain("\u200B");
    expect(script?.textContent).not.toContain("\u200C");
  });

  it("should handle event handlers", () => {
    const malicious = {
      name: 'Test<img onerror="alert(1)">',
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    // Event handlers should be escaped
    expect(script?.textContent).not.toContain("onerror=");
  });

  it("should escape style tags", () => {
    const malicious = {
      name: "</style><style>body{display:none}</style>",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    expect(script?.textContent).not.toContain("</style>");
    expect(script?.textContent).toContain("\\u003c");
  });

  it("should handle HTML comment escapes", () => {
    const malicious = {
      name: "Test-->",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    expect(script?.textContent).not.toContain("-->");
  });

  it("should handle CDATA escapes", () => {
    const malicious = {
      name: "Test]]>",
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    expect(script?.textContent).not.toContain("]]>");
  });

  it("should include nonce attribute when provided", () => {
    const data = {
      "@context": "https://schema.org",
      name: "Test",
    };

    const { container } = render(<SafeJsonLd data={data} nonce="test-nonce" />);
    const script = container.querySelector("script");

    expect(script?.getAttribute("nonce")).toBe("test-nonce");
  });

  it("should handle nested objects with malicious content", () => {
    const malicious = {
      author: {
        name: "<script>alert(1)</script>",
      },
    };

    const { container } = render(<SafeJsonLd data={malicious} />);
    const script = container.querySelector("script");

    expect(script?.textContent).not.toContain("<script>");
  });
});
