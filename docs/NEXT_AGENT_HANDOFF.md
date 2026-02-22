# Next Agent Handoff

Last updated: 2026-02-22

## Latest Run Summary

- **Branch**: `feature/performance-bundle-optimization` (PR to main, pending)
- **Tasks completed**:
  1. **Dead code & dependency audit**: Full codebase analysis identified dead imports, unused dependencies, and orphaned modules.
  2. **Remove dead SpeedInsights import**: `@vercel/speed-insights` was imported in root layout but never rendered in JSX. Removed import and dependency.
  3. **Remove dead QueryProvider infrastructure**: `QueryProvider.tsx`, `query-client-persister.ts`, `query-helpers.ts` were all dead code (QueryProvider was never used in any layout or page after global React Query provider was removed earlier). Removed files, barrel exports, and their tests.
  4. **Remove phantom dependencies**: Removed `shiki` (~5MB on disk), `rehype-pretty-code`, `@tanstack/query-sync-storage-persister`, `@tanstack/react-query-persist-client` — all installed but never imported in source code. Net: **51 packages removed** from node_modules.
  5. **Optimize package imports**: Added `fuse.js`, `zustand`, `@tanstack/react-query` to `optimizePackageImports` in next.config.ts for better tree-shaking.
  6. **CSS cleanup**: Updated dark theme CSS comments for clarity (no semantic change).
- **Key files changed**:
  - `src/app/[locale]/layout.tsx` — removed dead SpeedInsights import
  - `src/components/providers/QueryProvider.tsx` — deleted (dead code)
  - `src/lib/query-client-persister.ts` — deleted (dead code)
  - `src/lib/query-helpers.ts` — deleted (dead code)
  - `tests/query-client.test.ts` — deleted (tested dead code)
  - `tests/query-helpers.test.ts` — deleted (tested dead code)
  - `src/components/providers/index.ts` — removed QueryProvider export
  - `src/components/index.ts` — removed QueryProvider export
  - `package.json` — removed 5 unused dependencies
  - `next.config.ts` — added 3 entries to optimizePackageImports
  - `src/app/globals.css` — CSS comment cleanup
- **Verification**: Lint 0 errors (268 pre-existing warnings), build successful, tests 340 passed (7 pre-existing failures unrelated to changes).

## Performance Audit Findings (for next agent)

Bundle analysis revealed these remaining optimization opportunities:

| Finding                                          | Impact | Status                                                                             |
| ------------------------------------------------ | ------ | ---------------------------------------------------------------------------------- |
| 93 `"use client"` components                     | High   | Architectural — education lesson pages (1000-1500 lines) ship static content as JS |
| QuickSearch (417 lines) in Header                | Medium | Loaded on every page via Header; already dynamically imported                      |
| Fuse.js (~30KB gz) in TreeExplorer               | Medium | Could be lazy-loaded only when user searches                                       |
| Education lesson pages as full client components | High   | Could extract static markup to server components                                   |
| `ssr: false` not usable in Server Components     | N/A    | Next.js 16 limitation — dynamic imports still code-split effectively               |

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                    |
| -------- | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| P1.1     | Species content      | 175/175 (100%) ✅    | 175+ target achieved                                                                                                     |
| P1.3     | Care guidance        | 175/175 (100%) ✅    | Complete                                                                                                                 |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after additions                                                                                                  |
| P2       | Performance          | 🟡 In progress       | Dead code removed (51 packages). Remaining: Lighthouse measurement, education page SSR refactoring, Fuse.js lazy-loading |
| P4       | Community features   | 🔲 Not started       | Now unblocked                                                                                                            |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                         |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                 |

**Recommended next task**: (1) Measure post-deploy Lighthouse score (baseline 48/100, target 90/100), (2) Refactor education lesson pages to extract static HTML as server components (biggest remaining bundle win), (3) Lazy-load Fuse.js to defer ~30KB until user searches, (4) Community features (P4), (5) Species expansion beyond 175.

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
- Performance (P2): Dead code audit completed — 51 packages removed, dead imports
  and unused modules cleaned up. Prior work removed ~70-90KB from every page
  (React Query global, StoreProvider, translation payload). Hero AVIF re-encoded
  (47-64% smaller). Lighthouse baseline 48/100, target 90/100.
  Remaining: (a) measure post-deploy Lighthouse, (b) refactor education lesson
  pages from full "use client" to server/client split (biggest remaining win),
  (c) lazy-load Fuse.js (~30KB) until user initiates search.
- Species content: 175/175 (100%) — complete.
- Next recommended tasks (pick one or more):
  1. Measure post-deploy Lighthouse and identify remaining bottlenecks
  2. Refactor education lesson pages — extract static markup as server components,
     keep only interactive parts as "use client" (6 pages, 1000-1500 lines each)
  3. Lazy-load Fuse.js in TreeExplorer (defer ~30KB until search is used)
  4. Start community features (P4) — user photo uploads, contribution workflow
  5. Database query optimization (requires active DB in production)
  6. Continue species expansion beyond 175
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
