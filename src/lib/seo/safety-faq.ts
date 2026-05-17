/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Schema.org FAQPage JSON-LD for the bilingual Safety guide.
 *
 * Master Plan v6.0 lane L12 — SEO / GEO / Discoverability.
 *
 * Why FAQPage on Safety: poison-emergency questions are exactly the
 * kind of query that an AI overview or search engine should answer
 * with an authoritative, sourced answer. The page already has the
 * underlying first-aid copy in `safety.page.*`; this helper restates
 * it in machine-readable form.
 *
 * The helper is intentionally pure (no `next-intl` import). The route
 * resolves translations server-side and hands the strings in. That
 * keeps the helper unit-testable for both locales without spinning up
 * the i18n runtime.
 */

import type { Locale } from "@/types/tree";
import { SITE_BASE_URL } from "@/lib/citation";

export interface SafetyFaqStepSet {
  question: string;
  steps: string[];
}

export interface SafetyFaqPair {
  question: string;
  answer: string;
}

export interface SafetyFaqInput {
  locale: Locale;
  ingestion: SafetyFaqStepSet;
  skinContact: SafetyFaqStepSet;
  eyeContact: SafetyFaqStepSet;
  emergency: SafetyFaqPair;
}

/**
 * Render a list of imperative steps into a single numbered answer
 * string. The numbering uses Western Arabic digits (1., 2., 3., …),
 * which read correctly in both EN and ES — neither locale needs
 * special enumeration markers here. The numbered form helps AI
 * overviews preserve order when summarizing.
 */
function joinSteps(steps: string[]): string {
  return steps.map((step, idx) => `${idx + 1}. ${step}`).join(" ");
}

/**
 * Build the Schema.org FAQPage JSON-LD for the Safety guide. The
 * `mainEntity` array is the ordered list of Question/Answer pairs
 * (ingestion → skin contact → eye contact → emergency contacts).
 *
 * Schema reference: https://schema.org/FAQPage
 */
export function buildSafetyFaqJsonLd(
  input: SafetyFaqInput
): Record<string, unknown> {
  const { locale, ingestion, skinContact, eyeContact, emergency } = input;

  const pairs: SafetyFaqPair[] = [
    { question: ingestion.question, answer: joinSteps(ingestion.steps) },
    { question: skinContact.question, answer: joinSteps(skinContact.steps) },
    { question: eyeContact.question, answer: joinSteps(eyeContact.steps) },
    { question: emergency.question, answer: emergency.answer },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${SITE_BASE_URL}/${locale}/safety`,
    inLanguage: locale,
    mainEntity: pairs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}
