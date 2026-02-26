# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-02-25
**Status:** v1.0 Complete | PR #466 Deployed — Performance 68→85, TBT 1940→30ms, SEO 100 | Active Development on Content Enrichment, Image Optimization, and Community Features

---

## Manual Tasks & Blockers

> Items that require a real person to act (deploys, accounts, partnerships, measurements).

### Active Blockers

| #   | Blocker                                                                    | Blocks                         | Owner |
| --- | -------------------------------------------------------------------------- | ------------------------------ | ----- |
| B4  | **No cloud image storage configured** — Cloudinary or S3 bucket not set up | Community photo uploads (P6.1) | Human |

### Resolved Blockers

| #   | Blocker                                                                                                                                                          | Resolution                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| B3  | **PR #466 not yet deployed** — Lighthouse audit on Feb 25 confirmed pre-fix baseline (68/100 Perf); PR #466 removes 6 MB+ client bundle but needs merge & deploy | ✅ Deployed Feb 25 — Perf 68→85, TBT 1940→30ms, TTI 35.8→4.2s, SEO 92→100 |

### Manual Steps Required

#### Performance Validation (B3) — ✅ Complete

- [x] Run Lighthouse audit on production URL (Feb 25 — pre-PR #466 baseline recorded)
- [x] Merge PR #466 (`fix/lighthouse-performance-improvements`) and deploy to production
- [x] Re-run Lighthouse audit after deploy — **Performance 85** (target was >85 ✅)
- [x] Record post-deploy metrics: LCP 4.0s, TBT 30ms, TTI 4.2s, FCP 2.1s, CLS 0, Speed Index 2.1s
- [x] Update metrics in the Status Dashboard below with post-deploy numbers

**Post-deploy findings:** TBT (30ms) and TTI (4.2s) dramatically improved. LCP regressed from 2.6s→4.0s — now the primary bottleneck. Root cause: homepage tree card images (ciprecillo 270KB, ajo 185KB, coyol 184KB) served as JPEG via `_next/image` instead of AVIF/WebP, plus 300ms render-blocking CSS. See P4.6 below.

#### Cloud Image Storage Setup (B4 — Required for P6.1)

- [ ] Choose storage provider: Cloudinary (recommended) or AWS S3
- [ ] Create account and bucket/upload preset
- [ ] Add API keys to Vercel environment variables
- [ ] Update upload handler in P6.1 implementation

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
| Tests            | 324/324              | 324/324               | 100%   | ✅                                                            |
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

---

## Active Priorities — Remaining Work

### P2: Content Enrichment (High Impact)

Batch operations that can be scripted to dramatically improve page richness across all 175 species.

#### P2.1: Photo Gallery Sections for All Trees

**Status:** Script exists (`scripts/add-gallery-sections.mjs`)
**Impact:** High — adds visual richness to every tree page
**Scope:** ~175 trees × 2 locales

- [ ] Run/verify gallery section script across all tree MDX files
- [ ] Ensure gallery images reference existing optimized images
- [ ] Validate build after batch addition

#### P2.2: Applications & Uses Body Sections

**Status:** Ready to script
**Impact:** High — 171 trees have `uses:` frontmatter but no corresponding body section
**Scope:** ~171 trees × 2 locales

- [ ] Create script to generate "Applications & Uses" MDX body sections from `uses:` frontmatter
- [ ] Include traditional, commercial, medicinal, and ecological use categories
- [ ] Run across all applicable trees in both locales
- [ ] Validate build after batch addition

#### P2.3: Seasonal Phenology Body Sections

**Status:** Ready to script
**Impact:** Medium — 131 trees have `floweringSeason`/`fruitingSeason` frontmatter but no body section
**Scope:** ~131 trees × 2 locales

- [ ] Create script to generate "Seasonal Changes" or "Phenology" MDX body sections
- [ ] Include month-by-month visual changes, flowering cues, fruiting periods
- [ ] Run across applicable trees in both locales
- [ ] Validate build after batch addition

#### P2.4: External Resource Links (GBIF, IUCN)

**Status:** Ready to script
**Impact:** Medium — adds authoritative biodiversity database links
**Scope:** ~98 trees missing GBIF links, ~45 missing IUCN links

- [ ] Script to auto-generate GBIF links from `scientificName` frontmatter
- [ ] Script to auto-generate IUCN Red List links from `scientificName`
- [ ] Add links as external resources in MDX frontmatter or body
- [ ] Validate all generated URLs resolve correctly

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

#### P3.1: OG Images for Comparison Detail Pages

**Status:** Not started
**Impact:** Medium

- [ ] Create `src/app/[locale]/compare/[slug]/opengraph-image.tsx`
- [ ] Include both species names and scientific names
- [ ] Follow pattern from existing OG images (PR #463)

#### P3.2: OG Images for Individual Tree Pages

**Status:** Not started
**Impact:** High — 175 tree pages are the most shared content

- [ ] Create `src/app/[locale]/trees/[slug]/opengraph-image.tsx`
- [ ] Include tree common name, scientific name, and visual element
- [ ] Generate dynamically from frontmatter data

#### P3.3: JSON-LD Enhancement for Tree Pages

**Status:** Partial — tree detail pages have some structured data

- [ ] Audit existing JSON-LD on tree detail pages
- [ ] Add `Species` or `BiologicalTaxon` schema where missing
- [ ] Include conservation status, distribution, images in structured data

#### P3.4: Sitemap Enhancements

- [ ] Verify sitemap includes all 175 species × 2 locales
- [ ] Add `<lastmod>` dates from `updatedAt` frontmatter
- [ ] Add comparison and glossary pages to sitemap
- [ ] Submit updated sitemap to Google Search Console

#### P3.5: Meta Description Optimization

- [ ] Audit meta descriptions across all page types
- [ ] Ensure descriptions are unique, 150–160 chars, with key terms
- [ ] Add meta descriptions to pages that lack them

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

#### P4.7: Accessibility Contrast Fixes (New)

**Status:** Not started
**Impact:** Medium — 4 remaining color contrast failures preventing Accessibility 100

- [ ] Skip-link: white on #5a9653 (3.54:1, needs 4.5:1) — darken green or use darker text
- [ ] Subtitle text: #9c7850 on #0f1a0f (4.43:1, needs 4.5:1) — lighten secondary slightly
- [ ] Primary links: #5a9653 on #1a2e1a (4.08:1, needs 4.5:1) — lighten primary in dark mode
- [ ] Card secondary text: #8b6e49 on #132012 (3.55:1, needs 4.5:1) — lighten or adjust background

#### P4.2: SSR Refactor Remaining Education Pages

**Status:** 4/6 done; 2 remaining
**Impact:** Medium — reduces client JS bundle for education section
**Pattern:** See `NEXT_AGENT_HANDOFF.md` "Established Patterns" section

- [ ] Refactor `ScavengerHuntClient` (1,491 lines) — create `scavenger-hunt-data.ts`, pass `lessonData` prop
- [ ] Refactor `TreeJournalClient` (1,305 lines) — create `tree-journal-data.ts`, pass `lessonData` prop

#### P4.3: Split Large Client Components

**Status:** Not started
**Impact:** Medium — improves maintainability and bundle splitting

- [ ] `ScavengerHuntClient` (1,491 lines) — break into sub-components
- [ ] `TreeMapClient` (1,387 lines) — break into sub-components
- [ ] `TreeJournalClient` (1,305 lines) — break into sub-components

#### P4.4: Database Query Optimization

**Status:** Not started (requires active DB usage)

- [ ] Add database indexes for common query patterns
- [ ] Implement connection pooling optimization
- [ ] Add query caching where appropriate

#### P4.5: CSP Optimization (Manual Sprint — Requires Human)

**Scope:** 30+ components with inline `style={{...}}`

- [ ] Refactor inline styles to CSS modules or Tailwind classes
- [ ] Extensive cross-browser testing for layout regressions
- [ ] Estimated 1–2 weeks effort

---

### P5: Testing & Reliability (Medium Impact)

#### P5.1: API Route Test Coverage

**Status:** Zero test coverage for API routes
**Impact:** Medium — API routes handle admin actions, voting, proposals

- [ ] Tests for `/api/admin/images/proposals` endpoints (CRUD)
- [ ] Tests for `/api/images/vote` and `/api/images/flag`
- [ ] Tests for authentication middleware
- [ ] Tests for rate limiting behavior

#### P5.2: Error Tracking Enhancement

**Status:** Current implementation is a stub (console.log only)
**Impact:** Medium — no visibility into production errors

- [ ] Install and configure Sentry SDK (or chosen provider)
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` environment variable
- [ ] Verify error boundaries report to Sentry
- [ ] Add source maps upload to build pipeline

#### P5.3: Content Validation Tests

- [ ] Tests for MDX frontmatter schema compliance
- [ ] Tests for bilingual parity (EN/ES file matching)
- [ ] Tests for broken internal links
- [ ] Tests for image reference integrity

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

| Order | Task                                               | Effort    | Impact       | Dependencies       |
| ----- | -------------------------------------------------- | --------- | ------------ | ------------------ |
| 1     | **P4.6**: LCP image optimization (AVIF, priority)  | Low       | **Critical** | None               |
| 2     | **P4.7**: Accessibility contrast fixes (4 issues)  | Low       | Medium       | None               |
| 3     | **P2.1**: Photo gallery sections (script exists)   | Low       | High         | None               |
| 4     | **P2.2**: Applications/Uses body sections          | Low       | High         | None               |
| 5     | **P2.3**: Seasonal phenology body sections         | Low       | Medium       | None               |
| 6     | **P2.4**: GBIF/IUCN external links                 | Low       | Medium       | None               |
| 7     | **P3.2**: OG images for tree detail pages          | Medium    | High         | None               |
| 8     | **P3.1**: OG images for comparison detail pages    | Low       | Medium       | None               |
| 9     | **P4.2**: SSR refactor 2 remaining education pages | Medium    | Medium       | None               |
| 10    | **P5.1**: API route test coverage                  | Medium    | Medium       | None               |
| 11    | **P4.3**: Split large client components            | Medium    | Medium       | None               |
| 12    | **P3.4**: Sitemap enhancements                     | Low       | Medium       | None               |
| 13    | **P5.2**: Error tracking (Sentry)                  | Low       | Medium       | Sentry account     |
| 14    | **P6.1**: User photo uploads                       | High      | Medium       | B4 (cloud storage) |
| 15    | **P6.3**: Public API for researchers               | High      | Medium       | None               |
| 16    | **P7.1–3**: Additional languages                   | Very High | Medium       | Native speakers    |

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
| Testing        | Test pass rate       | 324/324     | 324/324               | 100%          | — ✅          |
| SEO            | Score                | 92          | **100**               | 100           | **+8** ✅     |
| SEO            | Pages with JSON-LD   | ~10         | ~10                   | All key pages | —             |
| SEO            | Pages with OG images | ~8          | ~8                    | All key pages | —             |

---

**Last Comprehensive Review:** 2026-02-25 (post-PR #466 deploy)
**Next Milestones:** LCP image optimization (P4.6) → A11y contrast fixes (P4.7) → Content batch enrichment (P2.1–P2.4) → OG images (P3.1–P3.2) → Community Features (P6)
