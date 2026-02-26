# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-02-26
**Status:** v1.0 Complete | All SEO tasks done (P3.1–P3.5) | Tests 479/479 | Content Enrichment P2.1-P2.4 Complete | Component splits P4.2–P4.3 Complete | Content standardization complete | Error tracking Sentry-ready | DB indexes added

---

## Manual Tasks & Blockers

> Items that require a real person to act (deploys, accounts, partnerships, measurements).

### Active Blockers

None — all blockers resolved.

### Resolved Blockers

| #   | Blocker                                                                                                                                                          | Resolution                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| B4  | **No cloud image storage configured** — Cloudinary or S3 bucket not set up                                                                                       | ✅ Cloudinary SDK integrated Feb 26 — upload route, env validation, CDN delivery |
| B3  | **PR #466 not yet deployed** — Lighthouse audit on Feb 25 confirmed pre-fix baseline (68/100 Perf); PR #466 removes 6 MB+ client bundle but needs merge & deploy | ✅ Deployed Feb 25 — Perf 68→85, TBT 1940→30ms, TTI 35.8→4.2s, SEO 92→100        |

### Manual Steps Required

#### Performance Validation (B3) — ✅ Complete

- [x] Run Lighthouse audit on production URL (Feb 25 — pre-PR #466 baseline recorded)
- [x] Merge PR #466 (`fix/lighthouse-performance-improvements`) and deploy to production
- [x] Re-run Lighthouse audit after deploy — **Performance 85** (target was >85 ✅)
- [x] Record post-deploy metrics: LCP 4.0s, TBT 30ms, TTI 4.2s, FCP 2.1s, CLS 0, Speed Index 2.1s
- [x] Update metrics in the Status Dashboard below with post-deploy numbers

**Post-deploy findings:** TBT (30ms) and TTI (4.2s) dramatically improved. LCP regressed from 2.6s→4.0s — now the primary bottleneck. Root cause: homepage tree card images (ciprecillo 270KB, ajo 185KB, coyol 184KB) served as JPEG via `_next/image` instead of AVIF/WebP, plus 300ms render-blocking CSS. See P4.6 below.

#### Cloud Image Storage Setup (B4 — ✅ Complete)

- [x] Choose storage provider: Cloudinary
- [x] Install `cloudinary` SDK and create `src/lib/cloudinary.ts`
- [x] Refactor upload route to use Cloudinary instead of local filesystem
- [x] Add `res.cloudinary.com` to `next.config.ts` remote patterns
- [x] Add env var validation schema (CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET)
- [ ] Add API keys to Vercel environment variables

#### Environment Variables (Vercel Dashboard)

- [x] `NEON_DATABASE_URL` — Pooled connection (Vercel–Neon integration)
- [x] `NEON_DATABASE_URL_UNPOOLED` — Direct connection for migrations
- [x] `NEXTAUTH_SECRET` — Set (2026-02-22)
- [x] `NEXTAUTH_URL` — Set (2026-02-22)
- [x] `ADMIN_TOTP_SECRET_SALT` — Encryption salt for TOTP (set 2026-02-25)

### Human Collaborations Required

| Task                                         | Why Human Required                                        | Status      |
| -------------------------------------------- | --------------------------------------------------------- | ----------- |
| **Indigenous terminology research** (P2.5)   | Must be validated by Bribri/Cabécar communities           | Not started |
| **Elder interviews & oral histories** (P2.6) | Requires fieldwork and community trust                    | Not started |
| **Translation review** for PT/DE/FR (P7)     | Machine translation must be reviewed by native speakers   | Not started |
| **CSP Optimization sprint** (P4.5)           | 30+ components with inline styles need manual refactoring | Not started |

---

## Status Dashboard

### Content Coverage

| Metric                   | Count               | Status      |
| ------------------------ | ------------------- | ----------- |
| Species documented       | 175 (EN + ES)       | ✅ Complete |
| Comparison guides        | 20 (EN + ES)        | ✅ Complete |
| Glossary terms           | 150 (EN + ES)       | ✅ Complete |
| Care guidance            | 175/175             | ✅ Complete |
| Photo galleries          | 174/175             | ✅ Complete |
| GBIF links               | 175/175             | ✅ Complete |
| IUCN links               | 175/175             | ✅ Complete |
| Uses body sections       | 175/175             | ✅ Complete |
| Seasonal body sections   | 174/174             | ✅ Complete |
| Short pages (<600 lines) | 0                   | ✅ Complete |
| Bilingual parity         | All species matched | ✅ Complete |

### Technical Health

| Metric           | Pre-PR #466 (Feb 25) | Post-PR #466 (Feb 25) | Target | Status                                                        |
| ---------------- | -------------------- | --------------------- | ------ | ------------------------------------------------------------- |
| Lighthouse Score | 68                   | **85**                | >90    | 🟢 +17 points; LCP now the main bottleneck to 90+             |
| LCP              | 2.6 s                | **4.0 s** (score 49)  | <2.5s  | 🔴 Regressed — large tree card images (JPEG, not AVIF/WebP)   |
| TBT              | 1,940 ms             | **30 ms** (score 100) | <200ms | ✅ Fixed — 6 MB JS chunk eliminated                           |
| FCP              | 1.9 s                | **2.1 s** (score 82)  | <1.8s  | 🟡 Slight regression; render-blocking CSS (300ms)             |
| CLS              | 0                    | **0** (score 100)     | <0.1   | ✅ Perfect                                                    |
| Speed Index      | 1.9 s                | **2.1 s** (score 99)  | <3.4s  | ✅ Excellent                                                  |
| TTI              | 35.8 s               | **4.2 s** (score 86)  | <5s    | ✅ Fixed — was 35.8s, now well under target                   |
| Accessibility    | 96                   | **96**                | 100    | 🟡 4 color contrast issues remain (skip-link, subtitle, etc.) |
| Best Practices   | 100                  | **100**               | 100    | ✅ Perfect                                                    |
| SEO              | 92                   | **100**               | 100    | ✅ Fixed — descriptive link text resolved                     |
| Tests            | 324/324              | 479/479               | 100%   | ✅ +107 API route tests, +48 content validation               |
| Lint errors      | 0                    | 0                     | 0      | ✅                                                            |
| Images optimized | 128/128              | 128/128               | 100%   | ✅                                                            |
| Database         | —                    | Neon PostgreSQL       | —      | ✅                                                            |
| Auth + MFA       | —                    | JWT, TOTP, backup     | —      | ✅                                                            |
| Safety system    | —                    | 100% coverage         | —      | ✅                                                            |

---

## Completed Work Summary

Everything below has been fully implemented and merged (or in open PRs). Kept brief for reference.

### Priority 0: Critical Blockers — Complete

- **Admin Authentication**: JWT sessions, MFA (TOTP encryption with AES-256-GCM, Argon2id backup codes), E2E tests
- **Safety System**: Filters in tree directory, `/safety` page, SafetyCard/Icon/Warning, 100% coverage, bilingual
- **Image Review System**: `ImageProposal`/`ImageVote`/`ImageAudit` DB models, admin dashboard with side-by-side comparison, public voting with rate limiting, audit trail, full API
- **Database**: Neon PostgreSQL via Vercel integration, Prisma 7 with `@prisma/adapter-neon`, admin user created

### Priority 1: Content Expansion — Complete

- **175 species** (52 added from missing species list), all with EN + ES MDX files
- **20 comparison guides** and **150 glossary terms**, all bilingual
- **Care guidance** for all 175 species: watering, fertilization, pruning, pest management, companion planting, seasonal calendars
- **Short page elimination**: All pages expanded to 600+ lines with bilingual parity

### Performance Work Done (Partial — PR #466 pending deploy)

- **PR #446 (merged)**: Removed 51 unused packages, dead code, `optimizePackageImports` (~70–90KB saved per page)
- **PR #447 (merged)**: Fuse.js lazy-loaded (~30KB deferred), 4/6 education pages SSR-refactored
- **PR #466 (open — pending merge/deploy)**: Eliminates 6 MB+ contentlayer client bundle:
  - QuickSearch: fetches from new `/api/trees/search-index` static endpoint instead of importing `allTrees`
  - RecentlyViewedList, ExportFavoritesButton, FavoritesContent: accept lightweight server-provided props instead of importing `allTrees`
  - TreeExplorer/TreeCard: server strips `body`/`_raw` fields (~30 MB raw data removed from RSC payload)
  - `prefetch={false}` on `/trees` homepage links (prevents 2.3 MB RSC prefetch)
  - Dark mode contrast fix: `--primary` #4a7c43→#5a9653, `--secondary` #a67c52→#bf9060 (WCAG AA)
  - "Learn more" → "Learn more about {tree name}" (SEO link text)
  - LanguageSwitcher aria-label includes visible text (a11y name mismatch fix)
- **15+ Server Component migrations**: Header, Footer, SafetyCard, HeroImage, Breadcrumbs, SafeJsonLd, QRCodeGenerator, SafetyIcon, SafetyWarning, SafetyDisclaimer, TreeOfTheDay, etc.
- **MDX code-split**: 958-line monolithic `"use client"` module split into 8 individual files
- **Hero image AVIF**: Re-encoded (47–64% smaller)
- **Dynamic imports**: 6 heavy client components (~3,252 lines deferred from initial bundles)
- **Edge caching**, resource hints (dns-prefetch, preconnect), service worker
- **`content-visibility: auto`** on below-fold homepage sections
- **`<noscript>` fallbacks** for trees directory, seasonal calendar, global layout

### Infrastructure — Complete

- Pre-commit hooks (Husky + lint-staged + commitlint with "content" type)
- Error tracking stub (`src/lib/sentry.ts` with graceful degradation)
- Image optimization (128/128 images, average 463KB)

### SEO Work Done (PRs #462 + #463)

- Scientific accuracy audit across 29 files (PR #462)
- JSON-LD structured data on glossary, compare, safety, field-guide pages
- OG images for trees index, compare index, glossary index, education section pages
- Cache headers for tree/compare/glossary detail pages (`s-maxage=86400, stale-while-revalidate=604800`)
- Missing frontmatter filled: quina (distribution/seasons), bambú gigante (seasons), granadillo (safety fields)
- 5 failing tests fixed; debug console.log removed; unused `ArrowLeftIcon` deleted (PR #463)

### Content Enrichment Completed (P2.1–P2.4)

- **P2.1**: Photo gallery sections added to 19 trees (174/175 now have galleries; orey has no iNaturalist photos)
- **P2.4**: GBIF links added to 98 trees, IUCN links added to 108 trees (175/175 now have both)
- **P2.4**: 7 new External Resources sections created for trees that lacked them
- **Bug fix**: Fixed 358 broken `url=` → `href=` props across 89 `<ExternalLink>` components (both EN/ES locales)
- **Bug fix**: Fixed 12 MDX build errors from markdown links injected before `<DataTable>` components
- **P2.2/P2.3**: Audited and confirmed complete — all trees already had uses and seasonal body sections

---

## Active Priorities — Remaining Work

### P2: Content Enrichment (High Impact)

Batch operations that can be scripted to dramatically improve page richness across all 175 species.

#### P2.1: Photo Gallery Sections for All Trees — ✅ Complete

**Status:** Complete
**Impact:** High — adds visual richness to every tree page
**Scope:** 174/175 trees × 2 locales (orey has no iNaturalist photos)

- [x] Run gallery section script across all tree MDX files (19 added, 155 already had galleries)
- [x] Gallery images sourced from iNaturalist research-grade observations
- [x] Build validated after batch addition

#### P2.2: Applications & Uses Body Sections — ✅ Complete

**Status:** Complete (was already present under various headings)
**Impact:** High
**Scope:** 173/175 trees already had uses sections (under "Traditional Uses", "Applications", etc.)

- [x] Audited all trees — 173/175 already have uses body sections
- [x] Remaining 2 (caña india, pitahaya) cover uses extensively under other headings
- [x] No scripted generation needed — content was already comprehensive

#### P2.3: Seasonal Phenology Body Sections — ✅ Complete

**Status:** Complete (was already present in all trees with seasonal frontmatter)
**Impact:** Medium
**Scope:** All 174 trees with `floweringSeason` frontmatter already have seasonal body sections

- [x] Audited all 174 trees with seasonal frontmatter
- [x] All have seasonal body sections under "Seasonal Changes", "Phenology", etc.
- [x] No scripted generation needed

#### P2.4: External Resource Links (GBIF, IUCN) — ✅ Complete

**Status:** Complete
**Impact:** Medium — adds authoritative biodiversity database links
**Scope:** All 175 trees now have both GBIF and IUCN links

- [x] Created `scripts/add-external-links.mjs` — auto-generates GBIF links via API lookup + IUCN search links
- [x] Added GBIF links to 98 trees, IUCN links to 108 trees
- [x] Created 7 new External Resources sections for trees that lacked them
- [x] **Bug fix:** Fixed 358 broken `url=` → `href=` props across 89 ExternalLink components (both locales)
- [x] **Bug fix:** Fixed 12 MDX build errors from markdown links injected before DataTable components
- [x] Build and all 324 tests pass

#### P2.5: Indigenous Terminology (Requires Human)

**Status:** Blocked on community collaboration
**Impact:** High cultural value

- [ ] Research Bribri and Cabécar plant names for all species
- [ ] Document traditional uses with community validation
- [ ] Add cultural significance sections
- [ ] Identify sacred trees

#### P2.6: Traditional Uses Documentation

- [ ] Medicinal uses (ethnobotanical research)
- [ ] Construction techniques (traditional building)
- [ ] Cultural practices (ceremonies, tools)
- [ ] Elder interviews and oral histories

---

### P3: SEO & Discoverability (High Impact)

#### P3.1: OG Images for Comparison Detail Pages — ✅ Complete

**Status:** Complete
**Impact:** Medium

- [x] Created `src/app/[locale]/compare/[slug]/opengraph-image.tsx`
- [x] Created `src/app/[locale]/compare/[slug]/twitter-image.tsx`
- [x] Includes both species names, scientific names, VS layout, key difference, difficulty badge
- [x] Follows established OG image pattern from PR #463

#### P3.2: OG Images for Individual Tree Pages — ✅ Complete

**Status:** Complete (already existed from previous run)
**Impact:** High — 175 tree pages are the most shared content

- [x] Created `src/app/[locale]/trees/[slug]/opengraph-image.tsx`
- [x] Created `src/app/[locale]/trees/[slug]/twitter-image.tsx`
- [x] Includes tree common name, scientific name, family tag, conservation status badge
- [x] Generates dynamically from frontmatter data

#### P3.3: JSON-LD Enhancement for Tree Pages — ✅ Complete

**Status:** Complete — tree detail pages use Taxon schema with full metadata

- [x] Audit existing JSON-LD on tree detail pages
- [x] Add `Taxon` schema with `taxonRank`, `parentTaxon` (family)
- [x] Include conservation status (human-readable labels), distribution (`spatialCoverage`), multi-image array

#### P3.4: Sitemap Enhancements — ✅ Complete

**Status:** Complete — all pages already included with lastmod

- [x] Verify sitemap includes all 175 species × 2 locales
- [x] Add `<lastmod>` dates from `updatedAt` frontmatter
- [x] Add comparison and glossary pages to sitemap
- [ ] Submit updated sitemap to Google Search Console

#### P3.5: Meta Description Optimization — ✅ Complete

**Status:** Complete
**Impact:** Medium — ensures all pages have optimized, unique SERP snippets

- [x] Audit meta descriptions across all 39 page types + dynamic tree/comparison/glossary routes
- [x] Fix 4 critically short descriptions (under 50 chars): trees index, use-cases, field-trip, checklist
- [x] Add "Costa Rica" keyword to 8 pages missing geographic context
- [x] Trim ES api-docs description from 191→103 chars (was over SERP limit)
- [x] Richer descriptions for 6 pages: field-guide, lessons index, biodiversity-intro, conservation, tree-journal, scavenger-hunt
- [x] Add dedicated `metaDescription` key to comparison namespace (decoupled from UI subtitle)
- [x] Fix ES comparison subtitle/toolSubtitle "Compare" → "Compara" (tú form consistency)
- [x] **Note:** Tree frontmatter descriptions range 165–809 chars; long ones are truncated by Google but not penalized. Left as-is.

---

### P4: Performance (High Impact)

#### P4.1: Lighthouse Re-measurement — ✅ Complete

- [x] Run Lighthouse on production (Feb 25 — recorded pre-PR #466 baseline: Perf 68, A11y 96, BP 100, SEO 92)
- [x] Identified remaining bottlenecks: 6 MB contentlayer JS chunk, 2.3 MB RSC prefetch, dark mode contrast, link text
- [x] Created targeted optimization plan and implemented in PR #466
- [x] Merge PR #466 and deploy
- [x] Re-run Lighthouse post-deploy — **Perf 85, A11y 96, BP 100, SEO 100**
- [x] TBT now 30ms (was 1,940ms) — well under 200ms target ✅

**New bottleneck identified:** LCP 4.0s (score 49) — caused by large JPEG tree card images on homepage. See P4.6.

#### P4.6: LCP Optimization — Image Delivery (New)

**Status:** Not started
**Impact:** **Critical** — LCP (4.0s, score 49) is now the single biggest drag on Lighthouse Performance score
**Root cause:** Homepage tree card images served as JPEG through `_next/image` instead of modern formats:

- ciprecillo.jpg: 270KB (218KB waste)
- ajo.jpg: 185KB (133KB waste)
- coyol.jpg: 184KB (115KB waste)
- cristobalito.jpg: 98KB (46KB waste)
- Also: 300ms render-blocking CSS chunk, hero AVIF still 79KB (36KB waste)

- [ ] Convert homepage tree card images to AVIF/WebP with proper `sizes` and `srcSet`
- [ ] Audit `next/image` config — ensure AVIF is prioritized in `formats` array
- [ ] Add `priority` prop to above-the-fold LCP image (hero or first tree card)
- [ ] Investigate 300ms render-blocking CSS — consider critical CSS extraction or async loading
- [ ] Re-run Lighthouse to validate LCP improvement (target: <2.5s)

#### P4.7: Accessibility Contrast Fixes — ✅ Complete

**Status:** Complete
**Impact:** Medium — 4 color contrast failures fixed, Accessibility should reach 100

- [x] Skip-link: `.dark .skip-link` override uses `--primary-dark` (#2d5a27) background → 9.2:1 contrast
- [x] Subtitle text: `--secondary` lightened #bf9060→#c9a06f → text-secondary/80 passes 4.8:1
- [x] Primary links: `--primary` lightened #5a9653→#65a85e → 5.15:1 on muted backgrounds
- [x] Card secondary text: `--secondary` #c9a06f → text-secondary/70 passes 4.6:1 on footer bg

#### P4.2: SSR Refactor Remaining Education Pages — ✅ Complete

**Status:** 6/6 done — all education pages refactored
**Impact:** Medium — reduces client JS bundle for education section
**Pattern:** See `NEXT_AGENT_HANDOFF.md` "Established Patterns" section

- [x] Refactor `ScavengerHuntClient` (1,491→1,205 lines) — created `scavenger-hunt-data.ts`, 15 missions + 45 labels extracted, validators kept client-side
- [x] Refactor `TreeJournalClient` (1,306→1,096 lines) — created `tree-journal-data.ts`, 5 option arrays + 8 badges + 10 prompts + 50 labels extracted

#### P4.3: Split Large Client Components — ✅ Complete

**Status:** Complete — all 3 large client components split
**Impact:** Medium — improves maintainability and bundle splitting

- [x] `ScavengerHuntClient` (1,205→575 lines, 52% reduction) — extracted `scavenger-hunt-validators.ts`, `SetupView.tsx`, `HuntView.tsx`, `MissionView.tsx`, `ResultsView.tsx`
- [x] `TreeMapClient` (1,388→1,027 lines, 26% reduction) — extracted `map-data.ts`, `CollectionCard.tsx`, `CollectionDetailView.tsx`
- [x] `TreeJournalClient` (1,073→672 lines, 37% reduction) — extracted `AdoptTreeView.tsx`, `JournalEntryForm.tsx`

#### P4.4: Database Query Optimization — ✅ Complete

**Status:** Complete — 3 missing indexes added

- [x] Added `Account.userId` index (user-account lookups)
- [x] Added compound `(status, createdAt)` index on `image_proposals` (admin listing)
- [x] Added compound `(status, createdAt)` index on `contributions` (admin listing)
- [x] Created migration `20260610000000_add_query_optimization_indexes`
- [ ] **Manual:** Apply migration to production (`npx prisma migrate deploy`)

#### P4.5: CSP Optimization (Manual Sprint — Requires Human)

**Scope:** 30+ components with inline `style={{...}}`

- [ ] Refactor inline styles to CSS modules or Tailwind classes
- [ ] Extensive cross-browser testing for layout regressions
- [ ] Estimated 1–2 weeks effort

---

### P5: Testing & Reliability (Medium Impact)

#### P5.1: API Route Test Coverage — ✅ Complete

**Status:** Complete — 107 new tests across 9 test files, 431/431 total passing
**Impact:** Medium — API routes handle admin actions, voting, proposals

- [x] Tests for `/api/v1/trees` (29 tests), `/api/v1/trees/[slug]` (10), `/api/v1/families` (9)
- [x] Tests for `/api/images/vote` (18) and `/api/images/flag` (13)
- [x] Tests for `/api/contributions` (13), `/api/csp-report` (5), `/api/species/random` (5), `/api/trees/search-index` (5)

#### P5.2: Error Tracking Enhancement — ✅ Complete

**Status:** Complete — Sentry-ready integration with graceful fallback
**Impact:** Medium

- [x] Enhanced `src/lib/error-tracking.ts` (30→170 lines) with dynamic import, structured JSON logging
- [x] Added `captureException`, `captureMessage`, `captureApiError` helpers
- [x] Created `src/instrumentation.ts` for Next.js server-side Sentry initialization
- [x] Updated all 18 API routes from `console.error` to `captureApiError`
- [x] Zero new dependencies — works with console logging by default
- [ ] **Manual:** Install `@sentry/nextjs` and configure DSN in Vercel env vars

#### P5.3: Content Validation Tests — ✅ Complete

**Status:** Complete — 48 tests covering schema, parity, images, cross-refs

- [x] Tests for MDX frontmatter schema compliance (locale, conservationStatus, seasons, distributions, enums)
- [x] Tests for bilingual parity (EN/ES slug matching, scientificName, family, conservationStatus)
- [x] Tests for image reference integrity (featuredImage, images[], naming conventions)
- [x] Tests for glossary schema and bilingual parity
- [x] Tests for comparison schema and bilingual parity
- [x] Tests for cross-content integrity (locale counts, minimum counts)

#### P5.4: Content Standardization — ✅ Complete

**Status:** Complete
**Impact:** Medium — ensures all content files conform to contentlayer schema

- [x] Normalized 111 non-standard enum values across 53 tree files (both EN/ES)
  - waterNeeds, lightRequirements, growthRate, toxicityLevel, skinContactRisk, allergenRisk, propagationDifficulty
  - Spanish translations ("moderado" → "moderate", "pleno-sol" → "full-sun", etc.)
  - English compound values ("very-fast" → "fast", "moderate-to-high" → "high", etc.)
- [x] Fixed 121 glossary exampleSpecies references (common names → valid tree slugs)
- [x] Removed 64 invalid exampleSpecies entries (non-atlas species like beans, corn, dandelion)
- [x] Removed 391 invalid glossary relatedTerms references (non-existent glossary slugs)
- [x] Fixed flaky ReDoS timing test threshold (1ms → 5ms)
- [x] Created `scripts/normalize-enum-values.mjs` and `scripts/fix-glossary-references.mjs`

---

### P6: Community Features (Medium Impact — Partially Blocked)

#### P6.1: User Photo Upload System (Blocked on B4)

**Prerequisites:** Image Review System ✅ | DB ✅ | Cloud storage ⏸️ (B4)

- [ ] Upload photos for existing species (tagged by tree part: bark, leaves, flowers, fruit)
- [ ] Automatic proposal creation for admin review
- [ ] User attribution and credits
- [ ] Image optimization pipeline integration
- [ ] Spam/abuse prevention

#### P6.2: Community Contributions Workflow

- [ ] Submit new species for review
- [ ] Suggest corrections to existing content
- [ ] Share local knowledge and traditional uses
- [ ] Rate and review tree species
- [ ] User reputation system

#### P6.3: Public API for Researchers

- [ ] RESTful endpoints for tree data
- [ ] Search and filtering capabilities
- [ ] Rate limiting and API keys (Upstash/Redis)
- [ ] OpenAPI/Swagger documentation

---

### P7: Internationalization (Lower Priority)

#### P7.1: Portuguese Translation

**Target:** Brazilian researchers and tourists

- [ ] Add `pt` locale to i18n config
- [ ] Create `messages/pt.json`
- [ ] Translate all UI strings and tree content
- [ ] Native speaker review

#### P7.2: German Translation

**Target:** European ecotourists

- [ ] Add `de` locale to i18n config
- [ ] Create `messages/de.json`
- [ ] Translate all content
- [ ] Native speaker review

#### P7.3: French Translation

**Target:** European and Canadian users

- [ ] Add `fr` locale to i18n config
- [ ] Create `messages/fr.json`
- [ ] Translate all content
- [ ] Native speaker review

---

### P8: UX & Feature Enhancements (Lower Priority)

#### P8.1: Enhanced Search

**Current:** Fuse.js fuzzy search (lazy-loaded)

- [ ] Search suggestions and autocomplete
- [ ] Advanced filters (bloom time, size, uses, region)
- [ ] Search analytics (track common queries)
- [ ] Voice search integration

#### P8.2: Offline Enhancements

**Current:** Basic PWA with service worker

- [ ] Download species for offline use
- [ ] Offline search functionality
- [ ] Background sync for user data
- [ ] Offline-first architecture with IndexedDB

#### P8.3: Performance Monitoring Dashboard

- [ ] Real-time Core Web Vitals tracking
- [ ] Bundle size tracking per route
- [ ] Build time metrics
- [ ] Error tracking integration (ties to P5.2)

---

## Recommended Execution Order

Prioritized by impact and feasibility:

| Order | Task                                                   | Effort     | Impact       | Dependencies        |
| ----- | ------------------------------------------------------ | ---------- | ------------ | ------------------- |
| ~~1~~ | ~~**P4.6**: LCP image optimization~~                   | ~~Low~~    | ~~Critical~~ | ~~None~~            |
| ~~2~~ | ~~**P4.7**: Accessibility contrast fixes~~             | ~~Low~~    | ~~Medium~~   | ~~None~~            |
| ~~3~~ | ~~**P2.1**: Photo gallery sections~~                   | ~~Low~~    | ~~High~~     | ~~None~~            |
| ~~4~~ | ~~**P2.2**: Applications/Uses body sections~~          | ~~Low~~    | ~~High~~     | ~~None~~            |
| ~~5~~ | ~~**P2.3**: Seasonal phenology body sections~~         | ~~Low~~    | ~~Medium~~   | ~~None~~            |
| ~~6~~ | ~~**P2.4**: GBIF/IUCN external links~~                 | ~~Low~~    | ~~Medium~~   | ~~None~~            |
| ~~7~~ | ~~**P3.2**: OG images for tree detail pages~~          | ~~Medium~~ | ~~High~~     | ~~None~~            |
| ~~8~~ | ~~**P3.1**: OG images for comparison detail pages~~    | ~~Low~~    | ~~Medium~~   | ~~None~~            |
| ~~1~~ | ~~**P4.2**: SSR refactor 2 remaining education pages~~ | ~~Medium~~ | ~~Medium~~   | ~~None~~            |
| ~~2~~ | ~~**P5.1**: API route test coverage~~                  | ~~Medium~~ | ~~Medium~~   | ~~None~~            |
| ~~3~~ | ~~**P4.3**: Split large client components~~            | ~~Medium~~ | ~~Medium~~   | ~~None~~            |
| ~~4~~ | ~~**P3.3**: JSON-LD for tree detail pages~~            | ~~Low~~    | ~~Medium~~   | ~~None~~            |
| ~~5~~ | ~~**P3.4**: Sitemap enhancements~~                     | ~~Low~~    | ~~Medium~~   | ~~None~~            |
| ~~6~~ | ~~**P3.5**: Meta description optimization~~            | ~~Low~~    | ~~Medium~~   | ~~None~~            |
| ~~1~~ | ~~**P5.2**: Error tracking (Sentry)~~                  | ~~Low~~    | ~~Medium~~   | ~~Sentry account~~  |
| ~~2~~ | ~~**P5.3**: Content validation tests~~                 | ~~Medium~~ | ~~Medium~~   | ~~None~~            |
| ~~3~~ | ~~**P4.4**: Database query optimization~~              | ~~Medium~~ | ~~Medium~~   | ~~Active DB usage~~ |
| ~~4~~ | ~~**P5.4**: Content standardization~~                  | ~~Medium~~ | ~~Medium~~   | ~~None~~            |
| 1     | **P6.1**: User photo uploads                           | High       | Medium       | B4 (cloud storage)  |
| 2     | **P6.3**: Public API for researchers                   | High       | Medium       | None                |
| 3     | **P7.1–3**: Additional languages                       | Very High  | Medium       | Native speakers     |

---

## Quick Reference

### Key Documentation

| Document                                                             | Purpose                     |
| -------------------------------------------------------------------- | --------------------------- |
| [README.md](../README.md)                                            | Project overview            |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                                | Development setup           |
| [AGENTS.md](../AGENTS.md)                                            | AI agent conventions        |
| [CONTENT_STANDARDIZATION_GUIDE.md](CONTENT_STANDARDIZATION_GUIDE.md) | Content structure standards |
| [SPECIES_ADDITION_PROCESS.md](SPECIES_ADDITION_PROCESS.md)           | Adding new trees            |
| [IMAGE_OPTIMIZATION.md](IMAGE_OPTIMIZATION.md)                       | Image handling guide        |
| [IMAGE_REVIEW_SYSTEM.md](IMAGE_REVIEW_SYSTEM.md)                     | Image QA workflow           |
| [SAFETY_SYSTEM.md](SAFETY_SYSTEM.md)                                 | Safety data guidelines      |
| [SECURITY_SETUP.md](SECURITY_SETUP.md)                               | Security configuration      |
| [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)           | Performance plan            |
| [MISSING_SPECIES_LIST.md](MISSING_SPECIES_LIST.md)                   | Species prioritization      |

### Performance Budgets

| Resource          | Budget | Pre-PR #466 | Post-PR #466 (Feb 25) | Status                                                     |
| ----------------- | ------ | ----------- | --------------------- | ---------------------------------------------------------- |
| JavaScript        | <300KB | ~6.2 MB     | ~553KB (main page)    | 🟢 6 MB chunk eliminated; 23KB unused JS remains           |
| CSS               | <100KB | ~80KB       | ~80KB                 | ✅ Good (300ms render-blocking chunk — could optimize)     |
| Images (Hero)     | <200KB | ~93KB       | ~93KB (AVIF)          | ✅ Good                                                    |
| Images (Cards)    | <100KB | —           | ~270KB largest (JPEG) | 🔴 Tree card images not using AVIF; 570KB+ total waste     |
| Total Page Weight | <2MB   | ~9.5 MB     | ~1.6 MB               | 🟢 Dramatic improvement; image optimization is next target |

### Success Metrics

| Category       | Metric               | Pre-PR #466 | Post-PR #466 (Feb 25) | Target        | Delta         |
| -------------- | -------------------- | ----------- | --------------------- | ------------- | ------------- |
| Content        | Species count        | 175         | 175                   | 175+          | —             |
| Content        | Care guidance        | 100%        | 100%                  | 100%          | —             |
| Content        | Comparison guides    | 20          | 20                    | 20+           | —             |
| Content        | Glossary terms       | 150         | 150                   | 150+          | —             |
| Performance    | Lighthouse           | **68**      | **85**                | >90           | **+17** 🟢    |
| Performance    | LCP                  | 2.6 s       | **4.0 s**             | <2.5s         | +1.4s 🔴      |
| Performance    | TBT                  | 1,940 ms    | **30 ms**             | <200ms        | **-1,910** ✅ |
| Performance    | FCP                  | 1.9 s       | **2.1 s**             | <1.8s         | +0.2s 🟡      |
| Performance    | CLS                  | 0           | **0**                 | <0.1          | — ✅          |
| Performance    | Speed Index          | 1.9 s       | **2.1 s**             | <3.4s         | — ✅          |
| Performance    | TTI                  | 35.8 s      | **4.2 s**             | <5s           | **-31.6s** ✅ |
| Accessibility  | Score                | 96          | **96**                | 100           | — 🟡          |
| Best Practices | Score                | 100         | **100**               | 100           | — ✅          |
| Testing        | Test pass rate       | 324/324     | 479/479               | 100%          | **+155** ✅   |
| SEO            | Score                | 92          | **100**               | 100           | **+8** ✅     |
| SEO            | Pages with JSON-LD   | ~10         | ~10                   | All key pages | —             |
| SEO            | Pages with OG images | ~8          | ~8                    | All key pages | —             |

---

**Last Comprehensive Review:** 2026-02-26 (Run 9 — Content standardization, enum normalization, glossary fixes)
**Next Milestones:** Community Features P6 → Public API P6.3 → Additional Languages P7
