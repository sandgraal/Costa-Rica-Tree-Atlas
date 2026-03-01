# Private Repository Hardening Checklist (GitHub)

This runbook documents the exact GitHub repository settings to apply when operating `sandgraal/Costa-Rica-Tree-Atlas` as a private codebase.

## Recommended pinned repository description

Use this repository description in **Settings → General → Repository details**:

> Private internal repository for Costa Rica Tree Atlas. Access and reuse restricted to explicitly approved collaborators.

## 1) Change visibility to Private

Path: **Settings → General → Danger Zone → Change repository visibility**

- Set visibility to **Private**.
- Confirm the repository name to proceed.

## 2) Disable or restrict forking

Path: **Settings → General → Features**

- Turn off **Allow forking** (recommended for internal-only repositories).
- If organization policy requires forking, restrict to private forks only and approved members.

## 3) Disable GitHub Pages

Path: **Settings → Pages**

- Set **Build and deployment → Source** to **None**.
- If site hosting is still required, migrate deployment to a private platform/project and require authenticated access.

## 4) Actions security posture

Path: **Settings → Actions → General**

Apply:

- **Artifact and log retention**: lower to minimum acceptable period for internal operations.
- **Workflow permissions**: keep to least privilege (`contents: read` by default).
- **Allowed actions**: restrict to GitHub-owned + explicitly approved actions.
- Disable workflows not needed for private operation (especially public-reporting automation).

Repository workflow hardening included in this repo:

- Lighthouse CI no longer uploads reports to temporary public storage.

## 5) Collaboration channels

Path: **Settings → General → Features**

Decide whether to keep these enabled:

- Issues
- Discussions
- Projects

For private/internal-only mode, disable channels you do not actively use.

## 6) Branch protection and collaborator review

Paths:

- **Settings → Branches**
- **Settings → Collaborators and teams**

Checklist:

- Require pull request reviews for `main`.
- Require status checks before merge.
- Restrict who can push to protected branches.
- Remove users/teams that no longer need access.
- Confirm no outside collaborator has unintended write/admin privileges.

## 7) Post-change verification

- Confirm repository lock icon displays **Private** in the header.
- Verify Pages URL is disabled/unpublished.
- Verify Actions summary does not expose public artifacts/reports.
- Verify only approved users remain with access.
