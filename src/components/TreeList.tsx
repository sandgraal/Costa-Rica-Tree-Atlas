"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Tree } from "contentlayer/generated";
import { TreeCardWithFavorite } from "@/components/TreeCardWithFavorite";
import { TreeSearch } from "@/components/TreeSearch";
import { TreeFilters, type FilterState } from "@/components/TreeFilters";
import { AlphabeticalIndex } from "@/components/AlphabeticalIndex";

type ViewMode = "grid" | "alphabetical";

interface TreeListProps {
  trees: Tree[];
}

export function TreeList({ trees }: TreeListProps) {
  const t = useTranslations("trees");
  const locale = useLocale();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchFilteredTrees, setSearchFilteredTrees] = useState<Tree[]>(trees);
  const [filters, setFilters] = useState<FilterState>({
    family: "",
    conservationStatus: "",
    tags: [],
    sortBy: "name",
  });

  // Apply filters and sorting to search-filtered trees
  const displayTrees = useMemo(() => {
    let result = searchFilteredTrees;

    // Apply family filter
    if (filters.family) {
      result = result.filter((tree) => tree.family === filters.family);
    }

    // Apply conservation status filter
    if (filters.conservationStatus) {
      result = result.filter(
        (tree) => tree.conservationStatus === filters.conservationStatus
      );
    }

    // Apply tag filters (AND logic - tree must have ALL selected tags)
    if (filters.tags.length > 0) {
      result = result.filter((tree) => {
        const treeTags = (tree as Tree & { tags?: string[] }).tags || [];
        return filters.tags.every((tag) => treeTags.includes(tag));
      });
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case "scientific":
          return a.scientificName.localeCompare(b.scientificName);
        case "family":
          return (a.family || "").localeCompare(b.family || "");
        case "name":
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [searchFilteredTrees, filters]);

  const handleSearchFilter = (filtered: Tree[]) => {
    setSearchFilteredTrees(filtered);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Calculate stats for display
  const stats = useMemo(() => {
    const familyCount = new Set(trees.map((t) => t.family)).size;
    return {
      total: trees.length,
      familyCount,
    };
  }, [trees]);

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          {t("subtitle")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("stats", { species: stats.total, families: stats.familyCount })}
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={viewMode === "grid"}
          >
            <span className="flex items-center gap-2">
              <GridIcon className="h-4 w-4" />
              {t("viewGrid")}
            </span>
          </button>
          <button
            onClick={() => setViewMode("alphabetical")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              viewMode === "alphabetical"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={viewMode === "alphabetical"}
          >
            <span className="flex items-center gap-2">
              <ListIcon className="h-4 w-4" />
              {t("viewAlphabetical")}
            </span>
          </button>
        </div>
      </div>

      {/* Search */}
      <TreeSearch trees={trees} onFilteredTrees={handleSearchFilter} />

      {/* Filters - only show in grid view */}
      {viewMode === "grid" && (
        <TreeFilters trees={trees} onFilterChange={handleFilterChange} />
      )}

      {/* Results Count */}
      {displayTrees.length !== trees.length && (
        <p className="text-center text-muted-foreground mb-6">
          {t("resultsCount", {
            count: displayTrees.length,
            total: trees.length,
          })}
        </p>
      )}

      {/* Content based on view mode */}
      {viewMode === "alphabetical" ? (
        <AlphabeticalIndex trees={displayTrees} locale={locale} />
      ) : displayTrees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTrees.map((tree) => (
            <TreeCardWithFavorite key={tree._id} tree={tree} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
            <TreePlaceholderIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">{t("noResults")}</p>
        </div>
      )}
    </>
  );
}

function GridIcon({ className }: { className?: string }) {
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
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
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
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function TreePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22V8" />
      <path d="M5 12l7-10 7 10" />
      <path d="M5 12a7 7 0 0 0 14 0" />
    </svg>
  );
}
