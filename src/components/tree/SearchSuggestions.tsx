"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";

// ============================================================================
// Types
// ============================================================================

interface Suggestion {
  slug: string;
  title: string;
  scientificName: string;
  family: string;
}

interface SearchSuggestionsProps {
  suggestions: Suggestion[];
  selectedIndex: number;
  query: string;
  onSelect: (slug: string) => void;
  onHover: (index: number) => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Dropdown of search suggestions with match highlighting and keyboard nav.
 * Renders as an absolutely-positioned listbox beneath the parent search input.
 * Parent is responsible for keyboard handling (ArrowUp/Down/Enter/Escape)
 * and managing selectedIndex.
 */
export function SearchSuggestions({
  suggestions,
  selectedIndex,
  query,
  onSelect,
  onHover,
}: SearchSuggestionsProps) {
  const t = useTranslations("search");
  const listRef = useRef<HTMLUListElement>(null);

  // Auto-scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selectedItem = list.children[selectedIndex] as
      | HTMLElement
      | undefined;
    selectedItem?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (suggestions.length === 0) return null;

  return (
    <ul
      ref={listRef}
      role="listbox"
      id="search-suggestions"
      className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-auto max-h-80 z-50"
    >
      {/* Suggestions header */}
      <li
        role="presentation"
        className="px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border"
      >
        {t("topResults")}
      </li>

      {suggestions.map((tree, index) => (
        <li
          key={tree.slug}
          id={`suggestion-${index}`}
          role="option"
          aria-selected={index === selectedIndex}
        >
          <button
            type="button"
            onClick={() => {
              onSelect(tree.slug);
            }}
            onMouseEnter={() => {
              onHover(index);
            }}
            className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
              index === selectedIndex
                ? "bg-primary/10 text-foreground"
                : "text-foreground hover:bg-muted"
            }`}
          >
            <span className="text-lg shrink-0" aria-hidden="true">
              🌳
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {highlightMatch(tree.title, query)}
              </div>
              <div className="text-sm text-muted-foreground italic truncate">
                {highlightMatch(tree.scientificName, query)}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {tree.family}
              </div>
            </div>
          </button>
        </li>
      ))}

      {/* Keyboard hints footer */}
      <li
        role="presentation"
        className="px-4 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30 flex items-center gap-4"
      >
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
      </li>
    </ul>
  );
}

// ============================================================================
// Helpers
// ============================================================================

/** Escape special regex characters */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlight matching substrings with a <mark> tag */
function highlightMatch(text: string, query: string): ReactNode {
  if (!query.trim()) return text;

  // Split query into individual terms for multi-word highlighting
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map(escapeRegex);

  if (terms.length === 0) return text;

  const regex = new RegExp(`(${terms.join("|")})`, "gi");
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
