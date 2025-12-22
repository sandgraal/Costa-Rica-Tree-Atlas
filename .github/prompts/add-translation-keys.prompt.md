---
mode: agent
description: Add new translation keys to both English and Spanish message files
---

# Add Translation Keys

Add new internationalization keys to the project's translation files, ensuring both English and Spanish versions are created.

## Instructions

1. **Identify the namespace** for the new keys (e.g., `nav`, `trees`, `home`, `footer`)
2. **Add keys to both files**:
   - `messages/en.json` - English translations
   - `messages/es.json` - Spanish translations
3. **Follow existing patterns** in the translation files
4. **Use ICU message format** for dynamic content:
   ```json
   "itemCount": "{count, plural, =0 {No items} =1 {1 item} other {# items}}"
   ```

## Usage in Components

### Client Components

```tsx
"use client";
import { useTranslations } from "next-intl";
const t = useTranslations("namespace");
return <p>{t("key")}</p>;
```

### Server Components

```tsx
import { getTranslations } from "next-intl/server";
const t = await getTranslations("namespace");
return <p>{t("key")}</p>;
```

## Checklist

- [ ] Keys added to `messages/en.json`
- [ ] Keys added to `messages/es.json`
- [ ] Proper namespace organization
- [ ] Variables use `{variableName}` syntax
- [ ] Plurals use ICU format if needed
