# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-02-08  
**Status:** ✅ v1.0 Complete | 🎯 Active Development

## 📊 Status Dashboard

### Content Coverage

- **Species**: 133/175 (76%) - Target: 175+ documented species
- **Comparison Guides**: 20/20 (100%) ✅ Complete
- **Glossary Terms**: 100/150 (67%) - Target: 150+ terms
- **Care Guidance**: 60/128 (47%) - Target: 100/128 (78%)

### Technical Health

- **Lighthouse Score**: 48/100 → Target: 90/100
- **LCP**: 6.0s → Target: <2.5s
- **TBT**: 440ms → Target: <200ms
- **Auth Status**: ✅ Complete (MFA, JWT, backup codes working)
- **Safety System**: ✅ Complete (100% coverage, filters live)
- **Image Status**: 109/128 optimized (85%)

### Key Priorities

| Priority | Focus Area                | Status     | Impact   |
| -------- | ------------------------- | ---------- | -------- |
| **0**    | **Critical Blockers**     | ✅ Code    | Critical |
| **1**    | **Content Expansion**     | 📋 Ready   | High     |
| **2**    | **Performance**           | ⏸️ Blocked | High     |
| **3**    | **Infrastructure**        | 🟢 Mostly  | High     |
| **4**    | **Community Features**    | ⏸️ Blocked | Medium   |
| **5**    | **Content Enrichment**    | 📋 Ready   | Medium   |
| **6**    | **Internationalization**  | 📋 Ready   | Medium   |
| **7**    | **Technical Enhancement** | 📋 Ready   | Medium   |

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

**Status:** ✅ All code implemented (verified 2026-02-07)  
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
- [ ] Validation gate (requires database deployment)
  - [ ] Test 10 proposals end-to-end
  - [ ] Verify side-by-side comparison works
  - [ ] Confirm audit log tracks changes
  - [ ] Ensure weekly workflow generates proposals (not auto-applies)

**🚦 Completion Gate:** Auth fixed ✅, Safety live ✅, Image Review code complete ✅ (validation pending DB deployment) → Unblocks Priority 4

---

## Priority 1: Content Expansion 📚

**Impact:** High - Broader coverage, more comprehensive resource  
**Status:** 📋 Ready (No blockers)

### 1.1: Add 47 Missing Species

**Status:** 📋 Ready (188 hours total)  
**Reference:** [MISSING_SPECIES_LIST.md](MISSING_SPECIES_LIST.md)

#### High Priority Native Species (10 species)

- [ ] Camíbar (Copaifera camibar)
- [ ] Cedro Real (Cedrela fissilis)
- [ ] Guayacán Real (Guaiacum sanctum)
- [ ] Cristóbal (Platymiscium pinnatum)
- [ ] Cachá/Copey (Clusia rosea)
- [ ] María (Calophyllum brasiliense)
- [ ] Níspero (Manilkara zapota)
- [ ] Almendro de Montaña (Dipteryx panamensis)
- [ ] Guácimo Colorado (Luehea seemannii)
- [ ] Caimitillo (Chrysophyllum cainito)

#### Common Ornamentals & Fruit (10 species)

- [ ] Flamboyan (Delonix regia)
- [ ] Jacaranda Blanco (Jacaranda mimosifolia alba)
- [ ] Cas (Psidium friedrichsthalianum)
- [ ] Mora (Rubus adenotrichos)
- [ ] Guanábana (Annona muricata)
- [ ] Rambután (Nephelium lappaceum)
- [ ] Carambola (Averrhoa carambola)
- [ ] Guayaba Chilena (Acca sellowiana)
- [ ] Tamarindo Dulce (Tamarindus indica var. dulcis)
- [ ] Marañón de Jardín (Anacardium occidentale var.)

#### Medium Priority (20 species)

- [ ] Add 20 medium priority species (See MISSING_SPECIES_LIST.md)

#### Low Priority (7 species)

- [ ] Add 7 low priority species (See MISSING_SPECIES_LIST.md)

**Per-Species Checklist:**

- [ ] Research 3+ reliable sources
- [ ] Create EN and ES MDX files with complete frontmatter
- [ ] Add taxonomy, description, distribution, cultivation sections
- [ ] Include comprehensive safety data
- [ ] Source 5+ high-quality images (featured + gallery)
- [ ] Add external resources (IUCN, iNaturalist, GBIF)
- [ ] Verify bilingual parity
- [ ] Test build generates pages correctly

### ✅ 1.2: Comparison Guides (COMPLETE)

**Status:** ✅ 20/20 complete (verified 2026-01-20)

Recent additions completed:

- [x] Laurel vs Laurel Negro
- [x] Jobo vs Jocote
- [x] Corteza Amarilla vs Cortez Negro
- [x] Mamón vs Mamón Chino

### 1.3: Expand Care Guidance

**Status:** 📋 Ready
**Current:** 60/128 (47%) → **Target:** 100/128 (78%)

#### Week 1: Common Planted Trees (10 species)

- [ ] Guanábana
- [ ] Carambola
- [ ] Cas
- [ ] Mora
- [ ] Rambután
- [ ] Tamarindo
- [ ] Laurel
- [ ] Cedro Amargo
- [ ] Pochote
- [ ] Corteza Amarilla

#### Weeks 2-4: Additional 30 Species

- [ ] Add care guidance to 30 mid-priority species

**Care Guidance Template:**

- [ ] Planting instructions (site, soil, spacing)
- [ ] Watering requirements
- [ ] Fertilization schedule
- [ ] Pruning guidelines
- [ ] Pest/disease management
- [ ] Companion planting suggestions
- [ ] Growth timeline and mature size
- [ ] Harvest information (if applicable)

### 1.4: Fix Short Pages Quality

**Status:** ✅ Complete (2026-02-08)  
**Target:** All pages 600+ lines ✅ **ACHIEVED**  
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

- [ ] Implement service worker for offline caching [1w]
- [x] Add resource hints (dns-prefetch, preconnect) [2d] ✅
- [x] Optimize third-party scripts (analytics, fonts) [3d] ✅
- [ ] Implement request coalescing [2d]
- [ ] Add performance monitoring dashboard [1w]
- [x] Set up Lighthouse CI [2d] ✅

### Phase 3: Long-term

- [ ] Migrate more components to Server Components
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

- Species count: 175+ (current: 133)
- Care guidance: 80%+ (current: 47%)
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
