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

**Branch**: `copilot/sub-pr-540` — pending merge

- Fixed `classifyUses` false positives: replaced `includes(kw)` with leading `\b` regex to prevent e.g. "Soil conservation" matching "oil" keyword
- Fixed `setTimeout` without cleanup in TreeExplorer toast: `toastTimerRef` + `useEffect` cleanup
- Added `savedSearchFilter`/`savedSearchSort` validation in Zustand `onRehydrateStorage` (type checks + enum validation)

## Current State

- **Tests**: 677/677 passing (646 + 31 new)
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Database**: Neon PostgreSQL, Prisma 7, all migrations applied
- **Search**: Autocomplete dropdown on `/trees`, QuickSearch modal in nav — both with keyboard nav
- **Filters**: Family, conservation status, province, tags, safety, seasonal, **height range, use category** — all with URL param persistence
- **Saved filters**: Zustand-persisted filter+sort preferences with save/load UI
- **i18n**: All major client components use `useTranslations()` — no inline ternaries in core UI
- **All P2–P6 + P9.7–P9.8 tasks complete; P9.10 complete (seasonal + height + uses + save preferences)**
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
- Network outage blocked push; local commits on `feature/uses-height-filters` and handoff on `main` need pushing

## What's Next

Pick from `docs/IMPLEMENTATION_PLAN.md`. Top candidates:

1. Re-run Lighthouse after P4.6 merge to validate LCP improvement
2. Search analytics — track common queries to improve content (P9.10 stretch)
3. Install `@sentry/nextjs` and configure DSN in Vercel (manual step)
4. P8.2 — Offline enhancements (download species, offline search)

## Operator Preferences

1. **Batch depth**: go as far as practical per run, with slight safety margin
2. **Warning policy**: lenient with pre-existing lint warnings; avoid churn
3. **Handoff policy**: always update this file at end of run
4. **Branch hygiene**: clean up merged branches (remote and local) when safe
