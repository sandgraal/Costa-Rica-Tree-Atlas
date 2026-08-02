#!/usr/bin/env node

/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Auto-update the metrics dashboard in docs/IMPLEMENTATION_PLAN.md.
 *
 * Counts content files and per-lane checkbox completion, then rewrites the
 * dashboard block between the AUTO-METRICS markers.
 *
 * ---------------------------------------------------------------------------
 * Why this file was rewritten
 * ---------------------------------------------------------------------------
 * The previous version matched two things that do not exist in the plan:
 *
 *   /### Priority (\d+):/          the plan uses `### L1 — …` … `### L12 — …`
 *   /## 📊 Current Status Dashboard.*?---/s   no such heading
 *
 * Both were renamed in the v6 -> v7 plan rewrite. Every count therefore came
 * out 0/0, the dashboard replace was a no-op, `git diff --quiet` reported no
 * change, and no PR was ever opened — while the script printed
 * "✅ Metrics dashboard updated successfully!" and exited 0.
 *
 * The automation built to prevent count drift ran green for months while
 * fourteen documents drifted from 175 species to 180.
 *
 * It also hardcoded a "Technical Health" block (Lighthouse 48/100, "Auth
 * Status: ❌ Broken", "109/128 optimized") that was never measured by anything
 * and directly contradicted docs/README.md. Invented metrics are worse than
 * absent ones, so that block is gone.
 *
 * This version fails loudly instead: a missing marker or an unparsable plan is
 * a non-zero exit, not a cheerful no-op.
 *
 * Usage:
 *   node scripts/update-implementation-metrics.mjs
 *   node scripts/update-implementation-metrics.mjs --check    (CI: no writes)
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PLAN_PATH = join(ROOT, "docs", "IMPLEMENTATION_PLAN.md");

const CHECK_ONLY = process.argv.includes("--check");

const START_MARKER = "<!-- AUTO-METRICS:START -->";
const END_MARKER = "<!-- AUTO-METRICS:END -->";

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

const plan = readFileSync(PLAN_PATH, "utf-8");

// ---------------------------------------------------------------------------
// Content counts
// ---------------------------------------------------------------------------

function countMdx(...segments) {
  const dir = join(ROOT, ...segments);
  return readdirSync(dir).filter((f) => f.endsWith(".mdx")).length;
}

const content = {
  species: countMdx("content", "trees", "en"),
  speciesEs: countMdx("content", "trees", "es"),
  comparisons: countMdx("content", "comparisons", "en"),
  glossary: countMdx("content", "glossary", "en"),
  oralHistories: countMdx("content", "oral-histories", "en"),
};

if (content.species !== content.speciesEs) {
  fail(
    `EN/ES species files are out of sync: ${content.species} EN vs ` +
      `${content.speciesEs} ES. Every species must exist in both locales.`
  );
}

// ---------------------------------------------------------------------------
// Lane checkbox completion
// ---------------------------------------------------------------------------

/**
 * Lanes are `### L<n> — <title> <status emoji>` and run until the next `###`
 * or `##` heading.
 */
function countLanes(planText) {
  const laneHeading = /^### (L\d+) — (.+)$/gm;
  const lanes = [];
  const matches = [...planText.matchAll(laneHeading)];

  matches.forEach((match, index) => {
    const start = match.index + match[0].length;
    const end =
      index + 1 < matches.length ? matches[index + 1].index : planText.length;
    const body = planText.slice(start, end);

    const done = (body.match(/^\s*- \[x\]/gim) || []).length;
    const open = (body.match(/^\s*- \[ \]/gm) || []).length;
    const total = done + open;

    lanes.push({
      id: match[1],
      title: match[2].trim(),
      done,
      total,
      percentage: total ? Math.round((done / total) * 100) : 0,
    });
  });

  return lanes;
}

const lanes = countLanes(plan);

if (lanes.length === 0) {
  fail(
    "No `### L<n> — …` lane headings found in docs/IMPLEMENTATION_PLAN.md. " +
      "Either the plan structure changed again or this script is stale — " +
      "which is exactly the failure mode that let the species count drift " +
      "unnoticed. Fix the parser rather than letting it report zeros."
  );
}

const totalDone = lanes.reduce((sum, lane) => sum + lane.done, 0);
const totalTasks = lanes.reduce((sum, lane) => sum + lane.total, 0);
const overall = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

// Targets come from the v1.0 Definition of Done at the top of the plan.
const TARGETS = { species: 250, comparisons: 20, glossary: 150 };

const pct = (n, target) => `${Math.round((n / target) * 100)}%`;

const dashboard = [
  START_MARKER,
  "",
  "## 📊 Current Status Dashboard",
  "",
  `**Last auto-updated:** ${new Date().toISOString().split("T")[0]}`,
  "_Generated by `scripts/update-implementation-metrics.mjs`. Do not hand-edit._",
  "",
  "### Content coverage",
  "",
  "| Corpus | Count | Target | Progress |",
  "| --- | ---: | ---: | ---: |",
  `| Species (per locale) | ${content.species} | ${TARGETS.species} | ${pct(content.species, TARGETS.species)} |`,
  `| Comparison guides | ${content.comparisons} | ${TARGETS.comparisons} | ${pct(content.comparisons, TARGETS.comparisons)} |`,
  `| Glossary terms | ${content.glossary} | ${TARGETS.glossary} | ${pct(content.glossary, TARGETS.glossary)} |`,
  `| Oral histories | ${content.oralHistories} | — | — |`,
  "",
  `Bilingual documents: **${content.species * 2}** species files across EN + ES.`,
  "",
  "### Lane progress",
  "",
  "| Lane | Title | Done | Total | % |",
  "| --- | --- | ---: | ---: | ---: |",
  ...lanes.map(
    (lane) =>
      `| ${lane.id} | ${lane.title} | ${lane.done} | ${lane.total} | ${lane.percentage}% |`
  ),
  `| **Overall** | | **${totalDone}** | **${totalTasks}** | **${overall}%** |`,
  "",
  END_MARKER,
].join("\n");

const startIndex = plan.indexOf(START_MARKER);
const endIndex = plan.indexOf(END_MARKER);

if (startIndex === -1 || endIndex === -1) {
  fail(
    `Could not find the ${START_MARKER} / ${END_MARKER} markers in ` +
      "docs/IMPLEMENTATION_PLAN.md. Add them where the dashboard belongs. " +
      "(The previous script silently did nothing in this situation.)"
  );
}

const updated =
  plan.slice(0, startIndex) +
  dashboard +
  plan.slice(endIndex + END_MARKER.length);

if (CHECK_ONLY) {
  // Compare CONTENT, not formatting. Prettier runs on this file via lint-staged
  // and pads markdown table cells to align the pipes; this script emits them
  // unpadded. A raw string compare therefore reported "stale" on a file whose
  // numbers were identical, which would have made the CI gate cry wolf on every
  // run — the same way its predecessor cried "success" on every run.
  const normalize = (text) =>
    text
      .split("\n")
      .map((line) =>
        line
          .replace(/\s+/g, " ")
          // Prettier also pads the separator row: `| --- |` becomes
          // `| ------------- |`. Collapse any run of dashes to one token.
          .replace(/-{2,}/g, "---")
          .trimEnd()
      )
      .join("\n");

  if (normalize(updated) !== normalize(plan)) {
    console.error(
      "❌ Implementation-plan metrics are stale. Run:\n" +
        "   node scripts/update-implementation-metrics.mjs"
    );
    process.exit(1);
  }
  console.log("✅ Implementation-plan metrics are up to date.");
  process.exit(0);
}

writeFileSync(PLAN_PATH, updated, "utf-8");

console.log("✅ Metrics dashboard updated.");
console.log(
  `   Content: ${content.species} species (${content.species * 2} bilingual docs), ` +
    `${content.comparisons} comparison guides, ${content.glossary} glossary terms`
);
console.log(
  `   Lanes: ${lanes.length} parsed, ${totalDone}/${totalTasks} tasks (${overall}%)`
);
