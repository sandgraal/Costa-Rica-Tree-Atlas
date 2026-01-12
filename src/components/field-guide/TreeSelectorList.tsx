"use client";

import { Tree } from "contentlayer/generated";
import Image from "next/image";

interface TreeSelectorListProps {
  trees: Tree[];
  selectedSlugs: string[];
  onToggle: (slug: string) => void;
  locale: string;
}

export function TreeSelectorList({
  trees,
  selectedSlugs,
  onToggle,
  locale,
}: TreeSelectorListProps) {
  if (trees.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trees.map((tree) => {
        const isSelected = selectedSlugs.includes(tree.slug);
        return (
          <button
            key={tree.slug}
            onClick={() => onToggle(tree.slug)}
            className={`
              text-left p-4 rounded-lg border-2 transition-all
              ${
                isSelected
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }
            `}
            aria-pressed={isSelected}
          >
            <div className="flex gap-3">
              {/* Checkbox */}
              <div className="flex-shrink-0 pt-1">
                <div
                  className={`
                    w-5 h-5 rounded border-2 flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 dark:border-gray-600"
                    }
                  `}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
              </div>

              {/* Thumbnail */}
              {tree.featuredImage && (
                <div className="flex-shrink-0 w-16 h-16 relative rounded overflow-hidden">
                  <Image
                    src={tree.featuredImage}
                    alt={tree.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {tree.title}
                </h3>
                <p className="text-sm italic text-gray-600 dark:text-gray-400 truncate">
                  {tree.scientificName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-1">
                  {tree.family}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
