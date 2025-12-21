# Image Resources for Costa Rica Tree Atlas

## Current Image Status

All 74 tree species now have locally-served featured images downloaded from iNaturalist research-grade observations. Images are stored in `/public/images/trees/` and referenced using local paths like `/images/trees/[tree-name].jpg`.

Additionally, many tree pages include **photo galleries** with diverse images showing different aspects of each tree (whole tree, leaves, bark, flowers, fruit, habitat).

### Attribution File

All image attributions are tracked in `/public/images/trees/attributions.json`. This file contains:

- Photographer attribution
- Source observation URL on iNaturalist
- Download timestamp
- Gallery image metadata (when applicable)

---

## Image Management Commands

### Quick Reference

| Command                                | Description                              |
| -------------------------------------- | ---------------------------------------- |
| `npm run images:audit`                 | Check status of all featured images      |
| `npm run images:audit:gallery`         | Check status of all gallery images       |
| `npm run images:download`              | Download missing/broken featured images  |
| `npm run images:download:force`        | Re-download all featured images          |
| `npm run images:refresh`               | Check for better quality featured images |
| `npm run images:refresh:gallery`       | Update gallery images with better photos |
| `npm run images:refresh:gallery:force` | Force refresh all gallery images         |

### Detailed Usage

```bash
# Audit - Check all featured images and report issues
npm run images:audit

# Audit - Check all gallery images for broken/low-quality photos
npm run images:audit:gallery

# Download - Fix missing/broken featured images only
npm run images:download

# Download with force - Re-download ALL featured images
npm run images:download:force

# Refresh - Check iNaturalist for potentially better featured images
npm run images:refresh

# Refresh Gallery - Update gallery images with high-quality, diverse photos
npm run images:refresh:gallery

# Force Refresh Gallery - Re-fetch all gallery images
npm run images:refresh:gallery:force

# Process a single tree
node scripts/manage-tree-images.mjs download --tree=guanacaste
node scripts/manage-tree-images.mjs refresh-gallery --tree=ceiba

# Dry run (preview changes without modifying files)
node scripts/manage-tree-images.mjs download --dry-run
node scripts/manage-tree-images.mjs refresh-gallery --dry-run
```

### How It Works

The image management script (`scripts/manage-tree-images.mjs`):

#### Featured Images

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

#### Gallery Images

1. **Audit Gallery Mode**: Scans photo galleries in MDX files and checks:
   - All gallery image URLs are accessible
   - Images use optimal resolution (medium/large, not square/small)
   - Identifies broken links and low-quality images

2. **Refresh Gallery Mode**: For each tree with gallery issues:
   - Fetches diverse, high-quality photos from iNaturalist
   - Prioritizes photos showing: whole tree, leaves, bark, flowers, fruit
   - Prefers Costa Rica observations with high vote counts
   - Updates `<ImageGallery>` sections in both EN and ES MDX files
   - Records gallery attributions

### Cross-Platform Support

The script works in multiple environments:

- **macOS**: Uses `sips` (built-in) or Sharp
- **Linux/CI**: Uses ImageMagick or Sharp
- **All platforms**: Falls back to Sharp (Node.js)

---

## Nightly Image Maintenance

A GitHub Actions workflow runs nightly at 3 AM UTC:

1. **Audits** all featured tree images for issues
2. **Audits** all photo gallery images for broken/low-quality photos
3. **Downloads** missing or broken featured images automatically
4. **Refreshes** gallery images that have issues
5. **Updates** iNaturalist links in MDX files
6. **Creates a PR** if any changes were made

### Manual Trigger

You can manually run the workflow from GitHub Actions with these modes:

- `audit` - Check featured images only
- `audit-gallery` - Check gallery images only
- `download` - Download missing featured images
- `download-force` - Re-download all featured images
- `refresh` - Check for better featured images
- `refresh-gallery` - Update gallery images with better photos
- `full` - Run all audits and fixes

### Gallery Image Quality Criteria

Gallery images are selected based on:

- **Diversity**: Shows different aspects (whole tree, leaves, bark, flowers, fruit, habitat)
- **Quality**: Minimum vote count on iNaturalist (community validation)
- **Resolution**: Uses medium/large size images, not thumbnails
- **Location**: Costa Rica observations preferred
- **Representativeness**: Images that clearly show the tree species

---

## Image Sources (Priority Order)

### 1. iNaturalist (Primary Source)

- **API**: `https://api.inaturalist.org/v1/`
- **License**: Most photos are CC BY-NC (Attribution-NonCommercial)
- **What you'll find**: Tree form, leaves, bark, habitat shots
- **Costa Rica Place ID**: 6924
- **Priority**: Research-grade observations first, then needs-ID, then any quality
- **Used for**: All trees with documented observations

### 2. GBIF (Global Biodiversity Information Facility) - Fallback

- **API**: `https://api.gbif.org/v1/`
- **License**: Various (check individual records)
- **What you'll find**: Herbarium specimens, field photos
- **Used for**: Rare species without iNaturalist coverage (e.g., Orey - Campnosperma panamense)
- **Note**: Filters out herbarium specimen images for better visual appeal

### 3. Wikimedia Commons - Secondary Fallback

- **API**: `https://commons.wikimedia.org/w/api.php`
- **License**: CC BY-SA typically
- **What you'll find**: General botanical images
- **Used for**: Species with no other available sources

### 4. Tropicos.org (Missouri Botanical Garden)

- Scientific botanical images
- Good for leaf and flower details
- Manual reference only (no API integration)

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

## Photo Gallery Structure

Tree pages can include photo galleries using the `<ImageGallery>` component in MDX:

```mdx
<ImageGallery>
  <ImageCard
    src="https://inaturalist-open-data.s3.amazonaws.com/photos/12345/medium.jpg"
    alt="Tree description"
    title="Photo Title"
    credit="Photographer Name"
    license="CC BY-NC"
    sourceUrl="https://www.inaturalist.org/observations/12345"
  />
  <!-- More ImageCard components -->
</ImageGallery>
```

### Gallery Image Categories

The refresh-gallery command attempts to include diverse photos:

- **Whole Tree**: Overall tree form and silhouette
- **Leaves**: Foliage details and leaf shapes
- **Bark**: Trunk texture and bark patterns
- **Flowers**: Blooms and flowering structures
- **Fruit**: Seeds, fruits, and reproductive parts
- **Habitat**: Tree in its natural environment

---

## Adding New Tree Images

When adding a new tree species:

1. Create the MDX file with `featuredImage: "/images/trees/[slug].jpg"`
2. Run `node scripts/manage-tree-images.mjs download --tree=[slug]`
3. Verify the image quality and update if needed
4. Optionally add a gallery section and run `npm run images:refresh:gallery --tree=[slug]`

### Manual Image Addition

If you have a better image:

1. Resize to at least 1200px width
2. Save as optimized JPEG in `/public/images/trees/[slug].jpg`
3. Update `attributions.json` with proper credit
4. The MDX frontmatter should reference `/images/trees/[slug].jpg`

---

## Future Enhancements

Potential additional local image types per tree:

- `/public/images/trees/[slug]-bark.jpg` - Bark detail (local copy)
- `/public/images/trees/[slug]-leaves.jpg` - Foliage (local copy)
- `/public/images/trees/[slug]-wood.jpg` - Lumber/grain
- `/public/images/trees/[slug]-flowers.jpg` - Flowering (local copy)
- `/public/images/trees/[slug]-fruit.jpg` - Fruiting (local copy)

These would complement the gallery images which currently use external URLs.

---

## License Considerations

Most images are from iNaturalist with various Creative Commons licenses:

- **CC BY** - Attribution required
- **CC BY-NC** - Attribution + Non-commercial
- **CC BY-NC-ND** - Attribution + Non-commercial + No derivatives
- **All Rights Reserved** - Used with implicit permission for educational purposes

Always check `attributions.json` for specific license requirements when using images commercially.
