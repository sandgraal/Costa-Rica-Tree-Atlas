#!/usr/bin/env node
/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Export the species corpus as a Darwin Core Archive (DwC-A).
 *
 * Master Plan v6.0 lane L4 — Open Citizenship. Produces a citeable,
 * GBIF-ingestible bundle so the Atlas can be deposited to Zenodo with a
 * DOI and consumed by researchers, AI overviews, and downstream tools.
 *
 * The output is a directory (default: dist/dwca/) containing:
 *
 *   meta.xml             - DwC-A core/extension descriptors
 *   eml.xml              - Ecological Metadata Language dataset metadata
 *   taxon.tsv            - one row per species (EN canonical record)
 *   vernacularname.tsv   - one row per (species, locale) common name
 *   description.tsv      - one row per (species, locale) narrative description
 *
 * The script is *idempotent* and *non-destructive*: it reads MDX frontmatter
 * from content/trees/{en,es}/ and writes only to the chosen output directory.
 *
 * Usage:
 *   node scripts/export-dwca.mjs                    # writes dist/dwca/
 *   node scripts/export-dwca.mjs --out=/tmp/dwca    # custom output
 *   node scripts/export-dwca.mjs --zip              # also produce .zip
 *   node scripts/export-dwca.mjs --version=1.0.0    # tag the EML version
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const argMap = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...rest] = a.replace(/^--/, "").split("=");
      return [k, rest.length === 0 ? true : rest.join("=")];
    })
);

const OUT_DIR = argMap.out ? String(argMap.out) : join(REPO_ROOT, "dist", "dwca");
const VERSION = argMap.version ? String(argMap.version) : "0.1.0-draft";
const SHOULD_ZIP = Boolean(argMap.zip);

// ---------------------------------------------------------------------------
// Frontmatter parser
// ---------------------------------------------------------------------------
// We avoid a YAML library dep for the scaffold. The frontmatter we emit is
// well-formed; if a future change introduces multi-line YAML constructs that
// this naive parser doesn't handle, replace with gray-matter.

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const yaml = match[1];
  const out = {};
  let i = 0;
  const lines = yaml.split("\n");
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) {
      i++;
      continue;
    }
    const [, key, rest] = kv;
    if (rest === "" || rest === undefined) {
      // List or block (collect indented children)
      const list = [];
      i++;
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        list.push(lines[i].replace(/^\s+-\s+/, "").replace(/^"(.*)"$/, "$1"));
        i++;
      }
      out[key] = list.length ? list : "";
      continue;
    }
    out[key] = rest.replace(/^"(.*)"$/, "$1");
    i++;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Load corpus
// ---------------------------------------------------------------------------

function loadLocaleCorpus(locale) {
  const dir = join(REPO_ROOT, "content", "trees", locale);
  const files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  const records = {};
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    const raw = readFileSync(join(dir, file), "utf8");
    records[slug] = parseFrontmatter(raw);
  }
  return records;
}

const enCorpus = loadLocaleCorpus("en");
const esCorpus = loadLocaleCorpus("es");

const slugs = Object.keys(enCorpus).sort();

console.log(`📚 Loaded ${slugs.length} species (EN); ${Object.keys(esCorpus).length} species (ES).`);

// ---------------------------------------------------------------------------
// Darwin Core mapping
// ---------------------------------------------------------------------------
// Schema: https://dwc.tdwg.org/terms/
// Term URIs are documented in meta.xml; here we just emit the field values.

function taxonRow(slug, en) {
  const sci = en.scientificName || "";
  // Split "Genus species" → genus + specificEpithet
  const sciParts = sci.split(/\s+/);
  const genus = sciParts[0] || "";
  const specificEpithet = sciParts[1] && /^[a-z]/.test(sciParts[1]) ? sciParts[1] : "";

  const taxonID = `crta:tree:${slug}`;
  const license = "https://creativecommons.org/licenses/by/4.0/";
  const url = `https://costarica-tree-atlas.org/en/trees/${slug}`;

  return {
    taxonID,
    scientificName: sci,
    scientificNameAuthorship: en.nameAuthority || "",
    taxonomicStatus: "accepted",
    taxonRank: specificEpithet ? "species" : "genus",
    kingdom: "Plantae",
    phylum: "Tracheophyta",
    class: "",
    order: "",
    family: en.family || "",
    genus,
    specificEpithet,
    taxonRemarks: en.synonyms ? "Synonyms recorded in frontmatter; see references." : "",
    references: url,
    license,
    bibliographicCitation: `Costa Rica Tree Atlas (${new Date().getFullYear()}). ${sci}. Retrieved from ${url}`,
    datasetID: "crta:v" + VERSION,
    datasetName: "Costa Rica Tree Atlas — Species Corpus",
    rightsHolder: "Costa Rica Tree Atlas contributors",
    // Extension key → join via vernacularname.tsv
  };
}

const TAXON_HEADER = [
  "taxonID",
  "scientificName",
  "scientificNameAuthorship",
  "taxonomicStatus",
  "taxonRank",
  "kingdom",
  "phylum",
  "class",
  "order",
  "family",
  "genus",
  "specificEpithet",
  "taxonRemarks",
  "references",
  "license",
  "bibliographicCitation",
  "datasetID",
  "datasetName",
  "rightsHolder",
];

function vernacularRows(slug, en, es) {
  const rows = [];
  if (en && en.title) {
    rows.push({
      taxonID: `crta:tree:${slug}`,
      vernacularName: en.title,
      language: "en",
      countryCode: "CR",
      source: `https://costarica-tree-atlas.org/en/trees/${slug}`,
    });
  }
  if (es && es.title && es.title !== (en && en.title)) {
    rows.push({
      taxonID: `crta:tree:${slug}`,
      vernacularName: es.title,
      language: "es",
      countryCode: "CR",
      source: `https://costarica-tree-atlas.org/es/trees/${slug}`,
    });
  }
  return rows;
}

const VERNACULAR_HEADER = ["taxonID", "vernacularName", "language", "countryCode", "source"];

function descriptionRows(slug, en, es) {
  const rows = [];
  if (en && en.description) {
    rows.push({
      taxonID: `crta:tree:${slug}`,
      description: en.description,
      type: "summary",
      language: "en",
      source: `https://costarica-tree-atlas.org/en/trees/${slug}`,
    });
  }
  if (es && es.description) {
    rows.push({
      taxonID: `crta:tree:${slug}`,
      description: es.description,
      type: "summary",
      language: "es",
      source: `https://costarica-tree-atlas.org/es/trees/${slug}`,
    });
  }
  return rows;
}

const DESCRIPTION_HEADER = ["taxonID", "description", "type", "language", "source"];

// ---------------------------------------------------------------------------
// TSV writer (Darwin Core archives use tab-delimited text)
// ---------------------------------------------------------------------------

function tsvEscape(v) {
  if (v === null || v === undefined) return "";
  // Replace tabs and newlines that would break TSV row boundaries.
  return String(v).replace(/\t/g, " ").replace(/\r?\n/g, " ").trim();
}

function writeTSV(file, header, rows) {
  const lines = [header.join("\t")];
  for (const row of rows) {
    lines.push(header.map((h) => tsvEscape(row[h])).join("\t"));
  }
  writeFileSync(file, lines.join("\n") + "\n", "utf8");
  console.log(`  ✅ ${file.replace(REPO_ROOT + "/", "")} — ${rows.length} rows`);
}

// ---------------------------------------------------------------------------
// meta.xml — DwC-A descriptor
// ---------------------------------------------------------------------------

const META_XML = `<?xml version="1.0" encoding="UTF-8"?>
<archive xmlns="http://rs.tdwg.org/dwc/text/" metadata="eml.xml">
  <core encoding="UTF-8" fieldsTerminatedBy="\\t" linesTerminatedBy="\\n" fieldsEnclosedBy="" ignoreHeaderLines="1" rowType="http://rs.tdwg.org/dwc/terms/Taxon">
    <files><location>taxon.tsv</location></files>
    <id index="0" />
    <field index="1"  term="http://rs.tdwg.org/dwc/terms/scientificName"/>
    <field index="2"  term="http://rs.tdwg.org/dwc/terms/scientificNameAuthorship"/>
    <field index="3"  term="http://rs.tdwg.org/dwc/terms/taxonomicStatus"/>
    <field index="4"  term="http://rs.tdwg.org/dwc/terms/taxonRank"/>
    <field index="5"  term="http://rs.tdwg.org/dwc/terms/kingdom"/>
    <field index="6"  term="http://rs.tdwg.org/dwc/terms/phylum"/>
    <field index="7"  term="http://rs.tdwg.org/dwc/terms/class"/>
    <field index="8"  term="http://rs.tdwg.org/dwc/terms/order"/>
    <field index="9"  term="http://rs.tdwg.org/dwc/terms/family"/>
    <field index="10" term="http://rs.tdwg.org/dwc/terms/genus"/>
    <field index="11" term="http://rs.tdwg.org/dwc/terms/specificEpithet"/>
    <field index="12" term="http://rs.tdwg.org/dwc/terms/taxonRemarks"/>
    <field index="13" term="http://purl.org/dc/terms/references"/>
    <field index="14" term="http://purl.org/dc/terms/license"/>
    <field index="15" term="http://purl.org/dc/terms/bibliographicCitation"/>
    <field index="16" term="http://rs.tdwg.org/dwc/terms/datasetID"/>
    <field index="17" term="http://rs.tdwg.org/dwc/terms/datasetName"/>
    <field index="18" term="http://purl.org/dc/terms/rightsHolder"/>
  </core>
  <extension encoding="UTF-8" fieldsTerminatedBy="\\t" linesTerminatedBy="\\n" fieldsEnclosedBy="" ignoreHeaderLines="1" rowType="http://rs.gbif.org/terms/1.0/VernacularName">
    <files><location>vernacularname.tsv</location></files>
    <coreid index="0" />
    <field index="1" term="http://rs.tdwg.org/dwc/terms/vernacularName"/>
    <field index="2" term="http://purl.org/dc/terms/language"/>
    <field index="3" term="http://rs.tdwg.org/dwc/terms/countryCode"/>
    <field index="4" term="http://purl.org/dc/terms/source"/>
  </extension>
  <extension encoding="UTF-8" fieldsTerminatedBy="\\t" linesTerminatedBy="\\n" fieldsEnclosedBy="" ignoreHeaderLines="1" rowType="http://rs.gbif.org/terms/1.0/Description">
    <files><location>description.tsv</location></files>
    <coreid index="0" />
    <field index="1" term="http://purl.org/dc/terms/description"/>
    <field index="2" term="http://purl.org/dc/terms/type"/>
    <field index="3" term="http://purl.org/dc/terms/language"/>
    <field index="4" term="http://purl.org/dc/terms/source"/>
  </extension>
</archive>
`;

// ---------------------------------------------------------------------------
// eml.xml — Ecological Metadata Language
// ---------------------------------------------------------------------------

function emlXML() {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<eml:eml xmlns:eml="https://eml.ecoinformatics.org/eml-2.2.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://eml.ecoinformatics.org/eml-2.2.0 https://eml.ecoinformatics.org/eml-2.2.0/eml.xsd"
         packageId="crta-${VERSION}" system="costarica-tree-atlas" scope="system"
         xml:lang="en">
  <dataset>
    <title xml:lang="en">Costa Rica Tree Atlas — Species Corpus</title>
    <title xml:lang="es">Atlas de Árboles de Costa Rica — Corpus de Especies</title>
    <creator>
      <organizationName>Costa Rica Tree Atlas contributors</organizationName>
      <electronicMailAddress>contact@costarica-tree-atlas.org</electronicMailAddress>
      <onlineUrl>https://costarica-tree-atlas.org</onlineUrl>
    </creator>
    <pubDate>${today}</pubDate>
    <language>eng</language>
    <abstract>
      <para>The Costa Rica Tree Atlas is a bilingual (Spanish-first, English-parity) reference for the trees of Costa Rica. This Darwin Core Archive contains the species corpus: scientific names with authorities, family placement, vernacular names in Spanish and English, brief descriptions, and links back to the canonical species pages on the Atlas. Conservation status, ethnobotany, safety, and gallery imagery are referenced through the <code>references</code> URL field; the full editorial content remains on the website under CC BY 4.0.</para>
      <para xml:lang="es">El Atlas de Árboles de Costa Rica es una referencia bilingüe (español primero, paridad en inglés) sobre los árboles de Costa Rica. Este Archivo Darwin Core contiene el corpus de especies: nombres científicos con autoría, familia, nombres vernáculos en español e inglés, descripciones breves y enlaces a las fichas canónicas. El estado de conservación, etnobotánica, seguridad e imágenes se referencian a través del campo <code>references</code>; el contenido editorial completo permanece en el sitio bajo CC BY 4.0.</para>
    </abstract>
    <intellectualRights>
      <para>Released under the Creative Commons Attribution 4.0 International License (CC BY 4.0). When citing this dataset, please use the bibliographicCitation field for individual taxa and the DOI for the corpus as a whole.</para>
    </intellectualRights>
    <licensed>
      <licenseName>Creative Commons Attribution 4.0 International (CC BY 4.0)</licenseName>
      <url>https://creativecommons.org/licenses/by/4.0/</url>
      <identifier>CC-BY-4.0</identifier>
    </licensed>
    <coverage>
      <geographicCoverage>
        <geographicDescription>Costa Rica (national scope; data describes species occurring in Costa Rica)</geographicDescription>
        <boundingCoordinates>
          <westBoundingCoordinate>-87.10</westBoundingCoordinate>
          <eastBoundingCoordinate>-82.55</eastBoundingCoordinate>
          <northBoundingCoordinate>11.22</northBoundingCoordinate>
          <southBoundingCoordinate>8.04</southBoundingCoordinate>
        </boundingCoordinates>
      </geographicCoverage>
      <taxonomicCoverage>
        <generalTaxonomicCoverage>Vascular plants (Tracheophyta), curated subset of Costa Rica's tree flora.</generalTaxonomicCoverage>
        <taxonomicClassification>
          <taxonRankName>kingdom</taxonRankName>
          <taxonRankValue>Plantae</taxonRankValue>
        </taxonomicClassification>
      </taxonomicCoverage>
    </coverage>
    <contact>
      <organizationName>Costa Rica Tree Atlas</organizationName>
      <electronicMailAddress>contact@costarica-tree-atlas.org</electronicMailAddress>
      <onlineUrl>https://costarica-tree-atlas.org</onlineUrl>
    </contact>
    <methods>
      <methodStep>
        <description>
          <para>Species records are authored as MDX files in the Costa Rica Tree Atlas repository. Scientific names are normalized against GBIF Backbone, POWO (Kew), and IPNI via <code>scripts/backfill-canonical-ids.mjs</code>. IUCN conservation status, CITES appendix, and Costa Rica national status (SINAC) are sourced from the relevant authority and audited by <code>scripts/audit-factual-accuracy.mjs</code>. Indigenous knowledge content (when present) is governed by <code>docs/INDIGENOUS_KNOWLEDGE_GOVERNANCE.md</code> and may be redacted from public exports.</para>
        </description>
      </methodStep>
    </methods>
    <additionalMetadata>
      <metadata>
        <gbif>
          <dateStamp>${today}T00:00:00Z</dateStamp>
          <hierarchyLevel>dataset</hierarchyLevel>
          <citation>Costa Rica Tree Atlas (${new Date().getFullYear()}). Costa Rica Tree Atlas — Species Corpus, v${VERSION}. Dataset.</citation>
          <bibliography>
            <citation>POWO (${new Date().getFullYear()}). Plants of the World Online. Royal Botanic Gardens, Kew. https://powo.science.kew.org/</citation>
            <citation>GBIF Secretariat (${new Date().getFullYear()}). GBIF Backbone Taxonomy. https://doi.org/10.15468/39omei</citation>
            <citation>IUCN (${new Date().getFullYear()}). The IUCN Red List of Threatened Species. https://www.iucnredlist.org/</citation>
          </bibliography>
        </gbif>
      </metadata>
    </additionalMetadata>
  </dataset>
</eml:eml>
`;
}

// ---------------------------------------------------------------------------
// Drive the export
// ---------------------------------------------------------------------------

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const taxonRows = slugs.map((slug) => taxonRow(slug, enCorpus[slug] || {}));

const vernacularData = [];
for (const slug of slugs) {
  vernacularData.push(...vernacularRows(slug, enCorpus[slug], esCorpus[slug]));
}

const descriptionData = [];
for (const slug of slugs) {
  descriptionData.push(...descriptionRows(slug, enCorpus[slug], esCorpus[slug]));
}

console.log(`📦 Writing Darwin Core Archive to ${OUT_DIR}/ …`);

writeTSV(join(OUT_DIR, "taxon.tsv"), TAXON_HEADER, taxonRows);
writeTSV(join(OUT_DIR, "vernacularname.tsv"), VERNACULAR_HEADER, vernacularData);
writeTSV(join(OUT_DIR, "description.tsv"), DESCRIPTION_HEADER, descriptionData);

writeFileSync(join(OUT_DIR, "meta.xml"), META_XML, "utf8");
writeFileSync(join(OUT_DIR, "eml.xml"), emlXML(), "utf8");

console.log(`  ✅ meta.xml`);
console.log(`  ✅ eml.xml (version=${VERSION})`);

// ---------------------------------------------------------------------------
// Optional: zip the archive
// ---------------------------------------------------------------------------

if (SHOULD_ZIP) {
  const { spawnSync } = await import("node:child_process");
  const zipName = `costa-rica-tree-atlas-dwca-${VERSION}.zip`;
  const zipPath = join(OUT_DIR, "..", zipName);
  // Use the system zip(1) — present on macOS and most Linux distros. We
  // intentionally avoid adding a Node zip dependency for the scaffold.
  const result = spawnSync(
    "zip",
    ["-j", "-r", zipPath, OUT_DIR],
    { cwd: REPO_ROOT, stdio: "inherit" }
  );
  if (result.status === 0) {
    console.log(`  ✅ ${zipPath.replace(REPO_ROOT + "/", "")}`);
  } else {
    console.error("⚠️  zip command failed (status " + result.status + "). The archive files in " + OUT_DIR + " are still valid; you can zip them manually.");
  }
}

console.log(`\n🌲 Darwin Core Archive export complete.`);
console.log(`   Taxa:           ${taxonRows.length}`);
console.log(`   Vernacular:     ${vernacularData.length}`);
console.log(`   Descriptions:   ${descriptionData.length}`);
console.log(`   Output:         ${OUT_DIR}/`);
console.log(`\nNext steps:`);
console.log(`  - Validate the archive with the GBIF DwC-A validator:`);
console.log(`    https://www.gbif.org/tools/data-validator`);
console.log(`  - Deposit to Zenodo (https://zenodo.org) for a DOI.`);
console.log(`  - Update <meta name="citation_doi"> on species pages once a DOI is minted.`);
