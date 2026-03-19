# Template-Level Accessibility Checklist

> **Status**: Active — apply to every new page, component, or template
> **WCAG Target**: 2.1 AA
> **Last Updated**: 2026-07-14

---

## Landmarks & Page Structure

- [ ] **Single `<main>`** — only the root layout wraps children in `<main id="main-content">`. No page or component adds another `<main>`.
- [ ] **Skip link** — `<a href="#main-content" className="skip-link">` exists in root layout, visible on focus.
- [ ] **Semantic elements** — use `<header>`, `<nav>`, `<footer>`, `<article>`, `<section>`, `<aside>` where appropriate.
- [ ] **No `<div>` soup** — avoid wrapping blocks in plain `<div>` when a semantic element fits.

## Heading Hierarchy

- [ ] **One `<h1>` per page** — provided by the page-level component (not MDX content).
- [ ] **MDX h1→h2 remap** — MDX component registry maps `h1` to `<h2>` to prevent double `<h1>`.
- [ ] **No skipped levels** — headings descend `h1 → h2 → h3 → h4` without gaps.
- [ ] **Headings are not decorative** — don't use heading tags for visual sizing; use CSS instead.

## Bilingual Text (i18n)

- [ ] **No hardcoded English** — all user-visible strings use `useTranslations` (client) or `getTranslations` (server).
- [ ] **ARIA labels localized** — every `aria-label` uses a translation key, not a literal English string.
- [ ] **`lang` attribute** — root `<html lang={locale}>` is set by the layout. Inline foreign-language text uses `lang=""` attribute.
- [ ] **Both locales tested** — verify the component renders correctly under `/en/` and `/es/` routes.

## Interactive Controls

- [ ] **Buttons have accessible names** — via visible text, `aria-label`, or `aria-labelledby`.
- [ ] **Links describe destination** — avoid "click here"; use descriptive link text.
- [ ] **Toggle state exposed** — expandable controls use `aria-expanded` and `aria-controls`.
- [ ] **Focus visible** — all interactive elements show a visible focus ring (Tailwind `focus-visible:ring-*`).
- [ ] **Keyboard operable** — every clickable element works with Enter/Space; no mouse-only interactions.
- [ ] **Focus trapping** — modals and drawers trap focus while open and restore on close.

## Images & Media

- [ ] **Alt text present** — every `<img>` / `<Image>` has meaningful `alt` text (or `alt=""` if decorative).
- [ ] **Alt text localized** — alt text uses translations matching the active locale.
- [ ] **Decorative images hidden** — use `alt=""` and `aria-hidden="true"` for purely decorative images.
- [ ] **SVG icons accessible** — inline SVGs use `aria-hidden="true"` when decorative, or have `<title>` + `role="img"` when informative.

## Forms & Inputs

- [ ] **Labels associated** — every `<input>` has a `<label>` with matching `htmlFor`/`id`.
- [ ] **Error messages linked** — use `aria-describedby` pointing to error message elements.
- [ ] **Required fields marked** — use `aria-required="true"` or `required` attribute.
- [ ] **Autocomplete attributes** — form fields use appropriate `autoComplete` values.

## Color & Contrast

- [ ] **4.5:1 contrast ratio** — text meets WCAG AA minimum against its background.
- [ ] **3:1 for large text** — headings ≥ 18pt (or 14pt bold) meet lower threshold.
- [ ] **Not color-alone** — information conveyed by color also has a text/icon indicator (e.g., IUCN status badges show both color + code).
- [ ] **Dark mode tested** — contrast ratios hold in both light and dark themes.

## Motion & Animation

- [ ] **`prefers-reduced-motion` respected** — animations use `motion-safe:` or check the media query.
- [ ] **No auto-playing content** — carousels/slideshows don't auto-advance without user control.

## Existing Guards (regression tests)

The following are enforced by automated tests in `tests/route-regression.test.ts`:

| Guard              | What it checks                                          |
| ------------------ | ------------------------------------------------------- |
| No nested `<main>` | Scans all `page.tsx` files for `<main` tags             |
| MDX h1→h2 remap    | Verifies the component registry maps h1 to h2           |
| ARIA label audit   | Baseline: 0 hardcoded English aria-labels in components |
| Message key parity | EN and ES translation files have identical key sets     |

## How to Verify

1. **Lighthouse audit** — run `npx lighthouse <url> --only-categories=accessibility` and target score ≥ 96.
2. **axe DevTools** — install the browser extension; check for zero violations on key pages.
3. **Keyboard walkthrough** — Tab through the entire page; verify logical focus order and visible indicators.
4. **Screen reader test** — VoiceOver (macOS) or NVDA (Windows) on tree detail, compare, and home pages.
5. **`npm run build`** — build must pass (catches missing translations used in ARIA attributes).

## Template Quick Reference

When creating a new page (`app/[locale]/*/page.tsx`):

```tsx
// ✅ DO: Use semantic wrapper, no <main>
export default async function NewPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "newPage" });

  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      {/* content */}
    </section>
  );
}

// ❌ DON'T: Add <main>, hardcode English, skip heading
export default function NewPage() {
  return (
    <main>
      <div className="text-3xl font-bold">My New Page</div>
    </main>
  );
}
```

When creating a new interactive client component:

```tsx
"use client";
import { useTranslations } from "next-intl";

export function NewWidget() {
  const t = useTranslations("newWidget");
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-controls="widget-panel"
      aria-label={t("toggleLabel")}
    >
      {t("buttonText")}
    </button>
  );
}
```
