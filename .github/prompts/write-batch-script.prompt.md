---
mode: agent
description: Create a batch processing script for content or data operations
---

# Write Batch Script

Create a Node.js script to perform batch operations on content files or data.

## Script Location

Place scripts in `scripts/` directory with `.mjs` extension.

## Common Script Patterns

### Reading MDX Files

```javascript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDir = path.join(process.cwd(), "content/trees/en");
const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

for (const file of files) {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const { data: frontmatter, content: body } = matter(content);

  // Process file...
}
```

### Modifying Frontmatter

```javascript
import matter from "gray-matter";

function updateFrontmatter(filePath, updates) {
  const content = fs.readFileSync(filePath, "utf8");
  const { data, content: body } = matter(content);

  const newData = { ...data, ...updates };
  const newContent = matter.stringify(body, newData);

  fs.writeFileSync(filePath, newContent);
}
```

### Processing Both Locales

```javascript
const locales = ["en", "es"];

for (const locale of locales) {
  const dir = path.join(process.cwd(), `content/trees/${locale}`);
  // Process files...
}
```

## Existing Scripts Reference

- `add-gallery-sections.mjs` - Add gallery sections to MDX
- `add-seasonal-data.mjs` - Add flowering/fruiting seasons
- `add-tree-tags.mjs` - Add characteristic tags
- `fix-tree-distributions.mjs` - Fix distribution data
- `manage-tree-images.mjs` - Image management utilities

## Best Practices

- Add dry-run mode (`--dry-run` flag)
- Log changes before making them
- Backup files before bulk modifications
- Process both locales consistently
