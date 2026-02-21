# Next Agent Handoff

Last updated: 2026-02-20

## Latest Run Summary

- **Branch**: `feature/server-component-conversions-phase3b` → PR to main (open)
- **Task completed**: Performance Phase 3 (P2) — continued server component conversions, removed dead code.
- **Key changes**:
  - `SafetyCard.tsx` (327 lines): Converted from client to async server component — replaced `useTranslations` with `getTranslations`, removed `"use client"`. Imported directly by tree detail server page, so client hydration cost eliminated entirely.
  - `SafetyDisclaimer.tsx`: Converted from client to async server component — same `useTranslations` → `getTranslations` refactor.
  - `Breadcrumbs.tsx`: Converted from client to server component — replaced `usePathname()` with `pathname` prop passed from server pages, removed `useMemo`. Updated 2 call sites.
  - `SafetyIcon.tsx`: Removed `"use client"` (pure render logic, no hooks).
  - `QRCodeGenerator.tsx`: Removed `"use client"` (pure Image wrapper, no hooks).
  - Deleted 3 unused components: `StreamingWrapper.tsx` (0 imports), `ProgressiveImage.tsx` (0 imports), `ResponsiveImage.tsx` (0 imports, only barrel re-export).
  - Updated barrel export (`components/index.ts`) to remove dead re-export.
- **Updated tracking docs**: This handoff file, `docs/PERFORMANCE_OPTIMIZATION.md` (Phase 3 checklist), `docs/IMPLEMENTATION_PLAN.md` (Phase 3 items).
- **Verification**: lint 0 errors (pre-existing warnings only), build successful, 23/23 SafetyBadge tests pass.

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                                                                                                                                                                             |
| -------- | -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1     | Species content      | 169/169 (100%) ✅    | All species from MISSING_SPECIES_LIST.md complete. Target 175+ by identifying new species.                                                                                                                                                                                        |
| P1.3     | Care guidance        | 169/169 (100%) ✅    | Complete                                                                                                                                                                                                                                                                          |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after new species additions                                                                                                                                                                                                                                               |
| P2       | Performance Phase 3  | 🟡 In progress       | 12 server component conversions done (Footer, CurrentYear, FeaturedTrees, SafeJsonLd, HeroImage, SafetyCard, SafetyDisclaimer, Breadcrumbs, SafetyIcon, QRCode + 3 dead code deleted). Remaining: ~55 client components, partial hydration, progressive enhancement, edge caching |
| P4       | Community features   | 🔲 Not started       | Now unblocked — user contributions, ratings                                                                                                                                                                                                                                       |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                                                                                                                                                                                  |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                                                                                                                                                                          |

**Recommended next task**: Continue Performance Phase 3 — pursue further server component conversions among the ~55 remaining client components. Focus on components imported directly by server pages where conversion yields real JS bundle savings. Good candidates: components that only use `useTranslations` (refactor to `getTranslations`). Alternatively, begin Performance Phase 3 items: partial hydration, progressive enhancement, edge caching. Or add new species toward 175+ target.

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
- Continue Performance Phase 3: convert more client components to server components where feasible.
- Focus on components imported by server pages where useTranslations → getTranslations conversion eliminates client JS.
- ~55 client components remain; many use only useTranslations and could be refactored.
- Alternatively, pursue partial hydration, progressive enhancement, or edge caching items.
- Or add new species toward the 175+ target.
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
