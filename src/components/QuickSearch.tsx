"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface TreeSearchResult {
  slug: string;
  title: string;
  scientificName: string;
  family: string;
}

export function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TreeSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allTrees, setAllTrees] = useState<TreeSearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const locale = useLocale();

  // Load trees on mount
  useEffect(() => {
    const loadTrees = async () => {
      try {
        // Use dynamic import to load trees
        const { allTrees: trees } = await import("contentlayer/generated");
        const localeTrees = trees
          .filter((t: { locale: string }) => t.locale === locale)
          .map(
            (t: {
              slug: string;
              title: string;
              scientificName: string;
              family: string;
            }) => ({
              slug: t.slug,
              title: t.title,
              scientificName: t.scientificName,
              family: t.family,
            })
          );
        setAllTrees(localeTrees);
      } catch (error) {
        console.error("Failed to load trees:", error);
      }
    };
    loadTrees();
  }, [locale]);

  // Filter results when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allTrees
      .filter(
        (tree) =>
          tree.title.toLowerCase().includes(lowerQuery) ||
          tree.scientificName.toLowerCase().includes(lowerQuery) ||
          tree.family.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5);

    setResults(filtered);
    setSelectedIndex(0);
  }, [query, allTrees]);

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
    return () => document.removeEventListener("keydown", handleKeyDown);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (slug: string) => {
      router.push(`/${locale}/trees/${slug}`);
      setIsOpen(false);
      setQuery("");
    },
    [router, locale]
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

  return (
    <div ref={containerRef} className="relative">
      {/* Search Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-sm"
        aria-label="Search trees"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">
          {locale === "es" ? "Buscar" : "Search"}
        </span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-background rounded text-xs border border-border">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={locale === "es" ? "Búsqueda rápida" : "Quick search"}
        >
          <div className="w-full max-w-lg mx-4 bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center border-b border-border px-4">
              <SearchIcon
                className="h-5 w-5 text-muted-foreground shrink-0"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  locale === "es"
                    ? "Buscar árboles por nombre..."
                    : "Search trees by name..."
                }
                aria-label={locale === "es" ? "Buscar árboles" : "Search trees"}
                className="flex-1 px-3 py-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoComplete="off"
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="p-1 text-muted-foreground hover:text-foreground"
                aria-label={
                  locale === "es" ? "Cerrar búsqueda" : "Close search"
                }
              >
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs border border-border">
                  ESC
                </kbd>
              </button>
            </div>

            {/* Results */}
            {results.length > 0 ? (
              <ul className="py-2 max-h-80 overflow-auto">
                {results.map((tree, index) => (
                  <li key={tree.slug}>
                    <button
                      onClick={() => handleSelect(tree.slug)}
                      className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                        index === selectedIndex
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-2xl shrink-0">🌳</span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{tree.title}</div>
                        <div className="text-sm text-muted-foreground truncate italic">
                          {tree.scientificName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {tree.family}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : query ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                {locale === "es"
                  ? "No se encontraron árboles"
                  : "No trees found"}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                {locale === "es"
                  ? "Escribe para buscar árboles..."
                  : "Type to search trees..."}
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
                {locale === "es" ? "navegar" : "navigate"}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">
                  ↵
                </kbd>
                {locale === "es" ? "seleccionar" : "select"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
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
