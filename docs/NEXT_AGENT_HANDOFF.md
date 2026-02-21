# Next Agent Handoff

Last updated: 2026-02-21

## Latest Run Summary

- **Branch**: `feature/edge-caching-progressive-enhancement` (PR #424 to main, open)
- **Task completed**: Performance Phase 3 continued — edge caching architecture fix + component optimization.
- **Key changes**:
  - **Edge caching architecture fix**: Removed `headers()` call from root layout that was forcing ALL pages to be dynamically rendered, preventing any Vercel CDN edge caching. The layout read an `X-Nonce` header for CSP nonces on the inline theme script.
  - **External theme script**: Replaced inline `<script nonce={nonce} dangerouslySetInnerHTML={{__html: THEME_SCRIPT}}>` with external `<script src="/theme-init.js" />`. CSP `'self'` directive allows it without a nonce.
  - **Cache headers**: Fixed middleware from `no-cache, no-store` to `public, s-maxage=86400, stale-while-revalidate=604800` for MDX pages. Added matching headers in `next.config.ts` for 9 public routes.
  - **Auth page isolation**: Added `export const dynamic = 'force-dynamic'` to 9 auth-dependent pages that require runtime session access.
  - **ImageLightbox extraction**: Split `TreeGallery` — extracted `ImageLightbox` into its own client component to reduce JS bundle on pages that only need the gallery grid.
  - **CompareInToolButton bug fix**: `species` prop now accepts `string | string[]` with null guard (latent bug exposed by static pre-rendering when MDX security plugin strips array expressions).
- **Updated tracking docs**: This handoff file, `docs/PERFORMANCE_OPTIMIZATION.md` (Phase 3 checklist — edge caching marked complete).
- **Verification**: lint 0 errors, build successful (1465/1465 static pages generated), PR #424 created.
- **Impact**: 1465 static pages now eligible for Vercel CDN edge caching (24h TTL, 7d SWR). Previously 0 pages were edge-cached.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                                                                                                                         |
| -------- | -------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1     | Species content      | 169/169 (100%) ✅    | All species from MISSING_SPECIES_LIST.md complete. Target 175+ by identifying new species.                                                                                                                                    |
| P1.3     | Care guidance        | 169/169 (100%) ✅    | Complete                                                                                                                                                                                                                      |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after new species additions                                                                                                                                                                                           |
| P2       | Performance Phase 3  | 🟡 In progress       | 15 server component conversions + 3 dead code deletions done. Edge caching implemented. Remaining: partial hydration, progressive enhancement, database query optimization. ~53 client components need genuine interactivity. |
| P4       | Community features   | 🔲 Not started       | Now unblocked — user contributions, ratings                                                                                                                                                                                   |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                                                                                                                              |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                                                                                                                      |

**Recommended next task**: Edge caching is now implemented. Remaining performance work: (1) Implement partial hydration for heavy client components (TreeExplorer, TreeComparison, SeasonalCalendar), (2) Add progressive enhancement patterns (graceful degradation without JS), (3) Optimize database queries for admin features. Alternatively, add new species toward 175+ target.

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
- Performance Phase 3: server component conversions complete (15 done), edge caching implemented (PR #424).
  Remaining ~53 client components require genuine client-side interactivity.
- Next recommended tasks (pick one or more):
  1. Implement partial hydration for heavy client components (TreeExplorer, TreeComparison, SeasonalCalendar)
  2. Add progressive enhancement patterns (graceful degradation without JS)
  3. Optimize database queries for admin features
  4. Add new species toward 175+ target
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
