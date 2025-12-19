"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { Tree } from "contentlayer/generated";

interface TreeSearchProps {
  trees: Tree[];
  onFilteredTrees: (trees: Tree[]) => void;
}

export function TreeSearch({ trees, onFilteredTrees }: TreeSearchProps) {
  const t = useTranslations("trees");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      onFilteredTrees(trees);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = trees.filter((tree) => {
      return (
        tree.title.toLowerCase().includes(lowercaseQuery) ||
        tree.scientificName.toLowerCase().includes(lowercaseQuery) ||
        tree.family.toLowerCase().includes(lowercaseQuery) ||
        tree.description.toLowerCase().includes(lowercaseQuery) ||
        (tree.nativeRegion?.toLowerCase().includes(lowercaseQuery) ?? false) ||
        (tree.uses?.some((use) => use.toLowerCase().includes(lowercaseQuery)) ??
          false)
      );
    });

    onFilteredTrees(filtered);
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <SearchIcon className="h-5 w-5" />
        </div>
        {searchQuery && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <ClearIcon className="h-5 w-5" />
          </button>
        )}
      </div>
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

function ClearIcon({ className }: { className?: string }) {
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
