"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

interface TrackViewProps {
  slug: string;
}

/**
 * TrackView - Silently tracks when a tree page is viewed
 * Add this component to tree detail pages to record viewing history.
 */
export function TrackView({ slug }: TrackViewProps) {
  const hydrated = useStore((state) => state._hydrated);
  const addToRecentlyViewed = useStore((state) => state.addToRecentlyViewed);

  useEffect(() => {
    // Only track after hydration to ensure store is ready
    if (hydrated) {
      addToRecentlyViewed(slug);
    }
  }, [slug, addToRecentlyViewed, hydrated]);

  return null;
}
