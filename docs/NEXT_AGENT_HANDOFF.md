# Next Agent Handoff

Last updated: 2026-02-15

## Current Repository State

- Repository path: `<REPO_ROOT>` (resolve via `git rev-parse --show-toplevel`)
- Canonical base branch: `main`
- Current `origin/main` commit: `58dc000`
- Current working branch for this cycle: `codex/docs/full-cleanup-handoff-sync`
- Working branch head commit: `a58bc8f`
- Most recent merged PRs:
  - #394 `feat(content): add Nim species profiles and fix MDX component registry test` (branch: `codex/content/add-nim-neem-species-profile`)
  - #388 `feat(content): Priority 1.4 Short-Page Maintenance Pass 5 - Expand 5 Species to 600+ Lines` (branch: `codex/content/priority-1-4-short-page-maintenance-pass-5`)
  - #386 `feat(content): expand 5 short species pages to 600+ lines (Priority 1.4 pass 4)` (branch: `codex/content/priority-1-4-short-page-maintenance-pass-4`)
  - #383 `feat(content): expand Priority 1.4 short-page maintenance batch` (branch: `codex/content/priority-1-4-short-page-maintenance-pass-3`)
  - #382 `🖼️ Weekly Image Quality & Optimization (1 files)`
  - #381 `feat(content): expand Priority 1.4 ES parity and short-page maintenance`
  - #380 `feat(content): expand ES parity for mastate, papaya, mangle-blanco, and llama-del-bosque`
- Open PRs from current cycle:
  - PR #396 `docs: sync NEXT_AGENT_HANDOFF after PR #394 merge` (branch: `codex/docs/full-cleanup-handoff-sync`)

## Highest-Priority Remaining Work

From `<REPO_ROOT>/docs/IMPLEMENTATION_PLAN.md` and the latest `npm run content:audit`:

- Priority 1.4 short-page maintenance was completed this cycle from a fresh audit baseline.
- Completed this cycle (Pass 6):
  - `content/trees/en/palma-cacho-de-venado.mdx`
  - `content/trees/es/palma-cacho-de-venado.mdx`
  - `content/trees/en/javillo.mdx`
  - `content/trees/en/cipres.mdx`
  - `content/trees/en/fruta-de-pan.mdx`
  - `content/trees/es/fruta-de-pan.mdx`
  - `content/trees/en/guacimo.mdx`
  - `content/trees/en/capulin.mdx`
- Latest audit result (`npm run content:audit`): **Under 600 lines: 0**.
- `docs/IMPLEMENTATION_PLAN.md` was updated to reflect backlog reduction **6 → 0**.
- Priority 1.1 progress this cycle:
  - Added `nim` (`Azadirachta indica`) with bilingual pages:
    - `content/trees/en/nim.mdx`
    - `content/trees/es/nim.mdx`
  - Updated species counters and tracking docs:
    - `docs/IMPLEMENTATION_PLAN.md` (`Species` 160 → 161; Priority 1.1 progress 40/47 → 41/47)
    - `docs/MISSING_SPECIES_LIST.md` (`Missing Species` ~28 → ~27; `nim` marked complete)
  - Fixed MDX registry test mismatch with runtime component availability:
    - `tests/tree-mdx-component-registry.test.ts`
- Latest audit result (`npm run content:audit`): **Under 600 lines: 0** (still clear after Nim addition).
- Next highest unchecked work item: continue **Priority 1.1 Add Missing Species**, focusing on remaining introduced-but-ecologically-significant species in `docs/MISSING_SPECIES_LIST.md` (`acacia-mangium`, `pino-caribeno`, `eucalipto`).
- CI status note: PR #394 is merged to `main`; continue from updated `main` baseline.
- Housekeeping note: stale draft PR #395 was closed because it contained no file changes.

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
- Priority 1.4 short-page maintenance is currently clear (`npm run content:audit` shows 0 pages under 600 lines).
- Move to the highest unchecked item in `docs/IMPLEMENTATION_PLAN.md`: continue Priority 1.1 missing-species expansion.
- Use `docs/MISSING_SPECIES_LIST.md` as the source of truth for remaining species and pick the highest-impact bilingual-safe batch.
- Start with remaining introduced-context species: `acacia-mangium`, then `pino-caribeno`, then `eucalipto`.
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
- [x] Associated merged branches cleaned up (remote + local)
- [x] `docs/NEXT_AGENT_HANDOFF.md` updated
- [x] Next-agent prompt generated and references `docs/NEXT_AGENT_HANDOFF.md`
