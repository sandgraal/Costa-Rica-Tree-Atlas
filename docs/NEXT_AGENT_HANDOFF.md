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

**Branch**: `feature/i18n-cleanup-inline-ternaries` — PR #532

- Migrated ~47 inline `locale === "es"` ternaries to `useTranslations()` across 5 components
- TreeExplorer (25+), KeyboardShortcuts (15), FavoriteButton (4), ConfusionRatingBadge (2), TableOfContents (1)
- Added 4 new i18n namespaces: `favorites`, `toc`, `keyboardShortcuts`, plus 15 new `trees` keys and 1 `comparison` key
- Removed `locale` prop from `FavoriteButton` and `TableOfContents` (callers updated)
- Added `confusionLevelLabel` to `ConfusionRatingConfig` interface

## Current State

- **Tests**: 623/623 passing
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Database**: Neon PostgreSQL, Prisma 7, all migrations applied
- **Search**: Autocomplete dropdown on `/trees`, QuickSearch modal in nav — both with keyboard nav
- **i18n**: All major client components now use `useTranslations()` — no more inline ternaries in core UI
- **All P2–P6 + P9.7 tasks complete** — see `docs/IMPLEMENTATION_PLAN.md` for full status
- **Error tracking**: Sentry-ready (zero deps, console fallback)
- **Public API**: 7 v1 endpoints with OpenAPI 3.1 spec

## In-Flight / Gotchas

- `orey` is the only tree without an iNaturalist gallery (no photos available)
- LCP was 4.0s — P4.6 priority fix merged (PR #529); needs re-measurement
- 300ms render-blocking CSS is the Tailwind bundle; marginal gains from splitting not worth complexity
- `'unsafe-inline'` in CSP `style-src` is intentional (irreducible runtime values)
- Sentry DSN not yet configured in Vercel env vars (works via console fallback)
- `redos.test.ts` timing test is flaky (expects <1ms, sometimes takes 1.2ms)

## What's Next

Pick from `docs/IMPLEMENTATION_PLAN.md`. Top candidates:

1. Re-run Lighthouse after P4.6 merge to validate LCP improvement
2. P9.8 — Region/province filter for tree directory
3. P9.10 — Advanced search & filtering (bloom time, size, uses, conservation)
4. Install `@sentry/nextjs` and configure DSN in Vercel (manual step)

## Operator Preferences

1. **Batch depth**: go as far as practical per run, with slight safety margin
2. **Warning policy**: lenient with pre-existing lint warnings; avoid churn
3. **Handoff policy**: always update this file at end of run
4. **Branch hygiene**: clean up merged branches (remote and local) when safe
