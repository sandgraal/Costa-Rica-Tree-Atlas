"use client";

import { useEffect, type ReactNode } from "react";
import { useStore, useThemeSync } from "@/lib/store";

interface StoreProviderProps {
  children: ReactNode;
}

/**
 * Unified store provider that handles theme synchronization
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
