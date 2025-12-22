"use client";

import { useState, useMemo, useCallback } from "react";
import { useLocale } from "next-intl";
import { search, filterTrees, sortTrees, extractFacets } from "@/lib/search";
import { TAG_DEFINITIONS, getTagLabel, getUILabel } from "@/lib/i18n";
import { TreeGrid } from "./TreeCard";
import type { Tree as ContentlayerTree } from "contentlayer/generated";
import type { Tree, TreeFilter, TreeSort, Locale, TreeTag } from "@/types/tree";

// ============================================================================
// Types
// ============================================================================

interface TreeExplorerProps {
  trees: ContentlayerTree[];
}

type ViewMode = "grid" | "alphabetical";

// ============================================================================
// Component
// ============================================================================

export function TreeExplorer({ trees }: TreeExplorerProps) {
  const locale = useLocale() as Locale;

  // Cast trees to Tree type for search functions
  const typedTrees = trees as unknown as Tree[];

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filter, setFilter] = useState<TreeFilter>({});
  const [sort, setSort] = useState<TreeSort>({
    field: "title",
    direction: "asc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Facets from all trees
  const allFacets = useMemo(() => extractFacets(typedTrees), [typedTrees]);

  // Search and filter pipeline
  const displayTrees = useMemo(() => {
    // Step 1: Search
    let results = searchQuery
      ? search(searchQuery, typedTrees).map((r) => r.tree)
      : typedTrees;

    // Step 2: Filter
    results = filterTrees(results, filter);

    // Step 3: Sort
    results = sortTrees(results, sort);

    return results;
  }, [typedTrees, searchQuery, filter, sort]);

  // Handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof TreeFilter, value: unknown) => {
      setFilter((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleTagToggle = useCallback((tag: TreeTag) => {
    setFilter((prev) => {
      const currentTags = prev.tags ?? [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      return { ...prev, tags: newTags.length > 0 ? newTags : undefined };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilter({});
    setSearchQuery("");
  }, []);

  const hasActiveFilters = Object.values(filter).some(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  // Labels
  const labels = {
    title: locale === "es" ? "Directorio de Árboles" : "Tree Directory",
    subtitle:
      locale === "es"
        ? "Explora nuestra colección de árboles costarricenses"
        : "Browse our collection of Costa Rican trees",
    searchPlaceholder:
      locale === "es"
        ? "Buscar por nombre, familia, uso, región..."
        : "Search by name, family, use, region...",
    gridView: locale === "es" ? "Vista de cuadrícula" : "Grid View",
    alphabeticalView: locale === "es" ? "Vista A-Z" : "A-Z Index",
    filters: locale === "es" ? "Filtros" : "Filters",
    family: locale === "es" ? "Familia" : "Family",
    allFamilies: locale === "es" ? "Todas las familias" : "All families",
    status: locale === "es" ? "Estado de conservación" : "Conservation Status",
    allStatuses: locale === "es" ? "Todos los estados" : "All statuses",
    sortBy: locale === "es" ? "Ordenar por" : "Sort by",
    sortName: locale === "es" ? "Nombre común" : "Common name",
    sortScientific: locale === "es" ? "Nombre científico" : "Scientific name",
    sortFamily: locale === "es" ? "Familia" : "Family",
    showing: (count: number, total: number) =>
      locale === "es"
        ? `Mostrando ${count} de ${total} árboles`
        : `Showing ${count} of ${total} trees`,
    stats: (species: number, families: number) =>
      locale === "es"
        ? `${species} especies de ${families} familias botánicas`
        : `${species} species from ${families} botanical families`,
  };

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
            {labels.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
            {labels.subtitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {labels.stats(trees.length, allFacets.families.length)}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels.gridView}
            </button>
            <button
              onClick={() => setViewMode("alphabetical")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "alphabetical"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels.alphabeticalView}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md mx-auto mb-6">
          <input
            type="search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={labels.searchPlaceholder}
            className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters toggle */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <FilterIcon className="w-4 h-4" />
            {labels.filters}
            {hasActiveFilters && (
              <span className="px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                {
                  Object.values(filter).filter((v) =>
                    Array.isArray(v) ? v.length > 0 : v !== undefined
                  ).length
                }
              </span>
            )}
            <ChevronIcon
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-8 p-4 bg-card rounded-xl border border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Family filter */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {labels.family}
                </label>
                <select
                  value={filter.family ?? ""}
                  onChange={(e) =>
                    handleFilterChange("family", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{labels.allFamilies}</option>
                  {allFacets.families.map(({ value, count }) => (
                    <option key={value} value={value}>
                      {value} ({count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Conservation status filter */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {labels.status}
                </label>
                <select
                  value={filter.conservationStatus ?? ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "conservationStatus",
                      e.target.value || undefined
                    )
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{labels.allStatuses}</option>
                  {allFacets.conservationStatuses.map(({ value, count }) => (
                    <option key={value} value={value}>
                      {value} ({count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {labels.sortBy}
                </label>
                <select
                  value={sort.field}
                  onChange={(e) =>
                    setSort({
                      ...sort,
                      field: e.target.value as TreeSort["field"],
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="title">{labels.sortName}</option>
                  <option value="scientificName">
                    {labels.sortScientific}
                  </option>
                  <option value="family">{labels.sortFamily}</option>
                </select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                  >
                    {getUILabel("clearFilters", locale)}
                  </button>
                </div>
              )}
            </div>

            {/* Tag filters */}
            {allFacets.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {locale === "es" ? "Características" : "Characteristics"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {allFacets.tags.map(({ value, count }) => {
                    const def = TAG_DEFINITIONS[value];
                    const isSelected = filter.tags?.includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() => handleTagToggle(value)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full transition-all ${
                          isSelected
                            ? (def?.color ?? "bg-primary text-white")
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {def?.icon && <span>{def.icon}</span>}
                        {getTagLabel(value, locale)}
                        <span className="opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        {displayTrees.length !== trees.length && (
          <p className="text-center text-muted-foreground mb-6">
            {labels.showing(displayTrees.length, trees.length)}
          </p>
        )}

        {/* Tree display */}
        {viewMode === "alphabetical" ? (
          <AlphabeticalIndex
            trees={displayTrees as unknown as ContentlayerTree[]}
            locale={locale}
          />
        ) : (
          <TreeGrid
            trees={displayTrees as unknown as ContentlayerTree[]}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Alphabetical Index Component
// ============================================================================

function AlphabeticalIndex({
  trees,
  locale,
}: {
  trees: ContentlayerTree[];
  locale: Locale;
}) {
  const grouped = useMemo(() => {
    const groups: Record<string, ContentlayerTree[]> = {};
    for (const tree of trees) {
      const letter = tree.title.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(tree);
    }
    return groups;
  }, [trees]);

  const letters = Object.keys(grouped).sort();

  if (trees.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">
          {locale === "es" ? "No se encontraron árboles" : "No trees found"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Letter navigation */}
      <nav
        className="flex flex-wrap justify-center gap-1 mb-8"
        aria-label="Alphabet navigation"
      >
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="w-8 h-8 flex items-center justify-center rounded bg-muted hover:bg-primary hover:text-white transition-colors text-sm font-medium"
          >
            {letter}
          </a>
        ))}
      </nav>

      {/* Grouped trees */}
      <div className="space-y-12">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`}>
            <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-4 sticky top-16 bg-background/90 backdrop-blur-sm py-2 -mx-2 px-2">
              {letter}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({grouped[letter].length})
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grouped[letter].map((tree) => (
                <a
                  key={tree._id}
                  href={`/${locale}/trees/${tree.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{tree.title}</p>
                    <p className="text-sm text-muted-foreground italic truncate">
                      {tree.scientificName}
                    </p>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
