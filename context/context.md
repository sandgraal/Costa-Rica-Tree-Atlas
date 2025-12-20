# Project Context

## Project Summary
- Next.js App Router project for a bilingual Costa Rica Tree Atlas.
- Content is authored in MDX under `content/trees/**` and loaded via Contentlayer.
- UI uses Tailwind CSS with next-intl for locale routing.

## Dependency Graph (High Level)
- Next.js (App Router) → React, next-intl, Tailwind.
- Contentlayer → MDX tree profiles in `content/trees/**`.
- UI components in `src/components` consumed by locale routes in `src/app/[locale]`.

## Commands Map
- Dev server: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`
- Format: `npm run format` / `npm run format:check`
- Contentlayer: `npm run contentlayer`
- Images cleanup: `npm run images:cleanup`

## Key Paths by Feature
- Tree content: `content/trees/**`, `contentlayer.config.ts`.
- Locale routing: `src/app/[locale]`, `i18n/*`.
- Tree UI: `src/components/TreeCard.tsx`, `src/components/TreeList.tsx`, `src/components/TreeSearch.tsx`.
- Identify feature: `src/app/[locale]/identify/*`, `src/app/api/identify/route.ts`.

## Known Constraints and Feature Flags
- Identify feature requires `GOOGLE_CLOUD_VISION_API_KEY`.
- Supported locales: `en`, `es` (see `contentlayer.config.ts`).
- Contentlayer build required for tree data (`contentlayer build`).

## Code Search (Impacted Targets)
- `src/app/[locale]/identify/page.tsx` (lines 1-13): identify entry page wiring locale.
- `src/app/[locale]/identify/IdentifyClient.tsx` (lines 1-178): upload form, API call, results.
- `src/app/api/identify/route.ts` (lines 1-142): vision API request + label matching.
- `src/components/Header.tsx` (lines 1-60): adds identify nav link.
- `messages/en.json` (lines 1-131): new identify copy + nav label.
- `messages/es.json` (lines 1-131): new identify copy + nav label.
- `README.md` (lines 244-258): environment variable documentation.
- `.env.example` (lines 1-6): new env var placeholder.
