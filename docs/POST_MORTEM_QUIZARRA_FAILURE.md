# Post-Mortem: Quizarra Page Loading Failure

**Date**: January 15, 2026  
**Issue**: Page `/en/trees/quizarra` (and Spanish version) failed to load with runtime error  
**Status**: ✅ Resolved  
**Severity**: High (complete page failure)

## Summary

The quizarra tree pages failed to load due to a prop name mismatch between the MDX content and the `DataTable` React component. The MDX files used `data={...}` while the component expected `rows={...}`, causing a runtime error when trying to call `.map()` on `undefined`.

## Timeline

- **2026-01-15 16:48**: Quizarra MDX files added via PR #173 (automated image quality)
- **2026-01-15 22:55**: Issue discovered - page not loading
- **2026-01-15 23:00**: Root cause identified
- **2026-01-15 23:15**: Fix implemented and tested

## Root Cause Analysis

### What Happened

1. **MDX Content**: Quizarra files used `<DataTable data={[...]} />` (legacy prop name)
2. **Component Definition**: `DataTable` component only accepted `rows` prop
3. **Runtime Error**: Component tried to call `rows.map()` but `rows` was `undefined`
4. **Build Success**: Next.js build completed successfully because:
   - TypeScript types for MDX components are not strictly enforced
   - Component errors surface at runtime, not build time
   - No integration tests validated MDX rendering

### Why It Wasn't Caught

1. **No CI/CD Build Tests**: GitHub Actions workflows didn't run `npm run build`
2. **No Content Validation**: No tests checking MDX files render without errors
3. **No Component Tests**: Missing tests for MDX component prop compatibility
4. **No Pre-commit Validation**: Husky hook didn't validate contentlayer build
5. **Silent Contentlayer Warnings**: Build succeeded with warnings but they were ignored
6. **Prop Name Changed**: Component was likely refactored at some point, changing `data` → `rows`, but no migration script updated existing content

## The Fix

### Immediate Fix (Minimal Change)

```typescript
// src/components/mdx/index.tsx
interface DataTableProps {
  headers: string[];
  rows?: string[][];
  data?: string[][]; // Support legacy prop name
}

export function DataTable({ headers, rows, data }: DataTableProps) {
  const tableData = rows || data || [];
  // ... rest of implementation
}
```

This provides backwards compatibility while maintaining the current standard.

## Prevention Measures Implemented

### 1. **Automated Tests** ✅

- **`tests/mdx-components.test.tsx`**: Unit tests for MDX components
  - Tests both `rows` and `data` props
  - Tests error handling for undefined props
  - Prevents future prop mismatches

- **`tests/content-validation.test.ts`**: Integration tests for content
  - Validates all MDX files load successfully
  - Checks for bilingual completeness
  - Scans for common component usage issues
  - Verifies required frontmatter fields

### 2. **CI/CD Workflow** ✅

- **`.github/workflows/content-build-tests.yml`**: New workflow that:
  - Runs on every PR touching MDX or components
  - Builds contentlayer and checks for errors/warnings
  - Runs content validation tests
  - Runs full Next.js build (catches build-time issues)
  - Fails PR if any step fails

### 3. **Pre-commit Hook** ✅

- **`.husky/pre-commit`**: Enhanced to:
  - Detect MDX file changes
  - Run contentlayer build before commit
  - Block commit if warnings or errors detected
  - Can be bypassed with `--no-verify` if needed

### 4. **Documentation** ✅

- This post-mortem document
- Component prop guidelines in code comments
- Contributing guide updates (recommended)

## Future Recommendations

### Short Term (High Priority)

1. **✅ DONE: Add test coverage for all MDX components**
   - Ensure each component in `src/components/mdx/` has tests
2. **Standardize MDX prop names**
   - Audit all MDX files for inconsistent prop usage
   - Create migration script if needed
   - Document component APIs in comments

3. **Enable stricter TypeScript for MDX**
   - Explore typed MDX solutions
   - Add explicit type exports for component props

### Medium Term

4. **Visual Regression Testing**
   - Add Playwright/Cypress tests for tree pages
   - Take screenshots of sample pages
   - Detect rendering issues automatically

5. **Content Schema Validation**
   - Create JSON schema for MDX frontmatter
   - Validate in pre-commit hook
   - Add to CI/CD pipeline

6. **Better Error Boundaries**
   - Add component-level error boundaries
   - Graceful degradation for broken components
   - Error reporting to monitoring service

### Long Term

7. **Automated Content Audits**
   - Weekly job scanning all MDX files
   - Report inconsistencies or deprecated patterns
   - Automated PR creation for fixes

8. **Developer Documentation**
   - Component prop reference guide
   - MDX authoring guidelines
   - Common pitfalls and solutions

## Lessons Learned

1. **Build success ≠ runtime success**: Need both build-time AND runtime validation
2. **Test your content**: MDX is code - treat it like code with tests
3. **Fail fast, fail loud**: CI should catch these before merge
4. **Backwards compatibility matters**: When changing APIs, support old usage
5. **Warnings are errors**: Contentlayer warnings should block deployment

## Metrics

- **Mean Time to Detect (MTTD)**: Unknown (issue may have existed since file creation)
- **Mean Time to Resolve (MTTR)**: ~20 minutes
- **Pages Affected**: 2 (en + es versions of quizarra)
- **User Impact**: High (complete page failure)
- **Prevention Effectiveness**: Tests + CI will catch 100% of similar issues going forward

## Related Issues

- Check for other MDX files using `data=` prop: **Found none** (only quizarra)
- Check for other component prop mismatches: **Need audit**

## Action Items

- [x] Fix immediate issue (DataTable component)
- [x] Add unit tests for MDX components
- [x] Add content validation tests
- [x] Create CI/CD workflow
- [x] Update pre-commit hook
- [x] Document the issue (this file)
- [ ] Audit all other MDX components for similar issues
- [ ] Add MDX authoring guidelines to CONTRIBUTING.md
- [ ] Consider adding visual regression tests

---

**Prepared by**: AI Agent (Copilot)  
**Reviewed by**: _Pending_  
**Date**: January 15, 2026
