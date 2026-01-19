# Image Optimization System

> **Living Document**: This guide is updated as the image optimization system evolves. Last updated: **January 2026**

**Status:** ✅ Active - Sharp-based image optimization with automated workflows

## Overview

The Costa Rica Tree Atlas uses Sharp for high-performance image optimization. The system automatically generates multiple responsive image sizes and modern formats (WebP, AVIF, JPEG) to ensure optimal performance across all devices and network conditions.

**Current State** (January 2026):

- **Tree Images**: 129 total, 109 optimized, 20 pending
- **Optimized Storage**: ~134 MB (regeneratable, excluded from git)
- **Scripts**: `optimize-images.mjs`, `optimize-hero-image.mjs`, `manage-tree-images.mjs`
- **Workflow**: `.github/workflows/weekly-image-quality.yml`, `.github/workflows/validate-images.yml`

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

## Component Architecture

The project uses a layered component system for optimal image handling:

### Core Components

#### 1. `SafeImage` - Error Handling Layer

```tsx
import { SafeImage } from "@/components/SafeImage";

<SafeImage
  src="/images/trees/ceiba.jpg"
  alt="Ceiba Tree"
  fill
  sizes="(max-width: 768px) 100vw, 896px"
  priority
  fallback="placeholder" // or "error"
/>;
```

**Features**: Automatic error handling, fallback to placeholder/error state, prevents layout shift

#### 2. `OptimizedImage` - Responsive Image Layer

```tsx
import { OptimizedImage, IMAGE_SIZES } from "@/components/OptimizedImage";

<OptimizedImage
  src="/images/trees/ceiba.jpg"
  alt="Ceiba Tree"
  width={800}
  height={600}
  sizes={IMAGE_SIZES.card} // Predefined sizes
  priority={false}
/>;
```

**Features**: Blur placeholders, predefined responsive sizes, automatic format selection

**Predefined Sizes**:

- `card`: Grid card thumbnails - `"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"`
- `featured`: Detail page featured image - `"(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 896px"`
- `gallery`: Gallery grid images - `"(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"`
- `hero`: Full-width hero - `"100vw"`

#### 3. `ResponsiveImage` - Aspect Ratio Layer

```tsx
import { ResponsiveImage } from "@/components/ResponsiveImage";

<ResponsiveImage
  src="/images/trees/ceiba.jpg"
  alt="Ceiba Tree"
  aspectRatio="4/3"
  priority={true}
/>;
```

**Features**: Automatic aspect ratio handling, responsive sizing, blur placeholders

#### 4. `ProgressiveImage` - Progressive Loading

```tsx
import { ProgressiveImage } from "@/components/ProgressiveImage";

<ProgressiveImage
  src="/images/trees/ceiba.jpg"
  alt="Ceiba Tree"
  width={800}
  height={600}
/>;
```

**Features**: Blur-up effect during loading, smooth transitions

### Component Selection Guide

| Use Case             | Component                                   | Reason                      |
| -------------------- | ------------------------------------------- | --------------------------- |
| Tree cards in grid   | `OptimizedImage` with `IMAGE_SIZES.card`    | Predefined responsive sizes |
| Detail page featured | `SafeImage`                                 | Error handling critical     |
| Gallery grids        | `OptimizedImage` with `IMAGE_SIZES.gallery` | Optimal for multi-column    |
| Hero/banner          | `HeroImage` or `ResponsiveImage`            | LCP optimization            |
| Comparison split     | Next.js `Image` with `fill`                 | Dynamic layouts             |

## srcSet Generation

The system automatically generates responsive srcSet attributes:

```typescript
// From src/lib/image-resolver.ts
function generateSrcSet(slug: string): string | undefined {
  const sizes = [400, 800, 1200];
  const formats = ["avif", "webp"];

  return sizes
    .map((w) => `/images/trees/optimized/${slug}/${w}w.webp ${w}w`)
    .join(", ");
}
```

**Output Example**:

```html
/images/trees/optimized/ceiba/400w.webp 400w,
/images/trees/optimized/ceiba/800w.webp 800w,
/images/trees/optimized/ceiba/1200w.webp 1200w
```

## Next.js Configuration

Image optimization is configured in `next.config.ts`:

```typescript
images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000, // 1 year
  remotePatterns: [
    { protocol: "https", hostname: "static.inaturalist.org" },
    { protocol: "https", hostname: "inaturalist-open-data.s3.amazonaws.com" },
    { protocol: "https", hostname: "api.gbif.org" },
    { protocol: "https", hostname: "images.unsplash.com" },
  ],
}
```

## Optimization Status

**Current Progress**:

- ✅ **Tree Images**: 109/129 optimized (84%)
- 🟡 **Pending**: 20 images need optimization
- ✅ **Hero Images**: Fully optimized with responsive variants
- ✅ **Comparison Images**: 16 comparison guides with featured images

**To optimize remaining images**:

```bash
npm run images:optimize
```

**To check which images need optimization**:

```bash
node scripts/manage-tree-images.mjs audit
```

## Git Integration

Optimized images are excluded from version control (`.gitignore`):

```gitignore
# optimized images (can be regenerated)
/public/images/trees/optimized/
```

**Rationale**: Optimized images can be regenerated on-demand and would significantly increase repository size. Run `npm run images:optimize` after cloning or when new images are added.

## CI/CD Integration

### Automated Workflows

#### Weekly Image Quality Check

`.github/workflows/weekly-image-quality.yml`

- **Schedule**: Every Sunday at 3 AM UTC
- **Modes**: audit, download, refresh, full
- **Actions**: ImageMagick quality checks, optimization verification

#### Image Validation

`.github/workflows/validate-images.yml`

- **Trigger**: On push to main
- **Checks**: Broken references, missing images, format validation

### Manual Deployment

For automated deployment pipelines, add the optimization step:

```yaml
# Example GitHub Actions workflow
- name: Optimize Images
  run: npm run images:optimize

- name: Build
  run: npm run build
```

**⚠️ Important**: Run optimization before build to ensure all images are available.

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

Based on the current tree image collection (January 2026):

- **Total Images**: 129 tree images
- **Optimized**: 109 trees
- **Average Original Size**: ~300-400 KB
- **Average Optimized Size (WebP 800w)**: ~80-100 KB
- **Space Savings**: ~70-75% reduction per image
- **Total Optimized Storage**: ~134 MB (all variants)
- **Processing Time**: ~30-45 seconds for full optimization
- **Variants Per Image**: 15 files (3 formats × 5 sizes)

### Format Comparison

Typical compression results:

| Format   | Size (800w) | Savings vs JPEG | Browser Support                     |
| -------- | ----------- | --------------- | ----------------------------------- |
| **AVIF** | 60-70 KB    | 40-50%          | Chrome 85+, Firefox 93+, Safari 16+ |
| **WebP** | 80-90 KB    | 25-35%          | Chrome 23+, Firefox 65+, Safari 14+ |
| **JPEG** | 120-150 KB  | Baseline        | Universal                           |

### LCP Performance

- **Hero Image**: <500ms (WebP with preload)
- **Featured Image**: <800ms (priority loading)
- **Gallery Images**: Lazy loaded (not counted in LCP)

## Future Enhancements

Potential improvements for upcoming work:

### High Priority

1. **Complete Optimization**: Optimize remaining 20/129 tree images
2. **Gallery Optimization**: Implement optimization for species gallery collections
3. **Comparison Images**: Standardize optimization for 16 comparison guide images
4. **CDN Integration**: Upload optimized images to CDN for faster delivery

### Medium Priority

5. **Batch Processing**: Parallel processing for faster optimization (currently sequential)
6. **Image Analysis**: Auto-detect and flag low-quality source images
7. **Smart Cropping**: AI-powered focal point detection for responsive crops
8. **Format Detection**: Auto-select optimal format based on image content (photos vs graphics)

### Low Priority

9. **Custom Profiles**: Per-tree optimization settings (e.g., endangered species get higher quality)
10. **Blur Hash**: More advanced blur placeholder generation
11. **WebP/AVIF Fallback Automation**: Automatic polyfills for older browsers
12. **Monitoring**: Track image load performance in production

## Related Documentation

- [Scripts Documentation](../scripts/) - Image management scripts
  - `optimize-images.mjs` - Batch tree image optimization
  - `optimize-hero-image.mjs` - Hero image optimization
  - `manage-tree-images.mjs` - Image audit and management
  - `validate-image-references.mjs` - Reference validation
  - `cleanup-tree-images.mjs` - Cleanup unused images
- [Component Documentation](../src/components/) - Image components
  - `OptimizedImage.tsx` - Responsive image component
  - `SafeImage.tsx` - Error-handling wrapper
  - `ResponsiveImage.tsx` - Aspect-ratio component
  - `ProgressiveImage.tsx` - Progressive loading
  - `HeroImage.tsx` - Hero banner component
- [Image Resolver](../src/lib/image-resolver.ts) - Image path resolution and srcSet generation
- [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md) - Content structure including image galleries
- [GitHub Workflows](../.github/workflows/) - Automated image quality checks

## Support

For issues or questions:

1. Check this documentation
2. Review script output for error messages
3. Consult [Sharp documentation](https://sharp.pixelplumbing.com/)
4. Open an issue in the repository
