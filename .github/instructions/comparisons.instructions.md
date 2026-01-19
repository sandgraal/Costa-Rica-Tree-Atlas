---
description: Instructions for creating comparison guides
applyTo: "content/comparisons/**/*.mdx"
---

# Comparison Guide Content Standards

This document defines the strict template and quality standards for all tree comparison guides. Every comparison MUST follow this structure to ensure consistency, visual appeal, and educational value.

## Frontmatter Requirements

Every comparison guide MUST include these frontmatter fields:

```yaml
---
title: "Species A vs. Species B: Descriptive Subtitle"
locale: "en" # or "es"
slug: "species-a-vs-species-b"
species: ["species-a-slug", "species-b-slug"]
keyDifference: "One sentence describing THE most reliable way to tell them apart"
description: "SEO description (150-160 chars) explaining what this comparison covers"
# NEW REQUIRED FIELDS:
featuredImages:
  - "/images/trees/species-a.jpg"
  - "/images/trees/species-b.jpg"
confusionRating: 3 # 1-5 scale (1=easy, 5=nearly identical)
comparisonTags: ["leaves", "bark", "fruit"] # Visual features covered
seasonalNote: "Best distinguished during flowering season (Dec-Feb)"
difficulty: "moderate" # easy, moderate, or challenging
publishedAt: "2026-01-18"
---
```

### Frontmatter Field Descriptions

| Field             | Required | Description                                                  |
| ----------------- | -------- | ------------------------------------------------------------ |
| `title`           | Yes      | Format: "Species A vs. Species B: Descriptive Subtitle"      |
| `locale`          | Yes      | Language code: `en` or `es`                                  |
| `slug`            | Yes      | URL-friendly: `species-a-vs-species-b`                       |
| `species`         | Yes      | Array of exactly 2 tree slugs being compared                 |
| `keyDifference`   | Yes      | Single most diagnostic feature (1-2 sentences)               |
| `description`     | Yes      | SEO meta description (150-160 characters)                    |
| `featuredImages`  | Yes      | Array of 2 image paths (one per species, in species order)   |
| `confusionRating` | Yes      | 1-5 scale of how often these are confused                    |
| `comparisonTags`  | Yes      | Visual features: leaves, bark, fruit, flowers, size, habitat |
| `seasonalNote`    | Yes      | When differences are most/least visible                      |
| `difficulty`      | Yes      | Identification difficulty: easy, moderate, challenging       |
| `publishedAt`     | Yes      | Publication date in ISO format                               |

## Minimum Photo Requirements

**Every comparison guide MUST include at least 6 high-quality photos:**

1. **Hero Images (2)** - One featured image per species (used in frontmatter)
2. **Side-by-Side Comparison Images (2+)** - Showing the same feature for both species
3. **Detail/Feature Images (2+)** - Close-ups of distinguishing characteristics

### Photo Categories to Cover

At minimum, include photos comparing:

- [ ] **Overall tree form/silhouette** (whole tree)
- [ ] **Primary distinguishing feature** (leaves, bark, fruit, etc.)
- [ ] **Secondary distinguishing feature**

### Photo Sourcing

Images should be sourced from:

1. **iNaturalist** (preferred) - Use existing tree gallery images when possible
2. **Wikimedia Commons** - For rare species or specific angles
3. **GBIF** - Fallback for scientific documentation

### Image Attribution Format

Always include attribution:

```tsx
<SideBySideImages
  leftImage="/images/trees/mango.jpg"
  rightImage="/images/trees/espavel.jpg"
  leftLabel="Mango"
  rightLabel="Espavel"
  leftAlt="Mango tree showing dense rounded crown"
  rightAlt="Espavel tree showing massive buttress roots"
  leftCredit="(c) photographer, CC BY-NC"
  rightCredit="(c) photographer, CC BY-NC"
  caption="Compare the dramatically different trunk structures"
/>
```

## Required Content Structure

Follow this exact section order:

### 1. Introduction (No Header)

Brief paragraph (2-3 sentences) explaining:

- Why these species are commonly confused
- Where they overlap geographically
- The main context for confusion

### 2. One-Second Test (Callout)

```tsx
<Callout type="tip" title="The One-Second Test">
  **Species A**: [Quick identifier in bold] **Species B**: [Quick identifier in
  bold]
</Callout>
```

### 3. Visual Comparison Hero

Use the `SideBySideImages` component for the primary visual comparison:

```tsx
<SideBySideImages
  leftImage="..."
  rightImage="..."
  leftLabel="Species A"
  rightLabel="Species B"
  caption="Primary distinguishing feature comparison"
/>
```

### 4. Side-by-Side Comparison (Properties Grid)

```tsx
<PropertiesGrid>
  <PropertyCard
    icon="🌳"
    label="Feature"
    value="Species A: Value"
    description="Additional detail"
  />
  <PropertyCard
    icon="🌳"
    label="Feature"
    value="Species B: Value"
    description="Additional detail"
  />
  {/* Continue for 4-6 key properties */}
</PropertiesGrid>
```

### 5. Detailed Comparison Table

Standard markdown table with at least 10 rows covering:

| Feature                 | Species A | Species B |
| ----------------------- | --------- | --------- |
| **Tree Type**           | ...       | ...       |
| **Height**              | ...       | ...       |
| **Trunk Features**      | ...       | ...       |
| **Leaf Shape**          | ...       | ...       |
| **Leaf Size**           | ...       | ...       |
| **Bark**                | ...       | ...       |
| **Fruit Type**          | ...       | ...       |
| **Flowering Season**    | ...       | ...       |
| **Habitat**             | ...       | ...       |
| **Conservation Status** | ...       | ...       |

### 6. Key Identification Features (Detailed Sections)

Use H3 headers for each distinguishing feature:

```markdown
### 1. Feature Name (Most Diagnostic!)

**Species A:**

- Point 1
- Point 2
- Point 3

**Species B:**

- Point 1
- Point 2
- Point 3
```

Include `<SideBySideImages>` or `<BeforeAfterSlider>` for visual features.

### 7. Quick Decision Flow

```tsx
<QuickDecisionFlow
  title="Quick Identification Guide"
  steps={[
    {
      question: "Does the tree have massive buttress roots?",
      yesAnswer: "Large triangular buttresses extending 3-5 meters",
      noAnswer: "Straight trunk, no buttresses",
      yesResult: "Espavel",
      noResult: null, // Continue to next question
    },
    {
      question: "What shape are the leaves?",
      yesAnswer: "Lanceolate, narrow (2-8 cm wide)",
      noAnswer: "Obovate, broader (8-15 cm wide)",
      yesResult: "Mango",
      noResult: "Espavel",
    },
  ]}
/>
```

### 8. When They Look Most Similar

Explain scenarios/seasons when confusion is most likely:

```markdown
## When They Look Most Similar

- **Seasonal factor**: [Explanation]
- **Age factor**: [Explanation]
- **Location factor**: [Explanation]
```

### 9. Safety/Warning Callouts (If Applicable)

```tsx
<Callout type="warning" title="Safety Note">
  Important safety information about either species (toxicity, allergens, etc.)
</Callout>
```

### 10. Ecological & Cultural Significance

Brief section on each species' ecological role and cultural importance.

### 11. Interactive Tool CTA

```tsx
<CompareInToolButton species={["species-a", "species-b"]} locale="en" />
```

### 12. Summary Callout

```tsx
<Callout type="success" title="Summary">
  **Choose Species A if you see**: [Key identifiers] **Choose Species B if you
  see**: [Key identifiers]
</Callout>
```

### 13. Related Comparisons (Optional)

Link to other relevant comparison guides.

## Available MDX Components

### Visual Comparison Components

| Component            | Use Case                               | Props                                                                     |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------------- |
| `SideBySideImages`   | Two images side by side with labels    | leftImage, rightImage, leftLabel, rightLabel, caption, credits            |
| `BeforeAfterSlider`  | Interactive slider comparing features  | beforeImage, afterImage, beforeLabel, afterLabel, credits                 |
| `FeatureAnnotation`  | Image with clickable annotation points | image, alt, annotations: [{x, y, label, description}], credit             |
| `ComparisonHero`     | Split-screen hero section              | leftImage, rightImage, leftLabel, rightLabel, leftSubtitle, rightSubtitle |
| `FeatureCompareGrid` | Container for FeatureCompareRows       | leftLabel, rightLabel, children                                           |
| `FeatureCompareRow`  | Single row comparing one feature       | feature, leftValue, rightValue, leftImage?, rightImage?, icon?            |
| `QuickDecisionFlow`  | Visual decision tree                   | title, steps: [{question, yesAnswer, noAnswer, yesResult?, noResult?}]    |

### UI Components

| Component             | Use Case                    | Props                             |
| --------------------- | --------------------------- | --------------------------------- |
| `ConfusionRating`     | Display 1-5 confusion scale | rating, label?                    |
| `ComparisonTags`      | Display comparison tags     | tags: string[]                    |
| `SeasonalNote`        | Display seasonal tip        | note, icon?                       |
| `CompareInToolButton` | CTA to interactive tool     | species: string[], locale, label? |
| `Callout`             | Tip/warning/info boxes      | type, title, children             |
| `PropertiesGrid`      | Grid of PropertyCards       | children                          |
| `PropertyCard`        | Single property display     | icon, label, value, description   |

## Quality Checklist

Before submitting a comparison guide, verify:

- [ ] **Frontmatter complete** with all required fields
- [ ] **Minimum 6 photos** included with proper attribution
- [ ] **Both language versions** created (en + es)
- [ ] **All sections present** in the correct order
- [ ] **At least one `SideBySideImages`** component used
- [ ] **`QuickDecisionFlow`** includes 2-3 decision steps
- [ ] **Safety information** included if either species has risks
- [ ] **No broken image links** - all paths verified
- [ ] **Confusion rating accurate** based on actual difficulty
- [ ] **Seasonal note helpful** for timing field identification

## File Organization

```
content/
  comparisons/
    en/
      species-a-vs-species-b.mdx
    es/
      species-a-vs-species-b.mdx

public/
  images/
    comparisons/
      species-a-vs-species-b/
        feature-comparison-1.jpg
        feature-comparison-2.jpg
        annotated-detail.jpg
```

## Example: Gold Standard Comparison

See `content/comparisons/en/mango-vs-espavel.mdx` for the gold standard template implementation.

## DO NOT

- Create comparisons with fewer than 6 photos
- Skip the `QuickDecisionFlow` component
- Use only markdown tables without visual components
- Forget to create both language versions
- Leave `confusionRating` or `comparisonTags` empty
- Use images without proper attribution
- Create comparisons for species that don't exist in the tree database
