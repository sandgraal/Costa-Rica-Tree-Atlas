---
description: Instructions for MDX tree content
applyTo: content/**/*.mdx
---

# Tree Content Guidelines

## Frontmatter Requirements

Every tree file MUST include:

```yaml
---
title: "Common Name"
scientificName: "Genus species"
family: "Familyaceae"
locale: "en" # or "es"
slug: "common-name"
description: "Brief SEO description (150-160 chars)"
---
```

## Optional Frontmatter

```yaml
nativeRegion: "Region description"
conservationStatus: "LC" # EX, EW, CR, EN, VU, NT, LC, DD, NE
maxHeight: "25 m"
elevation: "0-1500 m"
uses: ["timber", "ornamental", "medicinal"]
tags: ["native", "deciduous", "dry-forest"]
distribution: ["guanacaste", "puntarenas"]
floweringSeason: ["march", "april", "may"]
fruitingSeason: ["june", "july", "august"]
featuredImage: "/images/trees/slug/featured.jpg"
images: ["/images/trees/slug/01.jpg"]
```

## Content Structure

Follow this standard structure (see docs/CONTENT_STANDARDIZATION_GUIDE.md):

1. **Title & Callout** - Key highlight
2. **Quick Reference** - QuickRef + INaturalistEmbed
3. **Photo Gallery** - 5 high-quality images
4. **Taxonomy** - Scientific classification
5. **Physical Description** - Botanical details
6. **Distribution** - Geographic range
7. **Habitat & Ecology** - Environmental context
8. **Uses** - Human applications
9. **Cultural Significance** - History and folklore
10. **Conservation** - Status and threats
11. **External Resources** - Links to databases

## Bilingual Requirements

- EVERY tree must have both `en/` and `es/` versions
- Keep the same `slug` across both languages
- Translate ALL user-facing text
- Keep scientific names unchanged
- Maintain the same image references

## MDX Components Available

- `<Callout>` - Highlighted information boxes
- `<QuickRef />` - Quick reference sidebar
- `<INaturalistEmbed />` - iNaturalist integration
- `<PropertiesGrid>` - Key-value display
- `<DataTable>` - Tabular data
- `<DistributionMap />` - Geographic map
- `<TreeGallery />` - Image gallery
