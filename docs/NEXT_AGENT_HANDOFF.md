# Next Agent Handoff

Last updated: 2026-02-13

## Current Repository State

- Repository path: `<REPO_ROOT>` (resolve via `git rev-parse --show-toplevel`)
- Canonical base branch: `main`
- Current `origin/main` commit: `b7c244f`
- Current working branch for this cycle: `codex/content/full-expansion-low-priority-short-pages`
- Working branch head commit: `705adce`
- Most recent merged PRs:
  - #372 `[ImgBot] Optimize images`
  - #371 `fix(deps): upgrade next-mdx-remote to v6`
  - #370 `🖼️ Weekly Image Quality & Optimization (210 files)`
  - #369 `fix(i18n): standardize Spanish header capitalization and diacritics in advanced care sections`
  - #368 `feat(content): expand advanced care guidance for five low-priority species`
- Open PRs from current cycle:
  - #373 `feat(content): full expansion pass for five low-priority short pages` (branch: `codex/content/full-expansion-low-priority-short-pages`, head commit `705adce`)

## Highest-Priority Remaining Work

From `<REPO_ROOT>/docs/IMPLEMENTATION_PLAN.md`:

- Priority 1.4 remains active as **ongoing short-page quality maintenance**.
- The full expansion pass for `zorrillo`, `contra`, `achotillo`, `guarumbo-hembra`, and `bambu-gigante` is complete in EN+ES; all ten files now exceed 600 lines.
- Next maintenance task: rerun `npm run content:audit` after syncing to latest `main`, then triage any newly flagged short pages or bilingual depth gaps.
- If no Priority 1.4 short-page findings remain, move to the highest unchecked item in `docs/IMPLEMENTATION_PLAN.md` and execute end-to-end.

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
- Priority 1.4 remains active for maintenance:
  - sync to latest main
  - run npm run content:audit
  - address the highest-impact remaining short-page/parity findings (if any)
- If audit shows no Priority 1.4 gaps, move to the next highest unchecked item in IMPLEMENTATION_PLAN.md.

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
