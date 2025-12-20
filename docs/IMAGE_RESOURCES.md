# Image Resources for Costa Rica Tree Atlas

## Current Image Status

All 73 tree species now have locally-served featured images downloaded from iNaturalist research-grade observations. Images are stored in `/public/images/trees/` and referenced using local paths like `/images/trees/[tree-name].jpg`.

### Attribution File

All image attributions are tracked in `/public/images/trees/attributions.json`. This file contains:

- Photographer attribution
- Source observation URL on iNaturalist
- Download timestamp

---

## Image Management Commands

### Quick Reference

| Command                         | Description                     |
| ------------------------------- | ------------------------------- |
| `npm run images:audit`          | Check status of all tree images |
| `npm run images:download`       | Download missing/broken images  |
| `npm run images:download:force` | Re-download all images          |
| `npm run images:refresh`        | Check for better quality images |

### Detailed Usage

```bash
# Audit - Check all images and report issues
npm run images:audit

# Download - Fix missing/broken images only
npm run images:download

# Download with force - Re-download ALL images
npm run images:download:force

# Refresh - Check iNaturalist for potentially better images
npm run images:refresh

# Process a single tree
node scripts/manage-tree-images.mjs download --tree=guanacaste

# Dry run (preview changes without modifying files)
node scripts/manage-tree-images.mjs download --dry-run
```

### How It Works

The image management script (`scripts/manage-tree-images.mjs`):

1. **Audit Mode**: Scans all tree MDX files and checks:
   - Local images exist and are valid (>20KB)
   - Remote URLs are accessible
   - Identifies placeholders, broken links, and missing images

2. **Download Mode**: For each tree needing an image:
   - Searches iNaturalist API for the tree's taxon
   - Fetches research-grade photos (Costa Rica first, then global)
   - Downloads highest-voted photos
   - Resizes to 1200px width (using Sharp, ImageMagick, or sips)
   - Saves as optimized JPEG (85% quality)
   - Updates both EN and ES MDX frontmatter
   - Records attribution in `attributions.json`

3. **Refresh Mode**: Compares current images against iNaturalist to find potentially better photos (higher vote counts).

### Cross-Platform Support

The script works in multiple environments:

- **macOS**: Uses `sips` (built-in) or Sharp
- **Linux/CI**: Uses ImageMagick or Sharp
- **All platforms**: Falls back to Sharp (Node.js)

---

## Nightly Image Maintenance

A GitHub Actions workflow runs nightly at 3 AM UTC:

1. **Audits** all tree images for issues
2. **Downloads** missing or broken images automatically
3. **Updates** iNaturalist links in MDX files
4. **Creates a PR** if any changes were made

### Manual Trigger

You can manually run the workflow from GitHub Actions with these modes:

- `audit` - Check images only
- `download` - Download missing images
- `download-force` - Re-download all images
- `refresh` - Check for better images

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
2. Run `node scripts/manage-tree-images.mjs download --tree=[slug]`
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
