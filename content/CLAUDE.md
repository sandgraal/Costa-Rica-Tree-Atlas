# content/ — Agent Guide

You are working inside the content tree. Read the root [CLAUDE.md](../CLAUDE.md)
first for the project-level rules.

## What lives here

- `trees/en/` and `trees/es/` — 175 mirrored MDX files per locale (one per
  species). Schema in [../contentlayer.config.ts](../contentlayer.config.ts).
- `glossary/en/` and `glossary/es/` — 150 mirrored terms per locale.
- `comparisons/en/` and `comparisons/es/` — 20 mirrored species-comparison
  guides per locale.
- `oral-histories/en/` and `oral-histories/es/` — indigenous oral history
  entries. **Gated** by
  [../docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md](../docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md).

## Hard rules in this tree

1. **Always edit both locales in the same PR.** EN/ES parity is enforced by
   `tests/content-validation.test.ts` and `tests/i18n-parity.test.ts`.
2. **Spanish first, English parity.** When authoring new content, write ES
   first. EN should not read like a translation; it should be a sibling.
3. **Frontmatter values use English internal identifiers.** UI handles
   display localization. Don't write `difficulty: "fácil"`; write
   `difficulty: "easy"`. Enums are defined in
   [../contentlayer.config.ts](../contentlayer.config.ts).
4. **`conservationStatus` is an IUCN code** (LC/NT/VU/EN/CR/EW/EX/DD/NE),
   never a label. If you change it, propagate the label change to all
   visible copy in BOTH locales in the same PR. See git log for cocobolo /
   cachimbo / flamboyan remediation commits as the pattern.
5. **High-risk sections need citations.** Conservation, Uses, Medicinal,
   Cultural, Safety. Use the `<Reference>` MDX component. The factual audit
   (`npm run content:fact-audit`) flags missing citations.
6. **Indigenous content is gated.** Do NOT autonomously add, edit, or
   reword indigenous names, ceremonial uses, or oral histories. If you
   spot an issue, open a GitHub issue with `needs-indigenous-review` and
   stop. This includes typo fixes.
7. **Image attribution is mandatory.** Every `<ImageCard>` carries `credit`
   and `license`. Stripping these for layout is a license violation.

## Canonical taxonomic IDs

The Tree schema includes (all optional):

- `nameAuthority` — author citation (e.g., "Mill.", "(Sw.) DC.")
- `powoId`, `wfoId`, `ipniId`, `gbifTaxonKey`, `tropicosId`
- `synonyms` — JSON array of `{ name, authority, source, kind }`
- `iucnAssessmentId`, `iucnAssessmentYear`, `iucnCriteria`, `iucnScope`
- `citesAppendix` (I / II / III / none)
- `sinacNationalStatus` — Costa Rica national status under Decreto 25700-MINAE

When adding or editing a species, populate these fields where authoritative
data exists. The backfill script (`scripts/backfill-canonical-ids.mjs`, in
progress) will eventually do this in bulk.

## Field reference

See [../docs/CONTENT_STANDARDIZATION_GUIDE.md](../docs/CONTENT_STANDARDIZATION_GUIDE.md)
for the full content tier definitions (Encyclopedic / Standard / Stub) and
field-by-field expectations.

## Common operations

- **Add a species:** Use the `add-species` skill (see
  [../.claude/skills/](../.claude/skills/)). Both EN and ES files, image
  fetch, gallery population.
- **Remediate an IUCN mismatch:** Use the `remediate-tree` skill, or follow
  the cocobolo / cachimbo / flamboyan pattern in git log.
- **Audit content quality:** `npm run content:audit` or
  `npm run content:fact-audit`.
- **Validate before commit:** `npm run contentlayer` then
  `npx vitest run tests/content-validation.test.ts`.

## Verification expectations

After any content change:

```bash
npm run contentlayer  # rebuild
npx vitest run tests/content-validation.test.ts tests/conservation-status-i18n.test.tsx tests/route-regression.test.ts
```

All three should pass. If they don't, the change isn't done.
