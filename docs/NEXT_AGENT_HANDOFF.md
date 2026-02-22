# Next Agent Handoff

Last updated: 2026-02-21

## Latest Run Summary

- **Branch**: `fix/missing-client-translation-namespaces` (PR to main, pending)
- **Tasks completed**:
  1. **Fix missing client translation namespaces**: After the root layout was optimized to ship only global client namespaces (`nav`, `theme`, `language`, `safety`, `glossary`, `api`), three pages with client components using page-specific namespaces lost their translations.
     - `contribute/photo/page.tsx` — wraps `PhotoUploadClient` with scoped `NextIntlClientProvider` supplying `contribute` namespace.
     - `identify/page.tsx` — wraps `IdentifyClient` with scoped `NextIntlClientProvider` supplying `identify` namespace.
     - `images/vote/page.tsx` — wraps `VotingClient` with scoped `NextIntlClientProvider` supplying `imageVoting` namespace.
  2. **Full audit**: Confirmed all 13 `useTranslations` call sites are covered — 6 global namespaces in root layout, 3 page-scoped providers (fixed here), 4 server components using `useTranslations` server-side (no provider needed).
- **Key files changed**:
  - `src/app/[locale]/contribute/photo/page.tsx` — scoped NextIntlClientProvider for `contribute`
  - `src/app/[locale]/identify/page.tsx` — scoped NextIntlClientProvider for `identify`
  - `src/app/[locale]/images/vote/page.tsx` — scoped NextIntlClientProvider for `imageVoting`
  - `docs/NEXT_AGENT_HANDOFF.md` — this file
- **Verification**: Lint 0 errors (268 pre-existing warnings), build successful.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                                                                                                                                                                                                                                      |
| -------- | -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1.1     | Species content      | 175/175 (100%) ✅    | 175+ target achieved. Can continue expanding with more species.                                                                                                                                                                                                                                                                            |
| P1.3     | Care guidance        | 175/175 (100%) ✅    | Complete — all species include cultivation/care sections                                                                                                                                                                                                                                                                                   |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after new species additions                                                                                                                                                                                                                                                                                                        |
| P2       | Performance          | 🟡 In progress       | JS bundle: removed ~70-90KB from every page (React Query global, StoreProvider, translation payload). Hero AVIF: 47-64% smaller. Preload/picture mismatch fixed. Logo priority contention fixed. Remaining: measure post-deploy Lighthouse score, further bundle optimization if needed, database query optimization (requires active DB). |
| P4       | Community features   | 🔲 Not started       | Now unblocked — user contributions, ratings                                                                                                                                                                                                                                                                                                |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                                                                                                                                                                                                                                           |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                                                                                                                                                                                                                                   |

**Recommended next task**: Top candidates: (1) Measure post-deploy Lighthouse score to validate improvements and identify remaining bottlenecks, (2) Community features (P4, now unblocked — user photo uploads, contribution workflow), (3) Further bundle size analysis with `@next/bundle-analyzer` to find remaining heavy imports, (4) Database query optimization (requires active DB in production), (5) Continue species expansion beyond 175 if more Costa Rican species are identified.

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
- Performance (P2): JS bundle reduced (~70-90KB removed from every page), hero AVIF
  re-encoded (47-64% smaller), preload/picture mismatch fixed, logo priority contention
  resolved. Missing page-scoped i18n namespaces fixed (contribute, identify, imageVoting).
  Lighthouse score improvement pending post-deploy measurement (baseline 48/100,
  target 90/100). ~51 client components retain genuine client-side interactivity.
- Species content: 175/175 (100%) — 175+ target achieved. Can continue expanding.
- Next recommended tasks (pick one or more):
  1. Measure post-deploy Lighthouse and identify remaining bottlenecks
  2. Run @next/bundle-analyzer to find heavy imports for further tree-shaking
  3. Start community features (P4) — user photo uploads, contribution workflow
  4. Optimize database queries for admin features (requires active DB in production)
  5. Continue species expansion beyond 175 if more Costa Rican species are identified
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
