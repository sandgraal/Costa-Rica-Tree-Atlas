# Project Context

## Project Summary

- Costa Rica Tree Atlas is a bilingual (EN/ES) Next.js 16 application using Contentlayer MDX content and next-intl routing.
- This task focused on the highest-priority open engineering work in `docs/IMPLEMENTATION_PLAN.md` Phase 3 performance: migrating additional homepage UI sections from client to server components to reduce hydration cost.

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

- Homepage route and composition: `src/app/[locale]/page.tsx`
- Homepage sections converted to server components:
  - `src/components/home/AboutSection.tsx`
  - `src/components/home/StatsSection.tsx`
  - `src/components/home/NowBloomingSection.tsx`
- Translation source files: `messages/en.json`, `messages/es.json`
- Planning tracker: `docs/IMPLEMENTATION_PLAN.md`

## Known Constraints & Feature Flags

- EN/ES translation parity is required for any UI string changes.
- Components under `src/components/**` should avoid `"use client"` unless hooks/browser APIs are needed.
- The homepage retains dynamic/lazy loading for heavier below-the-fold components while moving purely render-only sections to server components.
