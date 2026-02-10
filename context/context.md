# Project Context

## Project Summary

- Costa Rica Tree Atlas is a bilingual (EN/ES) Next.js 16 application using Contentlayer MDX content and next-intl routing.
- For this task, the highest-priority unaddressed item in `docs/IMPLEMENTATION_PLAN.md` was Priority 1.1: "Add remaining medium priority species."
- Repository content verification showed those medium-priority species already exist in both locales, so this change synchronizes planning docs with implementation reality.

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

- Master implementation tracker: `docs/IMPLEMENTATION_PLAN.md`
- Missing-species source of truth: `docs/MISSING_SPECIES_LIST.md`
- Species content (EN): `content/trees/en/*.mdx`
- Species content (ES): `content/trees/es/*.mdx`

## Known Constraints & Feature Flags

- Species additions require EN+ES parity and frontmatter/schema compatibility.
- Documentation should track real implementation status to prevent duplicated content work.
- No runtime code changes or dependency updates were necessary for this docs-alignment task.
