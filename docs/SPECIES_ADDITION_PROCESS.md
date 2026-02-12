# Species Addition Process

**Last Updated:** 2026-02-12  
**Purpose:** Guide for reviewing the missing species list and adding new trees to the atlas

## Quick Reference

- **Current Species Count:** 154 documented (308 bilingual documents)
- **Last Major Update:** 2026-02-12 (1 species added: Quina)
- **Previous Major Update:** 2026-02-10 (1 species added: Granadillo)
- **Previous Major Update:** 2026-01-15 (4 species added: Sigua, Comenegro, Mayo, Lechoso Montañero)
- **Previous Major Update:** 2026-01-14 (2 species added)
- **Previous Major Update:** 2026-01-12 (12 species added)
- **Missing Species Remaining:** ~34 unique species (see [MISSING_SPECIES_LIST.md](./MISSING_SPECIES_LIST.md))
- **Quality Standard:** All species must have **100% safety data coverage** (13 required fields)

## Review Process

### Step 1: Verify Current State

Before adding new species, always verify what's already documented:

```bash
# Count existing species
ls -1 content/trees/en/*.mdx | wc -l
ls -1 content/trees/es/*.mdx | wc -l

# Check for specific species
ls content/trees/en/ | grep -i "species-slug"

# Find duplicates (same scientific name in multiple files)
grep -h "scientificName:" content/trees/en/*.mdx | sort | uniq -d
```

### Step 2: Cross-Reference Missing List

**⚠️ CRITICAL:** Always verify by scientific name, not common name!

1. Open `docs/MISSING_SPECIES_LIST.md`
2. **Before adding any species:**
   ```bash
   # Search for scientific name in existing content
   grep -r "scientificName:.*Genus species" content/trees/
   ```
3. Verify scientific names to avoid duplicates (same species, different common name)
   - Example: "Kerosén" and "Ron Ron" are both _Astronium graveolens_
   - Example: "Chilamate" and "Higuerón" are both _Ficus obtusifolia_
4. Check botanical databases (TROPICOS, IPNI) to confirm accepted name
5. Update the list to remove documented species

### Step 3: Update Documentation

When species are added, update these files:

1. **README.md** - Species count in "Features" section
2. **MISSING_SPECIES_LIST.md** - Remove documented species, update counts
3. **docs/SPECIES_ADDITION_PROCESS.md** - Update species count in Quick Reference
4. **docs/IMPLEMENTATION_PLAN.md** - Update any species count references

## Quality Standards for New Species

**Every new species MUST meet these standards:**

### ✅ Complete Frontmatter (Required)

See full schema in [contentlayer.config.ts](../contentlayer.config.ts) (lines 11-276). Minimum required:

**Core Fields (ALWAYS REQUIRED):**

```yaml
title: "Common Name" # String
scientificName: "Genus species" # String - UNIQUE identifier
family: "Familyaceae" # String
locale: "en" # Enum: "en" or "es"
slug: "common-name" # String - same across both languages
description: "Brief SEO description (150-160 chars)" # String
```

**Safety Fields (13 REQUIRED - 100% coverage for all species):**

```yaml
toxicityLevel: "none" # Enum: none, low, moderate, high, severe
toxicParts: [] # List: seeds, sap, leaves, bark, all, fruit, flowers, roots
skinContactRisk: "none" # Enum: none, low, moderate, high, severe
allergenRisk: "none" # Enum: none, low, moderate, high
structuralRisks: [] # List: falling-branches, sharp-spines, explosive-pods, aggressive-roots, brittle-wood, heavy-fruit
childSafe: true # Boolean
petSafe: true # Boolean
requiresProfessionalCare: false # Boolean
toxicityDetails: "" # String - detailed description
skinContactDetails: "" # String - detailed description
allergenDetails: "" # String - detailed description
structuralRiskDetails: "" # String - detailed description
safetyNotes: "" # String - general safety notes
```

**Highly Recommended Fields:**

```yaml
nativeRegion: "Pacific coast lowlands" # String
conservationStatus: "LC" # String: EX, EW, CR, EN, VU, NT, LC, DD, NE
maxHeight: "25-30 m" # String
elevation: "0-1500 m" # String
uses: ["timber", "ornamental"] # List of strings
tags: ["native", "deciduous"] # List of strings
distribution: ["guanacaste", "puntarenas"] # List - Costa Rican regions
floweringSeason: ["march", "april"] # List - lowercase month names
fruitingSeason: ["june", "july"] # List - lowercase month names
featuredImage: "/images/trees/slug/featured.jpg" # String - path
images: ["/images/trees/slug/01.jpg"] # List - additional images
```

**Care & Cultivation Fields (Optional but valuable):**

```yaml
growthRate: "moderate" # Enum: slow, moderate, fast
growthRateDetails: "2-3 ft/year" # String
matureSize: "40-60 ft tall" # String
hardiness: "Tropical lowlands" # String
soilRequirements: "Well-drained" # String
waterNeeds: "moderate" # Enum: low, moderate, high
waterDetails: "" # String
lightRequirements: "full-sun" # Enum: full-sun, partial-shade, shade-tolerant
spacing: "30 ft from buildings" # String
propagationMethods: ["seeds"] # List
propagationDifficulty: "easy" # Enum: easy, moderate, difficult
plantingSeason: "Rainy season" # String
maintenanceNeeds: "" # String
commonProblems: [] # List
```

**See:** [.github/instructions/content.instructions.md](../.github/instructions/content.instructions.md) for detailed field usage

### ✅ Bilingual Content (MANDATORY)

**🚨 CRITICAL:** Both English AND Spanish versions MUST be created together.

- Same `slug` in both files
- Same image references
- Same scientific names
- Translate ALL user-facing text
- Maintain same content structure

**Verification:**

```bash
# After creating both files
for file in content/trees/en/*.mdx; do
  slug=$(basename "$file" .mdx)
  if [ ! -f "content/trees/es/$slug.mdx" ]; then
    echo "❌ Missing Spanish: $slug"
  fi
done
```

### ✅ Content Structure (Follow Template)

Every species page should follow the standard structure from [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md):

1. **Title & Callout** - Key highlight/significance
2. **Quick Reference + iNaturalist** - `<TwoColumn>` layout
3. **Photo Gallery** - 5 high-quality images minimum
4. **Taxonomy & Classification** - Complete taxonomic hierarchy
5. **Physical Description** - Tree form, bark, leaves, flowers, fruit
6. **Distribution** - Geographic range with map if applicable
7. **Habitat & Ecology** - Environmental context, wildlife interactions
8. **Uses/Applications** - Traditional and modern uses
9. **Cultural Significance** - Indigenous uses, regional importance
10. **Conservation Status** - IUCN status, threats, protection
11. **Growing/Cultivation** - Propagation, requirements
12. **Where to See** - National parks, accessible locations
13. **External Resources** - Links to IUCN, iNaturalist, databases

**Target:** 600+ lines per file (strong quality benchmark)

### ✅ Image Requirements

**Minimum:** 1 featured image + 4 gallery images = 5 total images

- Place in `public/images/trees/[slug]/`
- Named: `featured.jpg`, `01.jpg`, `02.jpg`, `03.jpg`, `04.jpg`
- Optimize: `npm run images:optimize`
- See [IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md) for guidelines
- See [IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md) for sourcing

**Image Quality Standards:**

- Resolution: 1200x800px minimum
- Format: JPEG (optimized) or WebP
- Proper attribution in frontmatter or captions
- Show: tree form, bark, leaves, flowers, fruit (when available)

### Step 4: Verify Bilingual Coverage

Ensure both English and Spanish versions exist:

```bash
# Find species without Spanish translation
for file in content/trees/en/*.mdx; do
  slug=$(basename "$file" .mdx)
  if [ ! -f "content/trees/es/$slug.mdx" ]; then
    echo "Missing Spanish: $slug"
  fi
done

# Find species without English translation
for file in content/trees/es/*.mdx; do
  slug=$(basename "$file" .mdx)
  if [ ! -f "content/trees/en/$slug.mdx" ]; then
    echo "Missing English: $slug"
  fi
done
```

### Step 5: Build Verification

Always run a build to verify changes:

```bash
npm run build
```

Expected output should show:

- No build errors
- Increased page count (each tree generates ~2 pages per language = 4 pages per species)
- Contentlayer warnings are acceptable if they're just about extra fields
- Current expected page count: ~616+ pages (154 trees × 2 languages × 2 pages/tree)

## Common Issues

### Duplicate Species

**Problem:** Same species documented under different common names

**Detection:**

```bash
# Find duplicate scientific names
grep -h "scientificName:" content/trees/{en,es}/*.mdx | sort | uniq -d
```

**Resolution:**

1. Identify which file is more complete/accurate
2. Keep the better file, remove the duplicate
3. Verify slug consistency between languages
4. Update any cross-references in documentation

### Mismatched Slugs

**Problem:** Same species has different slugs in EN and ES

**Detection:**

```bash
# More efficient approach using temporary files
grep -h "scientificName:" content/trees/en/*.mdx | \
  paste <(ls content/trees/en/*.mdx | xargs -n1 basename | sed 's/.mdx//') - | \
  sort -k2 > /tmp/en_sci_names.txt

grep -h "scientificName:" content/trees/es/*.mdx | \
  paste <(ls content/trees/es/*.mdx | xargs -n1 basename | sed 's/.mdx//') - | \
  sort -k2 > /tmp/es_sci_names.txt

# Find same scientific name with different slugs
join -1 2 -2 2 -o 1.1,2.1,1.2 /tmp/en_sci_names.txt /tmp/es_sci_names.txt | \
  awk '$1 != $2 {print "Mismatch: " $3 " - EN:" $1 " ES:" $2}'
```

**Resolution:**

1. Choose the most appropriate slug (usually the most common English name)
2. Rename files to match
3. Update frontmatter `slug` field
4. Verify no broken links in content

## Adding New Species

Follow the standard content creation process:

### 1. Research Phase

**🔍 Scientific Verification (FIRST STEP):**

- [ ] Search for scientific name in existing content
  ```bash
  grep -r "scientificName:.*Genus species" content/trees/
  ```
- [ ] Verify accepted scientific name on TROPICOS or IPNI
- [ ] Check for synonyms that might already be documented
- [ ] Confirm family classification

**📚 Botanical Information:**

- [ ] Tree form, size, and growth habit
- [ ] Bark characteristics (color, texture, patterns)
- [ ] Leaf morphology (simple/compound, arrangement, size)
- [ ] Flower description (color, size, season)
- [ ] Fruit/seed description (type, size, season)
- [ ] Complete taxonomic hierarchy (Kingdom → Species)
- [ ] Etymology of scientific and common names

**🌍 Distribution & Habitat:**

- [ ] Native range and introduced regions
- [ ] Elevation range in Costa Rica
- [ ] Climate zones (dry forest, rainforest, cloud forest, etc.)
- [ ] Soil preferences
- [ ] Costa Rican provinces/regions where found
- [ ] Specific locations (national parks, accessible sites)

**🛡️ Safety Information (13 REQUIRED FIELDS):**

- [ ] Overall toxicity level (none/low/moderate/high/severe)
- [ ] Toxic parts (if any): seeds, sap, leaves, bark, fruit, all
- [ ] Skin contact risk (none/low/moderate/high/severe)
- [ ] Allergen risk (none/low/moderate/high)
- [ ] Structural risks: falling branches, spines, explosive pods, etc.
- [ ] Child safety assessment
- [ ] Pet safety (dogs, cats)
- [ ] Whether professional care required
- [ ] Detailed toxicity information (compounds, symptoms, first aid)
- [ ] Detailed skin contact information
- [ ] Detailed allergen information
- [ ] Detailed structural risk information
- [ ] General safety notes and precautions

**📖 Uses & Cultural Information:**

- [ ] Traditional indigenous uses
- [ ] Modern applications (timber, medicine, food, ornamental)
- [ ] Wood properties (if timber species)
- [ ] Regional cultural significance
- [ ] Local names and meanings
- [ ] Historical importance

**🦜 Ecological Information:**

- [ ] Wildlife associations (birds, mammals, insects)
- [ ] Ecological role (nitrogen-fixer, pioneer species, etc.)
- [ ] Pollination syndrome
- [ ] Seed dispersal method

**🌱 Cultivation Information:**

- [ ] Growth rate (slow/moderate/fast)
- [ ] Propagation methods (seeds, cuttings, grafting)
- [ ] Propagation difficulty (easy/moderate/difficult)
- [ ] Water needs (low/moderate/high)
- [ ] Light requirements (full-sun/partial-shade/shade-tolerant)
- [ ] Soil requirements
- [ ] Spacing recommendations
- [ ] Planting season in Costa Rica
- [ ] Maintenance needs
- [ ] Common problems/pests

**🔴 Conservation Status:**

- [ ] IUCN Red List status
- [ ] Current threats (habitat loss, overexploitation, etc.)
- [ ] Protection measures
- [ ] Population trends

**📸 Image Collection:**

- [ ] Minimum 5 high-quality images (see [IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md))
  - [ ] 1 featured image (full tree or distinctive feature)
  - [ ] 4 gallery images (bark, leaves, flowers, fruit)
- [ ] Proper attribution/licensing documented
- [ ] Resolution: 1200x800px minimum

**🔗 External Resources:**

- [ ] iNaturalist observations link
- [ ] IUCN Red List link (if applicable)
- [ ] Relevant botanical database links
- [ ] Additional scientific references

### 2. Content Creation

**🚨 CRITICAL:** Create BOTH English and Spanish versions together!

**File Creation:**

```bash
# Create both files at once
touch content/trees/en/new-species.mdx
touch content/trees/es/new-species.mdx
```

**Frontmatter (Copy template below):**

- [ ] All 6 core required fields
- [ ] All 13 safety fields (100% coverage mandatory)
- [ ] Distribution, elevation, seasons (highly recommended)
- [ ] Care & cultivation fields (if available)
- [ ] Same `slug` in both EN and ES files
- [ ] Verify no typos in field names (case-sensitive!)

**Content Structure:**

- [ ] Follow [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md)
- [ ] Include all 13 standard sections (see template above)
- [ ] Use MDX components: `<Callout>`, `<QuickRef>`, `<INaturalistEmbed>`, `<DistributionMap>`
- [ ] Target 600+ lines per file (quality benchmark)
- [ ] Add bilingual safety information in SafetyCard sections
- [ ] Include iNaturalist embed for observation data
- [ ] Cross-reference related species where relevant

**Translation Quality:**

- [ ] Translate ALL user-facing text to Spanish
- [ ] Keep scientific names unchanged (Latin)
- [ ] Keep botanical terms accurate (consult Spanish botanical glossary)
- [ ] Maintain same content structure and section order
- [ ] Preserve image references (same paths)
- [ ] Match tone and reading level across languages

### 3. Image Management

- Source high-quality images (see [IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md))
- Place in `public/images/trees/[slug]/`
- Run image optimization: `npm run images:optimize`
- Verify images display correctly

### 4. Verification

**Build & Technical Checks:**

```bash
# Build project
npm run build

# Run linter
npm run lint

# Type check
npm run type-check
```

**Content Verification:**

- [ ] Build completes without errors
- [ ] Test both language versions load correctly
  - `/en/trees/new-species`
  - `/es/trees/new-species`
- [ ] Verify search functionality includes new species
- [ ] Check distribution maps render correctly (if applicable)
- [ ] Verify safety badges display properly
- [ ] Test image optimization worked: `ls -lh public/images/trees/new-species/`
- [ ] Check all MDX components render (Callout, QuickRef, etc.)
- [ ] Verify external links work (iNaturalist, IUCN, etc.)
- [ ] Test mobile responsiveness

**Safety Data Verification:**

```bash
# Verify safety fields present
grep "toxicityLevel:" content/trees/en/new-species.mdx
grep "childSafe:" content/trees/en/new-species.mdx
grep "petSafe:" content/trees/en/new-species.mdx
```

**Bilingual Verification:**

```bash
# Verify both files have same slug
grep "slug:" content/trees/en/new-species.mdx
grep "slug:" content/trees/es/new-species.mdx
```

### 5. Documentation Updates

**Update Species Counts in:**

- [ ] `README.md` - "Features" section
- [ ] `docs/SPECIES_ADDITION_PROCESS.md` - Quick Reference section
- [ ] `docs/IMPLEMENTATION_PLAN.md` - Any species count references
- [ ] `docs/MISSING_SPECIES_LIST.md` - Remove documented species, update counts

**Git Commit:**

```bash
# Stage changes
git add content/trees/{en,es}/new-species.mdx
git add public/images/trees/new-species/
git add README.md docs/MISSING_SPECIES_LIST.md

# Commit with descriptive message
git commit -m "feat: add [Common Name] (_Scientific name_)

- Add bilingual MDX content (EN + ES)
- Add 5 images (featured + 4 gallery)
- Complete safety data (13 fields)
- Update species count: 129 → 130"

# Create PR (DON'T push directly to main!)
git checkout -b content/add-new-species
git push origin content/add-new-species
gh pr create --title "feat: Add [Common Name]" --body "..."
```

**⚠️ NEVER push directly to main!** Always create a feature branch and PR.

## Batch Addition Guidelines

When adding multiple species:

1. **Group by Ecosystem/Priority**
   - Complete all mangroves, then move to cloud forest, etc.
   - Easier to research similar species together
   - Maintains consistency in content quality

2. **Verify as You Go**
   - Build after each 5-10 species
   - Don't wait until the end to catch errors
   - Easier to debug issues when they're fresh

3. **Track Progress**
   - Update MISSING_SPECIES_LIST.md incrementally
   - Mark completed phases
   - Document any blockers or challenges

4. **Maintain Bilingual Parity**
   - Complete both languages before moving to next species
   - Don't accumulate translation backlog
   - Quality over quantity

## Automation Scripts

Available scripts for species management:

### Count Species by Category

```bash
# Count native vs introduced
grep -l "tags:" content/trees/en/*.mdx | \
  xargs grep -l "native" | wc -l

# Count by family
grep "family:" content/trees/en/*.mdx | \
  cut -d'"' -f2 | sort | uniq -c | sort -rn
```

### Find Incomplete Species

```bash
# Species missing safety data
grep -L "toxicityLevel:" content/trees/en/*.mdx

# Species missing images
for file in content/trees/en/*.mdx; do
  slug=$(basename "$file" .mdx)
  if [ ! -f "public/images/trees/$slug/featured.jpg" ]; then
    echo "Missing image: $slug"
  fi
done
```

## Recent Updates Log

### 2026-01-19

- **Documentation accuracy audit completed**
  - Updated species count across all docs: 128 → 129
  - Verified 100% safety data coverage (129 species × 13 fields = 1,677 data points)
  - Removed 9 duplicate species from MISSING_SPECIES_LIST.md
  - Updated SECURITY_SETUP.md with accurate implementation status
  - Updated SAFETY_SYSTEM.md with current implementation details
  - ~40 unique species remaining to document

### 2026-01-15

- **Added 4 new species:**
  - Sigua (_Nectandra cissiflora_) - High-priority laurel family timber tree with fragrant wood
  - Comenegro (_Simarouba glauca_) - Paradise tree with medicinal bark and copper-colored bark
  - Mayo (_Vochysia hondurensis_) - Important fast-growing timber species for reforestation
  - Lechoso Montañero (_Brosimum lactescens_) - Mountain breadnut/"milk tree" with edible latex
- Updated documentation to reflect 128 species (up from 124)
- Verified duplicate species from missing list (Kerosén=Ron Ron, Chilamate=Higuerón, Surá de Montaña=Surá)
- Updated MISSING_SPECIES_LIST.md with completion status
- Build verification: 484+ pages generated successfully
- Progress: Phase 2 (native forest trees) nearly complete - only 5 high-priority species remaining

### 2026-01-14 (Later Update)

- **Added 2 new species:**
  - Quizarrá (_Nectandra salicina_) - High-priority cloud forest laurel
  - Llama del Bosque (_Spathodea campanulata_) - Medium-priority invasive ornamental
- Updated documentation to reflect 124 species (up from 122)
- Updated MISSING_SPECIES_LIST.md with new additions marked
- Build verification: 1026 pages generated successfully
- Progress: Phase 2 (native forest trees) in progress

### 2026-01-14 (Morning Update)

- Updated documentation to reflect 122 species (up from 110)
- Removed duplicate chirca.mdx (Spanish version of yellow-oleander)
- Verified all high-priority species from missing list are documented
- Updated MISSING_SPECIES_LIST.md with completion status

### 2026-01-12

- Added 12 new species including all 5 mangroves
- Phase 1 (Critical Gaps - Mangroves) marked complete
- Build verification: 1014 pages generated successfully

## Frontmatter Template

Copy this template when creating new species files:

```yaml
---
# Core Required Fields (6)
title: "Common Name"
scientificName: "Genus species"
family: "Familyaceae"
locale: "en" # or "es"
slug: "common-name" # SAME in both EN and ES files
description: "Brief SEO-friendly description in 150-160 characters that captures key features."

# Distribution & Habitat (Highly Recommended)
nativeRegion: "Native to tropical lowlands of Central America"
conservationStatus: "LC" # EX, EW, CR, EN, VU, NT, LC, DD, NE
maxHeight: "20-25 m"
elevation: "0-1200 m"
distribution:
  - guanacaste
  - puntarenas
  - pacific-coast

# Uses & Tags (Highly Recommended)
uses:
  - timber
  - ornamental
  - medicinal
tags:
  - native
  - deciduous
  - dry-forest
  - flowering

# Seasonal Data (Recommended)
floweringSeason:
  - march
  - april
  - may
fruitingSeason:
  - june
  - july
  - august

# Images (Required)
featuredImage: "/images/trees/common-name/featured.jpg"
images:
  - "/images/trees/common-name/01.jpg"
  - "/images/trees/common-name/02.jpg"
  - "/images/trees/common-name/03.jpg"
  - "/images/trees/common-name/04.jpg"

# Safety Information (13 REQUIRED FIELDS - 100% coverage mandatory)
toxicityLevel: "none" # none, low, moderate, high, severe
toxicParts: [] # Empty array if none; otherwise: ["seeds", "sap", "leaves", "bark", "fruit", "flowers", "roots", "all"]
skinContactRisk: "none" # none, low, moderate, high, severe
allergenRisk: "none" # none, low, moderate, high
structuralRisks: [] # Empty array if none; otherwise: ["falling-branches", "sharp-spines", "explosive-pods", "aggressive-roots", "brittle-wood", "heavy-fruit"]
childSafe: true
petSafe: true
requiresProfessionalCare: false
toxicityDetails: "No known toxicity. Fruit is edible when ripe."
skinContactDetails: "No known skin irritation."
allergenDetails: "No known allergenic properties."
structuralRiskDetails: "No significant structural hazards."
safetyNotes: "Safe for planting near homes and play areas."

# Care & Cultivation (Optional but valuable)
growthRate: "moderate" # slow, moderate, fast
growthRateDetails: "2-3 feet per year in optimal conditions"
matureSize: "40-60 ft tall, 30-40 ft spread"
hardiness: "USDA zones 10-12, tropical lowlands"
soilRequirements: "Well-drained soils, tolerates clay"
waterNeeds: "moderate" # low, moderate, high
waterDetails: "Water regularly during establishment, drought-tolerant once mature"
lightRequirements: "full-sun" # full-sun, partial-shade, shade-tolerant
spacing: "30-40 ft from buildings and other trees"
propagationMethods:
  - seeds
  - cuttings
propagationDifficulty: "easy" # easy, moderate, difficult
plantingSeason: "Beginning of rainy season (May-June)"
maintenanceNeeds: "Minimal pruning required, monitor for pests"
commonProblems:
  - "leaf-cutter-ants"
  - "scale-insects"

# Dates (Optional)
publishedAt: 2026-01-19
updatedAt: 2026-01-19
---
```

**Safety Field Guidelines:**

- If tree is **completely safe**: Use "none"/empty arrays/true for child & pet safe
- If **any toxicity**: Document specific parts, symptoms, first aid in details fields
- If **skin irritant**: Note severity and affected populations (general public vs sensitive individuals)
- If **structural hazards**: List all risks (thorns, brittle branches, aggressive roots, etc.)
- **When in doubt**: Consult botanical references, poison control databases, veterinary resources

## See Also

- [MISSING_SPECIES_LIST.md](./MISSING_SPECIES_LIST.md) - Complete list of species to add
- [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md) - Content structure guide
- [IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md) - Image sourcing guidelines
- [improvement-roadmap.md](./improvement-roadmap.md) - Overall project status
- [CONTRIBUTING.md](../CONTRIBUTING.md) - General contribution guide

---

**Questions or Issues?**  
Open a [GitHub Discussion](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/discussions) or [Issue](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/issues)
