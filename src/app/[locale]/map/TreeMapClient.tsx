"use client";

import { useState, useMemo, useEffect } from "react";
import { allTrees } from "contentlayer/generated";
import { Link } from "@i18n/navigation";
import {
  GoogleMapsProvider,
  InteractiveMap,
  MapMarker,
} from "@/components/maps";
import { PROVINCES } from "@/lib/geo";
import type { Locale, Province, Tree as TreeType } from "@/types/tree";

// Province center coordinates for Costa Rica
const PROVINCE_COORDINATES: Record<Province, { lat: number; lng: number }> = {
  guanacaste: { lat: 10.4274, lng: -85.4528 },
  puntarenas: { lat: 9.9778, lng: -84.8383 },
  alajuela: { lat: 10.0159, lng: -84.2142 },
  heredia: { lat: 10.0024, lng: -84.1165 },
  "san-jose": { lat: 9.9281, lng: -84.0907 },
  cartago: { lat: 9.8644, lng: -83.9194 },
  limon: { lat: 9.9907, lng: -83.0359 },
};

// Notable tree observation locations in Costa Rica
const NOTABLE_LOCATIONS = [
  {
    id: "monteverde",
    name: { en: "Monteverde Cloud Forest", es: "Bosque Nuboso Monteverde" },
    position: { lat: 10.307, lng: -84.805 },
    trees: ["cloud-forest", "endemic"],
    icon: "🌲",
  },
  {
    id: "corcovado",
    name: { en: "Corcovado National Park", es: "Parque Nacional Corcovado" },
    position: { lat: 8.5242, lng: -83.575 },
    trees: ["rainforest", "endangered"],
    icon: "🌳",
  },
  {
    id: "santa-rosa",
    name: { en: "Santa Rosa National Park", es: "Parque Nacional Santa Rosa" },
    position: { lat: 10.8391, lng: -85.6166 },
    trees: ["dry-forest", "guanacaste"],
    icon: "🌴",
  },
  {
    id: "tortuguero",
    name: { en: "Tortuguero National Park", es: "Parque Nacional Tortuguero" },
    position: { lat: 10.543, lng: -83.502 },
    trees: ["rainforest", "wildlife-food"],
    icon: "🌿",
  },
  {
    id: "arenal",
    name: { en: "Arenal Volcano", es: "Volcán Arenal" },
    position: { lat: 10.4626, lng: -84.7033 },
    trees: ["rainforest", "native"],
    icon: "🌋",
  },
  {
    id: "manuel-antonio",
    name: { en: "Manuel Antonio", es: "Manuel Antonio" },
    position: { lat: 9.3921, lng: -84.1364 },
    trees: ["rainforest", "wildlife-food"],
    icon: "🏖️",
  },
];

interface TreeMapClientProps {
  locale: string;
}

export default function TreeMapClient({ locale }: TreeMapClientProps) {
  const typedLocale = locale as Locale;
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showTreesNearMe, setShowTreesNearMe] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [nearestProvince, setNearestProvince] = useState<Province | null>(null);

  // Get trees for current locale
  const trees = useMemo(() => {
    return allTrees.filter((tree) => tree.locale === locale) as TreeType[];
  }, [locale]);

  // Get trees by province
  const treesByProvince = useMemo(() => {
    const byProvince: Record<Province, TreeType[]> = {
      guanacaste: [],
      puntarenas: [],
      alajuela: [],
      heredia: [],
      "san-jose": [],
      cartago: [],
      limon: [],
    };

    trees.forEach((tree) => {
      if (tree.distribution) {
        tree.distribution.forEach((dist) => {
          if (dist in byProvince) {
            byProvince[dist as Province].push(tree);
          }
        });
      }
    });

    return byProvince;
  }, [trees]);

  // Generate map markers
  const markers = useMemo<MapMarker[]>(() => {
    const markerList: MapMarker[] = [];

    // Add province markers
    Object.entries(PROVINCE_COORDINATES).forEach(([province, coords]) => {
      const provinceTrees = treesByProvince[province as Province];
      markerList.push({
        id: `province-${province}`,
        position: coords,
        title: PROVINCES[province as Province].name[typedLocale],
        subtitle: `${provinceTrees.length} ${typedLocale === "es" ? "especies" : "species"}`,
        icon: "📍",
        color: selectedProvince === province ? "#166534" : "#2d5a27",
        onClick: () => setSelectedProvince(province as Province),
      });
    });

    // Add notable location markers
    NOTABLE_LOCATIONS.forEach((location) => {
      markerList.push({
        id: `location-${location.id}`,
        position: location.position,
        title: location.name[typedLocale],
        icon: location.icon,
        color: selectedLocation === location.id ? "#0369a1" : "#0ea5e9",
        onClick: () => setSelectedLocation(location.id),
      });
    });

    return markerList;
  }, [treesByProvince, selectedProvince, selectedLocation, typedLocale]);

  // Get user location and find nearest province
  useEffect(() => {
    if (showTreesNearMe && !userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(userPos);

            // Find nearest province
            let nearest: Province = "san-jose";
            let minDistance = Infinity;

            Object.entries(PROVINCE_COORDINATES).forEach(
              ([province, coords]) => {
                const distance = Math.sqrt(
                  Math.pow(userPos.lat - coords.lat, 2) +
                    Math.pow(userPos.lng - coords.lng, 2)
                );
                if (distance < minDistance) {
                  minDistance = distance;
                  nearest = province as Province;
                }
              }
            );

            setNearestProvince(nearest);
            setSelectedProvince(nearest);
          },
          (error) => {
            console.error("Geolocation error:", error);
            setShowTreesNearMe(false);
          }
        );
      }
    }
  }, [showTreesNearMe, userLocation]);

  // Labels
  const labels = {
    title: typedLocale === "es" ? "Mapa de Árboles" : "Tree Map",
    subtitle:
      typedLocale === "es"
        ? "Explora la distribución de árboles nativos en Costa Rica"
        : "Explore the distribution of native trees in Costa Rica",
    treesNearMe: typedLocale === "es" ? "Árboles cerca de mí" : "Trees Near Me",
    province: typedLocale === "es" ? "Provincia" : "Province",
    species: typedLocale === "es" ? "especies" : "species",
    viewAll: typedLocale === "es" ? "Ver todos" : "View all",
    selectProvince:
      typedLocale === "es"
        ? "Selecciona una provincia en el mapa"
        : "Select a province on the map",
    notableLocations:
      typedLocale === "es" ? "Lugares destacados" : "Notable Locations",
    treesInArea:
      typedLocale === "es" ? "Árboles en esta área" : "Trees in this area",
    yourLocation: typedLocale === "es" ? "Tu ubicación" : "Your location",
    nearestProvince:
      typedLocale === "es" ? "Provincia más cercana" : "Nearest province",
  };

  const selectedTrees = selectedProvince
    ? treesByProvince[selectedProvince]
    : [];
  const selectedLocationData = selectedLocation
    ? NOTABLE_LOCATIONS.find((l) => l.id === selectedLocation)
    : null;

  return (
    <GoogleMapsProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-b from-primary/10 to-background py-8 px-4">
          <div className="container mx-auto max-w-7xl">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              🗺️ {labels.title}
            </h1>
            <p className="text-lg text-muted-foreground">{labels.subtitle}</p>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              {/* Trees Near Me Button */}
              <div className="mb-4 flex gap-4 flex-wrap">
                <button
                  onClick={() => setShowTreesNearMe(!showTreesNearMe)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    showTreesNearMe
                      ? "bg-blue-500 text-white"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {labels.treesNearMe}
                </button>

                {selectedProvince && (
                  <button
                    onClick={() => {
                      setSelectedProvince(null);
                      setShowTreesNearMe(false);
                    }}
                    className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                  >
                    ✕{" "}
                    {typedLocale === "es"
                      ? "Limpiar selección"
                      : "Clear selection"}
                  </button>
                )}
              </div>

              <InteractiveMap
                markers={markers}
                locale={typedLocale}
                showUserLocation={showTreesNearMe}
                className="h-[500px] shadow-lg"
              />

              {/* User location info */}
              {showTreesNearMe && nearestProvince && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    📍 {labels.nearestProvince}:{" "}
                    <strong>
                      {PROVINCES[nearestProvince].name[typedLocale]}
                    </strong>
                    {" • "}
                    {treesByProvince[nearestProvince].length} {labels.species}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Province Selection */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {selectedProvince
                    ? PROVINCES[selectedProvince].name[typedLocale]
                    : labels.selectProvince}
                </h2>

                {selectedProvince ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {selectedTrees.length} {labels.species}
                    </p>

                    <ul className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedTrees.slice(0, 10).map((tree) => (
                        <li key={tree.slug}>
                          <Link
                            href={`/trees/${tree.slug}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span>🌳</span>
                            <div>
                              <p className="text-sm font-medium">
                                {tree.title}
                              </p>
                              <p className="text-xs text-muted-foreground italic">
                                {tree.scientificName}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {selectedTrees.length > 10 && (
                      <Link
                        href={`/trees?distribution=${selectedProvince}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {labels.viewAll} ({selectedTrees.length}) →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(PROVINCES).map(([key, province]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedProvince(key as Province)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <span>{province.name[typedLocale]}</span>
                        <span className="text-sm text-muted-foreground">
                          {treesByProvince[key as Province].length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notable Locations */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">
                  {labels.notableLocations}
                </h2>
                <ul className="space-y-2">
                  {NOTABLE_LOCATIONS.map((location) => (
                    <li key={location.id}>
                      <button
                        onClick={() => setSelectedLocation(location.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                          selectedLocation === location.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="text-xl">{location.icon}</span>
                        <span className="text-sm">
                          {location.name[typedLocale]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Selected Location Info */}
              {selectedLocationData && (
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-2">
                    {selectedLocationData.icon}{" "}
                    {selectedLocationData.name[typedLocale]}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {labels.treesInArea}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocationData.trees.map((tag) => (
                      <Link
                        key={tag}
                        href={`/trees?tags=${tag}`}
                        className="px-3 py-1 bg-muted rounded-full text-xs hover:bg-muted/80 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Province Quick Grid */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              {typedLocale === "es"
                ? "Árboles por Provincia"
                : "Trees by Province"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(PROVINCES).map(([key, province]) => (
                <Link
                  key={key}
                  href={`/trees?distribution=${key}`}
                  className="bg-card rounded-xl border border-border p-4 text-center hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="text-3xl mb-2">🌳</div>
                  <h3 className="font-semibold text-sm mb-1">
                    {province.name[typedLocale]}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {treesByProvince[key as Province].length} {labels.species}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
