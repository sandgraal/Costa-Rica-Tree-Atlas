---
mode: agent
description: Analyze and improve application performance
---

# Optimize Performance

Analyze the application for performance issues and implement optimizations.

## Areas to Review

### Images

- Use `<OptimizedImage>` component with Next.js Image optimization
- Lazy loading for below-fold images
- Appropriate image sizes and formats
- Blur placeholders for large images

### Components

- Minimize "use client" directives
- Use React Server Components where possible
- Implement proper code splitting
- Avoid unnecessary re-renders

### Data Loading

- Efficient Contentlayer queries
- Filter data server-side when possible
- Pagination for large lists

### Bundle Size

- Tree-shake unused imports
- Dynamic imports for heavy components
- Analyze bundle with `npm run build`

## Optimization Patterns

### Image Optimization

```tsx
import { OptimizedImage } from "@/components";

<OptimizedImage
  src={imagePath}
  alt={description}
  width={800}
  height={600}
  priority={isAboveFold}
/>;
```

### Dynamic Import

```tsx
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <Skeleton />,
});
```

### Server Component Data Loading

```tsx
// Server Component - no "use client"
import { allTrees } from "contentlayer/generated";

export default function TreeList({ locale }: { locale: string }) {
  const trees = allTrees.filter((t) => t.locale === locale);
  return <ul>{/* render trees */}</ul>;
}
```
