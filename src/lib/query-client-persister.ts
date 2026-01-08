import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

/**
 * Persister for React Query cache to localStorage
 * Allows cache to survive page refreshes
 */
export const persister =
  typeof window !== "undefined"
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: "COSTA_RICA_TREE_ATLAS_QUERY_CACHE",
        // Throttle writes to avoid excessive localStorage writes
        throttleTime: 1000,
      })
    : undefined;
