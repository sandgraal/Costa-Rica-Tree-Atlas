#!/usr/bin/env node

/**
 * Auto-update metrics in IMPLEMENTATION_PLAN.md
 *
 * This script:
 * - Counts completed checkboxes in the implementation plan
 * - Counts content files (species, comparison guides, glossary)
 * - Calculates completion percentages per priority track
 * - Updates the metrics dashboard section
 *
 * Triggered by GitHub workflow when IMPLEMENTATION_PLAN.md changes
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

const PLAN_PATH = join(ROOT, "docs", "IMPLEMENTATION_PLAN.md");

// Read implementation plan
const planContent = readFileSync(PLAN_PATH, "utf-8");

// Count checkboxes by priority
function countCheckboxes(priority) {
  const priorityRegex = new RegExp(
    `### Priority ${priority}:.*?(?=### Priority \\d+:|## |$)`,
    "gs"
  );
  const prioritySection = planContent.match(priorityRegex)?.[0] || "";

  const completed = (prioritySection.match(/- \[x\]/gi) || []).length;
  const total = (prioritySection.match(/- \[ \]|  - \[x\]/gi) || []).length;

  return {
    completed,
    total,
    percentage: total ? Math.round((completed / total) * 100) : 0,
  };
}

// Count content files
function countContent() {
  const treesPath = join(ROOT, "content", "trees", "en");
  const comparisonsPath = join(ROOT, "content", "comparisons", "en");
  const glossaryPath = join(ROOT, "content", "glossary", "en");

  const treeCount = readdirSync(treesPath).filter((f) =>
    f.endsWith(".mdx")
  ).length;
  const comparisonCount = readdirSync(comparisonsPath).filter((f) =>
    f.endsWith(".mdx")
  ).length;
  const glossaryCount = readdirSync(glossaryPath).filter((f) =>
    f.endsWith(".mdx")
  ).length;

  return {
    trees: treeCount,
    comparisons: comparisonCount,
    glossary: glossaryCount,
  };
}

// Calculate metrics
const content = countContent();
const priority0 = countCheckboxes(0);
const priority1 = countCheckboxes(1);
const priority2 = countCheckboxes(2);
const priority3 = countCheckboxes(3);

// Calculate overall progress
const totalCompleted =
  priority0.completed +
  priority1.completed +
  priority2.completed +
  priority3.completed;
const totalTasks =
  priority0.total + priority1.total + priority2.total + priority3.total;
const overallPercentage = totalTasks
  ? Math.round((totalCompleted / totalTasks) * 100)
  : 0;

// Build new metrics dashboard
const newDashboard = `## 📊 Current Status Dashboard

**Last Auto-Updated:** ${new Date().toISOString().split("T")[0]}

### Content Coverage
- **Species**: ${content.trees}/175 (${Math.round((content.trees / 175) * 100)}%) - Target: 175+ documented species
- **Comparison Guides**: ${content.comparisons}/20 (${Math.round((content.comparisons / 20) * 100)}%) - Target: 20 guides
- **Glossary Terms**: ${content.glossary}/150 (${Math.round((content.glossary / 150) * 100)}%) - Target: 150+ terms
- **Care Guidance**: 60/128 (47%) - Target: 100/128 (78%)

### Implementation Progress
- **Overall**: ${totalCompleted}/${totalTasks} tasks (${overallPercentage}%)
- **Priority 0 (Blockers)**: ${priority0.completed}/${priority0.total} (${priority0.percentage}%)
- **Priority 1 (Content)**: ${priority1.completed}/${priority1.total} (${priority1.percentage}%)
- **Priority 2 (Performance)**: ${priority2.completed}/${priority2.total} (${priority2.percentage}%)
- **Priority 3 (Quick Wins)**: ${priority3.completed}/${priority3.total} (${priority3.percentage}%)

### Technical Health
- **Lighthouse Score**: 48/100 → Target: 90/100
- **LCP (Largest Contentful Paint)**: 6.0s → Target: <2.5s
- **TBT (Total Blocking Time)**: 440ms → Target: <200ms
- **Auth Status**: ❌ Broken (MFA incomplete, session strategy conflict)
- **Safety Integration**: 🟡 60% (components exist, filtering pending)
- **Image Status**: 109/128 optimized (85%), 66 galleries need refresh

### Priority Status Legend
- ✅ **Complete** - All tasks done, validated
- 🟡 **In Progress** - Active work ongoing
- 📋 **Ready** - No blockers, can start anytime
- ⏸️ **Blocked** - Waiting on dependencies
- ⚠️ **Attention Needed** - Issues or delays

---`;

// Replace dashboard section in plan
const dashboardRegex = /## 📊 Current Status Dashboard.*?---/gs;
const updatedPlan = planContent.replace(dashboardRegex, newDashboard);

// Write updated plan
writeFileSync(PLAN_PATH, updatedPlan, "utf-8");

console.log("✅ Metrics dashboard updated successfully!");
console.log(
  `   Overall progress: ${overallPercentage}% (${totalCompleted}/${totalTasks} tasks)`
);
console.log(
  `   Content: ${content.trees} species, ${content.comparisons} guides, ${content.glossary} glossary terms`
);
