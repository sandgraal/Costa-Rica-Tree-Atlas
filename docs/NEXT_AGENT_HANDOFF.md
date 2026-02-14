# Next Agent Handoff

Last updated: 2026-02-14

## Current Repository State

- Repository path: `<REPO_ROOT>` (resolve via `git rev-parse --show-toplevel`)
- Canonical base branch: `main`
- Current `origin/main` commit: `ee05ba8`
- Current working branch for this cycle: `codex/content/priority-1-4-parity-cachimbo-quina`
- Working branch head commit: resolve via `git rev-parse --short HEAD`
- Most recent merged PRs:
  - #380 `feat(content): expand ES parity for mastate, papaya, mangle-blanco, and llama-del-bosque`
  - #379 `refactor: harden SafetyBadge type safety, i18n, and test coverage`
  - #378 `fix: prevent tree page runtime crashes`
  - #377 `feat(content): expand ES parity for six Priority 1.4 targets`
  - #376 `fix(content): address PR #375 review comments - MDX syntax, diacritics, duplicate section`
- Open PRs from current cycle:
  - (to be created from `codex/content/priority-1-4-parity-cachimbo-quina`)

## Highest-Priority Remaining Work

From `<REPO_ROOT>/docs/IMPLEMENTATION_PLAN.md` and the latest `npm run content:audit`:

- Priority 1.4 remains active as **ongoing short-page quality maintenance**.
- This cycle completed two sequential maintenance passes and reduced short-page backlog **25 -> 21**.
- Completed this cycle:
  - `content/trees/es/cachimbo.mdx` 477 -> 600
  - `content/trees/es/cortez-negro.mdx` 448 -> 635
  - `content/trees/en/guachipelin.mdx` 581 -> 709
  - `content/trees/es/guachipelin.mdx` 447 -> 665
  - `content/trees/en/quina.mdx` 384 -> 635
  - `content/trees/es/quina.mdx` 385 -> 632
  - `content/trees/es/mangle-blanco.mdx` 415 -> 602
  - `content/trees/es/mastate.mdx` 472 -> 600
  - `content/trees/es/llama-del-bosque.mdx` 496 -> 600
  - `content/trees/es/papaya.mdx` 529 -> 717
- Next maintenance targets by current audit order:
  1. `cedro-dulce` (EN 405 | ES 419)
  2. `cristobalito` (EN 470 | ES 473)
  3. `papayillo` (EN 472 | ES 491)
  4. `guayaba-chilena` (EN 477 | ES 489)
  5. `cortez-blanco` (EN 479 | ES 502)
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
- Continue Priority 1.4 short-page maintenance from the latest audit baseline.
- Sync to latest main, rerun `npm run content:audit`, and address the highest-impact EN/ES parity gaps.
- Start with: `cedro-dulce`, `cristobalito`, `papayillo`, `guayaba-chilena`, then `cortez-blanco` (unless a fresh audit reprioritizes).
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
- [ ] PR opened (and merged if applicable)
- [ ] Associated merged branches cleaned up (remote + local)
- [x] `docs/NEXT_AGENT_HANDOFF.md` updated
- [x] Next-agent prompt generated and references `docs/NEXT_AGENT_HANDOFF.md`
