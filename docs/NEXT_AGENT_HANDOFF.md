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

**Branch**: `feature/p6.2-reputation-system`

- P6.2 User Reputation System — complete (Prisma model, API, profile page, BadgeDisplay, i18n)
- Tree rating system — complete (DB, API, UI, i18n)
- SQL injection fix in `/api/contributions` GET (was `$queryRawUnsafe` with string concat)
- Bug fixes: region field in contributions, CTA deep-linking, admin display
- 46 new tests (reputation logic + API)

## Current State

- **Tests**: 623/623 passing
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Database**: Neon PostgreSQL, Prisma 7, all migrations applied including `tree_ratings` and `contributor_profiles`
- **Lighthouse**: 85 perf / 100 SEO / 100 BP
- **All P2–P6 tasks complete** — see `docs/IMPLEMENTATION_PLAN.md` for full status
- **Error tracking**: Sentry-ready (zero deps, console fallback)
- **Public API**: 7 v1 endpoints with OpenAPI 3.1 spec

## In-Flight / Gotchas

- `orey` is the only tree without an iNaturalist gallery (no photos available)
- LCP is 4.0s — network-bound, not code-fixable
- `'unsafe-inline'` in CSP `style-src` is intentional (irreducible runtime values)
- Sentry DSN not yet configured in Vercel env vars (works via console fallback)

## What's Next

Pick from `docs/IMPLEMENTATION_PLAN.md`. Top candidates:

1. Install `@sentry/nextjs` and configure DSN in Vercel (manual step)
2. P7 — additional languages (requires native speaker review)
3. P8 — UX enhancements (search autocomplete, offline support, perf monitoring)
4. General polish and tech debt

## Operator Preferences

1. **Batch depth**: go as far as practical per run, with slight safety margin
2. **Warning policy**: lenient with pre-existing lint warnings; avoid churn
3. **Handoff policy**: always update this file at end of run
4. **Branch hygiene**: clean up merged branches (remote and local) when safe
