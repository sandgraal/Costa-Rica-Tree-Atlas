# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-02-25
**Status:** v1.0 Complete | Active Development on Content Enrichment, SEO, Performance, and Community Features

---

## Manual Tasks & Blockers

> Items that require a real person to act (deploys, accounts, partnerships, measurements).

### Active Blockers

| #   | Blocker                                                                                                                       | Blocks                          | Owner |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----- |
| B3  | **Lighthouse Performance score 43/100** — Re-measured Feb 25; LCP 36.2s and TBT 2,610ms are critical (see P4 for action plan) | Perf goals not met (target >90) | Human |
| B4  | **No cloud image storage configured** — Cloudinary or S3 bucket not set up                                                    | Community photo uploads (P6.1)  | Human |

### Manual Steps Required

#### Performance Validation (B3)

- [x] Run Lighthouse audit on production URL after latest deploys (target: >90 Performance) — **Done Feb 25**
- [x] Record actual LCP and TBT from production audit — **LCP 36.2s, TBT 2,610ms**
- [x] Update metrics in the Status Dashboard below with real numbers
- [ ] Investigate and fix LCP regression (36.2s vs 6.0s baseline — likely redirect chain + JS bundle)
- [ ] Reduce TBT from 2,610ms to <200ms target
- [ ] Re-run Lighthouse after fixes to confirm improvement

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

| Metric           | Current                        | Target | Status                                           |
| ---------------- | ------------------------------ | ------ | ------------------------------------------------ |
| Lighthouse Score | 43/100 (Feb 25 re-measurement) | >90    | 🔴 Regressed from 48 baseline; needs urgent work |
| LCP              | 36.2s (Feb 25)                 | <2.5s  | 🔴 Critical — redirect chain + heavy JS bundle   |
| TBT              | 2,610ms (Feb 25)               | <200ms | 🔴 Critical — 5.1s JS execution on main thread   |
| FCP              | 2.0s (Feb 25)                  | <1.8s  | 🟡 Close to target                               |
| CLS              | 0 (Feb 25)                     | <0.1   | ✅ Excellent                                     |
| Speed Index      | 3.8s (Feb 25)                  | <3.4s  | 🟡 Needs improvement                             |
| Accessibility    | 96/100 (Feb 25)                | >90    | ✅ Passing                                       |
| Best Practices   | 100/100 (Feb 25)               | >90    | ✅ Perfect                                       |
| SEO              | 92/100 (Feb 25)                | >90    | ✅ Passing                                       |
| Tests            | 324/324 passing (19 files)     | 100%   | ✅                                               |
| Lint errors      | 0                              | 0      | ✅                                               |
| Images optimized | 128/128                        | 100%   | ✅                                               |
| Database         | Neon PostgreSQL deployed       | —      | ✅                                               |
| Auth + MFA       | JWT, TOTP, backup codes        | —      | ✅                                               |
| Safety system    | 100% coverage, filters live    | —      | ✅                                               |

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

### Performance Work Done (Partial — needs re-measurement)

- **PR #446 (merged)**: Removed 51 unused packages, dead code, `optimizePackageImports` (~70–90KB saved per page)
- **PR #447 (merged)**: Fuse.js lazy-loaded (~30KB deferred), 4/6 education pages SSR-refactored
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

#### P4.1: Lighthouse Re-measurement — DONE (Feb 25)

- [x] Run Lighthouse on production after latest deploys
- [x] Identify remaining bottlenecks from audit results

**Results (Feb 25, Lighthouse CLI, headless Chrome):**

| Category       | Score |
| -------------- | ----- |
| Performance    | 43    |
| Accessibility  | 96    |
| Best Practices | 100   |
| SEO            | 92    |

**Critical findings:**

- **LCP 36.2s** — Largest Contentful Paint is catastrophic; likely caused by redirect chain (~845ms) combined with heavy JS blocking render
- **TBT 2,610ms** — Total Blocking Time from 6.5s main-thread work (5.1s JS execution)
- **Multiple redirects** — `costaricatreeatlas.org` → `costaricatreeatlas.org/en/` adds ~845ms
- **FCP 2.0s** — Acceptable but could be faster
- **CLS 0** — Excellent, no layout shift

**Targeted optimization plan:**

- [ ] Eliminate redirect chain (configure Vercel redirect or default locale at edge)
- [ ] Audit and reduce JS bundle size — TBT 2,610ms indicates massive client-side JS
- [ ] Investigate LCP element — determine what content is being measured as LCP
- [ ] Consider moving more components to Server Components to reduce client JS
- [ ] Profile remaining `"use client"` components for tree-shaking opportunities
- [ ] Re-run Lighthouse after each optimization round

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

| Order | Task                                               | Effort    | Impact | Dependencies       |
| ----- | -------------------------------------------------- | --------- | ------ | ------------------ |
| 1     | **P2.1**: Photo gallery sections (script exists)   | Low       | High   | None               |
| 2     | **P2.2**: Applications/Uses body sections          | Low       | High   | None               |
| 3     | **P2.3**: Seasonal phenology body sections         | Low       | Medium | None               |
| 4     | **P2.4**: GBIF/IUCN external links                 | Low       | Medium | None               |
| 5     | **P4.1**: Lighthouse re-measurement                | Low       | High   | B3 (deploy)        |
| 6     | **P3.2**: OG images for tree detail pages          | Medium    | High   | None               |
| 7     | **P3.1**: OG images for comparison detail pages    | Low       | Medium | None               |
| 8     | **P4.2**: SSR refactor 2 remaining education pages | Medium    | Medium | None               |
| 9     | **P5.1**: API route test coverage                  | Medium    | Medium | None               |
| 10    | **P4.3**: Split large client components            | Medium    | Medium | None               |
| 11    | **P3.4**: Sitemap enhancements                     | Low       | Medium | None               |
| 12    | **P5.2**: Error tracking (Sentry)                  | Low       | Medium | Sentry account     |
| 13    | **P6.1**: User photo uploads                       | High      | Medium | B4 (cloud storage) |
| 14    | **P6.3**: Public API for researchers               | High      | Medium | None               |
| 15    | **P7.1–3**: Additional languages                   | Very High | Medium | Native speakers    |

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

| Resource          | Budget | Estimated Current | Status                      |
| ----------------- | ------ | ----------------- | --------------------------- |
| JavaScript        | <300KB | ~400KB            | ⚠️ Over (re-measure needed) |
| CSS               | <100KB | ~80KB             | ✅ Good                     |
| Images (Hero)     | <200KB | ~150KB (AVIF)     | ✅ Good                     |
| Total Page Weight | <2MB   | ~2.5MB            | ⚠️ Over (re-measure needed) |

### Success Metrics

| Category    | Metric               | Current       | Target        |
| ----------- | -------------------- | ------------- | ------------- |
| Content     | Species count        | 175           | 175+          |
| Content     | Care guidance        | 100%          | 100%          |
| Content     | Comparison guides    | 20            | 20+           |
| Content     | Glossary terms       | 150           | 150+          |
| Performance | Lighthouse           | 48 (stale)    | >90           |
| Performance | LCP                  | 6.0s (stale)  | <2.5s         |
| Performance | TBT                  | 440ms (stale) | <200ms        |
| Testing     | Test pass rate       | 324/324       | 100%          |
| SEO         | Pages with JSON-LD   | ~10           | All key pages |
| SEO         | Pages with OG images | ~8            | All key pages |

---

**Last Comprehensive Review:** 2026-02-25
**Next Milestones:** Content batch enrichment (P2.1–P2.4) → Lighthouse re-measurement (P4.1) → OG images for remaining pages (P3.1–P3.2) → Community Features (P6)
