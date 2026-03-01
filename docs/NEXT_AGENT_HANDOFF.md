# Next Agent Handoff

> **Purpose**: Give the next agent just enough context to continue seamlessly.
> All patterns, conventions, and workflows live in `AGENTS.md` and `.github/instructions/`.
> The full task backlog lives in `docs/IMPLEMENTATION_PLAN.md`.
> This file carries only the latest delta and current snapshot — nothing more.
>
> **Update rule**: At the end of every PR, replace the "Latest Changes" section
> with your PR's work, refresh "Current State" and "In-Flight / Gotchas",
> and update "What's Next". Previous changes live in git history.

Last updated: 2026-02-28

## Latest Changes

**Branch**: `fix/p4.6-lcp-image-optimization` — PR #529

- P4.6 LCP image optimization: removed `priority` + `fetchPriority="high"` from below-fold images
- TreeOfTheDay (4th section) and FeaturedTreesSection (6th section) were preloading images, competing with the hero LCP image for bandwidth
- Only the hero image now has priority on the homepage; `/trees` index page priority unchanged
- `next.config.ts` already had `formats: ["image/avif", "image/webp"]` — no changes needed
- Included package-lock.json updates

## Current State

- **Tests**: 622/623 passing (1 pre-existing flaky timing test in redos.test.ts)
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Database**: Neon PostgreSQL, Prisma 7, all migrations applied
- **Lighthouse**: LCP fix deployed — needs re-measurement after merge
- **All P2–P6 tasks complete** — see `docs/IMPLEMENTATION_PLAN.md` for full status
- **Error tracking**: Sentry-ready (zero deps, console fallback)
- **Public API**: 7 v1 endpoints with OpenAPI 3.1 spec

## In-Flight / Gotchas

- `orey` is the only tree without an iNaturalist gallery (no photos available)
- LCP was 4.0s — priority fix should improve; re-run Lighthouse after merge to measure
- 300ms render-blocking CSS is the Tailwind bundle; marginal gains from splitting print.css (~3KB gzipped) not worth the complexity
- `'unsafe-inline'` in CSP `style-src` is intentional (irreducible runtime values)
- Sentry DSN not yet configured in Vercel env vars (works via console fallback)
- `redos.test.ts` timing test is flaky (expects <1ms, sometimes takes 1.2ms)

## What's Next

Pick from `docs/IMPLEMENTATION_PLAN.md`. Top candidates:

1. Re-run Lighthouse after P4.6 merge to validate LCP improvement
2. P9.7 — Search autocomplete (suggestions dropdown, keyboard nav, debounce)
3. P9.8 — Region/province filter for tree directory
4. Install `@sentry/nextjs` and configure DSN in Vercel (manual step)
5. General polish and tech debt

## Operator Preferences

1. **Batch depth**: go as far as practical per run, with slight safety margin
2. **Warning policy**: lenient with pre-existing lint warnings; avoid churn
3. **Handoff policy**: always update this file at end of run
4. **Branch hygiene**: clean up merged branches (remote and local) when safe
