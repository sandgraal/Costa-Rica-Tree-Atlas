# Costa Rica Tree Atlas — Master Implementation Plan v7.0

**Last Updated:** 2026-07-04 (Phase 2 progress: L2 fact-audit closed the CI gap it was missing, L3 ecoregion doc + backlog rebuilt, L6 ES-parity CI gate shipped, L7 hooks + subagent tightening shipped — see each lane for detail. No version bump; this is routine in-phase progress, not a pivot.)
**North Star:** _The bilingual tree atlas Costa Rica is proud of, that the world can cite._
**Cadence:** Plan-first, then long autonomous runs. Stops only at decision points or destructive actions.
**Prior versions:** v6.0 (2026-05-15, expert-panel pivot), v5.0 (Authority-first pivot), earlier — see git history.

---

## Why v7.0 exists

Three days after v6.0 landed, the load-bearing lanes have shipped. The factual audit went from **23 P1-high IUCN mismatches to 0 errors**. Open licensing, EXIF GPS strip, Dataset JSON-LD, FAQPage JSON-LD, Darwin Core Archive export script, security.txt, MFA, CONTRIBUTING/CODE_OF_CONDUCT/SECURITY — all in. v6.0's Phase 1 is essentially complete.

v7.0 records what shipped, declares **Phase 2 (Coverage + Open Dataset)** as the active phase, and resets the 12-month path to v1.0 from current ground truth. The headline change vs v6.0: this is no longer an authority-data project — it's a **coverage, indigenous-partnership, and field-tool project** now, with one big SEO/AI-overview lane (HowTo) and an L7 polish pass to apply Claude Code 2026 best practices to a repo that is now run heavily by AI agents.

The v6.0 "P5 — Factual Remediation" section is sunset: the queue is empty, and the historical record is in git.

---

## What shipped between v6.0 (2026-05-15) and v7.0 (2026-05-18)

| PR                                                                  | Lane   | Headline                                                 |
| ------------------------------------------------------------------- | ------ | -------------------------------------------------------- |
| [#747](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/747) | L2     | Backfill canonical taxonomic IDs on 150 species          |
| [#748](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/748) | L2     | Close remaining 12 P1-high IUCN/family drift findings    |
| [#749](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/749) | L4     | Darwin Core Archive export script                        |
| [#750](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/750) | L1     | BRAND.md (visual identity, naming, posture)              |
| [#752](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/752) | L6     | canelo body↔frontmatter VU→LC + expand ES depth          |
| [#753](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/753) | L4/L12 | "Cite this page" + Dataset JSON-LD on species pages      |
| [#754](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/754) | L10    | Align security audit with the production dependency gate |
| [#755](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/755) | L12    | `schema:FAQPage` JSON-LD on safety pages                 |

Plus dependency hygiene PRs and weekly image optimization. Total touch surface: factual audit clean, governance complete, structured data near-complete, ES depth essentially at parity, TypeScript at 0 errors.

---

## The Expert Panel — Who Reviews What

Each expert is a standard we hold ourselves to. We design as if they'd audit.

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
| **AI-agent ergonomics**                | Anthropic Claude Code 2026 best practices                                                                                                                   | CLAUDE.md hierarchy; skill auto-invoke; subagent least-privilege; MCP for live data; hook-based content invariants; memory seeding  |
| **Software craft & maintainability**   | Senior engineers across Vercel / Next.js / open-source flora projects                                                                                       | Typed throughout; tests guard behavior not implementation; CI gates content + code                                                  |

---

## v1.0 Definition of Done

A Costa Rican grandmother in Pérez Zeledón finds her favorite _matapalo_ tree and reads about it in her language, with the names her abuela taught her in Bribrí. A taxonomist in Edinburgh cites our DOI in her monograph because our data is rigorous and machine-readable. A biology teacher in Liberia hands her 5th-graders a printable field guide for their school visit to Rincón de la Vieja. A backpacker in Corcovado opens the app offline, snaps a photo, identifies _ojoche_, and learns that the seeds are the same staple food the Mayans ate. A grad student downloads our Darwin Core Archive, runs an analysis, and credits the corpus.

**Concretely, v1.0 means all of these are true:**

- [ ] **250 species at encyclopedic depth** across all 8 major Costa Rican ecoregions, each with: full taxonomy + canonical IDs, sourced ethnobotany, ≥5 gallery images, indigenous names where they exist, distribution polygon, ID features, ecological role, IUCN + CITES + SINAC status.
- [x] **Zero open factual-audit findings in the high-risk bands** (IUCN mismatches, family mismatches, schema errors). Citation-gap findings reduced to <20 trees total. ✅ As of 2026-05-18: 0 errors, 1 warning across 175 trees.
- [x] **Spanish content depth ≥ 95% of EN by line count per tree, on average.** ✅ As of 2026-05-18: median ≈99%, lowest 84% (canelo). One outlier remains.
- [ ] **Indigenous-language coverage** — pronunciations by native speakers for at least 6 ceremonially significant trees, in Bribrí + Cabécar + 1 additional language. Local Contexts TK/BC labels on every applicable page.
- [ ] **Darwin Core Archive of the species corpus** published to Zenodo with a DOI; cite-as block on every species page (visible block ✅); CC-BY 4.0 license ✅.
- [x] **Codebase under MIT license**, with contributor's guide, code of conduct, and security.txt. ✅ All in.
- [ ] **At least one named institutional endorsement** (SINAC, OTS, INBio archives, MEP, or a Costa Rican university). Public letter of support or partnership notice.
- [ ] **Camera-first identification flow** working: capture → Pl@ntNet API → top-3 candidates → species pages. GPS "near me" listing GBIF occurrences within user-set radius.
- [ ] **Offline-capable PWA** with map tile packs for ≥5 high-traffic protected areas.
- [ ] **WCAG 2.2 AA verified** by automated + manual audit. Screen-reader narration of distribution maps; high-contrast mode; reduced-motion respect.
- [ ] **AI-agent repo hardening complete**: root + scoped CLAUDE.md ✅; .claude/ skills + subagents ✅; MCP server configs ✅; hook gates ☐; permissions tuned for unattended runs ☐; auto-memory seeded ☐.
- [ ] **One unbroken page-load story**: LCP ≤ 2.5s on mid-tier Android, INP ≤ 200ms, no CLS regression.
- [ ] **Pre-launch security review**: full WCAG audit + penetration test pass + privacy notice published (Ley 8968 + GDPR).
- [ ] **First institutional citation**: someone outside the project cites our DOI in a paper, monograph, or dataset metadata.

---

<!-- AUTO-METRICS:START -->

## 📊 Current Status Dashboard

**Last auto-updated:** 2026-08-02
_Generated by `scripts/update-implementation-metrics.mjs`. Do not hand-edit._

### Content coverage

| Corpus               | Count | Target | Progress |
| -------------------- | ----: | -----: | -------: |
| Species (per locale) |   180 |    250 |      72% |
| Comparison guides    |    20 |     20 |     100% |
| Glossary terms       |   150 |    150 |     100% |
| Oral histories       |     2 |      — |        — |

Bilingual documents: **360** species files across EN + ES.

### Lane progress

| Lane        | Title                                                                      |   Done |   Total |       % |
| ----------- | -------------------------------------------------------------------------- | -----: | ------: | ------: |
| L1          | Identity & Voice (Costa Rica first) 🟡 PARTIAL                             |      2 |       6 |     33% |
| L2          | Authority Data 🟢 EFFECTIVELY DONE                                         |      5 |       9 |     56% |
| L3          | Coverage: Deep 250 🔴 ACTIVE                                               |      2 |       6 |     33% |
| L4          | Open Citizenship: Licensing, Dataset, DOI 🟢 NEARLY DONE                   |      7 |      10 |     70% |
| L5          | Indigenous Knowledge & Language 🟡 GOVERNANCE READY, RELATIONSHIPS PENDING |      1 |       8 |     13% |
| L6          | ES Content Depth Parity 🟢 PHASE 1 DONE, PHASE 2 NEARLY MET                |      4 |       7 |     57% |
| L7          | AI-Agent Repo Hardening 🟡 STRONG FOUNDATION, MODERN POLISH NEXT           |      9 |      17 |     53% |
| L8          | Field-Tool Foundations 🔴 NOT STARTED                                      |      1 |       6 |     17% |
| L9          | Education Seeds 🟡 SCAFFOLD PRESENT                                        |      0 |       4 |      0% |
| L10         | Trust & Safety 🟢 CRITICAL ITEMS DONE, A11Y NEXT                           |      4 |      12 |     33% |
| L11         | Performance & Search at Scale 🔴 NOT STARTED                               |      0 |       6 |      0% |
| L12         | SEO / GEO & Discoverability 🟢 STRONG, ONE TYPE LEFT                       |      8 |      12 |     67% |
| **Overall** |                                                                            | **43** | **103** | **42%** |

<!-- AUTO-METRICS:END -->

## Lanes

Each lane has a status, a one-sentence "why now," and concrete deliverables. Lanes are not strictly sequential — many run in parallel through the phased roadmap below.

### L1 — Identity & Voice (Costa Rica first) 🟡 PARTIAL

**Why now:** Without an identity decision, every other lane drifts toward "generic plant site translated to Spanish." Foundation docs landed (BRAND.md, VOICE_AND_TONE.md); visible production polish is next.

- [x] Voice & tone document at [`docs/VOICE_AND_TONE.md`](VOICE_AND_TONE.md) — Costa Rican Spanish as the home register (2026-05-15)
- [x] Visual identity audit and consolidation at [`docs/BRAND.md`](BRAND.md) (2026-05-16). Tailwind theme polish remains a follow-up — the doc and globals.css tokens are source-of-truth synchronized.
- [ ] Homepage rewrite (ES first, EN parity) — narrative anchor: place, pride, plant.
- [ ] National pride hooks where they belong (not pasted on top): linkage to Pago por Servicios Ambientales for relevant species; SINAC protected-area context on distribution pages; 1996 Forestry Law mentioned where germane.
- [ ] ES-first review pass on the top 20 highest-traffic pages.
- [ ] Costa Rica-specific homepage hero per ecoregion ("hoy en Guanacaste," seasonal blooming).

### L2 — Authority Data 🟢 EFFECTIVELY DONE

**Why now:** Was the load-bearing lane in v6.0. As of 2026-05-18, the factual audit reports 0 errors and 1 warning across 175 trees. Remaining items are polish and live-API integration.

- [x] Schema extension landed (`contentlayer.config.ts`) with POWO/WFO/IPNI/GBIF/IUCN/CITES/SINAC fields (2026-05-15)
- [x] All P1-high IUCN mismatches closed (#748, 2026-05-16)
- [x] Canonical external ID backfill on 175 species via [`scripts/backfill-canonical-ids.mjs`](../scripts/backfill-canonical-ids.mjs) (2026-05-16): `gbifTaxonKey`, `nameAuthority`, `iucnScope: global`, `citesAppendix: none` defaults applied; `matapalo` flagged for manual disambiguation
- [x] CITES Appendix backfill — blind default dropped; 4 known App II species corrected (2026-05-16)
- [x] Citation-gap remediation — citation coverage findings down to 1 across the corpus (2026-05-18)
- [ ] **`<CitationFootnote>` MDX component** — ship visible numbered references with anchors; convert inline parenthetical citations to footnotes
- [ ] **Live IUCN API integration** — replace GBIF's stale IUCN cache with live IUCN Red List API queries. Requires `IUCN_TOKEN` (see Inputs Needed)
- [ ] **SINAC national status backfill** — research Decreto 25700-MINAE listings; add `sinacNationalStatus` for nationally listed species
- [ ] **POWO/IPNI live lookup** in `scripts/backfill-canonical-ids.mjs` — extend to query POWO API for `powoId`/`ipniId`

### L3 — Coverage: Deep 250 🔴 ACTIVE

**Why now:** 180 species of ~2,000 is ~9% coverage. The right v1.0 is curated and deep across all ecoregions, not comprehensive. This is the headline content lane for the next quarter.

- [x] **Ecoregion taxonomy doc** at [`docs/ECOREGIONS.md`](ECOREGIONS.md) (2026-07-04) — the 8 we cover, plus a proposed 9th (páramo, see below). Coverage counts computed from existing `distribution`/`elevation` frontmatter (heuristic, not GIS-precise — real fix is the "Distribution polygons" item below).
- [x] **Curate the 75 additional species** — research pass complete (2026-07-04), ~68 individually GBIF/POWO/iNaturalist-verified candidates across all 8 ecoregions in [`docs/MISSING_SPECIES_LIST.md`](MISSING_SPECIES_LIST.md), short of 75 by design (accuracy prioritized over quota — several plausible leads were investigated and dropped). **Correction to this line's prior assumption:** mangrove is _not_ under-covered — all 5 true mangrove-forming genera present in Costa Rica are already documented; the real, data-confirmed critical gap is **montane oak forest** (zero of 175 species have min elevation ≥2000m). Páramo was investigated as a possible 9th category and is recommended for adoption, pending an editorial decision on whether shrubby Ericaceae/Hypericaceae qualify under the atlas's "tree" definition. Actual page-writing against this backlog is still open.
- [ ] **Ecoregion landing pages** (8 pages × 2 locales) at `/ecoregions/{slug}` — each with: introduction, characteristic trees, conservation context, photography, "visit it" pointers to protected areas.
- [ ] **Species page tiers** — formalize in [`docs/CONTENT_STANDARDIZATION_GUIDE.md`](CONTENT_STANDARDIZATION_GUIDE.md):
  - **Tier 1 (Encyclopedic)**: Target for all Deep-250. ≥600 EN/≥500 ES lines, ≥5 gallery, ≥3 citations per high-risk section, distribution polygon, ID features, indigenous names where applicable.
  - **Tier 2 (Standard)**: For future expansion. ≥300 lines, ≥3 gallery, ≥1 citation per claim.
  - **Tier 3 (Stub)**: Permitted only with explicit "Stub" badge in UI; sets expectations.
- [ ] **Gallery curation** — every Tier 1 species has ≥5 high-quality images covering: full tree, leaf detail, bark detail, flower (in season), fruit/seed.
- [ ] **Distribution polygons** — convert string-list province distribution to GeoJSON polygons (use SINAC ASP overlays + GBIF occurrence convex hulls).

### L4 — Open Citizenship: Licensing, Dataset, DOI 🟢 NEARLY DONE

**Why now:** AI overviews and serious researchers cite Kew, GBIF, and Wikipedia. They will not cite a proprietary, undownloadable site. Open posture is shipped; the Zenodo deposit closes the loop.

- [x] **License migration** — `LICENSE` (MIT) ✅; `LICENSE-DATA.md` (CC-BY 4.0 for species dataset) ✅; `LICENSE-CONTENT.md` (CC-BY 4.0 for narrative content) ✅; indigenous-knowledge content stays under governance terms regardless
- [x] **CONTRIBUTING.md** + **CODE_OF_CONDUCT.md** (Contributor Covenant) + **SECURITY.md** + `public/.well-known/security.txt` (2026-05-17)
- [x] **Darwin Core Archive export** — [`scripts/export-dwca.mjs`](../scripts/export-dwca.mjs) (#749, 2026-05-17)
- [x] **`cite-as` metadata** — every species page exposes `citation_*` `<meta>` tags + visible "Cite this page" block in both locales (APA / MLA / BibTeX). Component: [`src/components/CitePage.tsx`](../src/components/CitePage.tsx). DOI gated on real Zenodo mint via placeholder in [`src/lib/citation/index.ts`](../src/lib/citation/index.ts).
- [x] **JSON-LD Dataset markup** on species pages (#753, 2026-05-17)
- [x] **JSON-LD FAQPage markup** on safety pages (#755, 2026-05-18) — four Q/A pairs (ingestion, skin contact, eye contact, emergency). Helper: [`src/lib/seo/safety-faq.ts`](../src/lib/seo/safety-faq.ts).
- [x] **Zenodo deposit + first DOI** — live: `10.5281/zenodo.20279670`, published 2026-05-19, tagged `1.0.0-draft`, CC BY 4.0. `DATASET_DOI` in `src/lib/citation/index.ts` carries the real value; citation UI, BibTeX, and JSON-LD all pick it up via `hasMintedDOI()`. The archive itself is a snapshot from that date — re-export and push a new Zenodo version (same concept DOI) at the next meaningful content milestone.
- [ ] **Auto-deposit on tagged releases** — GitHub Actions → Zenodo on `v*` tags. This is the remaining gap: the 2026-05-19 deposit was a one-shot manual run, so the corpus has already outgrown the archived snapshot (175+ species now vs. whatever existed on deposit day).
- [ ] **`schema:HowTo` JSON-LD** on identification flows.
- [ ] **README + USAGE-POLICY rewrite** — reflect the open posture; explain what is and isn't open.

### L5 — Indigenous Knowledge & Language 🟡 GOVERNANCE READY, RELATIONSHIPS PENDING

**Why now:** v6.0 codified governance; v7.0 builds relationships. This is the lane with the slowest clock and the most consequential ethics. Failure mode is extraction; the goal is partnership.

- [x] **Governance policy** at [`docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md`](INDIGENOUS_KNOWLEDGE_GOVERNANCE.md)
- [ ] **Identify and reach out** to 2–3 partner communities (Bribrí and Cabécar are the most-spoken; Maleku and Boruca have rich tree-knowledge traditions). Honoraria budget required.
- [ ] **Local Contexts TK/BC labels** wired into the species page UI — when an indigenous name or use is shown, the relevant label is shown with it.
- [ ] **Pronunciation recordings** by native speakers (not TTS) for at least 6 ceremonially significant trees per language, expanding from there. Audio files in the PWA.
- [ ] **Indigenous-language tree-name display** — schema already supports `indigenousNames`; UI exists; backfill content for the Deep-250 where speakers and sources permit.
- [ ] **FPIC documentation** — every indigenous content addition has a signed (or recorded) consent record stored privately, with the language and scope of consent explicit.
- [ ] **Refusal as a valid answer** — when a community asks us to remove or not publish, we honor it permanently and document the request without naming the requester.
- [ ] **Benefit-sharing policy detail** in [`docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md`](INDIGENOUS_KNOWLEDGE_GOVERNANCE.md) — % of any future donation/grant flows returning to partner communities; on-site contributor credit; printed copies of relevant species sheets returned to communities.

### L6 — ES Content Depth Parity 🟢 PHASE 1 DONE, PHASE 2 NEARLY MET

**Why now:** Audit showed the lane essentially done. Remaining work: 6 stub trees and a CI regression gate to prevent backsliding.

- [x] **Backfill missing sections on the historical short ES pages** (audit: 2026-03-22). State as of 2026-05-18: only 6 trees remain under 600 lines, all six are short in **both** locales (parity preserved).
- [x] **Phase 1 exit criterion: no ES tree below 60% of EN line count.** Achieved 2026-05-17.
- [x] **Phase 2 target: average ES line count ≥95% of EN.** Median ≈99% as of 2026-05-18. One outlier (`canelo` at 84%) — flagged.
- [ ] **Encyclopedic depth for the 6 remaining stub trees** in both locales (target: 600+ lines per locale, all 8 standard sections present): `sota`, `copal`, `cedro-macho`, `canelo`, `guacimo-molenillo`, `pochote-de-agua`.
- [x] **CI regression gate** — `scripts/check-es-depth-parity.mjs`, wired into `content-build-tests.yml` (2026-07-04). Deliberately narrow (checks only the 80% ratio) rather than reusing `content:audit`, which already fails today on the 6 known stub trees below and would have blocked every PR immediately if wired in wholesale.
- [ ] **Spanish copyedit pass** by a Costa Rican Spanish reviewer (paid) on the top 20 most-trafficked pages.
- [ ] **Common-name dialectology** — note when a species' common name differs between Guanacaste, the Caribbean coast, the Central Valley, and the South. The schema's `indigenousNames` model can extend to regional Spanish names.

### L7 — AI-Agent Repo Hardening 🟡 STRONG FOUNDATION, MODERN POLISH NEXT

**Why now:** This codebase is operated heavily by AI agents. v6.0 built the foundation (CLAUDE.md hierarchy, skills, subagents, MCP). v7.0 applies the 2026 Claude Code best-practices polish so unattended runs are safe, fast, and self-correcting.

**Already shipped:**

- [x] Root [`CLAUDE.md`](../CLAUDE.md) (~250 lines, within signal budget)
- [x] Scoped guides: [`content/CLAUDE.md`](../content/CLAUDE.md), [`scripts/CLAUDE.md`](../scripts/CLAUDE.md), [`src/components/CLAUDE.md`](../src/components/CLAUDE.md), [`tests/CLAUDE.md`](../tests/CLAUDE.md)
- [x] `.claude/skills/` — `add-species`, `audit-iucn`, `backfill-canonical-ids`, `export-dwca`, `remediate-tree`
- [x] `.claude/agents/` subagents — `content-validator`, `iucn-verifier`, `spanish-copyeditor` (Sonnet)
- [x] `.mcp.json` — `gbif` (anon), `iucn` (env-gated on `IUCN_TOKEN`), `powo` (anon), `inaturalist` (anon)
- [x] `.claude/settings.json` — explicit allow/deny; deny on force-push and direct pushes to main

**Claude-2026 polish (concrete, actionable):**

- [x] **Add `.claude/hooks/`** (2026-07-04) — `pre-tool-mdx-write.sh`, wired as a `PreToolUse` hook on `Write` calls to `content/trees/**/*.mdx`. Advisory-only (warns via `additionalContext`, never blocks) and Write-only for now — the `Edit` tool's diff-based `tool_input` doesn't expose full post-edit content at `PreToolUse` time, so extending to `Edit` (likely via a `PostToolUse` hook reading the file from disk) is a follow-up, not done here.
- [x] **Tighten subagent allowlists** (2026-07-04):
  - `content-validator`: `All tools` → `Read, Grep, Glob, Bash`
  - `iucn-verifier`: `All tools` → `Read, Bash, WebFetch`
  - `spanish-copyeditor`: `All tools` → `Read, Grep, Glob` (not in the original list above, tightened for the same reason)
  - Verified post-change: ran `content-validator` against a real species pair (ceiba) — completed its full review using only the narrowed tools, no gaps found.
- [ ] **Add `src/app/CLAUDE.md`** — route conventions (i18n hooks, `generateMetadata` shape, JSON-LD emission pattern, locale-prefixed routing).
- [ ] **Add `src/lib/CLAUDE.md`** — library conventions (citation, seo, security, image, ratelimit).
- [ ] **Add new skills**:
  - `ship-pr` — branch + commit (with `--author="…@users.noreply.github.com"`) + push + open PR + post-merge confirmation. Solves the recurring repo-local-git-config drift this session exposed.
  - `triage-pr` — verify checks, identify required-vs-failed, surface merge blockers (BLOCKED vs UNSTABLE distinction).
  - `pr-monitor` — `gh pr checks --watch`, post-resolve threads via gh api graphql.
- [ ] **Seed Claude's per-project auto-memory** (the per-project directory under `~/.claude/projects/<encoded-project-path>/memory/`; see Claude Code docs) with the recurring lessons surfaced during recent maintenance work:
  - `feedback_git_author_email.md` — confirm the worktree's `git config user.email` resolves to a GitHub account before committing; otherwise pass `--author` explicitly. Worktree-local `.git/config` can drift to an email Vercel can't resolve, blocking preview deploys.
  - `project_vercel_preview_quirk.md` — Vercel Preview check fails systemically on every PR (separate from build correctness); merge with it red; tracked separately.
  - `feedback_ruleset_codeql_pairing.md` — adding a `code_scanning` ruleset rule requires the CodeQL workflow not be gated `event_name != 'pull_request'`, or merges block silently.
- [ ] **Expand `.claude/settings.json` allowlist** for repeated friction points: `gh api repos/*/pulls/*/comments/*/replies`, `gh api repos/*/rulesets/*`, `gh api graphql`.
- [ ] **Add `.claude/skills/README.md` index** — human-readable summary of available skills (auto-invoke uses frontmatter; humans benefit from an index).
- [x] **Update root [`CLAUDE.md`](../CLAUDE.md)** — stale manifest.ts caveat removed (2026-07-04; verified type-check is 0 errors once `npm run contentlayer` has run — the caveat's replacement note calls this out since a fresh checkout without a contentlayer build produces unrelated false errors). Referencing the new skills and L4-shipped LICENSE files in root CLAUDE.md is still open.
- [ ] **Rationalize `AGENTS.md`** → thin pointer to `CLAUDE.md` (currently 3K of overlap).
- [ ] **Standardize skill descriptions** for auto-invoke — uniform trigger-phrase form so the dispatcher routes consistently.

### L8 — Field-Tool Foundations 🔴 NOT STARTED

**Why now:** Authority alone is a reading product. Field-tool is what turns "yet another flora site" into "the Costa Rica tree app." The `/identify` route is wired to **Pl@ntNet** and auto-enables when `PLANTNET_API_KEY` is set (`FEATURE_ENABLED = !!process.env.PLANTNET_API_KEY`). The remaining work is GPS/offline, not the ID call. (This line previously described a disabled Google Vision integration; that has not been the implementation for some time.)

- [x] **Real image ID via Pl@ntNet API** — shipped in [`src/app/api/identify/route.ts`](../src/app/api/identify/route.ts): top-3 candidates with confidence scores, matched against the atlas corpus by exact then genus-level scientific name. Rate limited to 10/hour (external paid API). Requires `PLANTNET_API_KEY`.
- [ ] **GPS "trees near you"** — GBIF occurrence query within user-set radius. Permission flow with clear copy ("we use your location only to find nearby observations").
- [ ] **Offline map tile pack** — Service Worker delta for 5 high-traffic protected areas (Corcovado, Manuel Antonio, Monteverde, Tortuguero, Arenal). Document tile attribution.
- [ ] **iNaturalist round-trip** — "Log an observation" flow via iNat OAuth; user submits under their own identity; we don't claim ownership of their observations.
- [ ] **Camera entry point on homepage** — first-class "scan" verb-noun; existing favorites/compare don't compete with it for the cold-start user.
- [ ] **AR identification** — REMOVED from public commitments until we have an engineering scope.

### L9 — Education Seeds 🟡 SCAFFOLD PRESENT

**Why now:** Education adoption requires trust (L2 ✅) + engagement (L8 ☐). Routes are scaffolded; content depth and partnerships are next.

- Routes present: `/education/{classroom,field-trip,map-game,tree-journal,printables,certificate}`
- [ ] **MEP curriculum mapping** — research and document the Ciencias 3°–9° standards relevant to Costa Rican flora; map existing lessons to standards.
- [ ] **Printable classroom packs per ecoregion** — field-guide PDFs already exist for favorites; create curated ecoregion packs.
- [ ] **Teacher dashboard scaffolding** — non-functional spec at `docs/EDUCATION_PLATFORM.md`; defines what a teacher dashboard would do (class roster, progress, assessments).
- [ ] **Honest "completion badge" framing** — change "certificate" language to "completion badge" until we partner with an accrediting body.
- SCORM/xAPI export — decision deferred.

### L10 — Trust & Safety 🟢 CRITICAL ITEMS DONE, A11Y NEXT

**Why now:** The P0 (EXIF GPS strip) shipped; admin MFA shipped; security.txt shipped. The remaining work is accessibility depth and privacy notices.

- [x] **EXIF GPS strip on photo upload** — live in [`src/app/api/images/upload/route.ts`](../src/app/api/images/upload/route.ts)
- [x] **Admin MFA** — `src/app/api/auth/mfa/{setup,verify,disable}/route.ts`
- [x] **security.txt** at `public/.well-known/security.txt`
- [x] **Husky pre-commit + commit-msg** hooks active
- [ ] **CSP nonce strategy** — `middleware.ts` has commented-out nonce discussion; needs a decision (nonce vs hash vs disable for SSG paths).
- [ ] **Costa Rica Ley 8968 + GDPR privacy notice** — ES + EN privacy pages with explicit purpose limitation and user rights.
- [ ] **Audit log retention policy** — documented retention window for `AdminAuditLog` table.
- [ ] **WCAG 2.2 audit** — go beyond AA on 2.1; address new SCs (focus appearance, target size minimum, dragging movements, consistent help).
- [ ] **Screen-reader narration of distribution maps** — non-visual equivalent for live GBIF data.
- [ ] **Reduced-motion audit** — every animation respects `prefers-reduced-motion`.
- [ ] **High-contrast mode** — distinct from dark mode; AAA-validated tokens on the contrast-critical path.
- [ ] **Address 3 moderate `npm audit` vulnerabilities** — [PR #757](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/757) (49 prod dep bumps) likely closes most.

### L11 — Performance & Search at Scale 🔴 NOT STARTED

**Why now:** Search is fine at 180 species; it breaks at 1,000+. Lighthouse CI hasn't fired since 2026-03-01 — needs investigation before we add more performance work.

- [ ] **Investigate Lighthouse CI silence** — `.github/workflows/lighthouse-ci.yml` last ran 2026-03-01. Likely path-trigger too narrow. Restore as PR gate on the templates where regressions break trust (tree-detail, compare, map).
- [ ] **Tree-detail render perf on mid-tier mobile** — profile and optimize.
- [ ] **Search index migration** — stand up Meilisearch or Typesense; move species + glossary + comparison search off client-side bundle. Filters by family + IUCN + ecoregion + elevation + month — facet engine.
- [ ] **The power-query**: "find me all medicinal LC-status trees flowering in May at >1500m elevation." Today, impossible. After L11, easy.
- [ ] **Lazy / defer secondary modules**.
- [ ] **Visual regression** for the templates where a regression breaks trust: tree-detail, compare, map. Skip homepage/glossary/education until v1.0.

### L12 — SEO / GEO & Discoverability 🟢 STRONG, ONE TYPE LEFT

**Why now:** Most JSON-LD types shipped. `schema:HowTo` and AI-overview readiness close the lane.

- [x] `schema:Taxon` on species pages (Article wrapper)
- [x] `schema:Dataset` on species pages (#753)
- [x] `schema:Article` on species pages
- [x] `schema:BreadcrumbList` site-wide
- [x] `schema:FAQPage` on safety pages (#755)
- [x] `schema:MedicalWebPage` on safety pages
- [x] `schema:WebPage`, `schema:CollectionPage`, `schema:Course`, `schema:DefinedTerm`, `schema:ItemList` where applicable
- [ ] `schema:HowTo` on identification flows (`/[locale]/identify`, `/[locale]/diagnose`)
- [ ] **AI-overview readiness pass** — Q&A pattern audit on safety and ID pages; clean answer-first formatting; dataset DOI exposed so AI cites us.
- [ ] **Internal linking authority distribution** — audit which pages currently absorb vs. distribute link authority; rebalance toward Deep-250 anchors.
- [ ] **Sitemap freshness signal** — confirm `<lastmod>` reflects real content updates, not deploy timestamps.
- [x] **`hreflang` already strong** — keep it that way as new pages ship.

---

## Phased Roadmap

Realistic 12-month plan starting from current ground truth. Phases overlap intentionally; lanes don't.

### Phase 1 (DONE, retroactively logged) — Foundation

v6.0's Phase 1 completed 2026-05-18, in three days. Closed: L2 authority data, L4 open licensing, L10 P0 (EXIF GPS strip), L12 cite-as + Dataset + FAQPage JSON-LD, baseline L7 (root + scoped CLAUDE.md, skills, subagents, MCP).

### Phase 2 (Weeks 1–12, starts 2026-05-18) — Coverage and Open Dataset

**Theme:** The dataset becomes citable. Coverage breaks past 180.

- L3 Coverage — `docs/ECOREGIONS.md`; curate the 75 additional species; build out ecoregion landing pages
- L4 Open dataset — Zenodo deposit, DOI mint, cite-as DOI swap; `schema:HowTo`; README/USAGE-POLICY rewrite
- L5 Indigenous knowledge — open 2 community partnership conversations; first pronunciation recordings (~6 trees, Bribrí or Cabécar)
- L7 Claude-2026 polish — hooks, subagent allowlist tightening, src/app/CLAUDE.md, src/lib/CLAUDE.md, memory seeding, new skills (`ship-pr`, `triage-pr`, `pr-monitor`)
- L10 WCAG 2.2 audit + reduced-motion + high-contrast + privacy notice
- L11 Lighthouse CI restoration

**Phase 2 exit criteria:** Zenodo DOI live and swapped into UI. DwC-A downloads cleanly and validates against Darwin Core schema. ≥220 species at Tier 1. ≥6 indigenous-language pronunciations live with TK/BC labels.

### Phase 3 (Weeks 13–24) — Field & Education

**Theme:** Verbs, not nouns.

- L8 Field-tool — Pl@ntNet integration; GPS "near me"; offline tiles; iNaturalist round-trip; camera entry on homepage
- L9 Education seeds — MEP curriculum mapping; ecoregion classroom packs; honest completion-badge framing
- L1 Costa Rica identity in production — homepage rewrite; ecoregion hero variants; national pride hooks
- L5 Indigenous knowledge — expand to 2 additional languages; refine FPIC documentation

**Phase 3 exit criteria:** Camera ID is the homepage verb-noun on Android 11+ / iOS 16+. Offline tiles work in Corcovado. WCAG 2.2 AA report attached.

### Phase 4 (Weeks 25–36) — Search & SEO Polish

**Theme:** Scale and discoverability.

- L11 Meilisearch/Typesense; power-query; visual regression on critical templates
- L12 `schema:HowTo`; AI-overview readiness; internal linking authority rebalance; sitemap freshness signal
- L9 Teacher dashboard scaffolding; pilot ecoregion pack with one school

**Phase 4 exit criteria:** Power-query returns in <200ms. AI-overview prompts return cited answers. One school pilot has used a classroom pack.

### Phase 5 (Weeks 37–48) — Endorsement and Launch

**Theme:** Prove it, ship it.

- L5 Lock partnership letter from at least one of: SINAC, OTS, INBio archives, MEP, UCR/UNA
- L2/L3 Final factual audit pass; finalize Deep-250
- L9 Pilot classroom pack with one school
- Soft launch → public launch with announcement to: GBIF community, Costa Rican press, Anthropic blog (if appropriate), open-science community

**Phase 5 exit criteria:** Every v1.0 DoD item checked.

---

## Inputs Needed From You

Most lanes are unblocked. A few benefit from inputs only you can provide.

| #   | Input                                                                                                                                                                                                                                                                      | Why                                                                                                   | Urgency   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------- |
| 1   | **IUCN Red List API token** (apply at iucnredlist.org/api/v3/token — free for non-commercial). Drop in `.env.local` as `IUCN_TOKEN`.                                                                                                                                       | Replaces GBIF's stale IUCN cache with live truth; unlocks `iucn-verifier` agent against the live API. | Phase 2   |
| 2   | ~~Zenodo account + deposit confirmation~~ — **DONE**, see L4.                                                                                                                                                                                                              | ~~Required to mint the first DOI~~ — fulfilled 2026-05-19, DOI `10.5281/zenodo.20279670` live.        | Closed    |
| 3   | **Pl@ntNet API key** (free tier exists at my.plantnet.org).                                                                                                                                                                                                                | Camera-first ID via real ML.                                                                          | Phase 3   |
| 4   | **Authoritative reference library** — PDF/digital access to: _Manual de Plantas de Costa Rica_ (Burger et al., MBG/INBio), _Trees of Tropical America_ (Pennington), Allen's _Rainforest of Costa Rica_.                                                                   | Canonical secondary sources for Costa Rica flora; citation hierarchy gets meaningfully better.        | Phase 2–3 |
| 5   | **Indigenous community contacts**, even informal (a friend of a friend in Talamanca counts).                                                                                                                                                                               | L5 is partnership-paced. Cold outreach takes 2–3× longer than warm.                                   | Phase 2   |
| 6   | **Budget posture** for: paid translation review (~$500–2,000), Pl@ntNet commercial tier if free runs out (~$50/mo), indigenous community honoraria (varies, plan $500–2,000 per partner per session), professional photography licensing if iNat CC-licensed isn't enough. | Determines what we can plan vs. defer.                                                                | Phase 2   |
| 7   | **Hosting / infra confirmation** — staying on Vercel? Costa Rica edge presence? Any data-sovereignty constraints from Ley 8968?                                                                                                                                            | Affects L10 plan and the ongoing Vercel Preview reliability investigation.                            | Phase 2   |
| 8   | **Endorsement targets** — which institutions are highest priority? SINAC vs. OTS vs. UCR vs. MEP? Any existing relationships?                                                                                                                                              | Drives L5 partnership focus.                                                                          | Phase 5   |

License migration is **CONFIRMED and shipped** (was Input #7 in v6.0).

---

## Risks & Guardrails

| Risk                                                                                                                                     | Mitigation                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Indigenous content harm** — extracting or misrepresenting traditional knowledge                                                        | L5 governance is mature in policy; partnership-pacing is the real guard. Default to "publish nothing without explicit consent." Refusal is a valid answer.                                                                                                                                                                                               |
| **Endorsement-blocking factual error** — a credentialed reviewer finds an IUCN mismatch or unsourced ethnobotanical claim and walks away | L2 is clean as of 2026-05-18. As of 2026-07-04, the factual audit (`--skip-external`) runs as a hard PR gate in `content-build-tests.yml`, plus a weekly scheduled deep check with live GBIF/IUCN drift detection (`content-fact-audit-weekly.yml`). Before this, the audit script existed but wasn't wired into any workflow — corrected in this round. |
| **Tico voice that doesn't land** — outsider-flavored Spanish                                                                             | L6 paid Costa Rican copyeditor; voice doc reviewed by a native speaker before adoption.                                                                                                                                                                                                                                                                  |
| **AI-agent generates plausible but wrong botanical claims**                                                                              | Citation-required gate on high-risk sections; `<CitationFootnote>` is a hard requirement (in progress). `iucn-verifier` subagent catches IUCN drift before commit.                                                                                                                                                                                       |
| **Scope creep on Deep-250** — turn into Deep-500                                                                                         | Curate explicitly; lock the list at end of Phase 2; resist additions in Phase 3.                                                                                                                                                                                                                                                                         |
| **Field-tool feature creep** — AR, ML training, etc.                                                                                     | AR is removed from public commitments. Pl@ntNet API only; offline tiles only for 5 named parks. No proprietary ML in v1.0.                                                                                                                                                                                                                               |
| **Vercel Preview check is systemically red** — every PR shows it red regardless of code health                                           | Known infra issue; treat as non-required check until the spawned diagnostic task resolves. Don't gate merges on it. Production deploys to main remain green.                                                                                                                                                                                             |
| **Repeated git author-email pitfall in worktrees**                                                                                       | Repo-local `.git/config` drifts to an email Vercel can't resolve. Mitigation: `ship-pr` skill enforces `--author`; auto-memory seeded; possibly one-time `git config` correction.                                                                                                                                                                        |
| **Auto-merge interacts poorly with new rulesets**                                                                                        | New `code_scanning` ruleset paired with a CodeQL workflow gated `event_name != 'pull_request'` silently blocked merge of #755. Memory entry seeded; ruleset-audit checklist owed.                                                                                                                                                                        |
| **Maintainer burnout** — one person + AI agents                                                                                          | AI agents do drafting and audits; humans do partnerships, voice, and indigenous relationships. We accept slower velocity over wrong content.                                                                                                                                                                                                             |

---

## Verification & Launch Criteria

Verification is woven into every lane. Headline gates:

1. **Phase 1 exit (DONE 2026-05-18)**: `npm run build && npm run test:run && npm run content:fact-audit` clean. `.claude/` substantially complete. EXIF GPS strip verified live. All 23 P1-high trees resolved.
2. **Phase 2 exit**: Zenodo DOI live and swapped in `src/lib/citation/index.ts`. DwC-A downloads cleanly and validates against Darwin Core schema. ≥220 species at Tier 1. `.claude/hooks/` present and gating. Subagent allowlists tightened.
3. **Phase 3 exit**: Camera-first homepage flow works on Android 11+ and iOS 16+. WCAG 2.2 AA report attached. Offline tile pack downloads and renders in Corcovado.
4. **Phase 4 exit**: Power-query (multi-facet) returns in <200ms. `schema:HowTo` shipped on identification flows. Visual regression baseline established.
5. **Phase 5 exit (v1.0)**: All DoD items checked. Endorsement letter posted. Launch announcement live.

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

1. Read [docs/IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) (this file) — single source of truth.
2. Skim [CLAUDE.md](../CLAUDE.md) at the repo root for project conventions.
3. Run `git log --oneline -10` for last-touched context.
4. Run `npm run content:fact-audit -- --skip-external` for the current factual state.
5. Mark lanes/items complete here as work lands; never duplicate state in a separate handoff doc.

**Worktree-specific gotchas (memory-worthy):**

- **Git author email** — before committing in a worktree, confirm `git config user.name` and `git config user.email` resolve to a GitHub account (e.g., your personal email or your GitHub `users.noreply.github.com` address). Worktree-local `.git/config` can drift; pass `--author="Name <email>"` explicitly if it has. Vercel rejects preview deploys for commit author emails it can't resolve to a GitHub user.
- **Vercel Preview check** — expected to be red on every PR until the systemic fix lands. Treat as non-required. Don't waste time inspecting individual failures unless the build duration is non-zero.
- **Repo rulesets** — when adding a new `code_scanning` rule, verify the corresponding workflow actually runs on PRs (the `code_scanning` × CodeQL `event_name != 'pull_request'` pairing silently blocks merges).
- **Type-check is clean** — the historical "tolerated manifest.ts errors" note in `CLAUDE.md` is stale. `npm run type-check` returns 0 errors as of 2026-05-18.

---

_v7.0 supersedes v6.0. North star: Costa Rica first, world welcome. v1.0 ships in 12 months._
