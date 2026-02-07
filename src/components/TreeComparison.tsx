"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Tree } from "contentlayer/generated";
import { TreeTags } from "./TreeTags";
import { BLUR_DATA_URL } from "@/lib/image";

interface TreeComparisonProps {
  trees: Tree[];
  locale: string;
  translations: {
    title: string;
    selectTree: string;
    selectPlaceholder: string;
    addTree: string;
    removeTree: string;
    noTreesSelected: string;
    properties: {
      image: string;
      commonName: string;
      scientificName: string;
      family: string;
      maxHeight: string;
      nativeRegion: string;
      conservationStatus: string;
      uses: string;
      tags: string;
    };
  };
}

export function TreeComparison({
  trees,
  locale,
  translations,
}: TreeComparisonProps) {
  const searchParams = useSearchParams();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const maxTrees = 4;

  // Initialize from URL params on mount
  useEffect(() => {
    const treesParam = searchParams.get("trees");
    if (treesParam) {
      const slugsFromUrl = treesParam.split(",").filter(Boolean);
      // Validate that slugs exist in the tree list
      const validSlugs = slugsFromUrl
        .filter((slug) => trees.some((tree) => tree.slug === slug))
        .slice(0, maxTrees);
      if (validSlugs.length > 0) {
        setSelectedSlugs(validSlugs);
      }
    }
  }, [searchParams, trees]);

  // Get available trees (not already selected)
  const availableTrees = useMemo(() => {
    return trees.filter((tree) => !selectedSlugs.includes(tree.slug));
  }, [trees, selectedSlugs]);

  // Get selected tree objects
  const selectedTrees = useMemo(() => {
    return selectedSlugs
      .map((slug) => trees.find((tree) => tree.slug === slug))
      .filter((tree): tree is Tree => tree !== undefined);
  }, [trees, selectedSlugs]);

  const addTree = (slug: string) => {
    if (selectedSlugs.length < maxTrees && !selectedSlugs.includes(slug)) {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const removeTree = (slug: string) => {
    setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
  };

  const clearAll = () => {
    setSelectedSlugs([]);
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-2">
          {translations.title}
        </h2>

        {/* Tree selector */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md">
            <select
              value=""
              onChange={(e) => {
                addTree(e.target.value);
              }}
              disabled={selectedSlugs.length >= maxTrees}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            >
              <option value="" disabled>
                {selectedSlugs.length >= maxTrees
                  ? `Max ${maxTrees} trees`
                  : translations.selectPlaceholder}
              </option>
              {availableTrees.map((tree) => (
                <option key={tree.slug} value={tree.slug}>
                  {tree.title} ({tree.scientificName})
                </option>
              ))}
            </select>
          </div>

          {selectedSlugs.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Selected tree badges */}
        {selectedSlugs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTrees.map((tree) => (
              <span
                key={tree.slug}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
              >
                {tree.title}
                <button
                  onClick={() => {
                    removeTree(tree.slug);
                  }}
                  className="ml-1 hover:text-primary-dark"
                  aria-label={`Remove ${tree.title}`}
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {selectedTrees.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CompareIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p>{translations.noTreesSelected}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 bg-muted/50 border-b border-border w-32 sticky left-0 z-10 bg-background">
                  {/* Empty header for property column */}
                </th>
                {selectedTrees.map((tree) => (
                  <th
                    key={tree.slug}
                    className="text-center p-3 bg-muted/50 border-b border-border min-w-[200px]"
                  >
                    <button
                      onClick={() => removeTree(tree.slug)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                      aria-label={translations.removeTree}
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Image Row */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10">
                  {translations.properties.image}
                </td>
                {selectedTrees.map((tree) => (
                  <td
                    key={tree.slug}
                    className="p-3 border-b border-border text-center"
                  >
                    <div className="relative w-full aspect-video max-w-[250px] mx-auto rounded-lg overflow-hidden bg-muted">
                      {tree.featuredImage ? (
                        <Image
                          src={tree.featuredImage}
                          alt={tree.title}
                          fill
                          sizes="250px"
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL={BLUR_DATA_URL}
                          quality={75}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TreeIcon className="h-12 w-12 text-primary/30" />
                        </div>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Common Name */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10">
                  {translations.properties.commonName}
                </td>
                {selectedTrees.map((tree) => (
                  <td
                    key={tree.slug}
                    className="p-3 border-b border-border text-center font-semibold text-primary-dark dark:text-primary-light"
                  >
                    <a
                      href={`/${locale}/trees/${tree.slug}`}
                      className="hover:underline"
                    >
                      {tree.title}
                    </a>
                  </td>
                ))}
              </tr>

              {/* Scientific Name */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10">
                  {translations.properties.scientificName}
                </td>
                {selectedTrees.map((tree) => (
                  <td
                    key={tree.slug}
                    className="p-3 border-b border-border text-center italic text-secondary"
                  >
                    {tree.scientificName}
                  </td>
                ))}
              </tr>

              {/* Family */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10">
                  {translations.properties.family}
                </td>
                {selectedTrees.map((tree) => (
                  <td
                    key={tree.slug}
                    className="p-3 border-b border-border text-center"
                  >
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                      {tree.family}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Max Height */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10">
                  {translations.properties.maxHeight}
                </td>
                {selectedTrees.map((tree) => (
                  <td
                    key={tree.slug}
                    className="p-3 border-b border-border text-center"
                  >
                    {tree.maxHeight || "—"}
                  </td>
                ))}
              </tr>

              {/* Native Region */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10">
                  {translations.properties.nativeRegion}
                </td>
                {selectedTrees.map((tree) => (
                  <td
                    key={tree.slug}
                    className="p-3 border-b border-border text-center text-sm"
                  >
                    {tree.nativeRegion || "—"}
                  </td>
                ))}
              </tr>

              {/* Conservation Status */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10">
                  {translations.properties.conservationStatus}
                </td>
                {selectedTrees.map((tree) => (
                  <td
                    key={tree.slug}
                    className="p-3 border-b border-border text-center"
                  >
                    {tree.conservationStatus ? (
                      <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-sm">
                        {tree.conservationStatus}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                ))}
              </tr>

              {/* Uses */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10 align-top">
                  {translations.properties.uses}
                </td>
                {selectedTrees.map((tree) => (
                  <td
                    key={tree.slug}
                    className="p-3 border-b border-border align-top"
                  >
                    {tree.uses && tree.uses.length > 0 ? (
                      <ul className="text-sm text-left space-y-1">
                        {tree.uses.slice(0, 5).map((use, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-primary">•</span>
                            <span>{use}</span>
                          </li>
                        ))}
                        {tree.uses.length > 5 && (
                          <li className="text-muted-foreground text-xs">
                            +{tree.uses.length - 5} more
                          </li>
                        )}
                      </ul>
                    ) : (
                      <span className="text-center block">—</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Tags */}
              <tr>
                <td className="p-3 font-medium bg-muted/30 border-b border-border sticky left-0 z-10 align-top">
                  {translations.properties.tags}
                </td>
                {selectedTrees.map((tree) => {
                  const tags = (tree as Tree & { tags?: string[] }).tags;
                  return (
                    <td
                      key={tree.slug}
                      className="p-3 border-b border-border align-top"
                    >
                      {tags && tags.length > 0 ? (
                        <TreeTags tags={tags} size="sm" limit={6} />
                      ) : (
                        <span className="text-center block">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Icons
function XIcon({ className }: { className?: string }) {
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

function CompareIcon({ className }: { className?: string }) {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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
    >
      <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
    </svg>
  );
}

export default TreeComparison;
