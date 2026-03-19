"use client";

import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useId,
} from "react";
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
import { isProvince } from "@/lib/geo";
import { useStore } from "@/lib/store";
import { getSearchSessionId } from "@/lib/analytics/search-session";
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
  Month,
  SortField,
  HeightRange,
  UseCategory,
} from "@/types/tree";

// ---------------------------------------------------------------------------
// Search analytics helpers — fire-and-forget, never block UI
// ---------------------------------------------------------------------------

function trackExplorerSearch(
  query: string,
  locale: string,
  resultsCount: number
) {
  if (!query.trim()) return;
  fetch("/api/search-analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query.trim(),
      locale,
      resultsCount,
      sessionId: getSearchSessionId(),
    }),
  }).catch(() => {
    /* silent */
  });
}

function trackExplorerClick(
  query: string,
  locale: string,
  resultsCount: number,
  selectedResult: string
) {
  if (!query.trim()) return;
  fetch("/api/search-analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: query.trim(),
      locale,
      resultsCount,
      selectedResult,
      sessionId: getSearchSessionId(),
    }),
  }).catch(() => {
    /* silent */
  });
}

// ---------------------------------------------------------------------------

// ============================================================================
// URL Param Helpers
// ============================================================================

const VALID_SORT_FIELDS: SortField[] = ["title", "scientificName", "family"];
const VALID_VIEW_MODES = ["grid", "alphabetical"] as const;
const VALID_HEIGHT_RANGES: HeightRange[] = [
  "small",
  "medium",
  "large",
  "very-large",
];
const VALID_USE_CATEGORIES: UseCategory[] = [
  "timber",
  "medicine",
  "food",
  "ornamental",
  "environmental",
  "agriculture",
  "crafts",
];

function parseFilterFromParams(params: URLSearchParams): TreeFilter {
  const filter: TreeFilter = {};
  const family = params.get("family");
  if (family) filter.family = family.split(",").filter(Boolean);
  const status = params.get("status");
  if (status) filter.conservationStatus = status.split(",").filter(Boolean);
  const province = params.get("province");
  if (province) {
    const provinces = province
      .split(",")
      .filter((p) => isProvince(p as Distribution)) as Distribution[];
    if (provinces.length > 0) filter.distribution = provinces;
  }
  const tags = params.get("tags");
  if (tags) filter.tags = tags.split(",").filter(Boolean) as TreeTag[];
  const height = params.get("height");
  if (height) {
    const heights = height
      .split(",")
      .filter((h) =>
        VALID_HEIGHT_RANGES.includes(h as HeightRange)
      ) as HeightRange[];
    if (heights.length > 0) filter.heightRange = heights;
  }
  const use = params.get("use");
  if (use) {
    const uses = use
      .split(",")
      .filter((u) =>
        VALID_USE_CATEGORIES.includes(u as UseCategory)
      ) as UseCategory[];
    if (uses.length > 0) filter.useCategory = uses;
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

function getSuggestionByIndex(items: Tree[], index: number): Tree | undefined {
  return items.at(index);
}

function getTagDefinition(tag: string) {
  if (Object.hasOwn(TAG_DEFINITIONS, tag)) {
    return TAG_DEFINITIONS[tag as keyof typeof TAG_DEFINITIONS];
  }

  return undefined;
}

function getGroupByLetter(
  groups: Record<string, LightTree[]>,
  letter: string
): LightTree[] {
  if (Object.hasOwn(groups, letter)) {
    // eslint-disable-next-line security/detect-object-injection
    return groups[letter] ?? [];
  }

  return [];
}

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
      searchParams.has("height") ||
      searchParams.has("use");
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
    if (filter.family?.length) params.set("family", filter.family.join(","));
    if (filter.conservationStatus?.length)
      params.set("status", filter.conservationStatus.join(","));
    if (filter.distribution?.length)
      params.set("province", filter.distribution.join(","));
    if (filter.tags?.length) params.set("tags", filter.tags.join(","));
    if (filter.heightRange?.length)
      params.set("height", filter.heightRange.join(","));
    if (filter.useCategory?.length)
      params.set("use", filter.useCategory.join(","));
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
      heightRanges: allFacets.heightRanges,
      useCategories: allFacets.useCategories,
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
        const mapped = results.map((r) => r.tree);
        setSearchedTrees(mapped);

        // Track search analytics (fire-and-forget)
        trackExplorerSearch(searchQuery, locale, mapped.length);
      }
    });
  }, [searchQuery, typedTrees, locale]);

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
      // Track which result was clicked
      trackExplorerClick(searchQuery, locale, filteredTrees.length, slug);
      router.push(`/${locale}/trees/${slug}`);
      setShowSuggestions(false);
    },
    [router, locale, searchQuery, filteredTrees.length]
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
          {
            const selectedSuggestion = getSuggestionByIndex(
              suggestions,
              suggestionIndex
            );
            if (!selectedSuggestion) {
              break;
            }

            e.preventDefault();
            handleSuggestionSelect(selectedSuggestion.slug);
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

  const handleFamilyToggle = useCallback((family: string) => {
    setFilter((prev) => {
      const current = prev.family ?? [];
      const next = current.includes(family)
        ? current.filter((f) => f !== family)
        : [...current, family];
      return { ...prev, family: next.length > 0 ? next : undefined };
    });
  }, []);

  const handleStatusToggle = useCallback((status: string) => {
    setFilter((prev) => {
      const current = prev.conservationStatus ?? [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      return {
        ...prev,
        conservationStatus: next.length > 0 ? next : undefined,
      };
    });
  }, []);

  const handleProvinceToggle = useCallback((province: string) => {
    setFilter((prev) => {
      const current = prev.distribution ?? [];
      const dist = province as Distribution;
      const next = current.includes(dist)
        ? current.filter((d) => d !== dist)
        : [...current, dist];
      return { ...prev, distribution: next.length > 0 ? next : undefined };
    });
  }, []);

  const handleHeightToggle = useCallback((height: string) => {
    setFilter((prev) => {
      const current = prev.heightRange ?? [];
      const h = height as HeightRange;
      const next = current.includes(h)
        ? current.filter((v) => v !== h)
        : [...current, h];
      return { ...prev, heightRange: next.length > 0 ? next : undefined };
    });
  }, []);

  const handleUseCategoryToggle = useCallback((category: string) => {
    setFilter((prev) => {
      const current = prev.useCategory ?? [];
      const c = category as UseCategory;
      const next = current.includes(c)
        ? current.filter((v) => v !== c)
        : [...current, c];
      return { ...prev, useCategory: next.length > 0 ? next : undefined };
    });
  }, []);

  const handleSeasonalChange = useCallback(
    (value: "flowering" | "fruiting" | "all") => {
      setFilter((prev) => ({
        ...prev,
        seasonalFilter: value === "all" ? undefined : value,
        month: value === "all" ? undefined : prev.month,
      }));
    },
    []
  );

  const handleMonthChange = useCallback((value: Exclude<Month, "all-year">) => {
    setFilter((prev) => ({
      ...prev,
      month: value,
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

  // Saved search preferences
  const {
    savedSearchFilter,
    savedSearchSort,
    saveSearchPreferences,
    _hydrated,
  } = useStore();
  const [filterToast, setFilterToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending toast timer when the component unmounts
  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current !== null) {
      clearTimeout(toastTimerRef.current);
    }
    setFilterToast(message);
    toastTimerRef.current = setTimeout(() => {
      setFilterToast(null);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  const handleSaveFilters = useCallback(() => {
    saveSearchPreferences(filter, sort);
    showToast(t("filtersSaved"));
  }, [filter, sort, saveSearchPreferences, showToast, t]);

  const handleLoadFilters = useCallback(() => {
    if (savedSearchFilter) {
      setFilter(savedSearchFilter);
      if (savedSearchSort) {
        setSort(savedSearchSort);
      }
      setShowFilters(true);
      showToast(t("filtersLoaded"));
    } else {
      showToast(t("noSavedFilters"));
    }
  }, [savedSearchFilter, savedSearchSort, showToast, t]);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Family filter (multi-select) */}
              <MultiSelectDropdown
                label={labels.family}
                placeholder={labels.allFamilies}
                options={displayFacets.families.map(({ value, count }) => ({
                  value,
                  label: `${value} (${count})`,
                }))}
                selected={filter.family ?? []}
                onToggle={handleFamilyToggle}
              />

              {/* Conservation status filter (multi-select) */}
              <MultiSelectDropdown
                label={labels.status}
                placeholder={labels.allStatuses}
                options={displayFacets.conservationStatuses.map(
                  ({ value, count }) => ({
                    value,
                    label: `${value} (${count})`,
                  })
                )}
                selected={filter.conservationStatus ?? []}
                onToggle={handleStatusToggle}
              />

              {/* Province filter (multi-select) */}
              <MultiSelectDropdown
                label={labels.province}
                placeholder={labels.allProvinces}
                options={provinceFacets.map(({ value, count }) => ({
                  value,
                  label: `${t(`provinces.${value}`)} (${count})`,
                }))}
                selected={(filter.distribution ?? []) as string[]}
                onToggle={handleProvinceToggle}
              />

              {/* Height range filter (multi-select) */}
              <MultiSelectDropdown
                label={t("filterByHeight")}
                placeholder={t("allHeights")}
                options={displayFacets.heightRanges.map(({ value, count }) => ({
                  value,
                  label: `${t(`heightRanges.${value}`)} (${count})`,
                }))}
                selected={(filter.heightRange ?? []) as string[]}
                onToggle={handleHeightToggle}
              />

              {/* Use category filter (multi-select) */}
              <MultiSelectDropdown
                label={t("filterByUse")}
                placeholder={t("allUses")}
                options={displayFacets.useCategories.map(
                  ({ value, count }) => ({
                    value,
                    label: `${t(`useCategories.${value}`)} (${count})`,
                  })
                )}
                selected={(filter.useCategory ?? []) as string[]}
                onToggle={handleUseCategoryToggle}
              />

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

            {/* Active filter chips */}
            {hasActiveFilters && (
              <ActiveFilterChips
                filter={filter}
                locale={locale}
                onRemoveFamily={handleFamilyToggle}
                onRemoveStatus={handleStatusToggle}
                onRemoveProvince={handleProvinceToggle}
                onRemoveHeight={handleHeightToggle}
                onRemoveUseCategory={handleUseCategoryToggle}
                onRemoveTag={handleTagToggle}
                onRemoveSeasonal={() => handleSeasonalChange("all")}
                onRemoveSafety={(key) => handleFilterChange(key, undefined)}
                onClearAll={handleClearFilters}
              />
            )}

            {/* Save/Load filter preferences */}
            {_hydrated && (
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={handleSaveFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <BookmarkIcon className="w-3.5 h-3.5" />
                    {t("saveFilters")}
                  </button>
                )}
                {savedSearchFilter && (
                  <button
                    onClick={handleLoadFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                  >
                    <BookmarkFilledIcon className="w-3.5 h-3.5" />
                    {t("loadSavedFilters")}
                  </button>
                )}
                {filterToast && (
                  <span className="text-xs text-primary animate-in fade-in">
                    {filterToast}
                  </span>
                )}
              </div>
            )}

            {/* Tag filters */}
            {displayFacets.tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("characteristics")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {displayFacets.tags.map(({ value, count }) => {
                    const def = getTagDefinition(value);
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
                    onChange={(e) =>
                      handleSeasonalChange(
                        e.target.value as "flowering" | "fruiting" | "all"
                      )
                    }
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
                      onChange={(e) =>
                        handleMonthChange(
                          e.target.value as Exclude<Month, "all-year">
                        )
                      }
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
    const groupsMap = new Map<string, LightTree[]>();
    for (const tree of trees) {
      const letter = tree.title.charAt(0).toUpperCase();
      const groupTrees = groupsMap.get(letter);
      if (groupTrees) {
        groupTrees.push(tree);
      } else {
        groupsMap.set(letter, [tree]);
      }
    }

    return Object.fromEntries(groupsMap) as Record<string, LightTree[]>;
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
        aria-label={t("alphabetNav")}
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
        {letters.map((letter) => {
          const treesForLetter = getGroupByLetter(grouped, letter);

          return (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="text-3xl font-bold text-primary-dark dark:text-primary-light mb-4 sticky top-16 bg-background/90 backdrop-blur-sm py-2 -mx-2 px-2">
                {letter}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({treesForLetter.length})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {treesForLetter.map((tree) => (
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
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MultiSelectDropdown Component
// ============================================================================

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  label: string;
  placeholder: string;
  options: MultiSelectOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selected,
  onToggle,
}: MultiSelectDropdownProps) {
  const t = useTranslations("trees");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Close on click outside
  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  const selectedCount = selected.length;
  const buttonLabel =
    selectedCount === 0
      ? placeholder
      : selectedCount === 1
        ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
        : t("selectedCount", { count: selectedCount });

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-muted-foreground mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={
          typeof label === "string" ? `${label}: ${buttonLabel}` : buttonLabel
        }
        className={`w-full px-3 py-2 rounded-lg border text-left text-sm transition-colors flex items-center justify-between ${
          selectedCount > 0
            ? "border-primary/50 bg-primary/5 text-foreground"
            : "border-border bg-background text-foreground"
        } focus:outline-none focus:ring-2 focus:ring-primary/50`}
      >
        <span className="truncate">{buttonLabel}</span>
        <ChevronIcon
          className={`w-4 h-4 flex-shrink-0 ml-2 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={listId}
          role="group"
          aria-label={label}
          className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg"
        >
          {options.map((option) => {
            const isChecked = selected.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(option.value)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50"
                />
                <span className={isChecked ? "font-medium" : ""}>
                  {option.label}
                </span>
              </label>
            );
          })}
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">—</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ActiveFilterChips Component
// ============================================================================

interface ActiveFilterChipsProps {
  filter: TreeFilter;
  locale: Locale;
  onRemoveFamily: (family: string) => void;
  onRemoveStatus: (status: string) => void;
  onRemoveProvince: (province: string) => void;
  onRemoveHeight: (height: string) => void;
  onRemoveUseCategory: (category: string) => void;
  onRemoveTag: (tag: TreeTag) => void;
  onRemoveSeasonal: () => void;
  onRemoveSafety: (key: keyof TreeFilter) => void;
  onClearAll: () => void;
}

function ActiveFilterChips({
  filter,
  locale,
  onRemoveFamily,
  onRemoveStatus,
  onRemoveProvince,
  onRemoveHeight,
  onRemoveUseCategory,
  onRemoveTag,
  onRemoveSeasonal,
  onRemoveSafety,
  onClearAll,
}: ActiveFilterChipsProps) {
  const t = useTranslations("trees");
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  // Family chips
  for (const family of filter.family ?? []) {
    chips.push({
      key: `family-${family}`,
      label: family,
      onRemove: () => onRemoveFamily(family),
    });
  }

  // Conservation status chips
  for (const status of filter.conservationStatus ?? []) {
    chips.push({
      key: `status-${status}`,
      label: status,
      onRemove: () => onRemoveStatus(status),
    });
  }

  // Province chips
  for (const dist of filter.distribution ?? []) {
    chips.push({
      key: `province-${dist}`,
      label: t(`provinces.${dist}`),
      onRemove: () => onRemoveProvince(dist),
    });
  }

  // Height chips
  for (const height of filter.heightRange ?? []) {
    chips.push({
      key: `height-${height}`,
      label: t(`heightRanges.${height}`),
      onRemove: () => onRemoveHeight(height),
    });
  }

  // Use category chips
  for (const category of filter.useCategory ?? []) {
    chips.push({
      key: `use-${category}`,
      label: t(`useCategories.${category}`),
      onRemove: () => onRemoveUseCategory(category),
    });
  }

  // Tag chips
  for (const tag of filter.tags ?? []) {
    chips.push({
      key: `tag-${tag}`,
      label: getTagLabel(tag, locale),
      onRemove: () => onRemoveTag(tag),
    });
  }

  // Seasonal chip
  if (filter.seasonalFilter && filter.seasonalFilter !== "all") {
    const seasonLabel =
      filter.seasonalFilter === "flowering"
        ? `🌸 ${t("flowering")}`
        : `🍎 ${t("fruiting")}`;
    chips.push({
      key: "seasonal",
      label: seasonLabel,
      onRemove: onRemoveSeasonal,
    });
  }

  // Safety chips
  if (filter.childSafe) {
    chips.push({
      key: "childSafe",
      label: t("childSafe"),
      onRemove: () => onRemoveSafety("childSafe"),
    });
  }
  if (filter.petSafe) {
    chips.push({
      key: "petSafe",
      label: t("petSafe"),
      onRemove: () => onRemoveSafety("petSafe"),
    });
  }
  if (filter.nonToxic) {
    chips.push({
      key: "nonToxic",
      label: t("nonToxic"),
      onRemove: () => onRemoveSafety("nonToxic"),
    });
  }
  if (filter.lowRisk) {
    chips.push({
      key: "lowRisk",
      label: t("lowRisk"),
      onRemove: () => onRemoveSafety("lowRisk"),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs font-medium text-muted-foreground">
          {t("activeFilters")}
        </p>
        {chips.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-xs text-primary hover:text-primary-dark transition-colors"
          >
            {getUILabel("clearFilters", locale)}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip.key}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            {chip.label}
            <button
              onClick={chip.onRemove}
              className="ml-0.5 hover:text-primary-dark"
              aria-label={t("removeFilter", { label: chip.label })}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </span>
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

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}

function BookmarkFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}
