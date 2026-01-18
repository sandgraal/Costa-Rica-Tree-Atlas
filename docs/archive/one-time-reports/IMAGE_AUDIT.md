# Costa Rica Tree Atlas - Image Audit Report

**Generated:** 2026-01-15  
**Script Version:** manage-tree-images.mjs  
**Repository Status:** Production

---

## Executive Summary

This document provides a comprehensive audit of all tree images in the Costa Rica Tree Atlas, including their status, quality, and any issues requiring attention.

### Overall Statistics

| Metric                            | Count | Percentage |
| --------------------------------- | ----- | ---------- |
| **Total Trees**                   | 128   | 100%       |
| **Trees with Valid Local Images** | 120   | 93.75%     |
| **Trees with External URLs**      | 4     | 3.13%      |
| **Trees Missing Images**          | 4     | 3.13%      |
| **Orphaned Images**               | 1     | -          |
| **Optimized Image Directories**   | 7     | 5.47%      |

### Image Health Score: 94% ✅

The majority of trees (120/128) have valid local images. The system is functioning well with only 4 trees requiring image downloads and 4 trees currently using external URLs.

---

## Detailed Breakdown

### 1. Trees with Valid Local Images (120 trees)

These trees have local JPG files in `public/images/trees/` and properly configured `featuredImage` paths in their MDX frontmatter.

#### Sample of Trees with Local Images:

- aceituno (133KB)
- aguacate (367KB)
- aguacatillo (72KB)
- ajo (634KB)
- alcornoque (269KB)
- almendro (848KB)
- amarillon (226KB)
- anona (334KB)
- araza (580KB)
- arrayan (268KB)
- balsa (347KB)
- botarrama (307KB)
- cacao (337KB)
- cachimbo (254KB)
- caimito (799KB)
- cana-agria (324KB)
- cana-fistula (374KB)
- cana-india (419KB)
- caoba (412KB)
- caobilla (214KB)
- ... and 100 more

**Average Image Size:** 474KB

**Image Quality:** All local images meet minimum size requirements (>20KB) and are suitable for display on tree detail pages.

---

### 2. Trees with External URLs (4 trees)

These trees currently use iNaturalist images via external URLs. While functional, these rely on external services and may be subject to removal or link rot.

| Tree                 | Scientific Name       | Image URL                                                                  | Status    |
| -------------------- | --------------------- | -------------------------------------------------------------------------- | --------- |
| **cornizuelo**       | Vachellia collinsii   | https://inaturalist-open-data.s3.amazonaws.com/photos/294191914/large.jpeg | ✅ Active |
| **llama-del-bosque** | Spathodea campanulata | https://inaturalist-open-data.s3.amazonaws.com/photos/378469362/large.jpg  | ✅ Active |
| **quebracho**        | Lysiloma divaricatum  | https://inaturalist-open-data.s3.amazonaws.com/photos/37740461/large.jpeg  | ✅ Active |
| **quizarra**         | Leucaena leucocephala | https://inaturalist-open-data.s3.amazonaws.com/photos/44210839/large.jpg   | ✅ Active |

**Recommendation:** Consider downloading these images locally using `npm run images:download` to ensure long-term availability and improve performance.

---

### 3. Trees with Missing Featured Images (4 trees)

These trees have no `featuredImage` field in their MDX frontmatter and require images to be added.

| Tree                  | Scientific Name      | Family        | Published Date | Priority |
| --------------------- | -------------------- | ------------- | -------------- | -------- |
| **comenegro**         | Simarouba glauca     | Simaroubaceae | 2026-01-15     | 🔴 High  |
| **lechoso-montanero** | Brosimum lactescens  | Moraceae      | 2026-01-15     | 🔴 High  |
| **mayo**              | Vochysia hondurensis | Vochysiaceae  | 2026-01-15     | 🔴 High  |
| **sigua**             | Nectandra cissiflora | Lauraceae     | 2026-01-14     | 🔴 High  |

**Impact:** These trees will display placeholder images on:

- Main tree listing page
- Tree detail pages
- Search results
- Featured tree carousels
- Seasonal calendar views

**Action Required:**

1. Source high-quality images for these species from iNaturalist or other CC-licensed sources
2. Run `npm run images:download` to attempt automatic image sourcing
3. Manually add images if automatic sourcing fails

---

### 4. Orphaned Images (1 file)

Images that exist in `public/images/trees/` but have no corresponding MDX file.

| Image File        | Status   | Recommendation                                                              |
| ----------------- | -------- | --------------------------------------------------------------------------- |
| **chilamate.jpg** | Orphaned | Either create MDX file for this tree or remove image to clean up repository |

**Action Options:**

- If chilamate is a valid Costa Rican tree, create MDX files in both `content/trees/en/` and `content/trees/es/`
- If this image was uploaded in error or the tree was removed, delete `public/images/trees/chilamate.jpg`

---

### 5. Optimized Images (7 directories)

The following trees have optimized AVIF/WebP versions in `public/images/trees/optimized/[slug]/`:

1. aceituno
2. aguacate
3. aguacatillo
4. ajo
5. alcornoque
6. almendro
7. amarillon

**Note:** The optimization process creates multiple sizes (400w, 800w, 1200w) in modern formats (AVIF, WebP) for improved performance and bandwidth efficiency.

**Recommendation:** Continue optimizing remaining images by running `npm run images:optimize` to improve page load times across the site.

---

## Image Resolution System

The atlas uses a 3-tier fallback system (implemented in `src/lib/image/image-resolver.ts`):

### Tier 1: Optimized Images

- Location: `public/images/trees/optimized/[slug]/`
- Formats: AVIF (preferred), WebP (fallback)
- Sizes: 400w, 800w, 1200w
- Includes srcSet for responsive loading

### Tier 2: Original Images

- Location: `public/images/trees/[slug].jpg`
- Format: JPEG
- Single file per tree

### Tier 3: External/Placeholder

- External URLs (e.g., iNaturalist)
- Placeholder SVG (`/images/placeholder-tree.svg`)

The `SafeImage` component (`src/components/SafeImage.tsx`) handles errors gracefully, showing a tree icon placeholder if images fail to load.

---

## Quality Metrics

### Image Size Distribution

- **Minimum:** 72KB (aguacatillo)
- **Maximum:** 1190KB (cedro-amargo)
- **Average:** 474KB
- **Median:** ~400KB

All images meet the minimum size threshold of 20KB and are suitable for web display.

### Resolution Standards

- **Target Width:** 1200px (for source images)
- **Gallery Target Width:** 800px
- **Minimum Size:** 20KB
- **Gallery Minimum Size:** 10KB

---

## Validation Process

### Current Validation Scripts

1. **`npm run images:audit`** - Audits featured images
   - Checks for missing featuredImage fields
   - Validates local file existence
   - Reports external URLs
   - Calculates image sizes

2. **`npm run images:audit:gallery`** - Audits gallery images
   - Validates gallery image arrays in MDX files
   - Checks existence of gallery images

3. **`npm run images:validate`** - Validates all image references ⭐ NEW
   - Comprehensive validation of all featuredImage paths
   - Checks local file existence
   - Validates external URLs are accessible
   - Checks locale consistency (EN/ES)
   - Reports broken references
   - **Runs on every PR automatically via GitHub Actions**

4. **`npm run images:validate:verbose`** - Verbose validation
   - Same as images:validate but with detailed per-tree output
   - Useful for debugging specific issues

5. **`npm run images:check`** - Checks for orphaned images
   - Identifies images without corresponding MDX files

### Recommended Validation Workflow

Run comprehensive validation:

```bash
npm run images:validate
```

Run all audits together:

```bash
npm run images:audit:all
```

This runs both featured image and gallery audits in sequence.

### CI/CD Integration

**Automatic PR Validation** - A GitHub Actions workflow (`.github/workflows/validate-images.yml`) runs on every pull request that modifies:

- MDX files in `content/trees/`
- Images in `public/images/trees/`

The workflow:

1. Validates all image references
2. Posts results as a PR comment
3. Fails the check if broken references are found
4. Prevents merging PRs with broken images

This ensures no broken image references make it into production.

---

## Action Items

### Immediate Actions (High Priority)

1. **Add missing images for 4 trees:**
   - comenegro
   - lechoso-montanero
   - mayo
   - sigua

   **Command:** `npm run images:download`

2. **Decide on chilamate.jpg:**
   - Create MDX files if valid tree
   - Delete if orphaned/obsolete

### Recommended Actions (Medium Priority)

3. **Download external URL images locally:**
   - cornizuelo
   - llama-del-bosque
   - quebracho
   - quizarra

   **Command:** `npm run images:download`

4. **Continue image optimization:**
   - Optimize remaining 121 trees (only 7/128 currently optimized)

   **Command:** `npm run images:optimize`

### Future Enhancements (Low Priority)

5. **Add CI/CD validation:**
   - Create GitHub Actions workflow to validate image references on PRs
   - Prevent merging PRs with broken image paths

6. **Implement automated quality checks:**
   - Minimum resolution validation
   - Aspect ratio verification
   - File size optimization recommendations

---

## Tree-Specific Notes

### Trees Needing Real Photos

All 4 trees missing images are recently added (January 2026) and need high-quality photographs:

#### Comenegro (Simarouba glauca)

- **Habitat:** Dry forest, 0-1000m elevation
- **Key Features:** Distinctive smooth copper-colored bark
- **Photo Needs:** Whole tree, bark detail, leaves, flowers

#### Lechoso Montañero (Brosimum lactescens)

- **Habitat:** Montane forest, 0-1600m elevation
- **Key Features:** White latex, edible sap
- **Photo Needs:** Whole tree, latex flow, fruit

#### Mayo (Vochysia hondurensis)

- **Habitat:** Rainforest, 0-1200m elevation
- **Key Features:** Tall emergent tree, yellow flowers
- **Photo Needs:** Whole tree, flowers, bark

#### Sigua (Nectandra cissiflora)

- **Habitat:** Rainforest, 0-1200m elevation
- **Key Features:** Aromatic wood, laurel family
- **Photo Needs:** Whole tree, leaves, flowers

---

## Technical Implementation Details

### Image Paths

Images should be referenced in MDX frontmatter using one of these patterns:

```yaml
# Local original image
featuredImage: "/images/trees/slug.jpg"

# Optimized image (resolved automatically by image-resolver.ts)
featuredImage: "/images/trees/optimized/slug/800w.avif"

# External URL (not recommended for production)
featuredImage: "https://example.com/image.jpg"
```

**Best Practice:** Use local images only. The system will automatically serve optimized versions if they exist.

### Adding New Images

1. Place image in `public/images/trees/[slug].jpg`
2. Update MDX frontmatter: `featuredImage: "/images/trees/[slug].jpg"`
3. Optionally optimize: `npm run images:optimize`
4. Verify with: `npm run images:audit`

### Image Attribution

All image attributions are tracked in `public/images/trees/attributions.json`. This file contains:

- Photographer/source
- License information
- iNaturalist observation IDs
- Original photo URLs

---

## Conclusion

The Costa Rica Tree Atlas image system is in excellent health with a 94% success rate. The primary issues are:

1. **4 new trees need images** (easily resolved with download script)
2. **4 trees use external URLs** (recommend downloading for reliability)
3. **1 orphaned image** (minor housekeeping)

The existing image infrastructure (SafeImage component, image-resolver, 3-tier fallback) is robust and handles edge cases gracefully. Users will see appropriate placeholders for any missing images rather than broken images.

### Recommendations

- Continue the current image management workflow
- Prioritize completing the 4 missing images
- Gradually optimize all images for better performance
- Consider implementing CI/CD validation for future additions

---

**Report Compiled By:** Image Audit Script  
**For Questions:** See `scripts/manage-tree-images.mjs` or consult project maintainers  
**Last Updated:** 2026-01-15
