"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  GoogleMapsProvider,
  InteractiveMap,
  MapMarker,
} from "@/components/maps";
import type { Locale } from "@/types/tree";

interface SpottedTree {
  slug: string;
  timestamp: string;
  notes: string;
  location?: { lat: number; lng: number };
}

interface Tree {
  title: string;
  scientificName: string;
  slug: string;
}

interface FieldTripMapProps {
  spottedTrees: SpottedTree[];
  trees: Tree[];
  locale: Locale;
  onMarkerClick?: (slug: string) => void;
}

export function FieldTripMap({
  spottedTrees,
  trees,
  locale,
  onMarkerClick,
}: FieldTripMapProps) {
  // Generate markers for spotted trees with locations
  const markers = useMemo<MapMarker[]>(() => {
    return spottedTrees
      .filter((spotted) => spotted.location)
      .map((spotted, index) => {
        const tree = trees.find((t) => t.slug === spotted.slug);
        return {
          id: `spotted-${spotted.slug}-${index}`,
          position: spotted.location!,
          title: tree?.title || spotted.slug,
          subtitle: tree?.scientificName,
          icon: "🌳",
          color: "#166534",
          onClick: () => onMarkerClick?.(spotted.slug),
        };
      });
  }, [spottedTrees, trees, onMarkerClick]);

  const treesWithLocation = spottedTrees.filter((s) => s.location).length;

  // Calculate center from spotted trees
  const center = useMemo(() => {
    if (markers.length === 0) return { lat: 9.7489, lng: -83.7534 };

    const sumLat = markers.reduce((sum, m) => sum + m.position.lat, 0);
    const sumLng = markers.reduce((sum, m) => sum + m.position.lng, 0);

    return {
      lat: sumLat / markers.length,
      lng: sumLng / markers.length,
    };
  }, [markers]);

  const ft = useTranslations("fieldTrip");

  const labels = {
    title: ft("mapTitle"),
    noLocations: ft("noLocations"),
    treesOnMap: ft("treesOnMap", { count: treesWithLocation }),
    enableLocation: ft("enableLocation"),
  };

  if (markers.length === 0) {
    return (
      <div className="bg-muted rounded-xl p-6 text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="font-semibold mb-2">{labels.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {labels.noLocations}
        </p>
        <p className="text-xs text-muted-foreground">{labels.enableLocation}</p>
      </div>
    );
  }

  return (
    <GoogleMapsProvider>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <span>🗺️</span> {labels.title}
          </h3>
          <span className="text-sm text-muted-foreground">
            {labels.treesOnMap}
          </span>
        </div>
        <InteractiveMap
          markers={markers}
          center={center}
          zoom={10}
          locale={locale}
          showUserLocation={true}
          restrictToCR={false}
          className="h-[300px]"
        />
      </div>
    </GoogleMapsProvider>
  );
}
