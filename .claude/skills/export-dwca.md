---
name: export-dwca
description: |
  Produce a Darwin Core Archive (DwC-A) of the Costa Rica Tree Atlas
  species corpus, ready for the GBIF data validator and Zenodo deposit.
  Output is a directory containing taxon.tsv, vernacularname.tsv,
  description.tsv, meta.xml, and eml.xml. Idempotent and
  non-destructive — only writes to the chosen output directory
  (default: dist/dwca/).

  Trigger phrases: "export dwc-a", "build the Darwin Core Archive",
  "generate the citeable dataset", "prep the Zenodo bundle".
---

# Export Darwin Core Archive

Master Plan v6.0 lane **L4 — Open Citizenship**. The DwC-A bundle is the
bridge from "neat project" to "primary source": AI overviews, researchers,
and downstream tools cite GBIF / Zenodo / DOI-backed datasets. They will
not cite an undownloadable web page.

## When to run

- Before a Zenodo deposit (versioned release).
- After a backfill of canonical IDs (`backfill-canonical-ids` skill) —
  fresh authorship + GBIF taxon keys propagate into the archive.
- After a meaningful corpus change (new species added, family migration,
  taxonomic update) — refresh and re-validate.

## How it works

The script reads MDX frontmatter directly from
`content/trees/{en,es}/*.mdx`. EN is treated as the canonical record per
taxon; ES provides parallel vernacular names and descriptions. No
network calls — the export is offline-safe and deterministic.

Mapping summary:

| Darwin Core / DC term        | Source                                           |
| ---------------------------- | ------------------------------------------------ |
| `taxonID`                    | `crta:tree:<slug>` synthetic identifier          |
| `scientificName`             | EN frontmatter `scientificName`                  |
| `scientificNameAuthorship`   | EN frontmatter `nameAuthority`                   |
| `kingdom`                    | `Plantae` (constant)                             |
| `phylum`                     | `Tracheophyta` (constant)                        |
| `family`                     | EN frontmatter `family`                          |
| `genus` / `specificEpithet`  | Split from `scientificName`                      |
| `vernacularName` (extension) | EN + ES frontmatter `title`                      |
| `description` (extension)    | EN + ES frontmatter `description`                |
| `language`                   | `en` / `es`                                      |
| `countryCode`                | `CR` (constant; corpus scope is Costa Rica)      |
| `references` / `source`      | Canonical species URL on the Atlas               |
| `license`                    | `https://creativecommons.org/licenses/by/4.0/`   |
| `bibliographicCitation`      | Auto-composed: `Costa Rica Tree Atlas (YYYY). …` |

## Commands

```bash
# Default: write to dist/dwca/ (gitignored)
npm run content:export-dwca

# Tag the EML packageId with a version
node scripts/export-dwca.mjs --version=1.0.0

# Produce a zip alongside the directory
npm run content:export-dwca:zip

# Custom output location
node scripts/export-dwca.mjs --out=/tmp/dwca
```

## Output

```
dist/dwca/
  meta.xml              ← DwC-A core+extension descriptor
  eml.xml               ← Ecological Metadata Language dataset metadata
  taxon.tsv             ← one row per species (EN canonical record)
  vernacularname.tsv    ← EN + ES common names linked by taxonID
  description.tsv       ← EN + ES short descriptions linked by taxonID
```

For the current corpus (180 species):

- `taxon.tsv` — 180 rows
- `vernacularname.tsv` — ~200 rows (some ES titles equal EN; deduped)
- `description.tsv` — ~350 rows (EN + ES per taxon)

## Validation

After generating, run the bundle through the GBIF DwC-A validator:

https://www.gbif.org/tools/data-validator

Upload the directory (or zip it with `--zip`) and fix any flagged
issues. The validator checks Darwin Core term URIs, encoding,
field-cardinality, and EML schema compliance.

## Deposit workflow (one-time, Phase 2)

1. Run `npm run content:export-dwca:zip --version=<X.Y.Z>` for the
   release tag.
2. Validate at https://www.gbif.org/tools/data-validator.
3. Create a new Zenodo deposit (https://zenodo.org/deposit/new):
   - Title: `Costa Rica Tree Atlas — Species Corpus (vX.Y.Z)`
   - License: CC BY 4.0
   - Resource type: `Dataset`
   - Upload the zip.
4. Reserve a DOI in the Zenodo UI before publishing.
5. Publish. Capture the DOI (form: `10.5281/zenodo.<id>`).
6. Wire the DOI into species pages via
   `<meta name="citation_doi" content="…">` and a visible
   "Cite this page" block (APA / MLA / BibTeX).
7. Tag the repo (`git tag vX.Y.Z`); subsequent Zenodo deposits should
   auto-trigger on the tag once the integration is enabled.

## Known limitations

- Indigenous-knowledge content is **not** included in the public DwC-A
  export. The current scaffold simply does not export oral histories;
  before a full release, add a redaction pass to strip any
  `indigenousNames` entries flagged by
  [docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md](../../docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md).
- No occurrence records — this is a checklist dataset
  (`Taxon` core), not an occurrence dataset. Occurrence data is
  available from GBIF directly per species.
- Sensitive species (CITES Appendix I / extant CR populations) need a
  separate review before any future occurrence-flavored export.
- The script uses a small custom frontmatter parser to avoid adding a
  YAML dependency for the scaffold. If a future schema introduces
  multi-line YAML constructs (e.g., `>` folded scalars, nested maps),
  switch to `gray-matter`.

## Verification after a run

```bash
npm run content:export-dwca
ls -1 dist/dwca/                         # 5 files
head -2 dist/dwca/taxon.tsv              # spot-check header + row 1
wc -l dist/dwca/taxon.tsv                # 181 (header + 180 species)
xmllint --noout dist/dwca/meta.xml       # XML well-formed (requires libxml2)
xmllint --noout dist/dwca/eml.xml
```
