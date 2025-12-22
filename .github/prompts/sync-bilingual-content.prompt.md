---
mode: agent
description: Synchronize content between English and Spanish versions
---

# Sync Bilingual Content

Ensure English and Spanish content files are synchronized with matching structure and complete translations.

## Tasks

1. **Compare file counts** in `content/trees/en/` and `content/trees/es/`
2. **Identify missing translations** - files that exist in one locale but not the other
3. **Compare section structure** between language versions
4. **Verify frontmatter consistency** - same fields in both versions

## Sync Checklist

For each tree, verify:

- [ ] Both `en/{slug}.mdx` and `es/{slug}.mdx` exist
- [ ] Same `slug` in frontmatter
- [ ] Same `scientificName` (unchanged between languages)
- [ ] Same `family` (unchanged between languages)
- [ ] Same `distribution` array
- [ ] Same `floweringSeason` and `fruitingSeason` arrays
- [ ] Same `tags` array
- [ ] Same `images` array
- [ ] Same section headings (translated)
- [ ] All user-facing content translated

## Common Issues

- Missing Spanish translation for newly added English content
- Different section count between versions
- Untranslated callouts or data tables
- Different frontmatter field values

## Translation Notes

- Scientific names stay in Latin
- Keep image paths identical
- Month names should be in English (used as keys)
- Translate all descriptive text, headings, and callouts
