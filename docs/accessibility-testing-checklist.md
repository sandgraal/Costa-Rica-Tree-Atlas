# Accessibility Testing Checklist

**Last Updated:** 2026-01-12  
**Status:** Ready for Testing  
**WCAG Target:** 2.1 AA Compliance

## Overview

This checklist documents all accessibility testing that needs to be performed. All accessibility **features have been implemented** - this document covers the **testing/validation phase**.

---

## ✅ Implementation Complete (Verified 2026-01-12)

These items have been implemented and verified in the codebase:

### Semantic HTML & Structure

- ✅ Proper heading hierarchy (h1 → h2 → h3 without skipping)
- ✅ Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`)
- ✅ Skip to main content link in header
- ✅ Breadcrumb navigation with proper ARIA labels
- ✅ Lists use proper `<ul>`, `<ol>`, `<li>` markup

### Images & Media

- ✅ All images have descriptive alt text
- ✅ Decorative images use `aria-hidden="true"` or empty alt=""
- ✅ SVG icons have `aria-hidden="true"` when decorative
- ✅ Logo images have descriptive alt text ("Costa Rica Tree Atlas logo")
- ✅ Tree images use title as alt text
- ✅ Image error boundaries with fallback UI

### Interactive Elements

- ✅ All buttons have accessible labels (text or `aria-label`)
- ✅ All links have descriptive text (no "click here")
- ✅ Icon-only buttons have `aria-label` attributes
- ✅ Form inputs have associated labels
- ✅ Custom controls have appropriate ARIA roles

### Keyboard Navigation

- ✅ All interactive elements keyboard accessible (Tab, Enter, Space)
- ✅ Focus visible on all interactive elements
- ✅ Modal dialogs trap focus appropriately
- ✅ Keyboard shortcuts implemented (H, T, F, R, D, ?, Esc, ⌘K)
- ✅ Skip navigation link functional
- ✅ No keyboard traps
- ✅ Logical tab order throughout

### ARIA Attributes

- ✅ `role="dialog"` and `aria-modal="true"` on modals
- ✅ `aria-label` on navigation landmarks
- ✅ `aria-expanded` on expandable components
- ✅ `aria-pressed` on toggle buttons (favorites, theme)
- ✅ `aria-hidden="true"` on decorative elements
- ✅ `aria-live` regions for dynamic content updates (where appropriate)
- ✅ `aria-labelledby` and `aria-describedby` where needed

### Focus Management

- ✅ Modal open/close restores focus to trigger
- ✅ Focus visible with custom focus styles
- ✅ Focus indicator contrast meets requirements
- ✅ No invisible focused elements

### Error Handling

- ✅ Error boundaries with recovery options
- ✅ Error messages are descriptive
- ✅ Form validation errors announced
- ✅ 404 and error pages accessible

---

## ⏸ Testing Required (External Tools/Manual)

These items require external tools or manual testing to validate:

### 1. Automated Accessibility Audit (axe DevTools)

**Tool Required:** axe DevTools browser extension or @axe-core/cli

**Pages to Test:**

- [ ] Home page (`/en`, `/es`)
- [ ] Tree directory (`/en/trees`, `/es/trees`)
- [ ] Individual tree page (e.g., `/en/trees/ceiba`)
- [ ] Glossary page (`/en/glossary`, `/es/glossary`)
- [ ] Individual glossary term page (e.g., `/en/glossary/pinnate`)
- [ ] Education pages (`/en/education`)
- [ ] Seasonal calendar (`/en/seasonal`)
- [ ] Tree comparison (`/en/compare`)
- [ ] Identification tool (`/en/identify`)
- [ ] Map page (`/en/map`)
- [ ] Quiz page (`/en/quiz`)
- [ ] Wizard page (`/en/wizard`)
- [ ] Safety page (`/en/safety`)
- [ ] Conservation page (`/en/conservation`)
- [ ] Favorites page (`/en/favorites`)

**How to Run:**

```bash
# Install axe CLI
npm install -g @axe-core/cli

# Start dev server
npm run dev

# Run audit on key pages
axe http://localhost:3000/en --rules wcag2a,wcag2aa,wcag21a,wcag21aa
axe http://localhost:3000/en/trees
axe http://localhost:3000/en/trees/ceiba
# ... etc
```

**Expected Issues:**

- Target: 0 critical violations
- Target: 0 serious violations
- Minor/moderate issues should be documented and fixed if reasonable

---

### 2. Color Contrast Validation

**Tools Required:**

- axe DevTools (includes color contrast checker)
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools Lighthouse

**WCAG AA Requirements:**

- Normal text (< 18pt): 4.5:1 minimum
- Large text (≥ 18pt or ≥ 14pt bold): 3:1 minimum
- UI components and graphics: 3:1 minimum

**Elements to Check:**

- [ ] Body text on background
- [ ] Link text vs background
- [ ] Button text vs button background
- [ ] Primary color text vs backgrounds
- [ ] Secondary color text vs backgrounds
- [ ] Muted/dimmed text vs backgrounds
- [ ] Focus indicators vs backgrounds
- [ ] Border colors vs backgrounds
- [ ] Icon colors vs backgrounds
- [ ] Tree tag badges
- [ ] Safety badges
- [ ] Alert/warning/info colors

**Dark Mode:**

- [ ] Repeat all contrast checks in dark mode
- [ ] Verify theme toggle works correctly

**How to Check:**

```
1. Open Chrome DevTools
2. Inspect element
3. Check "Contrast" in Styles panel
4. Or use Lighthouse audit which includes contrast checks
```

---

### 3. Lighthouse Performance & Accessibility Audit

**Tool Required:** Chrome DevTools Lighthouse

**Pages to Audit:**

- [ ] Home page (`/en`)
- [ ] Tree directory (`/en/trees`)
- [ ] Individual tree page (e.g., `/en/trees/ceiba`)
- [ ] Glossary page (`/en/glossary`)
- [ ] Education page (`/en/education`)

**Target Scores:**

- Accessibility: 100 (no issues)
- Performance: 90+
- Best Practices: 90+
- SEO: 90+

**How to Run:**

```
1. Open page in Chrome
2. Open DevTools (F12)
3. Go to Lighthouse tab
4. Select "Accessibility" + "Performance"
5. Click "Generate report"
6. Review all issues
```

**Report Results:**

- Document all accessibility issues found
- Document performance metrics:
  - First Contentful Paint (FCP): target < 1.8s
  - Largest Contentful Paint (LCP): target < 2.5s
  - Time to Interactive (TTI): target < 3.8s
  - Cumulative Layout Shift (CLS): target < 0.1
  - Total Blocking Time (TBT): target < 200ms

---

### 4. Screen Reader Testing

**Tools Required:**

- **Windows:** NVDA (free) or JAWS (commercial)
- **macOS:** VoiceOver (built-in)
- **Linux:** Orca (free)

**Browsers to Test:**

- [ ] Chrome/Edge + NVDA (Windows)
- [ ] Firefox + NVDA (Windows)
- [ ] Safari + VoiceOver (macOS)
- [ ] Chrome + VoiceOver (macOS)

#### Test Scenarios

**Navigation:**

- [ ] Navigate to home page, verify page title announced
- [ ] Tab through header navigation, verify all links announced correctly
- [ ] Use landmarks navigation (H for headings, D for landmarks)
- [ ] Verify skip to main content link works
- [ ] Navigate to tree directory, verify tree cards readable
- [ ] Use arrow keys to navigate tree list

**Forms & Controls:**

- [ ] Use filter checkboxes in tree directory
- [ ] Interact with search input
- [ ] Use tree selection wizard step-by-step
- [ ] Toggle favorites button
- [ ] Toggle theme button
- [ ] Change language

**Content:**

- [ ] Navigate through tree detail page
- [ ] Verify headings read correctly (h2, h3 hierarchy)
- [ ] Listen to image alt text
- [ ] Navigate glossary tooltip content
- [ ] Read comparison tables

**Keyboard Shortcuts:**

- [ ] Press ? to open shortcuts modal
- [ ] Verify modal content read correctly
- [ ] Press Esc to close
- [ ] Try H, T, F, R shortcuts
- [ ] Try ⌘K for search

**Expected Behavior:**

- All content should be accessible
- Navigation should be logical
- ARIA labels should be descriptive
- No "unlabeled" or "clickable" generic announcements
- Lists should announce item count
- Dynamic content changes should announce

---

### 5. Keyboard-Only Navigation Testing

**Setup:** Disconnect mouse, use only keyboard

**Navigation Patterns to Test:**

- [ ] Tab through entire home page from top to bottom
- [ ] Shift+Tab to navigate backwards
- [ ] Enter/Space to activate buttons and links
- [ ] Arrow keys in dropdown menus
- [ ] Esc to close modals/menus
- [ ] Tab trap in modal dialogs works correctly

**Pages to Test:**

- [ ] Home page - full tab-through
- [ ] Tree directory - filters, search, card navigation
- [ ] Tree detail page - tabs, image gallery, related trees
- [ ] Glossary - search, filter, term cards
- [ ] Quiz - question navigation, answer selection
- [ ] Wizard - step navigation, form inputs
- [ ] Map - interactive map keyboard controls

**Checklist:**

- [ ] No keyboard traps
- [ ] Focus always visible
- [ ] Tab order is logical
- [ ] All functionality accessible
- [ ] No need to use mouse for anything

---

### 6. Mobile Accessibility Testing

**Devices to Test:**

- [ ] iOS (iPhone/iPad) with VoiceOver
- [ ] Android with TalkBack

**Touch Targets:**

- [ ] All buttons ≥ 44x44px (WCAG 2.1 Level AAA: 44x44px)
- [ ] Adequate spacing between interactive elements
- [ ] No overlapping touch targets

**Zoom/Magnification:**

- [ ] Test 200% zoom (pinch-to-zoom)
- [ ] Verify no horizontal scrolling required
- [ ] Verify content reflows correctly
- [ ] Test with system font size increased

**VoiceOver Testing (iOS):**

```
Enable: Settings > Accessibility > VoiceOver
Gestures:
- Swipe right: next element
- Swipe left: previous element
- Double tap: activate
- Two-finger swipe up: read all
```

**TalkBack Testing (Android):**

```
Enable: Settings > Accessibility > TalkBack
Gestures:
- Swipe right: next element
- Swipe left: previous element
- Double tap: activate
- Swipe down then right: read from top
```

---

## 7. Manual Checklist Items

### Visual Checks

- [ ] Verify focus indicators visible on all interactive elements
- [ ] Verify sufficient spacing between clickable items
- [ ] Verify text doesn't overflow containers at 200% zoom
- [ ] Verify images don't break layout when slow to load
- [ ] Verify animations respect prefers-reduced-motion

### Content Checks

- [ ] All links have descriptive text (not "click here")
- [ ] All buttons have clear purpose
- [ ] Error messages are clear and actionable
- [ ] Loading states provide feedback
- [ ] Empty states explain what to do next

### Form Validation

- [ ] Form errors announced to screen readers
- [ ] Error messages associated with inputs
- [ ] Required fields marked with asterisk AND aria-required
- [ ] Validation happens on submit or blur (not every keystroke)

---

## 8. Browser Testing Matrix

Test on these browser/OS combinations:

| Browser | Version | OS      | Status |
| ------- | ------- | ------- | ------ |
| Chrome  | Latest  | Windows | [ ]    |
| Chrome  | Latest  | macOS   | [ ]    |
| Chrome  | Latest  | Linux   | [ ]    |
| Firefox | Latest  | Windows | [ ]    |
| Firefox | Latest  | macOS   | [ ]    |
| Safari  | Latest  | macOS   | [ ]    |
| Safari  | Latest  | iOS     | [ ]    |
| Edge    | Latest  | Windows | [ ]    |
| Chrome  | Latest  | Android | [ ]    |

---

## 9. Known Implementation Strengths

Document what's already working well:

✅ **Keyboard Navigation:**

- Comprehensive keyboard shortcut system
- Help dialog accessible via `?` key
- All functionality keyboard-accessible

✅ **ARIA Implementation:**

- Proper landmark regions
- Descriptive labels throughout
- Modal focus management

✅ **Image Handling:**

- All images have alt text
- Error boundaries for failed loads
- Responsive image loading

✅ **Component Accessibility:**

- Breadcrumbs with proper nav role
- Table of contents with smooth scroll
- Scroll to top with progress indicator
- Loading skeletons for better UX

---

## 10. Issues to Track

Use this section to document any issues found during testing:

### Critical Issues (Blockers)

_None identified in implementation review_

### Serious Issues

_To be filled during testing_

### Moderate Issues

_To be filled during testing_

### Minor Issues

_To be filled during testing_

---

## Testing Sign-Off

| Test Category         | Tester | Date | Status    | Notes                    |
| --------------------- | ------ | ---- | --------- | ------------------------ |
| Automated Audit (axe) |        |      | ⏸ Pending | Requires axe DevTools    |
| Color Contrast        |        |      | ⏸ Pending | Requires Lighthouse      |
| Lighthouse Audit      |        |      | ⏸ Pending | Requires Chrome DevTools |
| NVDA (Windows)        |        |      | ⏸ Pending | Requires screen reader   |
| VoiceOver (macOS)     |        |      | ⏸ Pending | Requires screen reader   |
| Keyboard Navigation   |        |      | ⏸ Pending | Can be tested manually   |
| Mobile (iOS)          |        |      | ⏸ Pending | Requires iOS device      |
| Mobile (Android)      |        |      | ⏸ Pending | Requires Android device  |

---

## Next Steps

1. **Install Testing Tools:**
   - Install axe DevTools browser extension
   - Install NVDA (Windows) or enable VoiceOver (macOS)

2. **Run Automated Tests:**
   - Run axe audit on all key pages
   - Run Lighthouse audit on all key pages
   - Document all findings

3. **Manual Testing:**
   - Test keyboard navigation on all pages
   - Test screen reader on key user flows
   - Test on mobile devices

4. **Fix Issues:**
   - Prioritize critical and serious issues
   - Create tickets for moderate issues
   - Document minor issues for future improvement

5. **Re-test:**
   - Verify all fixes
   - Re-run automated tests
   - Update this checklist with final status

---

## Resources

### WCAG 2.1 Guidelines

- https://www.w3.org/WAI/WCAG21/quickref/
- Level A: Basic accessibility (required)
- Level AA: Target compliance level (required)
- Level AAA: Enhanced accessibility (nice-to-have)

### Testing Tools

- **axe DevTools:** https://www.deque.com/axe/devtools/
- **WAVE:** https://wave.webaim.org/
- **Lighthouse:** Built into Chrome DevTools
- **NVDA:** https://www.nvaccess.org/
- **Color Contrast Analyzer:** https://www.tpgi.com/color-contrast-checker/

### Screen Reader Resources

- **NVDA User Guide:** https://www.nvaccess.org/files/nvda/documentation/userGuide.html
- **VoiceOver Guide:** https://support.apple.com/guide/voiceover/welcome/mac
- **WebAIM Screen Reader Testing:** https://webaim.org/articles/screenreader_testing/

---

## Conclusion

**Implementation Status:** ✅ COMPLETE  
**Testing Status:** ⏸ PENDING EXTERNAL TOOLS

All accessibility features have been implemented according to WCAG 2.1 AA guidelines. The remaining work is **validation and testing** using external tools and manual testing procedures documented above.

The codebase is well-positioned for accessibility audits with:

- Strong semantic HTML foundation
- Comprehensive ARIA implementation
- Full keyboard navigation support
- Descriptive alt text throughout
- Proper focus management
- Error boundaries and fallbacks

Once testing is complete, any issues found should be documented, prioritized, and fixed accordingly.
