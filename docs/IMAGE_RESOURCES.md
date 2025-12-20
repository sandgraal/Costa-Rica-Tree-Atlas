# Image Resources for Costa Rica Tree Atlas

## Current Image Status

All 54 tree species now have locally-served featured images downloaded from iNaturalist research-grade observations. Images are stored in `/public/images/trees/` and referenced using local paths like `/images/trees/[tree-name].jpg`.

### Attribution File

All image attributions are tracked in `/public/images/trees/attributions.json`. This file contains:

- Photographer attribution
- Source observation URL on iNaturalist
- Download timestamp

### Automated Image Download Script

Use `scripts/download-tree-images.mjs` to download or update tree images:

```bash
# Dry run - preview what will be downloaded
node scripts/download-tree-images.mjs --dry-run

# Download images for trees with placeholder URLs
node scripts/download-tree-images.mjs

# Force re-download all images
node scripts/download-tree-images.mjs --force

# Download for a specific tree
node scripts/download-tree-images.mjs --tree=guanacaste
```

The script:

1. Searches iNaturalist API for each tree's taxon
2. Finds research-grade photos (prioritizing Costa Rica observations)
3. Downloads the highest-voted photos
4. Resizes to 1200px width
5. Saves as optimized JPEG
6. Updates MDX frontmatter to use local paths
7. Records attribution data

---

## Recommended Image Sources

### 1. iNaturalist (Primary Source - Used for All Trees)

- **API**: `https://api.inaturalist.org/v1/`
- **License**: Most photos are CC BY-NC (Attribution-NonCommercial)
- **What you'll find**: Tree form, leaves, bark, habitat shots
- **Costa Rica Place ID**: 6924

### 2. Tropicos.org (Missouri Botanical Garden)

- Scientific botanical images
- Good for leaf and flower details

### 3. GBIF (Global Biodiversity Information Facility)

- https://www.gbif.org/
- Aggregates images from multiple sources

---

## Image Specifications

- **Format**: JPG (optimized at 85% quality)
- **Width**: 1200px (auto-scaled from original)
- **Location**: `/public/images/trees/`
- **Naming**: `[tree-slug].jpg` (e.g., `guanacaste.jpg`)

### File Structure

```
public/images/trees/
├── attributions.json    # Photo credits and sources
├── aguacatillo.jpg
├── almendro.jpg
├── balsa.jpg
├── ... (54 tree images total)
└── zapote.jpg
```

---

## Adding New Tree Images

When adding a new tree species:

1. Create the MDX file with `featuredImage: "/images/trees/[slug].jpg"`
2. Run `node scripts/download-tree-images.mjs --tree=[slug]`
3. Verify the image quality and update if needed

### Manual Image Addition

If you have a better image:

1. Resize to at least 1200px width
2. Save as optimized JPEG in `/public/images/trees/[slug].jpg`
3. Update `attributions.json` with proper credit
4. The MDX frontmatter should reference `/images/trees/[slug].jpg`

---

## Future Enhancements

Additional images per tree could include:

- `/public/images/trees/[slug]-bark.jpg` - Bark detail
- `/public/images/trees/[slug]-leaves.jpg` - Foliage
- `/public/images/trees/[slug]-wood.jpg` - Lumber/grain
- `/public/images/trees/[slug]-flowers.jpg` - Flowering
- `/public/images/trees/[slug]-fruit.jpg` - Fruiting

---

## License Considerations

Most images are from iNaturalist with various Creative Commons licenses:

- **CC BY** - Attribution required
- **CC BY-NC** - Attribution + Non-commercial
- **CC BY-NC-ND** - Attribution + Non-commercial + No derivatives
- **All Rights Reserved** - Used with implicit permission for educational purposes

Always check `attributions.json` for specific license requirements when using images commercially.
