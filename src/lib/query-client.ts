import { QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Create a new QueryClient with default options
 * @returns A configured QueryClient instance
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time: Data is fresh for 1 minute
        staleTime: 60 * 1000,

        // Garbage collection time: Keep unused data for 24 hours
        gcTime: 24 * 60 * 60 * 1000,

        // Retry failed requests twice
        retry: 2,

        // Don't refetch on window focus (too aggressive for this app)
        refetchOnWindowFocus: false,

        // Refetch on reconnect (good for offline scenarios)
        refetchOnReconnect: "always",
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/**
 * Get or create the QueryClient singleton
 * Creates a new client in browser, always new on server
 * @returns The singleton QueryClient instance
 */
export function getQueryClient() {
  // Server: always create new client (each request is isolated)
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  // Browser: create client once and reuse
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
