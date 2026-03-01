# Next Agent Handoff

> **Purpose**: Give the next agent just enough context to continue seamlessly.
> All patterns, conventions, and workflows live in `AGENTS.md` and `.github/instructions/`.
> The full task backlog lives in `docs/IMPLEMENTATION_PLAN.md`.
> This file carries only the latest delta and current snapshot — nothing more.
>
> **Update rule**: At the end of every PR, replace the "Latest Changes" section
> with your PR's work, refresh "Current State" and "In-Flight / Gotchas",
> and update "What's Next". Previous changes live in git history.

Last updated: 2026-03-01

## Latest Changes

**Branch**: `feature/seasonal-filter` — merged

- Added seasonal activity filter (flowering/fruiting by month) to tree directory filter panel
- Activity type dropdown (All Seasons / Flowering / Fruiting) with per-month counts
- Month selector with counts per month; defaults to current month when first activated
- `SeasonalFacet` interface added to `SearchFacets`; `extractFacets()` computes per-month flowering/fruiting counts
- `all-year` trees expanded across all 12 months in facet counts
- URL parameter persistence: `?seasonal=flowering&month=march`; auto-opens filters
- i18n keys added to both `en.json` and `es.json` (seasonalActivity, flowering, fruiting, etc.)
- 16 new tests (filtering, facets, combined filters, getCurrentMonth)

## Current State

- **Tests**: 646/646 passing (630 + 16 new)
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Database**: Neon PostgreSQL, Prisma 7, all migrations applied
- **Search**: Autocomplete dropdown on `/trees`, QuickSearch modal in nav — both with keyboard nav
- **Filters**: Family, conservation status, province, tags, safety, **seasonal (flowering/fruiting by month)** — all with URL param persistence
- **i18n**: All major client components use `useTranslations()` — no inline ternaries in core UI
- **All P2–P6 + P9.7–P9.8 tasks complete; P9.10 partially complete (seasonal filter done)**
- **Error tracking**: Sentry-ready (zero deps, console fallback)
- **Public API**: 7 v1 endpoints with OpenAPI 3.1 spec

## In-Flight / Gotchas

- `orey` is the only tree without an iNaturalist gallery (no photos available)
- LCP was 4.0s — P4.6 priority fix merged (PR #529); needs re-measurement
- 300ms render-blocking CSS is the Tailwind bundle; marginal gains from splitting not worth complexity
- `'unsafe-inline'` in CSP `style-src` is intentional (irreducible runtime values)
- Sentry DSN not yet configured in Vercel env vars (works via console fallback)
- `redos.test.ts` timing test is flaky (expects <1ms, sometimes takes 1.2ms)
- `useSearchParams()` in TreeExplorer requires Suspense boundary — provided by `next/dynamic` loading fallback

## What's Next

Pick from `docs/IMPLEMENTATION_PLAN.md`. Top candidates:

1. Re-run Lighthouse after P4.6 merge to validate LCP improvement
2. P9.10 remaining — size/height filter, uses filter, save search preferences
3. Install `@sentry/nextjs` and configure DSN in Vercel (manual step)
4. P8.2 — Offline enhancements (download species, offline search)

## Operator Preferences

1. **Batch depth**: go as far as practical per run, with slight safety margin
2. **Warning policy**: lenient with pre-existing lint warnings; avoid churn
3. **Handoff policy**: always update this file at end of run
4. **Branch hygiene**: clean up merged branches (remote and local) when safe
