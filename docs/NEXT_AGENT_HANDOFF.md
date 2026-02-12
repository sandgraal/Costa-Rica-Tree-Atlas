# Next Agent Handoff

Last updated: 2026-02-12

## Current Repository State

- Repository path: `<REPO_ROOT>` (resolve via `git rev-parse --show-toplevel`)
- Canonical base branch: `main`
- Main commit at handoff creation: `e8b5e23`
- Most recent merged PRs:
  - #363 `docs: add persistent next-agent handoff guide`
  - #362 `[ImgBot] Optimize images`
- Open PRs from current cycle:
  - #365 `feat: add care guidance for 10 mid-priority species` (branch: `codex/content/add-care-guidance-mid-priority-batch5`, head commit `336f3e3`)

## Highest-Priority Remaining Work

From `<REPO_ROOT>/docs/IMPLEMENTATION_PLAN.md`:

- Priority 1.3 remains active.
- Week 2 progress: `25/30`.
- Open task: `Add care guidance to 5 additional mid-priority species`.

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
- Execute the highest-priority unchecked item in docs/IMPLEMENTATION_PLAN.md.
- If multiple tightly coupled changes affect the same feature/files, implement them together.
- Do not ask questions if answer exists in repo docs.
- Continue Priority 1.3 by completing the remaining 5 mid-priority care-guidance species (Week 2 target 30/30).

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
   - Update $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md with latest state (commit, merged PR, remaining top task).
   - Write a fresh next-agent prompt that explicitly references this handoff file.
```

## End-of-Run Checklist

- [x] `main` synced to `origin/main`
- [x] Feature/fix/content/docs branch used for changes
- [x] PR opened (and merged if applicable)
- [ ] Associated merged branches cleaned up (remote + local)
- [x] `docs/NEXT_AGENT_HANDOFF.md` updated
- [x] Next-agent prompt generated and references `docs/NEXT_AGENT_HANDOFF.md`
