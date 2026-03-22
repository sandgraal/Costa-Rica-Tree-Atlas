# Costa Rica Tree Atlas — Implementation Plan

**Last Updated:** 2026-03-22
**Status:** Checklist audit v4.5 — Updated after locale-aware manifest decision, console-log cleanup pass, and factual remediation policy alignment.

---

## Quick Summary

| Priority | Initiative                                  | Status      | Notes                                              |
| -------- | ------------------------------------------- | ----------- | -------------------------------------------------- |
| **P0**   | Build reliability                           | ✅ Done     |                                                    |
| **P1**   | Runtime fixes                               | ✅ Done     |                                                    |
| **P2**   | EN/ES surface parity                        | 🟡 Partial  | <!-- localized public component strings PR#TBD --> |
| **P3**   | Accessibility (landmarks, headings, labels) | ✅ Done     |                                                    |
| **P4**   | SEO & metadata                              | ✅ Done     |                                                    |
| **P5**   | Factual remediation & citations             | 🔴 Not done |                                                    |
| **P6**   | Mobile UX & wayfinding                      | 🟡 Partial  |                                                    |
| **P7**   | Performance & PWA                           | ✅ Done     |                                                    |
| **P8**   | Maintainability & code cleanup              | 🟡 Partial  |                                                    |
| **P9**   | Route-level regression tests                | 🟡 Partial  |                                                    |
| **P10**  | Indigenous knowledge governance             | 🔴 Not done |                                                    |

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
- [x] Conservation lesson status counts and endangered-tree list now use actual IUCN codes from content data (`CR`/`EN`/`VU`/etc.) instead of mismatched English labels

---

## P2 — EN/ES Surface Parity 🟡 PARTIAL

### ✅ Completed

- [x] File parity confirmed: 175/175 trees, 20/20 comparisons, 150/150 glossary, 2/2 oral histories
- [x] Translation key parity: 1,979 keys in both `messages/en.json` and `messages/es.json`
- [x] MDX chrome localized: `INaturalistEmbed`, `ImageCard`, `Reference`, `ReferencesSection`
- [x] Shared nav controls localized: `MobileNav`, `LanguageSwitcher`, `PrintButton`
- [x] `ServerMDXContent` receives active locale
- [x] Consolidated locale ternaries in components/libs into shared `getLocalizedText`, `getDateLocale`, `getMonthLabel` helpers
- [x] Replaced local `getLocalizedLabel/Value/Name` functions in BiodiversityInfo, ShareCollectionButton, DistributionMap, TreeCard, SeasonalInfo, ExportFavoritesButton, FieldGuidePreview, TreeJournalClient, comparison/index, geo/index, costaRicaEvents, OG/Twitter image routes, EducationProgress
- [x] Consolidated `isEs` ternaries in 6 education data files using `t(en, es)` helper: tree-journal-data, biodiversity-data, conservation-data, ecosystem-services-data, tree-identification-data, scavenger-hunt-data (~287 ternaries total)
- [x] Localized public-facing component strings: TreeGallery, GlossaryTooltip, ConservationStatus (IUCN Red List label), PageErrorBoundary, HeroImage alt text
- [x] Localized MDX care components: PlantingInstructions, MaintenanceTimeline, CommonProblems (bilingual inline translations)
- [x] Exported Badge helpers from EducationProgress; CertificateClient reuses shared functions
- [x] Removed hardcoded English from education loading.tsx
- [x] Consolidated remaining ad-hoc locale selection branches into shared `selectLocalizedValue` helper across education data builders, `ShareButton`, and `EducationProgress`
- [x] Localized remaining high-traffic parity leaks on tree-detail biodiversity stats and compare-detail not-found fallbacks (including social image fallbacks)
- [x] Localized education landing-page CTAs and printable-resource link; regression audit now guards those Spanish surfaces against English fallback copy
- [x] Localized oral-history detail not-found metadata and added regression coverage so missing Spanish entries do not fall back to English page titles
- [x] Localized remaining English helper copy in the interactive compare tool (`Clear all`, max-tree cap, remove-chip aria labels, overflow copy) and added regression coverage for its Spanish surface
- [x] Replaced English-only static social-image alt exports on locale-prefixed trees, glossary, education, and compare routes with bilingual alt text; regression audit now guards those OG/Twitter routes against English-only alt regressions
- [x] Localized dynamic MDX ARIA labels for glossary definition triggers and side-by-side image lightboxes; regression audit now guards those expression-based Spanish surfaces against English fallback copy
- [x] Localized remaining English-only education progress labels and fallback classroom/demo copy across map game, scavenger hunt, three lesson flows, tree-identification mystery-image alt text, and `EducationProgress`; regression audit now guards those Spanish education surfaces against English progress/fallback regressions
- [x] Localized shared error and loading fallback surfaces across `global-error`, shared error boundaries, MDX render failures, and route/loading fallbacks so Spanish public failure states no longer default to English or expose raw production error text

### 🔴 Remaining

- [ ] Remaining locale-specific branches are now concentrated in shared normalization helpers and intentional locale-keyed lookups (metadata/MDX dictionaries); continue auditing high-traffic Spanish pages for visible English fallback text rather than chasing defensive helper internals

- [ ] Route-level surface audits for remaining high-traffic Spanish pages
- [x] Verified high-traffic Spanish tree-detail surfaces no longer show English-only fallback text; alternate-language label now renders `Inglés` instead of `English`

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
- [x] Template-level accessibility checklist — `docs/ACCESSIBILITY_CHECKLIST.md`

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

- [x] Locale-aware manifest strategy decided and implemented via locale-prefixed manifest route

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

- [x] Source hierarchy for factual corrections adopted: IUCN → POWO → Tropicos → Manual de Plantas de Costa Rica → SINAC → peer-reviewed papers
- [x] Citation standard for high-risk sections (uses, cultural, medicinal, safety, conservation): 2 independent sources required
- [x] Remediation queue priority fixed: resolve the 12 P1-high IUCN mismatch trees before medium-risk citation-gap batches
- [ ] PR acceptance criteria for content work — not formalized
- [ ] IUCN status labels localized (`ConservationStatus.tsx` has `getLocalizedCategoryLabel()` — verify coverage)

---

## P6 — Mobile UX & Tree Detail Wayfinding 🟡 PARTIAL

- [x] `TableOfContents` now supports a mobile sticky jump-nav variant on tree detail pages
- [x] Tree detail pages now expose anchorable high-priority sections (`Quick facts`, `Safety`, `Distribution`, `Seasonality`, `Biodiversity`, `How to identify`) for mobile wayfinding and desktop TOC parity
- [x] Secondary sections are now collapsed by default on mobile for tree detail follow-up content (`Uses`, `Indigenous Names`, related comparison guides, related trees) while remaining fully expanded on desktop
- [x] "Quick facts" / "How to identify" / "Safety" are now elevated in tree-detail wayfinding; safety content is surfaced earlier in the page flow
- [x] Compare page now includes a top-level guides vs interactive-tool switcher with anchored jump links to both sections
- [x] Ambiguous common names are disambiguated in tree-directory list UI with family badges on duplicate common-name entries (e.g., the two `Alcornoque` records)

---

## P7 — Performance & PWA ✅ DONE

### ✅ Completed

- [x] `next/image` quality allowlist added to `next.config.ts`
- [x] Manifest icon `src` paths match actual filenames on disk (all 8 icons: 72, 96, 128, 144, 152, 192, 384, 512)
- [x] Actual icon pixel dimensions match their filenames (verified via `sips`)
- [x] Manifest uses bilingual name/description and `start_url: "/"`

### 🔴 Remaining

- [x] Locale-aware manifest strategy implemented with locale-prefixed manifests
- [ ] Profile tree detail template rendering on mid-tier mobile devices
- [ ] Verify lazy-loading and defer secondary modules more aggressively

---

## P8 — Maintainability & Code Cleanup 🟡 Partial

- [x] Consolidated component-level locale ternaries into shared helpers (overlaps with P2)
- [x] Removed template-level semantic duplication (nested `<main>` verified clean — overlaps P3)
- [x] Audited layout namespace ownership — all CLIENT_NAMESPACES are actively used, no unused entries (including newly added `mdx`)
- [x] Added bidirectional namespace audit test (missing + unused check)
- [x] Introduce shared route-shell primitives — `PageShell`, `PageHeader` components; use-cases page migrated
- [x] Document the optional-dependency adapter pattern for future integrations (`docs/OPTIONAL_DEPENDENCY_ADAPTER_PATTERN.md`)
- [x] Removed known baseline `console.log` debt from route/component source and tightened regression baseline to zero

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
- [x] Route-level regression tests (1 file) — landmarks, content parity, MDX heading remap, metadata alternates, message key parity, aria-label audit, high-traffic Spanish parity guards, shared fallback localization guards

### Missing test categories

- [x] Route-level semantic checks: no nested `<main>`, MDX h1→h2 guard
- [x] Content parity checks: EN/ES slug matching for trees + comparisons
- [x] Metadata alternates regression guard (baseline updated: 0 pages missing)
- [x] Translation message key parity (EN ↔ ES namespace and leaf key parity)
- [x] Hardcoded aria-label regression guard (baseline: 0 remaining)
- [x] Route-level console-cleanliness checks — console.log regression guard (baseline: 0 files)
- [ ] Automated visual regression for key templates (approved scope: homepage, tree detail, compare, glossary, education)
- [x] CI integration for regression suite — added to `content-build-tests.yml` workflow
- [x] Locale ternary count regression guard (baseline: 0)
- [x] Ad-hoc locale selection branch regression guard (baseline: 0 outside shared i18n helpers)
- [x] Route family coverage test (verifies page.tsx exists for all major routes)
- [x] Education data array-ternary regression guard (prevents re-introducing array-level ternaries)
- [x] Conservation lesson regression guard verifies status aggregation and legend keys stay aligned with IUCN code-based content

---

## P10 — Indigenous Knowledge Governance 🔴 NOT DONE

- [ ] No governance, attribution, or consent policy files exist in the repo
- [ ] Review/approval rules for indigenous names, meanings, and ceremonial claims — not defined
- [ ] Consent and community review process — not established
- [x] Interim working rule adopted: avoid autonomous edits to indigenous/cultural claims unless the claim is explicitly sourced; expect later human review even when sourced
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
- [x] ~~P4: Decide on manifest locale strategy~~ ✅

### Days 31–60: Quality & Parity

- [ ] P2: Continue ternary→translation migration across remaining components
- [ ] P2: Route-level Spanish surface audits on tree detail, compare, biodiversity
- [x] ~~P3: Audit all remaining interactive controls for localized ARIA labels~~ ✅
- [ ] P3: Create template-level accessibility checklist
- [ ] P5: Begin resolving P1-high factual items (IUCN mismatches — 12 trees)
- [ ] P6: Add mobile TOC / sticky section nav to tree detail pages
- [x] ~~P9: Add route-level regression tests (semantics, locale parity)~~ ✅
- [ ] P9: Add automated visual regression coverage for homepage, tree detail, compare, glossary, and education templates

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
