---
name: add-species
description: |
  Guided addition of a new tree species to the atlas. Produces mirrored
  EN and ES MDX files with full frontmatter, image fetch from
  iNaturalist, gallery population, and verification.

  Trigger phrases: "add a species", "add <species> to the atlas",
  "create a new tree page for <species>".
---

# Add a new tree species

The atlas's coverage target is Deep-250 (see
[../../docs/IMPLEMENTATION_PLAN.md](../../docs/IMPLEMENTATION_PLAN.md) lane
L3). Each new species lands at **Tier 1 (Encyclopedic)** depth: ≥600 EN /
≥500 ES lines, ≥5 gallery images, ≥3 citations per high-risk section.

## Prerequisites

1. Confirm the slug is not taken: `ls content/trees/en/ | grep <slug>`
2. Confirm the species is in scope for Deep-250 (one of 8 ecoregions, not
   redundant with existing coverage).
3. Look up canonical IDs:
   - POWO: `https://powo.science.kew.org/results?q=<scientificName>`
   - GBIF: `https://www.gbif.org/species/search?q=<scientificName>`
   - IUCN: `https://www.iucnredlist.org/search?searchType=species`
4. Have at least 5 high-quality images identified (typically from
   iNaturalist with CC-BY or CC-BY-NC licenses).

## The procedure

### Step 1 — Choose a slug

Slug format: lowercase, hyphenated, Spanish or local-common name preferred
when distinctive (`cocobolo`, `ojoche`), scientific binomial when not.

### Step 2 — Generate frontmatter

Required fields (all present in `contentlayer.config.ts`):

```yaml
---
title: "<Display name (locale-appropriate)>"
scientificName: "<Genus species>"
family: "<Family>"
locale: "en" # or "es"
slug: "<slug>"
description: "<150–280 char SEO summary>"
nativeRegion: "<text>"
conservationStatus: "<LC|NT|VU|EN|CR|EW|EX|DD|NE>"
nameAuthority: "<e.g., Hemsl., (Sw.) DC.>"
gbifTaxonKey: <integer>
powoId: "<urn:lsid:ipni.org:names:...>"
iucnAssessmentId: "<numeric>"
iucnScope: "global"
citesAppendix: "<I|II|III|none>"
maxHeight: "<text>"
uses: [...]
tags: [...]
distribution: [...] # CR province slugs
elevation: "<range>"
floweringSeason: [...]
fruitingSeason: [...]
featuredImage: "/images/trees/<slug>.jpg"
publishedAt: "<YYYY-MM-DD>"
updatedAt: "<YYYY-MM-DD>"

# Safety
toxicityLevel: "<none|low|moderate|high|severe>"
toxicParts: [...]
skinContactRisk: ...
allergenRisk: ...
structuralRisks: [...]
childSafe: <true|false>
petSafe: <true|false>
requiresProfessionalCare: <true|false>
toxicityDetails: "..."
skinContactDetails: "..."
allergenDetails: "..."
structuralRiskDetails: "..."
safetyNotes: "..."
wildlifeRisks: "..."

# Care
growthRate: "<slow|moderate|fast>"
growthRateDetails: "..."
matureSize: "..."
hardiness: "..."
soilRequirements: "..."
waterNeeds: "..."
lightRequirements: "..."
# ... etc per schema
---
```

### Step 3 — Body sections (in order)

1. Opening `<Callout>` with the most striking fact
2. `<TwoColumn>` with `<QuickRef>` and `<INaturalistEmbed taxonId="<gbif-or-inat-id>" locale="en|es" />`
3. `## 📸 Photo Gallery` — `<ImageGallery>` with ≥5 `<ImageCard>` entries
4. `## Taxonomy`
5. `## Geographic Distribution` — Costa Rica context
6. `## Habitat`
7. `## Botanical Description` — bark, leaves, flowers, fruit
8. `## How to Identify` — field-ID features
9. `## Ecological Role`
10. `## Uses and Applications` — with citations
11. `## Cultural Significance` — sourced
12. `## Safety` — pull from safety frontmatter
13. `## Conservation Status` — IUCN + CITES + SINAC where applicable
14. `## External Resources` — `<ExternalLinksGrid>` with iNat, IUCN, POWO, GBIF
15. `## References` — `<ReferencesSection>` with `<Reference>` entries

### Step 4 — Mirror in ES

Translate to Costa Rican Spanish (see [content/CLAUDE.md](../../content/CLAUDE.md)).
Maintain field-for-field parity. Costa Rican common names take precedence
over the scientific name in `title`.

### Step 5 — Image fetch

Use the image manager:

```bash
node scripts/manage-tree-images.mjs download --tree=<slug>
node scripts/manage-tree-images.mjs refresh-gallery --tree=<slug>
node scripts/optimize-images.mjs --tree=<slug>
```

### Step 6 — Verify

```bash
npx contentlayer2 build
npx vitest run tests/content-validation.test.ts tests/conservation-status-i18n.test.tsx tests/route-regression.test.ts
node scripts/audit-content-quality.mjs
node scripts/audit-factual-accuracy.mjs --tree=<slug>
```

All four must pass and the new species must score Tier 1 in `audit-content-quality`.

### Step 7 — Commit

```
feat(content): add <slug> (<Scientific name>) — <ecoregion>

<Two-sentence ecological + cultural framing.>

- EN: <line count>
- ES: <line count>
- Gallery: <N> images, all attributed
- Canonical IDs: POWO, GBIF, IUCN
- IUCN: <code> (<assessment year>)

Closes #<issue if applicable>
Advances L3 Deep-250 (now N/250).
```

## Indigenous content

If the species has known indigenous names (Bribrí, Cabécar, Maleku,
Boruca, Térraba, Ngäbe, Huetar, Chorotega), DO NOT add them in this PR.
Open a separate issue with `needs-indigenous-review` and the proposed
content. The atlas's indigenous-content governance requires explicit
consent from a community-appropriate source.

The `indigenousNames` field in frontmatter exists for that future PR;
leave it empty for now.
