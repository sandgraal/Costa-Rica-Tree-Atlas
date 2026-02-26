import { readFileSync } from "fs";

const r = JSON.parse(readFileSync("./lighthouse-report.json", "utf-8"));

console.log("=== SCORES ===");
for (const [k, v] of Object.entries(r.categories)) {
  console.log(`  ${k}: ${Math.round(v.score * 100)}`);
}

console.log("\n=== CORE WEB VITALS ===");
const metrics = [
  "first-contentful-paint",
  "largest-contentful-paint",
  "total-blocking-time",
  "cumulative-layout-shift",
  "speed-index",
  "interactive",
];
metrics.forEach((m) => {
  if (r.audits[m])
    console.log(
      `  ${m}: ${r.audits[m].displayValue} (score: ${Math.round((r.audits[m].score || 0) * 100)})`
    );
});

console.log("\n=== MAIN THREAD WORK ===");
const mw = r.audits["mainthread-work-breakdown"];
if (mw?.details?.items) {
  mw.details.items.forEach((i) =>
    console.log(`  ${i.group}: ${i.duration.toFixed(0)}ms`)
  );
}

console.log("\n=== JS BOOT-UP TIME (top 15) ===");
const bt = r.audits["bootup-time"];
if (bt?.details?.items) {
  bt.details.items
    .slice(0, 15)
    .forEach((i) =>
      console.log(
        `  ${i.url.substring(0, 100)} => total: ${i.total.toFixed(0)}ms, scripting: ${i.scripting.toFixed(0)}ms`
      )
    );
}

console.log("\n=== UNUSED JAVASCRIPT ===");
const uj = r.audits["unused-javascript"];
if (uj?.details?.items) {
  uj.details.items.forEach((i) =>
    console.log(
      `  ${(i.url || "").substring(0, 100)} => waste: ${((i.wastedBytes || 0) / 1024).toFixed(1)}KiB`
    )
  );
}

console.log("\n=== TOTAL BYTE WEIGHT (top 15) ===");
const tw = r.audits["total-byte-weight"];
if (tw?.details?.items) {
  tw.details.items
    .slice(0, 15)
    .forEach((i) =>
      console.log(
        `  ${(i.url || "").substring(0, 100)} => ${(i.totalBytes / 1024).toFixed(1)}KiB`
      )
    );
}

console.log("\n=== RENDER BLOCKING ===");
const rb =
  r.audits["render-blocking-insight"] || r.audits["render-blocking-resources"];
if (rb?.details?.items) {
  rb.details.items.forEach((i) =>
    console.log(
      `  ${(i.url || "").substring(0, 100)} => waste: ${i.wastedMs || 0}ms`
    )
  );
}

console.log("\n=== IMAGE DELIVERY ===");
const id2 = r.audits["image-delivery-insight"];
if (id2?.details?.items) {
  id2.details.items.forEach((i) =>
    console.log(
      `  ${(i.url || "").substring(0, 100)} => waste: ${((i.wastedBytes || 0) / 1024).toFixed(1)}KiB`
    )
  );
}

console.log("\n=== COLOR CONTRAST ISSUES ===");
const cc = r.audits["color-contrast"];
if (cc?.details?.items) {
  cc.details.items.forEach((i) =>
    console.log(
      `  node: ${(i.node?.snippet || "").substring(0, 120)} | ${i.node?.explanation || ""}`
    )
  );
}

console.log("\n=== LINK TEXT ===");
const lt = r.audits["link-text"];
if (lt?.details?.items) {
  lt.details.items.forEach((i) => console.log(`  ${JSON.stringify(i)}`));
}

console.log("\n=== LABEL/NAME MISMATCH ===");
const lc = r.audits["label-content-name-mismatch"];
if (lc?.details?.items) {
  lc.details.items.forEach((i) =>
    console.log(`  node: ${(i.node?.snippet || "").substring(0, 150)}`)
  );
}

console.log("\n=== LEGACY JAVASCRIPT ===");
const lj =
  r.audits["legacy-javascript-insight"] || r.audits["legacy-javascript"];
if (lj?.details?.items) {
  lj.details.items.forEach((i) =>
    console.log(
      `  ${(i.url || "").substring(0, 100)} => waste: ${((i.wastedBytes || 0) / 1024).toFixed(1)}KiB`
    )
  );
}

console.log("\n=== FONT DISPLAY ===");
const fd = r.audits["font-display"];
if (fd?.details?.items) {
  fd.details.items.forEach((i) =>
    console.log(`  ${(i.url || "").substring(0, 100)}`)
  );
}

console.log("\n=== DOM SIZE ===");
const ds = r.audits["dom-size"];
if (ds) {
  console.log(
    `  ${ds.displayValue || ""} (score: ${Math.round((ds.score || 0) * 100)})`
  );
}
