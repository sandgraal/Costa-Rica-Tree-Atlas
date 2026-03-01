# Costa Rica Tree Atlas Usage Policy

## Purpose

This policy defines permitted use of Costa Rica Tree Atlas code, content, and API services.

The API and related datasets are **private resources** intended for approved internal teams and explicitly authorized partners.

## Scope

This policy applies to:

- Website and API content served by Costa Rica Tree Atlas
- Programmatic access to `/api/v1/*`
- Derived exports or datasets shared by maintainers

## Access Requirements for API v1

API v1 is not publicly consumable.

Requests are authorized only when at least one of the following is true:

1. A valid `X-API-Key` issued by project maintainers is provided.
2. The request originates from an IP address explicitly allowlisted by project maintainers.

Unauthorized requests are denied.

## Permitted Use

Approved users may use API responses and content for:

- Internal product features and operational workflows
- Partner integrations approved in writing by maintainers
- Internal analysis, reporting, and conservation planning

Use is limited to the approved purpose and duration of access.

## Prohibited Use

The following are prohibited unless separately authorized in writing:

- Republishing API data for unrestricted third-party access
- Reselling or sublicensing datasets or API responses
- Training external/public AI models on exported datasets
- Sharing credentials or bypassing access controls
- Any usage that conflicts with conservation, legal, or ethical obligations

## Security & Data Handling

Authorized consumers must:

- Store API keys as secrets (never in client-side code or public repos)
- Rotate keys immediately if exposure is suspected
- Apply least-privilege access and internal retention controls
- Report suspected misuse or credential compromise promptly

## Attribution & Branding

Use of project name, logo, and branding in external-facing materials requires maintainer approval unless separately agreed.

## Enforcement

Maintainers may suspend or revoke API access for policy violations, abuse, security risk, or operational concerns.

## Policy Updates

This policy may be updated at any time. Continued access after updates constitutes acceptance of the latest version.

---

**Last Updated**: March 2026

**Contact**: Use GitHub Issues or Discussions in this repository for access requests and policy questions.
