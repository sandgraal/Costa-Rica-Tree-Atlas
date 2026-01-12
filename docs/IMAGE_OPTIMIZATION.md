# Image Optimization System

**Last Updated:** 2026-01-12  
**Status:** ✅ Active - Sharp-based image optimization with automated workflows

## Overview

The Costa Rica Tree Atlas uses Sharp for high-performance image optimization. The system automatically generates multiple responsive image sizes and modern formats (WebP, AVIF, JPEG) to ensure optimal performance across all devices and network conditions.

**Scripts:** `scripts/optimize-images.mjs`  
**Workflow:** `.github/workflows/weekly-image-quality.yml`

## Features

- **Multiple Sizes**: Automatically generates thumbnail (400w), small (800w), medium (1200w), large (1600w), and original sizes
- **Modern Formats**: Outputs WebP, AVIF, and JPEG for maximum browser compatibility
- **Blur Placeholders**: Generates tiny blur data URLs for progressive image loading
- **Metadata Generation**: Creates JSON files with complete image information
- **Smart Caching**: Only re-optimizes changed images (unless forced)
- **Performance Targets**: Validates output against size targets for each variant

## Installation

Sharp is already installed as a production dependency:

```bash
npm install
```

## Usage

### Optimize New/Changed Images

```bash
npm run images:optimize
```

This will:

- Scan `public/images/trees/` for all images
- Skip images that haven't changed since last optimization
- Generate all size and format variants
- Create metadata JSON files
- Display optimization statistics

### Force Re-optimize All Images

```bash
npm run images:optimize:force
```

Use this when you want to regenerate all optimized images, for example after updating compression settings.

### Help

```bash
node scripts/optimize-images.mjs --help
```

## Output Structure

Optimized images are saved to `public/images/trees/optimized/{slug}/`:

```
public/images/trees/optimized/
  guanacaste/
    400w.webp       # Thumbnail WebP
    400w.avif       # Thumbnail AVIF
    400w.jpg        # Thumbnail JPEG
    800w.webp       # Small WebP
    800w.avif       # Small AVIF
    800w.jpg        # Small JPEG
    1200w.webp      # Medium WebP
    1200w.avif      # Medium AVIF
    1200w.jpg       # Medium JPEG
    1600w.webp      # Large WebP (if original is large enough)
    1600w.avif      # Large AVIF (if original is large enough)
    1600w.jpg       # Large JPEG (if original is large enough)
    original.webp   # Original size WebP
    original.avif   # Original size AVIF
    original.jpg    # Original size JPEG
    metadata.json   # Complete metadata
```

## Metadata JSON Structure

Each optimized image set includes a `metadata.json` file:

```json
{
  "slug": "guanacaste",
  "originalSize": 375381,
  "variants": {
    "400w_webp": {
      "width": 400,
      "height": 533,
      "size": 40226,
      "path": "/images/trees/optimized/guanacaste/400w.webp"
    },
    "800w_webp": {
      "width": 800,
      "height": 1067,
      "size": 92788,
      "path": "/images/trees/optimized/guanacaste/800w.webp"
    }
    // ... more variants
  },
  "blurDataURL": "data:image/webp;base64,UklGRi4AAABXRUJQVlA4I...",
  "generatedAt": "2026-01-07T04:10:25.974Z"
}
```

### Metadata Fields

- **slug**: Tree identifier (matches filename)
- **originalSize**: Original image size in bytes
- **variants**: Object containing all generated image variants
  - **width**: Image width in pixels
  - **height**: Image height in pixels
  - **size**: File size in bytes
  - **path**: Public URL path to the image
- **blurDataURL**: Base64-encoded tiny blur placeholder for progressive loading
- **generatedAt**: ISO 8601 timestamp of optimization

## Performance Targets

The optimization script validates output against these size targets:

| Size  | Target  | Typical Use Case              |
| ----- | ------- | ----------------------------- |
| 400w  | < 50KB  | Mobile thumbnails, list views |
| 800w  | < 150KB | Tablet views, small screens   |
| 1200w | < 300KB | Desktop views, main images    |
| 1600w | < 500KB | Large desktop displays        |

### Compression Ratios

Actual compression depends on image content, but typical results:

- **WebP**: 25-35% smaller than JPEG
- **AVIF**: 40-50% smaller than JPEG

Example from `aguacate.jpg` (375 KB original):

- 400w WebP: 39 KB (89% smaller)
- 800w WebP: 91 KB (75% smaller)
- Original WebP: 154 KB (58% smaller)

## Compression Settings

The system uses these quality settings for optimal balance between size and visual quality:

```typescript
const QUALITY_SETTINGS = {
  jpg: 80, // Progressive JPEG with MozJPEG
  webp: 75, // WebP with effort level 6
  avif: 70, // AVIF with effort level 6
};
```

## Image Processing Details

### Features

1. **Auto-rotation**: Respects EXIF orientation data
2. **EXIF Stripping**: Removes metadata for privacy and file size
3. **Progressive JPEGs**: Better perceived loading performance
4. **Aspect Ratio Preservation**: Maintains original proportions
5. **No Upscaling**: Never enlarges images beyond original dimensions

### Sharp Configuration

```typescript
sharp(inputPath)
  .rotate() // Auto-rotate based on EXIF
  .resize(targetWidth, undefined, {
    fit: "inside",
    withoutEnlargement: true,
  })
  .webp({ quality: 75, effort: 6 })
  .toFile(outputPath);
```

## Using the TypeScript API

You can also use the image optimizer programmatically:

```typescript
import { optimizeImage, saveMetadata } from "@/lib/image-optimizer";

const result = await optimizeImage({
  inputPath: "/path/to/image.jpg",
  outputDir: "/path/to/output",
  sizes: ["thumbnail", "small", "medium"],
  formats: ["webp", "avif", "jpg"],
  generateBlurPlaceholder: true,
});

await saveMetadata(result.metadata, "/path/to/output/metadata.json");

console.log(`Optimized: ${result.metadata.slug}`);
console.log(`Savings: ${result.savingsPercent.toFixed(1)}%`);
```

## Integration with Next.js

To use optimized images in Next.js components:

```tsx
import type { ImageMetadata } from "@/lib/image-optimizer";
import metadata from "@/public/images/trees/optimized/guanacaste/metadata.json";

function TreeImage({ slug }: { slug: string }) {
  const webpVariant = metadata.variants["800w_webp"];
  const jpgVariant = metadata.variants["800w_jpg"];

  return (
    <picture>
      <source srcSet={webpVariant.path} type="image/webp" />
      <img
        src={jpgVariant.path}
        alt={slug}
        width={jpgVariant.width}
        height={jpgVariant.height}
        style={{ backgroundImage: `url(${metadata.blurDataURL})` }}
      />
    </picture>
  );
}
```

## Git Integration

Optimized images are excluded from version control (`.gitignore`):

```gitignore
# optimized images (can be regenerated)
/public/images/trees/optimized/
```

**Rationale**: Optimized images can be regenerated on-demand and would significantly increase repository size. Run `npm run images:optimize` after cloning or when new images are added.

## CI/CD Integration

For automated deployment pipelines, add the optimization step:

```yaml
# Example GitHub Actions workflow
- name: Optimize Images
  run: npm run images:optimize

- name: Build
  run: npm run build
```

## Troubleshooting

### Images Not Optimizing

1. Check that source images exist in `public/images/trees/`
2. Verify file extensions are supported (`.jpg`, `.jpeg`, `.png`, `.webp`)
3. Ensure images are not in subdirectories (except `gallery/` and `optimized/`)

### High File Sizes

If optimized images exceed targets:

1. Check source image dimensions (very large images may exceed targets)
2. Consider adjusting quality settings in `scripts/optimize-images.mjs`
3. Verify source images are not already compressed/low quality

### Build Errors

If you get Sharp-related errors:

```bash
# Reinstall Sharp
npm uninstall sharp
npm install sharp

# Clear Next.js cache
rm -rf .next
npm run build
```

### Platform-Specific Issues

Sharp includes pre-built binaries for most platforms. If you encounter issues:

```bash
# Force rebuild native bindings
npm rebuild sharp
```

## Performance Benchmarks

Based on the current tree image collection:

- **Total Images**: 109 trees
- **Average Original Size**: ~300 KB
- **Average Optimized Size (WebP 800w)**: ~80 KB
- **Space Savings**: ~73% reduction
- **Processing Time**: ~30-45 seconds for full optimization

## Future Enhancements

Potential improvements to consider:

1. **Lazy Loading**: Automatic `loading="lazy"` attributes
2. **Responsive Syntax**: Generate `srcset` attributes
3. **CDN Integration**: Upload to CDN after optimization
4. **Image Analysis**: Detect and flag low-quality source images
5. **Batch Processing**: Parallel processing for faster optimization
6. **Custom Profiles**: Per-tree optimization settings
7. **WebP/AVIF Fallback**: Automatic polyfills for older browsers

## Related Documentation

- [IMAGE_RESOURCES.md](./IMAGE_RESOURCES.md) - Image sourcing and attribution
- [IMAGE_QUALITY_MONITORING.md](./IMAGE_QUALITY_MONITORING.md) - Quality standards
- [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md) - Content structure

## Support

For issues or questions:

1. Check this documentation
2. Review script output for error messages
3. Consult [Sharp documentation](https://sharp.pixelplumbing.com/)
4. Open an issue in the repository
