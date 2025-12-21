/**
 * Unified client-side store using Zustand
 * Replaces: FavoritesProvider, RecentlyViewedProvider, ThemeProvider
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface UIState {
  searchQuery: string;
  isSearchOpen: boolean;
  isMobileNavOpen: boolean;
}

// ============================================================================
// Store Interface - Flat structure for easy access
// ============================================================================

interface StoreState {
  // Theme (flattened for easy access)
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (resolved: ResolvedTheme) => void;

  // Favorites
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  addFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
  clearFavorites: () => void;

  // Recently viewed
  recentlyViewed: string[];
  addToRecentlyViewed: (slug: string) => void;
  clearRecentlyViewed: () => void;

  // UI state
  ui: UIState;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
}

const MAX_RECENT_ITEMS = 10;

// ============================================================================
// Store Implementation
// ============================================================================

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Theme (flattened)
      theme: "system" as Theme,
      resolvedTheme: "light" as ResolvedTheme,

      setTheme: (theme) => set({ theme }),
      setResolvedTheme: (resolved) => set({ resolvedTheme: resolved }),

      // Favorites
      favorites: [],

      isFavorite: (slug) => get().favorites.includes(slug),

      toggleFavorite: (slug) => {
        const { favorites } = get();
        if (favorites.includes(slug)) {
          set({ favorites: favorites.filter((s) => s !== slug) });
        } else {
          set({ favorites: [...favorites, slug] });
        }
      },

      addFavorite: (slug) => {
        const { favorites } = get();
        if (!favorites.includes(slug)) {
          set({ favorites: [...favorites, slug] });
        }
      },

      removeFavorite: (slug) => {
        set({ favorites: get().favorites.filter((s) => s !== slug) });
      },

      clearFavorites: () => set({ favorites: [] }),

      // Recently viewed
      recentlyViewed: [],

      addToRecentlyViewed: (slug) => {
        const { recentlyViewed } = get();
        const filtered = recentlyViewed.filter((s) => s !== slug);
        set({
          recentlyViewed: [slug, ...filtered].slice(0, MAX_RECENT_ITEMS),
        });
      },

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      // UI state (not persisted)
      ui: {
        searchQuery: "",
        isSearchOpen: false,
        isMobileNavOpen: false,
      },

      setSearchQuery: (query) =>
        set((state) => ({
          ui: { ...state.ui, searchQuery: query },
        })),

      setSearchOpen: (open) =>
        set((state) => ({
          ui: { ...state.ui, isSearchOpen: open },
        })),

      setMobileNavOpen: (open) =>
        set((state) => ({
          ui: { ...state.ui, isMobileNavOpen: open },
        })),
    }),
    {
      name: "cr-tree-atlas",
      storage: createJSONStorage(() => {
        // Safely access localStorage only on the client
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        theme: state.theme,
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);

// ============================================================================
// Hooks for common patterns
// ============================================================================

/**
 * Hook to check if the store has been hydrated from localStorage.
 * Use this to prevent hydration mismatches with persisted state.
 */
export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Safety check for SSR
    if (typeof window === "undefined") return;

    try {
      // Zustand persist middleware sets _hasHydrated when done
      const unsubFinishHydration = useStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });

      // Check if already hydrated (e.g., on fast refresh)
      if (useStore.persist.hasHydrated()) {
        setHydrated(true);
      }

      return () => {
        unsubFinishHydration();
      };
    } catch {
      // If persist middleware isn't available, consider it hydrated
      setHydrated(true);
    }
  }, []);

  return hydrated;
}

export function useFavorite(slug: string) {
  const isFavorite = useStore((state) => state.favorites.includes(slug));
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  return { isFavorite, toggle: () => toggleFavorite(slug) };
}

export function useThemeSync() {
  const theme = useStore((state) => state.theme);
  const setResolvedTheme = useStore((state) => state.setResolvedTheme);

  // This should be called in a useEffect in the root layout
  const syncTheme = () => {
    const root = document.documentElement;
    let resolved: ResolvedTheme;

    if (theme === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } else {
      resolved = theme;
    }

    setResolvedTheme(resolved);

    root.classList.remove("light", "dark");
    root.classList.add(resolved);

    return resolved;
  };

  return { theme, syncTheme };
}
