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
