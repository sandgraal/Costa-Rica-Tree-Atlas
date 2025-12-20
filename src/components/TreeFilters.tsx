"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Tree } from "contentlayer/generated";

interface TreeFiltersProps {
  trees: Tree[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  family: string;
  conservationStatus: string;
  sortBy: "name" | "scientific" | "family";
}

export function TreeFilters({ trees, onFilterChange }: TreeFiltersProps) {
  const t = useTranslations("trees");
  const [filters, setFilters] = useState<FilterState>({
    family: "",
    conservationStatus: "",
    sortBy: "name",
  });

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
      sortBy: "name",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = filters.family || filters.conservationStatus;

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
              handleFilterChange("sortBy", e.target.value as FilterState["sortBy"])
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
