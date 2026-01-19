# Frontmatter Localization Guide

This document explains how to handle localization for comparison guide frontmatter fields.

## Background

The Costa Rica Tree Atlas uses a bilingual (English/Spanish) content structure. Comparison guides include frontmatter metadata that describes how to distinguish between similar tree species. Some of these fields are **user-facing** (should be translated), while others are **internal identifiers** (must remain in English).

## The Issue

In PR #214, new frontmatter fields were added to comparison guides:

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

- Contentlayer schema: `contentlayer.config.ts` lines 420-444
- Comparison instructions: `.github/instructions/comparisons.instructions.md`
- UI localization: `src/lib/comparison/index.ts`
- Original issue: PR #214 review comments
