/**
 * Unified client-side store using Zustand
 * Replaces: FavoritesProvider, RecentlyViewedProvider, ThemeProvider
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ============================================================================
// Constants
// ============================================================================

/**
 * Storage key for Zustand persist
 * Used by both the store and the theme initialization script
 */
export const STORE_KEY = "cr-tree-atlas";

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
  /**
   * Hydration state - DO NOT use this directly in components that need hydration checks
   * Instead, use: const hydrated = useStore(state => state._hydrated)
   *
   * This flag is set to true when the persist middleware completes hydration from localStorage.
   * Use this to prevent hydration mismatches when rendering persisted state (favorites, theme, etc).
   *
   * @important Never use `suppressHydrationWarning` without first checking _hydrated
   */
  _hydrated: boolean;

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
      // Hydration state - starts false, set to true when persist middleware completes
      _hydrated: false,

      // Theme (flattened)
      theme: "system" as Theme,
      resolvedTheme: "light" as ResolvedTheme,

      setTheme: (theme) => {
        set({ theme });

        // Update DOM immediately
        updateThemeDOM(theme, get, set);
      },

      setResolvedTheme: (resolved) => {
        set({ resolvedTheme: resolved });

        // Update DOM
        applyThemeToDOM(resolved);
      },

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
      name: STORE_KEY,
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
      /**
       * Called when the store is rehydrated from localStorage
       * This is where we set _hydrated to true and validate persisted data
       */
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to hydrate store from localStorage:", error);
          // Clear corrupted data
          try {
            localStorage.removeItem(STORE_KEY);
          } catch {
            // Ignore if localStorage is not accessible
          }
        }

        if (state) {
          // Validate and sanitize persisted data
          if (!Array.isArray(state.favorites)) {
            state.favorites = [];
          }
          if (!Array.isArray(state.recentlyViewed)) {
            state.recentlyViewed = [];
          }
          // Validate theme
          if (!["light", "dark", "system"].includes(state.theme)) {
            state.theme = "system";
          }

          // Sync with DOM theme set by blocking script
          if (typeof document !== "undefined") {
            const dataTheme = document.documentElement.getAttribute(
              "data-theme"
            ) as ResolvedTheme | null;
            const hasClass =
              document.documentElement.classList.contains("dark") ||
              document.documentElement.classList.contains("light");

            if (dataTheme && (dataTheme === "dark" || dataTheme === "light")) {
              state.resolvedTheme = dataTheme;

              // Ensure class is in sync
              if (!hasClass) {
                document.documentElement.classList.add(dataTheme);
              }
            }
          }

          // Mark as hydrated - this must be the last operation
          state._hydrated = true;
        }
      },
      partialize: (state) => ({
        theme: state.theme,
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
        // Explicitly exclude _hydrated from persistence
      }),
    }
  )
);

// ============================================================================
// DOM Helper Functions
// ============================================================================

/**
 * Apply a resolved theme to the DOM
 */
function applyThemeToDOM(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
}

/**
 * Update theme in DOM based on theme setting
 * Resolves 'system' to actual theme and applies to DOM
 */
function updateThemeDOM(
  theme: Theme,
  get: () => StoreState,
  set: (partial: Partial<StoreState>) => void
) {
  if (typeof document === "undefined") return;

  let resolved: ResolvedTheme;
  if (theme === "system") {
    resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } else {
    resolved = theme;
  }

  applyThemeToDOM(resolved);

  // Update resolved theme in store
  set({ resolvedTheme: resolved });
}

// ============================================================================
// Hooks for common patterns
// ============================================================================

export function useFavorite(slug: string) {
  const isFavorite = useStore((state) => state.favorites.includes(slug));
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  return { isFavorite, toggle: () => toggleFavorite(slug) };
}

/**
 * @deprecated Use the ThemeSync component instead
 * This hook is kept for backward compatibility but is no longer used internally
 */
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
