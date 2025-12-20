"use client";

import { useFavorites } from "@/components/FavoritesProvider";
import { TreeCardWithFavorite } from "@/components/TreeCardWithFavorite";
import { Link } from "@i18n/navigation";
import { allTrees } from "contentlayer/generated";

interface FavoritesContentProps {
  locale: string;
}

export function FavoritesContent({ locale }: FavoritesContentProps) {
  const { favorites, clearFavorites } = useFavorites();

  const t = {
    title: locale === "es" ? "Mis Favoritos" : "My Favorites",
    subtitle:
      locale === "es"
        ? "Árboles que has guardado para referencia rápida"
        : "Trees you've saved for quick reference",
    emptyTitle: locale === "es" ? "No hay favoritos aún" : "No favorites yet",
    emptyDescription:
      locale === "es"
        ? "Comienza a explorar árboles y guarda tus favoritos tocando el ícono del corazón."
        : "Start exploring trees and save your favorites by tapping the heart icon.",
    exploreTrees: locale === "es" ? "Explorar Árboles" : "Explore Trees",
    clearAll: locale === "es" ? "Limpiar todo" : "Clear all",
    treesCount:
      locale === "es"
        ? `${favorites.length} árbol${favorites.length !== 1 ? "es" : ""} guardado${favorites.length !== 1 ? "s" : ""}`
        : `${favorites.length} tree${favorites.length !== 1 ? "s" : ""} saved`,
  };

  // Get full tree data for favorited slugs
  const favoriteTrees = favorites
    .map((slug) => allTrees.find((t) => t.slug === slug && t.locale === locale))
    .filter((tree): tree is NonNullable<typeof tree> => tree !== undefined);

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <HeartIcon className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {favorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <EmptyHeartIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t.emptyTitle}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t.emptyDescription}
            </p>
            <Link
              href="/trees"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {t.exploreTrees}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Actions Bar */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-muted-foreground">
                {t.treesCount}
              </span>
              <button
                onClick={clearFavorites}
                className="text-sm text-muted-foreground hover:text-destructive transition-colors"
              >
                {t.clearAll}
              </button>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteTrees.map((tree) => (
                <TreeCardWithFavorite key={tree._id} tree={tree} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function EmptyHeartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
