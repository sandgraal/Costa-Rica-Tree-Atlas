# Factual Accuracy Remediation Queue

Generated: 2026-05-16T06:00:33.828Z
Source audit: 2026-05-16T05:59:19.904Z

## Summary

- Trees audited: 175
- External checks: 175
- Total findings: 13
- Trees with findings: 13

## Top Priorities

| Priority | Slug            | Score | Errors | Warnings | Citation Gaps | IUCN Drift | Family Drift | Top Issues           |
| -------- | --------------- | ----: | -----: | -------: | ------------: | ---------: | -----------: | -------------------- |
| P1-high  | fruta-de-pan    |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | jobo            |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | madero-negro    |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | mango           |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | maranon         |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | mastate         |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | papaya          |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | tempisque       |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | yellow-oleander |    65 |      0 |        1 |             0 |          1 |            0 | iucn_status_mismatch |
| P1-high  | laurel          |    55 |      0 |        1 |             0 |          0 |            1 | gbif_family_mismatch |
| P1-high  | laurel-negro    |    55 |      0 |        1 |             0 |          0 |            1 | gbif_family_mismatch |
| P1-high  | muneco          |    55 |      0 |        1 |             0 |          0 |            1 | gbif_family_mismatch |
| P3-low   | matapalo        |    20 |      0 |        0 |             0 |          0 |            0 | gbif_no_match        |

## Recommended Triage Workflow

1. Resolve any `P0-critical` items first (schema/parity errors).
2. For `P1-high`, review IUCN drift against authoritative IUCN pages and update EN+ES frontmatter together.
3. For citation gaps, add claim-level citations in high-risk sections (history/cultural/agriculture/medicinal/safety).
4. Re-run factual audit and regenerate this queue after each batch.
