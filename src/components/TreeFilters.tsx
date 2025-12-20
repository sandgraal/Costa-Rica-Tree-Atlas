"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Tree } from "contentlayer/generated";
import { TreeTag, TAG_DEFINITIONS, type TagName } from "./TreeTags";

interface TreeFiltersProps {
  trees: Tree[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  family: string;
  conservationStatus: string;
  tags: string[];
  sortBy: "name" | "scientific" | "family";
  seasonalFilter: "all" | "flowering" | "fruiting";
}

export function TreeFilters({ trees, onFilterChange }: TreeFiltersProps) {
  const t = useTranslations("trees");
  const locale = useLocale();
  const [filters, setFilters] = useState<FilterState>({
    family: "",
    conservationStatus: "",
    tags: [],
    sortBy: "name",
    seasonalFilter: "all",
  });
  const [showTagFilter, setShowTagFilter] = useState(false);

  // Extract unique families from trees
  const families = useMemo(() => {
    const familySet = new Set<string>();
    trees.forEach((tree) => {
      if (tree.family) {
        familySet.add(tree.family);
      }
    });
    return Array.from(familySet).sort();
  }, [trees]);

  // Extract unique conservation statuses
  const conservationStatuses = useMemo(() => {
    const statusSet = new Set<string>();
    trees.forEach((tree) => {
      if (tree.conservationStatus) {
        statusSet.add(tree.conservationStatus);
      }
    });
    return Array.from(statusSet).sort();
  }, [trees]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const resetFilters: FilterState = {
      family: "",
      conservationStatus: "",
      tags: [],
      sortBy: "name",
      seasonalFilter: "all",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters =
    filters.family ||
    filters.conservationStatus ||
    filters.tags.length > 0 ||
    filters.seasonalFilter !== "all";

  // Extract unique tags from trees
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    trees.forEach((tree) => {
      (tree as Tree & { tags?: string[] }).tags?.forEach((tag: string) =>
        tagSet.add(tag)
      );
    });
    return Array.from(tagSet).sort();
  }, [trees]);

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-8 p-4 bg-card rounded-xl border border-border">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Family Filter */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="family-filter"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            {t("filterByFamily")}
          </label>
          <select
            id="family-filter"
            value={filters.family}
            onChange={(e) => handleFilterChange("family", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          >
            <option value="">{t("allFamilies")}</option>
            {families.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>
        </div>

        {/* Conservation Status Filter */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            {t("filterByStatus")}
          </label>
          <select
            id="status-filter"
            value={filters.conservationStatus}
            onChange={(e) =>
              handleFilterChange("conservationStatus", e.target.value)
            }
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          >
            <option value="">{t("allStatuses")}</option>
            {conservationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="sort-filter"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            {t("sortBy")}
          </label>
          <select
            id="sort-filter"
            value={filters.sortBy}
            onChange={(e) =>
              handleFilterChange(
                "sortBy",
                e.target.value as FilterState["sortBy"]
              )
            }
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          >
            <option value="name">{t("sortByName")}</option>
            <option value="scientific">{t("sortByScientific")}</option>
            <option value="family">{t("sortByFamily")}</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-auto px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>

      {/* Tags Filter */}
      {availableTags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <TagIcon className="h-4 w-4" />
            {t("filterByTags")}
            <ChevronIcon
              className={`h-4 w-4 transition-transform ${showTagFilter ? "rotate-180" : ""}`}
            />
            {filters.tags.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-white rounded-full">
                {filters.tags.length}
              </span>
            )}
          </button>

          {showTagFilter && (
            <div className="mt-3 flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <TreeTag
                  key={tag}
                  tag={tag}
                  onClick={() => handleTagToggle(tag)}
                  selected={filters.tags.includes(tag)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seasonal Filter - Active Now */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          {locale === "es" ? "Actividad Actual" : "Current Activity"}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange("seasonalFilter", "all")}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filters.seasonalFilter === "all"
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {locale === "es" ? "Todos" : "All"}
          </button>
          <button
            onClick={() => handleFilterChange("seasonalFilter", "flowering")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-colors ${
              filters.seasonalFilter === "flowering"
                ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 font-medium"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <span>🌸</span>
            {locale === "es" ? "Floreciendo ahora" : "Flowering now"}
          </button>
          <button
            onClick={() => handleFilterChange("seasonalFilter", "fruiting")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-colors ${
              filters.seasonalFilter === "fruiting"
                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <span>🍇</span>
            {locale === "es" ? "Fructificando ahora" : "Fruiting now"}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.family && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              {filters.family}
              <button
                onClick={() => handleFilterChange("family", "")}
                className="hover:text-primary-dark"
                aria-label={`Remove ${filters.family} filter`}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </span>
          )}
          {filters.conservationStatus && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent-dark dark:text-accent text-sm">
              {filters.conservationStatus}
              <button
                onClick={() => handleFilterChange("conservationStatus", "")}
                className="hover:text-accent-dark"
                aria-label={`Remove ${filters.conservationStatus} filter`}
              >
                <XIcon className="h-4 w-4" />
              </button>
            </span>
          )}
          {filters.tags.map((tag) => (
            <TreeTag
              key={tag}
              tag={tag}
              onClick={() => handleTagToggle(tag)}
              selected
            />
          ))}
        </div>
      )}
    </div>
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
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
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
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
