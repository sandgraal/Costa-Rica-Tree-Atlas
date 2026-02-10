# Project Context

## Project Summary

- Costa Rica Tree Atlas is a bilingual (EN/ES) Next.js 16 app for Costa Rican tree profiles, built with TypeScript, Tailwind CSS, MDX via Contentlayer2, and next-intl routing.
- Tree content lives in MDX files under `content/trees/{en,es}` and is rendered with custom MDX components.
- Image maintenance and review automation is handled by scripts and a weekly GitHub Actions workflow.

## Dependency Graph (High Level)

- App framework: Next.js (`next`), React (`react`, `react-dom`).
- Content pipeline: `contentlayer2`, `next-contentlayer2`, MDX loaders.
- i18n: `next-intl` with locale routing.
- Data and auth: Prisma + Postgres + NextAuth.
- Scripts/tooling: Node.js scripts in `scripts/` for image audits, optimization, and proposal generation.

## Commands Map

- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npm run type-check`
- Tests: `npm run test:run`
- Image review proposal generation: `npm run images:propose`, `npm run images:propose:dry`
- Image audits/optimization: `npm run images:audit`, `npm run images:audit:gallery`, `npm run images:optimize`

## Key Paths by Feature

- Weekly image workflow: `.github/workflows/weekly-image-quality.yml`
- Proposal generation script: `scripts/propose-image-changes.mjs`
- Admin proposals API: `src/app/api/admin/images/proposals/**`
- Admin review UI: `src/app/[locale]/admin/images/proposals/**`
- Validation docs: `docs/IMAGE_REVIEW_SYSTEM.md`, `docs/IMPLEMENTATION_PLAN.md`

## Known Constraints & Feature Flags

- Proposal creation requires deployed API + DB migration for `image_proposals` tables.
- Weekly workflow proposal step depends on `IMAGE_PROPOSALS_API_BASE_URL` GitHub secret.
- If that secret is unset, workflow now logs a warning and skips proposal generation safely.
