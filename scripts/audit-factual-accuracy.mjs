#!/usr/bin/env node
/**
 * Script: audit-factual-accuracy.mjs
 * Description: Exhaustive factual accuracy audit for Costa Rica Tree Atlas content.
 *
 * What it checks:
 * 1) EN/ES factual parity for tree frontmatter (scientificName, family, conservationStatus)
 * 2) External factual drift for tree scientific names and IUCN status using GBIF/IUCN
 * 3) Citation coverage in high-risk narrative sections (history/cultural/agricultural/medicinal)
 *
 * Usage:
 *   node scripts/audit-factual-accuracy.mjs
 *   node scripts/audit-factual-accuracy.mjs --json
 *   node scripts/audit-factual-accuracy.mjs --verbose
 *   node scripts/audit-factual-accuracy.mjs --tree=ceiba
 *   node scripts/audit-factual-accuracy.mjs --max-api=40
 *   node scripts/audit-factual-accuracy.mjs --skip-external
 *   node scripts/audit-factual-accuracy.mjs --write=reports/factual-audit.json
 *   node scripts/audit-factual-accuracy.mjs --dry-run
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const TREES_EN_DIR = path.join(ROOT_DIR, "content/trees/en");
const TREES_ES_DIR = path.join(ROOT_DIR, "content/trees/es");
const COMPARISONS_EN_DIR = path.join(ROOT_DIR, "content/comparisons/en");
const COMPARISONS_ES_DIR = path.join(ROOT_DIR, "content/comparisons/es");
const GLOSSARY_EN_DIR = path.join(ROOT_DIR, "content/glossary/en");
const GLOSSARY_ES_DIR = path.join(ROOT_DIR, "content/glossary/es");

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const verbose = args.includes("--verbose") || args.includes("-v");
const dryRun = args.includes("--dry-run");
const skipExternal = args.includes("--skip-external");
const failOnWarning = args.includes("--fail-on-warning");
const treeArg = args.find((arg) => arg.startsWith("--tree="));
const singleTree = treeArg ? treeArg.split("=")[1] : null;
const maxApiArg = args.find((arg) => arg.startsWith("--max-api="));
const maxApi = maxApiArg ? Number(maxApiArg.split("=")[1]) : 60;
const writeArg = args.find((arg) => arg.startsWith("--write="));
const writePath = writeArg ? writeArg.split("=")[1] : null;

const HELP_TEXT = `\
Factual Accuracy Auditor\n\
\n\
Options:\n\
  --json                 Output JSON only\n\
  --verbose, -v          Show detailed output\n\
  --tree=<slug>          Audit only one tree slug\n\
  --max-api=<n>          Max trees to query external APIs for (default: 60)\n\
  --skip-external        Skip GBIF/IUCN external checks\n\
  --write=<path>         Write JSON report to file\n\
  --dry-run              Print planned scope without making external calls\n\
  --fail-on-warning      Exit non-zero when warnings exist (default: only errors)\n\
  --help                 Show this help\n`;

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP_TEXT);
  process.exit(0);
}

const IUCN_CODES = new Set([
  "EX",
  "EW",
  "CR",
  "EN",
  "VU",
  "NT",
  "LC",
  "DD",
  "NE",
]);

const HIGH_RISK_SECTION_PATTERNS = [
  /##\s+applications?/i,
  /##\s+uses?/i,
  /##\s+cultural/i,
  /##\s+history/i,
  /##\s+ethnobotan/i,
  /##\s+medic/i,
  /##\s+safety/i,
  /##\s+conservation/i,
  /##\s+sostenibilidad/i,
  /##\s+aplicaciones?/i,
  /##\s+cultural/i,
  /##\s+historia/i,
  /##\s+medicin/i,
  /##\s+seguridad/i,
  /##\s+conservaci/i,
];

const CLAIM_HINT_PATTERN =
  /(\b(\d+\+?|\d+\s?-\s?\d+)\b|\b(used|supports|contains|causes|requires|prevents|protects|endemic|native|introduced|toxic|medicinal|sacred|pollinated|threatened|endangered|critically|least concern|iucn|gbif|utilizado|contiene|causa|requiere|previene|protege|end[eé]mico|nativo|introducido|t[oó]xico|medicinal|sagrado|polinizado|amenazado|en peligro|preocupaci[oó]n menor)\b)/i;

const report = {
  generatedAt: new Date().toISOString(),
  mode: {
    singleTree,
    maxApi,
    skipExternal,
    dryRun,
  },
  inventory: {
    treesEn: 0,
    treesEs: 0,
    comparisonsEn: 0,
    comparisonsEs: 0,
    glossaryEn: 0,
    glossaryEs: 0,
  },
  summary: {
    treesAudited: 0,
    externalTreesChecked: 0,
    errors: 0,
    warnings: 0,
  },
  findings: {
    localeParity: [],
    externalDrift: [],
    citationCoverage: [],
    schemaFlags: [],
  },
};

function scoreSeverity(type) {
  if (
    [
      "missing_es_file",
      "missing_en_file",
      "frontmatter_mismatch",
      "invalid_conservation_status",
    ].includes(type)
  ) {
    return "error";
  }

  if (
    [
      "iucn_status_mismatch",
      "gbif_family_mismatch",
      "missing_citations_high_risk",
    ].includes(type)
  ) {
    return "warning";
  }

  return "info";
}

async function listMdxSlugs(dir) {
  const files = await fs.readdir(dir);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function parseFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0]?.trim() !== "---") {
    return { frontmatter: {}, body: content };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }

  if (end === -1) {
    return { frontmatter: {}, body: content };
  }

  const fmLines = lines.slice(1, end);
  const frontmatter = {};

  let currentKey = null;
  for (const rawLine of fmLines) {
    const line = rawLine.replace(/\t/g, "    ");
    const keyMatch = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);

    if (keyMatch) {
      const [, key, value] = keyMatch;
      currentKey = key;

      if (value === "") {
        frontmatter[key] = [];
      } else if (value.startsWith("[")) {
        const inner = value.slice(1, -1).trim();
        frontmatter[key] = inner
          ? inner
              .split(",")
              .map((v) => v.trim().replace(/^['\"]|['\"]$/g, ""))
              .filter(Boolean)
          : [];
      } else {
        frontmatter[key] = value.replace(/^['\"]|['\"]$/g, "");
      }
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey && Array.isArray(frontmatter[currentKey])) {
      frontmatter[currentKey].push(
        listMatch[1].trim().replace(/^['\"]|['\"]$/g, "")
      );
    }
  }

  const body = lines.slice(end + 1).join("\n");
  return { frontmatter, body };
}

async function readMdxBySlug(baseDir, slug) {
  const filePath = path.join(baseDir, `${slug}.mdx`);
  const content = await fs.readFile(filePath, "utf-8");
  const parsed = parseFrontmatter(content);
  return { filePath, content, ...parsed };
}

function normalizeIucnCode(code) {
  if (!code) return null;
  const upper = String(code).toUpperCase().trim();
  if (IUCN_CODES.has(upper)) return upper;

  const map = {
    EXTINCT: "EX",
    EXTINCT_IN_THE_WILD: "EW",
    CRITICALLY_ENDANGERED: "CR",
    ENDANGERED: "EN",
    VULNERABLE: "VU",
    NEAR_THREATENED: "NT",
    LEAST_CONCERN: "LC",
    DATA_DEFICIENT: "DD",
    NOT_EVALUATED: "NE",
  };

  return map[upper] ?? null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function bodySupportsDirectIucnStatus(body, localIucn) {
  if (!body || !localIucn) return false;
  if (!/iucnredlist\.org\/species\//i.test(body)) return false;

  const statusLabels = {
    EX: ["extinct"],
    EW: ["extinct in the wild"],
    CR: ["critically endangered"],
    EN: ["endangered"],
    VU: ["vulnerable"],
    NT: ["near threatened"],
    LC: ["least concern"],
    DD: ["data deficient"],
    NE: ["not evaluated"],
  };

  return (statusLabels[localIucn] || []).some((label) =>
    new RegExp(`\\b${escapeRegExp(label)}\\b`, "i").test(body)
  );
}

function bodyDocumentsFamilySplit(body, localFamily, gbifFamily) {
  if (!body || !localFamily || !gbifFamily) return false;

  const lowerBody = body.toLowerCase();
  const mentionsBothFamilies =
    lowerBody.includes(localFamily.toLowerCase()) &&
    lowerBody.includes(gbifFamily.toLowerCase());

  if (!mentionsBothFamilies) return false;

  return /(taxonom|phylogen|debated|circumscription|apg|split this family|split this clade)/i.test(
    body
  );
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "CostaRicaTreeAtlas-FactualAudit/1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

async function gbifMatch(scientificName) {
  const url = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&verbose=true`;
  const data = await fetchJSON(url);
  if (!data || data.matchType === "NONE") return null;
  return data;
}

async function gbifIucnByTaxonKey(taxonKey) {
  const url = `https://api.gbif.org/v1/species/${taxonKey}/iucnRedListCategory`;
  try {
    const data = await fetchJSON(url);
    return normalizeIucnCode(data?.code || data?.category);
  } catch {
    return null;
  }
}

function splitSections(body) {
  const lines = body.split("\n");
  const sections = [];
  let current = { heading: "(preamble)", content: [] };

  for (const line of lines) {
    if (/^##\s+/.test(line.trim())) {
      sections.push({ ...current, content: current.content.join("\n") });
      current = { heading: line.trim(), content: [] };
    } else {
      current.content.push(line);
    }
  }

  sections.push({ ...current, content: current.content.join("\n") });
  return sections;
}

function detectCitationCount(sectionContent) {
  const markdownLinks = (
    sectionContent.match(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g) || []
  ).length;
  const rawUrls = (sectionContent.match(/https?:\/\/[^\s)>"]+/g) || []).length;
  const referenceTags = (sectionContent.match(/<Reference\b/g) || []).length;
  const externalLinks = (sectionContent.match(/<ExternalLink\b/g) || []).length;
  return markdownLinks + rawUrls + referenceTags + externalLinks;
}

function estimateClaimCount(sectionContent) {
  const sentences = sectionContent
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  let count = 0;
  for (const sentence of sentences) {
    if (CLAIM_HINT_PATTERN.test(sentence)) {
      count++;
    }
  }
  return count;
}

function auditCitationCoverage({ slug, locale, body, filePath }) {
  const sections = splitSections(body);

  for (const section of sections) {
    if (
      !HIGH_RISK_SECTION_PATTERNS.some((pattern) =>
        pattern.test(section.heading)
      )
    ) {
      continue;
    }

    const claimEstimate = estimateClaimCount(section.content);
    const citations = detectCitationCount(section.content);

    if (claimEstimate >= 3 && citations === 0) {
      addFinding("citationCoverage", {
        type: "missing_citations_high_risk",
        severity: scoreSeverity("missing_citations_high_risk"),
        slug,
        locale,
        heading: section.heading,
        claimEstimate,
        citationCount: citations,
        filePath: path.relative(ROOT_DIR, filePath),
      });
    }
  }
}

function addFinding(group, finding) {
  report.findings[group].push(finding);
  if (finding.severity === "error") report.summary.errors++;
  if (finding.severity === "warning") report.summary.warnings++;
}

async function auditTree(slug, externalAllowed, externalBudget) {
  let en = null;
  let es = null;

  try {
    en = await readMdxBySlug(TREES_EN_DIR, slug);
  } catch {
    addFinding("localeParity", {
      type: "missing_en_file",
      severity: scoreSeverity("missing_en_file"),
      slug,
      filePath: path.relative(ROOT_DIR, path.join(TREES_EN_DIR, `${slug}.mdx`)),
    });
    return;
  }

  try {
    es = await readMdxBySlug(TREES_ES_DIR, slug);
  } catch {
    addFinding("localeParity", {
      type: "missing_es_file",
      severity: scoreSeverity("missing_es_file"),
      slug,
      filePath: path.relative(ROOT_DIR, path.join(TREES_ES_DIR, `${slug}.mdx`)),
    });
    return;
  }

  report.summary.treesAudited++;

  const compareFields = ["scientificName", "family", "conservationStatus"];
  for (const field of compareFields) {
    const enValue = en.frontmatter[field] ?? null;
    const esValue = es.frontmatter[field] ?? null;
    if (enValue !== esValue) {
      addFinding("localeParity", {
        type: "frontmatter_mismatch",
        severity: scoreSeverity("frontmatter_mismatch"),
        slug,
        field,
        enValue,
        esValue,
        enFilePath: path.relative(ROOT_DIR, en.filePath),
        esFilePath: path.relative(ROOT_DIR, es.filePath),
      });
    }
  }

  const enStatus = normalizeIucnCode(en.frontmatter.conservationStatus);
  if (!enStatus) {
    addFinding("schemaFlags", {
      type: "invalid_conservation_status",
      severity: scoreSeverity("invalid_conservation_status"),
      slug,
      locale: "en",
      value: en.frontmatter.conservationStatus ?? null,
      filePath: path.relative(ROOT_DIR, en.filePath),
    });
  }

  const esStatus = normalizeIucnCode(es.frontmatter.conservationStatus);
  if (!esStatus) {
    addFinding("schemaFlags", {
      type: "invalid_conservation_status",
      severity: scoreSeverity("invalid_conservation_status"),
      slug,
      locale: "es",
      value: es.frontmatter.conservationStatus ?? null,
      filePath: path.relative(ROOT_DIR, es.filePath),
    });
  }

  auditCitationCoverage({
    slug,
    locale: "en",
    body: en.body,
    filePath: en.filePath,
  });
  auditCitationCoverage({
    slug,
    locale: "es",
    body: es.body,
    filePath: es.filePath,
  });

  if (!externalAllowed || skipExternal || dryRun) return;

  if (externalBudget.count >= maxApi) return;

  const scientificName = en.frontmatter.scientificName;
  if (!scientificName) return;

  externalBudget.count++;
  report.summary.externalTreesChecked++;

  try {
    const match = await gbifMatch(scientificName);
    if (!match) {
      addFinding("externalDrift", {
        type: "gbif_no_match",
        severity: "info",
        slug,
        scientificName,
      });
      return;
    }

    const confidence = Number(match.confidence ?? 0);
    if (confidence < 90) {
      addFinding("externalDrift", {
        type: "gbif_low_confidence",
        severity: "info",
        slug,
        scientificName,
        matchScientificName: match.scientificName,
        confidence,
      });
    }

    const localFamily = (en.frontmatter.family || "").toLowerCase().trim();
    const gbifFamily = (match.family || "").toLowerCase().trim();

    if (
      localFamily &&
      gbifFamily &&
      localFamily !== gbifFamily &&
      !bodyDocumentsFamilySplit(en.body, localFamily, gbifFamily)
    ) {
      addFinding("externalDrift", {
        type: "gbif_family_mismatch",
        severity: scoreSeverity("gbif_family_mismatch"),
        slug,
        scientificName,
        localFamily: en.frontmatter.family,
        gbifFamily: match.family,
      });
    }

    const localIucn = normalizeIucnCode(en.frontmatter.conservationStatus);
    if (localIucn && match.usageKey) {
      const gbifIucn = await gbifIucnByTaxonKey(match.usageKey);
      if (
        gbifIucn &&
        gbifIucn !== localIucn &&
        !bodySupportsDirectIucnStatus(en.body, localIucn)
      ) {
        addFinding("externalDrift", {
          type: "iucn_status_mismatch",
          severity: scoreSeverity("iucn_status_mismatch"),
          slug,
          scientificName,
          localIucn,
          externalIucn: gbifIucn,
          gbifTaxonKey: match.usageKey,
        });
      }
    }
  } catch (error) {
    addFinding("externalDrift", {
      type: "external_check_failed",
      severity: "info",
      slug,
      scientificName,
      error: String(error?.message || error),
    });
  }
}

async function gatherInventory() {
  const [
    treesEn,
    treesEs,
    comparisonsEn,
    comparisonsEs,
    glossaryEn,
    glossaryEs,
  ] = await Promise.all([
    listMdxSlugs(TREES_EN_DIR),
    listMdxSlugs(TREES_ES_DIR),
    listMdxSlugs(COMPARISONS_EN_DIR),
    listMdxSlugs(COMPARISONS_ES_DIR),
    listMdxSlugs(GLOSSARY_EN_DIR),
    listMdxSlugs(GLOSSARY_ES_DIR),
  ]);

  report.inventory.treesEn = treesEn.length;
  report.inventory.treesEs = treesEs.length;
  report.inventory.comparisonsEn = comparisonsEn.length;
  report.inventory.comparisonsEs = comparisonsEs.length;
  report.inventory.glossaryEn = glossaryEn.length;
  report.inventory.glossaryEs = glossaryEs.length;

  return {
    treesEn,
    treesEs,
    comparisonsEn,
    comparisonsEs,
    glossaryEn,
    glossaryEs,
  };
}

function printHumanReport() {
  console.log("\n" + "=".repeat(72));
  console.log("🌳 FACTUAL ACCURACY AUDIT REPORT");
  console.log("=".repeat(72));
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Trees audited: ${report.summary.treesAudited}`);
  console.log(`External checks: ${report.summary.externalTreesChecked}`);
  console.log(`Errors: ${report.summary.errors}`);
  console.log(`Warnings: ${report.summary.warnings}`);

  console.log("\nInventory:");
  console.log(
    `  Trees       EN ${report.inventory.treesEn} | ES ${report.inventory.treesEs}`
  );
  console.log(
    `  Comparisons EN ${report.inventory.comparisonsEn} | ES ${report.inventory.comparisonsEs}`
  );
  console.log(
    `  Glossary    EN ${report.inventory.glossaryEn} | ES ${report.inventory.glossaryEs}`
  );

  const parity = report.findings.localeParity.length;
  const drift = report.findings.externalDrift.length;
  const cites = report.findings.citationCoverage.length;
  const schema = report.findings.schemaFlags.length;

  console.log("\nFindings by category:");
  console.log(`  localeParity: ${parity}`);
  console.log(`  externalDrift: ${drift}`);
  console.log(`  citationCoverage: ${cites}`);
  console.log(`  schemaFlags: ${schema}`);

  if (verbose) {
    if (parity) {
      console.log("\n🔁 Locale Parity Findings (first 20):");
      for (const finding of report.findings.localeParity.slice(0, 20)) {
        console.log(
          `  - [${finding.severity}] ${finding.slug} :: ${finding.type}${finding.field ? ` (${finding.field})` : ""}`
        );
      }
    }

    if (drift) {
      console.log("\n🧭 External Drift Findings (first 20):");
      for (const finding of report.findings.externalDrift.slice(0, 20)) {
        console.log(
          `  - [${finding.severity}] ${finding.slug} :: ${finding.type}`
        );
      }
    }

    if (cites) {
      console.log("\n📚 Citation Coverage Findings (first 20):");
      for (const finding of report.findings.citationCoverage.slice(0, 20)) {
        console.log(
          `  - [${finding.severity}] ${finding.slug} (${finding.locale}) ${finding.heading} :: claims≈${finding.claimEstimate}, citations=${finding.citationCount}`
        );
      }
    }
  }

  console.log(
    "\nTip: run with --json --write=reports/factual-audit.json for full machine-readable output."
  );
  console.log("=".repeat(72) + "\n");
}

async function maybeWriteReport() {
  if (!writePath) return;
  const abs = path.isAbsolute(writePath)
    ? writePath
    : path.join(ROOT_DIR, writePath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, JSON.stringify(report, null, 2), "utf-8");
  if (!jsonOutput) {
    console.log(`📝 Wrote audit report: ${path.relative(ROOT_DIR, abs)}`);
  }
}

async function main() {
  if (!jsonOutput) {
    console.log("🔍 Running factual accuracy audit...");
    if (dryRun) {
      console.log("🧪 Dry run enabled: external checks disabled");
    }
  }

  const inventory = await gatherInventory();

  const enSet = new Set(inventory.treesEn);
  const esSet = new Set(inventory.treesEs);

  const comparisonsEnSet = new Set(inventory.comparisonsEn);
  const comparisonsEsSet = new Set(inventory.comparisonsEs);
  const glossaryEnSet = new Set(inventory.glossaryEn);
  const glossaryEsSet = new Set(inventory.glossaryEs);
  const externalBudget = { count: 0 };

  for (const slug of comparisonsEnSet) {
    if (!comparisonsEsSet.has(slug)) {
      addFinding("localeParity", {
        type: "missing_es_file",
        severity: scoreSeverity("missing_es_file"),
        slug: `comparison/${slug}`,
        filePath: path.relative(
          ROOT_DIR,
          path.join(COMPARISONS_ES_DIR, `${slug}.mdx`)
        ),
      });
    }
  }

  for (const slug of comparisonsEsSet) {
    if (!comparisonsEnSet.has(slug)) {
      addFinding("localeParity", {
        type: "missing_en_file",
        severity: scoreSeverity("missing_en_file"),
        slug: `comparison/${slug}`,
        filePath: path.relative(
          ROOT_DIR,
          path.join(COMPARISONS_EN_DIR, `${slug}.mdx`)
        ),
      });
    }
  }

  for (const slug of glossaryEnSet) {
    if (!glossaryEsSet.has(slug)) {
      addFinding("localeParity", {
        type: "missing_es_file",
        severity: scoreSeverity("missing_es_file"),
        slug: `glossary/${slug}`,
        filePath: path.relative(
          ROOT_DIR,
          path.join(GLOSSARY_ES_DIR, `${slug}.mdx`)
        ),
      });
    }
  }

  for (const slug of glossaryEsSet) {
    if (!glossaryEnSet.has(slug)) {
      addFinding("localeParity", {
        type: "missing_en_file",
        severity: scoreSeverity("missing_en_file"),
        slug: `glossary/${slug}`,
        filePath: path.relative(
          ROOT_DIR,
          path.join(GLOSSARY_EN_DIR, `${slug}.mdx`)
        ),
      });
    }
  }
  const targets = singleTree ? [singleTree] : [...enSet].sort();

  for (const slug of targets) {
    if (!enSet.has(slug)) {
      addFinding("localeParity", {
        type: "missing_en_file",
        severity: scoreSeverity("missing_en_file"),
        slug,
        filePath: path.relative(
          ROOT_DIR,
          path.join(TREES_EN_DIR, `${slug}.mdx`)
        ),
      });
      continue;
    }

    if (!esSet.has(slug)) {
      addFinding("localeParity", {
        type: "missing_es_file",
        severity: scoreSeverity("missing_es_file"),
        slug,
        filePath: path.relative(
          ROOT_DIR,
          path.join(TREES_ES_DIR, `${slug}.mdx`)
        ),
      });
      continue;
    }

    await auditTree(slug, !skipExternal, externalBudget);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReport();
  }

  await maybeWriteReport();

  const shouldFail = failOnWarning
    ? report.summary.errors > 0 || report.summary.warnings > 0
    : report.summary.errors > 0;

  process.exit(shouldFail ? 1 : 0);
}

main().catch(async (error) => {
  const msg = String(error?.stack || error?.message || error);
  console.error("❌ Factual audit failed:", msg);
  process.exit(2);
});
