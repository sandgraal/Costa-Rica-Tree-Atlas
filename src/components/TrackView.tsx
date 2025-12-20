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
  const addToRecentlyViewed = useStore((state) => state.addToRecentlyViewed);

  useEffect(() => {
    addToRecentlyViewed(slug);
  }, [slug, addToRecentlyViewed]);

  return null;
}
