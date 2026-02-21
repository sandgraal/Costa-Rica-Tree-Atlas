# Next Agent Handoff

Last updated: 2026-02-20

## Latest Run Summary

- **Branch**: `feature/server-component-conversions-phase3c` (PR to main, open)
- **Task completed**: Performance Phase 3 (P2) continued -- server component conversions batch 3.
- **Key changes**:
  - `Header.tsx` (119 lines): Converted from client to async server component. Replaced `useTranslations`/`useLocale` with `getTranslations`/`getLocale`. All interactive children (LanguageSwitcher, ThemeToggle, QuickSearch, MobileNav, FavoritesLink) remain client components rendered as islands. High-impact: Header renders on every page.
  - `SafetyWarning.tsx` (76 lines): Converted from client to async server component. Replaced `useTranslations` with `getTranslations`. Only imported by SafetyCard (already a server component).
  - `TreeOfTheDay.tsx` (125 lines): Removed `"use client"` directive and `React.memo` wrapper. No hooks used, pure render function with SafeImage client child.
  - `page.tsx` (homepage): Replaced `dynamic()` import of TreeOfTheDay with direct import (server components don't need client-side code splitting). Removed unused `memo` and `Suspense` imports. Removed `memo` wrapper from `HeroContent` (pointless in a server component).
  - `SafetyCard.tsx` (327 lines): Converted from client to async server component — replaced `useTranslations` with `getTranslations`, removed `"use client"`. Imported directly by tree detail server page, so client hydration cost eliminated entirely.
  - `SafetyDisclaimer.tsx`: Converted from client to async server component — same `useTranslations` → `getTranslations` refactor.
  - `Breadcrumbs.tsx`: Converted from client to server component — replaced `usePathname()` with `pathname` prop passed from server pages, removed `useMemo`. Updated 2 call sites.
  - `SafetyIcon.tsx`: Kept as client component — still imported by client components `SafetyPageClient` and `TreeCard`; conversion blocked until call sites are refactored.
  - `QRCodeGenerator.tsx`: Kept as client component — still imported by client component `FieldGuidePreview`; conversion blocked until call site is refactored.
  - `SafetyDisclaimer.tsx`: Fixed barrel issue — removed server-only export from `safety/index.ts`; updated `trees/[slug]/page.tsx` to import directly.
  - Deleted 3 unused components: `StreamingWrapper.tsx` (0 imports), `ProgressiveImage.tsx` (0 imports), `ResponsiveImage.tsx` (0 imports, only barrel re-export).
  - Updated barrel export (`components/index.ts`) to remove dead re-export.
- **Updated tracking docs**: This handoff file, `docs/PERFORMANCE_OPTIMIZATION.md` (Phase 3 checklist), `docs/IMPLEMENTATION_PLAN.md` (Phase 3 items).
- **Verification**: lint 0 errors (pre-existing warnings only), build successful, 23/23 SafetyBadge tests pass.
- **Total server component conversions to date**: 15 components converted + 3 dead code deleted.
- **Remaining client components**: ~53 (many require hooks/interactivity and cannot be converted).

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md`:

| Priority | Task                 | Status               | Notes                                                                                                                                                                                                                                                                                                                             |
| -------- | -------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1.1     | Species content      | 169/169 (100%) ✅    | All species from MISSING_SPECIES_LIST.md complete. Target 175+ by identifying new species.                                                                                                                                                                                                                                        |
| P1.3     | Care guidance        | 169/169 (100%) ✅    | Complete                                                                                                                                                                                                                                                                                                                          |
| P1.4     | Short pages          | 0 under threshold ✅ | Monitor after new species additions                                                                                                                                                                                                                                                                                               |
| P2       | Performance Phase 3  | 🟡 In progress       | 8 server component conversions done (Footer, CurrentYear, FeaturedTrees, SafeJsonLd, HeroImage, SafetyCard, SafetyDisclaimer, Breadcrumbs). Deleted 3 dead components. SafetyIcon/QRCodeGenerator blocked (imported by client components). Remaining: ~55 client components, partial hydration, progressive enhancement, edge caching |
| P4       | Community features   | 🔲 Not started       | Now unblocked — user contributions, ratings                                                                                                                                                                                                                                                                                       |
| P5.1     | Indigenous knowledge | 🔲 Not started       | Requires community collaboration                                                                                                                                                                                                                                                                                                  |
| P5.2     | Glossary expansion   | 150/150 (100%) ✅    | Complete                                                                                                                                                                                                                                                                                                                          |

**Recommended next task**: Most easy server component conversions (useTranslations-only) have been completed. The ~53 remaining client components genuinely require client-side hooks (useState, useEffect, useCallback, useStore, etc.) or event handlers. Next recommended focus areas: (1) Implement partial hydration for large client components like TreeExplorer, (2) Add progressive enhancement patterns, (3) Implement edge caching strategies, (4) Or add new species toward the 175+ target.

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
- Performance Phase 3: server component conversions largely complete (15 done).
  Remaining ~53 client components require genuine client-side interactivity.
- Next recommended tasks (pick one or more):
  1. Implement partial hydration for heavy client components (TreeExplorer, TreeComparison, SeasonalCalendar)
  2. Add progressive enhancement patterns (graceful degradation without JS)
  3. Implement edge caching strategies for tree pages
  4. Optimize database queries for admin features
  5. Add new species toward 175+ target
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
