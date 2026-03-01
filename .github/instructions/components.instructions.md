---
description: Instructions for React component development
applyTo: src/components/**
---

# Component Development Guidelines

## Structure

Components in this project follow these conventions:

1. **Client vs Server Components**
   - Default to Server Components (no directive)
   - Add `"use client"` only when using hooks, event handlers, or browser APIs
   - Keep client components small and focused

2. **File Organization**
   - One component per file
   - Related components in subdirectories (e.g., `mdx/`, `tree/`, `maps/`)
   - Index files for barrel exports

3. **Props**
   - Define interfaces for props inline
   - Use descriptive prop names
   - Provide sensible defaults

## Pattern Examples

### Standard Component

```tsx
import { useTranslations } from "next-intl";

interface TreeCardProps {
  slug: string;
  title: string;
  scientificName: string;
  description?: string;
}

export function TreeCard({
  slug,
  title,
  scientificName,
  description,
}: TreeCardProps) {
  const t = useTranslations("trees");
  return (
    <article className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm italic text-muted">{scientificName}</p>
      {description && <p className="mt-2">{description}</p>}
    </article>
  );
}
```

### Client Component with Store

```tsx
"use client";

import { useStore } from "@/lib/store";

export function FavoriteButton({ slug }: { slug: string }) {
  const { isFavorite, toggleFavorite } = useStore();
  const favorited = isFavorite(slug);

  return (
    <button
      onClick={() => toggleFavorite(slug)}
      aria-pressed={favorited}
      className="..."
    >
      {favorited ? "♥" : "♡"}
    </button>
  );
}
```

## Accessibility Requirements

- All interactive elements must be keyboard accessible
- Use semantic HTML elements (`button`, `nav`, `article`, etc.)
- Include ARIA labels for icon-only buttons
- Maintain color contrast ratios (WCAG 2.1 AA)
- Support reduced motion preferences

## Styling

- Use Tailwind utility classes
- Follow the design system colors: `primary`, `secondary`, `background`, `foreground`
- Mobile-first responsive design
- Support dark mode with Tailwind dark: variants

## Established Patterns

### SSR Data Extraction (Education Lessons)

Used for all 6 education pages. Moves static locale data from client JS bundle to RSC payload:

1. Create `{lesson-name}-data.ts` in the lesson directory
2. Export `get{LessonName}LessonData(locale: string)` returning typed data
3. Data includes: labels, quiz questions, steps, categories — anything locale-dependent and purely static
4. `page.tsx` (server component) calls the data function, passes result as `lessonData` prop
5. Client component receives `lessonData`, removes inline data definitions

### Client Component Split

Used for TreeMapClient, ScavengerHuntClient, TreeJournalClient:

1. **Data/constants** → co-located `*-data.ts` or `*-validators.ts`
2. **View components** → separate `.tsx` files in the same directory
3. **State/reducer/handlers** stay in the parent component (state owner)
4. Props interface per extracted view — callbacks use `onAction` naming
5. Each extracted view has its own `"use client"` directive
6. Parent renders `<ExtractedView {...props} />` instead of inline JSX

### OG Image Routes

Used for section and comparison pages:

1. Create `opengraph-image.tsx` in the route directory
2. Export `runtime = 'edge'`, `alt`, `size`, `contentType`
3. Use `ImageResponse` from `next/og`
4. Include bilingual text based on locale param
5. Use gradient backgrounds (green for nature, blue for education, brown for comparisons)
