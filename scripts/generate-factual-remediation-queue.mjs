#!/usr/bin/env node
/**
 * Script: generate-factual-remediation-queue.mjs
 * Description: Generate a prioritized remediation queue from factual audit JSON output.
 *
 * Usage:
 *   node scripts/generate-factual-remediation-queue.mjs
 *   node scripts/generate-factual-remediation-queue.mjs --input=reports/factual-audit.full.json
 *   node scripts/generate-factual-remediation-queue.mjs --output=reports/factual-remediation-queue.md
 *   node scripts/generate-factual-remediation-queue.mjs --json-output=reports/factual-remediation-queue.json
 *   node scripts/generate-factual-remediation-queue.mjs --top=50
 *   node scripts/generate-factual-remediation-queue.mjs --dry-run
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const args = process.argv.slice(2);
const inputArg = args.find((arg) => arg.startsWith("--input="));
const outputArg = args.find((arg) => arg.startsWith("--output="));
const jsonOutputArg = args.find((arg) => arg.startsWith("--json-output="));
const topArg = args.find((arg) => arg.startsWith("--top="));
const dryRun = args.includes("--dry-run");

const inputPath = inputArg
  ? inputArg.split("=")[1]
  : "reports/factual-audit.full.json";
const outputPath = outputArg
  ? outputArg.split("=")[1]
  : "reports/factual-remediation-queue.md";
const jsonOutputPath = jsonOutputArg
  ? jsonOutputArg.split("=")[1]
  : "reports/factual-remediation-queue.json";
const topN = topArg ? Number(topArg.split("=")[1]) : 50;

const HELP = `\
Generate Factual Remediation Queue\n\
\n\
Options:\n\
  --input=<path>         Input factual audit JSON (default: reports/factual-audit.full.json)\n\
  --output=<path>        Output markdown report path (default: reports/factual-remediation-queue.md)\n\
  --json-output=<path>   Output JSON queue path (default: reports/factual-remediation-queue.json)\n\
  --top=<n>              Number of top prioritized trees to include (default: 50)\n\
  --dry-run              Print summary only, do not write files\n\
  --help                 Show help\n`;

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP);
  process.exit(0);
}

function absFromMaybeRelative(filePath) {
  return path.isAbsolute(filePath) ? filePath : path.join(ROOT_DIR, filePath);
}

function slugFromFinding(finding) {
  if (finding.slug?.startsWith("comparison/")) return null;
  if (finding.slug?.startsWith("glossary/")) return null;
  return finding.slug ?? null;
}

function scoreFinding(finding) {
  const baseByType = {
    frontmatter_mismatch: 100,
    invalid_conservation_status: 95,
    missing_en_file: 95,
    missing_es_file: 95,
    iucn_status_mismatch: 65,
    gbif_family_mismatch: 55,
    missing_citations_high_risk: 45,
    gbif_low_confidence: 15,
    gbif_no_match: 20,
    external_check_failed: 10,
  };

  let score = baseByType[finding.type] ?? 10;

  if (finding.type === "missing_citations_high_risk") {
    const claims = Number(finding.claimEstimate ?? 0);
    score += Math.min(30, claims * 2);
  }

  if (finding.type === "iucn_status_mismatch") {
    const local = String(finding.localIucn ?? "");
    const external = String(finding.externalIucn ?? "");
    const severe = new Set(["CR", "EN", "VU"]);
    if (severe.has(local) || severe.has(external)) score += 10;
  }

  return score;
}

function derivePriority(row) {
  if (row.counts.errors > 0) return "P0-critical";

  if (row.counts.iucnMismatches > 0 || row.counts.familyMismatches > 0) {
    return "P1-high";
  }

  if (row.counts.citationGaps >= 2) {
    return "P2-medium";
  }

  if (row.counts.citationGaps === 1) {
    return "P3-low";
  }

  return "P3-low";
}

function buildQueue(audit) {
  const bySlug = new Map();

  const allFindings = [
    ...audit.findings.localeParity,
    ...audit.findings.schemaFlags,
    ...audit.findings.externalDrift,
    ...audit.findings.citationCoverage,
  ];

  for (const finding of allFindings) {
    const slug = slugFromFinding(finding);
    if (!slug) continue;

    const existing = bySlug.get(slug) ?? {
      slug,
      score: 0,
      findings: [],
      counts: {
        errors: 0,
        warnings: 0,
        citationGaps: 0,
        iucnMismatches: 0,
        familyMismatches: 0,
      },
    };

    const score = scoreFinding(finding);
    existing.score += score;
    existing.findings.push({ ...finding, _score: score });

    if (finding.severity === "error") existing.counts.errors += 1;
    if (finding.severity === "warning") existing.counts.warnings += 1;
    if (finding.type === "missing_citations_high_risk") {
      existing.counts.citationGaps += 1;
    }
    if (finding.type === "iucn_status_mismatch") {
      existing.counts.iucnMismatches += 1;
    }
    if (finding.type === "gbif_family_mismatch") {
      existing.counts.familyMismatches += 1;
    }

    bySlug.set(slug, existing);
  }

  const rows = [...bySlug.values()]
    .map((row) => ({
      ...row,
      priority: derivePriority(row),
      topIssues: row.findings
        .sort((a, b) => b._score - a._score)
        .slice(0, 3)
        .map((f) => f.type),
    }))
    .sort((a, b) => b.score - a.score);

  return rows;
}

function toMarkdown({ audit, queue, top }) {
  const generatedAt = new Date().toISOString();
  const topRows = queue.slice(0, top);

  const lines = [];
  lines.push("# Factual Accuracy Remediation Queue");
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push(`Source audit: ${audit.generatedAt}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Trees audited: ${audit.summary.treesAudited}`);
  lines.push(`- External checks: ${audit.summary.externalTreesChecked}`);
  lines.push(
    `- Total findings: ${queue.reduce((acc, row) => acc + row.findings.length, 0)}`
  );
  lines.push(`- Trees with findings: ${queue.length}`);
  lines.push("");
  lines.push("## Top Priorities");
  lines.push("");
  lines.push(
    "| Priority | Slug | Score | Errors | Warnings | Citation Gaps | IUCN Drift | Family Drift | Top Issues |"
  );
  lines.push("|---|---|---:|---:|---:|---:|---:|---:|---|");

  for (const row of topRows) {
    lines.push(
      `| ${row.priority} | ${row.slug} | ${row.score} | ${row.counts.errors} | ${row.counts.warnings} | ${row.counts.citationGaps} | ${row.counts.iucnMismatches} | ${row.counts.familyMismatches} | ${row.topIssues.join(", ")} |`
    );
  }

  lines.push("");
  lines.push("## Recommended Triage Workflow");
  lines.push("");
  lines.push(
    "1. Resolve any `P0-critical` items first (schema/parity errors)."
  );
  lines.push(
    "2. For `P1-high`, review IUCN drift against authoritative IUCN pages and update EN+ES frontmatter together."
  );
  lines.push(
    "3. For citation gaps, add claim-level citations in high-risk sections (history/cultural/agriculture/medicinal/safety). "
  );
  lines.push(
    "4. Re-run factual audit and regenerate this queue after each batch."
  );
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const inAbs = absFromMaybeRelative(inputPath);
  const outAbs = absFromMaybeRelative(outputPath);
  const outJsonAbs = absFromMaybeRelative(jsonOutputPath);

  const raw = await fs.readFile(inAbs, "utf-8");
  const audit = JSON.parse(raw);

  if (!audit?.findings || !audit?.summary) {
    throw new Error("Input file does not appear to be a factual audit report.");
  }

  const queue = buildQueue(audit);

  const payload = {
    generatedAt: new Date().toISOString(),
    input: path.relative(ROOT_DIR, inAbs),
    counts: {
      treesWithFindings: queue.length,
      totalFindings: queue.reduce((acc, row) => acc + row.findings.length, 0),
    },
    queue,
  };

  const md = toMarkdown({ audit, queue, top: topN });

  console.log(`📊 Queue generated from ${path.relative(ROOT_DIR, inAbs)}`);
  console.log(`   Trees with findings: ${payload.counts.treesWithFindings}`);
  console.log(`   Total findings: ${payload.counts.totalFindings}`);
  console.log(`   Top shown: ${topN}`);

  if (dryRun) {
    console.log("🧪 Dry run enabled, no files written.");
    return;
  }

  await fs.mkdir(path.dirname(outAbs), { recursive: true });
  await fs.mkdir(path.dirname(outJsonAbs), { recursive: true });

  await Promise.all([
    fs.writeFile(outAbs, md, "utf-8"),
    fs.writeFile(outJsonAbs, JSON.stringify(payload, null, 2), "utf-8"),
  ]);

  console.log(`📝 Wrote markdown queue: ${path.relative(ROOT_DIR, outAbs)}`);
  console.log(`📝 Wrote JSON queue: ${path.relative(ROOT_DIR, outJsonAbs)}`);
}

main().catch((error) => {
  console.error(
    "❌ Failed to generate remediation queue:",
    error?.message || error
  );
  process.exit(1);
});
