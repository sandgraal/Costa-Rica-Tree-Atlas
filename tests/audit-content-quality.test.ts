/**
 * Content Quality Auditor Tests
 *
 * Regression coverage for scripts/audit-content-quality.mjs. The auditor's
 * heading matchers previously assumed section headings started with an
 * exact English word ("## Gallery", "## Applications") right after "## ".
 * Real tree pages use emoji-prefixed, reordered, and Spanish headings
 * ("## 📸 Photo Gallery", "## Uses & Applications", "## Hábitat y Ecología"),
 * which produced false-positive findings on every tree page. These tests
 * pin the fixed matching behavior and guard against regressing to the old,
 * heading-prefix-anchored logic.
 */

import { describe, it, expect } from "vitest";
import {
  checkSections,
  countGalleryImages,
} from "../scripts/audit-content-quality.mjs";

describe("countGalleryImages", () => {
  it("counts ImageCard entries under the emoji-prefixed EN gallery heading", () => {
    const content = `
## 📸 Photo Gallery

<ImageGallery>
  <ImageCard src="/a.jpg" />
  <ImageCard src="/b.jpg" />
</ImageGallery>

## Taxonomy
Some other content with <ImageCard not-in-gallery /> mentioned.
`;
    expect(countGalleryImages(content)).toBe(2);
  });

  it("counts ImageCard entries under Spanish gallery heading variants", () => {
    const withAccentedHeading = `
## 📸 Galería de Fotos

<ImageGallery>
  <ImageCard src="/a.jpg" />
</ImageGallery>

## Hábitat
`;
    expect(countGalleryImages(withAccentedHeading)).toBe(1);

    const withUnaccentedHeading = `
## Galeria fotografica

<ImageCard src="/a.jpg" />
<ImageCard src="/b.jpg" />
<ImageCard src="/c.jpg" />

## Referencias
`;
    expect(countGalleryImages(withUnaccentedHeading)).toBe(3);
  });

  it("stops counting at the next heading, not later sections", () => {
    const content = `
## 📸 Photo Gallery

<ImageCard src="/a.jpg" />

## Similar Species

<ImageCard src="/comparison-a.jpg" />
<ImageCard src="/comparison-b.jpg" />
`;
    expect(countGalleryImages(content)).toBe(1);
  });

  it("returns 0 when there is no gallery heading at all", () => {
    const content = `
## Taxonomy
No gallery here.

## Conservation
<ImageCard src="/not-counted.jpg" />
`;
    expect(countGalleryImages(content)).toBe(0);
  });
});

describe("checkSections", () => {
  it("recognizes 'Uses and Applications' / 'Uses & Applications' as satisfying Applications", () => {
    const base = (heading: string) => `## ${heading}\nSome uses content.\n`;

    expect(
      checkSections(base("Uses and Applications")).missingSections
    ).not.toContain("Applications");
    expect(
      checkSections(base("Uses & Applications")).missingSections
    ).not.toContain("Applications");
  });

  it("recognizes Spanish headings for every required section", () => {
    const content = `
## 📸 Galería de Fotos
## Taxonomía
## Distribución Geográfica
## Hábitat y Ecología
## Descripción Física
## Usos y Aplicaciones
## Significado Cultural
## Estado de Conservación
`;
    expect(checkSections(content).missingSections).toEqual([]);
  });

  it("recognizes the full canonical EN template as satisfying every required section", () => {
    const content = `
## 📸 Photo Gallery
## Taxonomy & Classification
## Geographic Distribution
## Habitat & Ecology
## Physical/Botanical Description
## Uses/Applications
## Cultural & Historical Significance
## Conservation Status
`;
    expect(checkSections(content).missingSections).toEqual([]);
  });

  it("still flags a genuinely missing required section", () => {
    const content = `
## 📸 Photo Gallery
## Taxonomy
## Geographic Distribution
## Habitat
## Botanical Description
## Applications
## Cultural
`;
    // Conservation heading omitted on purpose.
    expect(checkSections(content).missingSections).toEqual(["Conservation"]);
  });

  it("does not match a required-section keyword occurring only in body prose", () => {
    const content = `
## Introduction
This tree has no dedicated conservation section, though conservation is
mentioned here in passing prose, not as a heading.
`;
    expect(checkSections(content).missingSections).toContain("Conservation");
  });

  it("treats Growing and Cultivation as one combined recommended section, not two", () => {
    // A single Spanish "Cultivo" heading (or the canonical "Growing X /
    // Cultivation" heading) must not be double-counted as satisfying two
    // separate recommended sections.
    const spanish = checkSections("## Cultivo\n").missingRecommended;
    expect(spanish).not.toContain("Growing");
    expect(spanish).not.toContain("Cultivation");
    expect(spanish).not.toContain("Growing / Cultivation");

    const missingEntirely = checkSections("## Taxonomy\n").missingRecommended;
    expect(missingEntirely).toContain("Growing / Cultivation");
    expect(missingEntirely).not.toContain("Growing");
    expect(missingEntirely).not.toContain("Cultivation");
  });
});
