"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { getQueryClient } from "@/lib/query-client";
import { persister } from "@/lib/query-client-persister";
import type { ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query provider with singleton client and persistence
 * Client persists across page navigations and survives page refreshes
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  // Use persistence if available (client-side only)
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          // Maximum age of cached data: 24 hours
          maxAge: 24 * 60 * 60 * 1000,
          // Dehydrate options: what to persist
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              // Only persist successful queries
              return query.state.status === "success";
            },
          },
        }}
      >
        {children}
        {/* Show DevTools in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </PersistQueryClientProvider>
    );
  }

  // Fallback without persistence (SSR)
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
