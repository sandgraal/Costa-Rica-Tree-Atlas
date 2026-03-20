"use client";

import { useEffect, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { hasAmbiguousCommonName } from "@/lib/tree-display";

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
  ambiguousCommonNames?: ReadonlySet<string>;
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
  ambiguousCommonNames,
}: SearchSuggestionsProps) {
  const t = useTranslations("search");
  const treeT = useTranslations("trees");

  // Auto-scroll selected item into view (use id to skip header/footer rows)
  useEffect(() => {
    document
      .getElementById(`suggestion-${selectedIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (suggestions.length === 0) return null;

  return (
    <ul
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
          {(() => {
            const isAmbiguousTitle = ambiguousCommonNames
              ? hasAmbiguousCommonName(tree.title, ambiguousCommonNames)
              : false;

            return (
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
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1 truncate font-medium">
                      {highlightMatch(tree.title, query)}
                    </div>
                    {isAmbiguousTitle && (
                      <span
                        className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                        aria-label={`${treeT("family")}: ${tree.family}`}
                        title={tree.family}
                      >
                        {tree.family}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground italic truncate">
                    {highlightMatch(tree.scientificName, query)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {tree.family}
                  </div>
                </div>
              </button>
            );
          })()}
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

/** Highlight matching substrings with a <mark> tag */
function highlightMatch(text: string, query: string): ReactNode {
  if (!query.trim()) return text;

  // Split query into individual terms for multi-word highlighting
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0)
    .map((term) => term.toLowerCase());

  if (terms.length === 0) return text;

  const lowerText = text.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let partIndex = 0;

  while (cursor < text.length) {
    let nextIndex = -1;
    let matchedTerm = "";

    for (const term of terms) {
      const termIndex = lowerText.indexOf(term, cursor);
      if (termIndex === -1) continue;

      if (
        nextIndex === -1 ||
        termIndex < nextIndex ||
        (termIndex === nextIndex && term.length > matchedTerm.length)
      ) {
        nextIndex = termIndex;
        matchedTerm = term;
      }
    }

    if (nextIndex === -1) {
      parts.push(text.slice(cursor));
      break;
    }

    if (nextIndex > cursor) {
      parts.push(text.slice(cursor, nextIndex));
    }

    const endIndex = nextIndex + matchedTerm.length;
    parts.push(
      <mark
        key={`match-${partIndex++}`}
        className="bg-primary/20 text-foreground rounded-sm px-0.5"
      >
        {text.slice(nextIndex, endIndex)}
      </mark>
    );

    cursor = endIndex;
  }

  return parts.length > 0 ? parts : text;
}
