# Dataset License — CC BY 4.0

The **Costa Rica Tree Atlas species dataset** — the structured species
records (frontmatter, taxonomic IDs, conservation status, distribution,
phenology, indigenous-name placeholders, ecological role, etc.) — is licensed
under the **Creative Commons Attribution 4.0 International License (CC BY
4.0)**.

This dataset is published as a Darwin Core Archive (DwC-A) and is intended
for reuse by researchers, educators, biodiversity informatics platforms
(GBIF, Map of Life, iNaturalist), and AI systems that respect license terms.

Full license text: <https://creativecommons.org/licenses/by/4.0/legalcode>
Human-readable summary: <https://creativecommons.org/licenses/by/4.0/>

---

## Canonical Citation

Once the dataset is deposited to Zenodo with a DOI, the recommended citation
will appear here. Until then, please cite as:

> Costa Rica Tree Atlas contributors. (2026). _Costa Rica Tree Atlas Species
> Dataset_ (pre-DOI working draft). CC BY 4.0.
> <https://github.com/sandgraal/Costa-Rica-Tree-Atlas>

Updated citation block with DOI will land in Phase 2 (see
[docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md), lane L4).

---

## Darwin Core Terms

The dataset uses standard Darwin Core terms where applicable, including but
not limited to:

- `scientificName`, `scientificNameAuthorship`, `taxonRank`
- `kingdom`, `phylum`, `class`, `order`, `family`, `genus`, `specificEpithet`
- `vernacularName` (per-locale, with `language` qualifier)
- `taxonRemarks` (synonymy and nomenclatural notes)
- `nativeRange`, `establishmentMeans`
- `iucnRedListCategory`, `threatStatus`
- `phenology` (flowering / fruiting season)
- `references` (canonical external IDs: POWO, WFO, GBIF, IUCN, Tropicos, IPNI)

Extension columns specific to Costa Rica context (e.g., SINAC national
status, CITES appendix listing where applicable, ecoregion classification)
are documented in the DwC-A metadata file (`meta.xml`) alongside any
non-standard term definitions.

---

## Exclusions

### Indigenous Knowledge

Indigenous-language tree names, ceremonial/medicinal uses attributed to
specific communities, oral histories, and any field documenting traditional
knowledge are **NOT** included in the public dataset by default. They are
referenced by ID but not exposed under CC BY 4.0 terms.

See [docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md](docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md)
for how requests for this content are handled.

### Imagery & Audio

Photographs and pronunciation recordings are not part of the DwC-A export.
They are linked from species records but retain their own per-asset licenses.

### Sensitive Location Data

For poaching-risk species (especially CITES Appendix I/II listings with
extant Costa Rican populations), exact GPS coordinates for occurrences are
generalized in the public dataset. The full-precision data may be available
to qualified researchers via direct request to project maintainers.

---

## Versioning

The dataset is versioned by tagged release. Each release produces a new
DwC-A archive and a new Zenodo DOI version. Previous versions remain
accessible by their DOI. Citing a specific version is preferred for
reproducibility.

---

## Why CC BY 4.0?

This is the standard for open biodiversity data and aligns with GBIF dataset
licensing conventions. It allows commercial reuse (e.g., field-guide
publications) while requiring attribution.

If you need data for a use case that CC BY 4.0 doesn't accommodate, open an
issue — we are open to dual-licensing or per-use agreements for use cases
that advance Costa Rican conservation.
