# Costa Rica Tree Atlas — Implementation Plan

**Last Updated:** 2026-03-18
**Status:** Checklist audit v3.0 — Full codebase verification performed 2026-03-18.

---

## Quick Summary

| Priority | Initiative                                  | Status       |
| -------- | ------------------------------------------- | ------------ |
| **P0**   | Build reliability                           | ✅ Done      |
| **P1**   | Runtime fixes                               | ✅ Done      |
| **P2**   | EN/ES surface parity                        | 🟡 Partial   |
| **P3**   | Accessibility (landmarks, headings, labels) | 🔴 Not done  |
| **P4**   | SEO & metadata                              | 🟡 Partial   |
| **P5**   | Factual remediation & citations             | 🔴 Not done  |
| **P6**   | Mobile UX & wayfinding                      | 🔴 Not done  |
| **P7**   | Performance & PWA                           | 🔴 Regressed |
| **P8**   | Maintainability & code cleanup              | 🔴 Not done  |
| **P9**   | Route-level regression tests                | 🔴 Not done  |
| **P10**  | Indigenous knowledge governance             | 🔴 Not done  |

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
- [x] Translation key parity: 1,158 keys in both `messages/en.json` and `messages/es.json`
- [x] MDX chrome localized: `INaturalistEmbed`, `ImageCard`, `Reference`, `ReferencesSection`
- [x] Shared nav controls localized: `MobileNav`, `LanguageSwitcher`, `PrintButton`
- [x] `ServerMDXContent` receives active locale

### 🔴 Remaining

- [ ] **~192 hardcoded `locale === "es"` ternaries** spread across components instead of using translation keys:

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

## P3 — Accessibility 🔴 NOT DONE

### Nested `<main>` landmarks

The root layout (`src/app/[locale]/layout.tsx`) already wraps all pages in `<main id="main-content">`. These pages add a second nested `<main>`, breaking screen-reader landmark navigation:

- [ ] `src/app/[locale]/contribute/profile/page.tsx` line 26 — nested `<main>`
- [ ] `src/app/[locale]/admin/admin-layout-wrapper.tsx` line 20 — nested `<main>`
- [ ] `src/app/[locale]/admin/contributions/page.tsx` line 32 — nested `<main>`
- [x] `src/app/[locale]/compare/page.tsx` — clean, uses `<section>`/`<div>`
- [x] `src/app/[locale]/trees/[slug]/page.tsx` — clean, uses `<article>`

### Multiple `h1` per page

- [ ] **174 of 175 tree MDX files** contain `#` (h1-level) headings that render alongside the page template's own h1
  - Example: `ceiba.mdx` has `# Safety Information`, `# Care & Cultivation`, `# Ceiba` — all render as h1
  - **Fix needed:** downgrade all MDX top-level headings to `##` (h2) or remap h1→h2 in the MDX component registry

### Control labels & ARIA

- [x] `MobileNav` — localized open/close labels
- [x] `LanguageSwitcher` — localized `aria-label`
- [x] `PrintButton` — localized label and `aria-label`
- [ ] Remaining route-specific interactive controls — not yet audited
- [ ] Template-level accessibility checklist — not yet created

---

## P4 — SEO & Metadata 🟡 PARTIAL

### ✅ Completed

- [x] Compare page title duplication fixed
- [x] Footer license link uses precise `ROUTES.license` destination
- [x] Internal link targets corrected

### 🔴 Remaining

- [ ] `public/manifest.json` hardcoded to English: `start_url: "/en"`, `lang: "en"`, English-only description
- [ ] No locale-aware manifest strategy decided or implemented
- [ ] Verify title-template discipline across all remaining route pages
- [ ] Heading hierarchy hurts SEO — multiple h1s on tree detail pages (see P3)

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

## P7 — Performance & PWA 🔴 REGRESSED

### ✅ Completed

- [x] `next/image` quality allowlist added to `next.config.ts`

### ❗ Broken — PWA icons missing

**All 8 manifest icon `src` paths point to files that don't exist on disk:**

| Manifest references          | Actual file on disk | Actual dimensions |
| ---------------------------- | ------------------- | ----------------- |
| `/icons/icon-68x72.png` ❌   | `icon-72x72.png`    | 68×72             |
| `/icons/icon-91x96.png` ❌   | `icon-96x96.png`    | 91×96             |
| `/icons/icon-122x128.png` ❌ | `icon-128x128.png`  | 122×128           |
| `/icons/icon-137x144.png` ❌ | `icon-137x144.png`  | 137×144           |
| `/icons/icon-145x152.png` ❌ | `icon-152x152.png`  | 145×152           |
| `/icons/icon-183x192.png` ❌ | `icon-192x192.png`  | 183×192           |
| `/icons/icon-367x384.png` ❌ | `icon-384x384.png`  | 367×384           |
| `/icons/icon-489x512.png` ❌ | `icon-512x512.png`  | 489×512           |

The manifest was updated to use actual pixel dimensions, but the icon files on disk were never renamed. **PWA install cannot resolve any icons.**

### 🔴 Remaining

- [ ] Fix icon filenames to match manifest OR revert manifest to match filenames
- [ ] Regenerate icons to standard sizes (ideal long-term fix)
- [ ] Manifest still English-only (see P4)
- [ ] Profile tree detail template rendering on mid-tier mobile devices
- [ ] Verify lazy-loading and defer secondary modules more aggressively

---

## P8 — Maintainability & Code Cleanup 🔴 NOT DONE

- [ ] Consolidate ~192 hardcoded locale ternaries into translation files/helpers (overlaps with P2)
- [ ] Introduce shared route-shell primitives for page headers, landmarks, section scaffolding
- [ ] Remove template-level semantic duplication (nested `<main>` in admin/contribute — overlaps P3)
- [ ] Audit layout namespace ownership in `src/app/[locale]/layout.tsx` — prune unused client namespaces
- [ ] Document the optional-dependency adapter pattern for future integrations

---

## P9 — Route-Level Regression Tests 🔴 NOT DONE

### Existing test coverage (34 test files)

- [x] Content validation tests (2 files)
- [x] MDX component tests (3 files)
- [x] Security tests — auth, path traversal, auth e2e (3 files)
- [x] Library unit tests — cloudinary, filters, reputation, query contracts (6 files)
- [x] API tests — comparisons, glossary, image upload (3 files)
- [x] Theme tests (1 file)
- [x] Image review gate test (1 file)

### Missing test categories

- [ ] Route-level locale surface-parity checks (no English strings on Spanish pages)
- [ ] Route-level semantic checks (single `<main>`, single `h1`, ordered headings)
- [ ] Route-level console-cleanliness checks (no runtime errors/warnings)
- [ ] Automated visual regression for key templates
- [ ] CI integration for regression suite

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
- [ ] **P7 URGENT**: Fix broken manifest icon paths — PWA install is broken
- [ ] P3: Remove 3 nested `<main>` tags from admin/contribute pages
- [ ] P3: Downgrade h1s in 174 tree MDX files to h2 (or remap in MDX registry)
- [ ] P2: Begin consolidating top locale-ternary offenders (`SeasonalCalendar`, `Breadcrumbs`, `FieldGuidePreview`)
- [ ] P4: Decide on manifest locale strategy

### Days 31–60: Quality & Parity

- [ ] P2: Continue ternary→translation migration across remaining components
- [ ] P2: Route-level Spanish surface audits on tree detail, compare, biodiversity
- [ ] P3: Audit all remaining interactive controls for localized ARIA labels
- [ ] P3: Create template-level accessibility checklist
- [ ] P5: Begin resolving P1-high factual items (IUCN mismatches — 12 trees)
- [ ] P6: Add mobile TOC / sticky section nav to tree detail pages
- [ ] P9: Add first route-level regression tests (semantics, locale parity)

### Days 61–90: Authority & Polish

- [ ] P5: Resolve P2-medium citation gap items (~30+ trees)
- [ ] P5: Define and enforce citation standard for high-risk sections
- [ ] P8: Introduce shared route-shell primitives
- [ ] P8: Consolidate remaining hardcoded string logic
- [ ] P10: Draft indigenous knowledge governance policy
- [ ] P9: Expand regression suite to cover all major route families
- [ ] P6: Improve compare page UX (guide/tool switching, card density)

---

## Strengths (no action needed)

- **Content moat:** 175 bilingual tree profiles, 20 comparison guides, 150 glossary entries
- **i18n foundation:** locale-prefixed routing, `next-intl`, mirrored EN/ES content + 1,158 translation keys
- **Performance baseline:** Lighthouse 99 desktop / 90 mobile perf, 96 accessibility, 100 SEO
- **Architecture:** App Router, typed routes, centralized route config, server/client data projection
- **Product identity:** Costa Rica-specific, community contribution flows, safety content, comparison tooling
