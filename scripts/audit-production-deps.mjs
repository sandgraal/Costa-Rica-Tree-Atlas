#!/usr/bin/env node

/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Production dependency audit with a documented, dated exception list.
 *
 * Why this exists instead of a bare `npm audit --omit=dev --audit-level=high`:
 * that command exits 1 on advisories with no available fix, so the gate sits
 * permanently red and everyone learns to ignore it. A gate nobody believes is
 * worse than no gate.
 *
 * This wrapper fails on any high/critical production advisory EXCEPT the ones
 * listed below, each with a reason and a review date. A new advisory still
 * fails the build; an accepted one is visible in code review rather than
 * hidden behind a lowered threshold.
 *
 * Usage:
 *   node scripts/audit-production-deps.mjs
 *   node scripts/audit-production-deps.mjs --json
 */

import { execFileSync } from "node:child_process";

/**
 * Accepted advisories. Keep this list SHORT and revisit every review date.
 *
 * Removing an entry is the goal, not adding one. If you add one, say exactly
 * why the risk is acceptable — "it's only transitive" is not a reason.
 */
const ACCEPTED = [
  {
    name: "zod",
    // Scope: ONLY the zod 3.x copy nested under contentlayer. The app's own
    // zod (node_modules/zod, used to validate request input) is NOT covered —
    // an advisory there still fails the gate.
    paths: ["node_modules/@contentlayer2/source-files/node_modules/zod"],
    reason:
      "GHSA-mrhx-c7xc-m3w5 (memory exhaustion when validating an oversized " +
      "array from an attacker). The flagged copy is zod 3.25.x pinned by " +
      "@contentlayer2/source-files, which only validates frontmatter of MDX " +
      "files committed to this repo, during `contentlayer2 build`. No " +
      "untrusted input reaches it and it is not on a request path. There is " +
      "no patched 3.x release, and forcing zod 4 breaks contentlayer " +
      "(it calls the single-argument z.record() removed in v4). " +
      "contentlayer2 0.5.8 is the latest release.",
    reviewBy: "2027-02-19",
  },
];

const BLOCKING = new Set(["high", "critical"]);

function runAudit() {
  try {
    return execFileSync("npm", ["audit", "--omit=dev", "--json"], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch (error) {
    // npm audit exits non-zero when it finds anything; the JSON is still on
    // stdout and is what we actually want.
    if (error.stdout) return error.stdout;
    throw error;
  }
}

const report = JSON.parse(runAudit());
const vulnerabilities = report.vulnerabilities ?? {};

const accepted = new Map(ACCEPTED.map((entry) => [entry.name, entry]));
const today = new Date().toISOString().split("T")[0];

const blocking = [];
const waived = [];
const expired = [];

const SEVERITY_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };

/**
 * Severity of the advisories filed against this package itself.
 *
 * npm audit also lists every package that merely depends on a vulnerable one
 * (its `via` entries are package-name strings). Those are not separate
 * findings: the root package is always present in the report and is evaluated
 * on its own. Counting the dependents too meant one nested advisory surfaced as
 * five "blocking" packages, and a scoped exception could never clear them.
 */
function ownSeverity(vuln) {
  let worst = null;
  for (const via of vuln.via ?? []) {
    if (typeof via === "string") continue;
    if (worst === null || SEVERITY_RANK[via.severity] > SEVERITY_RANK[worst]) {
      worst = via.severity;
    }
  }
  return worst;
}

function exceptionCovers(exception, vuln) {
  if (!exception) return false;
  if (!exception.paths) return true;
  const allowed = new Set(exception.paths);
  return (vuln.nodes ?? []).every((node) => allowed.has(node));
}

const flagged = new Set();

for (const [name, vuln] of Object.entries(vulnerabilities)) {
  const severity = ownSeverity(vuln);
  if (!severity || !BLOCKING.has(severity)) continue;
  flagged.add(name);

  const exception = accepted.get(name);
  if (!exceptionCovers(exception, vuln)) {
    const where = (vuln.nodes ?? []).join(", ");
    blocking.push({ name, severity, where });
    continue;
  }

  if (exception.reviewBy < today) {
    expired.push({ name, severity, ...exception });
  } else {
    waived.push({ name, severity, ...exception });
  }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ blocking, waived, expired }, null, 2));
}

for (const entry of waived) {
  console.log(
    `⚠️  accepted: ${entry.severity} in ${entry.name} (review by ${entry.reviewBy})`
  );
}

for (const entry of expired) {
  console.error(
    `❌ EXPIRED exception: ${entry.severity} in ${entry.name} — the review ` +
      `date ${entry.reviewBy} has passed. Re-check for a fix, then either ` +
      `resolve it or extend the date in scripts/audit-production-deps.mjs ` +
      `with a fresh justification.`
  );
}

for (const entry of blocking) {
  console.error(
    `❌ ${entry.severity} advisory in production dependency "${entry.name}" ` +
      `with no accepted exception (${entry.where}).`
  );
}

// Stale exceptions are also worth flagging — an entry for a package that is no
// longer vulnerable is dead weight that makes the list less trustworthy.
for (const entry of ACCEPTED) {
  if (!flagged.has(entry.name)) {
    console.log(
      `🧹 stale exception: ${entry.name} is no longer flagged — remove it ` +
        `from scripts/audit-production-deps.mjs.`
    );
  }
}

if (blocking.length > 0 || expired.length > 0) {
  console.error(
    `\n${blocking.length + expired.length} production advisory/advisories require attention.`
  );
  process.exit(1);
}

console.log(
  `✅ No unaccepted high/critical production advisories ` +
    `(${waived.length} documented exception${waived.length === 1 ? "" : "s"}).`
);
