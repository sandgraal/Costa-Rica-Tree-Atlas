# Next Agent Handoff

Last updated: 2026-02-25

## Latest Run Summary (2026-02-25 — Run 3)

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

- **Tests**: 324/324 passing (19 test files)
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Galleries**: 174/175 trees with iNaturalist photo galleries
- **External links**: 175/175 trees with GBIF + IUCN links
- **All pages**: 600+ lines, bilingual parity achieved
- **Database**: Neon PostgreSQL deployed, Prisma 7, admin user active
- **Performance**: Lighthouse 85/100 (Perf), 100 (SEO), 100 (BP). LCP 4.0s is network-bound. A11y expected 100 after contrast fix deployed.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md` (updated 2026-02-25):

| Priority | Task                                  | Status      | Notes                                                            |
| -------- | ------------------------------------- | ----------- | ---------------------------------------------------------------- |
| P2.1     | Photo gallery sections                | ✅ Complete | 174/175 (orey lacks iNaturalist photos)                          |
| P2.2     | Applications/Uses body sections       | ✅ Complete | Already present in 173/175 under various headings                |
| P2.3     | Seasonal phenology body sections      | ✅ Complete | Already present in all 174 with seasonal frontmatter             |
| P2.4     | GBIF/IUCN external links              | ✅ Complete | 175/175 now have both GBIF and IUCN links                        |
| P3.1     | OG images for comparison detail pages | ✅ Complete | Created opengraph-image.tsx + twitter-image.tsx                  |
| P3.2     | OG images for tree detail pages       | ✅ Complete | Already existed from a previous run                              |
| P4.7     | A11y contrast fixes (4 issues)        | ✅ Complete | Dark mode primary/secondary lightened, skip-link override added  |
| P4.2     | SSR refactor 2 education pages        | 📋 Ready    | ScavengerHuntClient (1491 lines), TreeJournalClient (1305 lines) |
| P5.1     | API route test coverage               | 📋 Ready    | Zero coverage currently                                          |
| P4.3     | Split large client components         | 📋 Ready    | 3 components over 1,300 lines each                               |
| P3.3     | JSON-LD for tree detail pages         | 📋 Ready    | Add Species/BiologicalTaxon schema                               |
| P3.4     | Sitemap enhancements                  | 📋 Ready    | Add lastmod, verify all pages included                           |
| P3.5     | Meta description optimization         | 📋 Ready    | Audit uniqueness, length, key terms                              |

**Recommended next task**: P4.2 (SSR refactor 2 education pages) — medium effort, reduces client bundle.

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
- Content Enrichment (P2): ✅ ALL COMPLETE (P2.1–P2.4). Photo galleries (174/175),
  GBIF+IUCN links (175/175), uses sections (173/175), seasonal sections (174/174).
- SEO (P3): OG images ✅ complete. Remaining: JSON-LD for tree detail pages (P3.3),
  sitemap enhancements (P3.4), meta description audit (P3.5).
- Performance (P4): Lighthouse 85/100. LCP 4.0s is network-bound. A11y contrast ✅
  fixed. SSR refactor 2 remaining education pages: ScavengerHuntClient (1491 lines)
  and TreeJournalClient (1305 lines). Split 3 large client components (1,300+ lines).
- Testing (P5): API route test coverage (zero currently). Error tracking (Sentry stub).
- Recommended execution order (pick one or more):
  1. P4.2: SSR refactor ScavengerHuntClient and TreeJournalClient
  2. P5.1: API route test coverage
  3. P4.3: Split large client components
  4. P3.3-P3.5: JSON-LD + sitemap + meta description improvements

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
