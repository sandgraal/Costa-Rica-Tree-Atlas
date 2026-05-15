---
name: audit-iucn
description: |
  Run the factual-accuracy audit, surface the current remediation queue,
  and recommend the next batch of trees to remediate.

  Trigger phrases: "what's the IUCN audit say", "show the remediation
  queue", "what trees should we fix next", "audit IUCN".
---

# Audit IUCN status drift

## Quick scan

```bash
node scripts/audit-factual-accuracy.mjs --skip-external
```

Shows local schema + EN/ES parity findings without hitting external APIs.
Use when iterating quickly or when offline.

## Full audit (with external checks)

```bash
node scripts/audit-factual-accuracy.mjs --max-api=175 --write=reports/factual-audit.full.json
node scripts/generate-factual-remediation-queue.mjs
```

Outputs:

- `reports/factual-audit.full.json` — raw findings
- `reports/factual-remediation-queue.full.json` — prioritized queue (JSON)
- `reports/factual-remediation-queue.full.md` — prioritized queue (Markdown)
- `reports/factual-remediation-queue.json/.md` — top-50 cut

## Priority bands

- **P0-critical** — schema errors, missing files, invalid status codes.
  Fix before anything else. None currently open.
- **P1-high** — IUCN status mismatches (with or without citation gaps),
  family mismatches. These are the headline data-integrity issues.
- **P2-medium** — citation gaps in high-risk sections without IUCN drift.
  Address in batches per ecoregion.
- **P3-low** — minor warnings.

## Reading a finding

A typical `iucn_status_mismatch` finding has:

```json
{
  "type": "iucn_status_mismatch",
  "severity": "warning",
  "slug": "cocobolo",
  "scientificName": "Dalbergia retusa",
  "localIucn": "VU",
  "externalIucn": "CR",
  "gbifTaxonKey": 2968539
}
```

`localIucn` is what our frontmatter currently says. `externalIucn` is
what GBIF's cached IUCN value is. Verify against the **live IUCN API**
(if `IUCN_TOKEN` is configured) before treating `externalIucn` as truth —
GBIF's cache can be stale by months.

## Recommend a remediation batch

Group findings by:

1. **Severity** — work P1-high before P2-medium.
2. **Confidence** — IUCN+CITES species (cocobolo, granadillo, etc.) are
   high-impact and well-sourced; tackle these first.
3. **Locality of effect** — when one batch is geographic (e.g., all
   Guanacaste dry-forest species), batch them together so the L3
   ecoregion landing pages can land in the same PR.

A reasonable batch size is 3–5 trees per PR. The cocobolo / cachimbo /
flamboyan commit set is the model.

## When the external check disagrees with the local value

You have three options:

1. **Trust external, update local** — the default for IUCN downgrades
   (more pessimistic to less pessimistic) when documented in IUCN's most
   recent assessment.
2. **Keep local, annotate** — when the local value reflects a more recent
   assessment than GBIF has cached, or when the local value reflects a
   regional / national status that the global IUCN code doesn't capture.
   Add `iucnScope: "regional"` and cite the source.
3. **Mark as DD/NE** — when no defensible global assessment exists. Common
   for cultivars and recently described species.

Always document the rationale in the commit message.

## After the batch

Re-run the audit:

```bash
node scripts/audit-factual-accuracy.mjs --max-api=175 --write=reports/factual-audit.full.json
node scripts/generate-factual-remediation-queue.mjs
```

Update [docs/IMPLEMENTATION_PLAN.md](../../docs/IMPLEMENTATION_PLAN.md) L2 to
reflect the new resolved-count.
