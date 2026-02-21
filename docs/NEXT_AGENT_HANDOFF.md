# Next Agent Handoff

Last updated: 2026-02-20

## Latest Run Summary

- **Branch**: `feature/partial-hydration-progressive-enhancement` (PR #427 to main, open)
- **Task completed**: Performance Phase 3 continued — partial hydration + progressive enhancement.
- **Key changes**:
  - **Partial hydration**: Dynamic-imported 6 heavy client components (~3,252 lines total) with loading skeletons. QuickSearch (417 lines, loaded on every page via Header), TreeExplorer (685 lines), SeasonalCalendar (953 lines), TreeComparison (426 lines), APIDocumentation (479 lines), FieldGuideGenerator (492 lines).
  - **Progressive enhancement**: Added `<noscript>` fallbacks — global bilingual banner in layout, server-rendered tree directory list on `/trees`, flowering/fruiting tree lists on `/seasonal`. CSS rule to suppress loading skeletons when JS is disabled.
  - **Updated tracking docs**: IMPLEMENTATION_PLAN.md Phase 3 checklist (partial hydration ✅, progressive enhancement ✅), PERFORMANCE_OPTIMIZATION.md Phase 3 status.
- **Verification**: lint 0 errors, build successful (1465/1465 static pages generated), PR #427 created.
- **Impact**: Initial JS bundle reduced on every page (QuickSearch deferred from Header). Five additional route-specific bundles reduced. Site degrades gracefully without JavaScript.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                                                                                                                                                                                       |
| -------- | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1     | Species content      | 169/169 (100%) ✅    | All species from MISSING_SPECIES_LIST.md complete. Target 175+ by identifying new species.                                                                                                                                                                                                  |
| P1.3     | Care guidance        | 169/169 (100%) ✅    | Complete                                                                                                                                                                                                                                                                                    |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after new species additions                                                                                                                                                                                                                                                         |
| P2       | Performance Phase 3  | 🟡 Nearly complete   | 15 server component conversions + 3 dead code deletions done. Edge caching implemented. Partial hydration implemented (6 components). Progressive enhancement implemented (noscript fallbacks). Remaining: database query optimization. ~53 client components retain genuine interactivity. |
| P4       | Community features   | 🔲 Not started       | Now unblocked — user contributions, ratings                                                                                                                                                                                                                                                 |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                                                                                                                                                                                            |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                                                                                                                                                                                    |

**Recommended next task**: Performance Phase 3 is nearly complete (only DB query optimization remains, blocked until admin DB is active in production). Top candidates: (1) Add new species toward 175+ target, (2) Community features (P4, now unblocked), (3) Code-split `mdx/client-components.tsx` (958 lines) into individual dynamic imports so only used MDX widgets are loaded per tree page.

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
- Performance Phase 3: server component conversions complete (15 done), edge caching implemented (PR #424 merged),
  partial hydration implemented (PR #427 — 6 heavy components dynamically imported), progressive enhancement
  implemented (noscript fallbacks on key pages). Remaining ~53 client components retain genuine client-side interactivity.
- Next recommended tasks (pick one or more):
  1. Add new species toward 175+ target (identify 6+ new species relevant to Costa Rica)
  2. Code-split mdx/client-components.tsx (958 lines) into individual dynamic imports per MDX widget
  3. Optimize database queries for admin features (requires active DB in production)
  4. Start community features (P4) — user photo uploads, contribution workflow
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
