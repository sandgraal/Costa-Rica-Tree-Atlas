# Project Context

## Project Summary

- Next.js 16 App Router project for a bilingual Costa Rica Tree Atlas.
- Content is authored in MDX under `content/trees/**` and loaded via Contentlayer2.
- UI uses Tailwind CSS 4 with next-intl for locale routing.

## Dependency Graph (High Level)

- Next.js 16 (App Router) → React 19, next-intl, Tailwind CSS 4.
- Contentlayer2 → MDX tree profiles in `content/trees/**`.
- UI components in `src/components` consumed by locale routes in `src/app/[locale]`.

## Commands Map

- Dev server: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Format: `npm run format` / `npm run format:check`
- Contentlayer: `npm run contentlayer`
- Images audit: `npm run images:audit`
- Images download: `npm run images:download`
- Images cleanup: `npm run images:cleanup`

## Key Paths by Feature

- Tree content: `content/trees/**`, `contentlayer.config.ts`.
- Locale routing: `src/app/[locale]`, `i18n/*`.
- Tree UI: `src/components/tree/TreeCard.tsx`, `src/components/tree/TreeExplorer.tsx`.
- Identify feature: `src/app/[locale]/identify/*`, `src/app/api/identify/route.ts`.
- Compare feature: `src/app/[locale]/compare/*`, `src/components/TreeComparison.tsx`.
- Seasonal calendar: `src/app/[locale]/seasonal/*`, `src/components/SeasonalCalendar.tsx`.
- Favorites system: `src/app/[locale]/favorites/*`, `src/lib/store/index.ts`.
- Education resources: `src/app/[locale]/education/*`.

## Known Constraints and Feature Flags

- Identify feature requires `GOOGLE_CLOUD_VISION_API_KEY`.
- Supported locales: `en`, `es` (see `contentlayer.config.ts`).
- Contentlayer build required for tree data (`contentlayer build`).

## Code Search (Impacted Targets)

- `src/app/[locale]/identify/page.tsx`: identify entry page wiring locale.
- `src/app/[locale]/identify/IdentifyClient.tsx`: upload form, API call, results.
- `src/app/api/identify/route.ts`: vision API request + label matching.
- `src/components/Header.tsx`: site header with navigation and quick search.
- `src/components/MobileNav.tsx`: mobile navigation menu.
- `messages/en.json`: English translations.
- `messages/es.json`: Spanish translations.
- `README.md`: project documentation and roadmap.
