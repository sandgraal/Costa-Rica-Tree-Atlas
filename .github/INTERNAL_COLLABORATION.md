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

## Sensitive Content Review Routing

For pull requests that add or materially change indigenous names, meanings, ceremonial references, or other indigenous knowledge content:

- apply the PR label `needs-indigenous-review`
- list affected slugs and locales in the PR description
- link or cite the supporting sources directly in the PR summary
- wait for internal human review before merge

If labels are temporarily unavailable in the repository settings, include `needs-indigenous-review` as a plain-text flag in the PR description until the label is created.

## Documentation Expectations

- Update user-facing docs when behavior changes.
- Keep internal-only operational details in internal docs.
- Do not publish secrets or credentials in commits, PR descriptions, or issue comments.
