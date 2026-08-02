import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  INaturalistEmbed,
  ComparisonTable,
} from "@/components/mdx/server-components";

/**
 * The atlas's whole proposition is that its numbers can be cited.
 *
 * This component used to render a hardcoded literal `186` as the iNaturalist
 * observer count, and `"290+"` as a fallback observation count, on EVERY
 * species page that embedded it — identical figures for every species. These
 * tests exist so an invented figure cannot come back.
 */
describe("INaturalistEmbed", () => {
  it("renders no statistics when no counts are supplied", () => {
    const { container } = render(
      <INaturalistEmbed taxonId="62809" taxonName="Ceiba pentandra" />
    );

    expect(container.textContent).not.toContain("186");
    expect(container.textContent).not.toContain("290+");
    // No stat tiles at all rather than plausible-looking placeholders.
    // (The heading still says "iNaturalist Observations"; it is the numeric
    // tiles, rendered at .text-2xl, that must be absent.)
    expect(container.querySelectorAll(".text-2xl")).toHaveLength(0);
  });

  it("renders only the counts it is actually given", () => {
    render(
      <INaturalistEmbed
        taxonId="62809"
        taxonName="Ceiba pentandra"
        observationCount={1234}
      />
    );

    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.queryByText("186")).toBeNull();
  });

  it("gives each outbound link an accessible name including the taxon", () => {
    render(<INaturalistEmbed taxonId="62809" taxonName="Ceiba pentandra" />);

    // `taxonName` was declared required, passed by content files, and never
    // destructured — three links shared indistinguishable accessible names.
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(3);
    for (const link of links) {
      expect(link.getAttribute("aria-label")).toContain("Ceiba pentandra");
    }
  });
});

describe("ComparisonTable", () => {
  const rows = [
    { property: "Dureza", pilon: "~470 lbf", teak: "1,070", cedar: "350" },
  ];

  it("localizes headers for Spanish content", () => {
    render(<ComparisonTable rows={rows} locale="es" />);

    // content/trees/es/guanacaste.mdx rendered "Property/Teak/Cedar" above
    // Spanish data because these headers were hardcoded English literals.
    expect(screen.getByText("Propiedad")).toBeInTheDocument();
    expect(screen.getByText("Teca")).toBeInTheDocument();
    expect(screen.getByText("Cedro")).toBeInTheDocument();
  });

  it("keeps English headers for English content", () => {
    render(<ComparisonTable rows={rows} locale="en" />);

    expect(screen.getByText("Property")).toBeInTheDocument();
    expect(screen.getByText("Teak")).toBeInTheDocument();
    expect(screen.getByText("Cedar")).toBeInTheDocument();
  });
});
