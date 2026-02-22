# Next Agent Handoff

Last updated: 2026-02-22

## Latest Run Summary

- **Branch**: `feature/server-components-new-species` (PR to main, open)
- **Tasks completed**:
  1. **Server component audit & conversions**: Audited ~53 client components. Converted 2 to server components (SafetyIcon.tsx, QRCodeGenerator.tsx — removed unnecessary `"use client"` directives). Analyzed and justifiably skipped SafetyBadge (uses `useTranslations`), TreeTags (uses onClick), and ~49 others that require genuine client interactivity.
  2. **6 new species added** (169 → 175): pochote-de-agua, canelo, cedro-macho, copal, sota, guacimo-molenillo — all with full bilingual EN+ES content, complete frontmatter (including 13 safety fields + care/cultivation fields), standardized body sections, and iNaturalist embeds.
- **Key files changed**:
  - `src/components/safety/SafetyIcon.tsx` — removed `"use client"`
  - `src/components/field-guide/QRCodeGenerator.tsx` — removed `"use client"`
  - 12 new MDX files: `content/trees/{en,es}/{pochote-de-agua,canelo,cedro-macho,copal,sota,guacimo-molenillo}.mdx`
  - `docs/IMPLEMENTATION_PLAN.md` — updated species/care counts to 175
  - `docs/MISSING_SPECIES_LIST.md` — added 6 new species to recently added section
  - `docs/NEXT_AGENT_HANDOFF.md` — this file
- **Verification**: Lint 0 errors (267 pre-existing warnings), build successful, 175 EN + 175 ES species confirmed.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                                                                                                                                                                                                                                       |
| -------- | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1     | Species content      | 175/175 (100%) ✅    | 175+ target achieved. Can continue expanding with more species.                                                                                                                                                                                                                                                                             |
| P1.3     | Care guidance        | 175/175 (100%) ✅    | Complete — all species include cultivation/care sections                                                                                                                                                                                                                                                                                    |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after new species additions                                                                                                                                                                                                                                                                                                         |
| P2       | Performance Phase 3  | 🟡 Nearly complete   | 17 server component conversions total (15 prior + 2 this run) + 3 dead code deletions. Edge caching implemented. Partial hydration implemented (6 components). Progressive enhancement implemented. MDX client components code-split (8 files). Remaining: database query optimization. ~51 client components retain genuine interactivity. |
| P4       | Community features   | 🔲 Not started       | Now unblocked — user contributions, ratings                                                                                                                                                                                                                                                                                                 |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                                                                                                                                                                                                                                            |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                                                                                                                                                                                                                                    |

**Recommended next task**: Top candidates: (1) Community features (P4, now unblocked — user photo uploads, contribution workflow), (2) Lighthouse performance improvements (current: 48/100, target: 90/100), (3) Database query optimization (requires active DB in production), (4) Continue species expansion beyond 175 if more Costa Rican species are identified.

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
- Performance Phase 3: 17 server component conversions done, edge caching implemented,
  partial hydration implemented (6 heavy components dynamically imported), progressive enhancement
  implemented (noscript fallbacks on key pages), MDX client components code-split (8 individual files).
  Remaining ~51 client components retain genuine client-side interactivity.
- Species content: 175/175 (100%) — 175+ target achieved. Can continue expanding.
- Next recommended tasks (pick one or more):
  1. Start community features (P4) — user photo uploads, contribution workflow
  2. Lighthouse performance improvements (current: 48/100, target: 90/100)
  3. Optimize database queries for admin features (requires active DB in production)
  4. Continue species expansion beyond 175 if more Costa Rican species are identified
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
