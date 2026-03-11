"use client";
/* eslint-disable security/detect-object-injection -- collection text uses typed locale-key dictionaries */

import { ShareCollectionButton } from "@/components/ShareCollectionButton";
import type { DiscoveryCollection } from "@/lib/geo/collections";
import type { Locale } from "@/types/tree";
import type { MapTreeSummary } from "./TreeMapClient";

interface CollectionCardProps {
  collection: DiscoveryCollection;
  size?: "normal" | "large";
  locale: Locale;
  speciesLabel: string;
  viewCollectionLabel: string;
  getCollectionTrees: (collection: DiscoveryCollection) => MapTreeSummary[];
  onSelect: (collection: DiscoveryCollection) => void;
}

export function CollectionCard({
  collection,
  size = "normal",
  locale,
  speciesLabel,
  viewCollectionLabel,
  getCollectionTrees,
  onSelect,
}: CollectionCardProps) {
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
      role="button"
      tabIndex={0}
      onClick={() => {
        onSelect(collection);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(collection);
        }
      }}
    >
      <div className={paddingClass}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <span className={iconClass}>{collection.icon}</span>
          <div
            className="flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <ShareCollectionButton
              collection={collection}
              locale={locale}
              treeCount={collectionTrees.length}
            />
          </div>
        </div>

        <h3 className={titleClass}>{collection.title[locale]}</h3>

        <p className={descClass}>{collection.description[locale]}</p>

        {collection.seasonal && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium">
            <span>⏰</span>
            {collection.seasonal.highlight[locale]}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {collectionTrees.length} {speciesLabel}
          </span>
          <span className="text-sm text-primary group-hover:translate-x-1 transition-transform">
            {viewCollectionLabel} →
          </span>
        </div>
      </div>
    </div>
  );
}
