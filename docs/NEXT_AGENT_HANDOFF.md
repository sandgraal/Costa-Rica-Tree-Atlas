# Next Agent Handoff

Last updated: 2026-02-12

## Current Repository State

- Repository path: `/Users/christopherennis/Websites/Costa-Rica-Tree-Atlas`
- Canonical base branch: `main`
- Main commit at handoff creation: `66c51d5`
- Most recent merged PRs:
  - #362 `[ImgBot] Optimize images`
  - #361 `feat: expand care guidance for 4 medium-priority palm species`

## Highest-Priority Remaining Work

From `/Users/christopherennis/Websites/Costa-Rica-Tree-Atlas/docs/IMPLEMENTATION_PLAN.md`:

- Priority 1.3 remains active.
- Week 2 progress: `15/30`.
- Open task: `Add care guidance to 15 additional mid-priority species`.

## Operator Preferences (Persistent)

1. Batch depth: go as far as practical in each run, with slight safety margin to reduce regression risk.
2. Warning policy: be lenient with pre-existing lint warnings; avoid warning churn unless directly related to touched changes.
3. Handoff policy: always update this file at end of run and ensure the next prompt references this file.
4. Branch hygiene: after PR merge, clean up associated branches (remote and local) when safe.

## Next-Agent Prompt (Copy/Paste)

```text
You are working in an existing repo with strict agent instructions.

Repository
- Path: /Users/christopherennis/Websites/Costa-Rica-Tree-Atlas
- Start by reading: /Users/christopherennis/Websites/Costa-Rica-Tree-Atlas/docs/NEXT_AGENT_HANDOFF.md
- Treat repository docs as authoritative, especially IMPLEMENTATION_PLAN.md and AGENTS.md

Mission
- Execute the highest-priority unchecked item in docs/IMPLEMENTATION_PLAN.md.
- If multiple tightly coupled changes affect the same feature/files, implement them together.
- Do not ask questions if answer exists in repo docs.

Required workflow
1. Read and follow:
   - /Users/christopherennis/Websites/Costa-Rica-Tree-Atlas/AGENTS.md
   - /Users/christopherennis/Websites/Costa-Rica-Tree-Atlas/.github/instructions/*.md
   - /Users/christopherennis/Websites/Costa-Rica-Tree-Atlas/docs/IMPLEMENTATION_PLAN.md
   - /Users/christopherennis/Websites/Costa-Rica-Tree-Atlas/docs/NEXT_AGENT_HANDOFF.md
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
   - Update /Users/christopherennis/Websites/Costa-Rica-Tree-Atlas/docs/NEXT_AGENT_HANDOFF.md with latest state (commit, merged PR, remaining top task).
   - Write a fresh next-agent prompt that explicitly references this handoff file.
```

## End-of-Run Checklist

- [ ] `main` synced to `origin/main`
- [ ] Feature/fix/content/docs branch used for changes
- [ ] PR opened (and merged if applicable)
- [ ] Associated merged branches cleaned up (remote + local)
- [ ] `docs/NEXT_AGENT_HANDOFF.md` updated
- [ ] Next-agent prompt generated and references `docs/NEXT_AGENT_HANDOFF.md`
