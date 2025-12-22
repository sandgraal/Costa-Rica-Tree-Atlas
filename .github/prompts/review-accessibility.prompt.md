---
mode: agent
description: Review and improve accessibility across the application
---

# Review Accessibility

Audit the application for accessibility issues and implement improvements following WCAG guidelines.

## Areas to Check

### Components

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast ratios

### Images

- Alt text on all `<img>` elements
- Decorative images marked appropriately
- `<OptimizedImage>` component usage

### Forms

- Label associations
- Error messaging
- Required field indicators

### Navigation

- Skip links
- Focus indicators
- Logical tab order

## Component Patterns

### Accessible Button

```tsx
<button
  aria-label={t("action.description")}
  onClick={handleClick}
  className="focus:ring-2 focus:ring-offset-2"
>
  {children}
</button>
```

### Accessible Link

```tsx
import { Link } from "@i18n/navigation";
<Link href="/trees" aria-label={t("nav.trees")}>
  {t("nav.trees")}
</Link>;
```

## Do NOT

- Remove existing ARIA labels
- Break keyboard navigation
- Hide focus indicators
- Use color alone to convey information
