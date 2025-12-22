---
mode: agent
description: Add a new tree species to the Costa Rica Tree Atlas in both English and Spanish
---

# Add New Tree Species

Create a new tree entry for the Costa Rica Tree Atlas. This will generate both English and Spanish MDX files following the project's content standards.

## Input Required

Please provide the following information about the tree:

- **Common Name (English)**:
- **Common Name (Spanish)**:
- **Scientific Name**:
- **Botanical Family**:
- **Slug** (URL-friendly, lowercase):

## Tasks

1. **Research the tree** using reliable botanical sources
2. **Create the English MDX file** at `content/trees/en/{slug}.mdx`
3. **Create the Spanish MDX file** at `content/trees/es/{slug}.mdx`
4. **Follow the standard template structure** from `docs/CONTENT_STANDARDIZATION_GUIDE.md`
5. **Include all required frontmatter fields**:
   - title, scientificName, family, locale, slug, description
   - nativeRegion, conservationStatus, maxHeight, elevation
   - uses, tags, distribution, floweringSeason, fruitingSeason
6. **Use available MDX components**: `<Callout>`, `<QuickRef />`, `<INaturalistEmbed />`, `<DataTable>`, `<DistributionMap />`
7. **Ensure both files have identical structure** but fully translated content

## Quality Checklist

- [ ] Both en/ and es/ files created with same slug
- [ ] All required frontmatter fields populated
- [ ] Scientific names unchanged between languages
- [ ] Conservation status uses IUCN codes (LC, NT, VU, EN, CR, etc.)
- [ ] Distribution uses valid Costa Rica regions
- [ ] Seasons use lowercase month names
