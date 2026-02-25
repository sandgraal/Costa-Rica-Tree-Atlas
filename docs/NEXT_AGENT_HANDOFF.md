# Next Agent Handoff

Last updated: 2026-02-25

## Latest Run Summary (2026-02-25)

- **Branch**: `fix/quick-wins-phase2-5` → [PR #463](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/463)
- **Commit**: `54477d9`
- **Tasks completed**:
  1. **Fixed 5 failing tests** (324/324 now passing): entropy.test.ts (3 expectations corrected), redos.test.ts (1), theme-script.test.ts (1)
  2. **Removed debug code**: 2 console.log statements + unused ArrowLeftIcon from tree detail page
  3. **Filled missing frontmatter** (6 MDX files): quina (distribution + seasons), bambú gigante (seasons), granadillo (complete safety fields)
  4. **Added cache headers** in next.config.ts for tree/compare/glossary detail pages (s-maxage=86400, stale-while-revalidate=604800)
  5. **Added JSON-LD structured data** to glossary (DefinedTermSet), compare (CollectionPage), safety (MedicalWebPage), field-guide (WebPage)
  6. **Created 4 OG images**: trees index, compare index, glossary index, education section (all bilingual, using next/og ImageResponse)

## Previous Run Summary (2026-02-24)

- **Branch**: `fix/scientific-accuracy-audit` → [PR #462](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/462) (merged)
- Scientific accuracy audit across 29 files (taxonomic corrections, SEO improvements, DX cleanup)

## Older Runs

- **PR #447 (merged)**: Fuse.js lazy-load + 4/6 education pages SSR-refactored
- **PR #446 (merged)**: Dead code & dependency audit — removed 51 packages, optimizePackageImports

## Current Project State

- **Tests**: 324/324 passing (19 test files)
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **All pages**: 600+ lines, bilingual parity achieved
- **Database**: Neon PostgreSQL deployed, Prisma 7, admin user active
- **Performance**: Major optimizations landed but Lighthouse not yet re-measured (still baseline 48/100 from Jan 18)

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md` (updated 2026-02-25):

| Priority | Task                                  | Status   | Notes                                                            |
| -------- | ------------------------------------- | -------- | ---------------------------------------------------------------- |
| P2.1     | Photo gallery sections                | 📋 Ready | Script exists: `scripts/add-gallery-sections.mjs`                |
| P2.2     | Applications/Uses body sections       | 📋 Ready | 171 trees have `uses:` frontmatter, no body section              |
| P2.3     | Seasonal phenology body sections      | 📋 Ready | 131 trees have seasons frontmatter, no body section              |
| P2.4     | GBIF/IUCN external links              | 📋 Ready | Auto-generate from `scientificName`                              |
| P3.2     | OG images for tree detail pages       | 📋 Ready | 175 pages, highest social sharing impact                         |
| P3.1     | OG images for comparison detail pages | 📋 Ready | Follow existing pattern                                          |
| P4.1     | Lighthouse re-measurement             | ⏸️ B3    | Needs production deploy first                                    |
| P4.2     | SSR refactor 2 education pages        | 📋 Ready | ScavengerHuntClient (1491 lines), TreeJournalClient (1305 lines) |
| P5.1     | API route test coverage               | 📋 Ready | Zero coverage currently                                          |
| P4.3     | Split large client components         | 📋 Ready | 3 components over 1,300 lines each                               |

**Recommended next task**: P2.1–P2.4 (content batch enrichment scripts) — high impact, low effort, no dependencies.

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
- Content Enrichment (P2): Photo gallery sections (script exists), Applications/Uses
  body sections (171 trees), Seasonal phenology sections (131 trees), GBIF/IUCN links
  (~98+45 trees). All are scriptable batch operations with high impact.
- SEO (P3): OG images for 175 individual tree pages and 20 comparison detail pages.
  JSON-LD enhancement for tree pages.
- Performance (P4): Lighthouse re-measurement needed (baseline 48/100, significant work
  done). SSR refactor 2 remaining education pages (ScavengerHuntClient, TreeJournalClient).
  Split 3 large client components (1,300+ lines each).
- Testing (P5): API route test coverage (zero currently). Error tracking (Sentry stub).
- Recommended execution order (pick one or more):
  1. P2.1-P2.4: Content batch enrichment scripts
  2. P3.2: OG images for tree detail pages
  3. P4.2: SSR refactor ScavengerHuntClient and TreeJournalClient
  4. P5.1: API route test coverage
  5. P4.3: Split large client components

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
