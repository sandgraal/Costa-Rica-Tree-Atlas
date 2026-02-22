# Next Agent Handoff

Last updated: 2026-02-22

## Latest Run Summary

- **Branch**: `feature/performance-ssr-refactor-fuse-lazy` → [PR #447](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/447) (open, pending review)
- **Commits**: `192de5d` (Fuse.js lazy-load), `384a2a3` (education SSR data extraction)
- **Tasks completed**:
  1. **Lazy-load Fuse.js (~30KB gzipped deferred)**: Replaced static `import Fuse from 'fuse.js'` in `src/lib/search/index.ts` with dynamic `import('fuse.js')` on first search query. `search()` is now async, Fuse constructor cached after first load. Updated `TreeExplorer.tsx` from sync `useMemo` to async `useEffect` with stale-request cancellation via `searchAbortRef`.
  2. **Education lesson SSR data extraction (~980 lines moved server-side)**: Created 4 server-only data modules that export locale-dependent static data (translations, quiz questions, steps, categories). Server `page.tsx` imports and passes data as `lessonData` prop. Client components receive data as props instead of defining inline.
     - `biodiversity-intro/biodiversity-data.ts` (233 lines) — ~170 lines extracted
     - `ecosystem-services/ecosystem-services-data.ts` (416 lines) — ~350 lines extracted
     - `conservation/conservation-data.ts` (480 lines) — ~403 lines extracted
     - `tree-identification/tree-identification-data.ts` (149 lines) — ~90 lines extracted
- **Key files changed**:
  - `src/lib/search/index.ts` — Fuse.js dynamic import, async `search()`
  - `src/components/tree/TreeExplorer.tsx` — async search pipeline with stale-request cancellation
  - `src/app/[locale]/education/lessons/biodiversity-intro/{page.tsx,BiodiversityLessonClient.tsx,biodiversity-data.ts}`
  - `src/app/[locale]/education/lessons/ecosystem-services/{page.tsx,EcosystemServicesClient.tsx,ecosystem-services-data.ts}`
  - `src/app/[locale]/education/lessons/conservation/{page.tsx,ConservationLessonClient.tsx,conservation-data.ts}`
  - `src/app/[locale]/education/lessons/tree-identification/{page.tsx,TreeIdentificationClient.tsx,tree-identification-data.ts}`
- **Verification**: Lint 0 errors (269 pre-existing warnings), build successful, tests 340 passed (7 pre-existing failures unchanged).

## Previous Run Summary

- **Branch**: `feature/performance-bundle-optimization` → PR #446 (merged)
- **Tasks completed**: Dead code & dependency audit — removed 51 packages, dead SpeedInsights import, QueryProvider infrastructure, phantom dependencies. Added `optimizePackageImports` in next.config.ts.

## Performance Audit Findings (for next agent)

Bundle analysis revealed these remaining optimization opportunities:

| Finding                                          | Impact | Status                                                                                             |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------- |
| 93 `"use client"` components                     | High   | Architectural — 2 remaining large education pages not yet refactored                               |
| QuickSearch (417 lines) in Header                | Medium | Loaded on every page via Header; already dynamically imported                                      |
| Fuse.js (~30KB gz) in TreeExplorer               | Low    | ✅ Done — lazy-loaded via dynamic import (PR #447)                                                 |
| Education lesson pages as full client components | Medium | ✅ 4/6 done (PR #447). Remaining: ScavengerHuntClient (1491 lines), TreeJournalClient (1305 lines) |
| `ssr: false` not usable in Server Components     | N/A    | Next.js 16 limitation — dynamic imports still code-split effectively                               |

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                                                                         |
| -------- | -------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1     | Species content      | 175/175 (100%) ✅    | 175+ target achieved                                                                                                                                                          |
| P1.3     | Care guidance        | 175/175 (100%) ✅    | Complete                                                                                                                                                                      |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after additions                                                                                                                                                       |
| P2       | Performance          | 🟡 In progress       | Fuse.js lazy-loaded ✅, 4/6 education pages SSR-refactored ✅. Remaining: Lighthouse measurement, 2 more education pages (ScavengerHunt, TreeJournal), post-deploy validation |
| P4       | Community features   | 🔲 Not started       | Now unblocked                                                                                                                                                                 |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                                                                              |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                                                                      |

**Recommended next task**: (1) Measure post-deploy Lighthouse score (baseline 48/100, target 90/100), (2) Refactor remaining 2 education lesson pages — ScavengerHuntClient (1491 lines) and TreeJournalClient (1305 lines) — using the same data-extraction pattern established in PR #447, (3) Community features (P4), (4) Species expansion beyond 175.

## Established Patterns

### Education Lesson SSR Data Extraction Pattern

Used in PR #447 for 4 lessons. For remaining pages, follow the same approach:

1. Create `{lesson-name}-data.ts` in the lesson directory
2. Export a function `get{LessonName}LessonData(locale: string)` returning typed data
3. Data includes: labels (translations), quiz questions, steps, categories — anything locale-dependent and purely static
4. `page.tsx` (server component) imports and calls the data function, passes result as `lessonData` prop
5. Client component receives `lessonData` prop, destructures needed fields, removes inline data definitions
6. This moves static locale data from client JS bundle to RSC payload

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
- Performance (P2): Fuse.js lazy-loaded ✅, 4/6 education pages SSR-refactored ✅,
  dead code audit done (51 packages removed). Prior work removed ~70-90KB from
  every page. Hero AVIF re-encoded (47-64% smaller). Lighthouse baseline 48/100,
  target 90/100.
  Remaining: (a) measure post-deploy Lighthouse, (b) refactor 2 remaining
  education lesson pages (ScavengerHuntClient 1491 lines, TreeJournalClient
  1305 lines) using established data-extraction pattern — see "Established
  Patterns" section in NEXT_AGENT_HANDOFF.md.
- Species content: 175/175 (100%) — complete.
- Next recommended tasks (pick one or more):
  1. Measure post-deploy Lighthouse and identify remaining bottlenecks
  2. Refactor ScavengerHuntClient and TreeJournalClient using the same SSR
     data-extraction pattern (create data module, pass as lessonData prop)
  3. Start community features (P4) — user photo uploads, contribution workflow
  4. Database query optimization (requires active DB in production)
  5. Continue species expansion beyond 175
- Do not ask questions if answer exists in repo docs.
- Keep Priority 1.4 monitored by rerunning `npm run content:audit` after species additions.

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
8. If feasible, choose another item and implement it as well, stepping thru 5, 6 and 7 again, repeat until not feasible
9. Push, and open PR to main.

Output format
- Chosen task and why it was highest priority
- Exact files changed
- Verification results (lint/build)
- PR link
- Blockers or follow-up recommendations

MANDATORY END-OF-RUN DIRECTIVES
1. Handoff:
   - Update $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md with latest state (commit, merged/open PR, remaining top task).
   - Write a fresh next-agent prompt that explicitly references $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md.
```
