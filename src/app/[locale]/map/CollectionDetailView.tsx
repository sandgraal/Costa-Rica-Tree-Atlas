"use client";

import { Link } from "@i18n/navigation";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ShareCollectionButton } from "@/components/ShareCollectionButton";
import { DISCOVERY_COLLECTIONS } from "@/lib/geo/collections";
import type { DiscoveryCollection } from "@/lib/geo/collections";
import type { Locale } from "@/types/tree";
import type { MapTreeSummary } from "./TreeMapClient";
import { CollectionCard } from "./CollectionCard";

interface CollectionDetailViewProps {
  collection: DiscoveryCollection;
  locale: Locale;
  labels: {
    backToCollections: string;
    treesInCollection: string;
    species: string;
    viewCollection: string;
  };
  getCollectionTrees: (collection: DiscoveryCollection) => MapTreeSummary[];
  onBack: () => void;
  onSelectCollection: (collection: DiscoveryCollection) => void;
}

export function CollectionDetailView({
  collection,
  locale,
  labels,
  getCollectionTrees,
  onBack,
  onSelectCollection,
}: CollectionDetailViewProps) {
  const collectionTrees = getCollectionTrees(collection);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-background py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            {labels.backToCollections}
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{collection.icon}</span>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {collection.title[locale]}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {collection.description[locale]}
              </p>
              {collection.seasonal && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
                  <span>⏰</span>
                  {collection.seasonal.highlight[locale]}
                </div>
              )}
            </div>

            <div className="flex-shrink-0">
              <ShareCollectionButton
                collection={collection}
                locale={locale}
                treeCount={collectionTrees.length}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{labels.treesInCollection}</h2>
          <span className="text-muted-foreground">
            {collectionTrees.length} {labels.species}
          </span>
        </div>

        {collectionTrees.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">
              {locale === "es"
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
            {locale === "es"
              ? "Colecciones Relacionadas"
              : "Related Collections"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISCOVERY_COLLECTIONS.filter(
              (c) =>
                c.id !== collection.id &&
                c.regions.some((r) => collection.regions.includes(r))
            )
              .slice(0, 3)
              .map((relatedCollection) => (
                <CollectionCard
                  key={relatedCollection.id}
                  collection={relatedCollection}
                  locale={locale}
                  speciesLabel={labels.species}
                  viewCollectionLabel={labels.viewCollection}
                  getCollectionTrees={getCollectionTrees}
                  onSelect={onSelectCollection}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
