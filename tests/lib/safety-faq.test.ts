/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 */

import { describe, expect, it } from "vitest";

import { buildSafetyFaqJsonLd } from "@/lib/seo/safety-faq";
import type { SafetyFaqInput } from "@/lib/seo/safety-faq";

function sampleInput(locale: "en" | "es"): SafetyFaqInput {
  return {
    locale,
    ingestion: {
      question: "Q-ingest",
      steps: ["i1", "i2", "i3"],
    },
    skinContact: {
      question: "Q-skin",
      steps: ["s1", "s2"],
    },
    eyeContact: {
      question: "Q-eye",
      steps: ["e1", "e2"],
    },
    emergency: {
      question: "Q-emergency",
      answer: "Call 2223-1028.",
    },
  };
}

describe("buildSafetyFaqJsonLd", () => {
  it("emits a Schema.org FAQPage with one Question per topic", () => {
    const ld = buildSafetyFaqJsonLd(sampleInput("en"));
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("FAQPage");

    const mainEntity = ld.mainEntity as Array<Record<string, unknown>>;
    expect(Array.isArray(mainEntity)).toBe(true);
    expect(mainEntity).toHaveLength(4);
    mainEntity.forEach((q) => {
      expect(q["@type"]).toBe("Question");
      expect(typeof q.name).toBe("string");
      const ans = q.acceptedAnswer as Record<string, unknown>;
      expect(ans["@type"]).toBe("Answer");
      expect(typeof ans.text).toBe("string");
      expect((ans.text as string).length).toBeGreaterThan(0);
    });
  });

  it("numbers multi-step answers in order so AI overviews preserve sequence", () => {
    const ld = buildSafetyFaqJsonLd(sampleInput("en"));
    const mainEntity = ld.mainEntity as Array<Record<string, unknown>>;
    const ingestion = mainEntity[0].acceptedAnswer as Record<string, unknown>;
    expect(ingestion.text).toBe("1. i1 2. i2 3. i3");
  });

  it("uses the emergency answer verbatim (single-paragraph form, no numbering)", () => {
    const ld = buildSafetyFaqJsonLd(sampleInput("en"));
    const mainEntity = ld.mainEntity as Array<Record<string, unknown>>;
    const emergency = mainEntity[3].acceptedAnswer as Record<string, unknown>;
    expect(emergency.text).toBe("Call 2223-1028.");
  });

  it("emits the correct locale-scoped URL and inLanguage for ES", () => {
    const ld = buildSafetyFaqJsonLd(sampleInput("es"));
    expect(ld.url).toBe("https://costaricatreeatlas.com/es/safety");
    expect(ld.inLanguage).toBe("es");
  });

  it("emits the correct locale-scoped URL and inLanguage for EN", () => {
    const ld = buildSafetyFaqJsonLd(sampleInput("en"));
    expect(ld.url).toBe("https://costaricatreeatlas.com/en/safety");
    expect(ld.inLanguage).toBe("en");
  });

  it("preserves question text exactly as provided (no translation in helper)", () => {
    const ld = buildSafetyFaqJsonLd(sampleInput("en"));
    const mainEntity = ld.mainEntity as Array<Record<string, unknown>>;
    expect(mainEntity.map((q) => q.name)).toEqual([
      "Q-ingest",
      "Q-skin",
      "Q-eye",
      "Q-emergency",
    ]);
  });
});
