# Image Quality Monitoring

**Last Updated:** 2026-01-12  
**Status:** ✅ Active - Automated weekly workflow via GitHub Actions

## Overview

The Costa Rica Tree Atlas implements automated weekly image quality monitoring to ensure all tree images remain accessible, high-quality, and properly formatted across the site.

## Monitoring Schedule

- **Frequency:** Weekly (every Sunday at 3 AM UTC)
- **Automation:** Automated via GitHub Actions workflow `weekly-image-quality.yml`
- **Review Process:** Creates a Pull Request for manual review before merging

## What Gets Checked

### 1. Featured Images

- ✅ Image accessibility (local files and remote URLs)
- ✅ File size validation (minimum 20KB)
- ✅ Placeholder detection
- ✅ Remote URL validation with retry logic
- ✅ Usage tracking (main page, calendar, detail pages)

### 2. Gallery Images

- ✅ Image quality assessment
- ✅ Resolution validation
- ✅ URL accessibility
- ✅ Representative category distribution

### 3. Quality Metrics

- **Image Health Score:** Percentage of valid images
- **Average File Size:** Ensures adequate resolution
- **Impact Analysis:** Identifies which pages are affected by issues
- **Trend Tracking:** Historical comparison of image quality

## How It Works

### Automated Workflow (`weekly-image-quality.yml`)

```yaml
Schedule: "0 3 * * 0" (Every Sunday at 3 AM UTC)
```

**Steps:**

1. **Comprehensive Audit**
   - Scans all featured images
   - Validates gallery images
   - Counts issues by type (broken, placeholder, too small)

2. **Quality Metrics Generation**
   - Calculates image health percentage
   - Determines average file sizes
   - Identifies affected pages

3. **Automated Fixes** (when needed)
   - Downloads missing/broken images from:
     - iNaturalist (primary)
     - GBIF (fallback)
     - Wikimedia Commons (fallback)
   - Refreshes low-quality images
   - Updates outdated iNaturalist links

4. **Pull Request Creation**
   - Creates PR with detailed audit report
   - Assigns to maintainers for review
   - Labels: `maintenance`, `images`, `automated`
   - Includes file change summary

5. **Workflow Summary**
   - Posts detailed report to GitHub Actions summary
   - Provides quick overview of actions taken

## Manual Triggers

You can manually trigger the workflow with different modes:

```bash
# Via GitHub UI: Actions → Weekly Image Quality Check → Run workflow
```

**Available Modes:**

- `audit` - Check images without making changes
- `audit-gallery` - Check gallery images only
- `download` - Download missing/broken images
- `download-force` - Re-download all images
- `refresh` - Update featured images with better versions
- `refresh-gallery` - Update gallery images
- `full` - Complete audit and fix cycle

## Quality Standards

### Featured Images

- **Minimum Size:** 20KB
- **Target Width:** 1200px
- **Format:** JPEG
- **Source Priority:**
  1. iNaturalist (Costa Rica observations preferred)
  2. GBIF
  3. Wikimedia Commons

### Gallery Images

- **Minimum Size:** 10KB
- **Target Width:** 800px
- **Categories:** Whole tree, leaves, bark, flowers, fruit, habitat
- **Quality Criteria:**
  - Minimum 3 faves/votes
  - Prefer Costa Rica observations
  - Photos within last 5 years
  - Aspect ratio: 0.5-2.0

## Error Handling

### Transient Failures

- **Retry Logic:** 3 attempts with exponential backoff
- **Timeout:** 30 seconds per attempt
- **Delays:** 1s, 2s, 4s between retries

### Browser-Side Resilience

- `SafeImage` component handles image load failures
- Graceful fallback to placeholder icons
- No broken image icons shown to users

## Monitoring Dashboard

### Key Metrics Tracked

- ✅ Total trees: `108`
- ✅ Image health: `100%` (target: >98%)
- ✅ Average image size: `488KB`
- ✅ Broken/missing: `0` (target: 0)
- ✅ Placeholders: `0` (target: 0)
- ✅ Undersized: `0` (target: 0)

### Impact Analysis

When issues are detected, the system identifies affected pages:

- Main page (featured trees, what's blooming)
- Calendar page (seasonal visualization)
- Individual tree detail pages

## Best Practices

### For Maintainers

1. **Review PRs Promptly**
   - Check the audit report in PR description
   - Verify image quality improvements
   - Merge if changes look appropriate

2. **Monitor Trends**
   - Check weekly workflow runs
   - Look for patterns in failures
   - Address recurring issues

3. **Manual Intervention**
   - Some trees may require custom images
   - Use frontmatter overrides when needed
   - Document special cases

### For Contributors

1. **Adding New Trees**
   - Include `featuredImage` in frontmatter
   - Use high-quality images (>20KB)
   - Prefer local paths over external URLs

2. **Updating Images**
   - Test locally before committing
   - Run `npm run images:audit` to verify
   - Check both en/ and es/ versions

## Troubleshooting

### Issue: Audit finds broken images

**Solution:** Run `npm run images:download` to fetch from sources

### Issue: Images too small

**Solution:** Run `npm run images:refresh` for better quality versions

### Issue: External URL broken

**Solution:** Script will automatically download and localize the image

### Issue: No images found for tree

**Causes:**

- Taxon not in iNaturalist
- Scientific name mismatch
- No photos in any source

**Solution:**

- Add to `SCIENTIFIC_NAME_FIXES` in script
- Manually provide image URL
- Contact iNaturalist to add taxon

## Commands Reference

```bash
# Run comprehensive audit (featured + gallery)
npm run images:audit:all

# Audit featured images only
npm run images:audit

# Audit gallery images only
npm run images:audit:gallery

# Download missing/broken images
npm run images:download

# Force re-download all images
npm run images:download:force

# Refresh with better quality
npm run images:refresh

# Refresh gallery images
npm run images:refresh:gallery
```

## Future Enhancements

Potential improvements for monitoring:

- [ ] Real-time alerts via Slack/Discord
- [ ] Historical trend graphs
- [ ] Automated A/B testing for image quality
- [ ] CDN integration monitoring
- [ ] Performance metrics (LCP, bandwidth)
- [ ] User-reported broken image tracking

## Related Documentation

- [Content Standardization Guide](./CONTENT_STANDARDIZATION_GUIDE.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Scripts README](../scripts/README.md)
