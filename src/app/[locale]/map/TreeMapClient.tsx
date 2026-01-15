"use client";

import { useState, useMemo } from "react";
import { allTrees } from "contentlayer/generated";
import { Link } from "@i18n/navigation";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  PROVINCES,
  REGIONS,
  MAP_VIEWBOX,
  COUNTRY_OUTLINE,
  NEIGHBORS,
} from "@/lib/geo";
import {
  DISCOVERY_COLLECTIONS,
  getFeaturedCollections,
  getCollectionsByProvince,
  getCollectionsByRegion,
  getCurrentMonth,
  type DiscoveryCollection,
} from "@/lib/geo/collections";
import { ShareCollectionButton } from "@/components/ShareCollectionButton";
import type {
  Locale,
  Province,
  Region,
  Tree as TreeType,
  TreeTag,
} from "@/types/tree";

// Conservation area ecosystem types
type ConservationAreaType =
  | "cloud-forest"
  | "rainforest"
  | "wetland"
  | "volcano"
  | "coastal"
  | "dry-forest"
  | "highland"
  | "transition-forest";

// Conservation areas with approximate locations
// Data source: SINAC (Sistema Nacional de Áreas de Conservación)
const CONSERVATION_AREAS: Array<{
  id: string;
  name: Record<Locale, string>;
  position: { x: number; y: number };
  type: ConservationAreaType;
  icon: string;
}> = [
  {
    id: "monteverde",
    name: { en: "Monteverde Cloud Forest", es: "Bosque Nuboso Monteverde" },
    position: { x: 150, y: 95 },
    type: "cloud-forest" as const,
    icon: "🌲",
  },
  {
    id: "corcovado",
    name: { en: "Corcovado National Park", es: "Parque Nacional Corcovado" },
    position: { x: 115, y: 235 },
    type: "rainforest" as const,
    icon: "🦜",
  },
  {
    id: "tortuguero",
    name: {
      en: "Tortuguero National Park",
      es: "Parque Nacional Tortuguero",
    },
    position: { x: 295, y: 75 },
    type: "wetland" as const,
    icon: "🐢",
  },
  {
    id: "arenal",
    name: {
      en: "Arenal Volcano National Park",
      es: "Parque Nacional Volcán Arenal",
    },
    position: { x: 165, y: 85 },
    type: "volcano" as const,
    icon: "🌋",
  },
  {
    id: "manuel-antonio",
    name: {
      en: "Manuel Antonio National Park",
      es: "Parque Nacional Manuel Antonio",
    },
    position: { x: 155, y: 175 },
    type: "coastal" as const,
    icon: "🏖️",
  },
  {
    id: "santa-rosa",
    name: {
      en: "Santa Rosa National Park",
      es: "Parque Nacional Santa Rosa",
    },
    position: { x: 65, y: 60 },
    type: "dry-forest" as const,
    icon: "🌵",
  },
  {
    id: "la-amistad",
    name: {
      en: "La Amistad Int'l Park",
      es: "P.N. La Amistad",
    },
    position: { x: 230, y: 200 },
    type: "highland" as const,
    icon: "⛰️",
  },
  {
    id: "rincon-de-la-vieja",
    name: {
      en: "Rincón de la Vieja N.P.",
      es: "P.N. Rincón de la Vieja",
    },
    position: { x: 95, y: 55 },
    type: "volcano" as const,
    icon: "🌋",
  },
  {
    id: "poas",
    name: { en: "Poás Volcano N.P.", es: "P.N. Volcán Poás" },
    position: { x: 175, y: 95 },
    type: "volcano" as const,
    icon: "🌋",
  },
  {
    id: "cahuita",
    name: { en: "Cahuita National Park", es: "Parque Nacional Cahuita" },
    position: { x: 305, y: 140 },
    type: "coastal" as const,
    icon: "🏖️",
  },
  {
    id: "carara",
    name: { en: "Carara National Park", es: "Parque Nacional Carara" },
    position: { x: 145, y: 160 },
    type: "transition-forest" as const,
    icon: "🦜",
  },
  {
    id: "chirripo",
    name: { en: "Chirripó National Park", es: "Parque Nacional Chirripó" },
    position: { x: 215, y: 175 },
    type: "highland" as const,
    icon: "🏔️",
  },
];

// Color scale for biodiversity density
function getBiodiversityColor(count: number, max: number): string {
  const intensity = Math.min(count / max, 1);
  if (intensity < 0.2) return "#bbf7d0";
  if (intensity < 0.4) return "#86efac";
  if (intensity < 0.6) return "#4ade80";
  if (intensity < 0.8) return "#22c55e";
  return "#16a34a";
}

interface TreeMapClientProps {
  locale: string;
}

export default function TreeMapClient({ locale }: TreeMapClientProps) {
  const typedLocale = locale as Locale;
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [showConservationAreas, setShowConservationAreas] = useState(true);
  const [activeTab, setActiveTab] = useState<"discover" | "map" | "explore">(
    "discover"
  );
  const [selectedCollection, setSelectedCollection] =
    useState<DiscoveryCollection | null>(null);

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

  // Calculate max for color scaling
  const maxTreeCount = useMemo(() => {
    return Math.max(...Object.values(treesByProvince).map((t) => t.length));
  }, [treesByProvince]);

  // Get trees by region
  const treesByRegion = useMemo(() => {
    const byRegion: Record<Region, Set<TreeType>> = {
      "pacific-coast": new Set(),
      "caribbean-coast": new Set(),
      "central-valley": new Set(),
      "northern-zone": new Set(),
    };

    Object.entries(REGIONS).forEach(([regionId, region]) => {
      region.provinces.forEach((province) => {
        treesByProvince[province].forEach((tree) => {
          byRegion[regionId as Region].add(tree);
        });
      });
    });

    return Object.fromEntries(
      Object.entries(byRegion).map(([k, v]) => [k, Array.from(v)])
    ) as Record<Region, TreeType[]>;
  }, [treesByProvince]);

  // Get trees for a collection
  const getCollectionTrees = useMemo(() => {
    return (collection: DiscoveryCollection): TreeType[] => {
      const currentMonth = getCurrentMonth();

      // Filter by province first
      let filtered = trees.filter((tree) => {
        if (!tree.distribution) return false;
        return tree.distribution.some((d) =>
          collection.provinces.includes(d as Province)
        );
      });

      // Apply tag filters if specified
      if (collection.tags && collection.tags.length > 0) {
        filtered = filtered.filter((tree) => {
          if (!tree.tags) return false;
          return collection.tags!.some((tag) =>
            tree.tags!.includes(tag as TreeTag)
          );
        });
      }

      // Apply special filters
      if (collection.filterFn === "filterByCurrentFlowering") {
        filtered = filtered.filter((tree) => {
          if (!tree.floweringSeason) return false;
          return tree.floweringSeason.includes(currentMonth);
        });
      }

      if (collection.filterFn === "filterByCurrentFruiting") {
        filtered = filtered.filter((tree) => {
          if (!tree.fruitingSeason) return false;
          return tree.fruitingSeason.includes(currentMonth);
        });
      }

      if (collection.filterFn === "filterByHeight") {
        filtered = filtered.sort((a, b) => {
          const heightA = parseInt(a.maxHeight || "0");
          const heightB = parseInt(b.maxHeight || "0");
          return heightB - heightA;
        });
      }

      if (collection.maxTrees) {
        filtered = filtered.slice(0, collection.maxTrees);
      }

      return filtered;
    };
  }, [trees]);

  // Labels
  const labels = {
    title: typedLocale === "es" ? "Explora Costa Rica" : "Explore Costa Rica",
    subtitle:
      typedLocale === "es"
        ? "Descubre árboles por región, temporada y experiencia"
        : "Discover trees by region, season, and experience",
    discover: typedLocale === "es" ? "Descubrir" : "Discover",
    map: typedLocale === "es" ? "Mapa" : "Map",
    explore: typedLocale === "es" ? "Explorar" : "Explore",
    featured:
      typedLocale === "es" ? "Colecciones Destacadas" : "Featured Collections",
    species: typedLocale === "es" ? "especies" : "species",
    viewAll: typedLocale === "es" ? "Ver todos" : "View all",
    viewCollection: typedLocale === "es" ? "Ver colección" : "View collection",
    conservationAreas:
      typedLocale === "es" ? "Áreas Protegidas" : "Protected Areas",
    regions: typedLocale === "es" ? "Regiones" : "Regions",
    provinces: typedLocale === "es" ? "Provincias" : "Provinces",
    biodiversity: typedLocale === "es" ? "Biodiversidad" : "Biodiversity",
    treesFound:
      typedLocale === "es" ? "árboles documentados" : "trees documented",
    clickToExplore:
      typedLocale === "es"
        ? "Haz clic en una provincia para explorar"
        : "Click a province to explore",
    showAreas:
      typedLocale === "es"
        ? "Mostrar áreas protegidas"
        : "Show protected areas",
    totalTrees: typedLocale === "es" ? "Total de especies" : "Total species",
    seasonalNow: typedLocale === "es" ? "Ahora Mismo" : "Right Now",
    byRegion: typedLocale === "es" ? "Por Región" : "By Region",
    allCollections:
      typedLocale === "es" ? "Todas las Colecciones" : "All Collections",
    backToCollections:
      typedLocale === "es" ? "← Volver a colecciones" : "← Back to collections",
    treesInCollection:
      typedLocale === "es"
        ? "Árboles en esta colección"
        : "Trees in this collection",
  };

  const selectedTrees = selectedProvince
    ? treesByProvince[selectedProvince]
    : selectedRegion
      ? treesByRegion[selectedRegion]
      : [];

  const displayProvince = hoveredProvince || selectedProvince;
  const featuredCollections = getFeaturedCollections();

  // Collection Card Component
  const CollectionCard = ({
    collection,
    size = "normal",
  }: {
    collection: DiscoveryCollection;
    size?: "normal" | "large";
  }) => {
    const collectionTrees = getCollectionTrees(collection);
    const isLarge = size === "large";

    const cardClass = isLarge
      ? "group relative bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer col-span-full md:col-span-2"
      : "group relative bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer";

    const paddingClass = isLarge ? "p-6 md:p-8" : "p-6";
    const iconClass = isLarge ? "text-4xl" : "text-3xl";
    const titleClass = isLarge
      ? "font-bold text-foreground group-hover:text-primary transition-colors text-xl md:text-2xl"
      : "font-bold text-foreground group-hover:text-primary transition-colors text-lg";
    const descClass = isLarge
      ? "text-muted-foreground mt-2 text-base line-clamp-2"
      : "text-muted-foreground mt-2 text-sm line-clamp-2";

    return (
      <div
        className={cardClass}
        onClick={() => setSelectedCollection(collection)}
      >
        <div className={paddingClass}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <span className={iconClass}>{collection.icon}</span>
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <ShareCollectionButton
                collection={collection}
                locale={typedLocale}
                treeCount={collectionTrees.length}
              />
            </div>
          </div>

          <h3 className={titleClass}>{collection.title[typedLocale]}</h3>

          <p className={descClass}>{collection.description[typedLocale]}</p>

          {collection.seasonal && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
              <span>⏰</span>
              {collection.seasonal.highlight[typedLocale]}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {collectionTrees.length} {labels.species}
            </span>
            <span className="text-sm text-primary group-hover:translate-x-1 transition-transform">
              {labels.viewCollection} →
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Collection Detail View
  if (selectedCollection) {
    const collectionTrees = getCollectionTrees(selectedCollection);

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-primary/10 to-background py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <button
              onClick={() => setSelectedCollection(null)}
              className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              {labels.backToCollections}
            </button>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedCollection.icon}</span>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {selectedCollection.title[typedLocale]}
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {selectedCollection.description[typedLocale]}
                </p>
                {selectedCollection.seasonal && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
                    <span>⏰</span>
                    {selectedCollection.seasonal.highlight[typedLocale]}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <ShareCollectionButton
                  collection={selectedCollection}
                  locale={typedLocale}
                  treeCount={collectionTrees.length}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {labels.treesInCollection}
            </h2>
            <span className="text-muted-foreground">
              {collectionTrees.length} {labels.species}
            </span>
          </div>

          {collectionTrees.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground">
                {typedLocale === "es"
                  ? "No hay árboles que coincidan con esta colección actualmente."
                  : "No trees match this collection currently."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collectionTrees.map((tree) => (
                <Link
                  key={tree.slug}
                  href={`/trees/${tree.slug}`}
                  className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {tree.featuredImage ? (
                      <OptimizedImage
                        src={tree.featuredImage}
                        alt={tree.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={false}
                        quality={75}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🌳
                      </div>
                    )}
                    {tree.conservationStatus &&
                      tree.conservationStatus !== "LC" && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-500/90 text-white text-xs font-medium rounded-full">
                          {tree.conservationStatus}
                        </div>
                      )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tree.title}
                    </h3>
                    <p className="text-sm text-muted-foreground italic">
                      {tree.scientificName}
                    </p>
                    {tree.maxHeight && (
                      <p className="text-xs text-muted-foreground mt-2">
                        📏 {tree.maxHeight}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">
              {typedLocale === "es"
                ? "Colecciones Relacionadas"
                : "Related Collections"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DISCOVERY_COLLECTIONS.filter(
                (c) =>
                  c.id !== selectedCollection.id &&
                  c.regions.some((r) => selectedCollection.regions.includes(r))
              )
                .slice(0, 3)
                .map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            🗺️ {labels.title}
          </h1>
          <p className="text-lg text-muted-foreground">{labels.subtitle}</p>

          <div className="mt-6 flex gap-2">
            {(["discover", "map", "explore"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const tabClass = isActive
                ? "px-5 py-2.5 rounded-full font-medium transition-all bg-primary text-primary-foreground shadow-md"
                : "px-5 py-2.5 rounded-full font-medium transition-all bg-muted hover:bg-muted/80 text-muted-foreground";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={tabClass}
                >
                  {tab === "discover" && "✨ "}
                  {tab === "map" && "🗺️ "}
                  {tab === "explore" && "🔍 "}
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {activeTab === "discover" && (
          <div className="space-y-12">
            <section className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-4">
                <span className="text-4xl">🌿</span>
                <div>
                  <h2 className="text-xl font-bold mb-2 text-green-900 dark:text-green-100">
                    {typedLocale === "es"
                      ? "Costa Rica: Potencia de Biodiversidad"
                      : "Costa Rica: Biodiversity Powerhouse"}
                  </h2>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                    {typedLocale === "es"
                      ? "Con solo el 0.03% de la superficie terrestre, Costa Rica alberga aproximadamente el 5% de toda la biodiversidad del planeta. Más del 25% del territorio está protegido como parques nacionales y reservas."
                      : "With just 0.03% of Earth's land surface, Costa Rica hosts approximately 5% of all the planet's biodiversity. Over 25% of the country is protected as national parks and reserves."}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white/50 dark:bg-green-900/30 rounded-lg p-2 text-center">
                      <div className="font-bold text-green-700 dark:text-green-300">
                        30+
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        {typedLocale === "es"
                          ? "Parques Nacionales"
                          : "National Parks"}
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-green-900/30 rounded-lg p-2 text-center">
                      <div className="font-bold text-green-700 dark:text-green-300">
                        ~500,000
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        {typedLocale === "es" ? "Especies" : "Species"}
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-green-900/30 rounded-lg p-2 text-center">
                      <div className="font-bold text-green-700 dark:text-green-300">
                        12
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        {typedLocale === "es" ? "Zonas de Vida" : "Life Zones"}
                      </div>
                    </div>
                    <div className="bg-white/50 dark:bg-green-900/30 rounded-lg p-2 text-center">
                      <div className="font-bold text-green-700 dark:text-green-300">
                        25%+
                      </div>
                      <div className="text-green-600 dark:text-green-400">
                        {typedLocale === "es"
                          ? "Área Protegida"
                          : "Protected Area"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                ✨ {labels.featured}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCollections.slice(0, 1).map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    size="large"
                  />
                ))}
                {featuredCollections.slice(1, 3).map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                ⏰ {labels.seasonalNow}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DISCOVERY_COLLECTIONS.filter((c) => c.type === "seasonal").map(
                  (collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                    />
                  )
                )}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                🌎 {labels.byRegion}
              </h2>
              {Object.entries(REGIONS).map(([regionId, region]) => {
                const regionCollections = getCollectionsByRegion(
                  regionId as Region
                );
                if (regionCollections.length === 0) return null;
                return (
                  <div key={regionId} className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                      {region.name[typedLocale]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {regionCollections.slice(0, 3).map((collection) => (
                        <CollectionCard
                          key={collection.id}
                          collection={collection}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                📚 {labels.allCollections}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DISCOVERY_COLLECTIONS.filter((c) => !c.featured).map(
                  (collection) => (
                    <CollectionCard
                      key={collection.id}
                      collection={collection}
                    />
                  )
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "map" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {trees.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  {labels.totalTrees}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <div className="text-3xl font-bold text-green-600">7</div>
                <div className="text-sm text-muted-foreground">
                  {labels.provinces}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">4</div>
                <div className="text-sm text-muted-foreground">
                  {labels.regions}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <div className="text-3xl font-bold text-amber-600">12</div>
                <div className="text-sm text-muted-foreground">
                  {labels.conservationAreas}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-4 flex gap-4 flex-wrap items-center">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showConservationAreas}
                      onChange={(e) =>
                        setShowConservationAreas(e.target.checked)
                      }
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{labels.showAreas}</span>
                  </label>
                  {(selectedProvince || selectedRegion) && (
                    <button
                      onClick={() => {
                        setSelectedProvince(null);
                        setSelectedRegion(null);
                      }}
                      className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors text-sm"
                    >
                      ✕{" "}
                      {typedLocale === "es"
                        ? "Limpiar selección"
                        : "Clear selection"}
                    </button>
                  )}
                </div>

                <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
                  <svg
                    viewBox={MAP_VIEWBOX}
                    className="w-full h-auto"
                    role="img"
                    aria-label={labels.title}
                  >
                    <defs>
                      <linearGradient
                        id="waterGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#bfdbfe" />
                        <stop offset="50%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                      <linearGradient
                        id="waterGradientDark"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#1e3a5f" />
                        <stop offset="50%" stopColor="#1e40af" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                      </linearGradient>
                      <linearGradient
                        id="landGradient"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#f5f5f4" />
                        <stop offset="100%" stopColor="#e7e5e4" />
                      </linearGradient>
                      <filter
                        id="dropShadow"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                      >
                        <feDropShadow
                          dx="2"
                          dy="3"
                          stdDeviation="4"
                          floodOpacity="0.25"
                        />
                      </filter>
                      <filter
                        id="glow"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                      >
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      {Object.keys(PROVINCES).map((province) => {
                        const count =
                          treesByProvince[province as Province].length;
                        const color = getBiodiversityColor(count, maxTreeCount);
                        return (
                          <linearGradient
                            key={province}
                            id={`provinceGradient-${province}`}
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor={color}
                              stopOpacity="0.9"
                            />
                            <stop
                              offset="100%"
                              stopColor={color}
                              stopOpacity="0.7"
                            />
                          </linearGradient>
                        );
                      })}
                    </defs>

                    <rect
                      x="0"
                      y="0"
                      width="360"
                      height="280"
                      className="fill-[url(#waterGradient)] dark:fill-[url(#waterGradientDark)]"
                    />
                    <path
                      d={COUNTRY_OUTLINE}
                      className="fill-[url(#landGradient)] dark:fill-stone-700"
                      stroke="#78716c"
                      strokeWidth="3"
                      filter="url(#dropShadow)"
                    />

                    {Object.entries(PROVINCES).map(([key, province]) => {
                      const isSelected = selectedProvince === key;
                      const isHovered = hoveredProvince === key;
                      const isInSelectedRegion =
                        selectedRegion &&
                        REGIONS[selectedRegion].provinces.includes(
                          key as Province
                        );
                      const treeCount = treesByProvince[key as Province].length;
                      const fillValue =
                        isSelected || isInSelectedRegion || isHovered
                          ? `url(#provinceGradient-${key})`
                          : "transparent";
                      const filterValue =
                        isSelected || isHovered ? "url(#glow)" : "none";
                      return (
                        <g key={key}>
                          <path
                            d={province.path}
                            stroke={
                              isSelected || isHovered ? "#166534" : "#57534e"
                            }
                            strokeWidth={
                              isSelected || isHovered ? "2.5" : "1.5"
                            }
                            className="cursor-pointer transition-all duration-200"
                            style={{ fill: fillValue, filter: filterValue }}
                            onClick={() => {
                              setSelectedProvince(key as Province);
                              setSelectedRegion(null);
                            }}
                            onMouseEnter={() =>
                              setHoveredProvince(key as Province)
                            }
                            onMouseLeave={() => setHoveredProvince(null)}
                            tabIndex={0}
                            role="button"
                            aria-label={`${province.name[typedLocale]}: ${treeCount} ${labels.species}`}
                          />
                          <text
                            x={province.center.x}
                            y={province.center.y - 5}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="600"
                            className="pointer-events-none select-none fill-stone-700 dark:fill-stone-100"
                            style={{
                              textShadow: "0 0 4px rgba(255,255,255,0.9)",
                            }}
                          >
                            {province.name[typedLocale]}
                          </text>
                          <text
                            x={province.center.x}
                            y={province.center.y + 8}
                            textAnchor="middle"
                            fontSize="7"
                            className="pointer-events-none select-none fill-stone-500 dark:fill-stone-300"
                          >
                            {treeCount} 🌳
                          </text>
                        </g>
                      );
                    })}

                    {showConservationAreas &&
                      CONSERVATION_AREAS.map((area) => (
                        <g key={area.id} className="cursor-pointer">
                          <circle
                            cx={area.position.x}
                            cy={area.position.y}
                            r="8"
                            fill="white"
                            stroke="#059669"
                            strokeWidth="2"
                            className="dark:fill-stone-800"
                          />
                          <text
                            x={area.position.x}
                            y={area.position.y + 3}
                            textAnchor="middle"
                            fontSize="8"
                            className="pointer-events-none select-none"
                          >
                            {area.icon}
                          </text>
                        </g>
                      ))}

                    {Object.entries(NEIGHBORS).map(([key, neighbor]) => (
                      <text
                        key={key}
                        x={neighbor.label.x}
                        y={neighbor.label.y}
                        textAnchor="middle"
                        fontSize="10"
                        className="pointer-events-none select-none italic fill-blue-400 dark:fill-blue-300"
                        style={{ fontStyle: "italic" }}
                      >
                        {neighbor.name[typedLocale]}
                      </text>
                    ))}
                  </svg>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {labels.biodiversity}:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {typedLocale === "es" ? "Menor" : "Lower"}
                        </span>
                        {[
                          "#bbf7d0",
                          "#86efac",
                          "#4ade80",
                          "#22c55e",
                          "#16a34a",
                        ].map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-4 rounded-sm"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground">
                          {typedLocale === "es" ? "Mayor" : "Higher"}
                        </span>
                      </div>
                    </div>
                    {showConservationAreas && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-4 h-4 rounded-full border-2 border-green-600 bg-white flex items-center justify-center text-xs">
                          🌲
                        </span>
                        <span>{labels.conservationAreas}</span>
                      </div>
                    )}
                  </div>
                </div>

                {displayProvince && (
                  <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {PROVINCES[displayProvince].name[typedLocale]}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {PROVINCES[displayProvince].capital[typedLocale]}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>
                          {PROVINCES[displayProvince].area.toLocaleString()} km²
                        </p>
                        <p>
                          {PROVINCES[
                            displayProvince
                          ].population.toLocaleString()}{" "}
                          {typedLocale === "es" ? "hab." : "pop."}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-foreground">
                        {PROVINCES[displayProvince].climate[typedLocale]}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm font-medium text-muted-foreground">
                        {treesByProvince[displayProvince].length}{" "}
                        {labels.treesFound}
                      </p>
                    </div>
                  </div>
                )}

                {!displayProvince && !selectedRegion && (
                  <p className="mt-4 text-center text-muted-foreground">
                    👆 {labels.clickToExplore}
                  </p>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🌎 {labels.regions}
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(REGIONS).map(([key, region]) => {
                      const regionTrees = treesByRegion[key as Region];
                      const isActive = selectedRegion === key;
                      const btnClass = isActive
                        ? "w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left bg-primary/10 text-primary border border-primary/30"
                        : "w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left hover:bg-muted border border-transparent";
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedRegion(key as Region);
                            setSelectedProvince(null);
                          }}
                          className={btnClass}
                        >
                          <div>
                            <span className="font-medium">
                              {region.name[typedLocale]}
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {region.description[typedLocale]}
                            </p>
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">
                            {regionTrees.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {(selectedProvince || selectedRegion) && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      {selectedProvince
                        ? PROVINCES[selectedProvince].name[typedLocale]
                        : selectedRegion
                          ? REGIONS[selectedRegion].name[typedLocale]
                          : ""}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedTrees.length} {labels.species}
                    </p>
                    <ul className="space-y-2 max-h-72 overflow-y-auto">
                      {selectedTrees.slice(0, 15).map((tree) => (
                        <li key={tree.slug}>
                          <Link
                            href={`/trees/${tree.slug}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <span className="text-lg">🌳</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {tree.title}
                              </p>
                              <p className="text-xs text-muted-foreground italic truncate">
                                {tree.scientificName}
                              </p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {selectedTrees.length > 15 && (
                      <Link
                        href={
                          selectedProvince
                            ? `/trees?distribution=${selectedProvince}`
                            : `/trees`
                        }
                        className="block mt-4 text-sm text-primary hover:underline text-center"
                      >
                        {labels.viewAll} ({selectedTrees.length}) →
                      </Link>
                    )}
                  </div>
                )}

                {selectedProvince && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4">
                      {typedLocale === "es"
                        ? "Colecciones Relacionadas"
                        : "Related Collections"}
                    </h2>
                    <div className="space-y-3">
                      {getCollectionsByProvince(selectedProvince)
                        .slice(0, 3)
                        .map((collection) => (
                          <button
                            key={collection.id}
                            onClick={() => setSelectedCollection(collection)}
                            className="w-full text-left p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span>{collection.icon}</span>
                              <span className="text-sm font-medium line-clamp-1">
                                {collection.title[typedLocale]}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🏞️ {labels.conservationAreas}
                  </h2>
                  <div className="text-xs text-muted-foreground mb-3">
                    {typedLocale === "es"
                      ? "Parques Nacionales de Costa Rica"
                      : "Costa Rica National Parks"}
                  </div>
                  <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {CONSERVATION_AREAS.map((area) => {
                      const ecosystemLabel =
                        typedLocale === "es"
                          ? area.type === "cloud-forest"
                            ? "Bosque Nuboso"
                            : area.type === "rainforest"
                              ? "Bosque Lluvioso"
                              : area.type === "wetland"
                                ? "Humedal"
                                : area.type === "volcano"
                                  ? "Volcán"
                                  : area.type === "coastal"
                                    ? "Costero"
                                    : area.type === "dry-forest"
                                      ? "Bosque Seco"
                                      : area.type === "highland"
                                        ? "Tierras Altas"
                                        : area.type === "transition-forest"
                                          ? "Bosque de Transición"
                                          : area.type
                          : area.type === "cloud-forest"
                            ? "Cloud Forest"
                            : area.type === "rainforest"
                              ? "Rainforest"
                              : area.type === "wetland"
                                ? "Wetland"
                                : area.type === "volcano"
                                  ? "Volcano"
                                  : area.type === "coastal"
                                    ? "Coastal"
                                    : area.type === "dry-forest"
                                      ? "Dry Forest"
                                      : area.type === "highland"
                                        ? "Highland"
                                        : area.type === "transition-forest"
                                          ? "Transition Forest"
                                          : area.type;
                      return (
                        <li
                          key={area.id}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <span className="text-xl flex-shrink-0">
                            {area.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">
                              {area.name[typedLocale]}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {ecosystemLabel}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "explore" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {typedLocale === "es"
                ? "Explorar por Provincia"
                : "Explore by Province"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(PROVINCES).map(([key, province]) => {
                const count = treesByProvince[key as Province].length;
                const color = getBiodiversityColor(count, maxTreeCount);
                const provinceCollections = getCollectionsByProvince(
                  key as Province
                );
                const provinceIcon =
                  key === "guanacaste"
                    ? "🌵"
                    : key === "puntarenas"
                      ? "🏖️"
                      : key === "limon"
                        ? "🌴"
                        : key === "alajuela"
                          ? "🌋"
                          : key === "heredia"
                            ? "☕"
                            : key === "san-jose"
                              ? "🏙️"
                              : "⛪";
                return (
                  <div
                    key={key}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all"
                  >
                    <div className="h-3" style={{ backgroundColor: color }} />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">
                          {province.name[typedLocale]}
                        </h3>
                        <span className="text-2xl">{provinceIcon}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span>
                          {count} {labels.species}
                        </span>
                        <span>{province.area.toLocaleString()} km²</span>
                      </div>
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          {typedLocale === "es"
                            ? "Árboles destacados:"
                            : "Featured trees:"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {treesByProvince[key as Province]
                            .slice(0, 4)
                            .map((tree) => (
                              <Link
                                key={tree.slug}
                                href={`/trees/${tree.slug}`}
                                className="px-2 py-0.5 bg-muted rounded text-xs hover:bg-primary/20 transition-colors"
                              >
                                {tree.title}
                              </Link>
                            ))}
                          {count > 4 && (
                            <span className="px-2 py-0.5 text-xs text-muted-foreground">
                              +{count - 4}
                            </span>
                          )}
                        </div>
                      </div>
                      {provinceCollections.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">
                            {typedLocale === "es"
                              ? "Colecciones:"
                              : "Collections:"}
                          </p>
                          <div className="space-y-1">
                            {provinceCollections
                              .slice(0, 2)
                              .map((collection) => (
                                <button
                                  key={collection.id}
                                  onClick={() =>
                                    setSelectedCollection(collection)
                                  }
                                  className="w-full flex items-center gap-2 text-left text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors"
                                >
                                  <span>{collection.icon}</span>
                                  <span className="line-clamp-1">
                                    {collection.title[typedLocale]}
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                      <Link
                        href={`/trees?distribution=${key}`}
                        className="block w-full text-center py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
                      >
                        {labels.viewAll} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
