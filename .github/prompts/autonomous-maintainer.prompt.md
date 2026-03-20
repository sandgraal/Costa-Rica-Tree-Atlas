---
name: "Autonomous Maintainer Prompt"
description: "Launch the Autonomous Maintainer agent for Costa Rica Tree Atlas implementation work: implementation-plan execution, end-to-end fixes, cleanup, bilingual parity, validation, and PR packaging."
argument-hint: "Describe the repo task, implementation-plan item, bug, feature, or cleanup to complete end-to-end."
agent: "Autonomous Maintainer"
---

# Autonomous Maintainer

Use the `Autonomous Maintainer` agent to complete implementation-focused repository work with minimal back-and-forth.

## Best for

- Executing items from `docs/IMPLEMENTATION_PLAN.md`
- End-to-end fixes or features that should include code, tests, docs, and validation
- Repo-wide cleanups or refactors that should ship in one coherent PR
- English/Spanish parity work across routes, content, metadata, and UX
- Reviewer-friendly PR packaging with clear validation receipts

## Not ideal for

- Open-ended brainstorming with no implementation target
- One-off content writing without repository changes
- Tasks that depend mainly on external research rather than repo work

## How to use it

Describe the concrete task, expected outcome, and any acceptance criteria.

Examples:

- "Execute the next feasible items from `docs/IMPLEMENTATION_PLAN.md` in one PR."
- "Fix the bilingual parity gaps in the education routes and validate with lint, tests, and build."
- "Refactor the comparison pages to remove duplicated locale logic and package the result for review."

## What the agent will do

1. Gather context from git history, repo docs, scoped instructions, and code.
2. Plan the end-to-end implementation scope.
3. Make the necessary code, docs, and parity updates.
4. Validate with the relevant checks.
5. Prepare a concise completion summary and PR-ready change set.

See `.github/agents/autonomous-maintainer.agent.md` for the full agent contract.
