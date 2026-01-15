# Species Addition Process

**Last Updated:** 2026-01-14  
**Purpose:** Guide for reviewing the missing species list and adding new trees to the atlas

## Quick Reference

- **Current Species Count:** 128 documented (256 bilingual documents)
- **Last Major Update:** 2026-01-15 (4 species added: Sigua, Comenegro, Mayo, Lechoso Montañero)
- **Previous Major Update:** 2026-01-14 (2 species added)
- **Previous Major Update:** 2026-01-12 (12 species added)
- **Missing Species Remaining:** ~47 identified for future expansion
- **Missing Species List:** [MISSING_SPECIES_LIST.md](./MISSING_SPECIES_LIST.md)

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

1. Open `docs/MISSING_SPECIES_LIST.md`
2. Check each species against existing content
3. Verify scientific names to avoid duplicates (same species, different common name)
4. Update the list to remove documented species

### Step 3: Update Documentation

When species are added, update these files:

1. **README.md** - Species count in "Features" section
2. **MISSING_SPECIES_LIST.md** - Remove documented species, update counts
3. **docs/improvement-roadmap.md** - Update species count references

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
- Increased page count (each tree generates ~8 pages per language)
- Contentlayer warnings are acceptable if they're just about extra fields

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

- Verify species is not already documented (check scientific name)
- Gather botanical information
- Find appropriate images (see [IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md))
- Research safety and toxicity data
- Collect cultural/traditional use information

### 2. Content Creation

- Create both EN and ES MDX files with same slug
- Follow [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md)
- Include all required frontmatter fields
- Add bilingual safety information
- Include iNaturalist links for observation data

### 3. Image Management

- Source high-quality images (see [IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md))
- Place in `public/images/trees/[slug]/`
- Run image optimization: `npm run images:optimize`
- Verify images display correctly

### 4. Verification

- Build project: `npm run build`
- Test both language versions
- Verify search functionality includes new species
- Check distribution maps render correctly
- Verify safety badges display properly

### 5. Documentation Updates

- Update species count in README.md
- Remove from MISSING_SPECIES_LIST.md if applicable
- Update improvement-roadmap.md if needed
- Commit with descriptive message

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

## See Also

- [MISSING_SPECIES_LIST.md](./MISSING_SPECIES_LIST.md) - Complete list of species to add
- [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md) - Content structure guide
- [IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md) - Image sourcing guidelines
- [improvement-roadmap.md](./improvement-roadmap.md) - Overall project status
- [CONTRIBUTING.md](../CONTRIBUTING.md) - General contribution guide

---

**Questions or Issues?**  
Open a [GitHub Discussion](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/discussions) or [Issue](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/issues)
