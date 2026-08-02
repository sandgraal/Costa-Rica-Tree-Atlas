# src/components/ — Agent Guide

React components, both server and client. Read the root [CLAUDE.md](../../CLAUDE.md)
first.

## Server vs client components

- **Server by default.** Mark `"use client"` only when you need state, refs,
  effects, browser APIs, or event handlers.
- **MDX content uses server components** via `ServerMDXContent.tsx`. The MDX
  component registry in `mdx/server-components.tsx` is the canonical mapping
  from MDX tag → React component.
- **i18n in server components:** import from `next-intl/server` (e.g.,
  `getTranslations`).
- **i18n in client components:** import from `next-intl` (e.g.,
  `useTranslations`).

## i18n rules

1. **Never hardcode user-facing English or Spanish in component source.**
   Use `t("namespace.key")`. Add the key to BOTH `messages/en.json` and
   `messages/es.json`.
2. **Costa Rican Spanish** is the home register. When adding `es` keys,
   use Latin American Spanish; do not use Castilian forms (no "vosotros",
   no peninsular orthography).
3. **ARIA labels are localized too.** The regression test
   `tests/route-regression.test.ts` guards this — every interactive control
   that needs an `aria-label` must use `t(...)`.
4. **Bilingual translations in MDX care components** (PlantingInstructions,
   MaintenanceTimeline, CommonProblems) use inline EN/ES strings because
   they don't render through `next-intl`. Check existing examples before
   adding new care components.
5. **Locale-keyed values** in component logic should use the shared
   helpers (`getLocalizedText`, `selectLocalizedValue`, `t(en, es)` from
   `src/lib/i18n/`). Do NOT introduce new `isEs ? "..." : "..."` ternaries
   — the regression test will catch them.

## Accessibility expectations

- **WCAG 2.2 AA target.** When adding interactive elements, check focus
  appearance, target size (≥24×24 CSS px), keyboard reachability, and
  screen-reader narration.
- **Headings: `h1` is reserved.** MDX `h1` is remapped to `h2` (see
  `server-components.tsx`). The root layout owns the page `<h1>`.
- **No nested `<main>` tags.** The root `[locale]/layout.tsx` wraps every
  page in `<main id="main-content">`. Page components use `<article>`,
  `<section>`, or `<div>` — never `<main>`.
- **Color contrast:** Use the Tailwind theme tokens. Dark mode ≠ high-
  contrast mode; both must remain AA-compliant.
- **Reduced motion:** Animations should respect `prefers-reduced-motion`.
  Use Tailwind's `motion-safe:` / `motion-reduce:` modifiers.

## State patterns

- **Zustand** for cross-component client state (favorites, recently-viewed,
  collections, search history).
- **Local `useState`** for component-scoped state.
- **Server data** is fetched server-side; client components receive props,
  not fetch URLs.
- **localStorage** is used for favorites + recently-viewed; access via the
  hooks in `src/hooks/`, not directly.

## Styling

- **Tailwind CSS 4** with the theme defined in `src/styles/`.
- **No CSS-in-JS** libraries.
- **No inline styles** unless dynamic (e.g., transform calculations).
- **Use design tokens.** Custom values get added to the Tailwind theme, not
  inlined as arbitrary classes.

## Adding a component

1. Decide server vs client. Default server.
2. If client, name the file with `Client` suffix where it might be
   confusing (`ProposalDetailClient.tsx`, etc.) — the project convention.
3. Translate via `next-intl`; add keys to BOTH locale files.
4. Use existing components (see registry in `mdx/server-components.tsx`)
   before adding new ones.
5. Add a test if behavior is load-bearing (`tests/mdx-components.test.tsx`,
   `tests/server-mdx-content.test.tsx`).

## Verification

```bash
npm run type-check    # TypeScript — must be 0 errors; treat any failure as real
npm run lint          # ESLint
npx vitest run tests/route-regression.test.ts tests/i18n-parity.test.ts
```

Locale-ternary and ARIA-label regression guards live in
`route-regression.test.ts`.

**Know the limit of that guard:** it matches `aria-label="literal"` and
locale ternaries. It does NOT see hardcoded JSX text content or hardcoded
`alt` attributes — those pass CI today. Do not treat a green run as proof
you have no hardcoded strings.
