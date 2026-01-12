"use client";

import { useState, useMemo } from "react";
import { Tree } from "contentlayer/generated";
import { useStore } from "@/lib/store";
import { FieldGuidePreview } from "./FieldGuidePreview";
import { TreeSelectorList } from "./TreeSelectorList";

interface FieldGuideGeneratorProps {
  trees: Tree[];
  locale: string;
}

export function FieldGuideGenerator({
  trees,
  locale,
}: FieldGuideGeneratorProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const favorites = useStore((state) => state.favorites);
  const hydrated = useStore((state) => state._hydrated);

  const t = {
    title:
      locale === "es" ? "Generador de Guía de Campo" : "Field Guide Generator",
    subtitle:
      locale === "es"
        ? "Crea tu propia guía de campo personalizada con los árboles que desees"
        : "Create your own custom field guide with the trees you want",
    selectTrees: locale === "es" ? "Seleccionar Árboles" : "Select Trees",
    search: locale === "es" ? "Buscar árboles..." : "Search trees...",
    selected: locale === "es" ? "Seleccionados" : "Selected",
    addFavorites: locale === "es" ? "Agregar Favoritos" : "Add Favorites",
    clearSelection: locale === "es" ? "Limpiar" : "Clear",
    selectAll: locale === "es" ? "Seleccionar Todos" : "Select All",
    preview: locale === "es" ? "Vista Previa" : "Preview",
    generatePDF: locale === "es" ? "Generar Guía PDF" : "Generate PDF Guide",
    print: locale === "es" ? "Imprimir" : "Print",
    noTrees: locale === "es" ? "No se encontraron árboles" : "No trees found",
    selectAtLeast:
      locale === "es"
        ? "Selecciona al menos un árbol para generar la guía"
        : "Select at least one tree to generate the guide",
    backToSelection:
      locale === "es" ? "Volver a Selección" : "Back to Selection",
  };

  // Filter trees based on search
  const filteredTrees = useMemo(() => {
    if (!searchQuery) return trees;
    const query = searchQuery.toLowerCase();
    return trees.filter(
      (tree) =>
        tree.title.toLowerCase().includes(query) ||
        tree.scientificName.toLowerCase().includes(query) ||
        tree.family.toLowerCase().includes(query)
    );
  }, [trees, searchQuery]);

  // Get selected trees
  const selectedTrees = useMemo(() => {
    return trees.filter((tree) => selectedSlugs.includes(tree.slug));
  }, [trees, selectedSlugs]);

  const handleToggleTree = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSelectAll = () => {
    setSelectedSlugs(filteredTrees.map((tree) => tree.slug));
  };

  const handleClear = () => {
    setSelectedSlugs([]);
  };

  const handleAddFavorites = () => {
    if (!hydrated) return;
    const newSlugs = favorites.filter((slug) => !selectedSlugs.includes(slug));
    setSelectedSlugs([...selectedSlugs, ...newSlugs]);
  };

  const handleGenerateFieldGuide = () => {
    setShowPreview(true);
  };

  if (showPreview && selectedTrees.length > 0) {
    return (
      <FieldGuidePreview
        trees={selectedTrees}
        locale={locale}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">{t.title}</h1>
          <p className="text-green-100 text-lg max-w-3xl">{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <label htmlFor="tree-search" className="sr-only">
              {t.search}
            </label>
            <input
              id="tree-search"
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
              {t.selected}: {selectedSlugs.length}
            </span>
            {hydrated && favorites.length > 0 && (
              <button
                onClick={handleAddFavorites}
                className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors text-sm font-medium"
              >
                {t.addFavorites} ({favorites.length})
              </button>
            )}
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
            >
              {t.selectAll}
            </button>
            {selectedSlugs.length > 0 && (
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                {t.clearSelection}
              </button>
            )}
          </div>
        </div>

        {/* Tree Selection List */}
        <TreeSelectorList
          trees={filteredTrees}
          selectedSlugs={selectedSlugs}
          onToggle={handleToggleTree}
          locale={locale}
        />

        {/* Generate Button */}
        {selectedTrees.length > 0 && (
          <div className="mt-8 sticky bottom-4 z-10">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTrees.length}{" "}
                  {locale === "es" ? "árboles seleccionados" : "trees selected"}
                </p>
                <button
                  onClick={handleGenerateFieldGuide}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpenIcon className="w-5 h-5" />
                  {t.generatePDF}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTrees.length === 0 && !searchQuery && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BookOpenIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>{t.selectAtLeast}</p>
          </div>
        )}

        {filteredTrees.length === 0 && searchQuery && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{t.noTrees}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
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
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
