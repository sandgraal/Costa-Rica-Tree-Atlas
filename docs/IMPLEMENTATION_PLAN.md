# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-03-12  
**Status:** Audit-driven v2.1 — first quick-win implementation slice is shipped, but P0 build hardening, deeper semantic cleanup, locale-surface parity, and factual-governance work still need focused follow-through.

---

## Executive Summary

### Current state

Costa Rica Tree Atlas has a genuinely strong base: bilingual content at scale, solid route architecture with locale-prefixed URLs, good saved Lighthouse results, and a thoughtful content/data model built on Next.js 16, `next-intl`, and Contentlayer. The site already feels substantial and differentiated.

However, the repository is not currently in a world-class operating state. As of 2026-03-12:

- `npm run lint` now passes with **0 warnings**
- the first implementation slice shipped the footer legal-link fix, compare share-link fix, compare title fix, shared control-label localization, and the `PhotoUploadClient` effect/lint cleanup
- `npm run build` is still **not considered green** for plan purposes because P0 build hardening remains open, especially self-hosted font work
- audited browser sessions still show **runtime console errors/warnings** on core routes
- Spanish UI parity is improved, but not yet complete across all high-traffic surfaces
- factual remediation work remains materially unfinished

### Recent implementation progress

Completed on 2026-03-12 in the first implementation slice:

- fixed footer `License` navigation to use `ROUTES.license`
- removed the duplicate-key footer rendering issue by stabilizing footer list keys
- fixed comparison-detail sharing so share URLs use `/compare/...` instead of `/trees/compare/...`
- removed duplicated compare page title templating
- localized shared control labels in `MobileNav`, `LanguageSwitcher`, and `PrintButton`
- moved upload-limit fetching in `PhotoUploadClient` to `useEffect` and removed the unused locale variable

Completed on 2026-03-12 in the follow-up implementation slices:

- replaced the fragile optional error-tracking probe with a bundler-safe adapter boundary, removing the Turbopack warning triggered by `src/lib/error-tracking.ts`
- added the actual `next/image` quality allowlist in `next.config.ts` to match the quality values already used across cards, galleries, and shared image components

### Major strengths

- **Content moat:** 175 tree profiles, 20 comparison guides, 150 glossary entries, bilingual parity confirmed in file structure.
- **Strong i18n foundation:** locale-prefixed routing (`/{locale}/...`), `next-intl`, mirrored EN/ES content sets, and message-key parity (`1158` keys in both `messages/en.json` and `messages/es.json`).
- **Good performance baseline:** saved Lighthouse reports show `99` desktop / `90` mobile performance, `96` accessibility, and `100` SEO.
- **Thoughtful platform choices:** App Router, typed routes, centralized route config, audit scripts, and clear server/client data projection patterns.
- **Clear product identity:** Costa Rica-specific educational utility, community contribution flows, safety content, and comparison tooling are all differentiators.

### Top risks

1. **Build reliability is still not fully hardened** — the optional error-tracking warning is fixed, but release health still depends on replacing remote font fetching with fully self-hosted assets.
2. **Runtime quality is noisy** — hydration mismatch and manifest/icon warnings still appear on core routes, and image-quality warnings need a fresh browser recheck after the new config allowlist.
3. **Localization polish is incomplete** — shared controls improved, but Spanish pages still show mixed-language content in other high-traffic journeys.
4. **Semantic/accessibility debt is real** — nested `<main>` landmarks, multiple `h1`s on tree detail pages, and non-localized control labels weaken WCAG quality.
5. **Content trust is not fully closed** — `reports/factual-remediation-queue.full.md` still shows `144` findings across `104` trees, including IUCN drift, family drift, and citation gaps.

### Top opportunities

- Stabilize build/runtime first so every other improvement lands on firm ground.
- Convert current i18n parity from “files exist in both languages” to “experience quality is equivalent in both languages.”
- Improve detail-page semantics and mobile readability to turn rich content into easier-to-use content.
- Close the factual remediation queue and formalize claim-level citation standards for trust leadership.
- Tighten metadata, PWA, and internal-link details to turn strong SEO into resilient SEO.

### What prevents the site from being world-class today

- non-green build pipeline
- visible runtime errors on audited core routes
- incomplete localization of controls and labels
- semantic/accessibility inconsistencies on major templates
- unresolved factual/citation backlog for a significant share of species pages

---

## Audit Findings by Area

### 1. Functionality

| Finding                                            | Evidence                                                                                                                                                                                                                                                                    | Severity | User impact                                                                                   | Business impact                                                                       | Recommended action                                                                                                                    |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Production build is not currently reliable.        | `npm run build` now succeeds on 2026-03-12 after the optional error-tracking warning was removed, but P0 remains open because `src/app/[locale]/layout.tsx` still depends on network-fetched `next/font/google` `Geist` / `Geist Mono` assets instead of self-hosted fonts. | Critical | Users are at risk of broken deploys or blocked releases on clean or firewalled environments.  | Highest — release confidence, hosting portability, and CI trust are compromised.      | Finish P0 by making font loading hermetic and keeping optional integrations on explicit, bundler-safe boundaries.                     |
| Comparison page sharing used the wrong URL shape.  | Resolved on 2026-03-12. `ShareButton` now accepts a full route path, and `src/app/[locale]/compare/[slug]/page.tsx` now shares `/${locale}/compare/${comparison.slug}` correctly.                                                                                           | Closed   | Comparison-detail shares now resolve to the intended route.                                   | High — removes a broken user-facing contract in a high-value feature.                 | Keep `ShareButton` path-based for non-tree routes and extend the same pattern anywhere else route assumptions are currently implicit. |
| Footer legal navigation was wrong and unstable.    | Resolved on 2026-03-12. `src/components/Footer.tsx` now links `License` to `ROUTES.license` and no longer keys repeated items by raw `href`.                                                                                                                                | Closed   | Footer legal links now point to the intended destination without the duplicate-key bug.       | Medium-high — removes visible runtime noise and fixes a trust/legal navigation issue. | Preserve centralized route usage for all legal/footer destinations and avoid raw-`href` keying when duplicates are possible.          |
| Photo upload client had an effect/lint regression. | Resolved on 2026-03-12. `src/app/[locale]/contribute/photo/PhotoUploadClient.tsx` now fetches upload limits in `useEffect`, and the unused locale variable was removed.                                                                                                     | Closed   | The contribution flow is easier to reason about and no longer carries the known lint warning. | Medium — improves code clarity in a core community workflow.                          | Apply the same hook-discipline standard to other client components that still blend initialization and side effects.                  |

### 2. Usability

| Finding                                                                             | Evidence                                                                                                                                                                                                                                                                | Severity   | User impact                                                                        | Business impact                                                                  | Recommended action                                                                                                                                                                                                             |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tree detail pages are information-rich but cognitively heavy, especially on mobile. | Browser audit of `/es/trees/ceiba` shows a very long single-flow page with dense safety, taxonomy, ecology, gallery, conservation, and external resources sections before contribution/comparison CTAs. TOC is desktop-only (`src/app/[locale]/trees/[slug]/page.tsx`). | Medium     | Mobile users must scroll through a large wall of content with limited wayfinding.  | Medium-high — content depth is present, but learnability and scanability suffer. | Introduce mobile-friendly section jump links / sticky page index, collapse secondary sections by default where appropriate, and prioritize “quick facts”, “how to identify”, and “safety” higher in the information hierarchy. |
| Core journeys still expose small trust-friction moments.                            | Homepage browser snapshot shows “About” copy describing the project as privately maintained while manifest and some metadata describe it as open-source; runtime warnings remain visible in dev across high-traffic pages.                                              | Medium     | Users get subtle credibility friction when copy and behavior do not align cleanly. | Medium — educational/reference products live or die on trust cues.               | Align project-positioning language across manifest, footer/about copy, metadata, and public documentation.                                                                                                                     |
| Compare experience is content-rich but visually exhausting and metadata-heavy.      | `/es/compare` renders many large guide cards with long headings and dense summaries; the interactive comparison tool begins below a very long guide section.                                                                                                            | Medium     | Users may not reach the interactive tool quickly, especially on mobile.            | Medium — reduces feature adoption of a signature differentiator.                 | Let users switch between “Guides” and “Interactive Tool” near the top, and tighten guide-card copy for faster scanning.                                                                                                        |
| Ambiguous common names need stronger disambiguation in list-heavy UI.               | `/en/trees` and `/es/compare` include repeated common names like “Alcornoque,” with differentiation only visible through scientific names or descriptions.                                                                                                              | Low-Medium | New learners may misidentify or misclick species.                                  | Medium — confusion undercuts educational value.                                  | Increase scientific-name prominence in cards/selectors where common names collide, and optionally add small family/region qualifiers.                                                                                          |

### 3. Accessibility

| Finding                                                       | Evidence                                                                                                                                                                                                                                               | Severity | User impact                                                                         | Business impact                                                                      | Recommended action                                                                                                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nested `<main>` landmarks are present across multiple routes. | `grep` found `<main>` in `src/app/[locale]/compare/page.tsx`, `seasonal/page.tsx`, `contribute/page.tsx`, `oral-histories/page.tsx`, `api-docs/page.tsx`, etc., while `src/app/[locale]/layout.tsx` already wraps pages in `<main id="main-content">`. | High     | Screen-reader and landmark navigation become noisier and less predictable.          | High — this is a cross-template semantic defect.                                     | Standardize page templates to use `<section>`/`<div>` inside the layout’s single `<main>` landmark.                                              |
| Tree detail pages show more than one `h1`.                    | Browser snapshot for `/es/trees/ceiba` shows one `h1` in the page chrome and another `h1` generated within MDX content.                                                                                                                                | High     | Heading navigation becomes confusing; semantic outline weakens.                     | High — hurts both accessibility and SEO clarity.                                     | Enforce one `h1` per page and downgrade MDX top-level headings inside detail content to `h2` or below.                                           |
| Shared controls needed localized accessible names.            | Partially resolved on 2026-03-12. `MobileNav`, `LanguageSwitcher`, and `PrintButton` now use localized labels, but route-level audits still need to cover remaining interactive controls in high-traffic templates.                                    | Medium   | Shared navigation and print controls are improved, but parity work is not complete. | Medium-high — this remains a parity and WCAG consistency stream, not a one-file fix. | Continue route-level audits and move remaining shared labels out of inline locale conditionals where practical.                                  |
| Landmark structure and semantics vary by template.            | `/es/compare` shows a nested `<main>` within the page body; several complex pages rely on generic wrappers instead of stronger sectioning/landmark patterns.                                                                                           | Medium   | Keyboard and screen-reader users lose orientation in long pages.                    | Medium                                                                               | Create a template-level accessibility checklist for route pages: one main, ordered headings, localized labels, and predictable section wrappers. |

### 4. Performance

| Finding                                                                                              | Evidence                                                                                                                                                                                                | Severity   | User impact                                                                           | Business impact                                                                     | Recommended action                                                                                                                               |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Saved Lighthouse scores are strong, but the current implementation has brittle performance plumbing. | Saved reports: desktop perf `99`, mobile perf `90`, LCP `0.8s` desktop / `3.6s` mobile. Yet `npm run build` relies on live Google font fetches and browser audits emit repeated image-quality warnings. | Medium     | Performance is good now, but fragile to environment drift and configuration mismatch. | High — world-class products need repeatable performance, not one-time good reports. | Keep the current bundle discipline, but fix font loading strategy and align image quality config with actual usage.                              |
| Image optimization settings are out of sync with actual usage.                                       | Browser console warns that images use quality values `55`, `60`, and `90` while `next.config.ts` only configures default behavior and not matching `images.qualities`.                                  | Medium     | No direct user breakage, but warnings indicate avoidable config drift.                | Medium — increases maintenance noise and obscures real regressions.                 | Add the actual allowed quality values or normalize components to the configured set.                                                             |
| Tree detail templates remain heavy, content-dense pages.                                             | `/es/trees/ceiba` includes image gallery, map, seasonal chart, biodiversity data, safety, MDX, related content, and contribution modules on one page.                                                   | Medium     | Mid-tier mobile devices still bear a lot of rendering work on long pages.             | Medium                                                                              | Preserve current lazy-loading patterns, but profile tree detail templates specifically and defer secondary modules more aggressively where safe. |
| Manifest/icon mismatch adds avoidable browser noise.                                                 | Browser warns about `/icons/icon-144x144.png`; local file inspection shows icon files do not match declared sizes (e.g. `icon-144x144.png` is actually `137x144`, `icon-512x512.png` is `489x512`).     | Low-Medium | PWA install polish degrades; browser trust cues weaken.                               | Medium                                                                              | Regenerate icons to exact dimensions or update manifest entries to truthful sizes.                                                               |

### 5. SEO

| Finding                                                                        | Evidence                                                                                                                                                                | Severity | User impact                                                                 | Business impact                                                 | Recommended action                                                                                        |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Compare page titles were duplicated.                                           | Resolved on 2026-03-12. `src/app/[locale]/compare/page.tsx` now returns `title: t("title")`, allowing the layout title template to handle the site suffix exactly once. | Closed   | Compare page titles are now cleaner in browser and search contexts.         | High — removes metadata duplication on a major discovery route. | Apply the same title-template discipline to any remaining pages that manually concatenate the site title. |
| Detail-page heading semantics reduce search clarity.                           | `/es/trees/ceiba` shows two `h1`s; semantic hierarchy is split between template chrome and MDX body.                                                                    | High     | Search engines and assistive technologies receive a weaker content outline. | High                                                            | Enforce single primary heading and consistent section depth across all MDX-backed detail pages.           |
| License/internal-link signal is weaker than intended.                          | Footer “License” currently routes to `/about` rather than the dedicated `#license` anchor defined in route config.                                                      | Medium   | Users and crawlers get a less specific internal destination.                | Medium                                                          | Fix the footer destination and keep internal link targets precise.                                        |
| Locale discoverability is mostly strong but PWA metadata is English-defaulted. | Routing and alternates are in place, but `public/manifest.json` is hardcoded to `start_url: "/en"`, `lang: "en"`, and English description.                              | Medium   | Spanish-first users get a subtly EN-biased install/share experience.        | Medium                                                          | Decide whether to generate locale-aware manifests or document a deliberate default-locale strategy.       |

### 6. Internationalization Quality

| Finding                                                              | Evidence                                                                                                                                                                                                                       | Severity | User impact                                                                              | Business impact                                | Recommended action                                                                                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File parity is excellent, but experience parity is not yet complete. | Script checks confirm EN/ES parity for trees (`175/175`), comparisons (`20/20`), glossary (`150/150`), oral histories (`2/2`), and translation keys (`1158` each). Browser audits still show English strings on Spanish pages. | High     | Spanish users get a second-tier experience in core interactions.                         | High — conflicts directly with product goals.  | Shift i18n QA from “asset parity” to “surface parity” with route-level audits for visible and assistive text.                                                  |
| Hardcoded locale ternaries are widespread and error-prone.           | `grep` found `200+` matches for `locale === "es"` patterns across components/routes, including `Breadcrumbs`, `ShareButton`, `SeasonalCalendar`, `TreeOfTheDay`, and many others.                                              | High     | Mixed-language regressions are easy to introduce and hard to systematically catch.       | High — maintainability and parity both suffer. | Consolidate repeated UI strings into translation files or shared translation helpers; reserve ternaries for truly tiny data labels only.                       |
| Spanish tree detail pages still contain visible English strings.     | `/es/trees/ceiba` snapshot includes `Print this page`, `iNaturalist Observations`, `Community-powered species data`, `View Species Page`, `Browse Photos`, and `Conservation status and species assessment`.                   | High     | Spanish readers encounter broken immersion and inconsistent credibility.                 | High                                           | Audit high-traffic templates first (`tree detail`, `compare`, `header/footer`, `safety`, `external resource modules`) and eliminate visible English leftovers. |
| Spanish navigation and controls had shared English assistive labels. | Partially resolved on 2026-03-12. Shared labels for menu open/close, language selector, and print controls were localized, but broader route-surface parity still needs continued verification.                                | Medium   | Shared control parity improved immediately for Spanish keyboard and screen-reader users. | Medium-high                                    | Continue EN/ES surface audits on tree detail, comparison detail, biodiversity modules, and other route-specific UI.                                            |

### 7. Content Accuracy

| Finding                                                                           | Evidence                                                                                                                                                                                                                                                   | Severity | User impact                                                                              | Business impact                                    | Recommended action                                                                                                                             |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| The factual remediation queue is still substantial.                               | `reports/factual-remediation-queue.full.md` reports `144` findings across `104` trees. Highest-volume issues are citation gaps, IUCN drift, and family drift.                                                                                              | High     | Users may encounter outdated status labels or under-sourced claims.                      | High — trust and authority are core product value. | Treat factual remediation as a first-class backlog stream, not a side task. Resolve all `P1-high` items before claiming world-class authority. |
| High-risk narrative sections still lack systematic claim-level citation coverage. | `scripts/audit-factual-accuracy.mjs` explicitly audits citation coverage in high-risk sections such as uses, cultural history, medicinal content, safety, and conservation. The remediation queue still flags many `missing_citations_high_risk` findings. | High     | Readers cannot easily distinguish well-supported statements from interpretive synthesis. | High                                               | Define a citation standard for high-risk sections and make it part of PR acceptance for content work.                                          |
| Taxonomy/status presentation is sometimes too raw for general users.              | Tree detail quick facts display raw codes like `LC` rather than consistently human-readable localized labels.                                                                                                                                              | Medium   | Beginners may not understand significance without extra interpretation.                  | Medium                                             | Show localized human labels alongside codes (e.g. `LC — Preocupación menor`).                                                                  |
| Indigenous and cultural knowledge still requires stronger governance.             | Repo rules already mark indigenous terminology research and elder/oral-history validation as human-only; content sections on pages like `/es/trees/ceiba` elevate culturally significant claims.                                                           | High     | Risk of overstatement, weak sourcing, or insufficient community review.                  | High — this is both an ethics and trust issue.     | Establish explicit review/approval rules for indigenous names, meanings, and ceremonial claims before expanding that content layer further.    |

### 8. Architecture and Maintainability

| Finding                                                                       | Evidence                                                                                                                                                                                                                              | Severity | User impact                                                           | Business impact | Recommended action                                                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Optional-dependency handling was fragile under Turbopack.                     | Resolved on 2026-03-12. `src/lib/error-tracking.ts` now uses a bundler-safe adapter boundary instead of probing `@sentry/nextjs`, and `src/instrumentation.ts` no longer triggers the `Can't resolve <dynamic>` warning during build. | Closed   | Release builds no longer emit avoidable optional-dependency warnings. | High            | Reuse the same explicit-adapter pattern if another optional monitoring integration is introduced later.                          |
| Shared layout/provider composition is powerful but becoming crowded.          | `src/app/[locale]/layout.tsx` manually curates a large client namespace list and several dynamically imported client utilities.                                                                                                       | Medium   | More moving parts increase regression risk when adding features.      | Medium          | Keep the current architecture, but document and simplify namespace ownership; prune client namespaces that are no longer needed. |
| Repeated hardcoded string logic is spreading product rules across many files. | `Breadcrumbs`, `MobileNav`, `PrintButton`, `ShareButton`, `TreeOfTheDay`, and others all carry route-specific or locale-specific string logic inline.                                                                                 | High     | Small regressions become easy and QA becomes manual.                  | High            | Centralize repeated labels and route copy patterns; prefer shared helpers over ad hoc string logic.                              |
| Some template patterns are semantically duplicated across route files.        | Nested `<main>` usage appears in many page files; repeated page-header and route-shell patterns vary widely by route.                                                                                                                 | Medium   | Inconsistent UX/accessibility behavior across templates.              | Medium          | Introduce lighter shared route-shell primitives for page headers, landmarks, and section scaffolding.                            |

---

## Prioritized Backlog Table

| ID  | Initiative                                                                       | Category                     | User impact | Business impact | Effort | Confidence | Risk   | Dependencies                     | Owner role                             |
| --- | -------------------------------------------------------------------------------- | ---------------------------- | ----------- | --------------- | ------ | ---------- | ------ | -------------------------------- | -------------------------------------- |
| P0  | Restore deterministic build and release health                                   | Functionality / Architecture | Very high   | Very high       | M      | High       | Low    | None                             | Staff Next.js/TypeScript Engineer      |
| P1  | Eliminate runtime console errors and contract bugs                               | Functionality                | High        | High            | S-M    | High       | Low    | P0 recommended                   | Staff Next.js/TypeScript Engineer      |
| P2  | Complete EN/ES surface-parity hardening                                          | Internationalization         | Very high   | High            | M      | High       | Low    | P1 partially helps               | Internationalization Specialist        |
| P3  | Fix semantic landmarks, heading hierarchy, and control labels                    | Accessibility                | High        | High            | M      | High       | Low    | P2 helpful                       | Accessibility Specialist (WCAG 2.2 AA) |
| P4  | Clean metadata, title templating, and internal-link precision                    | SEO                          | Medium      | High            | S      | High       | Low    | P1                               | Technical SEO Lead                     |
| P5  | Close P1 factual-remediation and citation gaps                                   | Content accuracy             | High        | Very high       | L      | High       | Medium | Curator review, external sources | Content Accuracy Reviewer              |
| P6  | Improve tree-detail mobile wayfinding and scanability                            | UX                           | High        | Medium-high     | M      | Medium     | Low    | P3                               | Senior UX Strategist                   |
| P7  | Fix image-quality config and PWA manifest/icon validity                          | Performance / PWA            | Medium      | Medium          | S      | High       | Low    | P1                               | Performance Engineer                   |
| P8  | Simplify fragile client-side patterns and shared string logic                    | Maintainability              | Medium      | High            | M      | High       | Low    | P2, P3                           | Principal Software Architect           |
| P9  | Add route-level regression checks for parity, semantics, and console cleanliness | Quality / Process            | High        | High            | M      | High       | Low    | P1-P4                            | Principal Software Architect           |
| P10 | Establish indigenous knowledge review and attribution policy                     | Content / Product            | Medium      | Very high       | M-L    | Medium     | Medium | Stakeholder input                | Product Strategy Lead                  |

---

## 30/60/90 Day Roadmap

### 0–30 days: stabilization and quick wins

- Ship **P0**: green build on clean machines and CI-equivalent environments.
- Ship **P1**: fix duplicate footer key, wrong license link, compare share-link bug, and remove top runtime console errors.
- Ship **P2** first pass: localize visible/assistive strings on shared navigation and tree-detail controls.
- Ship **P3** first pass: remove nested `<main>` usage from highest-traffic routes and enforce one `h1` on tree detail pages.
- Ship **P4**: fix duplicated compare titles and precise legal/internal links.
- Ship **P7**: align `next/image` quality config and correct manifest icon sizes.

**Outcome target:** release health restored, console noise materially reduced, bilingual experience visibly cleaner.

### 31–60 days: quality improvements and differentiation

- Continue **P2** across lower-traffic templates and assistive labels.
- Continue **P3** across all route families; add a reusable page-shell accessibility pattern.
- Ship **P6**: improve mobile tree-detail wayfinding and reduce cognitive load.
- Begin **P5** with a focused pass over all `P1-high` factual items from the remediation queue.
- Start **P9**: add regression checks for route semantics, console cleanliness, and locale-surface parity.

**Outcome target:** both locales feel consistently polished; accessibility and scanability move from “good intent” to “systematic quality.”

### 61–90 days: world-class refinements and strategic initiatives

- Finish **P5** priority factual remediation and citation standards for high-risk sections.
- Ship **P8**: simplify repeated string logic, optional dependency boundaries, and route-shell duplication.
- Formalize **P10**: indigenous knowledge governance, attribution, and consent/review rules.
- Use **P9** outputs to prevent regression in metadata, semantics, performance config, and locale parity.

**Outcome target:** product is not only polished, but credibly authoritative and operationally resilient.

---

## Quick Wins

Items deliverable in 1 day or less:

### Completed on 2026-03-12

1. ✅ Fix footer `License` to use `ROUTES.license` and stop keying that list by raw `href`.
2. ✅ Fix compare-page sharing to generate `/compare/...` links instead of `/trees/compare/...`.
3. ✅ Remove duplicated site title on compare page metadata.
4. ✅ Localize `Open menu`, `Language selector`, and `Print this page` labels in shared controls.
5. ✅ Remove the unused `locale` variable in `PhotoUploadClient` and clear the known lint warning.
6. ✅ Move upload-limit fetching in `PhotoUploadClient` from a `useState` initializer into `useEffect`.
7. ✅ Add/normalize supported `next/image` quality values in `next.config.ts`.

### Still remaining quick wins

8. Regenerate or correct manifest icon dimensions to match declared sizes.
9. Replace raw `LC` / `EN` / etc. display in quick facts with localized human labels plus code.

---

## Strategic Bets

### 1. Citation-grade botanical trust layer

- **Rationale:** The site’s long-term moat is not just breadth; it is trustworthy breadth.
- **Expected ROI:** Higher credibility for educators, researchers, and conservation audiences; lower factual drift over time.
- **Complexity:** High.
- **Validation method:** Track reduction of remediation-queue findings, especially `P1-high`, and audit a sample of high-risk pages for claim-level citations.

### 2. Mobile-first tree-detail restructuring

- **Rationale:** Tree pages are the product core, and they must prioritize deep reference reading without sacrificing a more usable mobile first screen.
- **Expected ROI:** Better engagement, lower bounce on mobile, more effective educational use in the field.
- **Complexity:** Medium.
- **Validation method:** Compare scroll depth, CTA engagement, and qualitative usability testing before/after on 5 representative species pages, with special attention to top-of-page mobile scanability.

### 3. Indigenous knowledge governance and attribution model

- **Rationale:** This content area can become a signature differentiator, but only if handled rigorously and respectfully.
- **Expected ROI:** Stronger trust, better partnership potential, and more defensible cultural content.
- **Complexity:** Medium-high, with non-technical stakeholder dependency.
- **Validation method:** Documented approval workflow, named source standards, and explicit review sign-off for newly added indigenous/cultural content.

---

## Acceptance Criteria

### P0 — Restore deterministic build and release health

- `npm run build` succeeds on a clean environment without manual intervention.
- Fonts are fully self-hosted; no network-dependent font fetch is required for a successful build.
- Optional error-tracking code no longer triggers Turbopack resolution failures.

### P1 — Eliminate runtime console errors and contract bugs

- Audited routes (`/en`, `/en/trees`, `/es/glossary`, `/es/compare`, `/es/trees/ceiba`) show **0 console errors** in browser verification.
- Footer no longer emits duplicate-key warnings.
- Comparison sharing resolves to the correct compare-detail URLs.

### P2 — Complete EN/ES surface-parity hardening

- Shared navigation, global controls, and tree-detail chrome expose **no visible English strings** on Spanish routes.
- Shared components localize accessible names and button labels from message files rather than inline English strings.
- New UI work adds keys to both `messages/en.json` and `messages/es.json` in the same change.

### P3 — Fix semantic landmarks, heading hierarchy, and control labels

- Every route has exactly one `<main>` landmark.
- Every route has exactly one `h1`.
- Shared controls pass keyboard-only and screen-reader smoke tests in both locales.

### P4 — Clean metadata, title templating, and internal-link precision

- Page titles no longer duplicate the site title.
- Internal legal/about links point to the intended anchors/targets.
- Metadata remains valid for both EN and ES versions of audited routes.

### P5 — Close P1 factual-remediation and citation gaps

- All `P1-high` entries in `reports/factual-remediation-queue.full.md` are either resolved or explicitly documented with curator-approved, source-noted exceptions.
- High-risk sections (`uses`, `cultural`, `history`, `medicinal`, `safety`, `conservation`) include claim-level citations and meet a publishability threshold the relevant community would consider credible.
- EN and ES frontmatter remain factually aligned after remediation.

### P6 — Improve tree-detail mobile wayfinding and scanability

- Tree detail pages preserve deep reference reading as the primary mode while exposing a more mobile-friendly top-of-page wayfinding mechanism.
- Primary tasks (identify, safety, compare, contribute) are reachable without excessive scrolling.
- Mobile usability review on representative pages confirms improved scanability.

### P7 — Fix image-quality config and PWA manifest/icon validity

- Browser verification shows **0** `next/image` quality warnings on audited routes.
- Browser verification shows **0** manifest/icon size warnings.
- PWA start/install behavior is locale-aware rather than hard-defaulting to `/en`.
- PWA assets match declared sizes exactly.

### P8 — Simplify fragile client-side patterns and shared string logic

- Shared UI strings are reduced in duplicated inline form across major components.
- Side-effects are implemented with the correct React hooks.
- Optional integration boundaries are documented and bundler-safe.

### P9 — Add route-level regression checks

- Regression checks exist for build, lint, representative EN/ES routes, console cleanliness, and semantic structure.
- Failing checks block merges for regressions in core quality gates.

### P10 — Establish indigenous knowledge review and attribution policy

- A documented review workflow exists for indigenous names, meanings, oral histories, ceremonial claims, and other culturally sensitive assertions.
- New culturally sensitive content cannot ship without source and reviewer metadata.

### Governance

- Content owns final sign-off for “world-class” quality gates.

---

## KPI Framework

| Metric                                  | Baseline if known                                                                                                                                      | Target                                                                 | Measurement method                                  | Review cadence                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------- |
| Build success rate                      | Improved on 2026-03-12: `npm run build` succeeds cleanly after the error-tracking warning was removed, but P0 remains open until fonts are self-hosted | 100% on release branch                                                 | Run `npm run build` in clean environment / CI       | Every PR to main                      |
| Lint warnings/errors                    | 0 warnings, 0 errors (`npm run lint`) as of 2026-03-12                                                                                                 | 0 warnings, 0 errors                                                   | Run `npm run lint`                                  | Every PR                              |
| Console errors on representative routes | 2 errors observed on `/en`, `/en/trees`, `/es/glossary`, `/es/compare`, `/es/trees/ceiba`                                                              | 0                                                                      | Browser verification of representative EN/ES routes | Weekly until stable, then per release |
| Desktop performance score               | 99                                                                                                                                                     | Maintain ≥ 95                                                          | Saved Lighthouse desktop report                     | Monthly                               |
| Mobile performance score                | 90                                                                                                                                                     | Maintain ≥ 90, improve CWV stability                                   | Saved Lighthouse mobile report                      | Monthly                               |
| Accessibility score                     | 96 desktop/mobile reports                                                                                                                              | ≥ 100 on representative marketing/content routes, ≥ 98 minimum overall | Lighthouse + manual a11y review                     | Monthly                               |
| SEO score                               | 100                                                                                                                                                    | Maintain 100                                                           | Lighthouse + metadata spot checks                   | Monthly                               |
| Locale asset parity                     | Trees 175/175, comparisons 20/20, glossary 150/150, oral histories 2/2                                                                                 | Maintain 100%                                                          | Scripted parity check                               | Every content batch                   |
| Locale surface parity                   | Mixed-language strings still present on ES routes                                                                                                      | 0 visible mixed-language strings on audited routes                     | Browser verification in EN/ES                       | Weekly until resolved                 |
| Factual remediation backlog             | 144 findings across 104 trees                                                                                                                          | 0 `P1-high`; total backlog materially reduced                          | Re-run factual audit scripts                        | Biweekly during remediation           |
| Semantic template quality               | 11 route files with nested `<main>` matches                                                                                                            | 0                                                                      | Static search + browser verification                | Every template change                 |
| PWA manifest/icon validity              | Browser warning present; icon sizes mismatched                                                                                                         | 0 warnings                                                             | Browser verification + file-dimension check         | Per release                           |

---

## Validation Checklist

- [ ] Verify representative flows in `/en/...`
- [ ] Verify representative flows in `/es/...`
- [ ] Validate mobile layouts and touch targets
- [ ] Validate desktop layouts and navigation density
- [ ] Test keyboard-only navigation on header, footer, filters, compare, and tree detail templates
- [ ] Smoke-test with a screen reader on at least one EN and one ES tree detail page
- [ ] Run `npm run build`
- [ ] Run `npm run lint`
- [ ] Check browser console for representative routes
- [ ] Recheck metadata/title/canonical/hreflang behavior on key routes
- [ ] Recheck PWA manifest/icon warnings
- [ ] Re-run factual audit after content remediation batches
- [ ] Re-run regression checks for share links, footer links, and compare/detail contracts

---

## Locked Decisions

1. **Fonts:** Fonts will be fully self-hosted to guarantee hermetic builds.
2. **PWA locale behavior:** The PWA experience will become locale-aware rather than defaulting to `/en`.
3. **Taxonomy conflicts:** When GBIF family data and editorial taxonomy disagree, the project will use source-noted exceptions rather than automatic overwrite.
4. **Evidence threshold:** Cultural, medicinal, and indigenous claims must meet the level of evidence and review that the relevant community would consider publishable.
5. **Tree detail UX priority:** Tree detail pages will prioritize deep reference reading while making the top portion of the page more mobile-friendly.
6. **Final sign-off:** Content owns final sign-off for “world-class” quality gates.

---

## Evidence Snapshot Used For This Revision

- `git log --oneline -10` reviewed on 2026-03-11
- `npm run lint` reviewed on 2026-03-12 (**passes with 0 warnings**)
- `npm run build` re-run during the follow-up implementation slices; the known Turbopack warning in `src/lib/error-tracking.ts` is resolved, the `next/image` quality allowlist now matches in-repo usage, and P0 remains open because self-hosted fonts are still required
- EN/ES content parity checked via filesystem for trees, comparisons, glossary, and oral histories
- EN/ES message-key parity checked for `messages/en.json` and `messages/es.json`
- First implementation slice completed on `fix/nav-share-contracts`, including updates to:
  - `src/components/Footer.tsx`
  - `src/components/ShareButton.tsx`
  - `src/app/[locale]/compare/page.tsx`
  - `src/app/[locale]/compare/[slug]/page.tsx`
  - `src/components/MobileNav.tsx`
  - `src/components/LanguageSwitcher.tsx`
  - `src/components/PrintButton.tsx`
  - `src/app/[locale]/contribute/photo/PhotoUploadClient.tsx`
  - `messages/en.json`
  - `messages/es.json`
- Follow-up implementation slices completed on:
  - `fix/sentry-adapter-boundary` with updates to `src/lib/error-tracking.ts` and `src/instrumentation.ts`
  - `fix/next-image-qualities` with updates to `next.config.ts`
- Browser-verified routes included:
  - `/en`
  - `/en/trees`
  - `/es/glossary`
  - `/es/compare`
  - `/es/trees/ceiba`
  - `/es/compare/aguacate-vs-aguacatillo`
- Saved Lighthouse baselines read from:
  - `lighthouse-report.json`
  - `lighthouse-report-mobile.json`
- Content accuracy evidence reviewed from:
  - `reports/factual-remediation-queue.full.md`
  - `scripts/audit-factual-accuracy.mjs`
  - `scripts/audit-content-quality.mjs`
