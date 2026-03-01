---
description: Instructions for utility scripts
applyTo: scripts/**
---

# Utility Scripts Guidelines

## Script Conventions

All scripts in this directory:

- Use ES modules (`.mjs` extension)
- Are Node.js scripts (not browser code)
- Are excluded from ESLint

## Available Scripts

### Image Management

- `manage-tree-images.mjs` - Download, audit, and refresh tree images
- `cleanup-tree-images.mjs` - Remove orphaned images

### Content Processing

- `add-gallery-sections.mjs` - Add gallery sections to MDX files
- `add-seasonal-data.mjs` - Add flowering/fruiting data
- `add-tree-tags.mjs` - Add tag metadata
- `fix-accordion-format.mjs` - Fix accordion formatting
- `fix-tree-distributions.mjs` - Fix distribution data

## Running Scripts

Via npm:

```bash
npm run images:audit
npm run images:cleanup
```

Directly:

```bash
node scripts/script-name.mjs [options]
```

## Writing New Scripts

1. Use descriptive names with verb prefix
2. Accept `--help` flag for usage info
3. Support `--dry-run` for preview mode
4. Log actions clearly to console
5. Handle errors gracefully
6. Document at the top of file

## Pattern

```javascript
#!/usr/bin/env node
/**
 * Script: what-it-does.mjs
 * Description: What this script accomplishes
 * Usage: node scripts/what-it-does.mjs [options]
 */

import fs from "fs/promises";
import path from "path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

async function main() {
  // Implementation
}

main().catch(console.error);
```

## Content Enrichment Script Pattern

Used for `add-external-links.mjs`, `fix-datatable-links.mjs`, `fix-glossary-references.mjs`, etc.:

1. `.mjs` extension, `#!/usr/bin/env node`
2. Support `--dry-run` and `--tree=<name>` flags
3. Process both EN and ES locales
4. Handle multiple content patterns (ExternalLinksGrid, DataTable, markdown lists)
5. Log progress per-file, print summary at end
