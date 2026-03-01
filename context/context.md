# Context Scan (2026-03-01) — Exposure Review

## project_summary

- Costa Rica Tree Atlas is a bilingual Next.js 16 app for Costa Rican tree content and education resources.
- Canonical domain references in app code and metadata point to `https://costaricatreeatlas.com`.
- Repository appears to have previously lived at `github.com/sandgraal/Costa-Rica-Tree-Atlas` (referenced in docs/badges), but that URL currently returns 404.

## dependency_graph (high-level)

- Runtime: Next.js, React, next-intl, contentlayer2, Zustand, Prisma, Upstash Redis.
- Tooling: TypeScript, ESLint, Prettier, Vitest.

## commands_map

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Type-check: `npm run type-check`
- Security check bundle: `npm run security:check`

## key_paths_by_feature

- App routes/UI: `src/app/**`, `src/components/**`
- Content: `content/**`
- Automation/workflows: `.github/workflows/**`
- Security and env defaults: `.env.example`, `src/lib/security/**`

## known_constraints and feature_flags

- Current clone has no Git remote configured (`git remote -v` empty).
- GitHub API checks for `sandgraal/Costa-Rica-Tree-Atlas` return 404 (no public API visibility from this environment).
- NPM package name from `package.json` is `costa-rica-tree-atlas`; package is not found in npm registry.
