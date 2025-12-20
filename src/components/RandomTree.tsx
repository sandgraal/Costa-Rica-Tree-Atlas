"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@i18n/navigation";
import type { Tree } from "contentlayer/generated";
import { TreeTags } from "./TreeTags";

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyZDVhMjciIG9wYWNpdHk9IjAuMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhiNWEyYiIgb3BhY2l0eT0iMC4xIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==";

interface RandomTreeProps {
  trees: Tree[];
  translations: {
    discover: string;
    newTree: string;
    learnMore: string;
  };
}

export function RandomTree({ trees, translations }: RandomTreeProps) {
  const [currentTree, setCurrentTree] = useState<Tree | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const selectRandomTree = useCallback(() => {
    setIsAnimating(true);
    
    // Get a different tree than the current one
    const availableTrees = currentTree 
      ? trees.filter((t) => t.slug !== currentTree.slug)
      : trees;
    
    const randomIndex = Math.floor(Math.random() * availableTrees.length);
    
    // Delay setting the new tree for animation effect
    setTimeout(() => {
      setCurrentTree(availableTrees[randomIndex]);
      setIsAnimating(false);
    }, 300);
  }, [trees, currentTree]);

  return (
    <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-2xl p-6 md:p-8 border border-primary/10">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-2">
          🌳 {translations.discover}
        </h2>
        <button
          type="button"
          onClick={selectRandomTree}
          disabled={isAnimating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShuffleIcon className="h-5 w-5" />
          {translations.newTree}
        </button>
      </div>

      {currentTree && (
        <div
          className={`transition-all duration-300 ${
            isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-border">
            <div className="md:flex">
              {/* Image */}
              <div className="md:w-1/2 relative aspect-video md:aspect-auto">
                {currentTree.featuredImage ? (
                  <Image
                    src={currentTree.featuredImage}
                    alt={currentTree.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                  />
                ) : (
                  <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-muted">
                    <TreeIcon className="h-16 w-16 text-primary/30" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="md:w-1/2 p-6">
                <h3 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-1">
                  {currentTree.title}
                </h3>
                <p className="text-secondary italic mb-2">{currentTree.scientificName}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {currentTree.family}
                </p>

                <p className="text-foreground/80 mb-4 line-clamp-3">
                  {currentTree.description}
                </p>

                {/* Tags */}
                {(currentTree as Tree & { tags?: string[] }).tags && (
                  <div className="mb-4">
                    <TreeTags
                      tags={(currentTree as Tree & { tags?: string[] }).tags!}
                      size="sm"
                      limit={4}
                    />
                  </div>
                )}

                <Link
                  href={`/trees/${currentTree.slug}`}
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  {translations.learnMore}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
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
      aria-hidden="true"
    >
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
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
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default RandomTree;
