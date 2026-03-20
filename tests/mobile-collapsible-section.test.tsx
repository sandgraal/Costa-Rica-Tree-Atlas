import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MobileCollapsibleSection } from "@/components/MobileCollapsibleSection";

describe("MobileCollapsibleSection", () => {
  const toggleLabels = {
    expand: "Show section",
    collapse: "Hide section",
  };

  it("starts collapsed on mobile and expands when toggled", () => {
    const { container } = render(
      <MobileCollapsibleSection
        id="uses"
        title="Uses"
        toggleLabels={toggleLabels}
        tocLevel={3}
      >
        <p>Shade, habitat, and timber value.</p>
      </MobileCollapsibleSection>
    );

    const section = container.querySelector("section#uses");
    const button = screen.getByRole("button", {
      name: /uses.+show section/i,
    });
    const panelId = button.getAttribute("aria-controls");
    const panel = panelId ? container.querySelector(`#${panelId}`) : null;

    expect(section).not.toBeNull();
    expect(section).toHaveAttribute("data-toc", "Uses");
    expect(section).toHaveAttribute("data-toc-level", "3");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(panel?.className).toContain("hidden");

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /uses.+hide section/i })).toBe(
      button
    );
    expect(panel?.className).not.toContain("hidden");
  });

  it("can be rendered open by default when requested", () => {
    const { container } = render(
      <MobileCollapsibleSection
        id="notes"
        title="Field notes"
        toggleLabels={toggleLabels}
        defaultCollapsedOnMobile={false}
      >
        <p>Always visible content.</p>
      </MobileCollapsibleSection>
    );

    const button = screen.getByRole("button", {
      name: /field notes.+hide section/i,
    });
    const panelId = button.getAttribute("aria-controls");
    const panel = panelId ? container.querySelector(`#${panelId}`) : null;

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel?.className).toContain("block");
  });
});
