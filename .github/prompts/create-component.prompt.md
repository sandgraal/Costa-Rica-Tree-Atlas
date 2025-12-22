---
mode: agent
description: Create a new React component following project conventions
---

# Create New Component

Create a new React component for the Costa Rica Tree Atlas following project conventions and patterns.

## Component Name

Provide the component name (PascalCase):

## Requirements

1. **Location**: Place in appropriate directory:
   - `src/components/` - General components
   - `src/components/mdx/` - MDX-specific components
   - `src/components/tree/` - Tree-related components
   - `src/components/maps/` - Map components
   - `src/components/geo/` - Geographic components

2. **File structure**:

   ```tsx
   // Use "use client" ONLY if needed (hooks, event handlers)
   "use client";

   import { useTranslations } from "next-intl";

   interface ComponentNameProps {
     // Define props
   }

   export function ComponentName({ prop }: ComponentNameProps) {
     const t = useTranslations("namespace");

     return (
       // JSX
     );
   }
   ```

3. **Export from index**: Add to `src/components/index.ts` if general component

4. **Styling**: Use Tailwind CSS 4 classes

5. **i18n**: Use `useTranslations` for all user-facing text

6. **Accessibility**: Include proper ARIA labels and semantic HTML

## Checklist

- [ ] Named export (not default)
- [ ] Props interface defined
- [ ] "use client" only if necessary
- [ ] Translations used for user-facing text
- [ ] Tailwind classes for styling
- [ ] TypeScript strict mode compliant
- [ ] Exported from index.ts if appropriate
