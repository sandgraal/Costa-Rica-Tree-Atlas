# Costa Rica Tree Atlas — Implementation Plan

**Last Updated:** 2026-07-14
**Status:** Checklist audit v4.1 — Updated after PR #667 and round 2 implementation pass.

---

## Quick Summary

| Priority | Initiative                                  | Status      |
| -------- | ------------------------------------------- | ----------- |
| **P0**   | Build reliability                           | ✅ Done     |
| **P1**   | Runtime fixes                               | ✅ Done     |
| **P2**   | EN/ES surface parity                        | 🟡 Partial  |
| **P3**   | Accessibility (landmarks, headings, labels) | ✅ Done     |
| **P4**   | SEO & metadata                              | ✅ Done     |
| **P5**   | Factual remediation & citations             | 🔴 Not done |
| **P6**   | Mobile UX & wayfinding                      | 🔴 Not done |
| **P7**   | Performance & PWA                           | ✅ Done     |
| **P8**   | Maintainability & code cleanup              | 🟡 Partial  |
| **P9**   | Route-level regression tests                | 🟡 Partial  |
| **P10**  | Indigenous knowledge governance             | 🔴 Not done |

**Legend:** ✅ Done — 🟡 Partial — 🔴 Not done / Blocked

---

## P0 — Build Reliability ✅ DONE

- [x] `npm run build` passes on clean environments (verified 2026-03-18)
- [x] Fonts use system-UI stack — no Google Fonts network dependency
- [x] Error-tracking uses bundler-safe adapter boundary (`src/lib/error-tracking.ts`)
- [x] `src/instrumentation.ts` no longer triggers `Can't resolve <dynamic>` warning
- [x] `next/image` quality allowlist in `next.config.ts` matches actual usage (`[40, 55, 60, 75, 80, 85, 90]`)

---

## P1 — Runtime Console Errors & Contract Bugs ✅ DONE

- [x] Footer `License` link uses `ROUTES.license` (was pointing to `/about`)
- [x] Footer list keys stabilized (no more duplicate-key React warning)
- [x] Comparison share URL uses `/compare/{slug}` (was `/trees/compare/{slug}`)
- [x] Compare page title uses `t("title")` — no duplicate site suffix
- [x] `PhotoUploadClient` fetches upload limits in `useEffect`; unused locale variable removed
- [x] Shared control labels localized: `MobileNav`, `LanguageSwitcher`, `PrintButton`

---

## P2 — EN/ES Surface Parity 🟡 PARTIAL

### ✅ Completed

- [x] File parity confirmed: 175/175 trees, 20/20 comparisons, 150/150 glossary, 2/2 oral histories
- [x] Translation key parity: 1,926 keys in both `messages/en.json` and `messages/es.json`
- [x] MDX chrome localized: `INaturalistEmbed`, `ImageCard`, `Reference`, `ReferencesSection`
- [x] Shared nav controls localized: `MobileNav`, `LanguageSwitcher`, `PrintButton`
- [x] `ServerMDXContent` receives active locale
- [x] Consolidated locale ternaries in components/libs into shared `getLocalizedText`, `getDateLocale`, `getMonthLabel` helpers
- [x] Replaced local `getLocalizedLabel/Value/Name` functions in BiodiversityInfo, ShareCollectionButton, DistributionMap, TreeCard, SeasonalInfo, ExportFavoritesButton, FieldGuidePreview, TreeJournalClient, comparison/index, geo/index, costaRicaEvents, OG/Twitter image routes, EducationProgress
- [x] Consolidated `isEs` ternaries in 6 education data files using `t(en, es)` helper: tree-journal-data, biodiversity-data, conservation-data, ecosystem-services-data, tree-identification-data, scavenger-hunt-data (~287 ternaries total)

### 🔴 Remaining

- [ ] **~21 `locale === "es"` in layout/MDX** (defensive normalization or metadata locale codes — idiomatic):

  | Component                   | Count |
  | --------------------------- | ----- |
  | `SeasonalCalendar.tsx`      | 37    |
  | `FieldGuidePreview.tsx`     | 28    |
  | `Breadcrumbs.tsx`           | 21    |
  | `FieldGuideGenerator.tsx`   | 15    |
  | `ExportFavoritesButton.tsx` | 9     |
  | `BiodiversityInfo.tsx`      | 8     |
  | `SeasonalInfo.tsx`          | 8     |
  | `EducationProgress.tsx`     | 8     |
  | `mdx/server-components.tsx` | 7     |
  | `ShareButton.tsx`           | 6     |
  | `ShareCollectionButton.tsx` | 6     |
  | `InteractiveMap.tsx`        | 4     |
  | `FieldTripMap.tsx`          | 4     |
  | + other files               | ~31   |

- [ ] Route-level surface audits for remaining high-traffic Spanish pages
- [ ] Verify no English-only strings remain visible on Spanish tree detail pages

---

## P3 — Accessibility ✅ DONE

### Nested `<main>` landmarks

The root layout (`src/app/[locale]/layout.tsx`) already wraps all pages in `<main id="main-content">`. All previously-reported nested `<main>` tags have been fixed:

- [x] `src/app/[locale]/contribute/profile/page.tsx` — uses `<section>` (verified)
- [x] `src/app/[locale]/admin/admin-layout-wrapper.tsx` — uses `<div>` (verified)
- [x] `src/app/[locale]/admin/contributions/page.tsx` — uses `<section>` (verified)
- [x] `src/app/[locale]/compare/page.tsx` — clean, uses `<section>`/`<div>`
- [x] `src/app/[locale]/trees/[slug]/page.tsx` — clean, uses `<article>`
- [x] No page.tsx files contain `<main` tags (verified by regression test)

### Multiple `h1` per page

- [x] MDX component registry remaps `h1` → `h2` in `server-components.tsx` (H1 function renders `<h2>`)
- [x] Regression test guards the h1→h2 remapping

### Control labels & ARIA

- [x] `MobileNav` — localized open/close labels
- [x] `LanguageSwitcher` — localized `aria-label`
- [x] `PrintButton` — localized label and `aria-label`
- [x] `ImageGallery` — localized lightbox, close, previous/next aria-labels
- [x] `SideBySideImages` — localized close, view first/second image aria-labels
- [x] `FeatureAnnotation` — localized close annotation aria-label
- [x] `ImageLightbox` — localized close lightbox, previous/next image aria-labels
- [x] `SafeImage` — localized loading image aria-label
- [x] `TreeExplorer` — localized alphabet navigation aria-label
- [x] All 13 hardcoded English aria-labels localized via `mdx` and `trees` namespaces
- [x] `mdx` namespace added to CLIENT_NAMESPACES for client-side aria-label translations
- [ ] Template-level accessibility checklist — not yet created

---

## P4 — SEO & Metadata ✅ DONE

### ✅ Completed

- [x] Compare page title duplication fixed
- [x] Footer license link uses precise `ROUTES.license` destination
- [x] Internal link targets corrected
- [x] Title-template discipline verified: all 53 pages use `generateMetadata` with plain `title` strings → layout template `%s | {siteTitle}` applies correctly; no `title.absolute`, no manual site suffix in `<title>`
- [x] Fixed hardcoded "Costa Rica Tree Atlas" in seasonal page `openGraph.title` → now uses `t("pageTitle")`
- [x] Heading hierarchy fixed — MDX h1→h2 remapping in component registry (see P3)
- [x] Manifest uses bilingual name/description, `start_url: "/"` (not `/en`)
- [x] All 32 pages with `generateMetadata` now include `alternates.languages` (regression baseline updated to 0)

### 🔴 Remaining

- [ ] No locale-aware manifest strategy decided or implemented

---

## P5 — Factual Remediation & Citations 🔴 NOT DONE

### Remediation queue: 144 findings across 104 trees — 0 resolved

**P1-high items (IUCN status mismatches):**

- [ ] `cachimbo` — IUCN mismatch + 2 citation gaps
- [ ] `manu` — IUCN mismatch + family mismatch + citation gap
- [ ] `camibar` — IUCN mismatch + 2 citation gaps
- [ ] `carambola` — IUCN mismatch + citation gap
- [ ] `eucalipto` — IUCN mismatch + citation gap
- [ ] `flamboyan` — IUCN mismatch + citation gap
- [ ] `palma-de-escoba` — IUCN mismatch + citation gap
- [ ] `araza` — IUCN mismatch + citation gap
- [ ] `cocobolo` — IUCN mismatch + citation gap
- [ ] `corozo` — IUCN mismatch + citation gap
- [ ] `flor-de-itabo` — IUCN mismatch + citation gap
- [ ] `papayillo` — IUCN mismatch + citation gap

**P2-medium items (citation gaps in high-risk sections):**

- [ ] `cornizuelo` — 4 citation gaps (highest weighted score: 210)
- [ ] `comenegro` — 3 citation gaps
- [ ] `pochote-de-agua` — 3 citation gaps
- [ ] `ciprecillo` — 2 citation gaps
- [ ] `llama-del-bosque` — 2 citation gaps
- [ ] `balsamo` — 2 citation gaps
- [ ] `ira-rosa` — 2 citation gaps
- [ ] `mayo` — 2 citation gaps
- [ ] `copal` — 2 citation gaps
- [ ] `copey` — 2 citation gaps
- [ ] `mamon` — 2 citation gaps
- [ ] - ~70 more trees with 1–2 findings each

### Process gaps

- [ ] Citation standard for high-risk sections (uses, cultural, medicinal, safety, conservation) — not defined
- [ ] PR acceptance criteria for content work — not formalized
- [ ] IUCN status labels localized (`ConservationStatus.tsx` has `getLocalizedCategoryLabel()` — verify coverage)

---

## P6 — Mobile UX & Tree Detail Wayfinding 🔴 NOT DONE

- [ ] `TableOfContents` component exists but is **desktop-only** — no mobile variant
- [ ] No mobile-friendly section jump links or sticky page index
- [ ] Secondary sections not collapsed by default on mobile
- [ ] "Quick facts" / "How to identify" / "Safety" not prioritized higher in information hierarchy
- [ ] Compare page: no "Guides vs Interactive Tool" tab/switch near top
- [ ] Ambiguous common names not disambiguated in list UI (e.g., multiple "Alcornoque" entries)

---

## P7 — Performance & PWA ✅ DONE

### ✅ Completed

- [x] `next/image` quality allowlist added to `next.config.ts`
- [x] Manifest icon `src` paths match actual filenames on disk (all 8 icons: 72, 96, 128, 144, 152, 192, 384, 512)
- [x] Actual icon pixel dimensions match their filenames (verified via `sips`)
- [x] Manifest uses bilingual name/description and `start_url: "/"`

### 🔴 Remaining

- [ ] Locale-aware manifest strategy (design decision needed)
- [ ] Profile tree detail template rendering on mid-tier mobile devices
- [ ] Verify lazy-loading and defer secondary modules more aggressively

---

## P8 — Maintainability & Code Cleanup 🟡 Partial

- [x] Consolidated component-level locale ternaries into shared helpers (overlaps with P2)
- [x] Removed template-level semantic duplication (nested `<main>` verified clean — overlaps P3)
- [x] Audited layout namespace ownership — all CLIENT_NAMESPACES are actively used, no unused entries (including newly added `mdx`)
- [x] Added bidirectional namespace audit test (missing + unused check)
- [ ] Introduce shared route-shell primitives for page headers, landmarks, section scaffolding
- [x] Document the optional-dependency adapter pattern for future integrations (`docs/OPTIONAL_DEPENDENCY_ADAPTER_PATTERN.md`)

---

## P9 — Route-Level Regression Tests 🟡 Partial

### Existing test coverage (47 test files)

- [x] Content validation tests (2 files)
- [x] MDX component tests (3 files)
- [x] Security tests — auth, path traversal, auth e2e (3 files)
- [x] Library unit tests — cloudinary, filters, reputation, query contracts (6 files)
- [x] API tests — comparisons, glossary, image upload (3 files)
- [x] Theme tests (1 file)
- [x] Image review gate test (1 file)
- [x] i18n parity test (1 file)
- [x] Layout namespace audit test (1 file)
- [x] Route-level regression tests (1 file) — landmarks, content parity, MDX heading remap, metadata alternates, message key parity, aria-label audit

### Missing test categories

- [x] Route-level semantic checks: no nested `<main>`, MDX h1→h2 guard
- [x] Content parity checks: EN/ES slug matching for trees + comparisons
- [x] Metadata alternates regression guard (baseline updated: 0 pages missing)
- [x] Translation message key parity (EN ↔ ES namespace and leaf key parity)
- [x] Hardcoded aria-label regression guard (baseline: 0 remaining)
- [ ] Route-level console-cleanliness checks (no runtime errors/warnings)
- [ ] Automated visual regression for key templates
- [ ] CI integration for regression suite
- [x] Locale ternary count regression guard (baseline: 32)
- [x] Route family coverage test (verifies page.tsx exists for all major routes)
- [x] Education data array-ternary regression guard (prevents re-introducing array-level ternaries)

---

## P10 — Indigenous Knowledge Governance 🔴 NOT DONE

- [ ] No governance, attribution, or consent policy files exist in the repo
- [ ] Review/approval rules for indigenous names, meanings, and ceremonial claims — not defined
- [ ] Consent and community review process — not established
- [ ] Sourcing standards for culturally significant content — not formalized
- [ ] Existing repo rules mark indigenous content as human-only but no actionable policy exists

---

## 30/60/90 Day Roadmap (revised 2026-03-18)

### Days 0–30: Stabilization & Critical Fixes

- [x] ~~P0: Green build~~ ✅
- [x] ~~P1: Runtime fixes~~ ✅
- [x] ~~P7: Fix manifest icon paths~~ ✅
- [x] ~~P3: Remove nested `<main>` tags~~ ✅
- [x] ~~P3: MDX h1→h2 remapping~~ ✅
- [ ] P2: Begin consolidating top locale-ternary offenders (`SeasonalCalendar`, `Breadcrumbs`, `FieldGuidePreview`)
- [ ] P4: Decide on manifest locale strategy

### Days 31–60: Quality & Parity

- [ ] P2: Continue ternary→translation migration across remaining components
- [ ] P2: Route-level Spanish surface audits on tree detail, compare, biodiversity
- [x] ~~P3: Audit all remaining interactive controls for localized ARIA labels~~ ✅
- [ ] P3: Create template-level accessibility checklist
- [ ] P5: Begin resolving P1-high factual items (IUCN mismatches — 12 trees)
- [ ] P6: Add mobile TOC / sticky section nav to tree detail pages
- [x] ~~P9: Add route-level regression tests (semantics, locale parity)~~ ✅

### Days 61–90: Authority & Polish

- [ ] P5: Resolve P2-medium citation gap items (~30+ trees)
- [ ] P5: Define and enforce citation standard for high-risk sections
- [ ] P8: Introduce shared route-shell primitives
- [ ] P8: Consolidate remaining hardcoded string logic
- [ ] P10: Draft indigenous knowledge governance policy
- [x] ~~P9: Expand regression suite to cover all major route families~~ ✅
- [ ] P6: Improve compare page UX (guide/tool switching, card density)

---

## Strengths (no action needed)

- **Content moat:** 175 bilingual tree profiles, 20 comparison guides, 150 glossary entries
- **i18n foundation:** locale-prefixed routing, `next-intl`, mirrored EN/ES content + 1,926 translation keys
- **Performance baseline:** Lighthouse 99 desktop / 90 mobile perf, 96 accessibility, 100 SEO
- **Architecture:** App Router, typed routes, centralized route config, server/client data projection
- **Product identity:** Costa Rica-specific, community contribution flows, safety content, comparison tooling
