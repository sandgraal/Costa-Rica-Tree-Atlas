/**
 * Glossary type definitions
 */

import { Locale } from "./tree";

export type GlossaryCategory =
  | "anatomy"
  | "ecology"
  | "taxonomy"
  | "morphology"
  | "reproduction"
  | "general"
  | "timber";

export interface GlossaryTerm {
  _id: string;
  _raw: unknown;
  term: string;
  locale: Locale;
  slug: string;
  simpleDefinition: string;
  technicalDefinition?: string;
  category: GlossaryCategory;
  pronunciation?: string;
  etymology?: string;
  exampleSpecies?: string[];
  relatedTerms?: string[];
  image?: string;
  publishedAt?: string;
  body: {
    raw: string;
    code: string;
  };
  url: string;
}

export interface SpeciesComparison {
  _id: string;
  _raw: unknown;
  title: string;
  locale: Locale;
  slug: string;
  species: string[];
  keyDifference: string;
  description: string;
  publishedAt?: string;
  body: {
    raw: string;
    code: string;
  };
  url: string;
}

export interface GlossaryFilter {
  category?: GlossaryCategory;
  search?: string;
}
