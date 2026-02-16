# Next Agent Handoff

Last updated: 2026-02-16

## Current Repository State

- Repository path: `<REPO_ROOT>` (resolve via `git rev-parse --show-toplevel`)
- Canonical base branch: `main`
- Current `origin/main` commit: `c3eca4a`
- Current working branch for this cycle: `content/add-introduced-species-batch`
- Working branch head commit: `184747e`
- Most recent merged PRs:
  - #396 `docs: sync NEXT_AGENT_HANDOFF after PR #394 merge` (branch: `codex/docs/full-cleanup-handoff-sync`)
  - #394 `feat(content): add Nim species profiles and fix MDX component registry test` (branch: `codex/content/add-nim-neem-species-profile`)
  - #388 `feat(content): Priority 1.4 Short-Page Maintenance Pass 5 - Expand 5 Species to 600+ Lines`
  - #386 `feat(content): expand 5 short species pages to 600+ lines (Priority 1.4 pass 4)`
  - #383 `feat(content): expand Priority 1.4 short-page maintenance batch`
- Open PRs from current cycle:
  - PR #400 `feat(content): add 3 introduced species (acacia-mangium, pino-caribeno, eucalipto)` (branch: `content/add-introduced-species-batch`)

## Highest-Priority Remaining Work

From `<REPO_ROOT>/docs/IMPLEMENTATION_PLAN.md` and the latest `npm run content:audit`:

- Priority 1.4 short-page maintenance: **clear** (`npm run content:audit` shows 0 pages under 600 lines, 164 total trees).
- Priority 1.1 "Introduced but Ecologically Significant" category: **complete (4/4)** after this cycle.
  - Added this cycle (3 species, 6 bilingual files):
    - `content/trees/{en,es}/acacia-mangium.mdx` — Acacia mangium
    - `content/trees/{en,es}/pino-caribeno.mdx` — Pinus caribaea (Caribbean Pine)
    - `content/trees/{en,es}/eucalipto.mdx` — Eucalyptus deglupta (Rainbow Eucalyptus)
  - Species count updated: 161 → 164 (94% of 175 target)
- Updated tracking docs:
  - `docs/IMPLEMENTATION_PLAN.md` (species 161→164, introduced section 1/4→4/4 ✅)
  - `docs/MISSING_SPECIES_LIST.md` (3 species marked added, remaining ~24)
- Verification: lint 0 errors, build successful, content audit 0 pages under threshold.
- **Next highest unchecked work item**: continue **Priority 1.1 Add Missing Species** with additional species from `docs/MISSING_SPECIES_LIST.md`. Remaining categories include low-priority special-case ecological species and any other unchecked categories.
- CI status note: PR #400 is open and awaiting review/merge.

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
- The "Introduced but Ecologically Significant" species category is now complete (4/4).
- Continue Priority 1.1 missing-species expansion with the next highest-impact batch from `docs/MISSING_SPECIES_LIST.md`.
- Review remaining unchecked categories and pick the highest-priority species batch.
- Do not ask questions if answer exists in repo docs.
- Keep Priority 1.4 monitored by rerunning `npm run content:audit` after species additions.
- Check if PR #400 has been merged; if so, clean up the branch before starting new work.

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
- [x] PR opened (#400)
- [ ] Associated merged branches cleaned up (PR not yet merged)
- [x] `docs/NEXT_AGENT_HANDOFF.md` updated
- [x] Next-agent prompt generated and references `docs/NEXT_AGENT_HANDOFF.md`
