import { describe, it, expect } from "@jest/globals";
import { render } from "@testing-library/react";
import { SafeJsonLd } from "../SafeJsonLd";

describe("SafeJsonLd", () => {
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
});
