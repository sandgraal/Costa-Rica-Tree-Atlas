# Image Integration Guide

## Overview

This guide explains how the Costa Rica Tree Atlas integrates optimized images with automatic resolution and fallback handling.

## Quick Start

### Complete Setup (First Time)

Run all steps in sequence:

```bash
npm run images:setup-all
```

This will:

1. Download all external images locally (`images:download`)
2. Generate optimized variants (`images:optimize`)
3. Update MDX files to use local paths (`images:migrate`)

### Manual Steps

```bash
# 1. Download images from external sources
npm run images:download

# 2. Generate optimized variants (WebP, AVIF, JPEG at multiple sizes)
npm run images:optimize

# 3. Update MDX files to reference local images
npm run images:migrate
```

## How It Works

### Image Resolution Chain

Components use `SafeImage` with this fallback chain:

1. **Optimized AVIF** (`/images/trees/optimized/{slug}/original.avif`)
2. **Optimized WebP** (`/images/trees/optimized/{slug}/original.webp`)
3. **Optimized JPEG** (`/images/trees/optimized/{slug}/original.jpg`)
4. **Local Original** (`/images/trees/{slug}.jpg`)
5. **External URL** (fallback if all else fails)

### Optimization Pipeline

The `optimize-images.mjs` script generates:

- **4 responsive sizes**: 400w, 800w, 1200w, 1600w, plus original
- **3 modern formats**: AVIF (smallest), WebP (good support), JPEG (universal)
- **Blur placeholders**: For progressive loading
- **Metadata files**: Track optimization details

Example output structure:

```
public/images/trees/optimized/{slug}/
  ├── 400w.avif, 400w.webp, 400w.jpg
  ├── 800w.avif, 800w.webp, 800w.jpg
  ├── 1200w.avif, 1200w.webp, 1200w.jpg
  ├── 1600w.avif, 1600w.webp, 1600w.jpg
  ├── original.avif, original.webp, original.jpg
  └── metadata.json
```

## Component Usage

### SafeImage with Optimization

```tsx
import { SafeImage } from "@/components/SafeImage";

// Automatically resolves to optimized variants
<SafeImage
  src="/images/trees/guarumo.jpg"
  slug="guarumo"
  imageType="featured"
  alt="Guarumo tree"
  fill
  sizes="(max-width: 768px) 100vw, 896px"
/>;
```

**Props:**

- `slug` - Tree identifier (enables optimization lookup)
- `imageType` - "featured" (original size) or "gallery" (800w)
- `src` - Fallback URL if optimization unavailable
- Standard Next.js Image props

### MDX ImageCard

```mdx
<ImageCard
  src="https://example.com/image.jpg"
  slug="guarumo"
  alt="Guarumo leaves"
  title="Palmate leaves"
  credit="Photographer Name"
  license="CC BY-NC"
/>
```

### Image Gallery

```mdx
<ImageGallery>
  <ImageCard
    src="https://example.com/image1.jpg"
    slug="guarumo"
    index={0}
    alt="First image"
  />
  <ImageCard
    src="https://example.com/image2.jpg"
    slug="guarumo"
    index={1}
    alt="Second image"
  />
</ImageGallery>
```

## API Routes

### `/api/images/resolve`

Resolves the best image source for a given slug.

**Parameters:**

- `slug` (required) - Tree identifier
- `type` (optional) - Image type: "featured" (default) or "gallery"

**Response:**

```json
{
  "src": "/images/trees/optimized/guarumo/original.avif",
  "srcSet": "/images/trees/optimized/guarumo/400w.webp 400w, ...",
  "type": "optimized",
  "fallback": "https://example.com/fallback.jpg"
}
```

## Architecture

### Image Resolver (`src/lib/image-resolver.ts`)

Core utility that:

- Checks filesystem for optimized variants
- Returns best available format (AVIF → WebP → JPEG)
- Generates responsive srcSet strings
- Provides fallback chain

### SafeImage Component (`src/components/SafeImage.tsx`)

Enhanced image component that:

- Fetches optimization info via API
- Handles loading states
- Provides error fallback (placeholder or hide)
- Supports standard Next.js Image props

### Migration Script (`scripts/migrate-mdx-to-local-images.mjs`)

Updates MDX frontmatter:

- Converts external `featuredImage` URLs to local paths
- Only updates where local images exist
- Preserves other frontmatter fields

## Performance Benefits

**File Size Reduction:**

- AVIF: ~50-60% smaller than JPEG
- WebP: ~25-35% smaller than JPEG
- Responsive sizes: Only load what's needed

**Example Savings:**

- Original JPEG: 800 KB
- Optimized AVIF (original): 320 KB (60% smaller)
- Optimized WebP (800w): 120 KB (85% smaller)

**Browser Support:**

- AVIF: Chrome 85+, Firefox 93+
- WebP: All modern browsers
- JPEG: Universal fallback

## Troubleshooting

### Images Not Loading

1. **Check if local image exists:**

   ```bash
   ls public/images/trees/{slug}.jpg
   ```

2. **Check if optimized:**

   ```bash
   ls public/images/trees/optimized/{slug}/
   ```

3. **Re-optimize specific tree:**
   ```bash
   npm run images:optimize:force
   ```

### MDX Files Not Updated

Run migration script:

```bash
npm run images:migrate
```

Check if local image exists before migration runs.

### Build Errors

Ensure all dependencies installed:

```bash
npm install
```

Check TypeScript compilation:

```bash
npm run type-check
```

## Maintenance

### Adding New Trees

1. Add MDX file with external `featuredImage` URL
2. Run `npm run images:download` to fetch image
3. Run `npm run images:optimize` to generate variants
4. Run `npm run images:migrate` to update MDX

### Updating Existing Images

1. Replace image in `public/images/trees/{slug}.jpg`
2. Run `npm run images:optimize:force` to regenerate
3. Clear Next.js cache: `rm -rf .next`

### Cleaning Up

Remove orphaned optimized images:

```bash
npm run images:cleanup
```

## Best Practices

1. **Always provide alt text** - Accessibility requirement
2. **Use appropriate sizes prop** - Helps browser choose right size
3. **Provide slug when available** - Enables optimization
4. **Keep originals** - Never delete source images
5. **Test both formats** - Verify AVIF/WebP and JPEG fallbacks work

## Related Files

- `src/lib/image-resolver.ts` - Core resolution logic
- `src/lib/image-optimizer.ts` - Optimization utilities
- `src/components/SafeImage.tsx` - Image component
- `src/components/mdx/index.tsx` - MDX ImageCard component
- `src/app/api/images/resolve/route.ts` - Resolution API
- `scripts/optimize-images.mjs` - Batch optimization
- `scripts/migrate-mdx-to-local-images.mjs` - MDX migration

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [AVIF Format](https://avif.io/)
- [WebP Format](https://developers.google.com/speed/webp)
