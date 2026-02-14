# Next Agent Handoff

Last updated: 2026-02-14

## Current Repository State

- Repository path: `<REPO_ROOT>` (resolve via `git rev-parse --show-toplevel`)
- Canonical base branch: `main`
- Current `origin/main` commit: `8482617`
- Current working branch for this cycle: `codex/content/priority-1-4-parity-mastate-papaya`
- Working branch head commit: `9e25916`
- Most recent merged PRs:
  - #375 `feat(content): improve ES parity pages and harden MDX table rendering`
  - #374 `fix: correct 200+ missing Spanish diacritics in five ES tree content files`
  - #373 `feat(content): full expansion pass for five low-priority short pages`
  - #372 `[ImgBot] Optimize images`
  - #371 `fix(deps): upgrade next-mdx-remote to v6`
- Open PRs from current cycle:
  - #377 `feat(content): expand ES parity for mamon-chino and lorito` (branch: `codex/content/priority-1-4-maintenance-rerun`)
  - #378 `fix: prevent tree page runtime crashes` (branch: `codex/fix/mdx-map-and-safety-fallbacks`)
  - #380 `feat(content): expand ES parity for mastate, papaya, mangle-blanco, and llama-del-bosque` (branch: `codex/content/priority-1-4-parity-mastate-papaya`)

## Highest-Priority Remaining Work

From `<REPO_ROOT>/docs/IMPLEMENTATION_PLAN.md`:

- Priority 1.4 remains active as **ongoing short-page quality maintenance**.
- Latest maintenance rerun completed (`npm run content:audit`): short-page backlog reduced **29 -> 25**.
- This cycle completed high-impact parity lifts:
  - `content/trees/es/mastate.mdx` 473 -> 608 lines (EN 688)
  - `content/trees/es/papaya.mdx` 530 -> 729 lines (EN 736)
  - `content/trees/es/mangle-blanco.mdx` 416 -> 602 lines (EN 605)
  - `content/trees/es/llama-del-bosque.mdx` 497 -> 603 lines (EN 682)
- Next maintenance targets by impact/parity gap (highest first):
  1. `cachimbo` (EN 653 | ES 478)
  2. `cortez-negro` (EN 606 | ES 449)
  3. `guachipelin` (EN 582 | ES 448)
  4. `quina` (EN 385 | ES 386) for low-line bilingual expansion
- If Priority 1.4 findings are cleared, move to the highest unchecked item in `docs/IMPLEMENTATION_PLAN.md`.

## Operator Preferences (Persistent)

1. Batch depth: go as far as practical in each run, with slight safety margin to reduce regression risk.
2. Warning policy: be lenient with pre-existing lint warnings; avoid warning churn unless directly related to touched changes.
3. Handoff policy: always update this file at end of run and ensure the next prompt references this file.
4. Branch hygiene: after PR merge, clean up associated branches (remote and local) when safe.

## Next-Agent Prompt (Copy/Paste)

```text
You are working in an existing repo with strict agent instructions.

Repository
- Resolve repo root first:
  - REPO_ROOT=$(git rev-parse --show-toplevel)
- Path: $REPO_ROOT
- Start by reading: $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md
- Treat repository docs as authoritative, especially IMPLEMENTATION_PLAN.md and AGENTS.md

Mission
- Continue Priority 1.4 short-page maintenance from the latest audit baseline (after handling active review feedback on open PRs #377, #378, and #380 if requested).
- Sync to latest main, rerun `npm run content:audit`, and address the highest-impact EN/ES parity gaps.
- Start with: `cachimbo`, `cortez-negro`, `guachipelin`, then `quina` for low-line bilingual expansion (unless a fresh audit reprioritizes).
- Do not ask questions if answer exists in repo docs.
- If Priority 1.4 shows no actionable gaps, move to the next highest unchecked item in IMPLEMENTATION_PLAN.md.

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
3. Create a branch using conventions: feature/*, fix/*, content/*, docs/* (use `codex/` prefix in this environment, e.g., `codex/content/...`).
4. Implement selected item end-to-end.
5. Update docs/counters/checklists affected by your change.
6. Verify:
   - npm run lint
   - npm run build
7. Commit with conventional commit type, push, and open PR to main.

Output format
- Chosen task and why it was highest priority
- Exact files changed
- Verification results (lint/build)
- PR link
- Blockers or follow-up recommendations

MANDATORY END-OF-RUN DIRECTIVES
1. Cleanup:
   - Ensure worktree is clean or explain exactly why not.
   - If PR merged, clean associated branches (remote and local) when safe.
   - Ensure local main can be fast-forwarded cleanly.
2. Handoff:
   - Update $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md with latest state (commit, merged/open PR, remaining top task).
   - Write a fresh next-agent prompt that explicitly references $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md.
```

## End-of-Run Checklist

- [x] `main` synced to `origin/main`
- [x] Feature/fix/content/docs branch used for changes
- [x] PR opened (and merged if applicable)
- [ ] Associated merged branches cleaned up (remote + local)
- [x] `docs/NEXT_AGENT_HANDOFF.md` updated
- [x] Next-agent prompt generated and references `docs/NEXT_AGENT_HANDOFF.md`
