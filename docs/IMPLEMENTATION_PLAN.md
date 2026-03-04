# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-03-01
**Status:** v1.1 — Core site complete. LCP image optimization shipped. 32MB client bundle eliminated. Focusing on search UX, community features, and remaining performance work.

---

## Status Dashboard

### Content Coverage

| Metric             | Count                                                   | Status      |
| ------------------ | ------------------------------------------------------- | ----------- |
| Species documented | 175 (EN + ES)                                           | ✅ Complete |
| Comparison guides  | 20 (EN + ES)                                            | ✅ Complete |
| Glossary terms     | 150 (EN + ES)                                           | ✅ Complete |
| Care guidance      | 175/175                                                 | ✅ Complete |
| Photo galleries    | 174/175 (1 intentionally excluded; no photos available) | ✅ Complete |
| GBIF + IUCN links  | 175/175                                                 | ✅ Complete |
| Bilingual parity   | 100%                                                    | ✅ Complete |

### Technical Health

| Metric          | Current (Mar 1)                         | Target | Status                                                                        |
| --------------- | --------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| Lighthouse Perf | **99** (desktop) / **90** (mobile)      | >90    | ✅ Desktop exceeds target; mobile meets target                                |
| LCP             | **0.8s** (desktop) / **3.6s** (mobile)  | <2.5s  | ✅ Desktop excellent; 🟡 mobile limited by CPU throttle + render-blocking CSS |
| TBT             | **0 ms** (desktop) / **20 ms** (mobile) | <200ms | ✅ Fixed                                                                      |
| FCP             | **0.4s** (desktop) / **1.5s** (mobile)  | <1.8s  | ✅ Fixed                                                                      |
| CLS             | **0**                                   | <0.1   | ✅ Perfect                                                                    |
| TTI             | **0.8s** (desktop) / **4.4s** (mobile)  | <5s    | ✅ Fixed                                                                      |
| Accessibility   | **96**                                  | 100    | 🟡 One contrast issue remaining (subtitle text)                               |
| SEO             | **100**                                 | 100    | ✅ Perfect                                                                    |
| Best Practices  | **96**                                  | 100    | 🟡 Minor                                                                      |
| Tests           | **623/623**                             | 100%   | ✅ All passing                                                                |
| Lint errors     | **0**                                   | 0      | ✅                                                                            |

### Performance Budgets

| Resource          | Budget | Current                       | Status                                                                                         |
| ----------------- | ------ | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| JavaScript        | <300KB | ~553KB (uncompressed, shared) | 🟡 Shared framework JS still over budget; 32MB contentlayer client bundle eliminated from /map |
| CSS               | <100KB | ~27KB (2 chunks)              | ✅ (560ms render-blocking on simulated mobile)                                                 |
| Images (Hero)     | <100KB | ~52KB (mobile-lg AVIF)        | ✅ Re-compressed from 206KB (75% reduction)                                                    |
| Images (Cards)    | <100KB | ~199KB largest                | 🟡 Served via next/image; quality lowered to 60                                                |
| Total Page Weight | <2MB   | ~1.8 MB                       | ✅                                                                                             |

---

## Remaining Work — Priority Order

### 1. LCP Image Optimization (P4.6) — ✅ Complete

**Impact:** Critical — LCP improved from 4.0s to 0.8s (desktop) / 3.6s (mobile)
**Effort:** Low
**Result:** Desktop Lighthouse Performance 85 → 99; Mobile 49 → 90

| Hero Image     | Before | After | Reduction |
| -------------- | ------ | ----- | --------- |
| mobile.avif    | 129KB  | 31KB  | 76%       |
| mobile-lg.avif | 206KB  | 52KB  | 75%       |
| desktop.avif   | 268KB  | 98KB  | 63%       |

- [x] Re-compress hero AVIF/WebP/JPEG images (75% average reduction)
- [x] Fix HeroImage srcset descriptors (1920w → 1200w to match actual image dimensions)
- [x] Remove 9 orphaned hero image files (tablet, desktop-2x, original variants)
- [x] Lower SafeImage default quality (75 → 60) for all next/image usage
- [x] Lower TreeOfTheDay quality (70 → 55) and HeroImage JPEG fallback (85 → 60)
- [x] Audit `next/image` config — AVIF already prioritized in `formats` array
- [x] Verify `priority` + `fetchpriority="high"` on hero image
- [x] Add `optimize-hero-images-lcp.mjs` script for reproducible hero compression
- [x] Re-run Lighthouse — desktop LCP 0.8s (score 97), mobile LCP 3.6s (score 62)
- [ ] Investigate 560ms render-blocking CSS on mobile — consider critical CSS extraction (see P4.7 below)

### 2. Render-Blocking CSS (P4.7) — Low Priority

**Impact:** Low-Medium — 560ms estimated savings on simulated mobile 3G
**Effort:** Medium
**Root cause:** Two Tailwind CSS chunks (26KB + 1.3KB) block first render on throttled mobile connections

- [ ] Evaluate critical CSS extraction (e.g., `critters` or manual above-the-fold inlining)
- [ ] Consider splitting Tailwind into critical/deferred chunks
- [ ] Re-run mobile Lighthouse to validate FCP/LCP improvement

### 3. Search Autocomplete (P9.7) — ✅ Complete

**Impact:** High — improves core UX for finding trees
**Effort:** Medium
**Current:** Fuse.js fuzzy search (lazy-loaded), autocomplete dropdown on `/trees` page

- [x] Add search suggestions dropdown to QuickSearch component
- [x] Show top 5 matching trees with scientific names as user types
- [x] Keyboard navigation for suggestions (ArrowUp/Down, Enter to select, Escape to close)
- [x] Debounce input (200-300ms) to avoid excessive searches

### 4. Region/Province Filter (P9.8) — ✅ Complete

**Impact:** Medium — Costa Rican users want to find trees in their region
**Effort:** Medium
**Current:** Province dropdown filter on `/trees` page, URL param persistence for all filters

- [x] Add province/region filter to tree directory (`/trees` page)
- [x] Filter by Costa Rican provinces: San José, Alajuela, Cartago, Heredia, Guanacaste, Puntarenas, Limón
- [x] Cross-reference with tree `distribution` frontmatter data
- [x] Persist filter selection in URL params for shareability

### 5. Advanced Search & Filtering (P9.10) — Medium

**Impact:** Medium — power users and researchers need precise filtering
**Effort:** Medium

- [x] Filter by bloom time, size, uses, conservation status
- [x] Combine multiple filters with AND/OR logic
  - Multi-select dropdowns for family, conservation status, province, height range, and use category
  - OR logic within each filter category, AND logic across categories
  - Active filter chips with individual removal and "Clear All"
  - Backward-compatible localStorage migration for existing users
  - URL params support comma-separated multi-values
- [x] Save search preferences (Zustand persist)
- [ ] Search analytics — track common queries to improve content

### 6. Community Contributions — Remaining (P6.2) — ✅ Complete

**Impact:** Medium — community engagement features
**Effort:** High
**Already done:** Submit species/corrections (`/contribute`), rate trees (`TreeRating`), photo upload (`/contribute/photo`)

- [x] Share local knowledge and traditional uses (form + admin review workflow)
  - Fixed: region field now saved to DB, "Share local knowledge" CTA rendered on tree pages, URL params pre-select type/tree
- [x] User reputation system (track contributions, display badges, tiered trust levels)
  - ContributorProfile model, reputation API, 9 badges, 4 trust levels, profile page, BadgeDisplay component
  - Admin view shows contributor trust level and reputation score
  - 46 new tests (39 unit + 7 API)

### 7. Offline Enhancements (P8.2) — Lower

**Impact:** Medium — useful for fieldwork in areas without connectivity
**Effort:** High
**Current:** Basic PWA with service worker

- [ ] Download individual species for offline use
- [ ] Offline search functionality (IndexedDB-backed)
- [ ] Background sync for offline-created data (ratings, contributions)

### 8. Performance Monitoring Dashboard (P8.3) — Lower

**Impact:** Low-Medium — developer-facing, ensures no regressions
**Effort:** Medium

- [ ] Real-time Core Web Vitals tracking (Vercel Analytics or custom)
- [ ] Bundle size tracking per route
- [ ] Error tracking integration (Sentry — stub exists at `src/lib/error-tracking.ts`)

### 9. Additional Languages (P7) — Future

**Impact:** Medium — expands audience beyond EN/ES
**Effort:** Very High — requires native speaker review for each language
**Blocked:** Needs native speakers for validation

| Language   | Locale | Target Audience                    | Status      |
| ---------- | ------ | ---------------------------------- | ----------- |
| Portuguese | `pt`   | Brazilian researchers and tourists | Not started |
| German     | `de`   | European ecotourists               | Not started |
| French     | `fr`   | European and Canadian users        | Not started |

Each language requires: locale config, `messages/{locale}.json`, all UI string translation, content translation (175 species × MDX), native speaker review.

---

## Human-Only Tasks

These items require human action and cannot be automated:

| Task                                         | Why Human Required                              | Status      |
| -------------------------------------------- | ----------------------------------------------- | ----------- |
| **Indigenous terminology research** (P2.5)   | Must be validated by Bribri/Cabécar communities | Not started |
| **Elder interviews & oral histories** (P2.6) | Requires fieldwork and community trust          | Not started |
| **Translation review** for PT/DE/FR (P7)     | Machine translation needs native speaker review | Not started |
| **Install `@sentry/nextjs`** + configure DSN | Requires Sentry account + Vercel env config     | Not started |

---

## Completed Work Archive

> Summary of all completed priorities. Full checklist details preserved in git history prior to this cleanup.

### Core Platform (P0) — Complete

- Admin authentication with JWT sessions, MFA (TOTP + AES-256-GCM encryption, Argon2id backup codes)
- Safety system: filters, `/safety` page, SafetyCard/Icon/Warning, 100% coverage, bilingual
- Image review system: proposal/vote/audit DB models, admin dashboard, public voting, rate limiting
- Database: Neon PostgreSQL via Vercel integration, Prisma 7, admin user created
- DB query optimization: 3 indexes added, migration deployed

### Content (P1 + P2) — Complete

- 175 species (EN + ES), 20 comparison guides, 150 glossary terms — all bilingual
- Care guidance for all 175 species (watering, fertilization, pruning, pest management, companion planting)
- Photo galleries for 174/175 trees (orey has no iNaturalist photos)
- GBIF + IUCN links for all 175 trees
- Uses and seasonal body sections confirmed for all trees
- All pages expanded to 600+ lines — no short pages remain
- Content standardization: 111 enum values normalized, 121 glossary references fixed, 391 invalid references removed

### SEO & Discoverability (P3) — Complete

- OG images for tree detail, comparison detail, trees index, compare index, glossary index, education pages
- JSON-LD structured data (Taxon schema) on tree detail pages
- Sitemap with all 175 species × 2 locales, `<lastmod>` dates, submitted to Google Search Console
- Meta descriptions optimized across all 39 page types
- Cache headers on tree/compare/glossary detail pages

### Performance (P4) — ✅ Complete

- Lighthouse: 68 → 99 desktop / 90 mobile. LCP: 4.0s → 0.8s desktop / 3.6s mobile. TBT: 1,940ms → 0ms. FCP: 2.1s → 0.4s. SEO: 92 → 100.
- **P4.6 LCP optimization (Mar 2026):** Hero images re-compressed (75% avg reduction), srcset fixed, SafeImage quality default lowered (75→60), 9 orphaned hero files removed
- 6 MB contentlayer client bundle eliminated (QuickSearch, RecentlyViewedList, FavoritesContent refactored)
- 51 unused packages removed, Fuse.js lazy-loaded, 6 heavy client components dynamically imported
- 15+ server component migrations (Header, Footer, SafetyCard, HeroImage, Breadcrumbs, etc.)
- MDX code-split from 958-line monolith into 8 individual files
- Hero image AVIF re-encoded (47-64% smaller), edge caching, resource hints, service worker
- `content-visibility: auto` on below-fold sections, `<noscript>` fallbacks
- CSP inline styles reduced from 54 to ~30 (irreducible runtime values)
- SSR refactor: all 6 education pages, ScavengerHunt/TreeJournal/TreeMap client components split
- Accessibility contrast fixes: 4 color contrast failures fixed (dark mode skip-link, subtitle, primary links, card text)
- **P4.8 Map page bundle (Mar 2026):** Eliminated 32MB contentlayer client bundle from `/map` page by projecting only 10 required fields server-side instead of shipping all 175 tree MDX bodies to the client. Total client JS chunks reduced from 33MB to 2.1MB.

### Testing & Reliability (P5) — Complete

- 577 tests total: 107 API route tests, 48 content validation, 23 Cloudinary upload, 36 test files
- Error tracking: Sentry-ready integration with graceful console fallback (stub at `src/lib/error-tracking.ts`)
- Content validation: frontmatter schema, bilingual parity, image integrity, cross-content checks

### Community Features (P6) — Partially Complete

- Photo upload system: drag-drop UI, Cloudinary integration, admin review, rate limiting, 23 API tests
- Public API: 7 RESTful v1 endpoints, search/filter, rate limiting, OpenAPI/Swagger docs
- Contributions page: submit species, suggest corrections
- TreeRating component on every tree page
- Contribute CTA on every tree detail page

### Navigation & i18n Polish (P9.1–P9.6) — Complete

- Desktop navigation: 10 flat links → 4 top-level + 4 dropdown groups (Explore, Learn, Community, Tools)
- NavDropdown component: hover, keyboard (Enter/Space/ArrowDown/Escape), click-outside, ARIA
- Mobile navigation: collapsible grouped sections matching desktop structure
- Footer rebuilt: copyright-only → 4-column link groups + tagline
- Glossary detail page: 10 hardcoded English strings fixed with `getTranslations`
- error.tsx, RecentlyViewedList, Header subtitle: all inline locale ternaries → `useTranslations`
- ~60 new i18n keys added to both `en.json` and `es.json`

### Infrastructure — Complete

- Pre-commit hooks (Husky + lint-staged + commitlint)
- Cloudinary integration for image uploads (SDK, CDN delivery, env validation)
- All environment variables configured in Vercel Dashboard
- Image optimization: 128/128 images optimized

---

## Known Gotchas

> Persistent issues and context that agents should be aware of.

- `orey` is the only tree without an iNaturalist gallery (no photos available — intentional)
- `'unsafe-inline'` in CSP `style-src` is intentional (irreducible runtime values)
- Sentry DSN not yet configured in Vercel env vars (works via console fallback)
- `useSearchParams()` in TreeExplorer requires Suspense boundary — provided by `next/dynamic` loading fallback
- 560ms render-blocking CSS on simulated mobile (two Tailwind chunks: 26KB + 1.3KB); marginal gains from splitting may not be worth complexity — see P4.7
- **Never import `allTrees`/`allGlossaryTerms`/`allSpeciesComparisons` in `"use client"` components** — this ships the full contentlayer dataset (32MB+) to the browser. Always pass projected data from a server component via props.

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

---

**Last Comprehensive Review:** 2026-03-01 (LCP optimization completed, Lighthouse re-measured, plan updated)
**Next Milestones:** Render-blocking CSS (P4.7) → Search analytics (P9.10 remaining) → Offline enhancements (P8.2)
