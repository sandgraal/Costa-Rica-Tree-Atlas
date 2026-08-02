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
    name: "@opentelemetry/sdk-trace-node",
    reason:
      "Transitive via contentlayer2 -> @contentlayer2/utils -> " +
      "@effect-ts/otel-sdk-trace-node. Contentlayer's tracing runs only during " +
      "`contentlayer2 build`, which turns MDX into .contentlayer/ at build " +
      "time; it is never on a request path. Forcing >=2.8.0 was tried and " +
      "breaks the build (ERR_MODULE_NOT_FOUND — the 2.x API is incompatible " +
      "with @effect-ts/otel-sdk-trace-node), and contentlayer2 has published " +
      "no compatible release.",
    reviewBy: "2026-11-01",
  },
  {
    name: "@opentelemetry/propagator-jaeger",
    reason: "Same dependency chain and same reasoning as sdk-trace-node above.",
    reviewBy: "2026-11-01",
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

for (const [name, vuln] of Object.entries(vulnerabilities)) {
  if (!BLOCKING.has(vuln.severity)) continue;

  const exception = accepted.get(name);
  if (!exception) {
    blocking.push({ name, severity: vuln.severity });
    continue;
  }

  if (exception.reviewBy < today) {
    expired.push({ name, severity: vuln.severity, ...exception });
  } else {
    waived.push({ name, severity: vuln.severity, ...exception });
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
      `with no accepted exception.`
  );
}

// Stale exceptions are also worth flagging — an entry for a package that is no
// longer vulnerable is dead weight that makes the list less trustworthy.
for (const entry of ACCEPTED) {
  const vuln = vulnerabilities[entry.name];
  if (!vuln || !BLOCKING.has(vuln.severity)) {
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
