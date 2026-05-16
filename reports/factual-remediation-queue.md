# Factual Accuracy Remediation Queue

Generated: 2026-05-16T14:43:07.046Z
Source audit: 2026-05-16T14:40:48.832Z

## Summary

- Trees audited: 175
- External checks: 175
- Total findings: 1
- Trees with findings: 1

## Top Priorities

| Priority | Slug     | Score | Errors | Warnings | Citation Gaps | IUCN Drift | Family Drift | Top Issues    |
| -------- | -------- | ----: | -----: | -------: | ------------: | ---------: | -----------: | ------------- |
| P3-low   | matapalo |    20 |      0 |        0 |             0 |          0 |            0 | gbif_no_match |

## Recommended Triage Workflow

1. Resolve any `P0-critical` items first (schema/parity errors).
2. For `P1-high`, review IUCN drift against authoritative IUCN pages and update EN+ES frontmatter together.
3. For citation gaps, add claim-level citations in high-risk sections (history/cultural/agriculture/medicinal/safety).
4. Re-run factual audit and regenerate this queue after each batch.
