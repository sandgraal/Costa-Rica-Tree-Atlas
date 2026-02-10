# Project Context

## Project Summary

- Costa Rica Tree Atlas is a bilingual (EN/ES) Next.js 16 app with App Router, Contentlayer-backed MDX content, and next-intl locale routing.
- The highest-priority unaddressed implementation item selected from `docs/IMPLEMENTATION_PLAN.md` was Priority 2 / Phase 3: migrating more components to Server Components.
- This change converts `Footer` from a client component to an async server component to reduce hydration work and align with the performance roadmap.

## Dependency Graph (High Level)

- **Framework/runtime**: `next`, `react`, `react-dom`
- **Localization**: `next-intl` (server APIs for translations in server components)
- **Content**: `contentlayer2`, `next-contentlayer2`
- **State/client-only logic**: Zustand store in `src/lib/store`

## Commands Map

- Development: `npm run dev`
- Lint: `npm run lint`
- Type checks: `npm run type-check`
- Build: `npm run build`

## Key Paths by Feature

- Implementation tracking: `docs/IMPLEMENTATION_PLAN.md`
- Performance strategy: `docs/PERFORMANCE_OPTIMIZATION.md`
- Locale layout (server component shell): `src/app/[locale]/layout.tsx`
- Footer component: `src/components/Footer.tsx`

## Known Constraints & Feature Flags

- Footer localization now uses server-side `getTranslations({ locale, namespace })` and requires explicit `locale` prop passing from layout.
- No dependency additions or lockfile changes were required.
- Scope intentionally limited to a single reversible server-component migration plus documentation updates.
