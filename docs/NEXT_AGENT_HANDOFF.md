# Next Agent Handoff

Last updated: 2026-02-26

## Latest Run Summary (2026-02-26 — Run 5)

- **Branch**: `feature/api-tests-component-splits-meta` → PR pending
- **Tasks completed**:
  1. **P5.1: API route test coverage** — Created 9 test files with 107 new tests covering all previously untested API routes: v1/trees (29), v1/trees/[slug] (10), v1/families (9), search-index (5), species/random (5), csp-report (5), images/vote (18), images/flag (13), contributions (13). Total: 431/431 passing.
  2. **P4.3: Split TreeMapClient** — Extracted `map-data.ts` (constants, helpers), `CollectionCard.tsx`, `CollectionDetailView.tsx`. Reduced 1,388 → 1,027 lines (26% reduction).
  3. **P4.3: Split ScavengerHuntClient** — Extracted `scavenger-hunt-validators.ts` (mission validators, constants), `SetupView.tsx`, `HuntView.tsx`, `MissionView.tsx`, `ResultsView.tsx`. Reduced 1,206 → 575 lines (52% reduction).
  4. **P4.3: Split TreeJournalClient** — Extracted `AdoptTreeView.tsx`, `JournalEntryForm.tsx`. Reduced 1,073 → 672 lines (37% reduction).
  5. **Verified**: 431/431 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-02-25 — Run 4)

- **Branch**: `feature/ssr-refactor-jsonld-sitemap` → PR pending
- **Tasks completed**:
  1. **P4.2: SSR refactor ScavengerHuntClient** — Created `scavenger-hunt-data.ts` (15 missions, ~45 labels extracted). Refactored `ScavengerHuntClient.tsx` from 1491→1205 lines. Mission display data moved to RSC payload; validator functions kept client-side (not serializable). Eliminated all bilingual `locale as "en" | "es"` patterns.
  2. **P4.2: SSR refactor TreeJournalClient** — Created `tree-journal-data.ts` (5 option arrays, 8 badges, 10 prompts, ~50 labels extracted). Refactored `TreeJournalClient.tsx` from 1306→1096 lines. All inline locale ternaries eliminated.
  3. **P3.3: JSON-LD enhancement** — Upgraded tree detail page structured data: `@type: Thing` → `@type: Taxon` with `taxonRank`, `parentTaxon` (family), conservation status labels, `spatialCoverage` for distribution, multi-image array support. Breadcrumbs refactored to use shared `baseUrl` constant.
  4. **P3.4: Sitemap audit** — Confirmed already complete: all 175×2 trees, comparisons, glossary included; `lastmod` from `updatedAt` already working.
  5. **Verified**: 324/324 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-02-25 — Run 3)

- **Branch**: `content/batch-enrichment-p2` → PR pending
- **Tasks completed**:
  1. **P2.1: Photo gallery sections** — Added iNaturalist galleries to 19 trees (174/175 now have galleries; `orey` lacks iNaturalist photos). Used existing `scripts/add-gallery-sections.mjs`.
  2. **P2.4: GBIF/IUCN external links** — Created `scripts/add-external-links.mjs`. Added GBIF links to 98 trees, IUCN search links to 108 trees. 175/175 now have both. Created 7 new External Resources sections for trees that lacked them entirely.
  3. **Bug fix: ExternalLink `url=` → `href=`** — Fixed 358 broken prop references across 89 tree files × 2 locales (186 files). The `<ExternalLink>` component requires `href=` but 93 files used `url=`, rendering external links non-functional.
  4. **Bug fix: MDX build errors** — 12 trees had markdown links injected before `<DataTable>` components, causing contentlayer build failures. Created `scripts/fix-datatable-links.mjs` to repair them.
  5. **P2.2/P2.3 audited** — Confirmed already complete; 173/175 trees have uses sections, all 174 with seasonal frontmatter have seasonal body sections.
  6. **Verified**: 324/324 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-02-25 — Run 2)

- **Branch**: `fix/lcp-a11y-og-optimization` → PR pending
- **Tasks completed**:
  1. Fixed 4 dark mode contrast failures (WCAG AA)
  2. Created OG + Twitter images for 20 comparison detail pages
  3. Confirmed tree detail OG images already exist
  4. LCP analysis: 4.0s is network-bound, not code-fixable

## Previous Run Summary (2026-02-25 — Run 1)

- **Branch**: `fix/quick-wins-phase2-5` → [PR #463](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/463)
- 5 failing tests fixed, debug code removed, frontmatter filled, cache headers, JSON-LD, 4 OG images

## Older Runs

- **PR #462 (merged)**: Scientific accuracy audit across 29 files
- **PR #447 (merged)**: Fuse.js lazy-load + 4/6 education pages SSR-refactored
- **PR #446 (merged)**: Dead code & dependency audit — removed 51 packages

## Current Project State

- **Tests**: 431/431 passing (28 test files)
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Galleries**: 174/175 trees with iNaturalist photo galleries
- **External links**: 175/175 trees with GBIF + IUCN links
- **All pages**: 600+ lines, bilingual parity achieved
- **Database**: Neon PostgreSQL deployed, Prisma 7, admin user active
- **Performance**: Lighthouse 85/100 (Perf), 100 (SEO), 100 (BP). LCP 4.0s is network-bound. A11y expected 100 after contrast fix deployed.
- **Component sizes**: All 3 large clients split — TreeMapClient 1,027, ScavengerHuntClient 575, TreeJournalClient 672 lines

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md` (updated 2026-02-26):

| Priority | Task                                  | Status      | Notes                                                               |
| -------- | ------------------------------------- | ----------- | ------------------------------------------------------------------- |
| P2.1     | Photo gallery sections                | ✅ Complete | 174/175 (orey lacks iNaturalist photos)                             |
| P2.2     | Applications/Uses body sections       | ✅ Complete | Already present in 173/175 under various headings                   |
| P2.3     | Seasonal phenology body sections      | ✅ Complete | Already present in all 174 with seasonal frontmatter                |
| P2.4     | GBIF/IUCN external links              | ✅ Complete | 175/175 now have both GBIF and IUCN links                           |
| P3.1     | OG images for comparison detail pages | ✅ Complete | Created opengraph-image.tsx + twitter-image.tsx                     |
| P3.2     | OG images for tree detail pages       | ✅ Complete | Already existed from a previous run                                 |
| P3.3     | JSON-LD for tree detail pages         | ✅ Complete | Taxon schema, conservation status, distribution, multi-image        |
| P3.4     | Sitemap enhancements                  | ✅ Complete | All pages, lastmod, comparisons, glossary already included          |
| P4.2     | SSR refactor 2 education pages        | ✅ Complete | ScavengerHuntClient, TreeJournalClient — all 6 education pages done |
| P4.3     | Split large client components         | ✅ Complete | TreeMapClient 26%, ScavengerHuntClient 52%, TreeJournalClient 37%   |
| P4.7     | A11y contrast fixes (4 issues)        | ✅ Complete | Dark mode primary/secondary lightened, skip-link override added     |
| P5.1     | API route test coverage               | ✅ Complete | 107 new tests across 9 files, 431/431 total passing                 |
| P3.5     | Meta description optimization         | 📋 Ready    | Audit uniqueness, length, key terms                                 |
| P5.2     | Error tracking (Sentry)               | 📋 Ready    | Stub integration                                                    |

**Recommended next task**: P3.5 (Meta description audit) — last remaining SEO task.

## Established Patterns

### Education Lesson SSR Data Extraction Pattern

Used in PR #447 for 4 lessons. For remaining 2 pages (ScavengerHuntClient, TreeJournalClient):

1. Create `{lesson-name}-data.ts` in the lesson directory
2. Export a function `get{LessonName}LessonData(locale: string)` returning typed data
3. Data includes: labels (translations), quiz questions, steps, categories — anything locale-dependent and purely static
4. `page.tsx` (server component) imports and calls the data function, passes result as `lessonData` prop
5. Client component receives `lessonData` prop, destructures needed fields, removes inline data definitions
6. This moves static locale data from client JS bundle to RSC payload

### OG Image Pattern

Used in PR #463 for 4 section pages. For remaining pages:

1. Create `opengraph-image.tsx` in the route directory
2. Export `runtime = 'edge'`, `alt`, `size`, `contentType`
3. Use `ImageResponse` from `next/og`
4. Include bilingual text based on locale param
5. Use gradient backgrounds (green for nature, blue for education, brown for comparisons)

### Content Enrichment Script Pattern

Used in this run for `add-external-links.mjs` and `fix-datatable-links.mjs`:

1. `.mjs` extension, `#!/usr/bin/env node`
2. Support `--dry-run` and `--tree=<name>` flags
3. Process both EN and ES locales
4. Handle multiple content patterns (ExternalLinksGrid, DataTable, markdown lists)
5. Log progress per-file, print summary

### Client Component Split Pattern (P4.3)

Used in Run 5 for TreeMapClient, ScavengerHuntClient, TreeJournalClient:

1. **Data/constants** extracted to a co-located `*-data.ts` or `*-validators.ts` file
2. **View components** extracted as separate `.tsx` files in the same directory
3. **State/reducer/handlers** stay in the parent component (state owner)
4. Props interface per extracted view — callbacks as `onAction` naming convention
5. Each extracted view has its own `"use client"` directive and imports (Link, Image, etc.)
6. Parent renders `<ExtractedView {...props} />` instead of inline JSX blocks

## Operator Preferences (Persistent)

1. Batch depth: go as far as practical in each run, with slight safety margin to reduce regression risk.
2. Warning policy: be lenient with pre-existing lint warnings; avoid warning churn unless directly related to touched changes.
3. Handoff policy: always update this file at end of run and ensure the next prompt references this file.
4. Branch hygiene: after PR merge, clean up associated branches (remote and local) when safe.

## Next-Agent Prompt (Copy/Paste)

```text
You are working in an existing repo with strict agent instructions.

Repository
- Start by reading: $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md
- Treat repository docs as authoritative, especially IMPLEMENTATION_PLAN.md and AGENTS.md

Mission
- Content Enrichment (P2): ✅ ALL COMPLETE (P2.1–P2.4).
- SEO (P3): OG images ✅, JSON-LD ✅, Sitemap ✅. Remaining: meta description audit (P3.5).
- Performance (P4): Lighthouse 85/100. LCP 4.0s is network-bound. A11y contrast ✅.
  SSR refactor ✅ ALL 6 education pages done. Component splits ✅ ALL 3 done.
- Testing (P5): API route tests ✅ (107 tests, 431 total). Error tracking stub (P5.2) remaining.
- Recommended execution order (pick one or more):
  1. P3.5: Meta description optimization audit (last SEO task)
  2. P5.2: Error tracking / Sentry integration
  3. Any remaining polish from IMPLEMENTATION_PLAN.md

Required workflow
1. Read and follow:
   - $REPO_ROOT/AGENTS.md
   - $REPO_ROOT/.github/instructions/*.md
   - $REPO_ROOT/docs/IMPLEMENTATION_PLAN.md
   - $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md
2. Sync main:
   - git fetch origin
   - git checkout main
   - git pull --ff-only origin main
3. Create a branch using conventions: feature/*, fix/*, content/*, docs/*.
4. Implement selected item end-to-end.
5. Update docs/counters/checklists affected by your change.
6. Verify:
   - npm run lint
   - npm run build
7. Commit with conventional commit type
8. If feasible, choose another item and implement it as well
9. Push, and open PR to main.

MANDATORY END-OF-RUN DIRECTIVES
1. Update $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md with latest state
2. Write a fresh next-agent prompt that references this file
```
