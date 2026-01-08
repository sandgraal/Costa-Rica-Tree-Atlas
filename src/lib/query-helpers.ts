import { getQueryClient } from "./query-client";

/**
 * Invalidate tree-related queries
 * Call this when tree data changes
 */
export function invalidateTreeQueries() {
  const queryClient = getQueryClient();
  queryClient.invalidateQueries({ queryKey: ["trees"] });
}

/**
 * Prefetch tree data for faster navigation
 * @param slug - The tree slug to prefetch
 * @param locale - The locale (en or es)
 */
export async function prefetchTree(slug: string, locale: string) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["tree", slug, locale],
    queryFn: async () => {
      const res = await fetch(`/api/trees/${slug}?locale=${locale}`);
      if (!res.ok) throw new Error("Failed to fetch tree");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Clear all cached query data
 * Useful for logout or error recovery
 */
export function clearQueryCache() {
  const queryClient = getQueryClient();
  queryClient.clear();
}
