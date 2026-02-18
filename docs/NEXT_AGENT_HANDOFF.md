# Next Agent Handoff

Last updated: 2026-02-17

## Latest Run Summary

- **Branch**: `content/add-care-guidance-batch` → PR to main (open)
- **Task completed**: Added care/cultivation guidance to the final 7 species lacking it (almendro, guarumo, manchineel, mangle-blanco, mangle-pinuela, matapalo, yellow-oleander) — 14 MDX files (7 EN + 7 ES).
- **Care guidance coverage**: 169/169 (100%) — P1.3 now complete.
- **Updated tracking docs**: `docs/IMPLEMENTATION_PLAN.md` (care guidance 100%, P1.3 marked complete, batch note added).
- **Verification**: lint 0 errors (267 pre-existing warnings), build successful (1365 pages), content audit 0 pages under 600-line threshold, average 726 lines.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md` and the latest `npm run content:audit`:

| Priority | Task                | Status               | Notes                                                          |
| -------- | ------------------- | -------------------- | -------------------------------------------------------------- |
| P1.1     | Species content     | 169/169 (100%) ✅    | Target 175+ by adding new species from MISSING_SPECIES_LIST.md |
| P1.3     | Care guidance       | 169/169 (100%) ✅    | Completed this run                                             |
| P1.4     | Short pages         | 0 under threshold ✅ | Monitor after new species additions                            |
| P2       | Performance Phase 3 | 🔲 Not started       | Lighthouse CI, bundle analysis, image CDN                      |
| P4       | Community features  | 🔲 Not started       | Now unblocked — user contributions, ratings                    |
| P5.2     | Glossary expansion  | 100/150 (67%)        | Add 50+ glossary terms (EN+ES)                                 |

**Recommended next task**: Glossary expansion (P5.2) — 50 terms needed, high user value, moderate effort. Alternatively, add new species from MISSING_SPECIES_LIST.md toward the 175+ target.

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
- Review remaining unchecked categories and pick the highest-priority species batch.
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
