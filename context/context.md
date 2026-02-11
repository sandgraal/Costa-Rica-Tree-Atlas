# Project Context

## Project Summary

- Costa Rica Tree Atlas is a bilingual (EN/ES) Next.js 16 application using Contentlayer MDX content and next-intl routing.
- This task focused on the highest-priority open engineering work in `docs/IMPLEMENTATION_PLAN.md` Phase 3 performance: migrating additional UI components from client to server components to reduce hydration cost.

## Dependency Graph (High Level)

- **App framework**: `next`, `react`, `react-dom`
- **Content pipeline**: `contentlayer2`, `next-contentlayer2`
- **Localization**: `next-intl`
- **State**: `zustand`
- **Validation/testing**: `eslint`, `vitest`, TypeScript strict mode

## Commands Map

- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npm run type-check`

## Key Paths by Feature

- About route and composition: `src/app/[locale]/about/page.tsx`
- About data source card component: `src/components/DataSourceCard.tsx`
- Translation source files: `messages/en.json`, `messages/es.json`
- Planning tracker: `docs/IMPLEMENTATION_PLAN.md`

## Known Constraints & Feature Flags

- EN/ES translation parity is required for any UI string changes.
- Components under `src/components/**` should avoid `"use client"` unless hooks/browser APIs are needed.
- Components in `src/components/**` should avoid client boundaries unless hooks or browser APIs are required.

## Latest Update (2026-02-10)

- Continued Phase 3 performance work by converting `src/components/CurrentYear.tsx` from a client component to a server component.
- Updated performance planning docs to track this migration under the existing Server Components checklist.

## Latest Update (2026-02-10, FeaturedTreesSection)

- Continued Phase 3 performance work by converting `src/components/FeaturedTreesSection.tsx` from a client component to a server component.
- Removed `useMemo`/client boundary and extracted deterministic featured-tree selection into a pure server-side helper within the component file.
- Updated performance tracking docs in `docs/IMPLEMENTATION_PLAN.md` and `docs/PERFORMANCE_OPTIMIZATION.md`.
