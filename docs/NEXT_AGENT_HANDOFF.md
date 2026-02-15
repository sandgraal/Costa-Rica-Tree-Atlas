# Next Agent Handoff

Last updated: 2026-02-15

## Current Repository State

- Repository path: `<REPO_ROOT>` (resolve via `git rev-parse --show-toplevel`)
- Canonical base branch: `main`
- Current `origin/main` commit: `6167b43`
- Current working branch for this cycle: `codex/content/priority-1-4-short-page-maintenance-pass-5`
- Working branch head commit: `8d4c624`
- Most recent merged PRs:
  - #386 `feat(content): expand 5 short species pages to 600+ lines (Priority 1.4 pass 4)` (branch: `codex/content/priority-1-4-short-page-maintenance-pass-4`)
  - #383 `feat(content): expand Priority 1.4 short-page maintenance batch` (branch: `codex/content/priority-1-4-short-page-maintenance-pass-3`)
  - #382 `🖼️ Weekly Image Quality & Optimization (1 files)`
  - #381 `feat(content): expand Priority 1.4 ES parity and short-page maintenance`
  - #380 `feat(content): expand ES parity for mastate, papaya, mangle-blanco, and llama-del-bosque`
- Open PRs from current cycle:
  - #388 `feat(content): Priority 1.4 Short-Page Maintenance Pass 5 - Expand 5 Species to 600+ Lines` (branch: `codex/content/priority-1-4-short-page-maintenance-pass-5`)

## Highest-Priority Remaining Work

From `<REPO_ROOT>/docs/IMPLEMENTATION_PLAN.md` and the latest `npm run content:audit`:

- Priority 1.4 remains active as **ongoing short-page quality maintenance**.
- This cycle completed the next top-five short-page batch and reduced short-page backlog **11 -> 6**.
- Completed this cycle (Pass 5):
  - `content/trees/en/sardinillo.mdx` 507 -> 601
  - `content/trees/es/sardinillo.mdx` 520 -> 603
  - `content/trees/en/palma-de-escoba.mdx` 507 -> 601
  - `content/trees/es/palma-de-escoba.mdx` 522 -> 609
  - `content/trees/en/palma-suita.mdx` 512 -> 615
  - `content/trees/es/palma-suita.mdx` 530 -> 600
  - `content/trees/en/chirraca.mdx` 517 -> 613
  - `content/trees/es/chirraca.mdx` 528 -> 602
  - `content/trees/en/palma-yolillo.mdx` 522 -> 635
  - `content/trees/es/palma-yolillo.mdx` 534 -> 600
- Completed previous cycle (Pass 4):
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
- Next maintenance targets by current audit order (6 remaining short pages):
  1. `corteza-amarilla` (EN 535 | ES 594)
  2. `quira-macho` (EN 550 | ES 560)
  3. `almendro-amarillo` (EN 560 | ES 590)
  4. `cedro-amargo` (EN 570 | ES 560)
  5. `achotillo` (EN 588 | ES 585)
  6. `fruta-dorada` (EN 598 | ES 588)
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
- Start with: `corteza-amarilla`, `quira-macho`, `almendro-amarillo`, `cedro-amargo`, then `achotillo` or `fruta-dorada` (unless a fresh audit reprioritizes).
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
