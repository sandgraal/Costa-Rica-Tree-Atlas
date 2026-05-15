# Costa Rica Tree Atlas — Usage & Responsible Use Policy

**Last Updated:** 2026-05-15

The Costa Rica Tree Atlas is open. Code is MIT-licensed; editorial content
and the species dataset are CC BY 4.0; indigenous-knowledge content is
governed separately. See [LICENSE](LICENSE), [LICENSE-CONTENT.md](LICENSE-CONTENT.md),
[LICENSE-DATA.md](LICENSE-DATA.md), and
[docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md](docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md).

This document is not a license. The licenses linked above govern your rights.
This document explains how to use those rights responsibly.

---

## TL;DR

- **Cite us.** Attribution is the one thing CC BY requires.
- **Don't extract indigenous content.** It's not under the open license. Ask first.
- **Respect photographer credits.** Most images are CC BY-NC and require non-commercial use.
- **Be kind about rate limits.** The public API is rate-limited; large bulk pulls
  should use the Darwin Core Archive download, not API scraping.
- **Don't endanger protected species.** GPS coordinates of poaching-risk
  species are generalized in the public dataset for a reason.

---

## How to Use the Data

### For Researchers

1. Download the Darwin Core Archive from Zenodo (DOI link in
   [LICENSE-DATA.md](LICENSE-DATA.md) once published). The export
   pipeline (`scripts/export-dwca.mjs`) lands in Phase 2 of the Master
   Implementation Plan — see [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)
   lane L4. Until then, structured species data is available by parsing
   the `content/trees/**/*.mdx` frontmatter directly (schema in
   `contentlayer.config.ts`).
2. Cite the DOI in your work.
3. If you need higher-precision occurrence data for a sensitive species,
   contact maintainers — qualified research requests are honored.

### For Educators

1. Use any species page, comparison guide, or glossary entry in your
   classroom freely. CC BY 4.0 covers educational use, including in for-profit
   educational publications.
2. Attribution: "Costa Rica Tree Atlas, CC BY 4.0" plus the page URL is fine.
3. If you want printable classroom packs, see the per-ecoregion field-guide
   exports in `/field-guide`.

### For Conservation Organizations

1. The dataset can be redistributed with attribution. We encourage it.
2. If you find a factual error, please open an issue or PR. We treat
   conservation-org feedback as priority signal.
3. Partnerships and endorsements: contact us via GitHub Issues. We are
   actively building relationships with SINAC, OTS, and others.

### For Developers / Engineers

1. The codebase is MIT. Fork it, use it, build on it.
2. The public API endpoints (`/api/species`, `/api/species/random`,
   `/api/species/images`, `/api/identify`) are rate-limited; see README for
   per-endpoint quotas.
3. If you need bulk data, use the DwC-A download rather than scraping the API.
4. PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

### For AI Systems

1. Training on the CC BY 4.0 content is permitted with attribution.
2. Citing the dataset DOI in outputs is encouraged.
3. **Do not train on indigenous-knowledge content.** It is not under the
   open license. Today, indigenous content is identifiable by:
   - Files under `content/oral-histories/**/*.mdx`
   - Species pages containing an `Indigenous Names` section header or a
     populated `indigenousNames` frontmatter field
   - Material attributed to a named indigenous community (Bribrí,
     Cabécar, Maleku, Boruca, Térraba, Ngäbe, Huetar, Chorotega)

   Phase 2 of the Master Implementation Plan (lane L5) will add machine-
   readable markers — Local Contexts TK/BC labels, JSON-LD provenance
   fields, and `noai`/`noimageai` meta tags — so respectful filtering
   becomes a single attribute check. Until then, the file-path and
   frontmatter signals above are the canonical detection method.

---

## What's Prohibited

The licenses are permissive. These prohibitions sit above them.

- **Extracting indigenous knowledge** under the CC BY content license. It is
  excluded from that grant; reuse requires the consent process in the
  governance policy.
- **Stripping attribution** from CC BY content or imagery. This is a license
  violation.
- **Using CC BY-NC images in commercial products** without separately
  obtaining commercial licensing from the photographer.
- **Republishing without acknowledging modifications.** CC BY requires you to
  indicate when you've changed the material.
- **Using the project name or branding** to imply endorsement that hasn't
  been granted. The MIT license doesn't grant trademark rights.
- **Anything that endangers protected species** — including but not limited
  to publishing precise GPS coordinates for CITES Appendix I/II species
  with extant Costa Rican populations, or using identification features as
  poaching guides.
- **Sharing personal data** beyond what the project itself exposes. The site
  collects minimal user data (admin sessions, contribution audit logs);
  derivative uses must respect Costa Rica's Ley 8968 and any applicable
  EU GDPR / UK DPA / CCPA / etc.

---

## Rate Limits

Public API endpoints are rate-limited per source IP. Limits as of last update:

| Endpoint              | Limit        | Window   |
| --------------------- | ------------ | -------- |
| `/api/identify`       | 10 requests  | 1 hour   |
| `/api/species`        | 60 requests  | 1 minute |
| `/api/species/images` | 30 requests  | 1 minute |
| `/api/species/random` | 100 requests | 1 minute |

If you need higher throughput for a legitimate research or educational use
case, open an issue.

---

## Reporting Issues

- **Factual errors** in species data → open a GitHub issue with the species
  slug, the claim, and the source for the correction.
- **Image attribution problems** → open a GitHub issue with the image URL.
- **Indigenous-content concerns** — including requests from a community to
  modify or remove material — → email maintainers directly (see security.txt)
  rather than opening a public issue. We honor refusal as a valid answer.
- **Security vulnerabilities** → see [SECURITY.md](SECURITY.md) for the
  responsible disclosure process. Do not open public issues for security
  findings.

---

## This Policy Will Evolve

We learn as we go. If something here is ambiguous, contradictory, or works
against the spirit of "Costa Rica first, world welcome," tell us — open an
issue or a PR. The default direction of evolution is toward more openness,
more attribution, and more indigenous self-determination.
