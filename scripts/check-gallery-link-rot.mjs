#!/usr/bin/env node

/**
 * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
 * SPDX-License-Identifier: MIT
 *
 * Sample the remote gallery images and report dead ones.
 *
 * Why: ~870 unique gallery images (≈1,780 references across both locales)
 * are hotlinked from
 * iNaturalist rather than stored in this repo. Nothing checked whether they
 * still resolve, so an image that 404s upstream simply becomes a gap on a
 * species page — silently, indefinitely. `npm run images:validate` only checks
 * LOCAL image references.
 *
 * Samples rather than checking all of them, because a full sweep is ~1,780
 * requests against a service doing us a favour. Rotate the sample with
 * --offset so a weekly job covers the corpus over time.
 *
 * Usage:
 *   node scripts/check-gallery-link-rot.mjs
 *   node scripts/check-gallery-link-rot.mjs --sample=200 --offset=400
 *   node scripts/check-gallery-link-rot.mjs --all --json
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TREES_DIR = join(ROOT, "content", "trees", "en");

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  return match ? Number(match.split("=")[1]) : fallback;
};

const SAMPLE = args.includes("--all") ? Infinity : flag("sample", 120);
const OFFSET = flag("offset", 0);
const CONCURRENCY = flag("concurrency", 8);
const AS_JSON = args.includes("--json");
const TIMEOUT_MS = 15_000;

if (args.includes("--help") || args.includes("-h")) {
  console.log(
    [
      "Check remote gallery image URLs for link rot.",
      "",
      "  --sample=N       how many URLs to check (default 120)",
      "  --offset=N       skip the first N URLs, for rotating coverage",
      "  --all            check every URL (slow, ~870 requests)",
      "  --concurrency=N  parallel requests (default 8)",
      "  --json           machine-readable output",
    ].join("\n")
  );
  process.exit(0);
}

/** Collect every remote image URL, with the file that references it. */
function collectUrls() {
  const urls = [];
  for (const file of readdirSync(TREES_DIR).filter((f) => f.endsWith(".mdx"))) {
    const source = readFileSync(join(TREES_DIR, file), "utf8");
    for (const [, url] of source.matchAll(/src="(https:\/\/[^"]+)"/g)) {
      urls.push({ url, file });
    }
  }
  return urls;
}

async function check({ url, file }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // HEAD first — no body transfer. Some CDNs reject HEAD, so fall back to a
    // ranged GET rather than reporting a false positive.
    let response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        signal: controller.signal,
      });
    }
    return { url, file, status: response.status, ok: response.ok };
  } catch (error) {
    return {
      url,
      file,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Run tasks with a bounded number in flight. */
async function pooled(items, worker, limit) {
  const results = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

const all = collectUrls();
const unique = [...new Map(all.map((entry) => [entry.url, entry])).values()];
const slice = unique.slice(OFFSET, OFFSET === 0 && SAMPLE === Infinity ? undefined : OFFSET + SAMPLE);

if (!AS_JSON) {
  console.log(
    `🔗 Checking ${slice.length} of ${unique.length} unique gallery URLs ` +
      `(offset ${OFFSET}, concurrency ${CONCURRENCY})`
  );
}

const results = await pooled(slice, check, CONCURRENCY);
const broken = results.filter((r) => !r.ok);

if (AS_JSON) {
  console.log(
    JSON.stringify(
      { checked: results.length, totalUnique: unique.length, broken },
      null,
      2
    )
  );
} else {
  for (const entry of broken) {
    console.error(
      `❌ ${entry.status || "ERR"} ${entry.url}\n   referenced by content/trees/en/${entry.file}` +
        (entry.error ? `\n   ${entry.error}` : "")
    );
  }
  console.log(
    broken.length === 0
      ? `✅ All ${results.length} sampled gallery images resolve.`
      : `\n${broken.length} of ${results.length} sampled gallery images are broken.`
  );
}

process.exit(broken.length > 0 ? 1 : 0);
