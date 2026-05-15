/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Code is MIT-licensed. Editorial content and the species dataset are
 * separately licensed under CC BY 4.0 (see LICENSE-CONTENT.md and
 * LICENSE-DATA.md). Indigenous knowledge content is governed by
 * docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md regardless of license.
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
      type: "enum",
      options: ["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD", "NE"],
      description: "IUCN conservation status code",
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
    // Indigenous & Cultural Names
    indigenousNames: {
      type: "json",
      description:
        "Indigenous names from Costa Rican peoples. JSON array of objects with fields: language (e.g., 'Bribri', 'Cabécar', 'Maleku', 'Boruca', 'Ngäbe'), name, meaning (optional), source (optional)",
      required: false,
    },
    // Taxonomic Interoperability — canonical external IDs (P11)
    // All optional; populated via scripts/backfill-canonical-ids.mjs against POWO/WFO/GBIF/IPNI/Tropicos APIs.
    nameAuthority: {
      type: "string",
      description:
        "Author citation for the scientific name (e.g., 'Mill.', 'L.f.', '(Sw.) DC.'). Same value in both EN and ES files.",
      required: false,
    },
    powoId: {
      type: "string",
      description:
        "Plants of the World Online (Kew) identifier, typically an IPNI LSID (e.g., 'urn:lsid:ipni.org:names:317423-2').",
      required: false,
    },
    wfoId: {
      type: "string",
      description: "World Flora Online identifier (e.g., 'wfo-0000642308').",
      required: false,
    },
    ipniId: {
      type: "string",
      description:
        "International Plant Names Index identifier (e.g., '317423-2').",
      required: false,
    },
    gbifTaxonKey: {
      type: "number",
      description:
        "GBIF taxon key (integer). Required for the factual-accuracy audit pipeline to resolve external IUCN/family checks.",
      required: false,
    },
    tropicosId: {
      type: "string",
      description: "Missouri Botanical Garden Tropicos identifier.",
      required: false,
    },
    synonyms: {
      type: "json",
      description:
        "JSON array of historical synonyms / basionyms. Each entry: { name, authority, source (optional, e.g. 'POWO'), kind (optional: 'basionym' | 'synonym' | 'homonym') }.",
      required: false,
    },
    // IUCN Red List assessment metadata (P11) — supplements the conservationStatus code field above.
    // When present, the visible UI should render full assessment context (year, criteria, scope, rationale).
    iucnAssessmentId: {
      type: "string",
      description:
        "IUCN Red List assessment ID (the numeric ID from iucnredlist.org/species/<id>/<assessment>).",
      required: false,
    },
    iucnAssessmentYear: {
      type: "number",
      description:
        "Year of the cited IUCN assessment (e.g., 2019). Used to surface staleness in audits.",
      required: false,
    },
    iucnCriteria: {
      type: "string",
      description:
        "IUCN criteria string when the status is threatened (e.g., 'A2cd', 'B1ab(iii)'). Optional for LC/NT/DD/NE.",
      required: false,
    },
    iucnScope: {
      type: "enum",
      options: ["global", "regional"],
      description:
        "Whether the cited assessment is global or regional. Default: global. If 'regional', a regional source must be cited.",
      required: false,
    },
    // CITES Appendix listing — independent of IUCN status.
    citesAppendix: {
      type: "enum",
      options: ["I", "II", "III", "none"],
      description:
        "CITES Appendix listing for international trade regulation. 'none' means not listed.",
      required: false,
    },
    // Costa Rica national conservation status (Decreto 25700-MINAE / SINAC).
    // Not all species are nationally listed; this should not be inferred from the global IUCN status.
    sinacNationalStatus: {
      type: "string",
      description:
        "Costa Rica national conservation status per SINAC / Decreto 25700-MINAE (e.g., 'En peligro de extinción', 'Con poblaciones reducidas', 'Aprovechamiento prohibido'). Source must be cited in the MDX body.",
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
        "timber",
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
    // NEW: Visual enhancement fields
    featuredImages: {
      type: "list",
      of: { type: "string" },
      description:
        "Two featured image paths for hero section (one per species, in species order)",
      required: false,
    },
    confusionRating: {
      type: "number",
      description:
        "How often these species are confused (1-5, where 5 = extremely often confused). This numeric value is the same across all locales; labels are localized in the UI.",
      required: false,
    },
    comparisonTags: {
      type: "list",
      of: { type: "string" },
      description:
        "Visual features to compare. MUST use English values (leaves, bark, fruit, flowers, size, habitat, trunk, seeds, crown, roots) across ALL locale files. These are internal identifiers displayed with icons in the UI.",
      required: false,
    },
    seasonalNote: {
      type: "string",
      description:
        "When differences are most/least visible (e.g., 'Best distinguished during flowering: Dec-Feb'). This is user-facing text that should be translated for each locale.",
      required: false,
    },
    difficulty: {
      type: "enum",
      options: ["easy", "moderate", "challenging"],
      description:
        "How difficult it is to tell these species apart. MUST use these exact English enum values (easy, moderate, challenging) in ALL locale files, including Spanish. The UI automatically localizes display labels (Fácil, Moderado, Desafiante).",
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
      resolve: (comparison) =>
        `/${comparison.locale}/compare/${comparison.slug}`,
    },
  },
}));

export const OralHistory = defineDocumentType(() => ({
  name: "OralHistory",
  filePathPattern: `oral-histories/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      description: "Title of the oral history entry",
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
    description: {
      type: "string",
      description: "Brief description for SEO and previews",
      required: true,
    },
    narrator: {
      type: "string",
      description:
        "Name of the person sharing the story (or 'Community Elder' etc.)",
      required: true,
    },
    community: {
      type: "string",
      description:
        "Indigenous community or region (e.g., 'Bribri', 'Cabécar', 'Maleku', 'Boruca')",
      required: true,
    },
    region: {
      type: "string",
      description:
        "Geographic region in Costa Rica (e.g., 'Talamanca', 'San Carlos')",
      required: false,
    },
    relatedTrees: {
      type: "list",
      of: { type: "string" },
      description: "Tree slugs mentioned in this oral history",
      required: false,
    },
    themes: {
      type: "list",
      of: { type: "string" },
      description:
        "Thematic tags (e.g., 'medicine', 'ceremony', 'food', 'construction', 'mythology')",
      required: false,
    },
    recordedDate: {
      type: "string",
      description: "When the story was recorded (approximate or exact)",
      required: false,
    },
    featuredImage: {
      type: "string",
      description: "Featured image path for the entry",
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
      resolve: (entry) => `/${entry.locale}/oral-histories/${entry.slug}`,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Tree, GlossaryTerm, SpeciesComparison, OralHistory],
  disableImportAliasWarning: true,
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});
