---
mode: agent
description: Audit and manage tree images for quality and completeness
---

# Audit Tree Images

Review and manage tree images to ensure quality and completeness across all tree entries.

## Commands

```bash
# Run the image audit script
npm run images:audit

# Manage tree images
node scripts/manage-tree-images.mjs
```

## Image Requirements

1. **Location**: `public/images/trees/{slug}/`
2. **Featured image**: Required for each tree
3. **Gallery images**: 5 recommended per tree
4. **Format**: JPG or WebP preferred
5. **Attribution**: Must be properly credited

## Audit Tasks

1. **List trees missing featured images**
2. **List trees with fewer than 5 gallery images**
3. **Check frontmatter `featuredImage` and `images` fields**
4. **Verify image files exist at referenced paths**
5. **Identify broken image references**

## Image Frontmatter

```yaml
featuredImage: "/images/trees/slug/featured.jpg"
images:
  - "/images/trees/slug/01.jpg"
  - "/images/trees/slug/02.jpg"
  - "/images/trees/slug/03.jpg"
```

## Resources

See `docs/IMAGE_RESOURCES.md` for:

- Recommended image sources
- Attribution requirements
- Image optimization guidelines
