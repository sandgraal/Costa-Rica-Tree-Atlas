# Next Agent Handoff

Last updated: 2026-02-21

## Latest Run Summary

- **Branch**: `feature/code-split-mdx-client-components` (PR to main, open)
- **Task completed**: Performance Phase 3 continued — code-split `mdx/client-components.tsx` + stale branch cleanup.
- **Key changes**:
  - **Code-split MDX client components**: Split monolithic 958-line `client-components.tsx` into 8 individual files under `src/components/mdx/client/`, each with its own `"use client"` boundary. Components: AccordionItem, ImageCard, ImageGallery, Tabs, GlossaryTooltip, BeforeAfterSlider, SideBySideImages, FeatureAnnotation.
  - **Per-component code-splitting**: Comparison-specific components (BeforeAfterSlider, SideBySideImages, FeatureAnnotation ~520 lines) are no longer bundled on tree pages — only loaded when rendered in comparison MDX content.
  - **Backward compatibility**: `client-components.tsx` now re-exports from `./client/` barrel; `mdx/index.tsx` imports from `./client`; all existing import paths continue to work.
  - **Updated imports**: `ServerMDXContent.tsx` imports from individual files; test imports updated to `./client`.
  - **Stale branch cleanup**: Deleted 10 merged local branches (cleanup, content/_, feature/_, fix/\*) and 1 orphan backup branch.
  - **Updated tracking docs**: IMPLEMENTATION_PLAN.md Phase 3 checklist, PERFORMANCE_OPTIMIZATION.md Phase 3 status.
- **Verification**: TypeScript 0 errors, lint 0 errors (265 pre-existing warnings), build successful (1465/1465 static pages), MDX component registry test passing.
- **Impact**: Tree pages (~338 pages × 2 locales) no longer load ~520 lines of comparison-only client JS. Each client component is independently tree-shakeable.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                                                                                                                                                                                                                                   |
| -------- | -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1     | Species content      | 169/169 (100%) ✅    | All species from MISSING_SPECIES_LIST.md complete. Target 175+ by identifying new species.                                                                                                                                                                                                                                              |
| P1.3     | Care guidance        | 169/169 (100%) ✅    | Complete                                                                                                                                                                                                                                                                                                                                |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after new species additions                                                                                                                                                                                                                                                                                                     |
| P2       | Performance Phase 3  | 🟡 Nearly complete   | 15 server component conversions + 3 dead code deletions done. Edge caching implemented. Partial hydration implemented (6 components). Progressive enhancement implemented (noscript fallbacks). MDX client components code-split (8 files). Remaining: database query optimization. ~53 client components retain genuine interactivity. |
| P4       | Community features   | 🔲 Not started       | Now unblocked — user contributions, ratings                                                                                                                                                                                                                                                                                             |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                                                                                                                                                                                                                                        |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                                                                                                                                                                                                                                |

**Recommended next task**: Performance Phase 3 is nearly complete (only DB query optimization remains, blocked until admin DB is active in production). Top candidates: (1) Add new species toward 175+ target (identify 6+ new species relevant to Costa Rica), (2) Community features (P4, now unblocked), (3) Further performance work — analyze remaining ~53 client components for additional server-component conversion candidates.

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
- Performance Phase 3: server component conversions complete (15 done), edge caching implemented,
  partial hydration implemented (6 heavy components dynamically imported), progressive enhancement
  implemented (noscript fallbacks on key pages), MDX client components code-split (8 individual files).
  Remaining ~53 client components retain genuine client-side interactivity.
- Next recommended tasks (pick one or more):
  1. Add new species toward 175+ target (identify 6+ new species relevant to Costa Rica)
  2. Analyze remaining ~53 client components for further server-component conversion opportunities
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
