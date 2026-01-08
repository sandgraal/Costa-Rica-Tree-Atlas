# React Query Setup

## Overview

This application uses React Query (TanStack Query) with a **singleton pattern** to ensure query cache persists across page navigations and optionally survives page refreshes via localStorage persistence.

## Architecture

### Singleton QueryClient (`src/lib/query-client.ts`)

The QueryClient is created once per browser session and reused across all page navigations:

```typescript
// Browser: returns same instance
// Server: returns new instance per request
const queryClient = getQueryClient();
```

**Benefits:**

- Cache persists during navigation
- No duplicate API calls
- Faster page transitions
- Reduced bandwidth

### Persistence (`src/lib/query-client-persister.ts`)

Query cache is automatically persisted to localStorage:

- **Key:** `COSTA_RICA_TREE_ATLAS_QUERY_CACHE`
- **Max Age:** 24 hours
- **Throttle:** 1 second between writes
- **Filter:** Only successful queries are persisted

**Benefits:**

- Cache survives page refreshes
- Offline capability
- Instant data on return visits

### Provider (`src/components/providers/QueryProvider.tsx`)

The provider automatically:

1. Uses singleton QueryClient
2. Enables persistence on client-side
3. Shows DevTools in development
4. Handles SSR correctly

## Usage in Components

### Basic Query

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export function TreeList({ locale }: { locale: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["trees", locale],
    queryFn: async () => {
      const res = await fetch(`/api/trees?locale=${locale}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    // Optional: override defaults
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### Cache Invalidation

```tsx
import { invalidateTreeQueries } from "@/lib/query-helpers";

// After modifying tree data
invalidateTreeQueries();
```

### Prefetching

```tsx
import { prefetchTree } from "@/lib/query-helpers";

// On hover or before navigation
await prefetchTree("ceiba", "en");
```

### Clear Cache

```tsx
import { clearQueryCache } from "@/lib/query-helpers";

// On logout or error recovery
clearQueryCache();
```

## Default Configuration

```typescript
{
  queries: {
    staleTime: 60 * 1000,           // 1 minute
    gcTime: 24 * 60 * 60 * 1000,    // 24 hours
    retry: 2,                        // Retry twice
    refetchOnWindowFocus: false,     // Don't refetch on focus
    refetchOnReconnect: 'always',    // Refetch on reconnect
  },
  mutations: {
    retry: 1,                        // Retry once
  }
}
```

## DevTools

React Query DevTools are available in development mode:

- **Position:** Bottom-right corner
- **Toggle:** Click the floating icon
- **Features:**
  - View all queries and their states
  - Inspect query data
  - Manually trigger refetches
  - Clear cache
  - View query timelines

## Testing

Tests are located in:

- `tests/query-client.test.ts` - Singleton behavior and configuration
- `tests/query-helpers.test.ts` - Helper functions

Run tests:

```bash
npm test
```

## Troubleshooting

### Cache not persisting

- Check browser localStorage is enabled
- Verify `COSTA_RICA_TREE_ATLAS_QUERY_CACHE` key in localStorage
- Check browser console for errors

### Stale data showing

- Data is intentionally shown while revalidating (stale-while-revalidate)
- Adjust `staleTime` if needed
- Use `refetchOnMount: 'always'` for critical data

### DevTools not showing

- Only available in development (`NODE_ENV=development`)
- Check browser console for errors
- Verify React Query version matches DevTools version

## Migration Notes

### Breaking Changes

- None - API remains compatible

### Performance Impact

- Immediate improvement in navigation speed
- Slightly larger bundle (+~15KB with persistence)
- Lower bandwidth usage overall

## See Also

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- `src/components/data/BiodiversityInfo.tsx` - Example implementation
