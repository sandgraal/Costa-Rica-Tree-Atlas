---
name: remediate-tree
description: |
  Guided remediation of a single tree species's frontmatter and visible
  copy across both locales. Use when the factual audit reports an
  iucn_status_mismatch, gbif_family_mismatch, or
  missing_citations_high_risk finding for a tree.

  Trigger phrases: "remediate <slug>", "fix the IUCN status on <slug>",
  "resolve the audit finding for <slug>".
---

# Remediate a single tree

Pattern documented by the cocobolo / cachimbo / flamboyan remediation
commits (search git log for `iucn-mismatches`).

## Prerequisites

1. Identify the audit finding. Run:

   ```bash
   node scripts/audit-factual-accuracy.mjs --tree=<slug>
   ```

   Or look up the species in
   [reports/factual-remediation-queue.full.md](../../reports/factual-remediation-queue.full.md).

2. Determine the corrected value. Sources of truth, in order:
   - IUCN Red List API (if `IUCN_TOKEN` is configured)
   - <https://www.iucnredlist.org/species/<id>/<assessment>>
   - POWO: <https://powo.science.kew.org/taxon/<powoId>>
   - GBIF: <https://www.gbif.org/species/<gbifTaxonKey>>

## The procedure

### Step 1 — Update EN frontmatter

Edit `content/trees/en/<slug>.mdx`. Update:

- `conservationStatus` to the corrected IUCN code
- Add canonical IDs where present (the new schema fields):
  - `nameAuthority` (e.g. "Mill.", "(Sw.) DC.")
  - `gbifTaxonKey` (integer)
  - `powoId`, `wfoId`, `ipniId` where known
  - `iucnAssessmentId` (the numeric ID from the IUCN URL)
  - `iucnAssessmentYear`, `iucnCriteria`, `iucnScope`
  - `citesAppendix` (I / II / III / none)

### Step 2 — Propagate to EN visible copy

Search the EN MDX file for stale conservation references:

```bash
grep -n -E "(Vulnerable|VU|Endangered|EN|Critically|CR|Least Concern|LC)" content/trees/en/<slug>.mdx
```

Update each visible mention to the corrected status. Watch especially:

- `description` field in frontmatter (visible in metadata)
- `safetyNotes` and `structuralRiskDetails` (often contain status mentions)
- The `Conservation Status` section narrative
- The `Callout` block summarizing IUCN + CITES
- The `QuickRef` items list (label / value pair)
- Tags list (remove the `vulnerable` tag if status is no longer VU)
- References section (preserve historical citations; supplement with a
  newer source if the assessment was updated)

### Step 3 — Mirror in ES

Apply the same changes to `content/trees/es/<slug>.mdx`. Translation
table for IUCN labels:

| Code | EN label              | ES label                    |
| ---- | --------------------- | --------------------------- |
| LC   | Least Concern         | Preocupación Menor          |
| NT   | Near Threatened       | Casi Amenazada              |
| VU   | Vulnerable            | Vulnerable                  |
| EN   | Endangered            | En Peligro                  |
| CR   | Critically Endangered | En Peligro Crítico          |
| EW   | Extinct in the Wild   | Extinta en Estado Silvestre |
| EX   | Extinct               | Extinta                     |
| DD   | Data Deficient        | Datos Insuficientes         |
| NE   | Not Evaluated         | No Evaluada                 |

When the status drops (more pessimistic to less pessimistic, e.g.
VU→LC), add narrative context explaining the reassessment rather than
silently rewriting history. See the flamboyan remediation as the model.

### Step 4 — Verify

```bash
grep -n -E "(Vulnerable|VU|Endangered|EN)" content/trees/{en,es}/<slug>.mdx
# Remaining mentions should be intentional (e.g., explaining historical status)

npx contentlayer2 build
npx vitest run tests/content-validation.test.ts tests/conservation-status-i18n.test.tsx tests/route-regression.test.ts
```

All three test runs must pass.

### Step 5 — Update the plan and commit

Update [docs/IMPLEMENTATION_PLAN.md](../../docs/IMPLEMENTATION_PLAN.md) L2 lane
to mark this slug resolved.

Commit message template:

```
fix(content): remediate <slug> IUCN <OLD>→<NEW> (P5)

<one-paragraph explanation of the change, including any nuance about
the reassessment history or scope of the global vs regional assessment>

- <slug> EN: <line count of visible updates>
- <slug> ES: <line count of visible updates>
- Canonical IDs added: <list>

Verification: <test output>
```

## Common pitfalls

- **Don't bump frontmatter without propagating visible copy.** That was
  the bug pattern in cocobolo (frontmatter said CR, body said VU). The
  audit catches it; the remediation must close it.
- **Don't preserve old IUCN narrative as if it were current.** When the
  status changed, say so: "the 2014 assessment was VU; reassessed in
  2020 as LC because…"
- **Tags list is content-search relevant.** Adding/removing `vulnerable`
  / `endangered` / `critically-endangered` tags affects tag-based
  filtering.
- **Indigenous content stays gated.** If the species page has indigenous
  names or oral history mentions, do not edit those sections — even for
  consistency. Open an issue with `needs-indigenous-review`.
