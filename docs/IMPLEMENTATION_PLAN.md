# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-02-28
**Status:** v1.1 — Core site complete. Navigation, footer, and i18n polish shipped. Focusing on performance, search UX, and community features.

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

| Metric          | Current (Feb 28) | Target | Status                                                  |
| --------------- | ---------------- | ------ | ------------------------------------------------------- |
| Lighthouse Perf | **85**           | >90    | 🟡 Below target; LCP (4.0s) is the remaining bottleneck |
| LCP             | **4.0 s**        | <2.5s  | 🔴 Homepage tree card images served as JPEG, not AVIF   |
| TBT             | **30 ms**        | <200ms | ✅ Fixed                                                |
| FCP             | **2.1 s**        | <1.8s  | 🟡 300ms render-blocking CSS                            |
| CLS             | **0**            | <0.1   | ✅ Perfect                                              |
| TTI             | **4.2 s**        | <5s    | ✅ Fixed                                                |
| Accessibility   | **96**           | 100    | 🟡 Contrast fixes shipped; needs re-measurement         |
| SEO             | **100**          | 100    | ✅ Perfect                                              |
| Best Practices  | **100**          | 100    | ✅ Perfect                                              |
| Tests           | **623/623**      | 100%   | ✅ All passing                                          |
| Lint errors     | **0**            | 0      | ✅                                                      |

### Performance Budgets

| Resource          | Budget | Current                     | Status                                                               |
| ----------------- | ------ | --------------------------- | -------------------------------------------------------------------- |
| JavaScript        | <300KB | ~553KB (uncompressed, main) | 🔴 Over budget (~553KB > 300KB). 23KB unused JS remains to be pruned |
| CSS               | <100KB | ~80KB                       | ✅ (300ms render-blocking chunk to investigate)                      |
| Images (Cards)    | <100KB | ~270KB largest              | 🔴 Not using AVIF/WebP                                               |
| Total Page Weight | <2MB   | ~1.6 MB                     | ✅                                                                   |

---

## Remaining Work — Priority Order

### 1. LCP Image Optimization (P4.6) — Critical

**Impact:** Critical — LCP 4.0s (score 49) is the single biggest drag on Lighthouse Performance
**Effort:** Low
**Root cause:** Homepage tree card images served as JPEG through `_next/image` instead of modern formats

| Image            | Current | Waste |
| ---------------- | ------- | ----- |
| ciprecillo.jpg   | 270KB   | 218KB |
| ajo.jpg          | 185KB   | 133KB |
| coyol.jpg        | 184KB   | 115KB |
| cristobalito.jpg | 98KB    | 46KB  |

- [ ] Convert homepage tree card images to AVIF/WebP with proper `sizes` and `srcSet`
- [ ] Audit `next/image` config — ensure AVIF is prioritized in `formats` array
- [ ] Add `priority` prop to above-the-fold LCP image (hero or first tree card)
- [ ] Investigate 300ms render-blocking CSS — consider critical CSS extraction or async loading
- [ ] Re-run Lighthouse to validate LCP improvement (target: <2.5s)

### 2. Search Autocomplete (P9.7) — ✅ Complete

**Impact:** High — improves core UX for finding trees
**Effort:** Medium
**Current:** Fuse.js fuzzy search (lazy-loaded), autocomplete dropdown on `/trees` page

- [x] Add search suggestions dropdown to QuickSearch component
- [x] Show top 5 matching trees with scientific names as user types
- [x] Keyboard navigation for suggestions (ArrowUp/Down, Enter to select, Escape to close)
- [x] Debounce input (200-300ms) to avoid excessive searches

### 3. Region/Province Filter (P9.8) — Medium

**Impact:** Medium — Costa Rican users want to find trees in their region
**Effort:** Medium

- [ ] Add province/region filter to tree directory (`/trees` page)
- [ ] Filter by Costa Rican provinces: San José, Alajuela, Cartago, Heredia, Guanacaste, Puntarenas, Limón
- [ ] Cross-reference with tree `distribution` frontmatter data
- [ ] Persist filter selection in URL params for shareability

### 4. Advanced Search & Filtering (P9.10) — Medium

**Impact:** Medium — power users and researchers need precise filtering
**Effort:** Medium

- [ ] Filter by bloom time, size, uses, conservation status
- [ ] Combine multiple filters with AND/OR logic
- [ ] Save search preferences (Zustand persist)
- [ ] Search analytics — track common queries to improve content

### 5. Community Contributions — Remaining (P6.2) — ✅ Complete

**Impact:** Medium — community engagement features
**Effort:** High
**Already done:** Submit species/corrections (`/contribute`), rate trees (`TreeRating`), photo upload (`/contribute/photo`)

- [x] Share local knowledge and traditional uses (form + admin review workflow)
  - Fixed: region field now saved to DB, "Share local knowledge" CTA rendered on tree pages, URL params pre-select type/tree
- [x] User reputation system (track contributions, display badges, tiered trust levels)
  - ContributorProfile model, reputation API, 9 badges, 4 trust levels, profile page, BadgeDisplay component
  - Admin view shows contributor trust level and reputation score
  - 46 new tests (39 unit + 7 API)

### 6. Offline Enhancements (P8.2) — Lower

**Impact:** Medium — useful for fieldwork in areas without connectivity
**Effort:** High
**Current:** Basic PWA with service worker

- [ ] Download individual species for offline use
- [ ] Offline search functionality (IndexedDB-backed)
- [ ] Background sync for offline-created data (ratings, contributions)

### 7. Performance Monitoring Dashboard (P8.3) — Lower

**Impact:** Low-Medium — developer-facing, ensures no regressions
**Effort:** Medium

- [ ] Real-time Core Web Vitals tracking (Vercel Analytics or custom)
- [ ] Bundle size tracking per route
- [ ] Error tracking integration (Sentry — stub exists at `src/lib/error-tracking.ts`)

### 8. Additional Languages (P7) — Future

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

### Performance (P4) — Complete (except P4.6 LCP)

- Lighthouse: 68 → 85 (+17 points). TBT: 1,940ms → 30ms. TTI: 35.8s → 4.2s. SEO: 92 → 100.
- 6 MB contentlayer client bundle eliminated (QuickSearch, RecentlyViewedList, FavoritesContent refactored)
- 51 unused packages removed, Fuse.js lazy-loaded, 6 heavy client components dynamically imported
- 15+ server component migrations (Header, Footer, SafetyCard, HeroImage, Breadcrumbs, etc.)
- MDX code-split from 958-line monolith into 8 individual files
- Hero image AVIF re-encoded (47-64% smaller), edge caching, resource hints, service worker
- `content-visibility: auto` on below-fold sections, `<noscript>` fallbacks
- CSP inline styles reduced from 54 to ~30 (irreducible runtime values)
- SSR refactor: all 6 education pages, ScavengerHunt/TreeJournal/TreeMap client components split
- Accessibility contrast fixes: 4 color contrast failures fixed (dark mode skip-link, subtitle, primary links, card text)

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

**Last Comprehensive Review:** 2026-02-28 (Plan cleanup — consolidated completed work, reorganized remaining priorities by impact)
**Next Milestones:** LCP optimization → Search autocomplete → Region filter → Community contributions → Offline enhancements
