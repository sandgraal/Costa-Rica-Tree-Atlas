# ServerMDXContent Component

## Overview

`ServerMDXContent` is a React Server Component that renders MDX content on the server without requiring client-side JavaScript evaluation (`eval()` or `new Function()`). This ensures compliance with strict Content Security Policies (CSP).

## Features

1. **CSP Compliant**: No `unsafe-eval` required in production
2. **Caching**: Compiled MDX is cached by source hash to avoid repeated compilation
3. **Error Handling**: Gracefully handles malformed MDX with user-friendly error fallback
4. **Development Mode**: Respects `NODE_ENV` for better error messages in development

## Usage

### Basic Usage

```tsx
import { ServerMDXContent } from "@/components/ServerMDXContent";

export default async function MyPage() {
  const mdxSource = "# Hello World\n\nThis is MDX content.";

  return <ServerMDXContent source={mdxSource} />;
}
```

### With Glossary Auto-Linking

```tsx
import { ServerMDXContent } from "@/components/ServerMDXContent";
import { allGlossaryTerms } from "contentlayer/generated";

export default async function TreePage() {
  const tree = getTree(); // your tree data

  const glossaryTerms = allGlossaryTerms.map((t) => ({
    term: t.term,
    slug: t.slug,
    locale: t.locale,
    simpleDefinition: t.simpleDefinition,
  }));

  return (
    <ServerMDXContent
      source={tree.body.raw}
      glossaryTerms={glossaryTerms}
      enableGlossaryLinks={true}
    />
  );
}
```

### With Custom Components

```tsx
import { ServerMDXContent } from "@/components/ServerMDXContent";

const customComponents = {
  h1: (props) => <h1 className="custom-h1" {...props} />,
};

export default async function MyPage() {
  return <ServerMDXContent source={mdxSource} components={customComponents} />;
}
```

## Props

| Prop                  | Type                                  | Required | Default | Description                                               |
| --------------------- | ------------------------------------- | -------- | ------- | --------------------------------------------------------- |
| `source`              | `string`                              | Yes      | -       | Raw MDX source content (use `body.raw` from Contentlayer) |
| `components`          | `Record<string, React.ComponentType>` | No       | `{}`    | Additional MDX components to merge with defaults          |
| `glossaryTerms`       | `GlossaryTerm[]`                      | No       | `[]`    | Array of glossary terms for auto-linking                  |
| `enableGlossaryLinks` | `boolean`                             | No       | `false` | Whether to enable automatic glossary term linking         |

## Implementation Details

### Caching Mechanism

The component uses an in-memory `Map` to cache compiled MDX results:

```typescript
const mdxCache = new Map<string, Awaited<ReturnType<typeof evaluate>>>();
```

- Cache keys are SHA-256 hashes of the source content
- Same source = same hash = cache hit
- Prevents repeated compilation on subsequent renders

### Error Handling

Compilation/evaluation errors are caught and displayed with a user-friendly fallback:

```tsx
<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
  <h3>Content Rendering Error</h3>
  <p>We encountered an issue while rendering this content...</p>
  {/* Technical details shown only in development */}
</div>
```

### Development vs Production

The `development` flag passed to `evaluate()` is determined by `process.env.NODE_ENV`:

- **Development**: Better error messages, warnings, and stack traces
- **Production**: Optimized for performance

## Security Benefits

1. ✅ No `unsafe-eval` in CSP (production)
2. ✅ MDX execution on server only (no browser eval)
3. ✅ Reduced XSS attack surface
4. ✅ Pre-rendered React elements sent to client

## Migration from Client-Side MDX

### Before (Client-Side)

```tsx
"use client";
import { getMDXComponent } from "next-contentlayer2/hooks";

export function TreeContent({ tree }) {
  const MDXContent = getMDXComponent(tree.body.code); // Uses eval()
  return <MDXContent />;
}
```

### After (Server-Side)

```tsx
// Server Component - no "use client"
import { ServerMDXContent } from "@/components/ServerMDXContent";

export default async function TreeContent({ tree }) {
  return <ServerMDXContent source={tree.body.raw} />; // No eval()
}
```

## Performance Considerations

- **First render**: Compiles MDX (one-time cost per unique source)
- **Subsequent renders**: Uses cached result (fast)
- **Memory**: Cache grows with unique MDX sources (manageable for typical content volumes)

## Testing

Tests are located in `tests/server-mdx-content.test.tsx` and verify:

- ✅ Consistent cache key generation
- ✅ Different hashes for different content
- ✅ Environment configuration reading

Full integration tests require Next.js server context and are best done manually.

## Related Files

- Component: `src/components/ServerMDXContent.tsx`
- Tests: `tests/server-mdx-content.test.tsx`
- MDX Components: `src/components/mdx/index.tsx`
- CSP Configuration: `src/lib/security/csp.ts`

## References

- [PR #194: Server-side MDX rendering](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/194)
- [Sourcery AI Feedback](https://github.com/sandgraal/Costa-Rica-Tree-Atlas/pull/194#pullrequestreview-3675611405)
- [@mdx-js/mdx Documentation](https://mdxjs.com/packages/mdx/)
