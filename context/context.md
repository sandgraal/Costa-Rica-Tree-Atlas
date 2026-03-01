# Task Context: Private Repository Hardening

## project_summary

- Next.js 16 bilingual tree atlas project with extensive docs and CI workflows.
- Current request focuses on repository governance/security settings rather than app runtime behavior.

## dependency_graph (high level)

- Frontend app: Next.js + React + TypeScript.
- Content pipeline: Contentlayer2 + MDX.
- CI/CD: GitHub Actions workflows under `.github/workflows`.

## commands_map (dev, test, build, lint)

- `npm run dev` — local development.
- `npm run build` — production build.
- `npm run lint` — lint checks.
- `npm run test:run` — test execution.

## key_paths_by_feature

- Repository governance docs: `docs/`.
- CI workflow behavior: `.github/workflows/`.
- Contributor-facing guide: `README.md`.

## known_constraints and feature_flags

- No authenticated GitHub CLI context available in this environment to apply repository settings directly.
- Repository-level controls (visibility, forking, branch protection, issues/discussions/projects) must be changed in GitHub UI by a user with admin rights.
