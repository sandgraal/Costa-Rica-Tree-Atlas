# Project Context

## Project Summary
- Costa Rica Tree Atlas is a bilingual (EN/ES) Next.js 16 app for Costa Rican tree profiles, built with TypeScript, Tailwind CSS, MDX via Contentlayer2, and next-intl routing.
- Tree content lives in MDX files under `content/trees/{en,es}` and is rendered with custom MDX components.
- Image maintenance is handled by Node.js scripts in `scripts/`, including audits, downloads, and gallery refreshes.

## Dependency Graph (High Level)
- App framework: Next.js (`next`), React (`react`, `react-dom`).
- Content pipeline: `contentlayer2`, `next-contentlayer2`, MDX loaders.
- i18n: `next-intl` with locale routing.
- UI/state/utilities: Tailwind CSS 4, Zustand.
- Scripts/tooling: Node.js scripts in `scripts/` for image management.

## Commands Map
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`
- Image audit: `npm run images:audit`, `npm run images:audit:gallery`
- Image repair: `npm run images:download`, `npm run images:refresh`, `npm run images:refresh:gallery`

## Key Paths by Feature
- Tree content (MDX): `content/trees/en/*.mdx`, `content/trees/es/*.mdx`
- Image storage & attributions: `public/images/trees/`, `public/images/trees/attributions.json`
- Image maintenance scripts: `scripts/manage-tree-images.mjs`, `scripts/cleanup-tree-images.mjs`
- Nightly maintenance workflow: `.github/workflows/nightly-image-cleanup.yml`
- MDX components: `src/components/mdx/`

## Known Constraints & Feature Flags
- Optional analytics and APIs are configured via `.env.example`.
- Some integrations disabled by default (e.g., Google Cloud Vision API, Maps API).
