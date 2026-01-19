# Frontmatter Localization Guide

> **Living Document**: This guide is updated as new frontmatter fields are added. Last updated: **January 2026**

This document explains how to handle localization for all content types (trees, comparison guides, and glossary terms) in the Costa Rica Tree Atlas.

## Overview

The Costa Rica Tree Atlas uses a bilingual (English/Spanish) content structure with three content types:

1. **Trees** - Individual tree species pages (`content/trees/`)
2. **Comparisons** - Side-by-side species comparison guides (`content/comparisons/`)
3. **Glossary** - Botanical and ecological term definitions (`content/glossary/`)

Some frontmatter fields are **user-facing** (should be translated), while others are **internal identifiers** (must remain in English).

## Tree Pages: Field-by-Field Localization

### User-Facing Fields (✅ Translate)

These fields contain text that users see directly:

- `title` - Common name of the tree
- `description` - SEO meta description
- `nativeRegion` - Native region description
- `conservationStatus` - Use IUCN codes (same across languages: LC, EN, VU, etc.)
- `maxHeight` - Can translate units ("25 m" or "82 ft")
- `elevation` - Can translate units ("0-1500 m" or "0-4900 ft")
- Text detail fields: `toxicityDetails`, `skinContactDetails`, `allergenDetails`, `structuralRiskDetails`, `safetyNotes`, `wildlifeRisks`, `growthRateDetails`, `waterDetails`, `soilRequirements`, `hardiness`, `spacing`, `plantingSeason`, `maintenanceNeeds`

### Internal Fields (🔒 English Only)

These use enum values and must remain in English:

**Safety enums:**

- `toxicityLevel`: `none`, `low`, `moderate`, `high`, `severe`
- `skinContactRisk`: `none`, `low`, `moderate`, `high`, `severe`
- `allergenRisk`: `none`, `low`, `moderate`, `high`

**Care enums:**

- `growthRate`: `slow`, `moderate`, `fast`
- `waterNeeds`: `low`, `moderate`, `high`
- `lightRequirements`: `full-sun`, `partial-shade`, `shade-tolerant`
- `propagationDifficulty`: `easy`, `moderate`, `difficult`

**Why English?** These are internal identifiers with TypeScript enum constraints that map to localized display text in the UI.

### Technical Fields (⚠️ Keep Same)

These should be identical across locales:

- `scientificName` - Scientific name (Latin)
- `family` - Botanical family name (Latin)
- `slug` - URL identifier
- `locale` - Language code (`en` or `es`)
- `uses`, `tags`, `distribution` - Predefined list values (use English identifiers)
- `floweringSeason`, `fruitingSeason` - Month names (use English: `january`, `february`, etc.)
- `featuredImage`, `images` - File paths
- `publishedAt`, `updatedAt` - Dates (ISO format: `2026-01-18`)
- Boolean fields: `childSafe`, `petSafe`, `requiresProfessionalCare`
- List fields with identifiers: `toxicParts`, `structuralRisks`, `propagationMethods`, `commonProblems`

### Example Tree Frontmatter

```yaml
# English (content/trees/en/ceiba.mdx)
---
title: "Ceiba Tree"
scientificName: "Ceiba pentandra"
family: "Malvaceae"
locale: "en"
slug: "ceiba"
description: "The sacred ceiba tree, a massive rainforest giant"
maxHeight: "70 m"
elevation: "0-1500 m"
toxicityLevel: "low" # English enum
skinContactRisk: "moderate" # English enum
growthRate: "fast" # English enum
waterNeeds: "moderate" # English enum
lightRequirements: "full-sun" # English enum
floweringSeason: ["january", "february", "march"] # English months
tags: ["native", "deciduous", "sacred-tree"] # English identifiers
---
# Spanish (content/trees/es/ceiba.mdx)
---
title: "Ceiba"
scientificName: "Ceiba pentandra" # Same
family: "Malvaceae" # Same
locale: "es"
slug: "ceiba" # Same slug
description: "La sagrada ceiba, un gigante masivo del bosque tropical"
maxHeight: "70 m" # Can translate: "230 pies"
elevation: "0-1500 m" # Can translate: "0-4900 pies"
toxicityLevel: "low" # Same English enum!
skinContactRisk: "moderate" # Same English enum!
growthRate: "fast" # Same English enum!
waterNeeds: "moderate" # Same English enum!
lightRequirements: "full-sun" # Same English enum!
floweringSeason: ["january", "february", "march"] # Same English months!
tags: ["native", "deciduous", "sacred-tree"] # Same English identifiers!
---
```

---

## Comparison Guides: Internal vs. User-Facing Fields

### Background

The Costa Rica Tree Atlas uses a bilingual (English/Spanish) content structure. Comparison guides include frontmatter metadata that describes how to distinguish between similar tree species. Some of these fields are **user-facing** (should be translated), while others are **internal identifiers** (must remain in English).

### The Issue

When new frontmatter fields were added to comparison guides in January 2026:

- `difficulty` - Identification difficulty level
- `confusionRating` - How often species are confused (1-5)
- `comparisonTags` - Visual features being compared
- `seasonalNote` - When differences are most visible
- `featuredImages` - Hero image paths

**The confusion:** Should `difficulty` be translated in Spanish files?

- Spanish file: `difficulty: "easy"` or `difficulty: "fácil"`?

## The Solution

**Internal fields MUST remain in English across all locales.** The UI automatically localizes them for display.

### Internal Fields (🔒 English Only)

These fields are internal identifiers with enum constraints:

#### `difficulty`

- **Valid values**: `"easy"`, `"moderate"`, `"challenging"`
- **Why English?** Defined as TypeScript enum in `contentlayer.config.ts`
- **UI localization**:
  - English: "Easy", "Moderate", "Challenging"
  - Spanish: "Fácil", "Moderado", "Desafiante"

**Example:**

```yaml
# ✅ CORRECT (Spanish file)
difficulty: "easy"

# ❌ WRONG (Spanish file)
difficulty: "fácil"  # Build error: not a valid enum value
```

#### `comparisonTags`

- **Valid values**: `"leaves"`, `"bark"`, `"fruit"`, `"flowers"`, `"size"`, `"habitat"`, `"trunk"`, `"seeds"`, `"crown"`, `"roots"`
- **Why English?** Technical identifiers mapped to icons and localized labels
- **UI localization**:
  - English: "Leaves", "Bark", "Fruit"
  - Spanish: "Hojas", "Corteza", "Fruto"

**Example:**

```yaml
# ✅ CORRECT (Spanish file)
comparisonTags: ["leaves", "bark", "fruit"]

# ❌ WRONG (Spanish file)
comparisonTags: ["hojas", "corteza", "fruto"]  # Won't match icon mapping
```

#### `confusionRating`

- **Valid values**: `1`, `2`, `3`, `4`, `5` (numeric)
- **Why numeric?** Same across all languages
- **UI localization**: Rating labels are localized by the `getConfusionRatingConfig()` function

### User-Facing Fields (✅ Translate)

These fields contain text that users see directly:

- `title` - Comparison title
- `keyDifference` - Main distinguishing feature
- `description` - SEO meta description
- `seasonalNote` - Seasonal identification tips

### Technical Fields (⚠️ Keep Same)

These fields are technical identifiers that should be identical across locales:

- `slug` - URL identifier (must match across languages)
- `species` - Tree slug references (must match tree file slugs)
- `featuredImages` - Image file paths (same images used for both languages)

## Implementation Details

### Data Layer (contentlayer.config.ts)

```typescript
difficulty: {
  type: "enum",
  options: ["easy", "moderate", "challenging"],
  description: "MUST use these exact English enum values in ALL locale files"
}
```

### UI Layer (src/app/[locale]/compare/[slug]/page.tsx)

```tsx
{
  comparison.difficulty && (
    <span>
      {locale === "es"
        ? comparison.difficulty === "easy"
          ? "Fácil"
          : comparison.difficulty === "moderate"
            ? "Moderado"
            : "Desafiante"
        : comparison.difficulty.charAt(0).toUpperCase() +
          comparison.difficulty.slice(1)}
    </span>
  );
}
```

### Tag Localization (src/lib/comparison/index.ts)

```typescript
const TAG_LABELS: Record<string, { en: string; es: string }> = {
  leaves: { en: "Leaves", es: "Hojas" },
  bark: { en: "Bark", es: "Corteza" },
  // ... etc
};

export function getComparisonTagLabel(tag: string, locale: Locale): string {
  const labels = TAG_LABELS[tag.toLowerCase()];
  return locale === "es" ? labels.es : labels.en;
}
```

## Benefits of This Approach

1. **Type Safety**: TypeScript enums prevent typos and invalid values
2. **Build-Time Validation**: Contentlayer validates enum constraints during build
3. **Consistency**: Same values across all locales prevents sync issues
4. **Future Languages**: Easy to add Portuguese, German, etc. without touching content
5. **Standard Practice**: Follows i18n best practices (data layer = identifiers, UI layer = localized text)

## Quick Reference Table

| Field             | Localize? | Example (Spanish file)                        |
| ----------------- | --------- | --------------------------------------------- |
| `title`           | ✅ Yes    | `title: "Mango vs. Espavel: ..."`             |
| `locale`          | N/A       | `locale: "es"`                                |
| `slug`            | ⚠️ Same   | `slug: "mango-vs-espavel"`                    |
| `species`         | ⚠️ Same   | `species: ["mango", "espavel"]`               |
| `keyDifference`   | ✅ Yes    | `keyDifference: "El mango es..."`             |
| `description`     | ✅ Yes    | `description: "Aprenda a distinguir..."`      |
| `featuredImages`  | ⚠️ Same   | `featuredImages: ["/images/trees/mango.jpg"]` |
| `confusionRating` | ⚠️ Number | `confusionRating: 2`                          |
| `comparisonTags`  | 🔒 EN     | `comparisonTags: ["leaves", "bark"]`          |
| `seasonalNote`    | ✅ Yes    | `seasonalNote: "Frutos visibles abr-ago"`     |
| `difficulty`      | 🔒 EN     | `difficulty: "easy"`                          |
| `publishedAt`     | N/A       | `publishedAt: "2026-01-18"`                   |

Legend:

- ✅ Yes - Translate this field
- 🔒 EN - MUST be English (internal identifier)
- ⚠️ Same - Keep identical across languages
- N/A - Not applicable to translation

---

## Glossary Terms: Field-by-Field Localization

### User-Facing Fields (✅ Translate)

- `term` - The glossary term itself
- `simpleDefinition` - Beginner-friendly definition
- `technicalDefinition` - Detailed technical definition
- `pronunciation` - Pronunciation guide
- `etymology` - Word origin and etymology

### Internal/Technical Fields (🔒 English or Same)

- `locale` - Language code (`en` or `es`)
- `slug` - URL identifier (⚠️ keep same across languages)
- `category` - MUST use English enum values: `anatomy`, `ecology`, `taxonomy`, `morphology`, `reproduction`, `general`
- `exampleSpecies` - Tree slugs (⚠️ must match actual tree slugs)
- `relatedTerms` - Glossary term slugs (⚠️ must match actual term slugs)
- `image` - File path (⚠️ same across languages)
- `publishedAt` - Date (ISO format)

### Example Glossary Frontmatter

```yaml
# English (content/glossary/en/deciduous.mdx)
---
term: "Deciduous"
locale: "en"
slug: "deciduous"
simpleDefinition: "A tree that loses all its leaves seasonally"
technicalDefinition: "A plant that sheds all of its foliage for part of the year"
category: "morphology" # English enum!
pronunciation: "dih-SIJ-oo-us"
etymology: "From Latin 'deciduus' meaning 'falling off'"
exampleSpecies: ["guanacaste", "cortez-amarillo"] # Tree slugs
relatedTerms: ["evergreen", "leaf-drop"] # Term slugs
image: "/images/glossary/deciduous.jpg"
publishedAt: "2026-01-15"
---
# Spanish (content/glossary/es/deciduous.mdx)
---
term: "Caducifolio"
locale: "es"
slug: "deciduous" # Same slug!
simpleDefinition: "Un árbol que pierde todas sus hojas estacionalmente"
technicalDefinition: "Una planta que pierde todo su follaje durante parte del año"
category: "morphology" # Same English enum!
pronunciation: "dih-SIJ-oo-us" # English pronunciation stays
etymology: "Del latín 'deciduus' que significa 'que cae'"
exampleSpecies: ["guanacaste", "cortez-amarillo"] # Same slugs!
relatedTerms: ["evergreen", "leaf-drop"] # Same slugs!
image: "/images/glossary/deciduous.jpg" # Same image!
publishedAt: "2026-01-15" # Same date!
---
```

---

## Quick Reference: All Content Types

### Field Localization Matrix

| Field Type       | Trees        | Comparisons  | Glossary     | Rule                 |
| ---------------- | ------------ | ------------ | ------------ | -------------------- |
| Title/Name       | ✅ Translate | ✅ Translate | ✅ Translate | User-facing text     |
| Description      | ✅ Translate | ✅ Translate | ✅ Translate | User-facing text     |
| Slug             | ⚠️ Same      | ⚠️ Same      | ⚠️ Same      | URL identifier       |
| Locale           | N/A          | N/A          | N/A          | `en` or `es`         |
| Scientific names | ⚠️ Same      | ⚠️ Same      | N/A          | Latin names          |
| Enum fields      | 🔒 English   | 🔒 English   | 🔒 English   | Internal identifiers |
| List identifiers | 🔒 English   | 🔒 English   | 🔒 English   | tags, months, etc.   |
| Images/paths     | ⚠️ Same      | ⚠️ Same      | ⚠️ Same      | File paths           |
| Dates            | ⚠️ Same      | ⚠️ Same      | ⚠️ Same      | ISO format           |
| Numbers          | ⚠️ Same      | ⚠️ Same      | N/A          | Numeric values       |
| Detail text      | ✅ Translate | ✅ Translate | ✅ Translate | Long-form content    |

---

## Common Mistakes

### ❌ Translating Internal Fields

```yaml
# WRONG - Spanish file
difficulty: "fácil" # Build error!
comparisonTags: ["hojas", "corteza"] # Won't work!
```

### ❌ Different Slugs

```yaml
# WRONG
# English file:
slug: "mango-vs-espavel"

# Spanish file:
slug: "mango-contra-espavel"  # Links will break!
```

### ✅ Correct Example

```yaml
# English file (content/comparisons/en/mango-vs-espavel.mdx)
---
title: "Mango vs. Espavel: Cultivated vs. Wild Giants"
locale: "en"
slug: "mango-vs-espavel"
species: ["mango", "espavel"]
keyDifference: "Mango is cultivated with single large fruits..."
description: "Learn to distinguish Mangifera indica from Anacardium excelsum"
featuredImages:
  - "/images/trees/mango.jpg"
  - "/images/trees/espavel.jpg"
confusionRating: 2
comparisonTags: ["size", "trunk", "fruit", "habitat"]
seasonalNote: "Easily identifiable year-round; fruit visible Apr-Aug (mango)"
difficulty: "easy"
publishedAt: "2026-01-18"
---
# Spanish file (content/comparisons/es/mango-vs-espavel.mdx)
---
title: "Mango vs. Espavel: Gigantes Cultivados vs. Silvestres"
locale: "es"
slug: "mango-vs-espavel" # Same slug
species: ["mango", "espavel"] # Same species array
keyDifference: "El mango es un árbol frutal cultivado con frutos..."
description: "Aprenda a distinguir Mangifera indica de Anacardium excelsum"
featuredImages: # Same images
  - "/images/trees/mango.jpg"
  - "/images/trees/espavel.jpg"
confusionRating: 2 # Same number
comparisonTags: ["size", "trunk", "fruit", "habitat"] # English tags!
seasonalNote: "Fácil de identificar todo el año; frutos visibles abr-ago"
difficulty: "easy" # English enum!
publishedAt: "2026-01-18" # Same date
---
```

## For Contributors

When creating or editing comparison guides:

1. **Check the localization column** in `.github/instructions/comparisons.instructions.md`
2. **Use English values** for `difficulty` and `comparisonTags`
3. **Translate** title, keyDifference, description, and seasonalNote
4. **Keep identical** slug, species, featuredImages, confusionRating
5. **Build locally** to catch enum validation errors early

## For Developers

When adding new fields:

1. **Decide if it's internal or user-facing**
   - Internal → Use enum/technical values, localize in UI
   - User-facing → Store translated text in frontmatter

2. **Document in three places:**
   - `contentlayer.config.ts` - Schema + description
   - `.github/instructions/comparisons.instructions.md` - Contributor guide
   - This file - Developer reference

3. **Add UI localization** if it's an internal field

## References

- Tree schema: `contentlayer.config.ts` lines 11-290
- Comparison schema: `contentlayer.config.ts` lines 376-450
- Glossary schema: `contentlayer.config.ts` lines 293-373
- Tree content instructions: `.github/instructions/content.instructions.md`
- Comparison instructions: `.github/instructions/comparisons.instructions.md`
- UI localization examples: `src/lib/comparison/index.ts`

---

_Last updated: January 2026_
