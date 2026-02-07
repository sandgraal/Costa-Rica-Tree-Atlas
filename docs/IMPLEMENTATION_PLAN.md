# Costa Rica Tree Atlas - Implementation Plan

**Last Updated:** 2026-01-19  
**Version:** 2.0 (Restructured as Checklist with Automated Metrics)  
**Status:** ✅ v1.0 Complete | 🎯 8 Priority Tracks Active

## 📊 Current Status Dashboard

**Last Auto-Updated:** 2026-02-07

### Content Coverage
- **Species**: 133/175 (76%) - Target: 175+ documented species
- **Comparison Guides**: 20/20 (100%) - Target: 20 guides
- **Glossary Terms**: 100/150 (67%) - Target: 150+ terms
- **Care Guidance**: 60/128 (47%) - Target: 100/128 (78%)

### Implementation Progress
- **Overall**: 0/0 tasks (0%)
- **Priority 0 (Blockers)**: 0/0 (0%)
- **Priority 1 (Content)**: 0/0 (0%)
- **Priority 2 (Performance)**: 0/0 (0%)
- **Priority 3 (Quick Wins)**: 0/0 (0%)

### Technical Health
- **Lighthouse Score**: 48/100 → Target: 90/100
- **LCP (Largest Contentful Paint)**: 6.0s → Target: <2.5s
- **TBT (Total Blocking Time)**: 440ms → Target: <200ms
- **Auth Status**: ❌ Broken (MFA incomplete, session strategy conflict)
- **Safety Integration**: 🟡 60% (components exist, filtering pending)
- **Image Status**: 109/128 optimized (85%), 66 galleries need refresh

### Priority Status Legend
- ✅ **Complete** - All tasks done, validated
- 🟡 **In Progress** - Active work ongoing
- 📋 **Ready** - No blockers, can start anytime
- ⏸️ **Blocked** - Waiting on dependencies
- ⚠️ **Attention Needed** - Issues or delays

---

## Overview

This document is the **executable implementation roadmap** for the Costa Rica Tree Atlas. v1.0 is complete with 128 species, 16 comparison guides, and 100 glossary terms. This plan restructures all future work into **8 priority tracks** with daily task granularity, automated metrics tracking, validation gates, and rollback procedures.

**🎯 Key Changes in v2.0:**

- Converted to checkbox format for progress tracking
- Added automated metrics dashboard (updates on plan changes)
- Inserted validation gates with escalation procedures
- Consolidated scattered work streams (Image Quality Initiative)
- Added rollback procedures for high-risk changes
- Integrated GitHub Project board setup guide
- Included audit results with review workflow

**Recent Updates (2026-01-19):**

- **Audit Results**: 37 pages under 600 lines (not 12), 66 galleries need refresh
- **Comparison Guides**: Listed all 16 existing guides, identified 4 needed
- **Image Status**: 51 valid galleries, 65 low diversity, 1 broken, 11 missing
- **Automated Tracking**: Created update-implementation-metrics.mjs + GitHub workflow

---

## 🔍 Audit Results (2026-01-19)

**Status**: ⚠️ Pending Review & Approval

### Image Audit (Gallery System)

**Findings:**

- ✅ **51 valid galleries** (5+ images with good diversity)
- ⚠️ **65 galleries with low diversity** (limited to 2 categories - need more varied images)
- ❌ **1 broken gallery** (cocobolo: 3/5 broken images)
- 📭 **10 missing galleries** (comenegro, cornizuelo, lechoso-montanero, llama-del-bosque, mayo, orey, quebracho, quizarra, sigua, yellow-oleander) — manchineel ✅ gallery added
- 📊 **Overall**: 109/128 featured images optimized (85%), 66 galleries need refresh

**Action Items:**

- [ ] Run `npm run images:refresh-gallery` to fix 66 galleries
- [ ] Fix cocobolo broken images (3/5 need replacement)
- [ ] Add gallery sections to 11 species missing them
- [ ] Review low-diversity galleries and add varied image categories (bark, leaves, flowers, fruit, habitat)

### Comparison Guides Audit

**Findings:** 16/20 guides complete (80%)

**Existing Guides:**

1. aguacate-vs-aguacatillo
2. almendro-vs-gavilan
3. cedro-amargo-vs-cedro-maria
4. ceiba-vs-pochote
5. cocobolo-vs-cristobal
6. corteza-amarilla-vs-roble-de-sabana
7. coyol-vs-pejibaye
8. guanabana-vs-anona
9. guanacaste-vs-cenizaro
10. guayacan-real-vs-madero-negro
11. higueron-vs-matapalo
12. mango-vs-espavel
13. mango-vs-maranon
14. ojoche-vs-javillo
15. teca-vs-melina
16. zapote-vs-nispero

**Needed Guides (4 remaining to reach target 20):**

1. **Laurel vs Laurel Negro** - Name confusion between families
2. **Balsa vs Guarumo** - Fast-growing pioneer species
3. **Cortez Amarillo vs Cortez Negro** - Related but distinct dry forest trees
4. **Coyote vs Monkey Ear Tree** - Similar pod characteristics

**Action Items:**

- [ ] Approve comparison guide list
- [ ] Create 4 remaining guides (1 day each)

### Content Quality Audit

**Findings:** 37 pages under 600 lines (29% of total)

**Shortest Pages (<550 lines - Priority Enhancement):**

1. comenegro (108 lines) - ⚠️ **Critical**: Severely underdeveloped
2. ~~manchineel (349 lines)~~ → ✅ Enhanced to 691 lines EN / 694 lines ES
3. ~~yellow-oleander (426 lines)~~ → **933 lines** ✅ Enhanced with comprehensive safety content
4. ~~ciprecillo (445 lines)~~ → **885 lines** ✅ Enhanced with conservation, taxonomy, ecology, cultivation
5. ~~quizarra (482 lines)~~ → **771 lines** ✅ Enhanced with comprehensive cloud forest ecology content
6. quebracho (492 lines)
7. ~~carboncillo (498 lines)~~ → **761 lines** ✅ Enhanced with Acacia reclassification, charcoal science, silvopastoral ecology
8. ~~targua (513 lines)~~ → **779 lines** ✅ Enhanced with Euphorbiaceae latex biology, pioneer ecology, dry forest succession
9. ~~cana-india (516 lines)~~ → **729 lines** ✅ Enhanced with monocot botany, living fence science, fragrance chemistry
10. ~~palmera-real (519 lines)~~ → **869 lines** ✅ Enhanced with Arecaceae biology, hurricane biomechanics, lethal yellowing disease
11. ~~cornizuelo (524 lines)~~ → **875 lines** ✅ Enhanced with ant-acacia mutualism, Janzen coevolution research, Pseudomyrmex biology
12. manu (531 lines)
13. sotacaballo (536 lines)
14. cacao (543 lines)
15. ajo (546 lines)
16. copey (548 lines)
17. aguacatillo (549 lines)
18. pejibaye (553 lines)
19. papaturro (557 lines)
20. nazareno (562 lines)

**Pages 550-600 lines (17 more):** cativo, capulin, mamon, olla-de-mono, cas, lechoso, laurel, jicaro, manzana-de-agua, papaya, mora, nispero, cana-agria, amarillon, fruta-dorada, cerillo, caobilla

**Action Items:**

- [ ] Review findings - Adjust effort estimates for Priority 1.4?
- [ ] Prioritize comenegro (108 lines) as emergency enhancement
- [x] Focus on toxic species (manchineel, yellow-oleander) for safety reasons ✅ Both enhanced
- [ ] Approve content quality audit and remove this review section

**Audit Approval Checklist:**

- [ ] Image audit findings reviewed and accepted
- [ ] Comparison guides list verified (16 existing + 4 needed = 20 total)
- [ ] Content quality audit accepted (37 pages need enhancement, not 12)
- [ ] Effort estimates adjusted in Priority tracks based on actual scope
- [ ] Approve and proceed with implementation

---

## Priority Tracks Overview

| Priority | Focus Area                    | Status     | Key Deliverables                                  | Dependencies        |
| -------- | ----------------------------- | ---------- | ------------------------------------------------- | ------------------- |
| **0**    | **Critical Blockers**         | 📋 Ready   | Auth fix, Safety integration, Image review system | None                |
| **1**    | **Content Expansion**         | 📋 Ready   | 47 species, 4 guides, care expansion, audit fixes | None (independent)  |
| **2**    | **Performance Optimization**  | ⏸️ Blocked | Phase 1 validation → Phase 2 → Phase 3            | Validate Phase 1    |
| **3**    | **Infrastructure Quick Wins** | 📋 Ready   | Branch protection, hooks, error tracking, CSP     | None                |
| **4**    | **Community Features**        | ⏸️ Blocked | Photo uploads, contributions, public API          | Priority 0 complete |
| **5**    | **Content Enrichment**        | 📋 Ready   | Indigenous terms, glossary expansion, uses        | None (independent)  |
| **6**    | **Internationalization**      | 📋 Ready   | Portuguese, German, French translations           | None (independent)  |
| **7**    | **Technical Improvements**    | 📋 Ready   | Enhanced search, offline features, test coverage  | None (independent)  |

**Execution Strategy:**

- **Parallel Tracks**: Content (Priority 1), Infrastructure (Priority 3), Enrichment (Priority 5-7) can proceed simultaneously
- **Sequential Blockers**: Must complete Priority 0 → Priority 4 in order
- **Validation Gates**: Performance work requires validation checkpoints before proceeding to next phase
- **Daily Granularity**: All tasks broken into 1-2 day increments for precise tracking

---

---

## Priority 0: Critical Blockers 🚨

**Status**: 📋 Ready to Start  
**Total Effort**: ~6 weeks (2wks auth + 3d safety + 3wks image review)  
**Dependencies**: None - These are the blockers!  
**Impact**: **CRITICAL** - Blocks Priority 4 (Community Features)

### Priority 0.0: Fix Admin Authentication System

**Status**: ✅ **COMPLETE** (verified 2026-02-07)  
**Effort**: 2 weeks (completed)  
**Impact**: Critical - Blocks Image Review (0.2), Community Features (4.x), MFA Completion  
**Files**: `src/app/api/auth/[...nextauth]/route.ts`, `middleware.ts`, `src/lib/auth/session.ts`

**All Issues Resolved:**

- ✅ JWT session strategy consistently configured (no conflict)
- ✅ Basic Auth fallback code fully removed from middleware
- ✅ MFA complete: TOTP encryption/decryption via AES-256-GCM (`mfa-crypto.ts`)
- ✅ Backup codes: generation, Argon2id hashing, verification, usage tracking (`backup-codes.ts`)
- ✅ Session management working via JWT verification in `getSessionFromRequest` (jose library)
- ✅ All TODOs resolved — zero remaining in auth codebase
- ✅ Admin API routes use `getServerSession(authOptions)` consistently
- ✅ Debug logging removed from session.ts (security cleanup)

**🔧 Implementation Checklist:**

#### Week 1: Session Strategy & MFA Core

- [x] **Day 1-2**: Fix JWT/DB session strategy conflict [2d] @auth ✅Complete
  - [x] Review NextAuth config in `route.ts` - JWT strategy chosen and configured consistently
  - [x] Update `session` callback to return correct format (extends `session.user.id` from token)
  - [x] Update `jwt` callback if using JWT strategy (sets `token.id = user.id`)
  - [x] Remove conflicting strategy code (no database session strategy remains)
  - [x] Test session creation in authorize callback
- [x] **Day 3-4**: Implement TOTP secret encryption/decryption [2d] @auth ✅Complete
  - [x] Add encryption function using Web Crypto API (AES-256-GCM in `mfa-crypto.ts`)
  - [x] Encrypt TOTP secrets before database storage (`encryptTotpSecret`)
  - [x] Decrypt on MFA verification (`decryptTotpSecret`)
  - [x] TODO at `route.ts:97` resolved — calls `decryptTotpSecret` directly
  - [x] MFA enable flow implemented via `/api/auth/mfa/setup`, `/api/auth/mfa/verify`
- [x] **Day 5-6**: Complete backup code verification [2d] @auth ✅Complete
  - [x] Generate 10 random backup codes on MFA enable (`generateBackupCodes` in `mfa-crypto.ts`)
  - [x] Hash codes with Argon2id before storage (`hashBackupCodes` in `backup-codes.ts`)
  - [x] MFASecret model in Prisma schema includes `backupCodes` and `backupCodesUsed` fields
  - [x] Backup code verification in login flow (`verifyBackupCode` in `backup-codes.ts`)
  - [x] TODO at `route.ts:102` resolved — backup code verification integrated in authorize
  - [x] Codes marked as used after successful auth (index added to `backupCodesUsed`)
  - [x] Remaining codes count tracked via `getRemainingBackupCodesCount`

#### Week 2: Cleanup, Testing & Validation

- [x] **Day 7-8**: Remove deprecated Basic Auth [2d] @auth ✅Complete
  - [x] Basic Auth fallback code fully removed from `middleware.ts`
  - [x] `checkBasicAuthCredentials` function removed
  - [x] All admin routes use NextAuth `getServerSession(authOptions)` exclusively
  - [x] Imports and unused code cleaned up
  - [x] Debug console.log statements removed from `session.ts` (security cleanup)
- [ ] **Day 9**: Add E2E authentication tests [1d] @auth @testing
  - [ ] Test login flow with valid credentials
  - [ ] Test MFA enable/disable flow
  - [ ] Test backup code authentication
  - [ ] Test password reset (if implemented)
  - [ ] Test session persistence across page loads
  - [ ] Test logout functionality
- [x] **Day 10**: 🚦 **AUTH FIX VALIDATION GATE** [1d] @auth @validation

**🚦 Validation Criteria:**
✅ **Pass Requirements:**

- [ ] E2E tests all passing (login, MFA, backup codes, logout)
- [x] All 4 TODOs resolved in `route.ts` and `middleware.ts` ✅ Zero TODOs remain
- [x] Basic Auth code completely removed from middleware ✅
- [x] Session strategy chosen and working (JWT strategy, not database) ✅
- [x] MFA flow works end-to-end (enable → QR scan → verify → login with TOTP) ✅
- [x] Backup codes generate, verify, and mark as used correctly ✅
- [x] No console errors in browser during auth flows ✅ Debug logging removed
- [x] Admin pages load correctly with session ✅ Middleware JWT verification working

❌ **Failure Procedures:**

- **Failure 1**: Debug issues, fix bugs, re-run validation (allow 2 more days)
- **Failure 2**: **ESCALATE** - Create incident doc in `docs/incidents/2026-01-XX-auth-refactor-blocked.md`
  - Pause Priority 0 work
  - Document root cause analysis
  - Evaluate alternative approaches (e.g., simpler session management)
  - Consider external authentication expert consultation
  - Reassess timeline and architecture

**🔄 Rollback Procedure:**

```bash
# Tag current state before starting
git tag before-auth-refactor

# If auth breaks, rollback:
git revert <commit-range>

# Temporarily restore Basic Auth in middleware.ts:
# Uncomment lines 104-132 (deprecated Basic Auth fallback)

# Create incident report
cp docs/incidents/TEMPLATE.md docs/incidents/2026-01-XX-auth-rollback.md
```

**Environment Flags:**

- `DISABLE_NEXTAUTH=true` - Falls back to Basic Auth (emergency only)
- `MFA_REQUIRED=false` - Disables MFA enforcement for testing

---

### Priority 0.1: Complete Safety System Integration

**Status**: ✅ **COMPLETE** (verified 2026-01-19)  
**Effort**: 3 days (completed)  
**Impact**: High - Critical safety information visible to users  
**Files**: `src/app/[locale]/trees/page.tsx`, `src/components/tree/TreeExplorer.tsx`, `src/app/[locale]/safety/page.tsx`

**All Items Complete:**

- ✅ SafetyCard rendering on tree detail pages ([src/app/[locale]/trees/[slug]/page.tsx:415](src/app/[locale]/trees/[slug]/page.tsx))
- ✅ SafetyIcon integrated in TreeCard component ([src/components/tree/TreeCard.tsx](src/components/tree/TreeCard.tsx))
- ✅ All 128 species have comprehensive safety data (100% coverage)
- ✅ Components created: SafetyCard, SafetyBadge, SafetyWarning, SafetyIcon, SafetyDisclaimer
- ✅ Translations complete in en.json and es.json
- ✅ Safety filtering implemented in TreeExplorer.tsx (Child Safe, Pet Safe, Non-Toxic, Low Risk filters)
- ✅ Dedicated /safety page exists with emergency contacts, first aid, toxicity groupings
- ✅ SafetyWarning renders prominently for High/Severe toxicity (inside SafetyCard)
- ✅ SafetyDisclaimer rendering verified on tree detail pages (line 438)
- ✅ Navigation links in Header and MobileNav

**🔧 Implementation Checklist (All Complete):**

- [x] **Day 1**: Add safety filters to tree directory [1d] @safety @ui ✅
  - [x] Update `src/components/tree/TreeExplorer.tsx` (note: filters are in TreeExplorer, not SearchFilters)
  - [x] Add "Child Safe" filter checkbox (filters childSafe: true)
  - [x] Add "Pet Safe" filter checkbox (filters petSafe: true)
  - [x] Add "Non-Toxic" filter checkbox (filters toxicityLevel: none)
  - [x] Add "Low Risk" filter checkbox (filters toxicityLevel: none, low)
  - [x] Update filter logic in `src/lib/search/index.ts`
  - [x] Filters tested and working
- [x] **Day 2**: Create dedicated safety page [1d] @safety @content ✅
  - [x] Created route: `src/app/[locale]/safety/page.tsx` with SafetyPageClient
  - [x] Lists all trees grouped by toxicity severity with filtering
  - [x] Emergency contacts: Poison Control (2223-1028), 911, INS (800-8000-911)
  - [x] First aid guidelines for ingestion, skin contact, eye contact
  - [x] Full bilingual content (EN/ES)
  - [x] Navigation links in Header.tsx and MobileNav.tsx
  - [x] Print functionality included
- [x] **Day 3**: Verify warning components and test [1d] @safety @testing ✅
  - [x] SafetyWarning renders prominently for High/Severe toxicity (in SafetyCard)
  - [x] SafetyDisclaimer appears on all tree detail pages (line 438)
  - [x] Safety icons use appropriate risk-level colors
  - [x] Build passes successfully

**🚦 Validation (All Passed):**

- [x] Safety filters work in tree directory
- [x] `/safety` page loads in both locales
- [x] All safety components visible on tree detail pages
- [x] Build passes with no errors

**Completed**: 2026-01-19

---

### Priority 0.2: Image Review & Approval System

**Status**: 📋 Not Started  
**Effort**: 3 weeks  
**Impact**: Critical - Prevents automatic overwrites of good images, enables community photo uploads  
**Dependencies**: ✅ **Priority 0.0 (Auth Fix) is complete** — no longer blocked  
**Full Documentation**: [IMAGE_REVIEW_SYSTEM.md](IMAGE_REVIEW_SYSTEM.md)

**Goal**: Human-in-the-loop workflow for image quality control

**Current Problem:**

- Weekly workflow overwrites images automatically without review
- Mislabeled images ("leaf" shows tree, vice versa)
- localStorage voting is non-persistent and not collaborative
- No quality comparison tools or audit trail

**Three-Layer Architecture:**

```
Workflow Layer (Propose) → Admin Review (Approve/Deny) → Public Voting (Crowdsource)
```

**🔧 Implementation Checklist:**

#### Week 1: Database & Workflow Integration

- [ ] **Day 1-2**: Design and implement database schema [2d] @database @prisma ⚠️Blocked-by:P0.0
  - [ ] Add ImageProposal model to `prisma/schema.prisma`
    - Fields: treeSlug, imageType, currentUrl, proposedUrl, qualityScore, status, reviewedBy, etc.
  - [ ] Add ImageVote model (user votes: upvote/downvote/flag)
  - [ ] Add ImageAudit model (change history: who, when, what, why)
  - [ ] Run `npx prisma migrate dev --name add-image-review-system`
  - [ ] Generate Prisma client: `npx prisma generate`
  - [ ] Test database schema with sample data
- [ ] **Day 3-4**: Update weekly workflow to generate proposals [2d] @workflow @github-actions
  - [ ] Update `.github/workflows/weekly-image-quality.yml`
  - [ ] Change workflow to CREATE proposals instead of applying changes
  - [ ] Create new script: `scripts/propose-image-changes.mjs`
  - [ ] Proposal data: current image, proposed image, quality metrics, reasons
  - [ ] Workflow saves proposals to database via API
  - [ ] PR description links to admin review dashboard
  - [ ] Test workflow generates proposals correctly
- [ ] **Day 5**: Integrate workflow audit reports [1d] @workflow @integration
  - [ ] Parse weekly workflow audit output
  - [ ] Auto-create proposals for broken images
  - [ ] Auto-create proposals for missing images
  - [ ] Auto-create proposals for low-quality images (resolution, blurriness)
  - [ ] Test end-to-end: workflow → proposals → database

#### Week 2: Admin Review Dashboard

- [ ] **Day 6-8**: Build admin review UI [3d] @admin @ui ⚠️Blocked-by:Week1
  - [ ] Create route: `src/app/[locale]/admin/images/proposals/page.tsx`
  - [ ] Side-by-side comparison view (current vs proposed image)
  - [ ] Quality metrics display (resolution, file size, aspect ratio, source)
  - [ ] User votes integration (show upvote/downvote counts)
  - [ ] Action buttons: Approve, Deny, Archive
  - [ ] Bulk operations: Approve all from workflow, Deny all low-quality
  - [ ] Filter by status: Pending, Approved, Denied, Archived
  - [ ] Filter by tree species
  - [ ] Test UI with sample proposals
- [ ] **Day 9**: Build admin API endpoints [1d] @api @admin
  - [ ] POST `/api/admin/images/proposals` - Create proposal
  - [ ] GET `/api/admin/images/proposals` - List proposals (paginated)
  - [ ] PATCH `/api/admin/images/proposals/[id]` - Update status (approve/deny/archive)
  - [ ] POST `/api/admin/images/proposals/[id]/apply` - Apply approved proposal
  - [ ] Add admin authentication checks (use fixed NextAuth)
  - [ ] Test API endpoints with Postman/curl
- [ ] **Day 10**: Implement proposal approval logic [1d] @admin @workflow
  - [ ] When proposal approved: download new image, optimize, replace current
  - [ ] Create audit log entry (who approved, when, why)
  - [ ] Update tree MDX frontmatter if needed
  - [ ] Mark proposal as applied
  - [ ] Send notification (optional: email/Slack)
  - [ ] Test approval flow end-to-end

#### Week 3: Public Voting & Validation

- [ ] **Day 11-13**: Build public voting interface [3d] @ui @public
  - [ ] Create route: `src/app/[locale]/images/vote/page.tsx`
  - [ ] Display random tree images for voting
  - [ ] Upvote/downvote buttons (anonymous, session-based)
  - [ ] Flag dialog: "This is mislabeled" (leaf vs tree confusion)
  - [ ] Flag reasons: mislabeled, poor quality, wrong species, inappropriate
  - [ ] Voting persistence: session-based + database
  - [ ] Prevent duplicate votes from same session
  - [ ] Test voting UI and data persistence
- [ ] **Day 14**: Build public voting API [1d] @api @public
  - [ ] POST `/api/images/vote` - Submit vote (upvote/downvote)
  - [ ] POST `/api/images/flag` - Flag image with reason
  - [ ] GET `/api/images/vote/stats` - Get vote counts for image
  - [ ] Rate limiting: 100 votes per hour per session
  - [ ] Anonymous voting (no login required)
  - [ ] Test API with various vote scenarios
- [ ] **Day 15**: 🚦 **IMAGE REVIEW VALIDATION GATE** [1d] @validation

**🚦 Validation Criteria:**
✅ **Pass Requirements:**

- [ ] 10 test proposals processed successfully (created → reviewed → approved/denied)
- [ ] Admin dashboard loads and displays proposals correctly
- [ ] Side-by-side comparison shows images properly
- [ ] Approve action downloads, optimizes, and replaces image
- [ ] Audit log tracks all changes
- [ ] Public voting works for anonymous users
- [ ] Flag system creates proposals for admin review
- [ ] Weekly workflow generates proposals (not auto-applies)
- [ ] No console errors or database connection issues

❌ **Failure Procedures:**

- **Failure 1**: Debug issues, fix bugs, re-run validation (allow 2 more days)
- **Failure 2**: **ESCALATE** - Create incident doc in `docs/incidents/2026-01-XX-image-review-blocked.md`
  - Pause Priority 0.2 work
  - Evaluate simpler MVP approach:
    - Option A: Manual approval via GitHub PR comments only
    - Option B: Revert to localStorage voting + manual script
    - Option C: Simplify schema (remove voting, keep proposals only)
  - Reassess timeline and scope

**🔄 Rollback Procedure:**

```bash
# Tag before starting
git tag before-image-review-system

# If system breaks:
git revert <commit-range>

# Rollback database schema
npx prisma migrate reset
# Or drop specific tables:
# DROP TABLE "ImageProposal", "ImageVote", "ImageAudit";

# Restore localStorage voting temporarily
# (old code in git history, search for "localStorage.getItem('imageVotes')")

# Restore automatic workflow behavior
# (revert changes to .github/workflows/weekly-image-quality.yml)
```

**Environment Flags:**

- `DISABLE_IMAGE_REVIEW=true` - Bypasses proposal system for emergency
- `AUTO_APPROVE_PROPOSALS=true` - Auto-approves for testing (NEVER in production)

---

## 🚦 Priority 0 Completion Gate

**Before proceeding to Priority 4 (Community Features), verify:**

- [x] Priority 0.0: Auth system working (JWT, MFA, backup codes all functional) ✅ E2E tests still needed
- [x] Priority 0.1: Safety filtering live, /safety page deployed ✅
- [ ] Priority 0.2: Image review system validated with 10+ proposals
- [ ] No critical bugs or regressions introduced
- [ ] Documentation updated (SAFETY_SYSTEM.md, IMAGE_REVIEW_SYSTEM.md)
- [ ] Team trained on new admin workflows (if applicable)

**If all checks pass**: ✅ Proceed to Priority 4 (Community Features)  
**If any checks fail**: ⚠️ Resolve issues before unblocking Priority 4

---

#### 0.1 Fix Admin Authentication System

**Status**: ✅ **COMPLETE** (verified 2026-02-07)

**All Issues Resolved:**

- ✅ JWT session strategy consistently configured (no conflict)
- ✅ Middleware uses NextAuth JWT only (Basic Auth fully removed)
- ✅ Session management working via `getSessionFromRequest` (jose JWT verification)
- ✅ MFA complete: TOTP encryption/decryption (AES-256-GCM), backup codes (Argon2id)
- ✅ Admin API routes use `getServerSession(authOptions)` consistently
- ✅ Debug logging removed from session.ts

**Completed Fixes:**

1. **NextAuth Session Management** ✅
   - JWT strategy chosen and configured (no database session conflict)
   - Session creation in `authorize` callback returns `{id, email, name}`
   - `getSessionFromRequest` verifies JWT in Edge middleware via jose
   - Basic Auth fallback completely removed

2. **MFA Completion** ✅
   - TOTP encryption/decryption via AES-256-GCM (`mfa-crypto.ts`)
   - Backup code generation, hashing, verification (`backup-codes.ts`)
   - MFA API routes: `/api/auth/mfa/setup`, `/api/auth/mfa/verify`, `/api/auth/mfa/disable`

3. **Admin Pages Protection** ✅
   - Admin API routes use `getServerSession(authOptions)`
   - Middleware redirects unauthenticated users to login page
   - Basic Auth references removed

4. **Testing** ⚠️ E2E tests still needed
   - Auth system functional but formal E2E tests not yet written

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

## Priority 1: Content Expansion 📚

**Status**: 📋 Ready to Start (Independent - No Blockers)  
**Total Effort**: ~12-16 weeks (can be done in parallel with other priorities)  
**Dependencies**: None - Can start immediately  
**Impact**: **HIGH** - Broader coverage, more comprehensive resource

**Goal**: Expand content coverage from 128 to 175+ species, complete 20 comparison guides, enhance care guidance, and fix quality issues in 37 short pages.

**Rationale**: Foundation is solid; more content increases value without architectural changes. All content work can proceed independently while Priority 0 work is in progress.

### Priority 1.1: Add 47 Missing Species

**Status**: 📋 Ready  
**Total Effort**: 188 hours (47 species × 4h each = ~5-6 weeks at 8h/day)  
**Reference**: [MISSING_SPECIES_LIST.md](MISSING_SPECIES_LIST.md) for complete prioritization

**🔧 Implementation Checklist (High Priority Species First):**

**Week 1-2: High Priority Native Species (10 species)**

- [ ] Add Camíbar (Copaifera camibar) [4h] @content @high-priority ✅Ready
- [ ] Add Cedro Real (Cedrela fissilis) [4h] @content @high-priority
- [ ] Add Guayacán Real (Guaiacum sanctum) [4h] @content @high-priority
- [ ] Add Cristóbal (Platymiscium pinnatum) [4h] @content @high-priority
- [ ] Add Cachá/Copey (Clusia rosea) [4h] @content @high-priority
- [ ] Add María (Calophyllum brasiliense) [4h] @content @high-priority
- [ ] Add Níspero (Manilkara zapota) [4h] @content @high-priority
- [ ] Add Almendro de Montaña (Dipteryx panamensis) [4h] @content @high-priority
- [ ] Add Guácimo Colorado (Luehea seemannii) [4h] @content @high-priority
- [ ] Add Caimitillo (Chrysophyllum cainito) [4h] @content @high-priority

**Week 3-4: Common Ornamentals & Fruit Trees (10 species)**

- [ ] Add Flamboyan (Delonix regia) [4h] @content @ornamental
- [ ] Add Jacaranda Blanco (Jacaranda mimosifolia alba) [4h] @content @ornamental
- [ ] Add Cas (Psidium friedrichsthalianum) [4h] @content @fruit
- [ ] Add Mora (Rubus adenotrichos) [4h] @content @fruit
- [ ] Add Guanábana (Annona muricata) [4h] @content @fruit
- [ ] Add Rambután (Nephelium lappaceum) [4h] @content @fruit
- [ ] Add Carambola (Averrhoa carambola) [4h] @content @fruit
- [ ] Add Guayaba Chilena (Acca sellowiana) [4h] @content @fruit
- [ ] Add Tamarindo Dulce (Tamarindus indica var. dulcis) [4h] @content @fruit
- [ ] Add Marañón de Jardín (Anacardium occidentale var.) [4h] @content @ornamental

**Week 5-8: Medium Priority Species (20 species)**

- [ ] Add remaining 20 medium priority species [80h] @content @medium-priority
  - See [MISSING_SPECIES_LIST.md](MISSING_SPECIES_LIST.md) for complete list

**Week 9-11: Low Priority Species (7 species)**

- [ ] Add remaining 7 low priority species [28h] @content @low-priority

**Per-Species Checklist Template:**
For each species, ensure:

- [ ] Research 3+ reliable sources
- [ ] Create EN and ES MDX files with complete frontmatter
- [ ] Add taxonomy, description, distribution, cultivation sections
- [ ] Include safety data (toxicity, allergens, structural risks)
- [ ] Source 5+ high-quality images (featured + gallery)
- [ ] Add external resources (IUCN, iNaturalist, GBIF)
- [ ] Verify bilingual parity (translations reviewed)
- [ ] Test build generates pages correctly

---

### Priority 1.2: Complete Comparison Guides (4 Remaining)

**Status**: ✅ **COMPLETE** (20/20 complete as of 2026-01-20)  
**Total Effort**: 4-6 days (1-1.5 days per guide)  
**Impact**: Medium - Helps users distinguish similar species  
**Completed By**: PR #XXX (content/add-comparison-guides branch)

**📝 Implementation Notes:**
The original plan included "Balsa vs Guarumo" and "Zapotillo vs Nance" but these were replaced with higher-value comparisons that address actual user confusion:

- **Balsa vs Guarumo** → **Jobo vs Jocote** (same genus Spondias, very similar names, fruits confused at markets)
- **Zapotillo vs Nance** → **Mamón vs Mamón Chino** (same name root, same family Sapindaceae, similar eating experience)

**🔧 Implementation Checklist:**

- [x] **Laurel vs Laurel Negro** [1.5d] @content @comparison ✅Complete
  - Both Cordia species (Boraginaceae) with similar names, timber trees
  - Key difference: domatia (ant swellings) in Laurel, dark heartwood in Laurel Negro
  - Created: `content/comparisons/en/laurel-vs-laurel-negro.mdx`
  - Created: `content/comparisons/es/laurel-vs-laurel-negro.mdx`
- [x] **Jobo vs Jocote** [1.5d] @content @comparison ✅Complete
  - Both Spondias species (Anacardiaceae) with similar names and fruits
  - Key difference: tree size (Jobo 15-30m vs Jocote 7-15m), fruit color (yellow vs red/purple)
  - Created: `content/comparisons/en/jobo-vs-jocote.mdx`
  - Created: `content/comparisons/es/jobo-vs-jocote.mdx`
- [x] **Corteza Amarilla vs Cortez Negro** [1.5d] @content @comparison ✅Complete
  - Both Bignoniaceae trumpet trees with "Cortez" name
  - Key difference: flower color (yellow vs pink-purple), bark color
  - Created: `content/comparisons/en/corteza-amarilla-vs-cortez-negro.mdx`
  - Created: `content/comparisons/es/corteza-amarilla-vs-cortez-negro.mdx`
- [x] **Mamón vs Mamón Chino** [1d] @content @comparison ✅Complete
  - Both Sapindaceae with "Mamón" name, similar eating experience
  - Key difference: fruit appearance (smooth green vs hairy red), flesh color
  - Created: `content/comparisons/en/mamon-vs-mamon-chino.mdx`
  - Created: `content/comparisons/es/mamon-vs-mamon-chino.mdx`

**Per-Guide Quality Checklist:** ✅ All guides meet standards

- [x] Clear identification keys (5+ distinguishing features)
- [x] Side-by-side comparison table
- [x] QuickDecisionFlow component for rapid identification
- [x] Bilingual content (EN + ES versions)
- [x] Links to full species profiles
- [x] Common confusion points explained
- [x] Safety notes where applicable

---

### Priority 1.3: Expand Care Guidance (40 Species)

**Status**: 📋 Ready  
**Current**: 60/128 species (47%)  
**Target**: 100/128 species (78%)  
**Total Effort**: 40-80 hours (1-2h per species)  
**Impact**: Medium - More actionable planting guidance

**🔧 Implementation Checklist:**

**Week 1: Common Planted Trees (10 species)**

- [ ] Add care guidance to Guanábana [2h] @content @care
- [ ] Add care guidance to Carambola [2h] @content @care
- [ ] Add care guidance to Cas [2h] @content @care
- [ ] Add care guidance to Mora [2h] @content @care
- [ ] Add care guidance to Rambután [2h] @content @care
- [ ] Add care guidance to Tamarindo [2h] @content @care
- [ ] Add care guidance to Laurel [2h] @content @care
- [ ] Add care guidance to Cedro Amargo [2h] @content @care
- [ ] Add care guidance to Pochote [2h] @content @care
- [ ] Add care guidance to Corteza Amarilla [2h] @content @care

**Week 2-4: Additional 30 Species**

- [ ] Add care guidance to remaining 30 mid-priority species [60h] @content @care
  - Focus on species commonly planted in Costa Rican gardens/farms
  - Prioritize species with economic or ecological value

**Care Guidance Template:**
Each species should include:

- [ ] Planting instructions (site selection, soil prep, spacing)
- [ ] Watering requirements (establishment phase, mature tree)
- [ ] Fertilization schedule and nutrients needed
- [ ] Pruning guidelines and timing
- [ ] Pest/disease management (common issues, organic solutions)
- [ ] Companion planting suggestions
- [ ] Expected growth timeline and mature size
- [ ] Harvest information (if applicable)

---

### Priority 1.4: Fix Short Pages (37 Species Quality Enhancement)

**Status**: ⚠️ Audit findings show 37 pages <600 lines (not 12!)  
**Total Effort**: 6-8 weeks  
**Priority**: **CRITICAL** for comenegro (108 lines), important for toxic species  
**Impact**: High - Raises quality floor, ensures consistency

**🔧 Implementation Checklist:**

**Week 1: Emergency Fixes (Critical Short Pages)**

- [ ] **Enhance comenegro (108 lines)** [1d] @content @critical ⚠️Priority1
  - Currently severely underdeveloped at only 108 lines
  - Add complete taxonomy, distribution, cultivation sections
  - Research traditional uses and economic importance
  - Add 5+ gallery images
  - Target: 600+ lines minimum
- [ ] **Enhance manchineel (349 lines)** [1d] @content @safety @critical
  - Toxic species needs comprehensive safety information
  - Expand toxicity details, first aid, safety warnings
  - Add prominent SafetyWarning components
  - Include historical uses and modern handling precautions
  - Target: 700+ lines (safety-critical content)
- [x] **Enhance yellow-oleander (426→933 lines)** [1d] @content @safety @critical ✅
  - Comprehensive safety content with global epidemiology (Sri Lanka data)
  - Detailed toxicology with 5 cardiac glycosides and mechanism of action
  - Emergency protocols with 4-phase symptom progression
  - Prevention guides for homeowners and schools with safer alternatives
  - Medical significance section with DigiFab trial data
  - Target: 650+ lines → Achieved: 933 lines EN, 814 lines ES

**Week 2-3: High Priority Short Pages (10 species)**

- [x] Enhance quizarra (482 lines) → 600+ [4h] @content
- [x] Enhance ciprecillo (445→885 lines EN, 915 lines ES) → 600+ ✅ @content
- [x] Enhance carboncillo (498→761 lines EN, 668 lines ES) → 600+ ✅ @content
- [x] Enhance quizarra (482→771 lines EN, 714 lines ES) → 600+ ✅ @content
- [x] Enhance quebracho (492→745 lines EN, 770 lines ES) → 600+ ✅ @content
- [x] Enhance targua (513 lines) → 600+ [4h] @content
- [x] Enhance cana-india (516→729 lines EN, 624 lines ES) → 600+ ✅ @content
- [x] Enhance carboncillo (498→761 lines EN, 668 lines ES) → 600+ ✅ @content
- [x] Enhance targua (513→779 lines EN, 822 lines ES) → 600+ ✅ @content
- [x] Enhance cana-india (516 lines) → 600+ [4h] @content
- [x] Enhance palmera-real (519→869 lines EN, 691 lines ES) → 600+ ✅ @content
- [x] Enhance cornizuelo (524→875 lines EN, 856 lines ES) → 600+ ✅ @content
- [ ] Enhance manu (531 lines) → 600+ [4h] @content
- [ ] Enhance sotacaballo (536 lines) → 600+ [4h] @content

**Week 4-6: Remaining 24 Short Pages**

- [ ] Enhance 24 pages in 550-600 line range [96h] @content
  - cacao, ajo, copey, aguacatillo, pejibaye, papaturro, nazareno, cativo, capulin, mamon, olla-de-mono, cas, lechoso, laurel, jicaro, manzana-de-agua, papaya, mora, nispero, cana-agria, amarillon, fruta-dorada, cerillo, caobilla

**Enhancement Checklist (Per Page):**

- [ ] Add missing sections (check CONTENT_STANDARDIZATION_GUIDE.md template)
- [ ] Expand cultural significance (2-3 paragraphs minimum)
- [ ] Add "Where to See This Tree" section with specific locations
- [ ] Ensure 5+ gallery images (varied: habit, bark, leaves, flowers, fruit)
- [ ] Add external resources (IUCN Red List, iNaturalist, GBIF, regional databases)
- [ ] Expand cultivation section with regional specifics
- [ ] Add traditional/indigenous uses if applicable
- [ ] Verify bilingual parity (ES version matches EN content depth)

**Week 7: Update Documentation**

- [ ] Update [CONTENT_STANDARDIZATION_GUIDE.md](CONTENT_STANDARDIZATION_GUIDE.md) [4h] @docs
  - Re-audit all 128 species (get fresh line counts)
  - Update page length distribution table
  - Document new best practices from recent additions
  - Update percentages for sections present
  - Add new exemplar pages to reference

---

## 🎯 Priority 1 Completion Criteria

**Content coverage goals:**

- [ ] 175+ species documented (currently 128, need 47 more)
- [ ] 20/20 comparison guides complete (currently 16/20)
- [ ] 100/128 species with care guidance (currently 60/128)
- [ ] All pages >600 lines (currently 37 pages below threshold)
- [ ] Perfect bilingual parity maintained (EN/ES)

**Quality standards:**

- [ ] All species have 5+ gallery images
- [ ] All required sections present per CONTENT_STANDARDIZATION_GUIDE.md
- [ ] External resources linked (IUCN, iNaturalist, GBIF)
- [ ] Safety data complete and visible
- [ ] Build succeeds with zero errors

**Note**: Priority 1 work can proceed in parallel with Priority 0 and Priority 3. Content creation is independent of technical infrastructure work.

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

## Priority 3: Infrastructure Quick Wins ⚡

**Status**: 📋 Ready to Start (High Impact, Low Effort)  
**Total Effort**: ~1-2 weeks  
**Dependencies**: None (except 3.4 requires Priority 0.0 Auth Fix)  
**Impact**: **HIGH** - Quick security wins and developer experience improvements

**Goal**: Implement high-impact, low-effort infrastructure improvements that prevent issues and improve development workflow.

**Rationale**: These are "quick wins" - relatively easy to implement but provide significant value in security, code quality, and operational excellence.

### Priority 3.1: Configure GitHub Branch Protection

**Status**: ❌ Not Configured (Manual setup required)  
**Effort**: 5 minutes  
**Impact**: High - Prevents accidental direct pushes to main  
**Reference**: [SECURITY_SETUP.md](SECURITY_SETUP.md)

**Current Status:**

- ✅ Security workflow operational (npm-audit, TruffleHog, CodeQL, ESLint, license-check)
- ❌ Branch protection not configured

**🔧 Implementation Checklist:**

- [ ] **Configure branch protection rules** [5min] @infrastructure @security ✅Ready
  - Navigate to: **Settings → Branches → Branch protection rules**
  - Click "Add rule" for `main` branch
  - Enable settings:
    - ☑️ Require status checks before merging
    - ☑️ Require "Security Checks" workflow to pass
    - ☑️ Require "Build" workflow to pass (if exists)
    - ☑️ Require branches to be up to date before merging
    - ☑️ Require pull request reviews before merging (min 1 reviewer)
    - ☑️ Dismiss stale PR reviews when new commits pushed
    - ☑️ Require review from Code Owners (optional)
    - ☑️ Restrict who can push to matching branches
    - ☑️ Allow force pushes: OFF
    - ☑️ Allow deletions: OFF
  - Save changes
- [ ] **Test protection rules** [2min] @infrastructure
  - Try to push directly to main (should be blocked)
  - Create test PR, verify status checks required
  - Verify PR requires review before merge

**No Rollback Needed**: Manual GitHub settings change, easy to revert if needed.

---

### Priority 3.2: Set Up Pre-commit Hooks

**Status**: ✅ **COMPLETE** (verified 2026-01-19)  
**Effort**: 3 hours (completed)  
**Impact**: Medium - Catches issues before commit, improves code quality

**Completed Status:**

- ✅ Husky installed and configured
- ✅ `.husky/pre-commit` - Runs lint-staged + MDX validation
- ✅ `.husky/commit-msg` - Runs commitlint for conventional commits
- ✅ `commitlint.config.js` - Custom rules including "content" type
- ✅ lint-staged configured in package.json

**🔧 Implementation Checklist (All Complete):**

- [x] **Install and configure Husky** [1h] @infrastructure @developer-experience ✅
  - Husky installed via npm
  - `.husky` directory configured
  - Hooks initialized and active
- [x] **Configure pre-commit hook** [1h] @infrastructure ✅
  - `.husky/pre-commit` validates MDX content changes
  - Runs contentlayer build for MDX validation
  - Executes lint-staged for code formatting
  - Tested and working on all commits
- [x] **Configure commit-msg hook** [30min] @infrastructure ✅
  - commitlint packages installed (@commitlint/cli, @commitlint/config-conventional)
  - `.husky/commit-msg` validates commit message format
  - `commitlint.config.js` created with custom rules (includes "content" type)
  - Tested: rejects malformed commit messages

**Completed**: 2026-01-19

---

### Priority 3.3: Integrate Error Tracking Service

**Status**: ✅ **COMPLETE** (PR #237 merged 2026-01-19)  
**Effort**: 1 day (completed)  
**Impact**: High - Catch production errors, improve reliability  
**Files**: 4 error boundary components updated

**Completed Status:**

- ✅ Created `src/lib/sentry.ts` utility module with graceful degradation
- ✅ Updated ErrorBoundary.tsx with Sentry integration
- ✅ Updated ImageErrorBoundary.tsx with Sentry integration
- ✅ Updated ComponentErrorBoundary.tsx with Sentry integration
- ✅ Updated global-error.tsx with Sentry integration
- ✅ Added NEXT_PUBLIC_SENTRY_DSN to .env.example
- ✅ Error tracking works with or without Sentry SDK installed

**🔧 Implementation Checklist (All Complete):**

- [x] **Create error tracking utility** [2h] @infrastructure @monitoring ✅
  - Created `src/lib/sentry.ts` with graceful degradation
  - Functions: captureException, captureMessage, setUser, addBreadcrumb
  - Works without Sentry SDK (logs to console instead)
- [x] **Update error boundaries** [3h] @infrastructure @refactor ✅
  - Updated ImageErrorBoundary.tsx - calls captureException with context
  - Updated ErrorBoundary.tsx - calls captureException with context
  - Updated ComponentErrorBoundary.tsx - calls captureException with componentName tag
  - Updated global-error.tsx - useEffect captures fatal errors
- [x] **Configure environment** [30min] @infrastructure ✅
  - Added NEXT_PUBLIC_SENTRY_DSN to .env.example
  - Added SENTRY_ENVIRONMENT to .env.example
  - Graceful degradation when DSN not set

**Completed**: 2026-01-19 (PR #237)

---

### Priority 3.4: Add CSP Optimization

**Status**: ⏸️ **DEFERRED** (Requires extensive refactoring)  
**Effort**: 1-2 weeks (not 2-4 hours as originally estimated)  
**Impact**: Medium - Improves security, removes `unsafe-inline`  
**Dependencies**: None (but test thoroughly)  
**Reference**: TODO at [middleware.ts:113](middleware.ts)

**Current Status:**

- ❌ CSP allows `unsafe-inline` for styles (security risk)
- ⚠️ **30+ components use inline styles** - requires extensive refactoring
- ❌ TODO comment: "// TODO: Extract critical CSS to remove unsafe-inline"

**Reason for Deferral:**
Original estimate of 2-4 hours was significantly underestimated. Audit revealed 30+ components using inline `style={{...}}` attributes including:

- ConservationStatus.tsx (3 usages)
- OptimizedImage.tsx (2 usages)
- SafeImage.tsx (2 usages)
- SeasonalCalendar.tsx (2 usages)
- VirtualizedGrid.tsx (4 usages)
- VirtualizedTreeList.tsx (3 usages)
- Multiple education lesson components (10+ usages)
- MapGameClient.tsx (5+ usages)

Converting all inline styles to CSS classes/modules or implementing nonce-based styles requires:

1. Refactoring 30+ components
2. Creating CSS modules or Tailwind replacements
3. Extensive testing across all pages
4. Potential layout/styling regressions

**Recommendation:** Schedule as a dedicated sprint, not a "quick win."

- CSP allows `unsafe-inline` for styles (security risk)
- TODO comment: "// TODO: Extract critical CSS to remove unsafe-inline"
- Inline styles used in various components

**🔧 Implementation Checklist:**

- [ ] **Audit inline styles usage** [1h] @infrastructure @security
  - Search codebase for `style={{` patterns
  - Identify which components use inline styles
  - Determine if styles can be moved to CSS
  - Document necessary inline styles (if any)
- [ ] **Extract critical CSS** [2h] @infrastructure
  - Move inline styles to CSS modules or Tailwind classes
  - Use `next/font` optimization for font loading
  - Extract critical above-the-fold CSS
  - Generate nonce for remaining necessary inline styles
- [ ] **Update CSP headers** [1h] @infrastructure @security
  - Update `middleware.ts:113`
  - Remove `'unsafe-inline'` from style-src
  - Add nonce support: `'nonce-{GENERATED_NONCE}'`
  - Test CSP doesn't break existing styles
  - Remove TODO comment
- [ ] **Test CSP in production** [30min] @testing
  - Deploy to staging/preview
  - Check browser console for CSP violations
  - Test all pages render correctly
  - Verify no broken styles

**🔄 Rollback Procedure:**

```bash
# If CSP breaks styles, temporarily restore unsafe-inline:
# In middleware.ts, revert CSP header change

# Or add feature flag:
const cspDirectives = {
  'style-src': [
    "'self'",
    process.env.STRICT_CSP === 'true' ? "'nonce-{NONCE}'" : "'unsafe-inline'",
  ],
  // ...
};
```

---

### Priority 3.5: Optimize Remaining 20 Images

**Status**: ✅ **COMPLETE** (verified 2026-01-19)  
**Effort**: 1 hour (completed)  
**Impact**: Medium - Improved performance

**Completed Status:**

- ✅ All 128 images optimized (100%)
- ✅ Average image size: 463KB
- ✅ No broken or placeholder images
- ✅ No low-resolution images

**🔧 Implementation Checklist (All Complete):**

- [x] **Run image optimization** [30min] @infrastructure @performance ✅
  - Executed `npm run images:optimize`
  - All 128 images processed
- [x] **Verify optimization results** [15min] @testing ✅
  - Image health: 100% (128/128)
  - All local images present and valid
  - No external URLs requiring migration
- [x] **Update documentation** [15min] @docs ✅
  - Dashboard updated to reflect 100% completion

**Completed**: 2026-01-19

---

## 🎯 Priority 3 Completion Criteria

**Infrastructure improvements:**

- [ ] Branch protection configured on `main` branch
- [x] Pre-commit hooks active (lint-staged, commitlint) ✅
- [x] Error tracking service integrated (4 error boundaries updated) ✅ PR #237
- [ ] ~~CSP optimized (unsafe-inline removed)~~ **DEFERRED** - requires 30+ component refactors
- [x] All 128 images optimized ✅

**Quality improvements:**

- [ ] Accidental pushes to main prevented
- [x] Code quality enforced at commit time ✅
- [x] Production errors automatically captured ✅
- [ ] ~~Security posture improved (CSP)~~ **DEFERRED**
- [x] Performance improved (image optimization) ✅

**Documentation:**

- [x] Error boundary TODOs resolved (4 files updated) ✅
- [x] Configuration documented for new developers ✅
- [x] Rollback procedures documented ✅

**Note**: Priority 3 work is mostly complete. CSP optimization (3.4) is deferred as it requires extensive refactoring of 30+ components and is not a "quick win." Branch protection (3.1) requires manual GitHub configuration.

---

## Priority 5: Content Enrichment 🌿

**Status**: 📋 Ready to Start (Independent)  
**Goal:** Add specialized knowledge and cultural depth  
**Rationale:** Differentiate from generic botanical databases with local/indigenous knowledge  
**Impact**: Medium-High - Cultural preservation and deeper educational value

### 5.1 Indigenous Terminology

- **Target**: Bribri and Cabécar plant names for all species
- **Content**: Traditional uses, cultural significance, sacred trees
- **Partnerships**: Collaborate with indigenous communities
- **Effort**: High (requires community collaboration)
- **Impact**: High (preserves indigenous knowledge, cultural authenticity)

### 5.2 Expanded Glossary

- **Current**: 100 terms (target achieved!)
- **Next Target**: 150+ terms
- **Focus Areas**:
  - Indigenous terminology (15-20 terms)
  - Wood anatomy (grain patterns, figure types)
  - Forest ecology (succession stages, gap dynamics)
  - Agroforestry systems (alley cropping, silvopasture)
- **Effort**: Medium (ongoing addition)
- **Impact**: Medium (deeper educational value)

### 5.3 Traditional Uses Documentation

- **Content**: Medicinal uses, construction techniques, cultural practices
- **Format**: Dedicated sections in tree profiles
- **Research**: Ethnobotanical studies, elder interviews
- **Effort**: High (requires research and validation)
- **Impact**: Medium (cultural preservation, practical knowledge)

---

## Priority 6: Internationalization 🌍

**Status**: 📋 Ready to Start (Independent)  
**Goal:** Support additional languages beyond English and Spanish  
**Rationale:** Attract international ecotourists, researchers, and conservation professionals  
**Impact**: Medium - Expands user base internationally

### 6.1 Portuguese Translation

- **Target Audience**: Brazilian researchers, tourists
- **Effort**: Medium (2-3 weeks)
- **Impact**: Medium (Brazil is major ecotourism market)

### 6.2 German Translation

- **Target Audience**: European ecotourists (largest non-English speaking group)
- **Effort**: Medium (2-3 weeks)
- **Impact**: Medium (German speakers are significant market)

### 6.3 French Translation

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

## Priority 7: Technical Improvements ⚙️

**Status**: 📋 Ready to Start (Independent)  
**Goal:** Enhance technical capabilities and developer experience  
**Rationale:** Maintain code quality and enable future features  
**Impact**: Medium - Improved UX and developer productivity

### 7.1 Enhanced Search

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

### 7.2 Offline Enhancements

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

### 7.3 Performance Monitoring Dashboard

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
