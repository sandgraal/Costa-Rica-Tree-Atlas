# Costa Rica Tree Atlas — Master Implementation Plan v6.0

**Last Updated:** 2026-05-15
**North Star:** _The bilingual tree atlas Costa Rica is proud of, that the world can cite._
**Cadence:** Plan-first, then long autonomous runs. Stops only at decision points or destructive actions.
**Prior versions:** v5.0 (2026-05-15, Authority-first pivot) and earlier — see git history.

---

## Why v6.0 exists

v5.0 set the right thesis (Authority-Atlas first), but it was still a punch list. v6.0 names the **product**, names the **audience**, names the **team of experts whose standards we're meeting**, and lays out a concrete 12-month path to a v1.0 launch that any of those experts could endorse.

The change from v5.0:

- **Identity is Costa Rica first.** Spanish-first defaults; Tico voice; indigenous languages on the near horizon. English is full parity but not the home seat.
- **Coverage is a curated 250, then expansion.** No more pretending 175 of 2,000 is a moat. We choose the right 250 across all eight major ecoregions, go encyclopedic, then grow.
- **Open by default.** Code → MIT; species dataset → CC-BY 4.0; indigenous-knowledge content stays under governance regardless of license. This unlocks DOI citation and AI-overview pickup.
- **AI-agent repo hardening is a first-class lane.** This codebase will be operated heavily by AI agents. We're going to give the agent everything it needs to do excellent work.

---

## The Expert Panel — Who Reviews What

Each expert is a standard we hold ourselves to, not a personal endorsement. We design as if they'd audit.

| Lane                                   | Standard-bearer voice                                                                                                                                       | What they want to see                                                                                                               |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Taxonomy & nomenclature**            | Kew (POWO) / IPNI / WFO scholars                                                                                                                            | Authority on every scientific name; basionyms and synonyms; canonical IDs; nomenclatural rigor                                      |
| **Conservation biology**               | IUCN SSC Plant Specialist Group; SINAC / CONAGEBIO                                                                                                          | Full assessment metadata (year, criteria, scope, rationale); CITES status; SINAC national listing; population trend                 |
| **GIS & biodiversity data**            | GBIF; Map of Life                                                                                                                                           | Real range polygons; Holdridge life-zone overlays; protected-area context; cached + DOI-cited GBIF downloads                        |
| **Field naturalist & ID**              | iNaturalist; Pl@ntNet                                                                                                                                       | Camera-first ID; GPS-aware "near me"; offline-capable; observation logging that flows back to citizen-science platforms             |
| **Indigenous self-determination**      | Bribrí, Cabécar, Maleku, Boruca, Térraba, Ngäbe, Huetar, Chorotega councils; Local Contexts (TK/BC labels)                                                  | FPIC; benefit-sharing; pronunciation by native speakers; refusal as a valid answer; no extraction                                   |
| **Ethnobotany**                        | Costa Rican ethnobotanists (UCR, INBio archive); Manual de Plantas de Costa Rica contributors                                                               | Sourced traditional uses; cultural context not flattened; medicinal claims with provenance                                          |
| **Costa Rican identity & narrative**   | Tico voice (Costa Rican Spanish, not Castilian); national pride hooks (Sin Ejército, Pago por Servicios Ambientales, 99% renewable, MEP biology curriculum) | Voice that feels like home, not like a translation                                                                                  |
| **Education**                          | MEP (Ministerio de Educación Pública); OTS / La Selva field educators                                                                                       | Curriculum-aligned lessons (Ciencias 3°–9°); teacher dashboards; printable classroom materials                                      |
| **Accessibility & inclusion**          | WAI / WCAG 2.2; Deque; disability advocates                                                                                                                 | Beyond AA — keyboard-only flows, screen-reader narration of maps, high-contrast not just dark mode, reduced motion, captioned audio |
| **Open science & dataset stewardship** | GBIF; Zenodo; FAIR data principles                                                                                                                          | Darwin Core Archive; DOI; versioned dataset; citation guide; cite-as on every page                                                  |
| **Security & privacy**                 | OWASP; Costa Rica Ley 8968; GDPR                                                                                                                            | EXIF GPS strip on uploads (poaching risk); CSP; data-handling policy; admin 2FA; security.txt                                       |
| **Performance & UX craft**             | web.dev / Core Web Vitals team; design systems community                                                                                                    | LCP/CLS/INP on mid-tier mobile; camera-entry verb-noun; design-token discipline                                                     |
| **AI-agent ergonomics**                | Anthropic Claude Code best practices (2026)                                                                                                                 | CLAUDE.md hierarchy; .claude/ skills + subagents; MCP servers; hooks; permissions; the agent should feel like a competent teammate  |
| **Software craft & maintainability**   | Senior engineers across Vercel / Next.js / open-source flora projects                                                                                       | Typed throughout; tests guard behavior not implementation; CI gates content + code                                                  |

---

## v1.0 Definition of Done

A Costa Rican grandmother in Pérez Zeledón finds her favorite _matapalo_ tree and reads about it in her language, with the names her abuela taught her in Bribrí. A taxonomist in Edinburgh cites our DOI in her monograph because our data is rigorous and machine-readable. A biology teacher in Liberia hands her 5th-graders a printable field guide for their school visit to Rincón de la Vieja. A backpacker in Corcovado opens the app offline, snaps a photo, identifies _ojoche_, and learns that the seeds are the same staple food the Mayans ate. A grad student downloads our Darwin Core Archive, runs an analysis, and credits the corpus.

**Concretely, v1.0 means all of these are true:**

- [ ] **250 species at encyclopedic depth** across all 8 major Costa Rican ecoregions, each with: full taxonomy + canonical IDs, sourced ethnobotany, ≥5 gallery images, indigenous names where they exist, distribution polygon, ID features, ecological role, IUCN + CITES + SINAC status.
- [ ] **Zero open factual-audit findings** in the high-risk bands (IUCN mismatches, family mismatches, schema errors). Citation-gap findings reduced to <20 trees total, each annotated with rationale.
- [ ] **Spanish content depth ≥ 95% of English** by line count per tree, on average. No tree missing entire sections in either locale.
- [ ] **Indigenous-language coverage** — pronunciations by native speakers for at least 6 ceremonially significant trees, in Bribrí + Cabécar + 1 additional language. Local Contexts TK/BC labels on every applicable page.
- [ ] **Darwin Core Archive of the species corpus** published to Zenodo with a DOI; cite-as block on every species page; CC-BY 4.0 license.
- [ ] **Codebase under MIT license**, with contributor's guide, code of conduct, and security.txt.
- [ ] **At least one named institutional endorsement** (SINAC, OTS, INBio archives, MEP, or a Costa Rican university). Public letter of support or partnership notice.
- [ ] **Camera-first identification flow** working: capture → Pl@ntNet API → top-3 candidates → species pages. GPS "near me" listing GBIF occurrences within user-set radius.
- [ ] **Offline-capable PWA** with map tile packs for ≥5 high-traffic protected areas.
- [ ] **WCAG 2.2 AA verified** by automated + manual audit. Screen-reader narration of distribution maps; high-contrast mode; reduced-motion respect.
- [ ] **AI-agent repo hardening complete**: root + scoped CLAUDE.md files, .claude/ skills and subagents, MCP server configs, hook gates, permissions tuned for unattended runs.
- [ ] **One unbroken page-load story**: LCP ≤ 2.5s on mid-tier Android, INP ≤ 200ms, no CLS regression.

---

## Lanes

Each lane has a status, a one-sentence "why now," and concrete deliverables. Lanes are not strictly sequential — many run in parallel through the phased roadmap below.

### L1 — Identity & Voice (Costa Rica first) 🔴 NEW

**Why now:** Without an identity decision, every other lane drifts toward "generic plant site translated to Spanish." Identity has to land before content depth scales.

- [ ] Voice & tone document committed at `docs/VOICE_AND_TONE.md` — Costa Rican Spanish as the home register; English as parity, not master. Tico idioms used judiciously, vos/usted conventions, no Castilian.
- [ ] Homepage rewrite (ES first, EN parity) — narrative anchor: place, pride, plant.
- [ ] National pride hooks where they belong (not pasted on top): linkage to Pago por Servicios Ambientales for relevant species; SINAC protected-area context on distribution pages; 1996 Forestry Law mentioned where germane.
- [ ] Visual identity audit and consolidation — color tokens, type stack, photographic guidelines, illustration style. Output: `docs/BRAND.md` + Tailwind theme polish.
- [ ] ES-first review pass on the top 20 highest-traffic pages.
- [ ] Costa Rica-specific homepage hero per ecoregion ("hoy en Guanacaste," seasonal blooming).

### L2 — Authority Data 🔴 IN PROGRESS

**Why now:** This is the load-bearing lane. The Atlas cannot be cited until the data is unimpeachable. v5.0 already started; v6.0 continues with the new canonical-ID schema in place.

- [x] Schema extension landed (`contentlayer.config.ts`) with POWO/WFO/IPNI/GBIF/IUCN/CITES/SINAC fields (2026-05-15)
- [x] First batch P1-high IUCN remediation: cocobolo (CR), cachimbo (LC), flamboyan (LC + 2020 reassessment context), all in both locales (2026-05-15)
- [ ] **Resolve remaining 9 P1-high IUCN mismatches with citation gaps**: `manu`, `camibar`, `eucalipto`, `palma-de-escoba`, `corozo`, `flor-de-itabo`, `papayillo` (carambola + araza already done in v4.6)
- [ ] **Resolve 14 P1-high IUCN-only mismatches**: `canelo`, `cortez-blanco`, `cristobalito`, `fruta-dorada`, `granadillo`, `guayacan-real`, `jacaranda`, `lechoso`, `olla-de-mono`, `pochote`, `sangrillo`, `sota`, `sura`, `tirra`
- [ ] **Resolve ~14 additional LC↔NE drift cases** (almendro, cacao, cana-agria, coco, cortez-negro, cristobal, fruta-de-pan, jobo, madero-negro, mango, maranon, mastate, papaya, tempisque, yellow-oleander) — many are agriculture species where NE is reasonable; verify and standardize
- [ ] **Backfill canonical external IDs for all 175 + new 75 species** via `scripts/backfill-canonical-ids.mjs` (NEW — to be written; uses POWO API, WFO download, GBIF species API)
- [ ] **Citation-gap remediation** — close all P2-medium citation gaps in high-risk sections (~30 trees with 2+ findings each). Target: ≥2 independent sources per high-risk section.
- [ ] **Visible citation footnotes** — ship `<CitationFootnote>` MDX component; convert inline parenthetical citations to numbered references with anchors.
- [ ] **CITES Appendix backfill** — flag every species with CITES status (cocobolo II, granadillo II, others); add `citesAppendix` frontmatter.
- [ ] **SINAC national status backfill** — research Decreto 25700-MINAE listings; add `sinacNationalStatus` for nationally listed species.
- [ ] **Live IUCN API integration** — replace GBIF's stale IUCN cache with live IUCN Red List API queries. Requires API token (see Inputs Needed).

### L3 — Coverage: Deep 250 🔴 NEW

**Why now:** 175 species of ~2,000 is ~8% coverage. Trying to push for comprehensive flora is multi-year; the right v1.0 is curated and deep across all ecoregions.

- [ ] **Ecoregion taxonomy doc** at `docs/ECOREGIONS.md` — the 8 we cover: (1) Tropical dry forest (Guanacaste), (2) Tropical moist forest (Caribbean lowlands), (3) Tropical moist forest (Central Pacific), (4) Premontane wet forest (Tilarán/Talamanca cordilleras), (5) Montane oak forest, (6) Cloud forest (Monteverde, Talamanca), (7) Mangrove (both coasts), (8) Riparian + urban/heritage trees.
- [ ] **Curate the 75 additional species** — ~9-10 per ecoregion, weighted toward: ceremonially important; ecologically keystone; endemic or near-endemic; on national crests/currency/postage; species that the existing 175 omit (mangroves are under-covered, paramo is missing entirely).
- [ ] **Ecoregion landing pages** (8 pages × 2 locales) at `/ecoregions/{slug}` — each with: introduction, characteristic trees, conservation context, photography, "visit it" pointers to protected areas.
- [ ] **Species page tiers** — formalize in `docs/CONTENT_STANDARDIZATION_GUIDE.md`:
  - **Tier 1 (Encyclopedic)**: Target for all Deep-250. ≥600 EN/≥500 ES lines, ≥5 gallery, ≥3 citations per high-risk section, distribution polygon, ID features, indigenous names where applicable.
  - **Tier 2 (Standard)**: For future expansion. ≥300 lines, ≥3 gallery, ≥1 citation per claim.
  - **Tier 3 (Stub)**: Permitted only with explicit "Stub" badge in UI; sets expectations.
- [ ] **Gallery curation** — every Tier 1 species has ≥5 high-quality images covering: full tree, leaf detail, bark detail, flower (in season), fruit/seed.
- [ ] **Distribution polygons** — convert string-list province distribution to GeoJSON polygons (use SINAC ASP overlays + GBIF occurrence convex hulls).

### L4 — Open Citizenship: Licensing, Dataset, DOI 🔴 NEW

**Why now:** AI overviews and serious researchers cite Kew, GBIF, and Wikipedia. They will not cite a proprietary, undownloadable site. Open licensing is the bridge from "neat project" to "primary source."

- [ ] **License migration** — `LICENSE` → MIT for code; new `LICENSE-DATA` → CC-BY 4.0 for species dataset; existing `LICENSE-CONTENT.md` → CC-BY 4.0 for narrative content; indigenous-knowledge content stays under governance terms regardless (Local Contexts TK/BC labels).
- [ ] **README + USAGE-POLICY rewrite** — reflect open posture; explain what is and isn't open.
- [ ] **Public contributor onboarding** — `CONTRIBUTING.md` rewrite (currently called "Development Notes"); add `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1); add `SECURITY.md` security disclosure; add `security.txt` at `.well-known/security.txt`.
- [ ] **Darwin Core Archive export** — `scripts/export-dwca.mjs` (NEW) — produces a DwC-A zip of all species records with required Darwin Core terms (scientificName, taxonRank, vernacularName, taxonRemarks, kingdom/phylum/class/order/family, references, license).
- [ ] **Zenodo deposit + DOI** — first stable corpus dump → Zenodo, claim DOI, configure auto-deposit on tagged releases.
- [ ] **`cite-as` metadata** — every species page exposes `<meta name="citation_doi">` + visible "Cite this page" block in both locales with APA, MLA, and BibTeX examples.
- [ ] **JSON-LD Taxon + Dataset markup** on species pages and corpus root.
- [ ] **`schema:FAQPage` JSON-LD** on safety pages (toxicity → answers).

### L5 — Indigenous Knowledge & Language 🟡 EXPANDING

**Why now:** P10 wrote excellent policy; v6.0 builds relationships. This is the lane with the slowest clock and the most consequential ethics. Failure mode is extraction; the goal is partnership.

- [ ] **Identify and reach out** to 2–3 partner communities (Bribrí and Cabécar are the most-spoken; Maleku and Boruca have rich tree-knowledge traditions). Honoraria budget required.
- [ ] **Local Contexts TK/BC labels** wired into the species page UI — when an indigenous name or use is shown, the relevant label is shown with it. Labels: TK Notice, TK Attribution, BC Provenance, etc.
- [ ] **Pronunciation recordings** by native speakers (not TTS) for at least 6 ceremonially significant trees per language, expanding from there. Audio files in the PWA.
- [ ] **Indigenous-language tree-name display** — schema already supports `indigenousNames`; UI exists; backfill content for the Deep-250 where speakers and sources permit.
- [ ] **FPIC documentation** — every indigenous content addition has a signed (or recorded) consent record stored privately, with the language and scope of consent explicit.
- [ ] **Refusal as a valid answer** — when a community asks us to remove or not publish, we honor it permanently and document the request without naming the requester.
- [ ] **Benefit-sharing policy** in `docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md` — % of any future donation/grant flows that returns to partner communities; on-site contributor credit; printed copies of relevant species sheets returned to communities.

### L6 — ES Content Depth Parity 🔴 NEW

**Why now:** P2 closed interface parity; v5.0 named P12 for content parity; v6.0 owns it as a first-class lane because the audit shows ES pages running 30–60% the length of EN, missing whole sections.

- [ ] **Backfill missing sections** on the 26 short ES pages (audit: 2026-03-22). Sections most often absent: Taxonomy, Geographic Distribution, Habitat, Botanical Description, Applications, Cultural, Conservation.
- [ ] **Bring average ES line count to ≥ 95% of EN per tree**.
- [ ] **CI regression gate** — fail if any ES tree drops below 80% of EN line count on a PR.
- [ ] **Spanish copyedit pass** by a Costa Rican Spanish reviewer (paid) on the top 20 most-trafficked pages.
- [ ] **Common-name dialectology** — note when a species' common name differs between Guanacaste, the Caribbean coast, the Central Valley, and the South. The schema's `indigenousNames` model can extend to regional Spanish names.

### L7 — AI-Agent Repo Hardening 🔴 NEW

**Why now:** This codebase is operated heavily by AI agents. Giving the agent the best possible context multiplies every other lane.

- [ ] **Root `CLAUDE.md`** — high-signal agent boot doc (≤200 lines). Project mission; tech stack; conventions; how to run; what to read first; what NEVER to do.
- [ ] **Scoped CLAUDE.md files** where conventions diverge:
  - `content/CLAUDE.md` — frontmatter schema, citation conventions, ES/EN parity rules, indigenous-knowledge content rules
  - `scripts/CLAUDE.md` — script conventions (ESM, argparse style, dry-run flag, JSON output flag)
  - `src/components/CLAUDE.md` — component patterns, accessibility expectations, i18n hooks
  - `tests/CLAUDE.md` — what each test family guards; how to add a new regression
- [ ] **`.claude/skills/` directory** with project-specific skills:
  - `add-species` — guided species addition (frontmatter → MDX template → image fetch → gallery → tests)
  - `audit-iucn` — runs factual audit and presents remediation queue
  - `remediate-tree` — guided single-tree remediation walk-through (frontmatter, visible copy in both locales, citations, tests)
  - `propose-image` — guided image proposal with attribution check
  - `update-ecoregion` — ecoregion landing-page update walk-through
- [ ] **`.claude/agents/` subagents** for specialized roles:
  - `iucn-verifier` — agent that hits IUCN/POWO APIs and validates frontmatter against external truth
  - `content-validator` — runs against CONTENT_PR_ACCEPTANCE_CRITERIA before suggesting commit
  - `spanish-copyeditor` — Costa Rican Spanish review pass on a specific MDX file
- [ ] **MCP server configuration** at `.mcp.json` for: GBIF Species API, IUCN Red List API (token-gated), POWO API, iNaturalist API. Optional: Cloudinary (already used) and Algolia/Meilisearch (once L11 ships).
- [ ] **`.claude/hooks/`** for gates:
  - Pre-tool-call hook on Write/Edit to MDX: validate frontmatter shape; warn on missing canonical IDs.
  - Pre-commit hook (already exists via husky): keep it; consider adding citation-completeness check for the touched files.
- [ ] **`.claude/settings.json`** with permissions tuned for unattended runs — allow read/edit/test commands, disallow destructive git ops, require confirmation for `npm install` or large refactors.
- [ ] **Rationalize agent docs** — `AGENTS.md` becomes a thin pointer to `CLAUDE.md`; `.github/copilot-instructions.md` stays for Copilot but cross-references CLAUDE.md as canonical; `.github/instructions/*.instructions.md` files keep their file-pattern scoping but each gets a "see also scoped CLAUDE.md" line.

### L8 — Field-Tool Foundations 🔴 PHASE-2 PREP

**Why now:** Authority alone is a reading product. Field-tool is what turns "yet another flora site" into "the Costa Rica tree app." Foundations now; full Phase 2 later.

- [ ] **Real image ID via Pl@ntNet API** — wrap on `/api/identify`, surface top-3 candidates with confidence scores. Free tier exists; document the rate budget.
- [ ] **GPS "trees near you"** — GBIF occurrence query within user-set radius. Permission flow with clear copy ("we use your location only to find nearby observations").
- [ ] **Offline map tile pack** — Service Worker delta for 5 high-traffic protected areas (Corcovado, Manuel Antonio, Monteverde, Tortuguero, Arenal). Document tile attribution.
- [ ] **iNaturalist round-trip** — "Log an observation" flow via iNat OAuth; user submits under their own identity; we don't claim ownership of their observations.
- [ ] **Camera entry point on homepage** — first-class "scan" verb-noun; existing favorites/compare don't compete with it for the cold-start user.
- [ ] **AR identification** — REMOVED from public commitments until we have an engineering scope. Pl@ntNet API → AR overlay can be a Phase 3+ enhancement, not a v1.0 promise.

### L9 — Education Seeds 🔴 PHASE-3 PREP

**Why now:** Education adoption requires trust (L2) + engagement (L8). Don't pitch MEP partnerships before v1.0 lands. But seed the structure now so Phase 3 doesn't start from zero.

- [ ] **MEP curriculum mapping** — research and document the Ciencias 3°–9° standards relevant to Costa Rican flora; map existing lessons to standards.
- [ ] **Printable classroom packs** per ecoregion — field-guide PDFs already exist for favorites; create curated ecoregion packs.
- [ ] **Teacher dashboard scaffolding** — non-functional spec at `docs/EDUCATION_PLATFORM.md`; defines what a teacher dashboard would do (class roster, progress, assessments).
- [ ] **SCORM/xAPI export** — research-only this phase; decision deferred to Phase 3.
- [ ] **Honest certificate framing** — change the language around the existing "certificate" to "completion badge" until we partner with an accrediting body; don't oversell.

### L10 — Trust & Safety 🟡 PARTIAL

**Why now:** Foundations are strong (Dependabot, CodeQL, TruffleHog, ESLint security). The middle is soft, and one of the gaps (EXIF GPS strip) is actively dangerous for protected species.

- [ ] **EXIF GPS strip on photo upload** — confirm or implement at both storage and presentation layers. **Treat as P0 if not present.** Audit `src/app/api/.../image` routes.
- [ ] **Costa Rica Ley 8968 + GDPR privacy notice** — ES + EN privacy pages with explicit purpose limitation and user rights.
- [ ] **CSP nonce strategy** — verify in `middleware.ts`; add if absent.
- [ ] **Admin 2FA** — Prisma user model has admin role; add 2FA via TOTP for admin accounts.
- [ ] **Audit log retention policy** — documented retention window for `AdminAuditLog` table.
- [ ] **security.txt** at `.well-known/security.txt` once L4 license migration lands.
- [ ] **WCAG 2.2 audit** — go beyond AA on 2.1; address new SCs (focus appearance, target size minimum, dragging movements, consistent help).
- [ ] **Screen-reader narration of distribution maps** — non-visual equivalent for live GBIF data.
- [ ] **Reduced-motion audit** — every animation respects `prefers-reduced-motion`.
- [ ] **High-contrast mode** — distinct from dark mode; AAA-validated tokens on the contrast-critical path.

### L11 — Performance & Search at Scale 🟡 PARTIAL

**Why now:** Lighthouse 90 mobile is good, not great. Search is fine at 175 species; it breaks at 1,000+.

- [ ] **Tree-detail render perf on mid-tier mobile** — profile and optimize (P6 carryover).
- [ ] **Search index migration** — stand up Meilisearch or Typesense; move species + glossary + comparison search off client-side bundle. Filters by family + IUCN + ecoregion + elevation + month — facet engine.
- [ ] **The power-query**: "find me all medicinal LC-status trees flowering in May at >1500m elevation." Today, impossible. After L11, easy.
- [ ] **Lazy / defer secondary modules** — P7 carryover.
- [ ] **Visual regression** for the templates where a regression breaks trust: tree-detail, compare, map. Skip homepage/glossary/education until v1.0.

### L12 — SEO / GEO & Discoverability 🟡 PARTIAL

**Why now:** Lighthouse SEO 100 is the floor. Getting picked up by AI overviews and ranking for "what tree is this Costa Rica" is the ceiling.

- [ ] **Structured data audit** — confirm/add: `schema:Taxon`, `schema:Dataset`, `schema:FAQPage` on safety pages, `schema:HowTo` on identification flows, `schema:BreadcrumbList` everywhere.
- [ ] **AI-overview readiness** — Q&A pattern on safety pages; clean answer-first formatting on identification questions; dataset DOI exposed so AI cites us.
- [ ] **Internal linking authority distribution** — audit which pages currently absorb vs. distribute link authority; rebalance toward Deep-250 anchors.
- [ ] **Sitemap freshness signal** — confirm `<lastmod>` reflects real content updates not deploy timestamps.
- [ ] **`hreflang` already strong** — keep it that way as new pages ship.

---

## Phased Roadmap

Realistic 12-month plan. Phases overlap intentionally; lanes don't.

### Phase 1 (Weeks 1–12) — Foundation

**Theme:** Make the codebase agent-ready and start the data work.

- L7 AI-agent repo hardening (CLAUDE.md hierarchy, .claude/ skills + subagents, MCP config, hooks)
- L2 Authority data — close remaining 9 P1-high IUCN+citation, 14 P1-high IUCN-only
- L4 License migration to MIT + CC-BY 4.0 + CONTRIBUTING + CODE_OF_CONDUCT + security.txt
- L10 Trust & Safety priority items: **EXIF GPS strip (P0)**, privacy notice, CSP
- L1 Voice & tone doc + brand audit
- L6 ES depth: address the 26 short trees

**Phase 1 exit criteria:** All 23 P1-high trees resolved. Repo MIT. CLAUDE.md + .claude/ scaffold complete. EXIF GPS confirmed. No tree shorter than 60% EN line count.

### Phase 2 (Weeks 13–24) — Coverage and Open

**Theme:** Deep-250 lands; the dataset becomes citable.

- L3 Coverage — pick the 75 additional species; build out ecoregion landing pages
- L4 Open dataset — DwC-A export, Zenodo deposit, DOI, cite-as on every species page
- L2 Authority data — backfill all canonical IDs (POWO/WFO/GBIF/IUCN); citation-gap remediation
- L5 Indigenous knowledge — open 2 community partnership conversations; first pronunciation recordings (~6 trees, Bribrí or Cabécar)
- L11 Search at scale — Meilisearch/Typesense migration

**Phase 2 exit criteria:** 250 species at Tier 1. Dataset has DOI. 6+ indigenous-language pronunciations live. Power-query works.

### Phase 3 (Weeks 25–36) — Field & Education

**Theme:** Verbs, not nouns.

- L8 Field-tool — Pl@ntNet integration, GPS "near me," offline tiles, iNaturalist round-trip
- L9 Education seeds — MEP curriculum mapping; ecoregion classroom packs
- L1 Costa Rica identity — homepage and pride hooks shipped in production
- L5 Indigenous knowledge — expand to 2 additional languages; refine FPIC documentation
- L10 WCAG 2.2 audit + screen-reader-map narration

**Phase 3 exit criteria:** Camera ID is the homepage verb. Offline tiles work in Corcovado. WCAG 2.2 AA verified.

### Phase 4 (Weeks 37–48) — Endorsement and Launch

**Theme:** Prove it, ship it.

- L5 Lock partnership letter from at least one of: SINAC, OTS, INBio archives, MEP, UCR/UNA
- L12 SEO / GEO polish; AI-overview testing
- L2/L3 Final factual audit pass; finalize Deep-250
- L9 Pilot ecoregion classroom pack with one school
- Soft launch, then public launch with announcement to: GBIF community, Costa Rican press, Anthropic blog (if appropriate), open-science community

**Phase 4 exit criteria:** Every v1.0 DoD item checked.

---

## Inputs Needed From You

Most lanes are unblocked. A few benefit from inputs only you can provide. Provide what's easy; flag what's not feasible and we'll plan around it.

| #   | Input                                                                                                                                                                                                                                                                                            | Why                                                                                                                   | Urgency   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- | --------- |
| 1   | **IUCN Red List API token** (apply at iucnredlist.org/api/v3/token — free for non-commercial)                                                                                                                                                                                                    | Replaces GBIF's stale IUCN cache with live truth; eliminates a class of false positives in the audit                  | Phase 1   |
| 2   | **Pl@ntNet API key** (free tier exists at my.plantnet.org)                                                                                                                                                                                                                                       | Camera-first ID via real ML                                                                                           | Phase 3   |
| 3   | **Authoritative reference library** — do you have PDF/digital access to: _Manual de Plantas de Costa Rica_ (W. Burger et al., MBG/INBio), _Trees of Tropical America_ (T. Pennington), Allen's _Rainforest of Costa Rica_?                                                                       | These are the canonical secondary sources for Costa Rica flora; citation hierarchy gets meaningfully better with them | Phase 1–2 |
| 4   | **Indigenous community contacts**, even informal (a friend of a friend in Talamanca counts)                                                                                                                                                                                                      | L5 is partnership-paced. Cold outreach takes 2–3× longer than warm                                                    | Phase 2   |
| 5   | **Budget posture** for: paid translation review (~$500–2,000), Pl@ntNet commercial tier if free runs out (~$50/mo), indigenous community honoraria (varies, plan $500–2,000 per partner per pronunciation session), professional photography licensing if iNat CC-licensed isn't enough (varies) | Determines what we can plan vs. defer                                                                                 | Phase 1   |
| 6   | **Hosting / infra confirmation** — staying on Vercel? Costa Rica edge presence? Any data-sovereignty constraints from Ley 8968?                                                                                                                                                                  | Affects L10 plan                                                                                                      | Phase 1   |
| 7   | **Confirm license migration** is OK now — code MIT, dataset CC-BY 4.0, content CC-BY 4.0, indigenous knowledge under governance terms regardless                                                                                                                                                 | L4 starts on Phase 1; without this, lane stalls                                                                       | Phase 1   |
| 8   | **Endorsement targets** — which institutions are highest priority? SINAC vs. OTS vs. UCR vs. MEP? Any existing relationships?                                                                                                                                                                    | Drives L5 partnership focus                                                                                           | Phase 4   |

If any of these are dealbreakers ("no, we cannot get an IUCN token") tell me and we plan around. If any are easy now ("here, IUCN_TOKEN=…"), drop them in `.env.local` and the audit will pick them up.

---

## Risks & Guardrails

| Risk                                                                                                                                     | Mitigation                                                                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Indigenous content harm** — extracting or misrepresenting traditional knowledge                                                        | L5 governance is mature in policy; partnership-pacing is the real guard. Default to "publish nothing without explicit consent." Refusal is a valid answer.                        |
| **License migration regret** — once code is MIT and dataset is CC-BY, it's effectively irreversible                                      | One-time decision. Confirm explicitly (Input #7). Indigenous content stays gated regardless of license.                                                                           |
| **Endorsement-blocking factual error** — a credentialed reviewer finds an IUCN mismatch or unsourced ethnobotanical claim and walks away | L2 is the answer. We do not court endorsements until P5 + L2 are green.                                                                                                           |
| **Tico voice that doesn't land** — outsider-flavored Spanish                                                                             | L6 paid Costa Rican copyeditor; voice doc reviewed by a native speaker before adoption.                                                                                           |
| **AI-agent generates plausible but wrong botanical claims**                                                                              | Citation-required gate on high-risk sections; `<CitationFootnote>` is a hard requirement, not optional. `iucn-verifier` subagent catches IUCN drift before commit.                |
| **Scope creep on Deep-250** — turn into Deep-500                                                                                         | Curate explicitly; lock the list at end of Phase 1; resist additions in Phase 2.                                                                                                  |
| **Field-tool feature creep** — AR, ML training, etc.                                                                                     | AR is removed from public commitments. Pl@ntNet API only; offline tiles only for 5 named parks. No proprietary ML in v1.0.                                                        |
| **Maintainer burnout** — one person + AI agents                                                                                          | This plan presumes you stay primary. AI agents do drafting and audits; humans do partnerships, voice, and indigenous relationships. We accept slower velocity over wrong content. |

---

## Verification & Launch Criteria

Verification is woven into every lane. Headline gates:

1. **Phase 1 exit**: `npm run build && npm run test:run && npm run content:fact-audit` clean. `.claude/` complete. EXIF GPS strip verified live. 23 P1-high trees resolved.
2. **Phase 2 exit**: Zenodo DOI live. DwC-A downloads cleanly and validates against Darwin Core schema. 250 species at Tier 1 per audit. Power-query (multi-facet) returns in <200ms.
3. **Phase 3 exit**: Camera-first homepage flow works on Android 11+ and iOS 16+. WCAG 2.2 AA report attached. Offline tile pack downloads and renders.
4. **Phase 4 exit (v1.0)**: All DoD items checked. Endorsement letter posted. Launch announcement live.

**Launch-day proof points (visible to the user):**

- Snap a photo of a leaf → top-3 species with confidence
- Open the site offline in Corcovado → it works
- Click "Cite this page" → BibTeX, MLA, APA + DOI
- Toggle to Spanish → it's better, not just translated
- Tap an indigenous name → hear a recording from a native speaker, with a TK label
- View source on any species page → JSON-LD Taxon + Dataset markup

---

## Operating Notes for Future Sessions

When picking this plan back up:

1. Read [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) (this file) — single source of truth.
2. Skim [CLAUDE.md](CLAUDE.md) at the repo root once it exists (Phase 1, L7).
3. Run `git log --oneline -10` for last-touched context.
4. Run `npm run content:fact-audit -- --skip-external` for the current factual state.
5. Mark lanes/items complete here as work lands; never duplicate state in a separate handoff doc.

---

_v6.0 supersedes v5.0. North star: Costa Rica first, world welcome. v1.0 ships in 12 months._
