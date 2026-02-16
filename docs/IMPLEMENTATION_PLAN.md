# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-02-15  
**Status:** ✅ v1.0 Complete | 🎯 Active Development

## 📊 Status Dashboard

### Content Coverage

- **Species**: 161/175 (92%) - Target: 175+ documented species
- **Comparison Guides**: 20/20 (100%) ✅ Complete
- **Glossary Terms**: 100/150 (67%) - Target: 150+ terms
- **Care Guidance**: 90/128 (70%) - Target: 100/128 (78%)

### Technical Health

- **Lighthouse Score**: 48/100 → Target: 90/100
- **LCP**: 6.0s → Target: <2.5s
- **TBT**: 440ms → Target: <200ms
- **Auth Status**: ✅ Complete (MFA, JWT, backup codes working)
- **Safety System**: ✅ Complete (100% coverage, filters live)
- **Image Status**: 109/128 optimized (85%)

### Key Priorities

| Priority | Focus Area                | Status         | Impact   |
| -------- | ------------------------- | -------------- | -------- |
| **0**    | **Critical Blockers**     | ✅ Code        | Critical |
| **1**    | **Content Expansion**     | 📋 Ready       | High     |
| **2**    | **Performance**           | 🟡 In Progress | High     |
| **3**    | **Infrastructure**        | 🟢 Mostly      | High     |
| **4**    | **Community Features**    | ⏸️ Blocked     | Medium   |
| **5**    | **Content Enrichment**    | 📋 Ready       | Medium   |
| **6**    | **Internationalization**  | 📋 Ready       | Medium   |
| **7**    | **Technical Enhancement** | 📋 Ready       | Medium   |

**Legend:** ✅ Complete | ✅ Code (code complete, validation pending) | 🟡 In Progress | 🟢 Mostly (largely implemented; minor tasks remaining) | 📋 Ready | ⏸️ Blocked | ⚠️ Issues

---

## Priority 0: Critical Blockers 🚨

**Impact:** Critical - Blocks community features  
**Status:** ✅ Code Complete (Auth ✅, Safety ✅, Image Review ✅ — Validation pending DB deployment)

### ✅ 0.1: Admin Authentication (COMPLETE)

**Status:** ✅ All issues resolved (verified 2026-02-07, E2E tests added 2026-02-07)

- [x] Fix JWT session strategy conflict
- [x] Remove Basic Auth fallback
- [x] Complete MFA: TOTP encryption (AES-256-GCM)
- [x] Complete MFA: Backup codes (Argon2id hashing)
- [x] Remove debug logging from production
- [x] All auth TODOs resolved
- [x] Add E2E authentication tests

### ✅ 0.2: Safety System Integration (COMPLETE)

**Status:** ✅ All features live (verified 2026-01-19)

- [x] Safety filters in tree directory (Child Safe, Pet Safe, Non-Toxic, Low Risk)
- [x] Dedicated `/safety` page with emergency contacts
- [x] SafetyCard rendering on tree detail pages
- [x] SafetyIcon in TreeCard component
- [x] SafetyWarning for High/Severe toxicity
- [x] 100% species have safety data
- [x] Full bilingual content (EN/ES)

### ✅ 0.3: Image Review & Approval System (COMPLETE)

**Status:** ✅ Complete (code + validation; automated validation added 2026-02-10)  
**Impact:** Critical - Prevents image quality issues, enables community uploads  
**Docs:** [IMAGE_REVIEW_SYSTEM.md](IMAGE_REVIEW_SYSTEM.md)

**Goal:** Human-in-the-loop workflow to prevent automatic image overwrites

#### Database & Workflow

- [x] Database schema
  - [x] Add `ImageProposal` model (treeSlug, imageType, currentUrl, proposedUrl, qualityScore, status, reviewedBy)
  - [x] Add `ImageVote` model (user votes: upvote/downvote/flag)
  - [x] Add `ImageAudit` model (change history: who, when, what, why)
  - [x] Manual migration SQL in `prisma/migrations/manual/add_image_review_system.sql`
  - [x] Prisma schema with enums (ImageProposalStatus, ImageProposalSource, ImageType, ImageFlagReason, ImageAuditAction)
- [x] Update weekly workflow
  - [x] Create `scripts/propose-image-changes.mjs` (generates proposals, never auto-applies)
  - [x] Save proposals to database via API
  - [x] Script supports --dry-run, --tree=slug, --verbose flags
- [x] Integrate audit reports
  - [x] Auto-create proposals for broken/missing/low-quality images
  - [x] Audit trail via ImageAudit model

#### Admin Dashboard

- [x] Build admin review UI
  - [x] Create `/admin/images/proposals` page (ProposalsListClient.tsx)
  - [x] Side-by-side comparison (current vs proposed) in ProposalDetailClient.tsx
  - [x] Display quality metrics (resolution, file size, source)
  - [x] Action buttons: Approve, Deny, Archive
  - [x] Filter by status and species
- [x] Build admin API
  - [x] POST `/api/admin/images/proposals` - Create proposal
  - [x] GET `/api/admin/images/proposals` - List proposals (paginated)
  - [x] PATCH `/api/admin/images/proposals/[id]` - Update status
  - [x] POST `/api/admin/images/proposals/[id]/apply` - Apply approved proposal
- [x] Approval logic
  - [x] Download, optimize, and replace approved images (apply route)
  - [x] Create audit log entry
  - [x] Update tree MDX frontmatter if needed
  - [x] Mark proposal as applied

#### Public Voting & Validation

- [x] Public voting interface
  - [x] Create `/images/vote` page (VotingClient.tsx)
  - [x] Upvote/downvote buttons (anonymous, session-based)
  - [x] Flag dialog: "This is mislabeled" with reasons
  - [x] Prevent duplicate votes (unique constraint per session)
- [x] Public voting API
  - [x] POST `/api/images/vote` - Submit vote
  - [x] POST `/api/images/flag` - Flag image with reason
  - [x] GET `/api/images/vote` - Get vote counts (stats via GET handler)
  - [x] Rate limiting: 100 votes/hour per session, 50 flags/hour
- [x] Validation gate (automated API coverage complete)
  - [x] Test 10 proposals end-to-end — automated API validation added (`tests/image-review/validation-gate.test.ts`, 2026-02-10)
  - [x] Verify side-by-side comparison data flow (current vs proposed URLs in proposal detail API) — covered by automated validation test (2026-02-10)
  - [x] Confirm audit log tracks changes — status update creates `PROPOSAL_APPROVED` audit entry in automated validation test (2026-02-10)
  - [x] Ensure weekly workflow generates proposals (not auto-applies) — automated mode now runs `npm run images:propose` (2026-02-10)

**🚦 Completion Gate:** Auth fixed ✅, Safety live ✅, Image Review code + validation complete ✅ → Unblocks Priority 4

---

## Priority 1: Content Expansion 📚

**Impact:** High - Broader coverage, more comprehensive resource  
**Status:** 📋 Ready (No blockers)

### 1.1: Add Missing Species

**Status:** 🟡 In Progress (41/47 complete)  
**Reference:** [MISSING_SPECIES_LIST.md](MISSING_SPECIES_LIST.md)

#### High Priority Native Species (10 species) ✅ COMPLETE

- [x] Camíbar (Copaifera camibar) — already existed
- [x] Cedro Real (Cedrela fissilis) — already existed
- [x] Guayacán Real (Guaiacum sanctum) — already existed
- [x] Cristóbal (Platymiscium pinnatum) — already existed
- [x] Cachá/Copey (Clusia rosea) — already existed
- [x] María (Calophyllum brasiliense) — already existed
- [x] Níspero (Manilkara zapota) — already existed
- [x] Almendro de Montaña (Dipteryx panamensis) — already existed
- [x] Guácimo Colorado (Luehea seemannii) — already existed
- [x] Caimitillo (Chrysophyllum cainito) — already existed

#### Common Ornamentals & Fruit (10 species) ✅ COMPLETE

- [x] Flamboyan (Delonix regia) — already existed
- [x] Jacaranda Blanco (Jacaranda mimosifolia alba) — already existed
- [x] Cas (Psidium friedrichsthalianum) — already existed
- [x] Mora (Rubus adenotrichos) — already existed
- [x] Guanábana (Annona muricata) — already existed
- [x] Rambután (Nephelium lappaceum) — already existed
- [x] Carambola (Averrhoa carambola) — already existed
- [x] Guayaba Chilena (Acca sellowiana) — added 2026-02-09
- [x] Tamarindo Dulce (Tamarindus indica var. dulcis) — added 2026-02-09
- [x] Marañón de Jardín (Anacardium occidentale var.) — already existed

#### Medium Priority (20 species) — 20/20 complete ✅

- [x] Cortez Blanco (Roseodendron donnell-smithii) — added 2026-02-09
- [x] Sardinillo (Tecoma stans) — added 2026-02-09
- [x] Flor de Itabo (Yucca guatemalensis) — added 2026-02-09
- [x] Corozo (Elaeis oleifera) — added 2026-02-09
- [x] Papayillo (Vasconcellea cauliflora) — added 2026-02-09
- [x] Palma de Escoba (Cryosophila albida) — added 2026-02-09
- [x] Palma Yolillo (Raphia taedigera) — added 2026-02-09
- [x] Palma Suita (Geonoma congesta) — added 2026-02-09
- [x] Palma Cacho de Venado (Oenocarpus bataua) — added 2026-02-09
- [x] Tirrá (Ulmus mexicana) — added 2026-02-09
- [x] Lengua de Vaca (Miconia argentea) — added 2026-02-09
- [x] Chirraca (Lonchocarpus minimiflorus) — added 2026-02-09
- [x] Guaba Bejuco (Inga vera) — added 2026-01-22
- [x] Guaba Machete (Inga spectabilis) — added 2026-01-22
- [x] Anona Colorada (Annona purpurea) — added 2026-01-22
- [x] Guanábana Cimarrona (Annona montana) — added 2026-01-22
- [x] Add remaining medium priority species (completed 2026-02-10; see docs/MISSING_SPECIES_LIST.md)

#### Low Priority (7 species) ✅ COMPLETE

- [x] Cedro Dulce (Cedrela tonduzii) — added 2026-02-12
- [x] Quina (Cinchona pubescens) — added 2026-02-12
- [x] Zorrillo (Senna reticulata) — added 2026-02-12
- [x] Contra (Rauvolfia tetraphylla) — added 2026-02-12
- [x] Achotillo (Brosimum costaricanum) — added 2026-02-12
- [x] Guarumbo Hembra (Cecropia peltata) — added 2026-02-12
- [x] Bambu Gigante (Guadua angustifolia) — added 2026-02-12
- [x] Add remaining 5 low priority species (Zorrillo, Contra, Achotillo, Guarumbo Hembra, and Bambu Gigante added 2026-02-12; see MISSING_SPECIES_LIST.md)

#### Introduced but Ecologically Significant (4 species) — 1/4 complete

- [x] Nim (Azadirachta indica) — added 2026-02-15
- [ ] Acacia Mangium (Acacia mangium)
- [ ] Pino Caribeño (Pinus caribaea)
- [ ] Eucalipto (Eucalyptus deglupta)

**Per-Species Checklist:**

- [x] Research 3+ reliable sources
- [x] Create EN and ES MDX files with complete frontmatter
- [x] Add taxonomy, description, distribution, cultivation sections
- [x] Include comprehensive safety data
- [x] Source 5+ high-quality images (featured + gallery)
- [x] Add external resources (IUCN, iNaturalist, GBIF)
- [x] Verify bilingual parity
- [x] Test build generates pages correctly

### ✅ 1.2: Comparison Guides (COMPLETE)

**Status:** ✅ 20/20 complete (verified 2026-01-20)

Recent additions completed:

- [x] Laurel vs Laurel Negro
- [x] Jobo vs Jocote
- [x] Corteza Amarilla vs Cortez Negro
- [x] Mamón vs Mamón Chino

### 1.3: Expand Care Guidance

**Status:** 🚧 In Progress (Week 1: 10/10 complete ✅ | Week 2: 30/30 complete ✅ | Enrichment batch: 5 low-priority species complete ✅)  
**Current:** 90/128 (70%) → **Target:** 100/128 (78%)

#### Week 1: Common Planted Trees (10 species) ✅ COMPLETE (EN & ES)

- [x] Guanábana (EN & ES complete)
- [x] Carambola (EN & ES complete)
- [x] Cas (EN & ES complete)
- [x] Mora (EN & ES complete)
- [x] Rambután (EN & ES complete)
- [x] Tamarindo (EN & ES complete)
- [x] Laurel (EN & ES complete - 2026-02-08)
- [x] Cedro Amargo (EN & ES complete - 2026-02-08)
- [x] Pochote (EN & ES complete - 2026-02-08)
- [x] Corteza Amarilla (EN & ES complete - 2026-02-08)

**Completed Enhancements (2026-02-08):**

Each completed species now includes:

- Comprehensive watering requirements with seasonal adjustments
- Detailed fertilization schedules with NPK ratios and timing
- Professional pruning guidelines with formative, maintenance, and production pruning
- Extensive pest and disease management strategies
- **NEW: Companion Planting sections** with beneficial companions, compatible trees, plants to avoid, and agroforestry integration
- **NEW: Year-Round Care Calendars** tailored to Costa Rican climate zones
- Harvest guidelines with timing, techniques, and quality indicators
- Species-specific considerations (elevation, climate zones, etc.)

**Week 1 Completed Species (2026-02-08):**

All 10 Week 1 species now have comprehensive advanced care guidance:

1. **Guanábana** - Fruit tree care with companion planting and seasonal calendar
2. **Carambola** - Tropical fruit production optimization
3. **Cas** - Native fruit cultivation strategies
4. **Mora** - Berry production and training systems
5. **Rambután** - Exotic fruit tree management
6. **Tamarindo** - Drought-tolerant fruit tree care
7. **Laurel** - Timber production and agroforestry systems (reforestation focus)
8. **Cedro Amargo** - Specialized shoot borer management and mixed plantations
9. **Pochote** - Living fence establishment and dry forest restoration
10. **Corteza Amarilla** - Ornamental flowering tree optimization and landscape design

#### Weeks 2-4: Additional 30 Species (✅ Complete: 30/30)

**Recently Completed (2026-02-12):**

- [x] **Mango (PR #316 ✅ merged)** - Comprehensive companion planting and seasonal care with flowering stress management
- [x] **Aguacate (Avocado) (PR #316 ✅ merged)** - Detailed care guidance emphasizing drainage criticality and Phytophthora prevention
- [x] **Cacao (PR #316 ✅ merged)** - Traditional Bribri agroforestry systems and multi-layer shade management
- [x] **Papaya (PR #316 ✅ merged)** - Fast-growing pioneer tree with sequential planting strategies
- [x] **Anona (PR #317 pending)** - Hand-pollination techniques and Annona family integration
- [x] **Jocote (PR #317 pending)** - Living fence propagation and deciduous tree care
- [x] **Nance (Batch 3)** - Dry forest silvopastoral systems and low-maintenance fruit tree
- [x] **Marañón/Cashew (Batch 3)** - Safety warnings for urushiol toxicity and processing
- [x] **Zapote/Mamey Sapote (Batch 3)** - Patio tree integration and batido production
- [x] **Balsa (Batch 3)** - Pioneer succession forestry and rapid rotation timber
- [x] **Caimito/Star Apple (Batch 3)** - Caribbean home garden and Sapotaceae cultivation
- [x] **Palma de Escoba (Batch 4, 2026-02-12)** - Understory palm care with spine-safe pruning, companion planting, and seasonal calendar
- [x] **Palma Yolillo (Batch 4, 2026-02-12)** - Wetland restoration-focused management (hydrology, monitoring, and seasonal restoration calendar)
- [x] **Palma Suita (Batch 4, 2026-02-12)** - Deep-shade understory cultivation with humidity management and companion planting
- [x] **Palma Cacho de Venado (Batch 4, 2026-02-12)** - High-rainfall canopy palm care with fruiting-season safety and agroforestry companions
- [x] **Cortez Blanco (Batch 5, 2026-02-12)** - Advanced ornamental care with dry-season flowering support and pollinator companions
- [x] **Sardinillo (Batch 5, 2026-02-12)** - Drought-adapted flowering shrub/tree management with repeat-bloom pruning strategy
- [x] **Flor de Itabo (Batch 5, 2026-02-12)** - Drainage-first yucca care with edible flower harvest and dry-forest companion planting
- [x] **Corozo (Batch 5, 2026-02-12)** - Humid lowland palm management with hydrology-aware restoration calendar
- [x] **Papayillo (Batch 5, 2026-02-12)** - Premontane fruit-tree guidance with drainage, nutrition, and pest controls
- [x] **Tirrá (Batch 5, 2026-02-12)** - Long-cycle timber/restoration care with structural pruning and slope management
- [x] **Lengua de Vaca (Batch 5, 2026-02-12)** - Pioneer restoration-care package with bird-supporting companion systems
- [x] **Chirraca (Batch 5, 2026-02-12)** - Agroforestry-focused care with canopy-light and nitrogen-cycling integration
- [x] **Guaba Bejuco (Batch 5, 2026-02-12)** - Productive nitrogen-fixing canopy care with pod sanitation protocols
- [x] **Guaba Machete (Batch 5, 2026-02-12)** - Large-canopy Inga management with harvest-safe structural pruning
- [x] **Anona Colorada (Batch 6, 2026-02-12)** - Humid lowland fruit-production strategy with structured fertility, pollination-supporting canopy, and seasonal harvest management
- [x] **Guanábana Cimarrona (Batch 6, 2026-02-12)** - Wet-site resilient Annona care with moisture-first management, sanitation protocol, and agroforestry integration
- [x] **Llama del Bosque (Batch 6, 2026-02-12)** - Invasive-context management guidance focused on phased native replacement, seed suppression, and seasonal control
- [x] **Cristobalito (Batch 6, 2026-02-12)** - Long-cycle dry-forest timber/restoration care with form-focused pruning and fire-season risk mitigation
- [x] **Granadillo (Batch 6, 2026-02-12)** - Premium timber establishment program with structural training, mixed-system companions, and long-rotation planning

**Post-Week 2 Enrichment (2026-02-12):**

- [x] **Zorrillo** - Added advanced care framework for wetland buffers, companion planting, and seasonal management
- [x] **Contra** - Added toxic-safe cultivation guidance with PPE, placement controls, and structured pruning
- [x] **Achotillo** - Added humid-forest restoration care program including juvenile shade and integrated pest management
- [x] **Guarumbo Hembra** - Added pioneer-phase management guidance for succession release and structural risk control
- [x] **Bambú Gigante** - Added stand-level bamboo management with rotation, rhizome containment, and productivity calendars

**Week 2 Completion Gate:**

- [x] Add care guidance to 5 additional mid-priority species

**Care Guidance Template:**

- [x] Planting instructions (site, soil, spacing)
- [x] Watering requirements and seasonal adjustments
- [x] Fertilization schedule with NPK recommendations
- [x] Pruning guidelines (formative and maintenance)
- [x] Pest/disease management strategies
- [x] Companion planting suggestions with agroforestry integration
- [x] Seasonal Care Calendar tailored to Costa Rican climate
- [x] Growth timeline and mature size
- [x] Harvest information (if applicable)

### 1.4: Fix Short Pages Quality

**Status:** 🟡 Ongoing maintenance (legacy backlog completed 2026-02-08)  
**Target:** Maintain all pages at 600+ lines (newly added species may need expansion passes)  
**Tools:** ✅ Content audit script available (`npm run content:audit`)

#### ✅ Audit Tool Created (2026-02-08)

- [x] Created `scripts/audit-content-quality.mjs` - PR #307
- [x] Automated identification of short pages
- [x] Bilingual parity checking
- [x] Missing sections detection
- [x] Gallery image count verification
- [x] External resources validation

**Latest Audit Findings (Feb 2026):**

- **26 pages under 600 lines** (19.5% of 133 species)
- **Main issue:** Spanish translations significantly shorter than English
- **Average page length:** 698 lines
- **Critical issue:** Many pages missing required sections (Taxonomy, Geographic Distribution, etc.)
- **2026-02-12 update:** Advanced care-guidance enrichment completed for low-priority species (`zorrillo`, `contra`, `achotillo`, `guarumbo-hembra`, `bambu-gigante`), improving depth to ~367-381 lines per locale; these pages still remain below the 600-line benchmark pending full expansion.
- **2026-02-13 update:** Full expansion pass completed for the same five low-priority species in both locales.
  - EN line counts: `zorrillo` 663, `contra` 656, `achotillo` 644, `guarumbo-hembra` 648, `bambu-gigante` 656
  - ES line counts: `zorrillo` 657, `contra` 656, `achotillo` 640, `guarumbo-hembra` 652, `bambu-gigante` 661
  - Result: all ten files now exceed the 600-line maintenance threshold while preserving bilingual parity and advanced care sections.
  - Next maintenance step: rerun `npm run content:audit` in a follow-up pass to refresh repository-wide short-page inventory after this expansion.
- **2026-02-14 update:** Maintenance rerun completed (`npm run content:audit`) and highest-impact bilingual gaps were reduced.
  - Expanded `content/trees/es/granadillo.mdx` from 167 → 935 lines (EN counterpart 879); removed duplicate advanced care section during review fixes.
  - Expanded `content/trees/es/ira-rosa.mdx` from 341 → 770 lines (EN counterpart 749).
  - Audit short-page backlog reduced from 37 → 35 species.
  - Next priority candidates by parity gap: `mamon-chino`, `lorito`, `pomarrosa`, and `guanabana-cimarrona` (all EN substantially longer than ES).
- **2026-02-14 follow-up update:** Additional Priority 1.4 maintenance pass completed (`npm run content:audit`) on the highest-parity ES pages.
  - Expanded `content/trees/es/mamon-chino.mdx` from 357 → 684 lines (EN counterpart 653).
  - Expanded `content/trees/es/lorito.mdx` from 375 → 618 lines (EN counterpart 700).
  - Audit short-page backlog reduced from 35 → 33 species.
  - Next priority candidates by parity gap: `pomarrosa` (EN 618 | ES 377), `guanabana-cimarrona` (EN 890 | ES 469), then `mangle-botoncillo` (EN 705 | ES 457).
- **2026-02-14 batch update:** Continued Priority 1.4 maintenance on the next four highest-impact short ES pages from the refreshed audit.
  - Expanded `content/trees/es/pomarrosa.mdx` from 377 → 602 lines (EN counterpart 618).
  - Expanded `content/trees/es/guanabana-cimarrona.mdx` from 469 → 812 lines (EN counterpart 890).
  - Expanded `content/trees/es/mangle-botoncillo.mdx` from 457 → 662 lines (EN counterpart 705).
  - Expanded `content/trees/es/mangle-pinuela.mdx` from 396 → 603 lines (EN counterpart 612).
  - Audit short-page backlog reduced from 33 → 29 species.
  - Next priority candidates by parity gap: `mastate` (EN 688 | ES 473), `papaya` (EN 736 | ES 530), `mangle-blanco` (EN 605 | ES 416), and `llama-del-bosque` (EN 682 | ES 497).
- **2026-02-14 parity maintenance cycle update:** Completed two sequential Priority 1.4 passes from a fresh `npm run content:audit` baseline.
  - Pass A (initial highest-parity gaps from audit):
    - `content/trees/es/cachimbo.mdx` 477 → 600 (EN 652)
    - `content/trees/es/cortez-negro.mdx` 448 → 635 (EN 605)
    - `content/trees/en/guachipelin.mdx` 581 → 709 and `content/trees/es/guachipelin.mdx` 447 → 665
    - `content/trees/en/quina.mdx` 384 → 635 and `content/trees/es/quina.mdx` 385 → 632
  - Mid-cycle rerun surfaced additional high-impact ES pages still below 600 (`mangle-blanco`, `mastate`, `llama-del-bosque`, `papaya`).
  - Pass B (reprioritized by fresh audit):
    - `content/trees/es/mangle-blanco.mdx` 415 → 602
    - `content/trees/es/mastate.mdx` 472 → 600
    - `content/trees/es/llama-del-bosque.mdx` 496 → 600
    - `content/trees/es/papaya.mdx` 529 → 717
  - Final maintenance rerun result: short-page backlog reduced **25 → 21**.
  - Next short-page targets by current audit order: `cedro-dulce`, `cristobalito`, `papayillo`, `guayaba-chilena`, then `cortez-blanco`.
- **2026-02-14 parity maintenance update:** Continued Priority 1.4 work on the next four high-gap Spanish pages, then reran `npm run content:audit`.
  - Expanded `content/trees/es/mastate.mdx` from 473 → 608 lines (EN counterpart 688).
  - Expanded `content/trees/es/papaya.mdx` from 530 → 729 lines (EN counterpart 736).
  - Expanded `content/trees/es/mangle-blanco.mdx` from 416 → 602 lines (EN counterpart 605).
  - Expanded `content/trees/es/llama-del-bosque.mdx` from 497 → 603 lines (EN counterpart 682).
  - Audit short-page backlog reduced from 29 → 25 species.
  - Next priority candidates by parity gap: `cachimbo` (EN 653 | ES 478), `cortez-negro` (EN 606 | ES 449), `guachipelin` (EN 582 | ES 448), then `quina` for low-line bilingual expansion (EN 385 | ES 386).
- **2026-02-15 maintenance update:** Completed the next top-five short-page batch from a fresh `npm run content:audit` baseline.
  - Expanded `content/trees/en/cedro-dulce.mdx` 405 → 611 and `content/trees/es/cedro-dulce.mdx` 419 → 612.
  - Expanded `content/trees/en/cristobalito.mdx` 470 → 601 and `content/trees/es/cristobalito.mdx` 473 → 604.
  - Expanded `content/trees/en/papayillo.mdx` 472 → 607 and `content/trees/es/papayillo.mdx` 491 → 611.
  - Expanded `content/trees/en/guayaba-chilena.mdx` 477 → 610 and `content/trees/es/guayaba-chilena.mdx` 489 → 608.
  - Expanded `content/trees/en/cortez-blanco.mdx` 479 → 600 and `content/trees/es/cortez-blanco.mdx` 502 → 622.
  - Audit short-page backlog reduced **21 → 16**.
  - Next short-page targets by current audit order: `lengua-de-vaca`, `corozo`, `tirra`, `tamarindo-dulce`, then `flor-de-itabo`.
- **2026-02-15 maintenance completion update:** Ran a fresh baseline audit and closed the final short-page backlog in one pass.
  - Expanded `content/trees/en/palma-cacho-de-venado.mdx` and `content/trees/es/palma-cacho-de-venado.mdx` to clear the threshold.
  - Expanded `content/trees/en/javillo.mdx`.
  - Expanded `content/trees/en/cipres.mdx`.
  - Expanded `content/trees/en/fruta-de-pan.mdx` and `content/trees/es/fruta-de-pan.mdx`.
  - Expanded `content/trees/en/guacimo.mdx`.
  - Expanded `content/trees/en/capulin.mdx`.
  - Audit short-page backlog reduced **6 → 0** (all 160 species now at 600+ lines in both locales where applicable).
  - Next action after Priority 1.4: move to the highest unchecked item in this plan.

See `audit-content-report.md` for full details.

#### ✅ Completed Enhancements (15 species)

- [x] comenegro (108→762 lines)
- [x] manchineel (349→691 lines)
- [x] yellow-oleander (426→933 lines)
- [x] ciprecillo (445→885 lines)
- [x] quizarra (482→771 lines)
- [x] quebracho (492→745 lines)
- [x] carboncillo (498→761 lines)
- [x] targua (513→779 lines)
- [x] cana-india (516→729 lines)
- [x] palmera-real (519→869 lines)
- [x] cornizuelo (524→875 lines)
- [x] manu (531→892 lines)
- [x] sotacaballo (536→817 lines)
- [x] copey (548→797 lines)
- [x] mamon (574→800 lines)

#### 📋 Remaining Short Pages (22 species)

**Priority: 550-600 lines (8 species)**

- [x] aguacatillo (549→749 lines)
- [x] pejibaye (826 lines)
- [x] papaturro (557→687 lines)
- [x] nazareno (562→707 lines)
- [x] cativo (569→690 lines)
- [x] capulin (571→602 lines)
- [x] olla-de-mono (574→672 lines)
- [x] cas (578→671 lines)

**Standard: 600+ lines (14 species)**

- [x] lechoso (699 lines)
- [x] laurel (677 lines)
- [x] jicaro (596→617 lines)
- [x] manzana-de-agua (592→607 lines)
- [x] papaya (656 lines)
- [x] mora (609 lines)
- [x] nispero (648 lines)
- [x] cana-agria (582→629 lines)
- [x] amarillon (682 lines)
- [x] fruta-dorada (688 lines)
- [x] cerillo (729 lines)
- [x] caobilla (696 lines)
- [x] yos (581→750 lines)
- [x] madrono (582→844 lines)

**✅ Priority 1.4 COMPLETE (2026-02-08)**

All 24 species identified as short pages have been successfully expanded to 600+ lines. Each page now includes:

- Enhanced cultural significance and historical context
- Detailed conservation status assessments
- Comprehensive seasonal phenology
- Improved bilingual parity

**Additional Species from 2026 Audit Requiring Attention:**

Priority should focus on **bilingual parity** - many species have good English content but very short Spanish translations:

- [x] anona (EN: 606 | ES: 634 lines) - ✅ Gap closed (2026-02-08)
- [x] guanabana (EN: 593 | ES: 603 lines) - ✅ Gap closed (2026-02-08)
- [x] carambola (EN: 605 | ES: 729 lines) - ✅ Gap closed (2026-02-08)
- [x] pitahaya (EN: 614 | ES: 614 lines) - ✅ Gap closed (2026-02-08)
- [x] icaco (EN: 624 | ES: 604 lines) - ✅ Gap closed (2026-02-08)

**✅ Bilingual Parity COMPLETE (2026-02-08)**

All 5 species with significant bilingual parity gaps have been successfully expanded. Spanish translations now include:

- Complete taxonomy sections with name origins
- Comprehensive ecology and habitat information
- Detailed cultivation and care guidance
- Enhanced cultural significance sections
- Full nutritional information and uses tables
- Quick identification guides and references

See `audit-content-report.md` for complete list of 26 species.

**Enhancement Checklist (Per Page):**

- [ ] Add missing sections per CONTENT_STANDARDIZATION_GUIDE.md
- [ ] Expand cultural significance (2-3 paragraphs)
- [ ] Add "Where to See This Tree" section
- [ ] Ensure 5+ gallery images (varied categories)
- [ ] Add external resources (IUCN, iNaturalist, GBIF)
- [ ] Expand cultivation section with regional specifics
- [ ] Add traditional/indigenous uses if applicable
- [ ] Verify bilingual parity (ES matches EN depth)

---

## Priority 2: Performance Optimization ⚡

**Impact:** High - Critical for UX and SEO  
**Status:** 🟡 In Progress (Phase 1 ✅, Phase 2 partial)  
**Reference:** [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)

**Current Scores:**

- Lighthouse: 48/100 → Target: 90/100
- LCP: 6.0s → Target: <2.5s
- TBT: 440ms → Target: <200ms

### Phase 1: Validation Required

- [x] **Test Phase 1 improvements** [2d] (validated 2026-02-07)
  - [x] Measure current metrics after hero image optimization
  - [x] Verify lazy loading working
  - [x] Confirm console errors fixed
  - [x] Document improvements

### Phase 2: Medium Priority

- [x] Implement service worker for offline caching [1w] ✅
- [x] Add resource hints (dns-prefetch, preconnect) [2d] ✅
- [x] Optimize third-party scripts (analytics, fonts) [3d] ✅
- [x] Implement request coalescing [2d] ✅
- [x] Add performance monitoring dashboard [1w] ✅
- [x] Set up Lighthouse CI [2d] ✅

### Phase 3: Long-term

- [ ] Migrate more components to Server Components
  - [x] Convert `Footer` to server component to reduce client hydration (2026-02-10)
  - [x] Convert homepage `AboutSection`, `StatsSection`, and `NowBloomingSection` to server components (2026-02-10)
  - [x] Convert `DataSourceCard` (about page) to server component by moving translations to parent and passing labels as props (2026-02-10)
  - [x] Convert `CurrentYear` to server rendering to remove a client-only boundary in footer copyright text (2026-02-10)
  - [x] Convert homepage `FeaturedTreesSection` to a server component and move selection logic to server rendering (2026-02-10)
- [ ] Implement partial hydration
- [ ] Add progressive enhancement strategies
- [ ] Optimize database queries (when admin active)
- [ ] Implement edge caching strategies

**Performance Budgets:**

| Resource          | Budget | Current | Status  |
| ----------------- | ------ | ------- | ------- |
| JavaScript        | <300KB | ~400KB  | ⚠️ Over |
| CSS               | <100KB | ~80KB   | ✅ Good |
| Images (Hero)     | <200KB | ~300KB  | ⚠️ Over |
| Total Page Weight | <2MB   | ~2.5MB  | ⚠️ Over |

---

## Priority 3: Infrastructure Quick Wins ⚡

**Impact:** High - Quick security wins  
**Status:** 🟢 Mostly Complete (Only branch protection remains)

### 📋 3.1: GitHub Branch Protection

**Status:** ❌ Not Configured (Manual setup required)

**Setup Steps:**

1. Navigate to: **Settings → Branches → Branch protection rules**
2. Add rule for `main` branch:
   - ☑️ Require status checks before merging
   - ☑️ Require "Security Checks" workflow to pass
   - ☑️ Require branches to be up to date
   - ☑️ Require pull request reviews (1+ reviewers)
   - ☑️ Dismiss stale PR reviews when new commits pushed
   - ☑️ Restrict who can push to matching branches
   - ☑️ Disable force pushes
   - ☑️ Disable deletions
3. Test by attempting direct push to main (should be blocked)

### ✅ 3.2: Pre-commit Hooks (COMPLETE)

- [x] Husky installed and configured
- [x] Pre-commit validates MDX + runs lint-staged
- [x] Commit-msg enforces conventional commits
- [x] commitlint.config.js with "content" type

### ✅ 3.3: Error Tracking (COMPLETE)

- [x] Created `src/lib/sentry.ts` with graceful degradation
- [x] Updated 4 error boundaries (ErrorBoundary, ImageErrorBoundary, ComponentErrorBoundary, global-error)
- [x] Works with or without Sentry SDK installed
- [x] NEXT_PUBLIC_SENTRY_DSN in .env.example

### ⏸️ 3.4: CSP Optimization

Requires:

- Refactoring 30+ components with inline styles
- Converting `style={{...}}` to CSS modules/Tailwind
- Extensive testing for layout regressions
- Estimated 1-2 weeks actual effort

**Recommendation:** Schedule as dedicated sprint, not quick win.

### ✅ 3.5: Image Optimization (COMPLETE)

- [x] All 128 images optimized (100%)
- [x] Average size: 463KB
- [x] No broken images

---

## Priority 4: Community Features 👥

**Impact:** Medium - Enables user contributions  
**Status:** ⏸️ Blocked (Requires Priority 0 complete)

### 4.1: User Photo Upload System

**Prerequisites:** ✅ Image Review System (Priority 0.3)

**Features:**

- [ ] Upload photos for existing species
- [ ] Tag photos by tree part (bark, leaves, flowers, fruit)
- [ ] Automatic proposal creation for admin review
- [ ] User attribution and credits
- [ ] Reputation system for quality uploaders

**Technical:**

- [ ] Image upload/storage (Cloudinary or S3)
- [ ] Reuse ImageProposal system from Priority 0.3
- [ ] Spam/abuse prevention
- [ ] Image optimization pipeline integration

### 4.2: Community Contributions Workflow

**Features:**

- [ ] Submit new species for review
- [ ] Suggest corrections to existing content
- [ ] Share local knowledge and traditional uses
- [ ] Rate and review tree species

**Technical:**

- [ ] Form submission system
- [ ] Review/approval workflow
- [ ] Version control for content changes
- [ ] User reputation system

### 4.3: Public API for Researchers

**Features:**

- [ ] RESTful endpoints for tree data
- [ ] Search and filtering capabilities
- [ ] Rate limiting and API keys
- [ ] OpenAPI/Swagger documentation

**Technical:**

- [ ] API route architecture
- [ ] Authentication middleware
- [ ] Rate limiting (Upstash/Redis)
- [ ] API documentation generation

---

## Priority 5: Content Enrichment 🌿

**Impact:** Medium - Cultural depth and specialized knowledge  
**Status:** 📋 Ready (Independent)

### 5.1: Indigenous Terminology

**Target:** Bribri and Cabécar plant names for all species

- [ ] Research indigenous names (requires community collaboration)
- [ ] Document traditional uses
- [ ] Add cultural significance
- [ ] Identify sacred trees
- [ ] Partner with indigenous communities for validation

### 5.2: Expanded Glossary

**Current:** 100/150 terms (67%)  
**Target:** 150+ terms

**Focus Areas:**

- [ ] Indigenous terminology (15-20 terms)
- [ ] Wood anatomy (grain patterns, figure types) (10 terms)
- [ ] Forest ecology (succession, gap dynamics) (10 terms)
- [ ] Agroforestry systems (alley cropping, silvopasture) (10 terms)

### 5.3: Traditional Uses Documentation

**Content:**

- [ ] Medicinal uses (ethnobotanical research)
- [ ] Construction techniques (traditional building)
- [ ] Cultural practices (ceremonies, tools)
- [ ] Elder interviews and oral histories

---

## Priority 6: Internationalization 🌍

**Impact:** Medium - Expands international user base  
**Status:** 📋 Ready (Independent)

### 6.1: Portuguese Translation

**Target:** Brazilian researchers and tourists

- [ ] Add `pt` locale to i18n config
- [ ] Create `messages/pt.json`
- [ ] Translate all UI strings
- [ ] Translate tree content
- [ ] Native speaker review

### 6.2: German Translation

**Target:** European ecotourists

- [ ] Add `de` locale to i18n config
- [ ] Create `messages/de.json`
- [ ] Translate all content
- [ ] Native speaker review

### 6.3: French Translation

**Target:** European and Canadian users

- [ ] Add `fr` locale to i18n config
- [ ] Create `messages/fr.json`
- [ ] Translate all content
- [ ] Native speaker review

---

## Priority 7: Technical Improvements ⚙️

**Impact:** Medium - Enhanced UX and developer productivity  
**Status:** 📋 Ready (Independent)

### 7.1: Enhanced Search

**Current:** Basic keyword search

**Enhancements:**

- [ ] Fuzzy matching (typo tolerance)
- [ ] Voice search integration
- [ ] Search suggestions and autocomplete
- [ ] Advanced filters (bloom time, size, uses)
- [ ] Search analytics

**Technical:**

- [ ] Integrate search library (FlexSearch or Algolia)
- [ ] Voice API integration
- [ ] Analytics tracking

### 7.2: Offline Enhancements

**Current:** Basic PWA with service worker

**Enhancements:**

- [ ] Download species for offline use
- [ ] Offline search functionality
- [ ] Background sync for user data
- [ ] Offline-first architecture

**Technical:**

- [ ] Enhanced service worker
- [ ] IndexedDB for local storage
- [ ] Sync strategies

### 7.3: Performance Monitoring Dashboard

**Features:**

- [ ] Real-time Core Web Vitals
- [ ] Bundle size tracking
- [ ] Build time metrics
- [ ] Error tracking integration

**Tools:** Vercel Analytics, Sentry, Lighthouse CI

---

## Quick Reference

### 📚 Key Documentation

| Document                              | Purpose                     |
| ------------------------------------- | --------------------------- |
| [README.md](../README.md)             | Project overview            |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Development setup           |
| [AGENTS.md](../AGENTS.md)             | AI agent conventions        |
| [CONTENT_STANDARDIZATION_GUIDE.md]    | Content structure standards |
| [SPECIES_ADDITION_PROCESS.md]         | Adding new trees            |
| [IMAGE_OPTIMIZATION.md]               | Image handling guide        |
| [IMAGE_REVIEW_SYSTEM.md]              | Image QA workflow           |
| [SAFETY_SYSTEM.md]                    | Safety data guidelines      |
| [SECURITY_SETUP.md]                   | Security configuration      |
| [PERFORMANCE_OPTIMIZATION.md]         | Performance plan            |
| [MISSING_SPECIES_LIST.md]             | Species prioritization      |

[CONTENT_STANDARDIZATION_GUIDE.md]: ./CONTENT_STANDARDIZATION_GUIDE.md
[SPECIES_ADDITION_PROCESS.md]: ./SPECIES_ADDITION_PROCESS.md
[IMAGE_OPTIMIZATION.md]: ./IMAGE_OPTIMIZATION.md
[IMAGE_REVIEW_SYSTEM.md]: ./IMAGE_REVIEW_SYSTEM.md
[SAFETY_SYSTEM.md]: ./SAFETY_SYSTEM.md
[SECURITY_SETUP.md]: ./SECURITY_SETUP.md
[PERFORMANCE_OPTIMIZATION.md]: ./PERFORMANCE_OPTIMIZATION.md
[MISSING_SPECIES_LIST.md]: ./MISSING_SPECIES_LIST.md

### 🎯 Getting Started

1. **Review priorities** - Understand what's most important
2. **Pick a task** - Choose from ready (📋) priorities
3. **Check dependencies** - Verify blockers are resolved
4. **Follow standards** - Read relevant documentation
5. **Implement & test** - Follow quality checklist
6. **Submit PR** - Create pull request with clear description

### 📊 Success Metrics

**Content Coverage:**

- Species count: 175+ (current: 160)
- Care guidance: 80%+ (current: 70%)
- Comparison guides: 20/20 ✅
- Glossary terms: 150+ (current: 100)

**Performance:**

- Lighthouse: >90 (current: 48)
- LCP: <2.5s (current: 6.0s)
- TBT: <200ms (current: 440ms)

**User Engagement:**

- Monthly active users
- Average session duration
- Pages per session
- Returning visitor rate

### 📋 Quality Standards

**Content:**

- Minimum 3 sources for botanical information
- Bilingual parity (EN/ES fully matched)
- 5+ images per species (varied categories)
- Proper attribution and licensing
- WCAG 2.1 Level AA accessibility

**Technical:**

- TypeScript strict mode
- Zero build warnings
- Conventional commits
- Performance budgets enforced

---

**Last Comprehensive Review:** 2026-02-07  
**Status:** 🚀 v1.0 Complete, Active Development on Priority 0-1  
**Next Milestones:** Image Review System → Content Expansion → Performance Optimization
