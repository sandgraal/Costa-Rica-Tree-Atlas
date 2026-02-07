"use client";

import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { TreeCard } from "@/components/tree";
import { ExportFavoritesButton } from "@/components/ExportFavoritesButton";
import { Link, useRouter } from "@i18n/navigation";
import { useSearchParams } from "next/navigation";
import { allTrees } from "contentlayer/generated";
import type { Locale } from "@/types/tree";

interface FavoritesContentProps {
  locale: string;
}

export function FavoritesContent({ locale }: FavoritesContentProps) {
  const hydrated = useStore((state) => state._hydrated);
  const favorites = useStore((state) => state.favorites);
  const clearFavorites = useStore((state) => state.clearFavorites);
  const addFavorite = useStore((state) => state.addFavorite);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const [isSharedList, setIsSharedList] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessedSharedList = useRef(false);

  // Handle shared list from URL - only process once after hydration
  useEffect(() => {
    if (!hydrated) return;

    const sharedTrees = searchParams.get("trees");
    if (sharedTrees && !hasProcessedSharedList.current) {
      hasProcessedSharedList.current = true;
      setIsSharedList(true);
      const treeSlugs = sharedTrees.split(",");
      // Add shared trees to favorites if not already there
      treeSlugs.forEach((slug) => {
        if (!favorites.includes(slug)) {
          addFavorite(slug);
        }
      });
    }
  }, [searchParams, addFavorite, favorites, hydrated]);

  const t = {
    title: locale === "es" ? "Mis Favoritos" : "My Favorites",
    sharedTitle: locale === "es" ? "Lista Compartida" : "Shared List",
    subtitle:
      locale === "es"
        ? "Árboles que has guardado para referencia rápida"
        : "Trees you've saved for quick reference",
    sharedSubtitle:
      locale === "es"
        ? "Árboles compartidos por un amigo"
        : "Trees shared by a friend",
    emptyTitle: locale === "es" ? "No hay favoritos aún" : "No favorites yet",
    emptyDescription:
      locale === "es"
        ? "Comienza a explorar árboles y guarda tus favoritos tocando el ícono del corazón."
        : "Start exploring trees and save your favorites by tapping the heart icon.",
    exploreTrees: locale === "es" ? "Explorar Árboles" : "Explore Trees",
    clearAll: locale === "es" ? "Limpiar todo" : "Clear all",
    treesCount:
      locale === "es"
        ? `${hydrated ? favorites.length : 0} árbol${(hydrated ? favorites.length : 0) !== 1 ? "es" : ""} guardado${(hydrated ? favorites.length : 0) !== 1 ? "s" : ""}`
        : `${hydrated ? favorites.length : 0} tree${(hydrated ? favorites.length : 0) !== 1 ? "s" : ""} saved`,
    shareList: locale === "es" ? "Compartir lista" : "Share list",
    copied: locale === "es" ? "¡Enlace copiado!" : "Link copied!",
    compare: locale === "es" ? "Comparar" : "Compare",
    selectToCompare:
      locale === "es"
        ? "Selecciona 2-4 árboles para comparar"
        : "Select 2-4 trees to compare",
    selected:
      locale === "es"
        ? `${selectedForCompare.length} seleccionado${selectedForCompare.length !== 1 ? "s" : ""}`
        : `${selectedForCompare.length} selected`,
    compareSelected:
      locale === "es" ? "Comparar seleccionados" : "Compare selected",
    cancelSelection: locale === "es" ? "Cancelar" : "Cancel",
    addedToFavorites:
      locale === "es"
        ? "¡Árboles agregados a tus favoritos!"
        : "Trees added to your favorites!",
  };

  // Get full tree data for favorited slugs (only after hydration)
  const favoriteTrees = hydrated
    ? favorites
        .map((slug) =>
          allTrees.find((t) => t.slug === slug && t.locale === locale)
        )
        .filter((tree): tree is NonNullable<typeof tree> => tree !== undefined)
    : [];

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("trees", favorites.join(","));

    try {
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("copied");
      setTimeout(() => {
        setShareStatus("idle");
      }, 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = url.toString();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  };

  const toggleSelectForCompare = (slug: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= 4) {
        return prev; // Max 4 trees
      }
      return [...prev, slug];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length >= 2) {
      router.push(`/compare?trees=${selectedForCompare.join(",")}`);
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
            <HeartIcon className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {isSharedList ? t.sharedTitle : t.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isSharedList ? t.sharedSubtitle : t.subtitle}
          </p>
          {isSharedList && favorites.length > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              {t.addedToFavorites}
            </p>
          )}
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
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <span className="text-sm text-muted-foreground">
                {t.treesCount}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {/* Export Button */}
                <ExportFavoritesButton locale={locale} />

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <ShareIcon className="w-4 h-4" />
                  {shareStatus === "copied" ? t.copied : t.shareList}
                </button>

                {/* Compare Toggle */}
                {selectedForCompare.length === 0 ? (
                  <button
                    onClick={() => {
                      setSelectedForCompare([]);
                    }}
                    className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    title={t.selectToCompare}
                  >
                    <CompareIcon className="w-4 h-4" />
                    {t.compare}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {t.selected}
                    </span>
                    <button
                      onClick={handleCompare}
                      disabled={selectedForCompare.length < 2}
                      className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t.compareSelected}
                    </button>
                    <button
                      onClick={() => setSelectedForCompare([])}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t.cancelSelection}
                    </button>
                  </div>
                )}

                {/* Clear Button */}
                <button
                  onClick={clearFavorites}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                >
                  {t.clearAll}
                </button>
              </div>
            </div>

            {/* Selection Hint */}
            {selectedForCompare.length > 0 && selectedForCompare.length < 2 && (
              <p className="text-sm text-muted-foreground text-center mb-4">
                {t.selectToCompare}
              </p>
            )}

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteTrees.map((tree) => (
                <div key={tree._id} className="relative">
                  {/* Selection Checkbox Overlay */}
                  {selectedForCompare.length > 0 || favorites.length >= 2 ? (
                    <button
                      onClick={() => {
                        toggleSelectForCompare(tree.slug);
                      }}
                      className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedForCompare.includes(tree.slug)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 hover:border-primary"
                      }`}
                    >
                      {selectedForCompare.includes(tree.slug) && (
                        <CheckIcon className="w-4 h-4" />
                      )}
                    </button>
                  ) : null}
                  <TreeCard tree={tree} locale={locale as Locale} />
                </div>
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

function ShareIcon({ className }: { className?: string }) {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CompareIcon({ className }: { className?: string }) {
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
      <rect x="3" y="3" width="6" height="18" rx="1" />
      <rect x="15" y="3" width="6" height="18" rx="1" />
      <path d="M10 12h4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
