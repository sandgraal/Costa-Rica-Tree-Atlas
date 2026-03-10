"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ComponentErrorBoundary } from "./ComponentErrorBoundary";
import { useDebounce } from "@/hooks/useDebounce";
import { getSearchSessionId } from "@/lib/analytics/search-session";

// ---------------------------------------------------------------------------
// Lightweight search analytics — fire-and-forget, never blocks UI
// ---------------------------------------------------------------------------

/** Record a search event (query executed). Best-effort, no await needed. */
function trackSearch(query: string, locale: string, resultsCount: number) {
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
    /* silent — analytics must never break UX */
  });
}

/** Record which result was clicked. Separate event so we capture the slug. */
function trackResultClick(
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

interface TreeSearchResult {
  slug: string;
  title: string;
  scientificName: string;
  family: string;
  description?: string;
  uses?: string[];
  tags?: string[];
  nativeRegion?: string;
  distribution?: string[];
  conservationStatus?: string;
}

export function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TreeSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allTrees, setAllTrees] = useState<TreeSearchResult[]>([]);
  const [isLoadingTrees, setIsLoadingTrees] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("search");

  // Debounce search query - only search after user stops typing
  const debouncedQuery = useDebounce(query, 300);

  // Load lightweight search index from API (avoids shipping full contentlayer bundle to client)
  useEffect(() => {
    const loadTrees = async () => {
      setIsLoadingTrees(true);
      try {
        const res = await fetch(`/api/trees/search-index?locale=${locale}`);
        if (!res.ok) throw new Error("Failed to fetch search index");
        const index: TreeSearchResult[] = await res.json();
        setAllTrees(index);
      } catch (error) {
        console.error("Failed to load trees:", error);
      } finally {
        setIsLoadingTrees(false);
      }
    };
    void loadTrees();
  }, [locale]);

  // Comprehensive search function with fuzzy matching
  const searchTrees = (
    searchQuery: string,
    trees: TreeSearchResult[]
  ): TreeSearchResult[] => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    const queryTerms = lowerQuery
      .split(/\s+/)
      .filter((term) => term.length > 0);

    // Score each tree based on matches
    const scoredTrees = trees.map((tree) => {
      let score = 0;
      const matchedFields: string[] = [];

      // Helper to check if any term matches a field
      const checkField = (
        value: string | undefined,
        weight: number,
        fieldName: string
      ) => {
        if (!value) return;
        const lowerValue = value.toLowerCase();
        for (const term of queryTerms) {
          if (lowerValue.includes(term)) {
            score += weight;
            matchedFields.push(fieldName);
            // Bonus for exact match or starts with
            if (lowerValue === term || lowerValue.startsWith(term + " ")) {
              score += weight * 0.5;
            }
          }
        }
      };

      // Helper to check array fields
      const checkArrayField = (
        values: string[] | undefined,
        weight: number,
        fieldName: string
      ) => {
        if (!values) return;
        for (const value of values) {
          const lowerValue = value.toLowerCase();
          for (const term of queryTerms) {
            if (lowerValue.includes(term)) {
              score += weight;
              matchedFields.push(fieldName);
            }
          }
        }
      };

      // Check all searchable fields with appropriate weights
      checkField(tree.title, 10, "title"); // Highest priority
      checkField(tree.scientificName, 8, "scientificName"); // High priority
      checkField(tree.family, 5, "family"); // Medium priority
      checkField(tree.description, 3, "description"); // Lower priority
      checkField(tree.nativeRegion, 3, "nativeRegion");
      checkField(tree.conservationStatus, 2, "conservationStatus");
      checkArrayField(tree.uses, 4, "uses");
      checkArrayField(tree.tags, 4, "tags");
      checkArrayField(tree.distribution, 3, "distribution");

      return { tree, score, matchedFields };
    });

    // Filter trees with any matches and sort by score
    return scoredTrees
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.tree);
  };

  // Search trees only when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const filtered = searchTrees(debouncedQuery, allTrees).slice(0, 8); // Increased to 8 results
    setResults(filtered);
    setSelectedIndex(0);

    // Track search analytics (fire-and-forget)
    trackSearch(debouncedQuery, locale, filtered.length);
  }, [debouncedQuery, allTrees, locale]);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = useCallback(
    (slug: string) => {
      // Track which result was clicked
      trackResultClick(debouncedQuery || query, locale, results.length, slug);
      router.push(`/${locale}/trees/${slug}`);
      setIsOpen(false);
      setQuery("");
    },
    [router, locale, debouncedQuery, query, results.length]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].slug);
    }
  };

  // Auto-scroll selected result into view
  useEffect(() => {
    const list = resultsRef.current;
    if (!list) return;
    const selectedItem = list.children[selectedIndex] as
      | HTMLElement
      | undefined;
    selectedItem?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <ComponentErrorBoundary componentName="Quick Search">
      <div ref={containerRef} className="relative">
        {/* Search Button */}
        <button
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
          aria-label={t("button")}
        >
          <SearchIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t("button")}</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-background rounded text-xs border border-border">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </button>

        {/* Dialog Overlay - Only show when open */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40" />

            {/* Dialog */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-background border border-border rounded-xl shadow-2xl overflow-hidden z-50">
              {/* Search Input */}
              <div className="p-4 border-b border-border">
                <input
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls={
                    results.length > 0 ? "quicksearch-results" : undefined
                  }
                  aria-activedescendant={
                    results.length > 0
                      ? `quicksearch-result-${selectedIndex}`
                      : undefined
                  }
                  aria-autocomplete="list"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t("placeholder")}
                  className="w-full px-3 py-2 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Results */}
              {isLoadingTrees ? (
                <div className="p-4">
                  <div className="h-12 bg-muted rounded animate-pulse mb-4" />
                  <div className="space-y-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-muted rounded animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ) : results.length > 0 ? (
                <ul
                  ref={resultsRef}
                  id="quicksearch-results"
                  role="listbox"
                  className="py-2 max-h-96 overflow-auto"
                >
                  {results.map((tree, index) => (
                    <li
                      key={tree.slug}
                      id={`quicksearch-result-${index}`}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <button
                        onClick={() => {
                          handleSelect(tree.slug);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                          index === selectedIndex
                            ? "bg-primary/10 text-foreground"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="text-2xl shrink-0">🌳</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {tree.title}
                          </div>
                          <div className="text-sm text-muted-foreground truncate italic">
                            {tree.scientificName}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {tree.family}
                            {tree.conservationStatus && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-xs">
                                {tree.conservationStatus}
                              </span>
                            )}
                          </div>
                          {/* Show additional context based on matched fields */}
                          {tree.tags && tree.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tree.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {tree.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{tree.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query ? (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <p className="mb-2">{t("noResults")}</p>
                  <p className="text-xs">{t("noResultsHint")}</p>
                </div>
              ) : (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  <p className="mb-3">{t("typeToSearch")}</p>
                  <div className="text-xs space-y-1">
                    <p className="font-medium">{t("searchExamples")}</p>
                    <p className="text-muted-foreground/80">
                      &quot;Ceiba&quot; · &quot;Malvaceae&quot; ·
                      &quot;medicinal&quot; · &quot;guanacaste&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-background rounded border border-border">
                    ↑
                  </kbd>
                  <kbd className="px-1 py-0.5 bg-background rounded border border-border">
                    ↓
                  </kbd>
                  {t("navigate")}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">
                    ↵
                  </kbd>
                  {t("select")}
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">
                    esc
                  </kbd>
                  {t("close")}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </ComponentErrorBoundary>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
