# Costa Rica Tree Atlas - AI Agent Instructions

## Project Overview

A bilingual (English/Spanish) Next.js 16 application documenting Costa Rican trees. Uses TypeScript, Tailwind CSS 4, Contentlayer2 for MDX content, next-intl for i18n, and Zustand for state management.

## Core Agent Rules

1. **Trust code over documentation** - Verify behavior by reading actual implementations
2. **Continuously re-evaluate priorities** - Focus on highest impact, lowest risk changes
3. **Prefer deletion and simplification** - Remove unused code rather than preserve it
4. **Make changes small and reversible** - One logical change per commit
5. **Never introduce regressions** - Ensure changes don't break existing functionality
6. **Update docs alongside code** - Keep README, CONTRIBUTING, and inline comments current
7. **Stop and ask when uncertain** - If technical resolution isn't clear, ask the user
8. **Leave system clearer** - Every change should improve code clarity and robustness

## 🚨 CRITICAL: Git Workflow - ALWAYS CREATE PR FIRST

**NEVER push directly to main branch. ALWAYS follow this workflow:**

1. **Create feature branch**: `git checkout -b feature/descriptive-name`
2. **Make and commit changes**: Stage and commit to feature branch
3. **Push feature branch**: `git push origin feature/descriptive-name`
4. **Create Pull Request**: Create PR from feature branch to main
5. **Wait for review**: Do not merge without approval

### Required Branch Naming Convention

- Feature: `feature/description` (e.g., `feature/add-comparison-guides`)
- Fix: `fix/description` (e.g., `fix/broken-link`)
- Content: `content/description` (e.g., `content/new-species`)
- Docs: `docs/description` (e.g., `docs/update-readme`)

### Example Workflow

```bash
# 1. Create feature branch
git checkout -b content/add-mango-espavel-comparison

# 2. Make changes and commit
git add .
git commit -m "feat: add Mango vs Espavel comparison guide"

# 3. Push to feature branch (NOT main!)
git push origin content/add-mango-espavel-comparison

# 4. Create PR (use GitHub CLI or web interface)
gh pr create --title "feat: Add Mango vs Espavel comparison" --body "..."
```

**⚠️ VIOLATION**: Pushing directly to main is a critical error. Always create a PR first.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 (CSS-first config)
- **Content**: Contentlayer2 with MDX
- **i18n**: next-intl with `[locale]` routing
- **State**: Zustand with persist middleware
- **Package Manager**: npm

## File Patterns & Conventions

### Components (`src/components/`)

- Use `"use client"` directive only when necessary (hooks, event handlers)
- Export named functions, not default exports
- Props interfaces defined inline or in same file
- Use `useTranslations` from next-intl for all user-facing text

### Content (`content/trees/{en,es}/*.mdx`)

- Always provide both English AND Spanish versions
- Follow frontmatter schema in `contentlayer.config.ts`
- Required fields: title, scientificName, family, locale, slug, description
- Use MDX components from `src/components/mdx/`

### API Routes (`src/app/api/`)

- Return proper JSON responses with appropriate status codes
- Handle errors gracefully with try/catch

### Types (`src/types/`)

- Single source of truth for type definitions
- Prefer union types over enums
- Document complex types with JSDoc comments

## Code Style

- **Formatting**: Prettier handles all formatting (run `npm run format`)
- **Linting**: ESLint with Next.js config (run `npm run lint`)
- **Imports**: Use path aliases (`@/*` for src, `@i18n/*` for i18n)
- **Naming**:
  - Components: PascalCase
  - Files: kebab-case for routes, PascalCase for components
  - Variables/functions: camelCase
  - Constants: SCREAMING_SNAKE_CASE

## Common Patterns

### Client-side State (Zustand)

```typescript
import { useStore } from "@/lib/store";
const { favorites, toggleFavorite } = useStore();
```

### Translations

```typescript
import { useTranslations } from "next-intl";
const t = useTranslations("namespace");
```

### Navigation Links

```typescript
import { Link } from "@i18n/navigation";
<Link href="/trees">Trees</Link>
```

### Tree Data Access

```typescript
import { allTrees } from "contentlayer/generated";
const trees = allTrees.filter((t) => t.locale === locale);
```

## Testing Changes

1. Run `npm run build` to verify no build errors
2. Run `npm run lint` to check for linting issues
3. Test both locales: `/en/...` and `/es/...`
4. Check mobile responsiveness

## Scripts Reference

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run format` - Prettier formatting
- `npm run images:audit` - Check tree images

## DO NOT

- Add dependencies without explicit user approval
- Modify content files (`.mdx`) without checking both language versions
- Change the i18n routing structure
- Remove accessibility features (ARIA labels, semantic HTML)
- Break PWA functionality
- Ignore TypeScript errors with `// @ts-ignore`

## Scoped Instructions

For specific file patterns, see scoped instructions:

- **Internationalization**: `.github/instructions/i18n.instructions.md` - i18n guidelines (applies to all files)
- **Content**: `.github/instructions/content.instructions.md` - MDX tree content (applies to `content/**/*.mdx`)
- **Components**: `.github/instructions/components.instructions.md` - React components (applies to `src/components/**`)
- **API Routes**: `.github/instructions/api.instructions.md` - API development (applies to `src/app/api/**`)
- **Scripts**: `.github/instructions/scripts.instructions.md` - Utility scripts (applies to `scripts/**`)

These scoped instructions provide detailed guidance for specific areas of the codebase and are automatically applied based on file patterns.
