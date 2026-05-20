/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";

import {
  DATASET_DOI,
  citationMetaTags,
  datasetJsonLd,
  formatAPA,
  formatBibTeX,
  formatMLA,
  hasMintedDOI,
} from "@/lib/citation";

const SAMPLE_TREE = {
  title: "Cocobolo",
  scientificName: "Dalbergia retusa",
  slug: "cocobolo",
  nameAuthority: "Hemsl.",
  updatedAt: "2026-01-15",
  publishedAt: "2024-09-01",
};

describe("citation library", () => {
  describe("DATASET_DOI placeholder", () => {
    it("ships as a placeholder (not a real Zenodo DOI)", () => {
      expect(DATASET_DOI).toContain("PENDING");
      expect(hasMintedDOI(DATASET_DOI)).toBe(false);
    });

    it("hasMintedDOI accepts a real Zenodo pattern", () => {
      expect(hasMintedDOI("10.5281/zenodo.7654321")).toBe(true);
      expect(hasMintedDOI("10.5281/zenodo.PENDING")).toBe(false);
      expect(hasMintedDOI("not-a-doi")).toBe(false);
    });
  });

  describe("formatAPA", () => {
    it("emits APA 7 form in English with full scientific name + authority", () => {
      const out = formatAPA(SAMPLE_TREE, "en");
      expect(out).toContain("Cocobolo (Dalbergia retusa Hemsl.)");
      expect(out).toContain("(2026)");
      expect(out).toContain("Costa Rica Tree Atlas — Species Corpus");
      expect(out).toContain("https://costaricatreeatlas.org/en/trees/cocobolo");
    });

    it("emits APA in Spanish with the ES dataset title and URL", () => {
      const out = formatAPA(SAMPLE_TREE, "es");
      expect(out).toContain(
        "Atlas de Árboles de Costa Rica — Corpus de Especies"
      );
      expect(out).toContain("https://costaricatreeatlas.org/es/trees/cocobolo");
    });
  });

  describe("formatMLA", () => {
    it("wraps the title in quotes and ends with a URL", () => {
      const out = formatMLA(SAMPLE_TREE, "en");
      expect(out).toMatch(/^".+\."/);
      expect(out).toMatch(/https:\/\/.+\.$/);
    });
  });

  describe("formatBibTeX", () => {
    it("emits a @misc entry with the per-page cite-key", () => {
      const out = formatBibTeX(SAMPLE_TREE, "en");
      expect(out).toContain("@misc{crta-cocobolo-2026,");
      expect(out).toContain(
        "author       = {{Costa Rica Tree Atlas contributors}}"
      );
      expect(out).toContain("year         = {2026}");
      expect(out).toContain("note         = {Licensed under CC BY 4.0.}");
    });

    it("omits the doi field while DATASET_DOI is a placeholder", () => {
      const out = formatBibTeX(SAMPLE_TREE, "en");
      expect(out).not.toMatch(/^\s+doi\s+=/m);
    });
  });

  describe("citationMetaTags", () => {
    it("emits Google Scholar style citation_ keys for a tree", () => {
      const tags = citationMetaTags(SAMPLE_TREE, "en");
      expect(tags.citation_title).toContain("Dalbergia retusa");
      expect(tags.citation_publication_date).toBe("2026");
      expect(tags.citation_journal_title).toContain("Species Corpus");
      expect(tags.citation_language).toBe("en");
      expect(tags.citation_public_url).toContain("/en/trees/cocobolo");
    });

    it("omits citation_doi while DATASET_DOI is a placeholder", () => {
      const tags = citationMetaTags(SAMPLE_TREE, "en");
      expect(tags.citation_doi).toBeUndefined();
    });
  });

  describe("datasetJsonLd", () => {
    it("emits a Schema.org Dataset with CC BY 4.0 license", () => {
      const ld = datasetJsonLd("en");
      expect(ld["@type"]).toBe("Dataset");
      expect(ld.license).toBe("https://creativecommons.org/licenses/by/4.0/");
      expect(ld.isAccessibleForFree).toBe(true);
      expect(ld.inLanguage).toEqual(["en", "es"]);
    });

    it("omits the identifier (DOI) field while DATASET_DOI is a placeholder", () => {
      const ld = datasetJsonLd("en");
      expect(ld.identifier).toBeUndefined();
    });

    it("varies title and description by locale", () => {
      const en = datasetJsonLd("en");
      const es = datasetJsonLd("es");
      expect(en.name).not.toBe(es.name);
      expect(en.description).not.toBe(es.description);
    });
  });
});
