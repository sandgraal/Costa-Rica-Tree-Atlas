"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const STORAGE_KEY = "cr-tree-atlas-favorites";

interface FavoritesContextType {
  favorites: string[];
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  addFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
    setIsInitialized(true);
  }, []);

  // Persist favorites to localStorage
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Failed to save favorites:", error);
    }
  }, [favorites, isInitialized]);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites]
  );

  const addFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      if (prev.includes(slug)) return prev;
      return [...prev, slug];
    });
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    setFavorites((prev) => prev.filter((s) => s !== slug));
  }, []);

  const toggleFavorite = useCallback(
    (slug: string) => {
      if (isFavorite(slug)) {
        removeFavorite(slug);
      } else {
        addFavorite(slug);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
