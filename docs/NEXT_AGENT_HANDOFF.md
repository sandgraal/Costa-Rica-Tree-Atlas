# Next Agent Handoff

Last updated: 2026-02-20

## Latest Run Summary

- **Branch**: `content/glossary-expansion-50-terms` → [PR #413](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/413) to main (open)
- **Task completed**: Added 50 new bilingual glossary terms (100 MDX files: 50 EN + 50 ES) across 6 focus areas: Wood Anatomy (10), Forest Ecology (10), Agroforestry (10), Taxonomy (5), Morphology/Botany (10), Reproduction (5).
- **Glossary coverage**: 100/150 (67%) → **150/150 (100%)** — P5.2 now complete.
- **Updated tracking docs**: `docs/IMPLEMENTATION_PLAN.md` (glossary 150/150 100%, P5.2 marked complete, success metrics updated).
- **Verification**: lint 0 errors (267 pre-existing warnings), build successful, contentlayer MDX validation passed.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                          |
| -------- | -------------------- | -------------------- | -------------------------------------------------------------- |
| P1.1     | Species content      | 169/169 (100%) ✅    | Target 175+ by adding new species from MISSING_SPECIES_LIST.md |
| P1.3     | Care guidance        | 169/169 (100%) ✅    | Complete                                                       |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after new species additions                            |
| P2       | Performance Phase 3  | 🔲 Not started       | Lighthouse CI, bundle analysis, image CDN                      |
| P4       | Community features   | 🔲 Not started       | Now unblocked — user contributions, ratings                    |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                               |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Completed this run                                             |

**Recommended next task**: Add new species from `MISSING_SPECIES_LIST.md` toward the 175+ target (P1.1). Alternatively, tackle Performance Phase 3 (P2) for Lighthouse score improvement (48 → 90).

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
