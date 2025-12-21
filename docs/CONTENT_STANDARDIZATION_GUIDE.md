# Tree Page Content Standardization Guide

> **Goal**: Bring all 107 tree pages up to a consistent, well-fleshed quality level WITHOUT losing any existing content.

## Executive Summary

**Current State Analysis** (December 2024):

- **Total tree pages**: 107 files
- **Page length distribution**:
  - 700+ lines (strong): 8 pages
  - 600-700 lines: 43 pages
  - 500-600 lines: 44 pages
  - Under 500 lines (needs work): 12 pages

## Pages Requiring Priority Attention

The following 12 pages are under 500 lines and should be enhanced first:

| Page             | Lines | Key Gaps                                                  |
| ---------------- | ----- | --------------------------------------------------------- |
| pitahaya.mdx     | 428   | Missing: Taxonomy section, External Resources, References |
| ciprecillo.mdx   | 433   | Format OK - unique as endangered species                  |
| pomarrosa.mdx    | 433   | Missing: Taxonomy, Growing section, References            |
| sotacaballo.mdx  | 439   | Missing: Uses expansion, External Resources               |
| icaco.mdx        | 444   | Missing: Taxonomy section, Growing details                |
| capulin.mdx      | 446   | Missing: Wood properties, Cultural significance           |
| cortez-negro.mdx | 449   | Missing: Cultural significance, Growing                   |
| guachipelin.mdx  | 449   | Missing: External Resources, Applications                 |
| aguacatillo.mdx  | 455   | Missing: Cultural details, Where to See                   |
| papaya.mdx       | 468   | Missing: Wood Properties, Taxonomy details                |
| carboncillo.mdx  | 484   | Missing: Cultural significance, Identification            |
| targua.mdx       | 498   | Missing: Uses expansion, Growing                          |

## Standard Page Template Structure

Based on analysis of the strongest pages (guanacaste, ceiba, almendro), here is the recommended standard structure:

### Required Sections (All Pages)

```markdown
---
[frontmatter - complete all fields]
---

# [Tree Name]

<Callout> [Key highlight/significance] </Callout>

<TwoColumn>
  <QuickRef /> 
  <INaturalistEmbed />
</TwoColumn>

---

## 📸 Photo Gallery

[5 high-quality images with proper attribution]

---

## Taxonomy & Classification

- PropertiesGrid with Kingdom through Species
- Common Names by Region (DataTable)
- Etymology and Taxonomic Notes

---

## Physical/Botanical Description

- Tree Form (height, trunk, crown, deciduous)
- Bark Characteristics
- Leaves (type, size, arrangement)
- Flowers (color, size, timing)
- Fruit/Seeds (description, timing)

---

## Geographic Distribution

- DistributionMap component (if applicable)
- Where found in Costa Rica (provinces, habitats)
- Elevation range

---

## Habitat & Ecology

- PropertiesGrid (elevation, climate, rainfall, soils)
- Ecological Role
- Wildlife Associations/Interactions
- Special adaptations

---

## Uses/Applications

- PropertiesGrid of main uses
- Traditional/Historical uses
- Modern applications
- Wood properties (for timber species)

---

## Cultural & Historical Significance

- Indigenous uses
- Regional importance
- Local names and meanings

---

## Conservation Status

- ConservationStatusBox (if applicable)
- Current threats
- Protection measures

---

## Growing [Tree Name] / Cultivation

- Propagation methods
- Growing requirements (sun, soil, water)
- Spacing and timing

---

## Where to See [Tree Name]

- National Parks/Reserves
- Accessible locations
- Urban specimens

---

## External Resources

- IUCN Red List
- iNaturalist
- Relevant botanical databases

---

## References

- Scientific papers
- Field guides
- Conservation assessments
```

### Section-Specific Guidelines

#### Taxonomy & Classification

**Must include**:

- Full classification (Kingdom → Species)
- Common names table by region/language
- Etymology of scientific name
- Any synonyms

**Example structure**:

```jsx
<PropertiesGrid>
  <PropertyCard icon="👑" label="Kingdom" value="Plantae" />
  <PropertyCard icon="🌸" label="Clade" value="Angiosperms" />
  <PropertyCard icon="🌿" label="Order" value="[Order]" />
  <PropertyCard icon="🪴" label="Family" value="[Family]" />
  <PropertyCard icon="🌳" label="Genus" value="[Genus]" />
  <PropertyCard icon="🔬" label="Species" value="[species]" />
</PropertiesGrid>
```

#### Physical Description

**Must include for each species type**:

For **timber trees**:

- Height, trunk diameter, crown spread
- Bark (color, texture, thickness)
- Leaves (type, size, arrangement, color)
- Flowers (timing, color, size, fragrance)
- Fruit/Seeds (size, color, dispersal)

For **fruit trees**:

- Growth form
- Fruit characteristics (detailed)
- Nutritional information (DataTable)
- Harvest information

For **palms**:

- Trunk characteristics
- Frond description
- Inflorescence
- Fruit

#### Wood Properties (Timber Species Only)

**Must include**:

- ColorSwatch for sapwood/heartwood
- Physical properties (Janka hardness, density, workability)
- StatsGroup visual bars
- Comparison with similar woods
- Working characteristics

#### Uses/Applications

**Organize by category**:

```jsx
<PropertiesGrid>
  <PropertyCard icon="🪑" label="Furniture" value="..." />
  <PropertyCard icon="🏗️" label="Construction" value="..." />
  <PropertyCard icon="💊" label="Medicine" value="..." />
  <PropertyCard icon="🍽️" label="Food" value="..." />
</PropertiesGrid>
```

#### External Resources

**Standard links to include**:

```jsx
<ExternalLinksGrid>
  <ExternalLink
    title="IUCN Red List"
    url="https://www.iucnredlist.org/species/..."
    description="Conservation assessment"
  />
  <ExternalLink
    title="iNaturalist"
    url="https://www.inaturalist.org/taxa/..."
    description="Community observations and photos"
  />
  <ExternalLink
    title="Tropicos"
    url="https://www.tropicos.org/..."
    description="Botanical database"
  />
</ExternalLinksGrid>
```

## Section Frequency Audit

Current coverage across 107 pages:

| Section                        | Pages with Section | Target             |
| ------------------------------ | ------------------ | ------------------ |
| Taxonomy                       | 103 (96%)          | 100%               |
| Distribution                   | 106 (99%)          | 100%               |
| Habitat                        | 94 (88%)           | 100%               |
| Ecology                        | 38 (35%)           | 75%+               |
| Physical/Botanical Description | 79/28 (74%/26%)    | 100%               |
| Wood Properties                | 37 (35%)           | All timber species |
| Uses/Applications              | 99/34 (93%/32%)    | 100%               |
| Cultural Significance          | 51 (48%)           | 75%+               |
| Conservation                   | 65 (61%)           | 100%               |
| Growing/Cultivation            | 97/70 (91%/65%)    | 100%               |
| External Resources             | 83 (78%)           | 100%               |
| References                     | 103 (96%)          | 100%               |
| Where to See                   | 78 (73%)           | 100%               |
| Similar Species                | 28 (26%)           | 50%+               |
| Identification Guide           | 60 (56%)           | 75%+               |

## Component Inventory

Standard MDX components used in well-developed pages:

### Layout Components

- `<TwoColumn>` / `<Column>` - Side-by-side content
- `<Accordion>` / `<AccordionItem>` - Collapsible sections
- `<ImageGallery>` / `<ImageCard>` - Photo galleries

### Data Display

- `<PropertiesGrid>` / `<PropertyCard>` - Key stats
- `<DataTable>` - Tabular information
- `<SimpleList>` - Bullet points with labels
- `<StatsGroup>` / `<StatBar>` - Visual statistics
- `<ColorSwatch>` - Wood/bark colors
- `<ComparisonTable>` - Side-by-side comparisons

### Callouts & Feature Boxes

- `<Callout type="info|success|warning|error|tip">` - Highlighted info
- `<FeatureBox>` - Prominent feature sections
- `<QuickRef>` - Quick reference cards

### Species-Specific

- `<INaturalistEmbed>` - iNaturalist integration
- `<DistributionMap>` - Geographic distribution
- `<ConservationStatusBox>` - IUCN status

### External Links

- `<ExternalLinksGrid>` / `<ExternalLink>` - Resource links
- `<ReferencesSection>` / `<Reference>` - Academic citations

## Content Enhancement Process

### Phase 1: Add Missing Standard Sections

1. Audit each weak page against the template
2. Add missing section headers
3. Fill with appropriate placeholder content
4. Mark sections needing research with `{/* TODO: Research needed */}`

### Phase 2: Enhance Existing Content

1. Convert plain text to MDX components
2. Add data tables where applicable
3. Include comparison information
4. Add visual elements (stats bars, property cards)

### Phase 3: Add Depth

1. Research traditional/cultural uses
2. Add ecological relationships
3. Include conservation context
4. Add "Where to See" locations

### Phase 4: Final Polish

1. Ensure consistent formatting
2. Verify all links work
3. Check image attributions
4. Cross-reference related species

## Quality Checklist

Before considering a page "complete":

- [ ] All frontmatter fields populated
- [ ] 5+ quality photos in gallery with proper attribution
- [ ] Taxonomy section with full classification
- [ ] Physical description covers all key features
- [ ] Distribution includes Costa Rica-specific info
- [ ] At least 3 documented uses
- [ ] Growing/cultivation information
- [ ] External Resources section (min 3 links)
- [ ] References section (min 2 sources)
- [ ] Consistent MDX component usage
- [ ] No broken links or missing images

## Preservation Rules

**CRITICAL**: When enhancing pages:

1. **Never delete existing content** - only add to it
2. **Preserve unique perspectives** - some pages have species-specific angles (like ciprecillo's conservation focus)
3. **Keep existing image galleries** - only add, don't replace
4. **Maintain author voice** - enhance, don't rewrite
5. **Keep regional specificity** - don't genericize Costa Rica-specific content

## Sample Enhancement: Pitahaya

Current (428 lines) → Target (600+ lines)

**Missing sections to add**:

1. ✅ Taxonomy & Classification (add full structure)
2. ✅ External Resources section
3. ✅ References section with scientific sources
4. 🔲 Where to See in Costa Rica
5. 🔲 Expand Cultural Significance (Mesoamerican use)

**Content to enhance**:

1. Add PropertiesGrid to Distribution section
2. Expand Ecological Role with wildlife DataTable
3. Add Traditional/Medicinal uses accordion

---

_This guide should be updated as pages are enhanced and patterns emerge._
_Last updated: December 2024_
