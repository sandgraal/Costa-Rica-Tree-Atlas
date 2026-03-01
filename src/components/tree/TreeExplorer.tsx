"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  search,
  filterTrees,
  sortTrees,
  extractFacets,
  getCurrentMonth,
} from "@/lib/search";
import {
  TAG_DEFINITIONS,
  getTagLabel,
  getUILabel,
  getMonthLabel,
  ORDERED_MONTHS,
} from "@/lib/i18n";
import { PROVINCES, isProvince } from "@/lib/geo";
import { TreeGrid } from "./TreeCard";
import { SearchSuggestions } from "./SearchSuggestions";
import type {
  LightTree,
  Tree,
  TreeFilter,
  TreeSort,
  Locale,
  TreeTag,
  Distribution,
  Province,
  Month,
  SortField,
} from "@/types/tree";

// ============================================================================
// URL Param Helpers
// ============================================================================

const VALID_SORT_FIELDS: SortField[] = ["title", "scientificName", "family"];
const VALID_VIEW_MODES = ["grid", "alphabetical"] as const;

const VALID_SEASONAL_FILTERS = ["flowering", "fruiting"] as const;

function parseFilterFromParams(params: URLSearchParams): TreeFilter {
  const filter: TreeFilter = {};
  const family = params.get("family");
  if (family) filter.family = family;
  const status = params.get("status");
  if (status) filter.conservationStatus = status;
  const province = params.get("province");
  if (province && isProvince(province as Distribution)) {
    filter.distribution = [province as Distribution];
  }
  const tags = params.get("tags");
  if (tags) filter.tags = tags.split(",").filter(Boolean) as TreeTag[];
  const seasonal = params.get("seasonal");
  if (
    seasonal &&
    VALID_SEASONAL_FILTERS.includes(seasonal as "flowering" | "fruiting")
  ) {
    filter.seasonalFilter = seasonal as "flowering" | "fruiting";
  }
  const month = params.get("month");
  if (month && ORDERED_MONTHS.includes(month as Month)) {
    filter.month = month as Month;
  }
  return filter;
}

function parseSortFromParams(params: URLSearchParams): TreeSort {
  const field = params.get("sort") as SortField | null;
  return {
    field: field && VALID_SORT_FIELDS.includes(field) ? field : "title",
    direction: "asc",
  };
}

// ============================================================================
// Types
// ============================================================================

interface TreeExplorerProps {
  trees: LightTree[];
}

type ViewMode = "grid" | "alphabetical";

// Constants for lazy loading
// Reduced initial count for faster LCP (fewer images to process)
const INITIAL_LOAD_COUNT = 12;
const LOAD_MORE_COUNT = 12;

// ============================================================================
// Component
// ============================================================================

// Maximum number of suggestions in the autocomplete dropdown
const MAX_SUGGESTIONS = 5;

export function TreeExplorer({ trees }: TreeExplorerProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("trees");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cast trees to Tree type for search functions
  const typedTrees = trees as unknown as Tree[];

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const v = searchParams.get("view") as ViewMode | null;
    return v && VALID_VIEW_MODES.includes(v) ? v : "grid";
  });
  const [filter, setFilter] = useState<TreeFilter>(() =>
    parseFilterFromParams(searchParams)
  );
  const [sort, setSort] = useState<TreeSort>(() =>
    parseSortFromParams(searchParams)
  );
  const [showFilters, setShowFilters] = useState(() => {
    // Auto-open filters if any filter param is present
    const hasParams =
      searchParams.has("family") ||
      searchParams.has("status") ||
      searchParams.has("province") ||
      searchParams.has("tags") ||
      searchParams.has("seasonal") ||
      searchParams.has("month");
    return hasParams;
  });
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LOAD_COUNT);

  // Autocomplete suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Async search results (Fuse.js is lazy-loaded on first query)
  const [searchedTrees, setSearchedTrees] = useState<Tree[] | null>(null);
  const searchAbortRef = useRef(0);

  // Facets from all trees
  const allFacets = useMemo(() => extractFacets(typedTrees), [typedTrees]);

  // Sync filter/search/sort/view state to URL params (shallow — no navigation)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (filter.family) params.set("family", filter.family);
    if (filter.conservationStatus)
      params.set("status", filter.conservationStatus);
    if (filter.distribution?.length)
      params.set("province", filter.distribution[0]);
    if (filter.tags?.length) params.set("tags", filter.tags.join(","));
    if (filter.seasonalFilter && filter.seasonalFilter !== "all") {
      params.set("seasonal", filter.seasonalFilter);
      if (filter.month) params.set("month", filter.month);
    }
    if (sort.field !== "title") params.set("sort", sort.field);
    if (viewMode !== "grid") params.set("view", viewMode);

    const qs = params.toString();
    const newUrl = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [searchQuery, filter, sort.field, viewMode]);

  // Filter facets to only show options with meaningful counts (>= 2)
  const displayFacets = useMemo(() => {
    const MIN_COUNT = 2;
    return {
      families: allFacets.families.filter((f) => f.count >= MIN_COUNT),
      conservationStatuses: allFacets.conservationStatuses.filter(
        (s) => s.count >= MIN_COUNT
      ),
      tags: allFacets.tags.filter((t) => t.count >= MIN_COUNT),
      distributions: allFacets.distributions.filter(
        (d) => d.count >= MIN_COUNT
      ),
    };
  }, [allFacets]);

  // Lazy-load Fuse.js and perform search asynchronously
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchedTrees(null);
      return;
    }

    const id = ++searchAbortRef.current;

    search(searchQuery, typedTrees).then((results) => {
      // Only apply if this is still the latest search
      if (id === searchAbortRef.current) {
        setSearchedTrees(results.map((r) => r.tree));
      }
    });
  }, [searchQuery, typedTrees]);

  // Filter and sort pipeline (synchronous — operates on already-searched results)
  const filteredTrees = useMemo(() => {
    const base = searchedTrees ?? typedTrees;
    let results = filterTrees(base, filter);
    results = sortTrees(results, sort);
    return results;
  }, [typedTrees, searchedTrees, filter, sort]);

  // Reset display limit when filters or search changes
  useEffect(() => {
    setDisplayLimit(INITIAL_LOAD_COUNT);
  }, [searchQuery, filter, sort]);

  // Trees to actually display (limited)
  const visibleTrees = useMemo(() => {
    return filteredTrees.slice(0, displayLimit);
  }, [filteredTrees, displayLimit]);

  const hasMore = displayLimit < filteredTrees.length;

  // Top suggestions for the autocomplete dropdown
  const suggestions = useMemo(() => {
    if (!searchedTrees || !searchQuery.trim()) return [];
    return searchedTrees.slice(0, MAX_SUGGESTIONS);
  }, [searchedTrees, searchQuery]);

  // Close suggestions when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setShowSuggestions(true);
      setSuggestionIndex(0);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setShowSuggestions(false);
  }, []);

  const handleSuggestionSelect = useCallback(
    (slug: string) => {
      router.push(`/${locale}/trees/${slug}`);
      setShowSuggestions(false);
    },
    [router, locale]
  );

  const handleSuggestionHover = useCallback((index: number) => {
    setSuggestionIndex(index);
  }, []);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSuggestionIndex((i) => Math.min(i + 1, suggestions.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSuggestionIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          if (suggestions[suggestionIndex]) {
            e.preventDefault();
            handleSuggestionSelect(suggestions[suggestionIndex].slug);
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          break;
      }
    },
    [showSuggestions, suggestions, suggestionIndex, handleSuggestionSelect]
  );

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

  const handleProvinceChange = useCallback((province: string) => {
    setFilter((prev) => ({
      ...prev,
      distribution: province ? [province as Distribution] : undefined,
    }));
  }, []);

  const handleSeasonalChange = useCallback((value: string) => {
    setFilter((prev) => ({
      ...prev,
      seasonalFilter:
        value === "all" ? undefined : (value as "flowering" | "fruiting"),
      // Set month to current month when first activating seasonal filter;
      // clear month when deactivating (prevents stale ?month= in URL)
      month:
        value === "all"
          ? undefined
          : !prev.month
            ? getCurrentMonth()
            : prev.month,
    }));
  }, []);

  const handleMonthChange = useCallback((value: string) => {
    setFilter((prev) => ({
      ...prev,
      month: value ? (value as Month) : undefined,
    }));
  }, []);

  // Province facets — only include the 7 provinces, sorted by count
  const provinceFacets = useMemo(
    () => displayFacets.distributions.filter((d) => isProvince(d.value)),
    [displayFacets.distributions]
  );

  const handleClearFilters = useCallback(() => {
    setFilter({});
    setSearchQuery("");
  }, []);

  const handleLoadMore = useCallback(() => {
    setDisplayLimit((prev) => prev + LOAD_MORE_COUNT);
  }, []);

  const hasActiveFilters = Object.values(filter).some(
    (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  );

  // Current seasonal activity for the active month
  const activeMonth = filter.month ?? getCurrentMonth();
  const seasonalCounts =
    allFacets.seasonal[activeMonth as Exclude<Month, "all-year">];

  // Labels
  const labels = {
    title: t("title"),
    subtitle: t("subtitle"),
    searchPlaceholder: t("searchByNamePlaceholder"),
    gridView: t("viewGrid"),
    alphabeticalView: t("viewAlphabetical"),
    filters: t("filters"),
    family: t("family"),
    allFamilies: t("allFamilies"),
    status: t("filterByStatus"),
    allStatuses: t("allStatuses"),
    province: t("filterByProvince"),
    allProvinces: t("allProvinces"),
    seasonalActivity: t("seasonalActivity"),
    allSeasons: t("allSeasons"),
    flowering: t("flowering"),
    fruiting: t("fruiting"),
    month: t("month"),
    sortBy: t("sortBy"),
    sortName: t("sortByName"),
    sortScientific: t("sortByScientific"),
    sortFamily: t("sortByFamily"),
    showing: (count: number, total: number) =>
      t("resultsCount", { count, total }),
    matchingTrees: (count: number) => t("matchingTrees", { count }),
    loadMore: t("loadMore"),
    showingXofY: (showing: number, total: number) =>
      t("showingOf", { showing, total }),
    stats: (species: number, families: number) =>
      t("stats", { species, families }),
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
              onClick={() => {
                setViewMode("grid");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels.gridView}
            </button>
            <button
              onClick={() => {
                setViewMode("alphabetical");
              }}
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

        {/* Search bar with autocomplete suggestions */}
        <div
          ref={searchContainerRef}
          className="relative max-w-md mx-auto mb-6"
        >
          <input
            type="search"
            role="combobox"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls={
              showSuggestions && suggestions.length > 0
                ? "search-suggestions"
                : undefined
            }
            aria-activedescendant={
              showSuggestions && suggestions.length > 0
                ? `suggestion-${suggestionIndex}`
                : undefined
            }
            aria-autocomplete="list"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchQuery.trim()) setShowSuggestions(true);
            }}
            onKeyDown={handleSearchKeyDown}
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

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && searchQuery.trim() && (
            <SearchSuggestions
              suggestions={suggestions}
              selectedIndex={suggestionIndex}
              query={searchQuery}
              onSelect={handleSuggestionSelect}
              onHover={handleSuggestionHover}
            />
          )}
        </div>

        {/* Filters toggle */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              setShowFilters(!showFilters);
            }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Family filter */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {labels.family}
                </label>
                <select
                  value={filter.family ?? ""}
                  onChange={(e) => {
                    handleFilterChange("family", e.target.value || undefined);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{labels.allFamilies}</option>
                  {displayFacets.families.map(({ value, count }) => (
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
                  {displayFacets.conservationStatuses.map(
                    ({ value, count }) => (
                      <option key={value} value={value}>
                        {value} ({count})
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Province filter */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {labels.province}
                </label>
                <select
                  value={filter.distribution?.[0] ?? ""}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{labels.allProvinces}</option>
                  {provinceFacets.map(({ value, count }) => (
                    <option key={value} value={value}>
                      {t(`provinces.${value}`)} ({count})
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
            {displayFacets.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("characteristics")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayFacets.tags.map(({ value, count }) => {
                    const def = TAG_DEFINITIONS[value];
                    const isSelected = filter.tags?.includes(value);
                    return (
                      <button
                        key={value}
                        onClick={() => {
                          handleTagToggle(value);
                        }}
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

            {/* Seasonal activity filter */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Activity type */}
                <div>
                  <label
                    htmlFor="seasonal-activity-select"
                    className="block text-xs font-medium text-muted-foreground mb-1"
                  >
                    {labels.seasonalActivity}
                  </label>
                  <select
                    id="seasonal-activity-select"
                    value={filter.seasonalFilter ?? "all"}
                    onChange={(e) => handleSeasonalChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">{labels.allSeasons}</option>
                    <option value="flowering">
                      🌸 {labels.flowering} (
                      {seasonalCounts?.floweringCount ?? 0})
                    </option>
                    <option value="fruiting">
                      🍎 {labels.fruiting} ({seasonalCounts?.fruitingCount ?? 0}
                      )
                    </option>
                  </select>
                </div>

                {/* Month selector (only shown when seasonal filter is active) */}
                {filter.seasonalFilter && filter.seasonalFilter !== "all" && (
                  <div>
                    <label
                      htmlFor="seasonal-month-select"
                      className="block text-xs font-medium text-muted-foreground mb-1"
                    >
                      {labels.month}
                    </label>
                    <select
                      id="seasonal-month-select"
                      value={activeMonth}
                      onChange={(e) => handleMonthChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {ORDERED_MONTHS.map((m) => {
                        const counts =
                          allFacets.seasonal[m as Exclude<Month, "all-year">];
                        const count =
                          filter.seasonalFilter === "flowering"
                            ? (counts?.floweringCount ?? 0)
                            : (counts?.fruitingCount ?? 0);
                        return (
                          <option key={m} value={m}>
                            {getMonthLabel(m, locale, "full")} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Seasonal activity summary */}
                {filter.seasonalFilter &&
                  filter.seasonalFilter !== "all" &&
                  seasonalCounts && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>
                        {filter.seasonalFilter === "flowering"
                          ? t("floweringNow", {
                              month: getMonthLabel(activeMonth, locale, "full"),
                            })
                          : t("fruitingNow", {
                              month: getMonthLabel(activeMonth, locale, "full"),
                            })}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            {/* Safety filters */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {t("safetyFilters")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Child Safe filter */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.childSafe === true}
                    onChange={(e) =>
                      handleFilterChange(
                        "childSafe",
                        e.target.checked ? true : undefined
                      )
                    }
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <span className="text-sm">{t("childSafe")}</span>
                </label>

                {/* Pet Safe filter */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.petSafe === true}
                    onChange={(e) =>
                      handleFilterChange(
                        "petSafe",
                        e.target.checked ? true : undefined
                      )
                    }
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <span className="text-sm">{t("petSafe")}</span>
                </label>

                {/* Non-Toxic filter */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.nonToxic === true}
                    onChange={(e) =>
                      handleFilterChange(
                        "nonToxic",
                        e.target.checked ? true : undefined
                      )
                    }
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <span className="text-sm">{t("nonToxic")}</span>
                </label>

                {/* Low Risk filter */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filter.lowRisk === true}
                    onChange={(e) =>
                      handleFilterChange(
                        "lowRisk",
                        e.target.checked ? true : undefined
                      )
                    }
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                  />
                  <span className="text-sm">{t("lowRisk")}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="text-center mb-6">
          {filteredTrees.length !== trees.length && (
            <p className="text-lg font-semibold text-primary mb-2">
              {labels.matchingTrees(filteredTrees.length)}
            </p>
          )}
          {hasActiveFilters && filteredTrees.length === 0 && (
            <p className="text-muted-foreground">{t("noResultsFiltered")}</p>
          )}
        </div>

        {/* Tree display */}
        {viewMode === "alphabetical" ? (
          // Alphabetical view shows all filtered trees (no pagination)
          // This is intentional - A-Z index is for browsing the full list
          <AlphabeticalIndex
            trees={filteredTrees as unknown as LightTree[]}
            locale={locale}
          />
        ) : (
          <>
            <TreeGrid
              trees={visibleTrees as unknown as LightTree[]}
              locale={locale}
            />
            {/* Load More button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  {labels.loadMore}
                </button>
                <p className="mt-2 text-sm text-muted-foreground">
                  {labels.showingXofY(
                    visibleTrees.length,
                    filteredTrees.length
                  )}
                </p>
              </div>
            )}
          </>
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
  trees: LightTree[];
  locale: Locale;
}) {
  const t = useTranslations("trees");
  const grouped = useMemo(() => {
    const groups: Record<string, LightTree[]> = {};
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
        <p className="text-muted-foreground text-lg">{t("noTreesFound")}</p>
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
                  key={tree.slug}
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
