# tests/ — Agent Guide

Vitest test suite (~47 files). Read the root [CLAUDE.md](../CLAUDE.md) first.

## What each test family guards

| File pattern                               | What it protects                                                                                                                                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content-validation.test.ts`               | Tree MDX schema validity; EN/ES file pairing; required fields                                                                                                                                                                          |
| `content-validation-comprehensive.test.ts` | Deeper content schema invariants                                                                                                                                                                                                       |
| `conservation-status-i18n.test.tsx`        | IUCN status code → localized label mapping (all 9 codes × 2 locales)                                                                                                                                                                   |
| `i18n-parity.test.ts`                      | Translation key parity between `messages/en.json` and `messages/es.json`                                                                                                                                                               |
| `layout-namespace-audit.test.ts`           | Every `CLIENT_NAMESPACES` entry is actually used                                                                                                                                                                                       |
| `legacy-mdx-components-i18n.test.tsx`      | Older MDX components still render correctly in both locales                                                                                                                                                                            |
| `mdx-components.test.tsx`                  | MDX component registry behavior                                                                                                                                                                                                        |
| `tree-mdx-component-registry.test.ts`      | `h1` → `h2` remap, registry integrity                                                                                                                                                                                                  |
| `mobile-collapsible-section.test.tsx`      | Mobile UX collapsible behavior                                                                                                                                                                                                         |
| `route-regression.test.ts`                 | **THE BIG ONE.** 42 regression guards: no nested `<main>`, no hardcoded ARIA labels, no locale ternaries outside helpers, metadata `alternates`, message-key parity, ES fallback-to-EN guards, console.log baseline, MDX heading remap |
| `server-mdx-content.test.tsx`              | Server MDX rendering                                                                                                                                                                                                                   |
| `theme/`                                   | Dark mode / theme switching                                                                                                                                                                                                            |
| `tree-display.test.ts`                     | Tree directory listing display logic                                                                                                                                                                                                   |
| `image-review/`                            | Image proposal queue logic                                                                                                                                                                                                             |
| `lib/`                                     | Unit tests for shared libraries (cloudinary, filters, reputation, etc.)                                                                                                                                                                |
| `api/`                                     | API route handlers (comparisons, glossary, image upload)                                                                                                                                                                               |
| `security/`                                | Auth, path traversal, **EXIF GPS strip** (privacy-critical guard)                                                                                                                                                                      |

## When to add a test

- **Behavior change in a public surface:** add a regression case before
  shipping the change.
- **Bug fix:** the test should fail without your fix and pass with it.
- **New file pattern in `src/`:** confirm route-regression.test.ts covers
  the surface; extend it if not.
- **Content schema change:** add to `content-validation.test.ts` or
  `content-validation-comprehensive.test.ts`.
- **Security-sensitive change:** add to `tests/security/`. Privacy
  guarantees (EXIF GPS strip, EXIF metadata absence) are exactly the
  invariants this folder protects.

## When NOT to add a test

- **Trivial typo or rename:** existing tests cover this.
- **Pure refactor with no behavior change:** the lack of a new test
  signals "no behavior change," which is correct.
- **Testing implementation detail rather than behavior:** prefer a higher-
  level test or none at all.

## Conventions

- **Vitest, not Jest.** Use `vi.mock`, `vi.fn`, etc.
- **Component tests** use `@testing-library/react` with the JSDOM
  environment (vitest.config.ts).
- **No Playwright.** End-to-end is currently not in scope; route-regression
  tests cover the cross-cutting invariants without a browser.
- **Fixture-based** where useful (`tests/security/exif-strip.test.ts`
  synthesizes a JPEG with EXIF in-memory rather than committing a binary).
- **Snapshots are rare.** Prefer explicit assertions over snapshot churn.

## Running tests

```bash
npx vitest run                                    # all tests
npx vitest run tests/content-validation.test.ts   # one file
npx vitest                                        # watch mode
npm run test:run                                  # CI-style single run
```

## CI integration

Tests run in `.github/workflows/content-build-tests.yml` on every PR. A
failing test should block merge. The route-regression suite is intentionally
fast (<2s) so it can run on every commit.

## Verification expectations

Before claiming a content or component change is done, the floor is:

```bash
npx vitest run tests/content-validation.test.ts tests/conservation-status-i18n.test.tsx tests/route-regression.test.ts tests/i18n-parity.test.ts
```

If any of those fail, the change isn't done.
