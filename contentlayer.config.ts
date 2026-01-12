/**
 * Copyright (c) 2024-present sandgraal
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * 
 * This file is part of Costa Rica Tree Atlas.
 * See LICENSE file in the project root for full license information.
 */

import { defineDocumentType, makeSource } from "contentlayer2/source-files";

export const Tree = defineDocumentType(() => ({
  name: "Tree",
  filePathPattern: `trees/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "The common name of the tree",
      required: true,
    },
    scientificName: {
      type: "string",
      description: "The scientific (Latin) name of the tree",
      required: true,
    },
    family: {
      type: "string",
      description: "The botanical family",
      required: true,
    },
    locale: {
      type: "enum",
      options: ["en", "es"],
      description: "The language of the content",
      required: true,
    },
    slug: {
      type: "string",
      description: "URL-friendly identifier for the tree",
      required: true,
    },
    description: {
      type: "string",
      description: "A brief description for SEO",
      required: true,
    },
    nativeRegion: {
      type: "string",
      description: "Native region or distribution",
      required: false,
    },
    conservationStatus: {
      type: "string",
      description: "IUCN conservation status if known",
      required: false,
    },
    maxHeight: {
      type: "string",
      description: "Maximum height the tree can reach",
      required: false,
    },
    uses: {
      type: "list",
      of: { type: "string" },
      description: "Common uses of the tree",
      required: false,
    },
    tags: {
      type: "list",
      of: { type: "string" },
      description:
        "Characteristic tags (deciduous, evergreen, flowering, fruit-bearing, native, endangered, etc.)",
      required: false,
    },
    distribution: {
      type: "list",
      of: { type: "string" },
      description:
        "Geographic distribution regions in Costa Rica (e.g., guanacaste, puntarenas, limon, san-jose, alajuela, cartago, heredia, pacific-coast, caribbean-coast, central-valley, northern-zone)",
      required: false,
    },
    elevation: {
      type: "string",
      description: "Elevation range where the tree is found (e.g., '0-1500m')",
      required: false,
    },
    floweringSeason: {
      type: "list",
      of: { type: "string" },
      description:
        "Months when the tree flowers (e.g., ['january', 'february', 'march'])",
      required: false,
    },
    fruitingSeason: {
      type: "list",
      of: { type: "string" },
      description:
        "Months when the tree bears fruit (e.g., ['april', 'may', 'june'])",
      required: false,
    },
    featuredImage: {
      type: "string",
      description: "Path to the featured image",
      required: false,
    },
    images: {
      type: "list",
      of: { type: "string" },
      description: "Additional image paths",
      required: false,
    },
    publishedAt: {
      type: "date",
      description: "Publication date",
      required: false,
    },
    updatedAt: {
      type: "date",
      description: "Last update date",
      required: false,
    },
    // Safety Information Fields
    toxicityLevel: {
      type: "enum",
      options: ["none", "low", "moderate", "high", "severe"],
      description: "Overall toxicity level for ingestion risk",
      required: false,
    },
    toxicParts: {
      type: "list",
      of: { type: "string" },
      description:
        "Which parts are dangerous (e.g., seeds, sap, leaves, bark, all, fruit, flowers, roots)",
      required: false,
    },
    skinContactRisk: {
      type: "enum",
      options: ["none", "low", "moderate", "high", "severe"],
      description: "Risk level for skin contact (dermatitis, chemical burns)",
      required: false,
    },
    allergenRisk: {
      type: "enum",
      options: ["none", "low", "moderate", "high"],
      description: "Allergenic risk level (pollen, contact allergies)",
      required: false,
    },
    structuralRisks: {
      type: "list",
      of: { type: "string" },
      description:
        "Physical/structural hazards (e.g., falling-branches, sharp-spines, explosive-pods, aggressive-roots, brittle-wood, heavy-fruit)",
      required: false,
    },
    childSafe: {
      type: "boolean",
      description: "Whether the tree is safe around children",
      required: false,
    },
    petSafe: {
      type: "boolean",
      description: "Whether the tree is safe around pets",
      required: false,
    },
    requiresProfessionalCare: {
      type: "boolean",
      description: "Whether the tree requires professional care/handling",
      required: false,
    },
    toxicityDetails: {
      type: "string",
      description:
        "Detailed description of toxicity, compounds, symptoms, first aid",
      required: false,
    },
    skinContactDetails: {
      type: "string",
      description: "Detailed description of skin contact risks and effects",
      required: false,
    },
    allergenDetails: {
      type: "string",
      description: "Detailed description of allergenic properties",
      required: false,
    },
    structuralRiskDetails: {
      type: "string",
      description: "Detailed description of structural/physical hazards",
      required: false,
    },
    safetyNotes: {
      type: "string",
      description:
        "General safety notes, warnings, or precautions for this tree",
      required: false,
    },
    wildlifeRisks: {
      type: "string",
      description:
        "Specific risks to wildlife, birds, or domestic animals beyond pets",
      required: false,
    },
    // Care & Cultivation Fields
    growthRate: {
      type: "enum",
      options: ["slow", "moderate", "fast"],
      description: "Tree growth rate",
      required: false,
    },
    growthRateDetails: {
      type: "string",
      description: "Growth rate details (e.g., '2-3 ft/year')",
      required: false,
    },
    matureSize: {
      type: "string",
      description:
        "Mature height and spread (e.g., '40-60 ft tall, 30-40 ft spread')",
      required: false,
    },
    hardiness: {
      type: "string",
      description: "Hardiness zones or Costa Rican climate regions",
      required: false,
    },
    soilRequirements: {
      type: "string",
      description: "Soil type, drainage, pH tolerance",
      required: false,
    },
    waterNeeds: {
      type: "enum",
      options: ["low", "moderate", "high"],
      description: "Water requirements",
      required: false,
    },
    waterDetails: {
      type: "string",
      description: "Detailed watering information",
      required: false,
    },
    lightRequirements: {
      type: "enum",
      options: ["full-sun", "partial-shade", "shade-tolerant"],
      description: "Light requirements",
      required: false,
    },
    spacing: {
      type: "string",
      description: "Minimum spacing from buildings, other trees, utilities",
      required: false,
    },
    propagationMethods: {
      type: "list",
      of: { type: "string" },
      description: "Propagation methods (seeds, cuttings, grafting, etc.)",
      required: false,
    },
    propagationDifficulty: {
      type: "enum",
      options: ["easy", "moderate", "difficult"],
      description: "Difficulty level for propagation",
      required: false,
    },
    plantingSeason: {
      type: "string",
      description: "Best planting season for Costa Rican climate",
      required: false,
    },
    maintenanceNeeds: {
      type: "string",
      description: "Pruning, fertilization, pest monitoring requirements",
      required: false,
    },
    commonProblems: {
      type: "list",
      of: { type: "string" },
      description: "Common problems and issues",
      required: false,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (tree) => `/${tree.locale}/trees/${tree.slug}`,
    },
  },
}));

export const GlossaryTerm = defineDocumentType(() => ({
  name: "GlossaryTerm",
  filePathPattern: `glossary/**/*.mdx`,
  contentType: "mdx",
  fields: {
    term: {
      type: "string",
      description: "The glossary term",
      required: true,
    },
    locale: {
      type: "enum",
      options: ["en", "es"],
      description: "The language of the content",
      required: true,
    },
    slug: {
      type: "string",
      description: "URL-friendly identifier for the term",
      required: true,
    },
    simpleDefinition: {
      type: "string",
      description: "Simple, beginner-friendly definition",
      required: true,
    },
    technicalDefinition: {
      type: "string",
      description: "Technical, detailed definition",
      required: false,
    },
    category: {
      type: "enum",
      options: [
        "anatomy",
        "ecology",
        "taxonomy",
        "morphology",
        "reproduction",
        "general",
      ],
      description: "Category of the term",
      required: true,
    },
    pronunciation: {
      type: "string",
      description: "Pronunciation guide (for scientific terms)",
      required: false,
    },
    etymology: {
      type: "string",
      description: "Etymology or word origin",
      required: false,
    },
    exampleSpecies: {
      type: "list",
      of: { type: "string" },
      description: "Tree slugs that demonstrate this term",
      required: false,
    },
    relatedTerms: {
      type: "list",
      of: { type: "string" },
      description: "Related glossary term slugs",
      required: false,
    },
    image: {
      type: "string",
      description: "Illustration or diagram",
      required: false,
    },
    publishedAt: {
      type: "date",
      description: "Publication date",
      required: false,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (term) => `/${term.locale}/glossary/${term.slug}`,
    },
  },
}));

export const SpeciesComparison = defineDocumentType(() => ({
  name: "SpeciesComparison",
  filePathPattern: `comparisons/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "Comparison title",
      required: true,
    },
    locale: {
      type: "enum",
      options: ["en", "es"],
      description: "The language of the content",
      required: true,
    },
    slug: {
      type: "string",
      description: "URL-friendly identifier",
      required: true,
    },
    species: {
      type: "list",
      of: { type: "string" },
      description: "Tree slugs being compared",
      required: true,
    },
    keyDifference: {
      type: "string",
      description: "The main differentiating feature",
      required: true,
    },
    description: {
      type: "string",
      description: "Brief description for SEO",
      required: true,
    },
    publishedAt: {
      type: "date",
      description: "Publication date",
      required: false,
    },
  },
  computedFields: {
    url: {
      type: "string",
      resolve: (comparison) =>
        `/${comparison.locale}/compare/${comparison.slug}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Tree, GlossaryTerm, SpeciesComparison],
  disableImportAliasWarning: true,
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
