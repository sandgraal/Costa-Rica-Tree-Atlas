---
mode: agent
description: Diagnose and fix build or lint errors
---

# Fix Build/Lint Errors

Diagnose and resolve build errors, TypeScript errors, or ESLint issues in the project.

## Commands to Run

```bash
# Check for build errors
npm run build

# Check for lint errors
npm run lint

# Fix auto-fixable lint issues
npm run lint -- --fix

# Format code
npm run format
```

## Common Issues to Check

### TypeScript Errors

- Missing type definitions
- Incorrect prop types
- Import path issues (use `@/*` aliases)
- Strict mode violations

### ESLint Errors

- Unused variables/imports
- Missing dependencies in useEffect
- Accessibility issues
- React hooks rules violations

### Build Errors

- Missing dependencies
- Invalid MDX content
- Contentlayer schema violations
- Invalid locale configurations

## Resolution Steps

1. **Run `npm run build`** to identify all errors
2. **Analyze error messages** for root cause
3. **Fix errors** starting with dependencies
4. **Verify fix** by running build again
5. **Run `npm run lint`** to check for remaining issues
6. **Run `npm run format`** to ensure consistent formatting

## Do NOT

- Use `// @ts-ignore` to suppress errors
- Remove accessibility features
- Break existing functionality
- Add dependencies without approval
