# Next Agent Handoff

Last updated: 2026-02-15

## Current Repository State

- Repository path: `<REPO_ROOT>` (resolve via `git rev-parse --show-toplevel`)
- Canonical base branch: `main`
- Current `origin/main` commit: `6167b43`
- Current working branch for this cycle: `codex/content/priority-1-4-short-page-maintenance-pass-4`
- Working branch head commit: resolve via `git rev-parse --short HEAD`
- Most recent merged PRs:
  - #383 `feat(content): expand Priority 1.4 short-page maintenance batch` (branch: `codex/content/priority-1-4-short-page-maintenance-pass-3`)
  - #382 `🖼️ Weekly Image Quality & Optimization (1 files)`
  - #381 `feat(content): expand Priority 1.4 ES parity and short-page maintenance`
  - #380 `feat(content): expand ES parity for mastate, papaya, mangle-blanco, and llama-del-bosque`
  - #379 `refactor: harden SafetyBadge type safety, i18n, and test coverage`
  - #378 `fix: prevent tree page runtime crashes`
- Open PRs from current cycle:
  - #386 `feat(content): expand 5 short species pages to 600+ lines (Priority 1.4 pass 4)` (branch: `codex/content/priority-1-4-short-page-maintenance-pass-4`)

## Highest-Priority Remaining Work

From `<REPO_ROOT>/docs/IMPLEMENTATION_PLAN.md` and the latest `npm run content:audit`:

- Priority 1.4 remains active as **ongoing short-page quality maintenance**.
- This cycle completed the next top-five short-page batch and reduced short-page backlog **16 -> 11**.
- Completed this cycle:
  - `content/trees/en/lengua-de-vaca.mdx` 483 -> 606
  - `content/trees/es/lengua-de-vaca.mdx` 493 -> 616
  - `content/trees/en/corozo.mdx` 486 -> 609
  - `content/trees/es/corozo.mdx` 516 -> 609
  - `content/trees/en/tirra.mdx` 490 -> 611
  - `content/trees/es/tirra.mdx` 509 -> 613
  - `content/trees/en/tamarindo-dulce.mdx` 503 -> 601
  - `content/trees/es/tamarindo-dulce.mdx` 507 -> 605
  - `content/trees/en/flor-de-itabo.mdx` 504 -> 601
  - `content/trees/es/flor-de-itabo.mdx` 512 -> 609
- Next maintenance targets by current audit order:
  1. `palma-de-escoba` (EN 507 | ES 523)
  2. `sardinillo` (EN 507 | ES 521)
  3. `palma-suita` (EN 512 | ES 531)
  4. `chirraca` (EN 517 | ES 529)
  5. `palma-yolillo` (EN 522 | ES 535)
- Additional short pages (lower priority):
  - `palma-cacho-de-venado` (EN 534 | ES 545)
  - `javillo` (EN 587 | ES 605)
  - `cipres` (EN 591 | ES 608)
  - `fruta-de-pan` (EN 592 | ES 599)
  - `guacimo` (EN 593 | ES 601)
  - `capulin` (EN 596 | ES 652)
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
- Start with: `palma-de-escoba`, `sardinillo`, `palma-suita`, `chirraca`, then `palma-yolillo` (unless a fresh audit reprioritizes).
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
