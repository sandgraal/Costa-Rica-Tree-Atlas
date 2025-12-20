"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

const STORAGE_KEY = "cr-tree-atlas-recently-viewed";
const MAX_RECENT = 10;

interface RecentlyViewedContextType {
  recentlyViewed: string[];
  addToRecentlyViewed: (slug: string) => void;
  clearRecentlyViewed: () => void;
}

const RecentlyViewedContext = createContext<
  RecentlyViewedContextType | undefined
>(undefined);

interface RecentlyViewedProviderProps {
  children: ReactNode;
}

export function RecentlyViewedProvider({
  children,
}: RecentlyViewedProviderProps) {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecentlyViewed(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load recently viewed:", error);
    }
    setIsInitialized(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error("Failed to save recently viewed:", error);
    }
  }, [recentlyViewed, isInitialized]);

  const addToRecentlyViewed = useCallback((slug: string) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists (to move to front)
      const filtered = prev.filter((s) => s !== slug);
      // Add to front and limit to MAX_RECENT
      return [slug, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
  }, []);

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        addToRecentlyViewed,
        clearRecentlyViewed,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (context === undefined) {
    throw new Error(
      "useRecentlyViewed must be used within a RecentlyViewedProvider"
    );
  }
  return context;
}
