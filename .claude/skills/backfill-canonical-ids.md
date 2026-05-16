---
name: backfill-canonical-ids
description: |
  Populate missing canonical taxonomic ID fields (POWO/GBIF/IPNI,
  IUCN scope, CITES status, name authority) on tree MDX frontmatter
  via the GBIF species/match API. Idempotent — never overwrites
  existing values.

  Trigger phrases: "backfill canonical IDs", "fill in GBIF keys",
  "populate iucnScope/citesAppendix for the corpus".
---

# Backfill canonical taxonomic IDs

Master Plan v6.0 lane L2/L11. Brings all 175 species to a baseline
where every record carries `gbifTaxonKey`, `nameAuthority`,
`iucnScope`, and `citesAppendix` — the minimum for the Authority
Atlas posture.

## When to run

- After adding new species (catches any new files without IDs)
- When updating to a newer GBIF backbone (authorship may improve)
- Before a Darwin Core Archive export (`scripts/export-dwca.mjs`)

## How it works

1. Reads every `content/trees/en/*.mdx` and its ES mirror.
2. Skips species where all four target fields already exist.
3. Queries `https://api.gbif.org/v1/species/match?name=<scientificName>&verbose=true`.
4. Extracts `usageKey` (→ `gbifTaxonKey`) and `authorship`
   (→ `nameAuthority`).
5. Sets `iucnScope: "global"` and `citesAppendix: "none"` as
   safe defaults — these are explicit annotations, not blind
   guesses; trees with regional assessments or CITES listings
   would have had these fields populated already by manual
   remediation (cocobolo, granadillo, etc.).
6. Inserts the new fields just after `conservationStatus` in
   both EN and ES frontmatter.

## Safety guarantees

- **Default mode is dry-run.** `--write` is required to modify
  files.
- **Never overwrites.** If a field exists with any value, it's
  left alone.
- **Conservative match filter.** GBIF responses with
  `matchType === "FUZZY"` or `confidence < 90` are skipped and
  reported — they need human review.
- **API-rate friendly.** `--max-api=<n>` caps queries per run.

## Commands

```bash
# Dry-run survey (the default)
npm run content:backfill-ids:dry

# Or scoped to one species
node scripts/backfill-canonical-ids.mjs --tree=ceiba --verbose

# Apply changes
npm run content:backfill-ids:write
```

## Output

Each run prints a summary:

```
🌲 Canonical ID Backfill — DRY RUN

Total species scanned:       175
Already complete (skipped):  24
GBIF queries:                151
GBIF failures:               0
Low-confidence matches:      1
Backfilled:                  150
Write errors:                0
```

In `--json` mode, the full per-tree result list is emitted for
piping. The script reports `low-confidence` cases (e.g.,
`matapalo` — Spanish common name shared by multiple Ficus
species) so they can be remediated by hand.

## Known limitations

- The script does not populate `powoId`, `wfoId`, or `ipniId`.
  GBIF's `species/match` endpoint doesn't reliably expose IPNI
  LSIDs. A follow-up should query
  `https://powo.science.kew.org/api/2/taxon/find?q=<name>` for
  the canonical Kew IPNI ID per accepted name.
- `iucnAssessmentId` and `iucnCriteria` require the live IUCN API
  (with `IUCN_TOKEN` in `.env.local`). Currently those fields are
  only populated by manual remediation passes (`remediate-tree`
  skill).
- The `citesAppendix: "none"` default may misrepresent species
  that are actually CITES-listed but haven't had their record
  manually remediated. CITES Appendix species in the corpus
  today (cocobolo, granadillo, guayacan-real) were set by hand
  in PRs #736, #737, #740 — the script will not overwrite them.

## Verification after a backfill

```bash
npx contentlayer2 build                       # rebuild, expect 694 docs
npx vitest run tests/content-validation.test.ts  # confirm parity intact
git diff content/trees/en/<sample-slug>.mdx   # spot-check
```
