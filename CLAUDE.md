# CLAUDE.md — Agent Operating Guide

**You are working on the Costa Rica Tree Atlas — a bilingual reference and
field tool that Costa Rica should be proud of, that the world can cite.**

This file is the first thing you read. Other agent files (`AGENTS.md`,
`.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`)
point back here.

---

## The mission, in one paragraph

This is a bilingual (Spanish-first, English-parity) atlas of Costa Rican
trees, built as a Next.js 16 + TypeScript + Tailwind 4 application with
Contentlayer-managed MDX content and a Prisma + Supabase Postgres backing
store for users, contributions, and admin workflows. The product is in the
**Authority Atlas** phase per [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md):
we are closing factual integrity, growing to 250 species at encyclopedic
depth, and preparing a Darwin Core Archive for DOI publication.

The Costa Rica Tree Atlas is **Costa Rica first, world welcome**. Spanish is
the home register. Indigenous-language content is on the near horizon and
governed by a strict consent process. Refusal is a valid answer to any
indigenous-content request.

---

## Where to start, every session

1. **[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)** — single source
   of truth for project status, phased roadmap, and lane priorities.
2. **`git log --oneline -10`** — what just happened.
3. **`git status`** — what's in flight.
4. **`npm run content:fact-audit -- --skip-external`** if you're about to touch
   species data — gives you the current factual-audit snapshot.

Do NOT maintain handoff documents in addition to the plan. Git history and
PR descriptions are the handoff mechanism.

---

## Tech stack

- **Framework:** Next.js 16 App Router, TypeScript strict mode
- **Styling:** Tailwind CSS 4
- **Content:** Contentlayer2 over MDX in `content/` (trees / glossary /
  comparisons / oral-histories)
- **i18n:** `next-intl`, locale-prefixed routes under `src/app/[locale]/`,
  2,149 translation keys mirrored EN/ES in `messages/`
- **DB:** Prisma + **Supabase** Postgres (users, contributions, ImageProposals,
  audit logs). Two connection strings: `DATABASE_URL` (transaction pooler, port 6543) for the app, `DIRECT_URL` (session, 5432) for `prisma migrate`. Columns
  are snake_case and enforced by `tests/schema-drift.test.ts`. The Supabase Data
  API (PostgREST/pg_graphql) is deliberately locked down — see
  [docs/DATABASE.md](docs/DATABASE.md).
- **State:** Zustand for client state
- **Images:** Sharp + Cloudinary for user uploads. Species imagery is split:
  the **featured** image per species is a local file under
  `public/images/trees/`, while the ~1,780 **gallery** images are hotlinked
  from iNaturalist (`inaturalist-open-data.s3.amazonaws.com`,
  `static.inaturalist.org`) and served through the Next image optimizer, which
  caches them at the edge for a year (`minimumCacheTTL` in `next.config.ts`).
  They are NOT stored in this repo — this line previously said "static images
  for the canonical species set", which described something that has never
  existed. Practical consequences: link rot is a real failure mode, and
  offline use does not cover galleries.
- **Rate limiting:** Upstash Redis on public API endpoints
- **Tests:** Vitest (58 test files: 49 in `tests/`, the rest colocated in `src/`); Playwright is not in use
- **CI:** `.github/workflows/` — content-build-tests (the merge gate: full
  Vitest suite, fact audit, ES parity, type-check, build), security (CodeQL +
  ESLint-security + TruffleHog + license check), validate-images,
  weekly-image-quality, content-fact-audit-weekly, update-metrics,
  lighthouse-ci (manual dispatch only, by design), close_stale_prs
- **Deployment:** Vercel

---

## Conventions (high signal)

- **Spanish-first.** When writing or editing content, treat the ES file as
  primary and EN as parity, not the other way around. When in doubt, write
  ES first, then translate.
- **Costa Rican Spanish, not Castilian.** Use Latin American Spanish
  conventions (`tú` or `usted` per context; `vos` allowed when narrating a
  Tico voice). Tico idioms are permitted judiciously. See
  [docs/VOICE_AND_TONE.md](docs/VOICE_AND_TONE.md).
- **EN and ES frontmatter mirrors.** Same field set, same enum values
  (English internal identifiers like `easy`/`moderate`/`challenging` — the
  UI handles display localization). Schema is in `contentlayer.config.ts`.
- **Citations are required** in high-risk sections (Conservation, Uses,
  Medicinal, Cultural, Safety). Use the `<Reference>` MDX component for
  inline citations; one independent source per claim is the floor, two is
  the standard.
- **Indigenous content is gated.** Do NOT autonomously edit indigenous
  names, ceremonial uses, or oral histories. Add the `needs-indigenous-review`
  label and stop. See [docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md](docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md).
- **Conservation status is structured.** Schema-defined enum values for
  `conservationStatus`, `citesAppendix`, `iucnScope`. When the frontmatter
  status changes, propagate to all visible copy in BOTH locales in the
  same PR. The pattern is documented by the cocobolo/cachimbo/flamboyan
  remediation commits — search the git log for examples.
- **Photos are attributed.** Every gallery image carries `credit` and
  `license` props. Most are iNaturalist CC BY-NC; commercial reuse requires
  separate licensing.

---

## Hard rules — never do these

1. **Never push directly to main.** Always feature branch → PR → review → merge.
   Branch naming (this list is canonical — other guides point here rather
   than restating it): `feature/...`, `fix/...`, `content/...`, `docs/...`,
   `chore/...`, `claude/...` (AI-driven branches).
2. **Never commit secrets.** `.env.local` is gitignored; never echo tokens
   in shell output that lands in commits.
3. **Never delete content without backup.** Tree MDX files are load-bearing;
   if you must remove one, archive it in `docs/archive/` first.
4. **Never autonomously edit indigenous-knowledge content.** Even fixing
   typos. Open an issue with the `needs-indigenous-review` label instead.
5. **Never bypass hooks** (`--no-verify`) unless explicitly authorized.
6. **Never strip image attribution** to make a layout cleaner. Attribution
   is a license obligation, not a UX choice.
7. **Never expose precise GPS coordinates** for CITES Appendix I/II species
   with extant Costa Rican populations. The Darwin Core Archive export
   generalizes these intentionally.

---

## How content changes ship

For tree-species content changes:

1. Read the existing EN and ES MDX files for the species.
2. Make changes in **both locales** in the same PR. Use the cocobolo /
   cachimbo / flamboyan remediation commits as templates.
3. Run `npm run contentlayer` to rebuild and validate the contentlayer
   schema.
4. Run `npx vitest run tests/content-validation.test.ts tests/conservation-status-i18n.test.tsx tests/route-regression.test.ts` to verify content tests pass.
5. Update [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) lane status
   if the change closes or advances a tracked item.
6. Commit with a descriptive message; include verification output in the
   commit body for non-trivial changes.

---

## Skills and subagents

Project-specific skills live in [.claude/skills/](.claude/skills/). They are
documented SOPs you can invoke for repetitive operations:

- `add-species` — guided species addition (frontmatter, MDX template,
  image fetch, gallery, tests)
- `audit-iucn` — run the factual audit and present the remediation queue
- `remediate-tree` — guided single-tree remediation (frontmatter,
  visible copy in both locales, citations, tests)
- `backfill-canonical-ids` — populate POWO/WFO/IPNI/GBIF identifiers
- `export-dwca` — build the Darwin Core Archive from the corpus

Subagents live in [.claude/agents/](.claude/agents/):

- `iucn-verifier` — hits IUCN / POWO APIs and validates frontmatter
- `content-validator` — runs CONTENT_PR_ACCEPTANCE_CRITERIA checks
- `spanish-copyeditor` — Costa Rican Spanish review pass

MCP server configs at `.mcp.json` give you access to GBIF, IUCN, POWO,
iNaturalist (when configured with tokens in `.env.local`).

---

## Scoped guides

Where conventions diverge by area, a scoped `CLAUDE.md` lives in the
subdirectory. Read it before working in that area:

- [content/CLAUDE.md](content/CLAUDE.md) — content authoring rules
- [scripts/CLAUDE.md](scripts/CLAUDE.md) — script conventions
- [src/components/CLAUDE.md](src/components/CLAUDE.md) — component patterns
- [tests/CLAUDE.md](tests/CLAUDE.md) — what each test family guards

File-pattern specific instructions for Copilot and similar tools live in
[.github/instructions/](.github/instructions/). They're authoritative for
their patterns; the scoped CLAUDE.md files are the canonical agent guides.

---

## Trust-but-verify expectations

- **Always run the relevant tests** before claiming completion.
  `npm run type-check` returns 0 errors as of 2026-07-04 — treat any
  failure as real. (Run `npm run contentlayer` first in a fresh checkout;
  without it, `tsc` can't resolve `contentlayer/generated` and reports
  unrelated false errors.)
- **The factual audit is the truth** about IUCN drift, not your training
  memory. Always run `npm run content:fact-audit` rather than asserting
  status from memory.
- **iNaturalist / GBIF / POWO live data** is more current than any cached
  static data in this repo. When verifying a claim, prefer the live source.

---

## Communication

- Be terse. Update users at meaningful moments; don't narrate every tool
  call.
- When you make a non-obvious judgment call, briefly state the call and
  why in the commit message.
- When you encounter a real blocker (missing API token, unclear consent
  status on indigenous content, ambiguity in the plan), stop and ask.
  Don't fabricate context.

---

## When in doubt

The product question to ask: _would this make a Costa Rican grandmother
proud of her country's tree atlas?_ If yes, ship it. If you're not sure,
err on the side of Spanish-first, sourced, indigenous-respectful, and
useful to a 5th-grader as much as to a taxonomist.
