"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Tree } from "contentlayer/generated";
import { TreeCard } from "@/components/TreeCard";
import { TreeSearch } from "@/components/TreeSearch";

interface TreeListProps {
  trees: Tree[];
}

export function TreeList({ trees }: TreeListProps) {
  const t = useTranslations("trees");
  const [filteredTrees, setFilteredTrees] = useState<Tree[]>(trees);

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t("subtitle")}
        </p>
      </div>

      {/* Search */}
      <TreeSearch trees={trees} onFilteredTrees={setFilteredTrees} />

      {/* Results Count */}
      {filteredTrees.length !== trees.length && (
        <p className="text-center text-muted-foreground mb-6">
          {t("resultsCount", {
            count: filteredTrees.length,
            total: trees.length,
          })}
        </p>
      )}

      {/* Tree Grid */}
      {filteredTrees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrees.map((tree) => (
            <TreeCard key={tree._id} tree={tree} />
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
