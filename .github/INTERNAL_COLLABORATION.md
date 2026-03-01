# Internal Collaboration Process

This document applies to approved repository collaborators and maintainers.

## Access

- Requires direct repository access (no fork workflow).
- Follow branch and PR workflow defined in `.github/copilot-instructions.md` and team conventions.

## Standard Workflow

1. Create a branch from `main`.
2. Make focused changes and keep commits small and descriptive.
3. Run relevant checks locally (`npm run lint`, `npm run build`, tests as needed).
4. Open a pull request and request internal review.
5. Merge after approvals and successful checks.

## Documentation Expectations

- Update user-facing docs when behavior changes.
- Keep internal-only operational details in internal docs.
- Do not publish secrets or credentials in commits, PR descriptions, or issue comments.
