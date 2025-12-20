"use client";

import { useEffect, type ReactNode } from "react";
import { useStore, useThemeSync } from "@/lib/store";

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Unified store provider that handles theme synchronization
 * Replaces: ThemeProvider, FavoritesProvider, RecentlyViewedProvider
 */
export function StoreProvider({ children }: StoreProviderProps) {
  const { syncTheme } = useThemeSync();

  // Sync theme on mount and when system preference changes
  useEffect(() => {
    // Initial sync
    syncTheme();

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => syncTheme();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [syncTheme]);

  return <>{children}</>;
}

/**
 * Hook for tracking tree views
 */
export function useTrackView(slug: string) {
  const addToRecentlyViewed = useStore((state) => state.addToRecentlyViewed);

  useEffect(() => {
    addToRecentlyViewed(slug);
  }, [slug, addToRecentlyViewed]);
}

/**
 * Re-export store hooks for convenience
 */
export {
  useStore,
  useFavorite,
  useThemeSync,
  selectTheme,
  selectResolvedTheme,
  selectFavorites,
  selectRecentlyViewed,
} from "@/lib/store";
