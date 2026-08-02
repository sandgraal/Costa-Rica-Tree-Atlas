# scripts/ — Agent Guide

Utility scripts for content authoring, image management, factual audits,
and one-off migrations. Read the root [CLAUDE.md](../CLAUDE.md) first.

## What lives here

Scripts are ESM (`.mjs`) by convention, with a few `.sh` helpers and one
Python script. Major categories:

- **Content audits:** `audit-content-quality.mjs`, `audit-factual-accuracy.mjs`,
  `generate-factual-remediation-queue.mjs`
- **Image management:** `manage-tree-images.mjs`, `optimize-images.mjs`,
  `validate-image-references.mjs`, `cleanup-tree-images.mjs`,
  `propose-image-changes.mjs`, `process-image-votes.mjs`
- **Content migrations / fixes (one-off, already applied — kept for
  reference, not part of any routine workflow):** `normalize-enum-values.mjs`,
  `fix-glossary-references.mjs`, `fix-tree-distributions.mjs`,
  `add-seasonal-data.mjs`, `add-tree-tags.mjs`, `add-external-links.mjs`,
  `add-gallery-sections.mjs`
  (`add-comparison-guides.mjs` was listed here and has never existed.)
- **Operational:** `generate-secrets.mjs`, `create-admin-user.mjs`,
  `setup-first-admin.mjs`, `reset-admin-password.mjs`,
  `update-implementation-metrics.mjs`, `vercel-ignore-build.sh`

## Conventions

1. **ESM, `.mjs` extension.** Top of file:

   ```js
   #!/usr/bin/env node

   /**
    * Copyright (c) 2024-present Costa Rica Tree Atlas contributors
    * SPDX-License-Identifier: MIT
    *
    * <one-line description>
    *
    * <multi-line description>
    *
    * Usage:
    *   node scripts/<name>.mjs
    *   node scripts/<name>.mjs --json
    *   node scripts/<name>.mjs --dry-run
    */
   ```

2. **CLI flags follow a project convention:**
   - `--help` / `-h` — print help and exit 0
   - `--dry-run` — preview without writing
   - `--verbose` / `-v` — detailed output
   - `--json` — machine-readable output for piping
   - `--write=<path>` or `--output=<path>` — write report
   - `--tree=<slug>` — scope to a single tree where applicable

3. **Idempotent by default.** Re-running a script should not corrupt
   state. Where idempotency requires checkpointing (image proposal queue
   processing, etc.), use a state file in `reports/`.

4. **Reports land in `reports/`.** Naming: `<script-name>.<scope>.json|md`.
   The factual-audit pipeline uses this convention.

5. **No npm packages without justification.** Scripts use Node built-ins
   plus what's already in `package.json`. Don't pull in a new dep for a
   one-off.

6. **Add npm scripts in `package.json`** for any script meant to be run
   regularly. Group related scripts (e.g., `images:audit`,
   `images:audit:gallery`, `images:audit:all`).

## Image scripts — read first

`manage-tree-images.mjs` is the canonical image workhorse and has subcommands:
`audit`, `audit-gallery`, `download`, `refresh`, `refresh-gallery`. It hits
iNaturalist via API; rate-limit yourself if running broadly.

Image upload from users goes through `src/app/api/images/upload/route.ts`,
NOT through a script. The route applies the EXIF-strip guarantee (see
`tests/security/exif-strip.test.ts`).

## Adding a new script

Use an existing script of the same category as a template. Audit-style?
Copy `audit-content-quality.mjs`. Migration? Copy `normalize-enum-values.mjs`.
Image manipulation? Copy `manage-tree-images.mjs`.

After writing, add an npm script to `package.json` if it's meant to be run
regularly, and document it in the "Scripts Reference" section of
[`.github/copilot-instructions.md`](../.github/copilot-instructions.md).
(This used to say "the README's Scripts Reference section"; the README has no
such section — that inventory lives in copilot-instructions.md.)

## Verification

```bash
node scripts/<your-script>.mjs --help    # help should print and exit 0
node scripts/<your-script>.mjs --dry-run # preview should not modify state
```

Most scripts should also have a smoke test if they touch content. Add to
`tests/` if behavior is load-bearing.
