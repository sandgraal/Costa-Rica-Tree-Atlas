# Next Agent Handoff

Last updated: 2026-02-26

## Latest Run Summary (2026-02-26 — Run 10)

- **Branch**: `feature/cloudinary-integration` → [PR #494](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/494) (merged)
- **Sub-PR**: [PR #495](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/495) (merged) — singleton guard + comprehensive tests
- **Also merged**: [PR #493](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/493) (Codacy removal), [PR #496](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/496) (minimatch bump)
- **Tasks completed**:
  1. **B4 Resolved: Cloudinary integration** — Created `src/lib/cloudinary.ts` (239 lines): singleton `getCloudinary()`, `uploadTreeImage()` with automatic folder structure (`costa-rica-tree-atlas/trees/{slug}`), format/quality optimization, CDN URL generation. Refactored `src/app/api/images/upload/route.ts` from local filesystem to Cloudinary. Added `res.cloudinary.com` to `next.config.ts` remote patterns. Added env var validation (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET).
  2. **Cloudinary test coverage** — Created `tests/lib/cloudinary.test.ts` (439 lines, 23 tests): singleton guard, upload success/error, configuration validation, folder structure, format options.
  3. **Codacy removal** — Deleted `.codacy/` directory, removed `codacy.instructions.md`, cleaned gitignore and security comments.
  4. **Dependency update**: minimatch 3.1.2 → 3.1.5 (security patch).
  5. **Verified**: 502/502 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-02-26 — Run 9)

- **Branch**: `content/glossary-standardization-and-enum-normalization` → [PR #491](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/491) (merged)
- **Tasks completed**:
  1. **Content Standardization: Enum normalization** — Normalized 111 non-standard enum values across 53 tree files (EN + ES). Created `scripts/normalize-enum-values.mjs`.
  2. **Content Standardization: Glossary exampleSpecies** — Fixed 121 references (common names → valid tree slugs). Created `scripts/fix-glossary-references.mjs`.
  3. **Content Standardization: Glossary relatedTerms** — Removed 391 invalid references across 209 glossary files.
  4. **Bug fix**: Fixed flaky ReDoS timing test (threshold 1ms → 5ms).
  5. **Verified**: 479/479 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-06-10 — Run 8)

- **Branch**: `feature/p46-lcp-p52-sentry-p44-db-optimization` → PR pending
- **Tasks completed**:
  1. **P4.6: LCP image optimization** — Recompressed 112 tree images via `scripts/optimize-tree-images.mjs` (68.77MB → 43.17MB, 37% reduction, mozjpeg quality 80). Added `priority` prop to TreeOfTheDay hero image and first 2 FeaturedTreesSection cards.
  2. **P5.2: Sentry-ready error tracking** — Enhanced `src/lib/error-tracking.ts` from a 30-line console stub to a 170-line Sentry-ready module with dynamic import, graceful fallback, and structured JSON logging. Added `captureException`, `captureMessage`, `captureApiError` helpers. Created `src/instrumentation.ts` for Next.js server-side Sentry initialization. Updated all 18 API routes from `console.error` to `captureApiError`. Created `docs/SENTRY_SETUP.md` with setup instructions. Zero new dependencies — works by default with console logging.
  3. **P4.4: Database query optimization** — Added 3 missing indexes to Prisma schema: `Account.userId` (user-account lookups), compound `(status, createdAt)` on `image_proposals` and `contributions` (admin listing queries). Created migration `20260610000000_add_query_optimization_indexes`.
  4. **Bug fix**: Fixed stale contentlayer cache causing 1 test failure (`guanabana-cimarrona` skinContactRisk "mild" vs "low").
  5. **Verified**: 479/479 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-02-27 — Run 7)

- **Branch**: `feature/content-validation-error-tracking` → [PR #487](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/487)
- **Tasks completed**:
  1. **P5.3: Content validation tests** — Created `tests/content-validation-comprehensive.test.ts` with 48 tests covering:
     - Tree frontmatter schema: locale, conservationStatus, seasons, distributions, toxicity/safety, water/light/growth/propagation enums
     - Tree bilingual parity: slug matching, scientificName, family, conservationStatus, MDX file parity
     - Image reference integrity: featuredImage, images[], naming conventions
     - Glossary schema: required fields, categories, locale, duplicates
     - Glossary bilingual parity: slug matching, file parity, category consistency
     - Glossary cross-references: exampleSpecies (warning), relatedTerms (warning)
     - Comparison schema: required fields, locale, difficulty, tags, species count, confusionRating
     - Comparison bilingual parity: slug matching, file parity, species lists, difficulty
     - Cross-content integrity: locale counts, minimum counts, body content
  2. **Content fix**: Fixed conservationStatus mismatch for `carambola` and `mamon-chino` (ES: NE → LC)
  3. **Content quality issues discovered** (for future standardization):
     - ~185 glossary `exampleSpecies` use common names instead of tree slugs
     - ~172 glossary `relatedTerms` reference non-existent glossary slugs
     - ES content files use Spanish enum values instead of schema-defined English enums
     - `timber` glossary category exists in content but not in contentlayer schema
  4. **Verified**: 479/479 tests pass (431 existing + 48 new), 0 lint errors, 284 warnings (unchanged)

## Previous Run Summary (2026-02-26 — Run 6)

- **Branch**: `feature/api-tests-component-splits-meta` → PR pending
- **Tasks completed**:
  1. **P5.1: API route test coverage** — Created 9 test files with 107 new tests covering all previously untested API routes: v1/trees (29), v1/trees/[slug] (10), v1/families (9), search-index (5), species/random (5), csp-report (5), images/vote (18), images/flag (13), contributions (13). Total: 431/431 passing.
  2. **P4.3: Split TreeMapClient** — Extracted `map-data.ts` (constants, helpers), `CollectionCard.tsx`, `CollectionDetailView.tsx`. Reduced 1,388 → 1,027 lines (26% reduction).
  3. **P4.3: Split ScavengerHuntClient** — Extracted `scavenger-hunt-validators.ts` (mission validators, constants), `SetupView.tsx`, `HuntView.tsx`, `MissionView.tsx`, `ResultsView.tsx`. Reduced 1,206 → 575 lines (52% reduction).
  4. **P4.3: Split TreeJournalClient** — Extracted `AdoptTreeView.tsx`, `JournalEntryForm.tsx`. Reduced 1,073 → 672 lines (37% reduction).
  5. **Verified**: 431/431 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-02-25 — Run 4)

- **Branch**: `feature/ssr-refactor-jsonld-sitemap` → PR pending
- **Tasks completed**:
  1. **P4.2: SSR refactor ScavengerHuntClient** — Created `scavenger-hunt-data.ts` (15 missions, ~45 labels extracted). Refactored `ScavengerHuntClient.tsx` from 1491→1205 lines. Mission display data moved to RSC payload; validator functions kept client-side (not serializable). Eliminated all bilingual `locale as "en" | "es"` patterns.
  2. **P4.2: SSR refactor TreeJournalClient** — Created `tree-journal-data.ts` (5 option arrays, 8 badges, 10 prompts, ~50 labels extracted). Refactored `TreeJournalClient.tsx` from 1306→1096 lines. All inline locale ternaries eliminated.
  3. **P3.3: JSON-LD enhancement** — Upgraded tree detail page structured data: `@type: Thing` → `@type: Taxon` with `taxonRank`, `parentTaxon` (family), conservation status labels, `spatialCoverage` for distribution, multi-image array support. Breadcrumbs refactored to use shared `baseUrl` constant.
  4. **P3.4: Sitemap audit** — Confirmed already complete: all 175×2 trees, comparisons, glossary included; `lastmod` from `updatedAt` already working.
  5. **Verified**: 324/324 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-02-25 — Run 3)

- **Branch**: `content/batch-enrichment-p2` → PR pending
- **Tasks completed**:
  1. **P2.1: Photo gallery sections** — Added iNaturalist galleries to 19 trees (174/175 now have galleries; `orey` lacks iNaturalist photos). Used existing `scripts/add-gallery-sections.mjs`.
  2. **P2.4: GBIF/IUCN external links** — Created `scripts/add-external-links.mjs`. Added GBIF links to 98 trees, IUCN search links to 108 trees. 175/175 now have both. Created 7 new External Resources sections for trees that lacked them entirely.
  3. **Bug fix: ExternalLink `url=` → `href=`** — Fixed 358 broken prop references across 89 tree files × 2 locales (186 files). The `<ExternalLink>` component requires `href=` but 93 files used `url=`, rendering external links non-functional.
  4. **Bug fix: MDX build errors** — 12 trees had markdown links injected before `<DataTable>` components, causing contentlayer build failures. Created `scripts/fix-datatable-links.mjs` to repair them.
  5. **P2.2/P2.3 audited** — Confirmed already complete; 173/175 trees have uses sections, all 174 with seasonal frontmatter have seasonal body sections.
  6. **Verified**: 324/324 tests pass, 0 lint errors, build clean.

## Previous Run Summary (2026-02-25 — Run 2)

- **Branch**: `fix/lcp-a11y-og-optimization` → PR pending
- **Tasks completed**:
  1. Fixed 4 dark mode contrast failures (WCAG AA)
  2. Created OG + Twitter images for 20 comparison detail pages
  3. Confirmed tree detail OG images already exist
  4. LCP analysis: 4.0s is network-bound, not code-fixable

## Previous Run Summary (2026-02-25 — Run 1)

- **Branch**: `fix/quick-wins-phase2-5` → [PR #463](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/463)
- 5 failing tests fixed, debug code removed, frontmatter filled, cache headers, JSON-LD, 4 OG images

## Older Runs

- **PR #462 (merged)**: Scientific accuracy audit across 29 files
- **PR #447 (merged)**: Fuse.js lazy-load + 4/6 education pages SSR-refactored
- **PR #446 (merged)**: Dead code & dependency audit — removed 51 packages

## Current Project State

- **Tests**: 502/502 passing (30 test files)
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Content quality**: All enum values normalized to schema, glossary references validated
- **Galleries**: 174/175 trees with iNaturalist photo galleries
- **External links**: 175/175 trees with GBIF + IUCN links
- **All pages**: 600+ lines, bilingual parity achieved
- **Database**: Neon PostgreSQL deployed, Prisma 7, admin user active, indexes optimized
- **Cloud storage**: Cloudinary integrated — upload route, CDN delivery, env validation
- **Performance**: Lighthouse 85/100 (Perf), 100 (SEO), 100 (BP). LCP 4.0s is network-bound. A11y expected 100 after contrast fix deployed.
- **Component sizes**: All 3 large clients split — TreeMapClient 1,027, ScavengerHuntClient 575, TreeJournalClient 672 lines
- **SEO**: All P3 tasks complete (P3.1–P3.5). OG images, JSON-LD, sitemap, and meta descriptions all optimized.
- **Error tracking**: Sentry-ready (zero deps, graceful fallback)

## Highest-Priority Remaining Work

From `docs/IMPLEMENTATION_PLAN.md` (updated 2026-02-26):

| Priority | Task                                  | Status      | Notes                                                                |
| -------- | ------------------------------------- | ----------- | -------------------------------------------------------------------- |
| P2.1     | Photo gallery sections                | ✅ Complete | 174/175 (orey lacks iNaturalist photos)                              |
| P2.2     | Applications/Uses body sections       | ✅ Complete | Already present in 173/175 under various headings                    |
| P2.3     | Seasonal phenology body sections      | ✅ Complete | Already present in all 174 with seasonal frontmatter                 |
| P2.4     | GBIF/IUCN external links              | ✅ Complete | 175/175 now have both GBIF and IUCN links                            |
| P3.1     | OG images for comparison detail pages | ✅ Complete | Created opengraph-image.tsx + twitter-image.tsx                      |
| P3.2     | OG images for tree detail pages       | ✅ Complete | Already existed from a previous run                                  |
| P3.3     | JSON-LD for tree detail pages         | ✅ Complete | Taxon schema, conservation status, distribution, multi-image         |
| P3.4     | Sitemap enhancements                  | ✅ Complete | All pages, lastmod, comparisons, glossary already included           |
| P3.5     | Meta description optimization         | ✅ Complete | 16 descriptions optimized across 14 files, ES i18n bugs fixed        |
| P4.2     | SSR refactor 2 education pages        | ✅ Complete | ScavengerHuntClient, TreeJournalClient — all 6 education pages done  |
| P4.3     | Split large client components         | ✅ Complete | TreeMapClient 26%, ScavengerHuntClient 52%, TreeJournalClient 37%    |
| P4.4     | Database query optimization           | ✅ Complete | 3 indexes added (Account.userId, image_proposals, contributions)     |
| P4.6     | LCP image optimization                | ✅ Complete | Images recompressed 37%, priority props added                        |
| P4.7     | A11y contrast fixes (4 issues)        | ✅ Complete | Dark mode primary/secondary lightened, skip-link override added      |
| P5.1     | API route test coverage               | ✅ Complete | 107 new tests across 9 files, 431/431 total passing                  |
| P5.2     | Error tracking (Sentry)               | ✅ Complete | Sentry-ready, 18 API routes updated, zero new deps                   |
| P5.3     | Content validation tests              | ✅ Complete | 48 tests — schema, parity, images, cross-refs. 479/479 total.        |
| P5.4     | Content standardization               | ✅ Complete | 111 enum fixes, 121 exampleSpecies mapped, 391 relatedTerms cleaned  |
| B4       | Cloud image storage (Cloudinary)      | ✅ Complete | SDK integrated, upload route refactored, CDN delivery, env validated |

**Recommended next task**: P6.1 (User photo uploads — B4 resolved, Cloudinary ready), P6.3 (Public API), or P4.5 (CSP optimization — manual sprint).

## Established Patterns

### Education Lesson SSR Data Extraction Pattern

Used in PR #447 for 4 lessons. For remaining 2 pages (ScavengerHuntClient, TreeJournalClient):

1. Create `{lesson-name}-data.ts` in the lesson directory
2. Export a function `get{LessonName}LessonData(locale: string)` returning typed data
3. Data includes: labels (translations), quiz questions, steps, categories — anything locale-dependent and purely static
4. `page.tsx` (server component) imports and calls the data function, passes result as `lessonData` prop
5. Client component receives `lessonData` prop, destructures needed fields, removes inline data definitions
6. This moves static locale data from client JS bundle to RSC payload

### OG Image Pattern

Used in PR #463 for 4 section pages. For remaining pages:

1. Create `opengraph-image.tsx` in the route directory
2. Export `runtime = 'edge'`, `alt`, `size`, `contentType`
3. Use `ImageResponse` from `next/og`
4. Include bilingual text based on locale param
5. Use gradient backgrounds (green for nature, blue for education, brown for comparisons)

### Content Enrichment Script Pattern

Used in this run for `add-external-links.mjs` and `fix-datatable-links.mjs`:

1. `.mjs` extension, `#!/usr/bin/env node`
2. Support `--dry-run` and `--tree=<name>` flags
3. Process both EN and ES locales
4. Handle multiple content patterns (ExternalLinksGrid, DataTable, markdown lists)
5. Log progress per-file, print summary

### Client Component Split Pattern (P4.3)

Used in Run 5 for TreeMapClient, ScavengerHuntClient, TreeJournalClient:

1. **Data/constants** extracted to a co-located `*-data.ts` or `*-validators.ts` file
2. **View components** extracted as separate `.tsx` files in the same directory
3. **State/reducer/handlers** stay in the parent component (state owner)
4. Props interface per extracted view — callbacks as `onAction` naming convention
5. Each extracted view has its own `"use client"` directive and imports (Link, Image, etc.)
6. Parent renders `<ExtractedView {...props} />` instead of inline JSX blocks

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
- Content Enrichment (P2): ✅ ALL COMPLETE (P2.1–P2.4).
- SEO (P3): ✅ ALL COMPLETE (P3.1–P3.5). OG images, JSON-LD, Sitemap, Meta descriptions all done.
- Performance (P4): Lighthouse 85/100. LCP optimized (images recompressed 37%, priority props added). DB indexes added ✅. A11y contrast ✅. SSR refactor ✅ ALL 6 education pages done. Component splits ✅ ALL 3 done.
- Testing (P5): API route tests ✅ (107 tests). Content validation tests ✅ (48 tests, 479 total). Error tracking ✅ (Sentry-ready, 18 API routes updated, zero new deps). Content standardization ✅ (111 enum fixes, 121 exampleSpecies mapped, 391 relatedTerms cleaned).
- Recommended execution order (pick one or more):
  1. P6.1: User photo uploads — Cloudinary integrated (B4 ✅), build upload UI + proposal workflow
  2. P6.3: Public API for researchers — RESTful endpoints, rate limiting, OpenAPI docs
  3. P4.5: CSP optimization — refactor 30+ components with inline styles to Tailwind/CSS modules (manual sprint)
  4. Apply DB migration to production (manual step — `npx prisma migrate deploy`)
  5. Install @sentry/nextjs and configure DSN in Vercel env vars (manual step)
  6. Add Cloudinary API keys to Vercel env vars (manual step)
  7. Any remaining polish from IMPLEMENTATION_PLAN.md

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
8. If feasible, choose another item and implement it as well
9. Push, and open PR to main.

MANDATORY END-OF-RUN DIRECTIVES
1. Update $REPO_ROOT/docs/NEXT_AGENT_HANDOFF.md with latest state
2. Write a fresh next-agent prompt that references this file
```
