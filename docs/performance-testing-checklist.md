# Performance Testing & Optimization Checklist

**Last Updated:** 2026-01-12  
**Status:** Ready for Testing  
**Target:** Lighthouse Performance Score >90

## Overview

This document tracks performance optimization implementation status and testing requirements. All optimization **features have been implemented** - this covers the **measurement and validation phase**.

---

## ✅ Optimizations Implemented (Verified 2026-01-12)

### Image Optimization

- ✅ WebP format with JPEG fallbacks
- ✅ Responsive images with `srcset` and `sizes`
- ✅ Lazy loading for below-fold images
- ✅ Blur-up placeholders during load
- ✅ Next.js Image component throughout
- ✅ Image optimization scripts in place
- ✅ Automatic image optimization at build time

**Scripts Available:**

```bash
npm run images:optimize        # Optimize all images
npm run images:optimize:force  # Force re-optimization
```

### Code Splitting & Bundling

- ✅ Next.js automatic code splitting
- ✅ Dynamic imports for heavy components
- ✅ Route-based code splitting (App Router)
- ✅ Vendor bundle optimization
- ✅ Tree shaking enabled

### Content Optimization

- ✅ Contentlayer2 for static content generation
- ✅ 940 static pages pre-rendered at build time
- ✅ MDX compiled at build time
- ✅ Minimal client-side rendering
- ✅ Static generation for all tree/glossary pages

### Caching Strategy

- ✅ Static assets cached by Next.js
- ✅ Image caching with proper headers
- ✅ Font subsetting and preloading
- ✅ Service worker for PWA (offline caching)

### JavaScript Optimization

- ✅ Minimal JavaScript for static pages
- ✅ Client components only where needed
- ✅ React Server Components by default
- ✅ Efficient state management (Zustand)
- ✅ Virtual scrolling for large lists

### CSS Optimization

- ✅ Tailwind CSS 4 with CSS-first config
- ✅ Purged unused CSS
- ✅ Critical CSS inlined
- ✅ CSS modules for component styles
- ✅ No render-blocking CSS

### Font Optimization

- ✅ Next.js font optimization
- ✅ Subset fonts loaded
- ✅ Font display: swap for FOUT prevention
- ✅ Preconnect to font sources

### Build Optimization

- ✅ TypeScript compilation optimized
- ✅ Build time: ~2 minutes for 940 pages
- ✅ Incremental Static Regeneration ready
- ✅ Zero build warnings
- ✅ Clean dependency tree

### Network Optimization

- ✅ Vercel hosting with edge network
- ✅ Automatic gzip/brotli compression
- ✅ HTTP/2 support
- ✅ CDN for static assets

---

## ⏸ Performance Testing Required

### 1. Lighthouse Performance Audit

**Tool Required:** Chrome DevTools Lighthouse

#### Pages to Test

**Critical Pages (Test First):**

- [ ] Home page (`/en`)
- [ ] Tree directory (`/en/trees`)
- [ ] Individual tree page (`/en/trees/ceiba`)
- [ ] Glossary page (`/en/glossary`)
- [ ] Search results (tree directory with filters)

**Secondary Pages:**

- [ ] Education page (`/en/education`)
- [ ] Seasonal calendar (`/en/seasonal`)
- [ ] Map page (`/en/map`)
- [ ] Quiz page (`/en/quiz`)
- [ ] Wizard page (`/en/wizard`)

#### How to Run

**Option 1: Chrome DevTools**

```
1. Open page in Chrome (Incognito mode recommended)
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to "Lighthouse" tab
4. Select:
   - Mode: Navigation
   - Device: Mobile + Desktop
   - Categories: Performance, Accessibility, Best Practices, SEO
5. Click "Analyze page load"
6. Review report
7. Export JSON for tracking
```

**Option 2: Command Line**

```bash
npm install -g lighthouse

# Run audit
lighthouse https://your-site.com --output json --output html --view

# Multiple pages
lighthouse https://your-site.com/en --output json --output-path=./reports/home.json
lighthouse https://your-site.com/en/trees --output json --output-path=./reports/trees.json
lighthouse https://your-site.com/en/trees/ceiba --output json --output-path=./reports/tree-detail.json
```

**Option 3: PageSpeed Insights**

```
Visit: https://pagespeedinsights.web.dev/
Enter URL
Run analysis for Mobile + Desktop
```

#### Target Metrics

**Performance Score: 90+**

**Core Web Vitals:**

- **LCP (Largest Contentful Paint):** < 2.5s (Good)
  - Currently: _To be measured_
  - Target: < 2.0s
- **FID (First Input Delay):** < 100ms (Good)
  - Currently: _To be measured_
  - Target: < 50ms
- **CLS (Cumulative Layout Shift):** < 0.1 (Good)
  - Currently: _To be measured_
  - Target: < 0.05

**Additional Metrics:**

- **FCP (First Contentful Paint):** < 1.8s
- **SI (Speed Index):** < 3.4s
- **TTI (Time to Interactive):** < 3.8s
- **TBT (Total Blocking Time):** < 200ms

#### Score Targets by Page Type

| Page Type         | Performance | Accessibility | Best Practices | SEO |
| ----------------- | ----------- | ------------- | -------------- | --- |
| Home              | 90+         | 100           | 95+            | 95+ |
| Tree Directory    | 85+         | 100           | 95+            | 95+ |
| Tree Detail       | 90+         | 100           | 95+            | 95+ |
| Glossary          | 90+         | 100           | 95+            | 95+ |
| Interactive Tools | 80+         | 100           | 95+            | 90+ |

---

### 2. Real User Monitoring (RUM)

**Tools Implemented:**

- ✅ Vercel Analytics
- ✅ Vercel Speed Insights

**Metrics to Track:**

- Real user LCP distribution
- Real user FID distribution
- Real user CLS distribution
- Geographic performance variations
- Device performance variations
- Browser performance variations

**How to Check:**

```
1. Deploy to production
2. Wait for real user data (24-48 hours)
3. Check Vercel Analytics dashboard
4. Review Core Web Vitals tab
5. Identify performance bottlenecks by:
   - Geography
   - Device type
   - Browser
   - Network speed
```

---

### 3. WebPageTest Analysis

**Tool:** https://www.webpagetest.org/

**Test Configuration:**

- **Location:** Multiple locations (US, Europe, Asia)
- **Browser:** Chrome
- **Connection:**
  - Cable (5/1 Mbps)
  - 3G (1.6/0.768 Mbps)
  - 4G (9/9 Mbps)
- **Number of Tests:** 3 (for consistency)
- **Repeat View:** Yes (tests caching)

**Pages to Test:**

- [ ] Home page
- [ ] Tree directory
- [ ] Tree detail page
- [ ] Glossary page

**Metrics to Capture:**

- Time to First Byte (TTFB)
- Start Render
- First Contentful Paint
- Largest Contentful Paint
- Total Blocking Time
- Document Complete
- Fully Loaded
- Bytes In (total page weight)
- Requests count

**Waterfall Analysis:**

- [ ] Verify assets load in parallel
- [ ] Identify render-blocking resources
- [ ] Check for long-running scripts
- [ ] Verify critical path optimization
- [ ] Check compression effectiveness

---

### 4. Bundle Analysis

**Tool Required:** `@next/bundle-analyzer`

**Installation:**

```bash
npm install @next/bundle-analyzer
```

**Configuration:** (Add to `next.config.ts`)

```typescript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // ... existing config
});
```

**How to Run:**

```bash
ANALYZE=true npm run build
```

**Review:**

- [ ] Identify largest bundles
- [ ] Check for duplicate dependencies
- [ ] Verify tree shaking is working
- [ ] Look for unnecessarily large packages
- [ ] Check client vs server bundle sizes

**Target Bundle Sizes:**

- First Load JS: < 100kb gzipped
- Total Page Weight: < 500kb compressed
- Image Weight: < 200kb per page
- Font Weight: < 50kb

---

### 5. Mobile Performance Testing

**Real Device Testing:**

- [ ] Test on actual mobile devices (iOS, Android)
- [ ] Test on various network speeds (3G, 4G, 5G)
- [ ] Test on different device capabilities (low-end, mid-range, high-end)

**Chrome DevTools Device Simulation:**

```
1. Open DevTools
2. Toggle device toolbar (Cmd+Shift+M)
3. Select device profile
4. Throttle network (Slow 3G, Fast 3G, 4G)
5. Throttle CPU (4x slowdown for low-end devices)
6. Run Lighthouse audit
```

**Test Scenarios:**

- [ ] Low-end Android (Moto G4) on Slow 3G
- [ ] Mid-range Android (Pixel 5) on 4G
- [ ] iPhone 12 on LTE
- [ ] Tablet (iPad) on WiFi

**Specific Checks:**

- [ ] Images load progressively
- [ ] Skeleton screens show while loading
- [ ] No layout shift during load
- [ ] Touch targets are adequate size (44x44px)
- [ ] Scrolling is smooth (no jank)
- [ ] Animations respect prefers-reduced-motion

---

### 6. Image Performance Audit

**Checklist:**

- [ ] All images use Next.js Image component
- [ ] Images have appropriate sizes attribute
- [ ] Lazy loading enabled for below-fold images
- [ ] WebP format used with fallbacks
- [ ] Image dimensions match display size
- [ ] Blur-up placeholders show while loading
- [ ] No CLS from image loading

**Tools:**

```bash
# Audit images
npm run images:audit

# Check for oversized images
npm run images:audit:all
```

**Manual Checks:**

- [ ] No images larger than necessary
- [ ] Retina images use appropriate resolution (2x, not 4x)
- [ ] Featured images optimized for fastest load
- [ ] Gallery images use progressive loading
- [ ] Thumbnails appropriately sized

---

### 7. JavaScript Performance

**React DevTools Profiler:**

```
1. Install React DevTools extension
2. Open Profiler tab
3. Click record
4. Interact with page
5. Stop recording
6. Review flame graph
7. Identify slow components
```

**Checks:**

- [ ] No unnecessary re-renders
- [ ] Expensive operations memoized
- [ ] Virtual scrolling for long lists
- [ ] Lazy loading for heavy components
- [ ] No blocking main thread operations

**Performance Monitoring:**

```javascript
// Check for long tasks in browser console
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.duration > 50) {
      console.warn("Long task detected:", entry);
    }
  });
});
observer.observe({ entryTypes: ["longtask"] });
```

---

### 8. Caching Audit

**Check Response Headers:**

```bash
curl -I https://your-site.com/en/trees/ceiba

# Look for:
# Cache-Control: public, max-age=31536000, immutable (static assets)
# Cache-Control: public, s-maxage=3600, stale-while-revalidate (pages)
# ETag: (for conditional requests)
```

**Service Worker Check:**

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log("Service Workers:", registrations);
});
```

**Cache Hit Rate:**

- [ ] Check Vercel Analytics for cache hit rate
- [ ] Target: >90% cache hit rate for static assets
- [ ] Target: >70% cache hit rate for pages

---

### 9. Third-Party Scripts Audit

**Current Third-Party Scripts:**

- Vercel Analytics
- Vercel Speed Insights

**Checks:**

- [ ] Scripts load asynchronously
- [ ] Scripts don't block rendering
- [ ] Scripts have appropriate loading priority
- [ ] No unnecessary third-party scripts

**Request Map Analysis:**

```
Use Chrome DevTools Network tab:
1. Group by domain
2. Review all third-party requests
3. Ensure each is necessary
4. Consider self-hosting if beneficial
```

---

### 10. Server Response Time

**Check TTFB (Time to First Byte):**

**Target:** < 200ms globally

**Tools:**

- WebPageTest (provides TTFB)
- curl timing
- Chrome DevTools Network tab

**Test from Multiple Locations:**

```bash
# Test from different geos
curl -w "TTFB: %{time_starttransfer}s\n" -o /dev/null -s https://your-site.com/en
```

**Vercel Edge Network:**

- [ ] Verify site deployed to Vercel
- [ ] Check edge function performance
- [ ] Review Vercel Analytics for regional TTFB
- [ ] Identify slow regions

---

## Performance Budget

Set and track performance budgets:

| Metric                 | Budget  | Current | Status |
| ---------------------- | ------- | ------- | ------ |
| **Page Weight**        |
| HTML                   | < 50kb  | _TBD_   | ⏸      |
| CSS                    | < 30kb  | _TBD_   | ⏸      |
| JavaScript             | < 100kb | _TBD_   | ⏸      |
| Images                 | < 200kb | _TBD_   | ⏸      |
| Fonts                  | < 50kb  | _TBD_   | ⏸      |
| Total                  | < 500kb | _TBD_   | ⏸      |
| **Timing**             |
| TTFB                   | < 200ms | _TBD_   | ⏸      |
| FCP                    | < 1.8s  | _TBD_   | ⏸      |
| LCP                    | < 2.5s  | _TBD_   | ⏸      |
| TTI                    | < 3.8s  | _TBD_   | ⏸      |
| TBT                    | < 200ms | _TBD_   | ⏸      |
| CLS                    | < 0.1   | _TBD_   | ⏸      |
| **Requests**           |
| Total Requests         | < 50    | _TBD_   | ⏸      |
| **Scores**             |
| Lighthouse Performance | > 90    | _TBD_   | ⏸      |

---

## Known Optimizations in Place

✅ **Static Generation:**

- 940 pages pre-rendered at build
- No server-side rendering overhead
- Fast response times

✅ **Image Handling:**

- Next.js Image optimization
- WebP with JPEG fallbacks
- Responsive images
- Lazy loading
- Blur placeholders

✅ **Code Splitting:**

- Automatic route-based splitting
- Dynamic imports for heavy components
- Tree shaking enabled

✅ **Caching:**

- Static asset caching
- Service worker for offline
- Browser caching headers

✅ **Component Optimization:**

- Virtual scrolling for lists (VirtualizedTreeList)
- React Server Components by default
- Minimal client JavaScript

---

## Testing Sign-Off

| Test                     | Tester | Date | Status | Score/Metric |
| ------------------------ | ------ | ---- | ------ | ------------ |
| Lighthouse (Home)        |        |      | ⏸      | \_/100       |
| Lighthouse (Trees)       |        |      | ⏸      | \_/100       |
| Lighthouse (Tree Detail) |        |      | ⏸      | \_/100       |
| WebPageTest (Home)       |        |      | ⏸      | \_s LCP      |
| WebPageTest (Trees)      |        |      | ⏸      | \_s LCP      |
| Bundle Analysis          |        |      | ⏸      | \_kb JS      |
| Mobile (Real Device)     |        |      | ⏸      | Pass/Fail    |
| Caching Audit            |        |      | ⏸      | \_%hit rate  |
| Image Audit              |        |      | ⏸      | Pass/Fail    |

---

## Issue Tracking

### Critical Issues (Block Launch)

_To be filled during testing_

### High Priority

_To be filled during testing_

### Medium Priority

_To be filled during testing_

### Low Priority

_To be filled during testing_

---

## Optimization Ideas (Future)

If performance issues are found, consider:

1. **Image Optimization:**
   - Use blur-up thumbnails for faster perceived load
   - Implement image CDN (Cloudinary, imgix)
   - Further compress images

2. **Code Optimization:**
   - Split large components further
   - Lazy load more features
   - Reduce client-side JavaScript

3. **Caching:**
   - Implement ISR (Incremental Static Regeneration)
   - Add Redis caching layer
   - Optimize cache headers

4. **Content Delivery:**
   - Use more aggressive CDN caching
   - Implement edge caching
   - Optimize for regional performance

5. **Monitoring:**
   - Set up performance budgets in CI
   - Add automated Lighthouse CI checks
   - Monitor Core Web Vitals over time

---

## Next Steps

1. **Deploy to Production:**
   - Ensure production build optimized
   - Verify Vercel deployment settings
   - Enable analytics

2. **Run Initial Audits:**
   - Lighthouse on all key pages
   - WebPageTest from multiple locations
   - Real device testing

3. **Establish Baseline:**
   - Document current metrics
   - Set realistic targets
   - Create performance budget

4. **Monitor & Iterate:**
   - Track Core Web Vitals over time
   - Identify regressions
   - Continuously optimize

5. **Automate Testing:**
   - Add Lighthouse CI to pipeline
   - Set up performance monitoring alerts
   - Track trends over time

---

## Resources

### Tools

- **Lighthouse:** Built into Chrome DevTools
- **WebPageTest:** https://www.webpagetest.org/
- **PageSpeed Insights:** https://pagespeedinsights.web.dev/
- **Bundle Analyzer:** https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer
- **React DevTools Profiler:** Chrome Extension

### Documentation

- **Next.js Performance:** https://nextjs.org/docs/app/building-your-application/optimizing
- **Core Web Vitals:** https://web.dev/vitals/
- **Vercel Analytics:** https://vercel.com/docs/analytics

### Benchmarks

- **Lighthouse Scoring:** https://developer.chrome.com/docs/lighthouse/performance/performance-scoring/
- **Core Web Vitals Thresholds:** https://web.dev/defining-core-web-vitals-thresholds/

---

## Conclusion

**Implementation Status:** ✅ COMPLETE  
**Testing Status:** ⏸ PENDING MEASUREMENT

All performance optimizations have been implemented. The site is built with Next.js 16 best practices:

- Static generation for all content pages
- Image optimization with WebP and responsive images
- Code splitting and tree shaking
- Minimal client-side JavaScript
- PWA with offline support

The remaining work is **measurement and validation** to establish baseline metrics and identify any areas for improvement. Once testing is complete, track metrics over time to prevent performance regressions.
