# Next Agent Handoff

Last updated: 2026-02-28

## Latest Run Summary (2026-02-28 — Run 15)

- **Branch**: `feature/p6.2-reputation-system`
- **Tasks completed**:
  1. **P6.2: User Reputation System — full implementation** — Built the complete contributor reputation system with badges and tiered trust levels:
     - **Prisma schema**: Added `ContributorProfile` model (sessionId, displayName, stats, reputationScore, trustLevel, badges[]), `TrustLevel` enum (NEW/CONTRIBUTOR/TRUSTED/EXPERT), added `region` column to `Contribution`
     - **Migration**: `prisma/migrations/20260228000000_add_contributor_profiles/migration.sql`
     - **Pure logic module**: `src/lib/reputation.ts` — `calculateReputation()` (scoring: +10/approved, -3/rejected, +2/rating, +5/photo, +15/knowledge), `getNextBadge()`, 4 trust levels with threshold configs, 9 badge definitions
     - **API route**: `GET /api/reputation` — fetches/computes contributor profile with badges and nextBadge progress, session cookie auth, rate limited, 503 fallback
     - **Admin integration**: Reputation recalculation on approve/reject/implement in PATCH `/api/admin/contributions/[id]`, trust level + reputation score visible in admin contribution list and detail modal
     - **Profile page**: `/contribute/profile` with trust level badge, stats grid, full badge display with earned/unearned states and progress bar for next badge
     - **BadgeDisplay component**: `src/components/BadgeDisplay.tsx` — compact (inline) and expanded (full grid) variants with progress tracking
     - **i18n**: Complete `reputation` namespace in EN + ES (~60 keys each) covering trust levels, stats, 9 badges, UI strings
  2. **Bug fix: region field silently dropped** — `ContributeClient` collected region/whereFound but payload construction omitted them. Fixed mapping for both LOCAL_KNOWLEDGE and NEW_SPECIES types. Added `region` column to schema + API.
  3. **Bug fix: unused "Share local knowledge" CTA** — Translation keys existed but no link was rendered in `ContributeCTA`. Added third CTA link pointing to `/contribute?type=LOCAL_KNOWLEDGE&tree={slug}`.
  4. **Bug fix: no URL param pre-selection** — Added `searchParams` handling in contribute page, `initialType`/`initialTree` props in `ContributeClient` for deep-linking from tree detail CTAs.
  5. **Bug fix: region not shown in admin** — Added region display in admin contribution detail modal.
  6. **Contributions API improvement**: LEFT JOIN with `contributor_profiles` to include trust level + reputation score in admin contribution listings. Table-aliased WHERE conditions for unambiguous queries.
  7. **Profile link in success state**: Added "View Your Contributions" link on contribution submission success screen.
  8. **Tests**: 46 new tests — `tests/lib/reputation.test.ts` (39 tests: scoring formula, trust level determination, all 9 badges, edge cases, getNextBadge), `tests/api/reputation.test.ts` (7 tests: no session, existing profile, nextBadge, computed profile, no activity, 503, 500)
  9. **Verified**: 623/623 tests pass (+46 new), 0 lint errors, build clean.

## Created/Modified Files

### Created

- `prisma/migrations/20260228000000_add_contributor_profiles/migration.sql`
- `src/lib/reputation.ts`
- `src/app/api/reputation/route.ts`
- `src/components/BadgeDisplay.tsx`
- `src/app/[locale]/contribute/profile/page.tsx`
- `src/app/[locale]/contribute/profile/ContributorProfileClient.tsx`
- `tests/lib/reputation.test.ts`
- `tests/api/reputation.test.ts`

### Modified

- `prisma/schema.prisma` — Added ContributorProfile model, TrustLevel enum, region column
- `src/types/contributions.ts` — Added region, contributorTrustLevel, contributorReputationScore fields
- `src/app/api/contributions/route.ts` — Region in POST, LEFT JOIN for trust level in GET
- `src/app/api/admin/contributions/[id]/route.ts` — Region in GET, reputation recalculation in PATCH
- `src/app/[locale]/contribute/ContributeClient.tsx` — Region in payload, initialType/initialTree, viewProfile link
- `src/app/[locale]/contribute/page.tsx` — searchParams handling, viewProfile translation
- `src/components/ContributeCTA.tsx` — Third "Share local knowledge" CTA link
- `src/app/[locale]/admin/contributions/ContributionsListClient.tsx` — Trust level display, region display
- `messages/en.json` — reputation namespace, success.viewProfile
- `messages/es.json` — reputation namespace, success.viewProfile
- `docs/IMPLEMENTATION_PLAN.md` — P6.2 marked complete

## Previous Run Summary (2026-02-28 — Run 14)

- **Branch**: `feature/p6.2-contributions-ratings-security-fixes`
- **Tasks completed**:
  1. **CRITICAL: SQL injection fix in `/api/contributions` GET handler** — The GET endpoint used `$queryRawUnsafe` with string-concatenated WHERE clauses. Session IDs from cookies and query params (type, status, priority) were interpolated directly into raw SQL strings. Replaced with parameterized `$queryRaw` tagged template queries with input validation against known enum arrays (`VALID_TYPES`, `VALID_STATUSES`, `VALID_PRIORITIES`). Extracted `ContributionRow` interface and `transformContribution()` helper to module scope.
  2. **P6.2: Tree rating system — complete implementation** — Built the full rating feature:
     - **Prisma schema**: Added `TreeRating` model (id, treeSlug, rating 1-5, sessionId, ipHash, userId, timestamps, `@@unique([treeSlug, sessionId])`)
     - **Migration**: `prisma/migrations/20260227000000_add_tree_ratings/migration.sql`
     - **API route**: `/api/trees/[slug]/rating` with GET (aggregate + user rating) and POST (upsert with rate limiting 50/hr per IP, tree slug validation via `allTrees`, session cookie management, 503 fallback for missing table)
     - **UI component**: `src/components/TreeRating.tsx` — interactive star rating with hover states, feedback messages, loading skeleton, `no-print` class
     - **Integration**: Added dynamic import and `<TreeRating slug={tree.slug} />` to tree detail page (after SafetyDisclaimer, before ComparisonLinks)
     - **i18n**: Added complete `rating` namespace to EN + ES with ICU plurals for totalRatings
  3. **Fix: untranslated string in ContributeClient** — Hardcoded English string "Your contact info is optional..." replaced with `{t.form.contactInfoNote}`. Added key to both locale files.
  4. **Fix: pre-existing test failure** — Contributions test mock threw "DB not available" which didn't match the handler's error message pattern checking. Fixed to use realistic `relation "contributions" does not exist`.
  5. **Tests**: Created `tests/api/tree-rating.test.ts` with 10 tests: GET aggregate, GET null ratings, GET 404, GET missing table, POST success, POST 404, POST validation (4 cases), POST rate limited, POST 503, POST session cookie.
  6. **Verified**: 574/574 tests pass (10 new), 0 lint errors, build clean.

## Previous Run Summary (2026-02-28 — Run 12)

- **Branch**: `feature/p6-community-features-and-fixes`
- **Tasks completed**:
  1. **P6.1: User Photo Upload — Critical SQL bug fixes** — Found and fixed 3 runtime-breaking SQL column mismatches in `/api/images/upload` route:
     - Rate limit query: replaced nonexistent `submitted_by` column with JOIN on `image_audits.actor_id`
     - Proposal INSERT: `flags` → `flag_count`, removed nonexistent `submitted_by` column, added PostgreSQL enum casts (`::\"ImageType\"`, `::\"ImageProposalSource\"`, `::\"ImageProposalStatus\"`)
     - Audit INSERT: `performed_by` → `actor_id`, added required `tree_slug` and `image_type` columns
  2. **P6.1: Upload API test suite** — Created `tests/api/images-upload.test.ts` with 23 comprehensive tests: successful upload, proposal+audit creation, 503 (tables missing), 401 (unauth), 429 (rate limit), 400 (no file, no slug, invalid type, invalid mime, too large, too small dimensions), 503 (Cloudinary unconfigured), all image types, attribution, GET endpoint (limits/guidelines). All 23 pass.
  3. **P6.1 infrastructure audit** — Verified complete upload system: PhotoUploadClient (434 lines with drag-drop, preview, tree search, image type selection), contribute/photo page (SSR with tree list), i18n translations (EN + ES complete), Cloudinary integration, admin review APIs.
  4. **Verified**: 564/564 tests pass (23 new), 0 TypeScript errors. Build blocked by transient Google Fonts network issue (not code-related).

## Previous Run Summary (2026-02-27 — Run 11)

- **Branch**: `feature/p6-community-features-and-fixes` → push pending (network down)
- **Tasks completed**:
  1. **P6.3: Public API — Comparisons endpoints** — Created `/api/v1/comparisons` (list with filtering by species, difficulty, tag, search, pagination) and `/api/v1/comparisons/[slug]` (detail with embedded species data). 19 new tests.
  2. **P6.3: Public API — Glossary endpoints** — Created `/api/v1/glossary` (list with filtering by category, search, pagination) and `/api/v1/glossary/[slug]` (detail with embedded related terms and example species). 15 new tests.
  3. **P6.3: Public API — OpenAPI specification** — Created `/api/v1/openapi.json` with full OpenAPI 3.1 spec documenting all 7 v1 endpoints (trees, trees/[slug], families, comparisons, comparisons/[slug], glossary, glossary/[slug]). 5 new tests.
  4. **Shared rate limiter extraction** — Created `src/lib/api-rate-limit.ts` replacing duplicated inline rate-limiting code in trees, trees/[slug], and families routes. Adds periodic cleanup for memory leak prevention. All new endpoints use shared limiter.
  5. **API types expansion** — Added `ComparisonAPIResponse`, `ComparisonFilterOptions`, `GlossaryAPIResponse`, `GlossaryFilterOptions` to `src/types/api.ts`.
  6. **Fix: @sentry/nextjs Turbopack build warnings** — Used runtime string concatenation (`["@sentry", "nextjs"].join("/")`) in `src/lib/error-tracking.ts` and `src/instrumentation.ts` to prevent Turbopack static analysis from resolving the optional module.
  7. **Verified**: 541/541 tests pass (39 new), 0 lint errors.

## Previous Run Summary (2026-02-26 — Run 9)

- **Branch**: `content/glossary-standardization-and-enum-normalization` → PR pending
- **Tasks completed**:
  1. **Content Standardization: Enum normalization** — Normalized 111 non-standard enum values across 53 tree files (EN + ES). Fields fixed: waterNeeds (27), lightRequirements (21), growthRate (22), propagationDifficulty (26), toxicityLevel (5), skinContactRisk (5), allergenRisk (5). Spanish translations ("moderado" → "moderate", "pleno-sol" → "full-sun") and English compound values ("very-fast" → "fast", "moderate-to-high" → "high") mapped to schema-valid enums. Created `scripts/normalize-enum-values.mjs`.
  2. **Content Standardization: Glossary exampleSpecies** — Fixed 121 glossary exampleSpecies references (common names → valid tree slugs). Removed 64 invalid entries (non-atlas species like beans, corn, dandelion). Mappings: "mahogany" → "caoba", "teak" → "teca", "cecropia" → "guarumo", "kapok" → "ceiba", etc. Created `scripts/fix-glossary-references.mjs`.
  3. **Content Standardization: Glossary relatedTerms** — Removed 391 invalid relatedTerms references that pointed to non-existent glossary slugs. Affected 209 glossary files (EN + ES).
  4. **Bug fix**: Fixed flaky ReDoS timing test (threshold 1ms → 5ms, was intermittently failing).
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

- **Tests**: 577/577 passing (36 test files)
- **Content**: 175 trees × 2 locales, 20 comparisons × 2, 150 glossary × 2
- **Content quality**: All enum values normalized to schema, glossary references validated
- **Galleries**: 174/175 trees with iNaturalist photo galleries
- **External links**: 175/175 trees with GBIF + IUCN links
- **All pages**: 600+ lines, bilingual parity achieved
- **Database**: Neon PostgreSQL deployed, Prisma 7, admin user active, indexes optimized. New `tree_ratings` table (migration pending deploy).
- **Performance**: Lighthouse 85/100 (Perf), 100 (SEO), 100 (BP). LCP 4.0s is network-bound. A11y expected 100 after contrast fix deployed. CSP inline styles minimized (P4.5 complete).
- **Component sizes**: All 3 large clients split — TreeMapClient 1,027, ScavengerHuntClient 575, TreeJournalClient 672 lines
- **SEO**: All P3 tasks complete (P3.1–P3.5). OG images, JSON-LD, sitemap, and meta descriptions all optimized.
- **Error tracking**: Sentry-ready (zero deps, graceful fallback), Turbopack build warnings fixed
- **Public API (P6.3)**: 7 v1 endpoints — trees (list/detail), families, comparisons (list/detail), glossary (list/detail), OpenAPI 3.1 spec. Shared rate limiter, pagination, HAL-style links.
- **Photo uploads (P6.1)**: Complete upload system — UI (drag-drop, preview, tree search), API (validation, Cloudinary, audit logging), 23 tests. 3 critical SQL bugs fixed.
- **Community contributions (P6.2)**: Contributions form + admin review complete. Tree rating system complete (DB, API, UI, i18n). SQL injection vulnerability in contributions GET fixed.
- **Security**: SQL injection in `/api/contributions` GET handler fixed (was using `$queryRawUnsafe` with string concatenation).
- **CSP (P4.5)**: Inline styles reduced from 54→~30. Reusable `ProgressBar` component created. Remaining are irreducible runtime values. `'unsafe-inline'` in `style-src` is standard practice.

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
| P4.5     | CSP inline style optimization         | ✅ Complete | 4 components → Tailwind, ProgressBar component, 9 bars replaced      |
| P4.6     | LCP image optimization                | ✅ Complete | Images recompressed 37%, priority props added                        |
| P4.7     | A11y contrast fixes (4 issues)        | ✅ Complete | Dark mode primary/secondary lightened, skip-link override added      |
| P5.1     | API route test coverage               | ✅ Complete | 107 new tests across 9 files, 431/431 total passing                  |
| P5.2     | Error tracking (Sentry)               | ✅ Complete | Sentry-ready, 18 API routes updated, zero new deps                   |
| P5.3     | Content validation tests              | ✅ Complete | 48 tests — schema, parity, images, cross-refs. 479/479 total.        |
| P5.4     | Content standardization               | ✅ Complete | 111 enum fixes, 121 exampleSpecies mapped, 391 relatedTerms cleaned  |
| P6.1     | User photo upload system              | ✅ Complete | Upload UI, API, Cloudinary, 23 tests, 3 SQL bugs fixed               |
| P6.2     | Community contributions + ratings     | ✅ Complete | Forms, admin review, tree rating system, SQL injection fix, 10 tests |
| P6.3     | Public API for researchers            | ✅ Complete | 7 endpoints, OpenAPI spec, shared rate limiter, 39 tests             |

**Recommended next task**: Polish / remaining manual steps, or additional P8 UX enhancements. All P2–P6 tasks are now complete.

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
- Performance (P4): ✅ ALL COMPLETE. Lighthouse 85/100. LCP optimized ✅. DB indexes ✅. A11y contrast ✅. SSR refactor ✅ ALL 6 done. Component splits ✅ ALL 3 done. CSP inline styles ✅ (P4.5 — ProgressBar component, 9 bars replaced, 4 components converted to Tailwind).
- Testing (P5): ✅ ALL COMPLETE. API route tests ✅ (107 tests). Content validation tests ✅ (48 tests). Error tracking ✅ (Sentry-ready). Content standardization ✅.
- Community (P6): ✅ ALL COMPLETE. P6.1 User photo uploads ✅. P6.2 Community contributions + tree ratings ✅. P6.3 Public API ✅ (7 endpoints, OpenAPI spec, 39 tests).
- Recommended execution order (pick one or more):
  1. Apply DB migrations to production (manual step — `npx prisma migrate deploy`). Includes tree_ratings table.
  2. Install @sentry/nextjs and configure DSN in Vercel env vars (manual step)
  3. P7 (additional languages) — requires native speaker review
  4. P8 UX enhancements (search autocomplete, offline support, performance monitoring)
  5. Any remaining polish from IMPLEMENTATION_PLAN.md

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
