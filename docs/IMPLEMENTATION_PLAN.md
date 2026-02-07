# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-02-07  
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

| Priority | Focus Area                | Status     | Impact   | Est. Time |
| -------- | ------------------------- | ---------- | -------- | --------- |
| **0**    | **Critical Blockers**     | 🟡 Partial | Critical | 3 weeks   |
| **1**    | **Content Expansion**     | 📋 Ready   | High     | 12-16 wks |
| **2**    | **Performance**           | ⏸️ Blocked | High     | 6-8 weeks |
| **3**    | **Infrastructure**        | 🟢 Mostly  | High     | 5 min     |
| **4**    | **Community Features**    | ⏸️ Blocked | Medium   | 8-12 wks  |
| **5**    | **Content Enrichment**    | 📋 Ready   | Medium   | Ongoing   |
| **6**    | **Internationalization**  | 📋 Ready   | Medium   | 6-9 wks   |
| **7**    | **Technical Enhancement** | 📋 Ready   | Medium   | 4-6 wks   |

**Legend:** ✅ Complete | 🟡 In Progress | 📋 Ready | ⏸️ Blocked | ⚠️ Issues

---

## Priority 0: Critical Blockers 🚨

**Impact:** Critical - Blocks community features  
**Status:** 🟡 Partially Complete (Auth ✅, Safety ✅, Image Review pending)

### ✅ 0.1: Admin Authentication (COMPLETE)

**Status:** ✅ All issues resolved (verified 2026-02-07)

- [x] Fix JWT session strategy conflict
- [x] Remove Basic Auth fallback
- [x] Complete MFA: TOTP encryption (AES-256-GCM)
- [x] Complete MFA: Backup codes (Argon2id hashing)
- [x] Remove debug logging from production
- [x] All auth TODOs resolved
- [ ] Add E2E authentication tests (remaining task)

### ✅ 0.2: Safety System Integration (COMPLETE)

**Status:** ✅ All features live (verified 2026-01-19)

- [x] Safety filters in tree directory (Child Safe, Pet Safe, Non-Toxic, Low Risk)
- [x] Dedicated `/safety` page with emergency contacts
- [x] SafetyCard rendering on tree detail pages
- [x] SafetyIcon in TreeCard component
- [x] SafetyWarning for High/Severe toxicity
- [x] 100% species have safety data
- [x] Full bilingual content (EN/ES)

### 📋 0.3: Image Review & Approval System

**Status:** 📋 Not Started (3 weeks)  
**Impact:** Critical - Prevents image quality issues, enables community uploads  
**Docs:** [IMAGE_REVIEW_SYSTEM.md](IMAGE_REVIEW_SYSTEM.md)

**Goal:** Human-in-the-loop workflow to prevent automatic image overwrites

#### Week 1: Database & Workflow

- [ ] **Day 1-2**: Database schema [2d]
  - [ ] Add `ImageProposal` model (treeSlug, imageType, currentUrl, proposedUrl, qualityScore, status, reviewedBy)
  - [ ] Add `ImageVote` model (user votes: upvote/downvote/flag)
  - [ ] Add `ImageAudit` model (change history: who, when, what, why)
  - [ ] Run `npx prisma migrate dev --name add-image-review-system`
  - [ ] Test with sample data
- [ ] **Day 3-4**: Update weekly workflow [2d]
  - [ ] Modify `.github/workflows/weekly-image-quality.yml` to CREATE proposals (not apply)
  - [ ] Create `scripts/propose-image-changes.mjs`
  - [ ] Save proposals to database via API
  - [ ] PR links to admin review dashboard
- [ ] **Day 5**: Integrate audit reports [1d]
  - [ ] Auto-create proposals for broken/missing/low-quality images
  - [ ] Test end-to-end workflow

#### Week 2: Admin Dashboard

- [ ] **Day 6-8**: Build admin review UI [3d]
  - [ ] Create `/admin/images/proposals` page
  - [ ] Side-by-side comparison (current vs proposed)
  - [ ] Display quality metrics (resolution, file size, source)
  - [ ] Action buttons: Approve, Deny, Archive
  - [ ] Bulk operations support
  - [ ] Filter by status and species
- [ ] **Day 9**: Build admin API [1d]
  - [ ] POST `/api/admin/images/proposals` - Create proposal
  - [ ] GET `/api/admin/images/proposals` - List proposals (paginated)
  - [ ] PATCH `/api/admin/images/proposals/[id]` - Update status
  - [ ] POST `/api/admin/images/proposals/[id]/apply` - Apply approved proposal
- [ ] **Day 10**: Approval logic [1d]
  - [ ] Download, optimize, and replace approved images
  - [ ] Create audit log entry
  - [ ] Update tree MDX frontmatter if needed
  - [ ] Mark proposal as applied

#### Week 3: Public Voting & Validation

- [ ] **Day 11-13**: Public voting interface [3d]
  - [ ] Create `/images/vote` page
  - [ ] Upvote/downvote buttons (anonymous, session-based)
  - [ ] Flag dialog: "This is mislabeled" with reasons
  - [ ] Prevent duplicate votes
- [ ] **Day 14**: Public voting API [1d]
  - [ ] POST `/api/images/vote` - Submit vote
  - [ ] POST `/api/images/flag` - Flag image with reason
  - [ ] GET `/api/images/vote/stats` - Get vote counts
  - [ ] Rate limiting: 100 votes/hour per session
- [ ] **Day 15**: Validation gate [1d]
  - [ ] Test 10 proposals end-to-end
  - [ ] Verify side-by-side comparison works
  - [ ] Confirm audit log tracks changes
  - [ ] Ensure weekly workflow generates proposals (not auto-applies)

**🚦 Completion Gate:** Auth fixed ✅, Safety live ✅, Image Review validated → Unblocks Priority 4

---

## Priority 1: Content Expansion 📚

**Impact:** High - Broader coverage, more comprehensive resource  
**Status:** 📋 Ready (No blockers)  
**Est. Time:** 12-16 weeks (can run in parallel)

### 1.1: Add 47 Missing Species

**Status:** 📋 Ready (188 hours total)  
**Reference:** [MISSING_SPECIES_LIST.md](MISSING_SPECIES_LIST.md)

#### High Priority Native Species (10 species - Weeks 1-2)

- [ ] Camíbar (Copaifera camibar) [4h]
- [ ] Cedro Real (Cedrela fissilis) [4h]
- [ ] Guayacán Real (Guaiacum sanctum) [4h]
- [ ] Cristóbal (Platymiscium pinnatum) [4h]
- [ ] Cachá/Copey (Clusia rosea) [4h]
- [ ] María (Calophyllum brasiliense) [4h]
- [ ] Níspero (Manilkara zapota) [4h]
- [ ] Almendro de Montaña (Dipteryx panamensis) [4h]
- [ ] Guácimo Colorado (Luehea seemannii) [4h]
- [ ] Caimitillo (Chrysophyllum cainito) [4h]

#### Common Ornamentals & Fruit (10 species - Weeks 3-4)

- [ ] Flamboyan (Delonix regia) [4h]
- [ ] Jacaranda Blanco (Jacaranda mimosifolia alba) [4h]
- [ ] Cas (Psidium friedrichsthalianum) [4h]
- [ ] Mora (Rubus adenotrichos) [4h]
- [ ] Guanábana (Annona muricata) [4h]
- [ ] Rambután (Nephelium lappaceum) [4h]
- [ ] Carambola (Averrhoa carambola) [4h]
- [ ] Guayaba Chilena (Acca sellowiana) [4h]
- [ ] Tamarindo Dulce (Tamarindus indica var. dulcis) [4h]
- [ ] Marañón de Jardín (Anacardium occidentale var.) [4h]

#### Medium Priority (20 species - Weeks 5-8)

- [ ] Add 20 medium priority species [80h] (See MISSING_SPECIES_LIST.md)

#### Low Priority (7 species - Weeks 9-11)

- [ ] Add 7 low priority species [28h] (See MISSING_SPECIES_LIST.md)

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

**Status:** 📋 Ready (40-80 hours)  
**Current:** 60/128 (47%) → **Target:** 100/128 (78%)

#### Week 1: Common Planted Trees (10 species)

- [ ] Guanábana [2h]
- [ ] Carambola [2h]
- [ ] Cas [2h]
- [ ] Mora [2h]
- [ ] Rambután [2h]
- [ ] Tamarindo [2h]
- [ ] Laurel [2h]
- [ ] Cedro Amargo [2h]
- [ ] Pochote [2h]
- [ ] Corteza Amarilla [2h]

#### Weeks 2-4: Additional 30 Species (60 hours)

- [ ] Add care guidance to 30 mid-priority species [60h]

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

**Status:** 🟡 In Progress (37 pages under 600 lines)  
**Target:** All pages 600+ lines

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

**Priority: 550-600 lines (8 species - Weeks 1-2)**

- [ ] aguacatillo (549 lines) [1d]
- [ ] pejibaye (553 lines) [1d]
- [ ] papaturro (557 lines) [1d]
- [ ] nazareno (562 lines) [1d]
- [ ] cativo (5XX lines) [1d]
- [ ] capulin (5XX lines) [1d]
- [ ] olla-de-mono (5XX lines) [1d]
- [ ] cas (5XX lines) [1d]

**Standard: 600+ lines (14 species - Weeks 3-5)**

- [ ] lechoso [1d]
- [ ] laurel [1d]
- [ ] jicaro [1d]
- [ ] manzana-de-agua [1d]
- [ ] papaya [1d]
- [ ] mora [1d]
- [ ] nispero [1d]
- [ ] cana-agria [1d]
- [ ] amarillon [1d]
- [ ] fruta-dorada [1d]
- [ ] cerillo [1d]
- [ ] caobilla [1d]
- [ ] (2 more TBD based on audit) [2d]

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

### Phase 2: Medium Priority (3-4 weeks)

- [ ] Implement service worker for offline caching [1w]
- [x] Add resource hints (dns-prefetch, preconnect) [2d] ✅
- [x] Optimize third-party scripts (analytics, fonts) [3d] ✅
- [ ] Implement request coalescing [2d]
- [ ] Add performance monitoring dashboard [1w]
- [x] Set up Lighthouse CI [2d] ✅

### Phase 3: Long-term (3-4 weeks)

- [ ] Migrate more components to Server Components [1w]
- [ ] Implement partial hydration [1w]
- [ ] Add progressive enhancement strategies [1w]
- [ ] Optimize database queries (when admin active) [3d]
- [ ] Implement edge caching strategies [3d]

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

### 📋 3.1: GitHub Branch Protection (5 minutes)

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

### ⏸️ 3.4: CSP Optimization (DEFERRED)

**Status:** Deferred - Not a "quick win" (requires 30+ component refactors)

**Reason:** Original 2-4 hour estimate was too low. Requires:

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
**Est. Time:** 8-12 weeks

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

**Est. Time:** 2-3 weeks

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

**Est. Time:** 4-6 weeks

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

**Est. Time:** 2-3 weeks

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

**Est. Time:** Ongoing (high effort, requires partnerships)

### 5.2: Expanded Glossary

**Current:** 100/150 terms (67%)  
**Target:** 150+ terms

**Focus Areas:**

- [ ] Indigenous terminology (15-20 terms)
- [ ] Wood anatomy (grain patterns, figure types) (10 terms)
- [ ] Forest ecology (succession, gap dynamics) (10 terms)
- [ ] Agroforestry systems (alley cropping, silvopasture) (10 terms)

**Est. Time:** Ongoing (medium effort)

### 5.3: Traditional Uses Documentation

**Content:**

- [ ] Medicinal uses (ethnobotanical research)
- [ ] Construction techniques (traditional building)
- [ ] Cultural practices (ceremonies, tools)
- [ ] Elder interviews and oral histories

**Est. Time:** High (requires field research and validation)

---

## Priority 6: Internationalization 🌍

**Impact:** Medium - Expands international user base  
**Status:** 📋 Ready (Independent)  
**Est. Time:** 6-9 weeks total

### 6.1: Portuguese Translation

**Target:** Brazilian researchers and tourists

- [ ] Add `pt` locale to i18n config [1d]
- [ ] Create `messages/pt.json` [2w]
- [ ] Translate all UI strings [1w]
- [ ] Translate tree content [3w]
- [ ] Native speaker review [1w]

**Est. Time:** 2-3 weeks

### 6.2: German Translation

**Target:** European ecotourists

- [ ] Add `de` locale to i18n config [1d]
- [ ] Create `messages/de.json` [2w]
- [ ] Translate all content [4w]
- [ ] Native speaker review [1w]

**Est. Time:** 2-3 weeks

### 6.3: French Translation

**Target:** European and Canadian users

- [ ] Add `fr` locale to i18n config [1d]
- [ ] Create `messages/fr.json` [2w]
- [ ] Translate all content [4w]
- [ ] Native speaker review [1w]

**Est. Time:** 2-3 weeks

---

## Priority 7: Technical Improvements ⚙️

**Impact:** Medium - Enhanced UX and developer productivity  
**Status:** 📋 Ready (Independent)  
**Est. Time:** 4-6 weeks

### 7.1: Enhanced Search

**Current:** Basic keyword search

**Enhancements:**

- [ ] Fuzzy matching (typo tolerance) [1w]
- [ ] Voice search integration [3d]
- [ ] Search suggestions and autocomplete [3d]
- [ ] Advanced filters (bloom time, size, uses) [1w]
- [ ] Search analytics [2d]

**Technical:**

- [ ] Integrate search library (FlexSearch or Algolia)
- [ ] Voice API integration
- [ ] Analytics tracking

**Est. Time:** 2-3 weeks

### 7.2: Offline Enhancements

**Current:** Basic PWA with service worker

**Enhancements:**

- [ ] Download species for offline use [1w]
- [ ] Offline search functionality [1w]
- [ ] Background sync for user data [3d]
- [ ] Offline-first architecture [1w]

**Technical:**

- [ ] Enhanced service worker
- [ ] IndexedDB for local storage
- [ ] Sync strategies

**Est. Time:** 2-3 weeks

### 7.3: Performance Monitoring Dashboard

**Features:**

- [ ] Real-time Core Web Vitals [3d]
- [ ] Bundle size tracking [2d]
- [ ] Build time metrics [2d]
- [ ] Error tracking integration [2d]

**Tools:** Vercel Analytics, Sentry, Lighthouse CI

**Est. Time:** 1 week

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
