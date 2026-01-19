# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-01-19  
**Version:** 1.2 (Comprehensive Future Work Consolidated)  
**Status:** ✅ All v1.0 features complete, 6 priority tracks defined

## Overview

This document provides a consolidated implementation plan for future enhancements to the Costa Rica Tree Atlas. All v1.0 features are complete and deployed. This plan organizes all unfinished work, future plans, and enhancement ideas from across documentation files into 6 priority-based tracks.

**Recent Updates (2026-01-19):**

- Added Priority 0.3: Safety System Component Verification
- Added Priority 1.4: Content Quality Audit Refresh
- Added Priority 5.4: Complete Performance Optimization Plan
- Added Priority 6: Security & Infrastructure (branch protection, pre-commit hooks, MFA backup codes, image optimization enhancements)

---

## Current State Summary (v1.0 Complete + Active Expansion)

### Content Achievement

- **129 species** documented with complete safety data (EN+ES)
- **60 priority species** with comprehensive care & cultivation guidance
- **100 glossary terms** with inline tooltips throughout the site
- **16 comparison guides** (80% of 20 target) for commonly confused species ⬆️ **+2 added 2026-01-18**
- **Perfect bilingual parity** maintained across all content (EN/ES)

### Feature Achievement

- ✅ **Safety System**: Complete toxicity data, components created, integration needs verification
- ✅ **Educational Tools**: Interactive quiz, tree selection wizard, diagnostic tool
- ✅ **Discovery Tools**: Advanced filtering, seasonal guide, use cases, field guide PDF generator
- ✅ **Interactive Features**: Distribution maps, conservation dashboard, identification system
- ✅ **Accessibility**: WCAG 2.1 AA compliant, keyboard navigation, screen reader compatible
- ⚠️ **Performance**: Lighthouse 48/100 (Phase 1 optimizations complete, Phase 2-3 pending)
- ✅ **PWA/Offline**: Service worker, manifest, installable app, offline functionality

### Build Quality

- **Pages Generated**: 1,058 static pages
- **Build Status**: Zero errors, zero warnings
- **Type Safety**: Strict TypeScript mode
- **Testing**: All external audits passed (accessibility, performance, screen readers, color contrast)

---

## Priority Tracks Overview

| Priority | Focus Area                    | Key Items                                                                | Status          |
| -------- | ----------------------------- | ------------------------------------------------------------------------ | --------------- |
| **0**    | **Critical Blockers**         | 0.1 Fix Admin Auth, 0.2 Image Review System, 0.3 Safety Component Verify | 🔴 In Progress  |
| **1**    | **Content Expansion**         | 40 species, 4 comparison guides, care guidance, content audit            | 🟢 Ready        |
| **2**    | **Community Features**        | Photo uploads, contributions workflow, public API                        | 🟡 Blocked by 0 |
| **3**    | **Content Enrichment**        | Indigenous terminology, expanded glossary, traditional uses              | 🟢 Ready        |
| **4**    | **Internationalization**      | Portuguese, German, French translations                                  | 🟢 Ready        |
| **5**    | **Technical Improvements**    | Enhanced search, offline features, performance optimization              | 🟡 Partial      |
| **6**    | **Security & Infrastructure** | Branch protection, pre-commit hooks, MFA completion, image optimization  | 🟡 Partial      |

**Legend:**

- 🔴 In Progress - Active work, partially complete
- 🟢 Ready - Can start anytime, no blockers
- 🟡 Blocked/Partial - Depends on other priorities or partially complete

---

## Future Enhancements (Organized by Priority)

### Priority 0: Image Quality & Admin Infrastructure 🔧

**Goal:** Establish human-in-the-loop image review system and fix admin authentication

**Rationale:** Prevents automated overwrites of good images, enables quality control, fixes broken admin login

**⚠️ BLOCKER**: Admin authentication is partially broken. Must fix before image review system.

#### 0.1 Fix Admin Authentication System

**Current Issues:**

- NextAuth configuration exists but login flow doesn't work properly
- Middleware supports both NextAuth and Basic Auth (migration state)
- No clear session management
- MFA implementation incomplete (TOTP secret decryption missing)
- Database session strategy configured but not fully implemented

**Required Fixes:**

1. **NextAuth Session Management**
   - Fix JWT vs database session strategy (currently conflicting)
   - Implement proper session creation in `authorize` callback
   - Fix `getSessionFromRequest` in middleware.ts
   - Remove deprecated Basic Auth fallback

2. **MFA Completion**
   - Implement TOTP secret encryption/decryption
   - Complete backup code verification
   - Test full MFA flow (setup → verify → login)

3. **Admin Pages Protection**
   - Update all admin pages to use NextAuth `getServerSession`
   - Remove HTTP Basic Auth references
   - Add proper role-based access control (RBAC)

4. **Testing**
   - E2E test for login flow
   - Test password reset (if implemented)
   - Test MFA enable/disable flows
   - Verify session persistence

**Files to Update:**

- `src/app/api/auth/[...nextauth]/route.ts` - Fix session strategy
- `middleware.ts` - Remove Basic Auth fallback, clean up logic
- `src/lib/auth/session.ts` - Implement proper session retrieval
- `src/app/[locale]/admin/**/page.tsx` - Add session checks
- All admin API routes - Verify authentication

**Effort**: Medium (1 week)
**Impact**: Critical (blocks all admin features)

#### 0.2 Image Review & Approval System

**Full Documentation**: See [IMAGE_REVIEW_SYSTEM.md](./IMAGE_REVIEW_SYSTEM.md)

**Goal**: Human-in-the-loop workflow for image quality control

**Current Issues:**

- Weekly workflow overwrites images without review
- Mislabeled images ("leaf" shows whole tree, vice versa)
- localStorage voting (non-persistent, not collaborative)
- No quality comparison tools
- No audit trail for image changes

**Three-Layer Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. WORKFLOW LAYER (Propose Changes)                         │
│    - Weekly workflow finds better images                     │
│    - Creates proposals in database (NOT auto-applied)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ADMIN REVIEW LAYER (Approve/Deny/Archive)               │
│    - Side-by-side comparison dashboard                      │
│    - Quality metrics (resolution, score, user votes)        │
│    - Approve/Deny/Archive actions                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PUBLIC VOTING LAYER (Crowdsource Quality)               │
│    - Anonymous voting (upvote/downvote)                     │
│    - Flag mislabeled images                                 │
│    - Feeds data to admin dashboard                          │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Phases:**

**Phase 1: Database Schema (Week 1)**

- Add `ImageProposal` model (proposed changes from workflows)
- Add `ImageVote` model (user votes and flags)
- Add `ImageAudit` model (change history)
- Run migrations

**Phase 2: Workflow Updates (Week 1)**

- Update `weekly-image-quality.yml` to generate proposals (not apply)
- Create `scripts/propose-image-changes.mjs`
- Proposals saved to database with quality metrics
- PR links to admin review dashboard

**Phase 3: Admin Dashboard (Week 2)**

- Create `/admin/images/proposals` page
- Side-by-side comparison UI (current vs proposed)
- Quality checklist (resolution, subject match, lighting)
- Approve/Deny/Archive actions
- Batch operations
- Integration with user votes

**Phase 4: Public Voting (Week 2)**

- Create `/images/vote` page
- Upvote/downvote functionality
- Flag dialog for mislabeled images
- Anonymous voting (session-based, no login)
- Optional leaderboard

**Phase 5: Integration & Testing (Week 3)**

- Connect votes to admin dashboard
- Auto-create proposals from flagged images
- Quality scoring algorithm
- E2E testing
- Documentation

**Key Features:**

- ✅ **No automatic overwrites** - Admin approval required
- ✅ **Quality comparison** - Side-by-side current vs proposed
- ✅ **Crowdsourced feedback** - Users flag mislabeled images
- ✅ **Audit trail** - Track all changes (who, when, why)
- ✅ **Flexible workflow** - Approve/deny/archive options

**Files to Create:**

- `prisma/schema.prisma` - Add ImageProposal, ImageVote, ImageAudit models
- `src/app/[locale]/admin/images/proposals/page.tsx` - Admin review UI
- `src/app/[locale]/images/vote/page.tsx` - Public voting UI
- `src/app/api/admin/images/proposals/route.ts` - API endpoints
- `scripts/propose-image-changes.mjs` - Proposal generation script

**Files to Update:**

- `.github/workflows/weekly-image-quality.yml` - Generate proposals
- `src/app/[locale]/admin/images/page.tsx` - Link to proposals
- `scripts/manage-tree-images.mjs` - Integration with proposals

**Dependencies:**

- ✅ Requires working admin authentication (0.1)
- ✅ Requires database (already configured)
- ⚠️ Blocks community photo upload features

**Effort**: High (3 weeks total)
**Impact**: Critical (protects image quality, enables crowdsourced curation)

#### 0.3 Verify & Integrate Safety System Components

**Current Status (from SAFETY_SYSTEM.md):**

- ✅ Schema complete (13 safety fields defined)
- ✅ All 129 species have safety data (100% coverage)
- ✅ Components created (SafetyCard, SafetyBadge, SafetyWarning, SafetyIcon, SafetyDisclaimer)
- ⚠️ Components imported but rendering not confirmed
- ❌ Safety filtering not implemented in tree directory

**Required Work:**

1. **Verify Component Rendering**
   - Check SafetyCard displays on tree detail pages
   - Verify SafetyWarning appears for high/severe toxicity
   - Confirm SafetyDisclaimer renders
   - Test with multiple toxicity levels

2. **Integrate SafetyIcon in Tree Cards**
   - Add visual safety indicators to TreeCard component
   - Show badges in directory listings
   - Color-coded by risk level (green=safe, red=severe)

3. **Implement Safety Filtering**
   - Add "Child Safe" filter to tree directory
   - Add "Pet Safe" filter
   - Add "Non-Toxic" filter
   - Enable filtering by toxicity level

4. **Create Dedicated Safety Page**
   - Create `/[locale]/safety` route
   - List all toxic species by severity
   - Emergency contact information
   - Safety education content
   - First aid guidelines

5. **Safety Search Enhancement**
   - Enable queries like "child-safe fruit trees"
   - "Pet-safe ornamental trees"
   - "Non-toxic shade trees"

**Files to Update:**

- `src/app/[locale]/trees/[slug]/page.tsx` - Verify SafetyCard rendering
- `src/components/tree/TreeCard.tsx` - Add SafetyIcon integration
- `src/app/[locale]/trees/page.tsx` - Add safety filters
- `src/app/[locale]/safety/page.tsx` - Create dedicated safety page (new file)
- `src/components/search/SearchFilters.tsx` - Add safety filter options

**Dependencies:**

- ✅ Safety data already complete (129 species)
- ✅ Components already created
- No blockers

**Effort**: Low-Medium (1 week)
**Impact**: High (critical safety information must be visible)

---

### Priority 1: Content Expansion 📚

**Goal:** Expand content coverage and depth

**Rationale:** Foundation is solid; more content increases value without architectural changes

#### 1.1 Additional Species

- **Target**: 47+ species identified in MISSING_SPECIES_LIST.md
- **Focus Areas**:
  - High-value native species (Cedro Real, Guayacán Real, Cristóbal)
  - Common ornamentals (Flamboyan, Jacaranda variations)
  - Fruit trees (Cas, Mora, Guanábana varieties)
  - Endangered species (IUCN Red List priorities)
- **Effort**: Medium (2-3 weeks per 10 species)
- **Impact**: High (broader coverage, more comprehensive resource)

#### 1.2 Comparison Guide Expansion

- **Current**: 16/20 guides (80% complete) ✅ **2026-01-18 Progress Update**
- **Target**: 20 total guides
- **Recently Added (2026-01-18)**:
  - ✅ Mango vs. Espavel (cultivated vs. wild Anacardiaceae giants)
  - ✅ Almendro vs. Gavilán (rainforest canopy legumes)
- **Already Existing**:
  - ✅ Aguacate vs. Aguacatillo (documented)
  - ✅ Teca vs. Melina (documented)
  - ✅ Coyol vs. Pejibaye (documented)
  - ✅ Ceiba vs. Pochote (documented)
- **Remaining Candidates** (4 more to reach 20):
  - Cedro Amargo vs. Cedro María (both called "cedro", different families)
  - Laurel vs. Laurel Negro (name confusion between families)
  - Balsa vs. Guarumo (fast-growing pioneer species)
  - Cortez Amarillo vs. Cortez Negro (related but distinct dry forest trees)
- **Effort**: Low (1-2 days per guide)
- **Impact**: Medium (helps users distinguish similar species)

#### 1.3 Care Guidance Expansion

- **Current**: 60/128 species (47%)
- **Target**: 100/128 species (78%)
- **Focus**: Mid-priority species commonly planted in Costa Rica
- **Effort**: Medium (1-2 hours per species)
- **Impact**: Medium (more actionable planting guidance)

#### 1.4 Content Quality Audit Refresh

**Current Status (from CONTENT_STANDARDIZATION_GUIDE.md):**

- Last audit: December 2025 (107 species)
- Current species: 129 (21 species added since audit)
- **12 pages under 500 lines** need enhancement (see CONTENT_STANDARDIZATION_GUIDE.md)
- Distribution of page lengths needs refresh

**Required Work:**

1. **Re-audit All 129 Species**
   - Count lines per file
   - Identify pages under 600 lines (quality benchmark)
   - Check for missing sections (taxonomy, cultivation, external resources)
   - Verify photo gallery completeness (5+ images)

2. **Prioritize Enhancement**
   - Focus on 12 shortest pages first (pitahaya, ciprecillo, pomarrosa, etc.)
   - Add missing sections per CONTENT_STANDARDIZATION_GUIDE.md template
   - Expand cultural significance sections
   - Add "Where to See" sections

3. **Update Content Standards Doc**
   - Refresh page length distribution table
   - Update percentages for sections present
   - Document new best practices from recent additions

4. **Quality Checklist Enforcement**
   - Ensure all required sections present
   - 5+ photos minimum
   - Complete taxonomy section
   - External resources (IUCN, iNaturalist, databases)

**Files to Update:**

- 12 shortest MDX files (list in CONTENT_STANDARDIZATION_GUIDE.md)
- `docs/CONTENT_STANDARDIZATION_GUIDE.md` - Update statistics

**Effort**: Medium (2-3 weeks)
**Impact**: Medium (raises quality floor, improves consistency)

---

### Priority 2: Community Features 👥

**Goal:** Enable user contributions and community engagement

**Rationale:** Transform from static resource to living, community-maintained database

**⚠️ Prerequisites**:

- ✅ Working admin authentication (Priority 0.1)
- ✅ Image review system (Priority 0.2)
- Moderation infrastructure
- User role system (admin/moderator/contributor)

#### 2.1 User Photo Upload System

**Note:** Extends Image Review System (Priority 0.2) to accept user uploads

- **Features**:
  - Upload photos for existing species
  - Tag photos by tree part (bark, leaves, flowers, fruit)
  - Automatic proposal creation for admin review
  - User attribution and credits
  - Reputation system for quality uploaders
- **Technical Requirements**:
  - Image upload/storage (Cloudinary or S3)
  - User authentication (NextAuth - already configured)
  - Reuse ImageProposal system from Priority 0.2
  - Image optimization pipeline (already exists)
  - Spam/abuse prevention
- **Dependencies**:
  - ✅ Image Review System (Priority 0.2)
  - User registration system
  - Role-based permissions
- **Effort**: Medium (2-3 weeks)
- **Impact**: High (dramatically increases photo coverage)

#### 2.2 Community Contributions Workflow

- **Features**:
  - Submit new species for review
  - Suggest corrections to existing content
  - Share local knowledge and traditional uses
  - Rate and review tree species
- **Technical Requirements**:
  - Form submission system
  - Review/approval workflow
  - Version control for content changes
  - User reputation system
- **Effort**: High (4-6 weeks)
- **Impact**: High (crowdsourced knowledge improves quality)

#### 2.3 Public API for Researchers

- **Features**:
  - RESTful endpoints for tree data
  - Search and filtering capabilities
  - Rate limiting and API keys
  - OpenAPI/Swagger documentation
- **Technical Requirements**:
  - API route architecture
  - Authentication middleware
  - Rate limiting (Upstash/Redis)
  - API documentation generation
- **Effort**: Medium (2-3 weeks)
- **Impact**: Medium (enables research and third-party tools)

---

### Priority 3: Content Enrichment 🌿

**Goal:** Add specialized knowledge and cultural depth

**Rationale:** Differentiate from generic botanical databases with local/indigenous knowledge

#### 3.1 Indigenous Terminology

- **Target**: Bribri and Cabécar plant names for all species
- **Content**: Traditional uses, cultural significance, sacred trees
- **Partnerships**: Collaborate with indigenous communities
- **Effort**: High (requires community collaboration)
- **Impact**: High (preserves indigenous knowledge, cultural authenticity)

#### 3.2 Expanded Glossary

- **Current**: 100 terms (target achieved!)
- **Next Target**: 150+ terms
- **Focus Areas**:
  - Indigenous terminology (15-20 terms)
  - Wood anatomy (grain patterns, figure types)
  - Forest ecology (succession stages, gap dynamics)
  - Agroforestry systems (alley cropping, silvopasture)
- **Effort**: Medium (ongoing addition)
- **Impact**: Medium (deeper educational value)

#### 3.3 Traditional Uses Documentation

- **Content**: Medicinal uses, construction techniques, cultural practices
- **Format**: Dedicated sections in tree profiles
- **Research**: Ethnobotanical studies, elder interviews
- **Effort**: High (requires research and validation)
- **Impact**: Medium (cultural preservation, practical knowledge)

---

### Priority 4: Internationalization 🌍

**Goal:** Support additional languages beyond English and Spanish

**Rationale:** Attract international ecotourists, researchers, and conservation professionals

#### 4.1 Portuguese Translation

- **Target Audience**: Brazilian researchers, tourists
- **Effort**: Medium (2-3 weeks)
- **Impact**: Medium (Brazil is major ecotourism market)

#### 4.2 German Translation

- **Target Audience**: European ecotourists (largest non-English speaking group)
- **Effort**: Medium (2-3 weeks)
- **Impact**: Medium (German speakers are significant market)

#### 4.3 French Translation

- **Target Audience**: European and Canadian users
- **Effort**: Medium (2-3 weeks)
- **Impact**: Low-Medium (smaller but dedicated audience)

**Technical Requirements**:

- Add language codes to i18n configuration
- Create message files for new locales
- Translate all UI strings (navigation, buttons, labels)
- Translate content files (trees, glossary, comparisons)
- Test with native speakers

---

### Priority 5: Technical Improvements ⚙️

**Goal:** Enhance technical capabilities and developer experience

**Rationale:** Maintain code quality and enable future features

#### 5.1 Enhanced Search

- **Current**: Basic keyword search
- **Enhancements**:
  - Fuzzy matching (typo tolerance)
  - Voice search integration
  - Search suggestions and autocomplete
  - Advanced filters (bloom time, size, uses)
  - Search analytics
- **Technical Requirements**:
  - Search library (FlexSearch or Algolia)
  - Voice API integration
  - Analytics tracking
- **Effort**: Medium (2-3 weeks)
- **Impact**: High (improved user experience)

#### 5.2 Offline Enhancements

- **Current**: Basic PWA with service worker
- **Enhancements**:
  - Download species for offline use
  - Offline search functionality
  - Background sync for user data
  - Offline-first architecture
- **Technical Requirements**:
  - Enhanced service worker
  - IndexedDB for local storage
  - Sync strategies
- **Effort**: Medium (2-3 weeks)
- **Impact**: Medium (valuable for field use)

#### 5.3 Performance Monitoring Dashboard

- **Features**:
  - Real-time Core Web Vitals
  - Bundle size tracking
  - Build time metrics
  - Error tracking and logging
- **Tools**: Vercel Analytics, Sentry, Lighthouse CI
- **Effort**: Low (1 week)
- **Impact**: Low-Medium (developer visibility)

#### 5.4 Complete Performance Optimization Plan

**Current Status (from PERFORMANCE_OPTIMIZATION.md):**

- **Lighthouse Score**: 48/100 (Target: >90)
- **LCP**: 6.0s (Target: <2.5s) - Critical issue
- **TBT**: 440ms (Target: <200ms) - Critical issue
- **Phase 1 Completed**: Hero image optimization, lazy loading, console error fixes

**Remaining Work:**

**Phase 2: Medium Priority Optimizations**

- [ ] Test and measure Phase 1 improvements
- [ ] Implement service worker for offline caching (PWA already configured)
- [ ] Add resource hints (dns-prefetch, preconnect)
- [ ] Optimize third-party scripts (analytics, fonts)
- [ ] Implement request coalescing
- [ ] Add performance monitoring dashboard

**Phase 3: Long-term Improvements**

- [ ] Migrate more components to Server Components
- [ ] Implement partial hydration for heavy sections
- [ ] Add progressive enhancement strategies
- [ ] Optimize database queries (when admin features active)
- [ ] Implement edge caching strategies

**Performance Budgets to Enforce:**

| Resource          | Budget | Current | Status  |
| ----------------- | ------ | ------- | ------- |
| JavaScript        | <300KB | ~400KB  | ⚠️ Over |
| CSS               | <100KB | ~80KB   | ✅ Good |
| Images (Hero)     | <200KB | ~300KB  | ⚠️ Over |
| Total Page Weight | <2MB   | ~2.5MB  | ⚠️ Over |

**Monitoring & Validation:**

- Set up Lighthouse CI for automated testing
- Enable Vercel Speed Insights
- Track Core Web Vitals in production
- Set up performance regression alerts

**Files Referenced:**

- Full plan: `docs/PERFORMANCE_OPTIMIZATION.md`
- Hero image optimization: `scripts/optimize-hero-image.mjs`
- General image optimization: `scripts/optimize-images.mjs`

**Effort**: Medium (2-3 weeks for Phase 2, 3-4 weeks for Phase 3)
**Impact**: High (critical for user experience and SEO)

---

### Priority 6: Security & Infrastructure 🔒

**Goal:** Complete security infrastructure and operational tools

**Rationale:** Ensure production-ready security and operational excellence

#### 6.1 GitHub Branch Protection Rules

**Current Status (from SECURITY_SETUP.md):**

- ✅ Security workflow operational (npm-audit, TruffleHog, CodeQL, ESLint, license-check)
- ❌ Branch protection not configured (manual setup required)

**Required Setup:**

1. Go to: **Settings → Branches → Branch protection rules**
2. Add rule for `main`:
   - ☑️ Require status checks before merging
   - ☑️ Require "Security Checks" workflow to pass
   - ☑️ Require branches to be up to date
   - ☑️ Require pull request reviews before merging (1+ reviewers)
   - ☑️ Dismiss stale PR reviews when new commits pushed
   - ☑️ Require review from Code Owners
   - ☑️ Restrict who can push to matching branches

**Effort**: Trivial (5 minutes manual setup)
**Impact**: High (prevents accidental direct pushes to main)

#### 6.2 Pre-commit Hooks

**Current Status:**

- ❌ Not configured (prepare script exists but doesn't set up hooks)

**Implementation:**

1. Install Husky for Git hook management
2. Configure pre-commit hooks:
   - Run ESLint on staged files
   - Run Prettier on staged files
   - Run type-check on staged files
   - Validate commit message format (conventional commits)
3. Configure pre-push hooks:
   - Run full build
   - Run tests (if test suite exists)

**Effort**: Low (2-3 hours)
**Impact**: Medium (catches issues before commit)

#### 6.3 Image Optimization Enhancements

**Current Status (from IMAGE_OPTIMIZATION.md):**

- ✅ 129 total tree images, 109 optimized, 20 pending
- ✅ Sharp-based optimization with multiple formats (WebP, AVIF, JPEG)
- ✅ Automated weekly workflow
- ⚠️ Some images over performance budget

**Future Improvements:**

1. **Optimize Remaining 20 Images**
   - Run `npm run images:optimize` to process pending images
   - Verify all images meet performance targets

2. **Enhance Optimization Script**
   - Add automatic quality adjustment based on content (portraits vs landscapes)
   - Implement smart cropping for thumbnail generation
   - Add EXIF data preservation option
   - Generate multiple aspect ratios (16:9, 4:3, 1:1)

3. **Image Quality Validation**
   - Add visual regression testing for optimized images
   - Implement SSIM (Structural Similarity Index) checks
   - Alert on quality degradation

4. **CDN Integration**
   - Consider Cloudinary or Imgix for dynamic optimization
   - Implement automatic format negotiation based on browser support
   - Enable responsive image delivery with intelligent cropping

**Effort**: Low for remaining optimizations (1 hour), Medium for enhancements (1-2 weeks)
**Impact**: Medium (improved performance and image quality)

#### 6.4 Backup Code Verification (MFA)

**Current Status (from SECURITY_SETUP.md):**

- ⚠️ MFA TOTP implementation incomplete
- ❌ Backup code verification not implemented

**Implementation (after Priority 0.1 auth fixes):**

1. Generate 10 random backup codes on MFA enable
2. Hash backup codes before storage (Argon2id)
3. Allow one-time use of backup codes for login
4. Mark codes as used after successful authentication
5. Regenerate codes when requested by user
6. Provide secure download of backup codes (PDF or text)

**Files to Update:**

- `src/app/api/auth/mfa/enable/route.ts` - Generate backup codes
- `src/app/api/auth/[...nextauth]/route.ts` - Accept backup codes in login
- `src/app/[locale]/admin/users/mfa/page.tsx` - Display backup codes to user
- `prisma/schema.prisma` - Add BackupCode model (code_hash, used_at, user_id)

**Dependencies:**

- ✅ Requires Priority 0.1 (Auth fixes) to be complete

**Effort**: Low (2-3 days)
**Impact**: Medium (completes MFA implementation, critical for account recovery)

---

## Implementation Guidelines

### Content Quality Standards

1. **Research Requirements**:
   - Minimum 3 sources for botanical information
   - Cross-reference safety data with ASPCA, PubMed, scientific literature
   - Verify conservation status with IUCN Red List
   - Local verification for Costa Rica-specific details

2. **Bilingual Parity**:
   - All content must exist in both English and Spanish
   - Translations reviewed by native speakers
   - Scientific names remain in Latin (unchanged across languages)
   - Cultural context adapted for each language

3. **Image Standards**:
   - Minimum 5 images per species (habit, bark, leaves, flowers, fruit)
   - High resolution (minimum 1200px width)
   - Proper attribution and licensing
   - Optimization for web (WebP/AVIF formats)

### Technical Standards

1. **Code Quality**:
   - TypeScript strict mode
   - ESLint and Prettier for formatting
   - Zero build warnings tolerated
   - Conventional commits for version control

2. **Performance Targets**:
   - Lighthouse Performance score >90
   - LCP (Largest Contentful Paint) <2.5s
   - FID (First Input Delay) <100ms
   - CLS (Cumulative Layout Shift) <0.1

3. **Accessibility Requirements**:
   - WCAG 2.1 Level AA compliance
   - Keyboard navigation for all interactive elements
   - Screen reader compatibility
   - Color contrast ratio ≥4.5:1 for text

4. **Testing Requirements**:
   - Type check passes (`npm run type-check`)
   - Lint passes (`npm run lint`)
   - Build succeeds (`npm run build`)
   - Manual testing for new features

### Development Workflow

1. **Feature Development**:
   - Create feature branch from `main`
   - Implement with tests
   - Run full build and type check
   - Submit PR with clear description
   - Address code review feedback
   - Merge after approval

2. **Content Addition**:
   - Follow SPECIES_ADDITION_PROCESS.md
   - Use templates in `content/` directories
   - Verify build generates pages correctly
   - Check bilingual parity
   - Commit with descriptive message

3. **Documentation Updates**:
   - Update relevant docs when making changes
   - Keep IMPLEMENTATION_PLAN.md current
   - Archive completed work
   - Maintain clear commit history

---

## Quick Reference

### Key Documentation

| Document                                                               | Purpose                       |
| ---------------------------------------------------------------------- | ----------------------------- |
| [README.md](../README.md)                                              | Project overview, quick start |
| [CONTRIBUTING.md](../CONTRIBUTING.md)                                  | Development setup, workflow   |
| [AGENTS.md](../AGENTS.md)                                              | AI agent coding conventions   |
| [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md) | Content structure standards   |
| [SPECIES_ADDITION_PROCESS.md](./SPECIES_ADDITION_PROCESS.md)           | Adding new trees              |
| [IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md)                       | Image handling guide          |
| [IMAGE_REVIEW_SYSTEM.md](./IMAGE_REVIEW_SYSTEM.md)                     | Human-in-the-loop image QA    |
| [SAFETY_SYSTEM.md](./SAFETY_SYSTEM.md)                                 | Safety data guidelines        |
| [TESTING_RESULTS.md](./TESTING_RESULTS.md)                             | v1.0 testing results          |
| [MISSING_SPECIES_LIST.md](./MISSING_SPECIES_LIST.md)                   | Species to add                |

### Archived Documentation

| Document                                                         | Description                                        |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| [improvement-roadmap.md](./archive/improvement-roadmap.md)       | Detailed phase tracking (all 5 phases complete)    |
| [NEXT_STEPS.md](./archive/NEXT_STEPS.md)                         | External testing checklist (all verified complete) |
| [NEXT_AGENT_PERFORMANCE.md](./archive/NEXT_AGENT_PERFORMANCE.md) | Performance optimization handoff (complete)        |

See [docs/archive/README.md](./archive/README.md) for full archive index.

---

## Priority Decision Matrix

When deciding what to work on next, consider:

| Factor              | Weight | Notes                            |
| ------------------- | ------ | -------------------------------- |
| **User Impact**     | 40%    | How many users benefit?          |
| **Content Quality** | 25%    | Does it improve accuracy/depth?  |
| **Technical Debt**  | 20%    | Does it improve maintainability? |
| **Effort Required** | 15%    | Lower effort = higher priority   |

**Example:**

- Adding 10 new species: High user impact (40), high content quality (25), low tech debt (0), medium effort (10) = **Score: 75**
- API development: Medium impact (20), low content (5), high tech debt fix (20), high effort (5) = **Score: 50**

---

## Success Metrics

Track these metrics for future work:

1. **Content Coverage**:
   - Species count (target: 175+)
   - Care guidance coverage (target: 80%+)
   - Comparison guides (target: 20)
   - Glossary terms (target: 150+)

2. **User Engagement**:
   - Monthly active users
   - Average session duration
   - Pages per session
   - Returning visitor rate

3. **Performance**:
   - Lighthouse scores (maintain >90)
   - Core Web Vitals (maintain passing)
   - Build time (<5 minutes)
   - Page load time (<2s)

4. **Accessibility**:
   - axe DevTools violations (target: 0)
   - WCAG compliance level (maintain AA)
   - Screen reader compatibility

---

## Getting Started

Ready to contribute? Here's how to get started:

1. **Set up development environment**: Follow [CONTRIBUTING.md](../CONTRIBUTING.md)
2. **Pick a task**: Choose from Priority 1 or 2 above
3. **Review standards**: Read relevant documentation
4. **Implement**: Follow development workflow
5. **Test**: Verify quality standards
6. **Submit**: Create PR with clear description

---

## Questions?

- **Development setup**: See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Content questions**: See [CONTENT_STANDARDIZATION_GUIDE.md](./CONTENT_STANDARDIZATION_GUIDE.md)
- **Feature requests**: Open GitHub issue
- **Bug reports**: Open GitHub issue with reproduction steps

---

## Document Sources

This implementation plan consolidates unfinished work and future plans from:

- ✅ **SAFETY_SYSTEM.md** - Component verification tasks, safety filtering, dedicated safety page
- ✅ **SECURITY_SETUP.md** - Branch protection setup, MFA backup codes, pre-commit hooks
- ✅ **PERFORMANCE_OPTIMIZATION.md** - Phase 2 & 3 optimizations, performance budgets, monitoring
- ✅ **IMAGE_OPTIMIZATION.md** - Remaining 20 images, enhancement ideas, CDN integration
- ✅ **CONTENT_STANDARDIZATION_GUIDE.md** - Content audit refresh, 12 short pages to enhance
- ✅ **MISSING_SPECIES_LIST.md** - 40 unique species to add (already referenced in Priority 1.1)
- ✅ **IMAGE_REVIEW_SYSTEM.md** - Complete 3-layer architecture (already detailed in Priority 0.2)

All identified future work has been integrated into the 6 priority tracks above.

---

**Status:** 🚀 v1.0 Production Ready  
**Current Focus:** Priority 0 (Admin Auth + Image Review + Safety Verification)  
**Next Milestones:**

- Priority 1: Content Expansion (40 species, content audit)
- Priority 5: Performance Optimization (Lighthouse >90)
- Priority 6: Security Infrastructure (branch protection, hooks)

**Last Comprehensive Review:** 2026-01-19  
**Maintained By:** Costa Rica Tree Atlas Contributors
