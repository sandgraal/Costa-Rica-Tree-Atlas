"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@i18n/navigation";
import Image from "next/image";
import { TreeTags } from "./TreeTags";
import { BLUR_DATA_URL } from "@/lib/image";
import { getConservationLabel } from "@/lib/i18n/translations";
import type { ComparisonTreeSummary } from "@/types/tree";
import type { ConservationCategory, Locale } from "@/types/tree";

interface TreeComparisonProps {
  trees: ComparisonTreeSummary[];
  locale: Locale;
  translations: {
    title: string;
    selectTree: string;
    selectPlaceholder: string;
    addTree: string;
    removeTree: string;
    clearAll: string;
    noTreesSelected: string;
    maxTreesReachedTemplate: string;
    removeSelectedTreeTemplate: string;
    moreUsesTemplate: string;
    selectedCountTemplate: string;
    viewModeHint: string;
    comparisonTableLabel: string;
    comparisonCardsLabel: string;
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatTranslationTemplate(
  template: string,
  replacements: Record<string, string | number>
) {
  return Object.entries(replacements).reduce(
    (formatted, [key, value]) =>
      formatted.replace(
        new RegExp(`\\{${escapeRegExp(key)}\\}`, "g"),
        String(value)
      ),
    template
  );
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
      .filter((tree): tree is ComparisonTreeSummary => tree !== undefined);
  }, [trees, selectedSlugs]);

  const selectedCountLabel = formatTranslationTemplate(
    translations.selectedCountTemplate,
    {
      count: selectedTrees.length,
      max: maxTrees,
    }
  );

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

  const renderTreeImage = (
    tree: ComparisonTreeSummary,
    maxWidthClass = "max-w-[250px]"
  ) => (
    <div
      className={`relative w-full aspect-video ${maxWidthClass} mx-auto rounded-lg overflow-hidden bg-muted`}
    >
      {tree.featuredImage ? (
        <Image
          src={tree.featuredImage}
          alt={tree.title}
          fill
          sizes="(max-width: 768px) 100vw, 250px"
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
  );

  const renderConservationStatus = (tree: ComparisonTreeSummary) => {
    if (!tree.conservationStatus) {
      return <span className="text-muted-foreground">—</span>;
    }

    let conservationLabel: string | null = null;
    try {
      conservationLabel = getConservationLabel(
        tree.conservationStatus as ConservationCategory,
        locale
      );
    } catch {
      conservationLabel = null;
    }

    return (
      <span className="inline-flex rounded-full bg-secondary/10 px-2 py-1 text-sm text-secondary">
        {tree.conservationStatus}
        {conservationLabel ? ` — ${conservationLabel}` : ""}
      </span>
    );
  };

  const renderUses = (tree: ComparisonTreeSummary, compact = false) => {
    if (!tree.uses || tree.uses.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }

    return (
      <ul className={`space-y-1 text-sm ${compact ? "" : "text-left"}`}>
        {tree.uses.slice(0, 5).map((use) => (
          <li key={`${tree.slug}-${use}`} className="flex items-start gap-1">
            <span className="text-primary">•</span>
            <span>{use}</span>
          </li>
        ))}
        {tree.uses.length > 5 && (
          <li className="text-xs text-muted-foreground">
            {formatTranslationTemplate(translations.moreUsesTemplate, {
              count: tree.uses.length - 5,
            })}
          </li>
        )}
      </ul>
    );
  };

  const renderTags = (tree: ComparisonTreeSummary) => {
    if (!tree.tags || tree.tags.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }

    return <TreeTags tags={tree.tags} size="sm" />;
  };

  const comparisonRows = [
    {
      key: "scientificName",
      label: translations.properties.scientificName,
      render: (tree: ComparisonTreeSummary) => (
        <span className="italic text-secondary">{tree.scientificName}</span>
      ),
    },
    {
      key: "family",
      label: translations.properties.family,
      render: (tree: ComparisonTreeSummary) => (
        <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-sm text-primary">
          {tree.family}
        </span>
      ),
    },
    {
      key: "maxHeight",
      label: translations.properties.maxHeight,
      render: (tree: ComparisonTreeSummary) => tree.maxHeight || "—",
    },
    {
      key: "nativeRegion",
      label: translations.properties.nativeRegion,
      render: (tree: ComparisonTreeSummary) => tree.nativeRegion || "—",
    },
    {
      key: "conservationStatus",
      label: translations.properties.conservationStatus,
      render: (tree: ComparisonTreeSummary) => renderConservationStatus(tree),
    },
    {
      key: "uses",
      label: translations.properties.uses,
      render: (tree: ComparisonTreeSummary) => renderUses(tree),
      mobileRender: (tree: ComparisonTreeSummary) => renderUses(tree, true),
    },
    {
      key: "tags",
      label: translations.properties.tags,
      render: (tree: ComparisonTreeSummary) => renderTags(tree),
    },
  ];

  return (
    <div className="py-8">
      <div className="mb-6 rounded-2xl border border-border bg-card p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {translations.selectTree}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedTrees.length > 0
                ? selectedCountLabel
                : translations.noTreesSelected}
            </p>
            <p className="text-xs text-muted-foreground">
              {translations.viewModeHint}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-2xl">
            <div className="flex-1 min-w-[200px]">
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
                    ? formatTranslationTemplate(
                        translations.maxTreesReachedTemplate,
                        {
                          count: maxTrees,
                        }
                      )
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
                className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary-dark"
              >
                {translations.clearAll}
              </button>
            )}
          </div>
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
                  aria-label={formatTranslationTemplate(
                    translations.removeSelectedTreeTemplate,
                    {
                      treeTitle: tree.title,
                    }
                  )}
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
        <>
          <div
            aria-label={translations.comparisonCardsLabel}
            className="grid gap-4 md:hidden"
          >
            {selectedTrees.map((tree) => (
              <article
                key={tree.slug}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="relative">
                  {renderTreeImage(tree, "max-w-none")}
                  <button
                    onClick={() => {
                      removeTree(tree.slug);
                    }}
                    className="absolute right-3 top-3 rounded-full bg-background/90 p-2 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
                    aria-label={translations.removeSelectedTreeTemplate.replace(
                      "{treeTitle}",
                      tree.title,
                    )}
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Link
                      href={`/trees/${tree.slug}`}
                      className="block text-lg font-semibold text-primary-dark transition-colors hover:text-primary hover:underline dark:text-primary-light"
                    >
                      {tree.title}
                    </Link>
                    <p className="text-sm italic text-secondary">
                      {tree.scientificName}
                    </p>
                  </div>

                  <dl className="space-y-3">
                    {comparisonRows
                      .filter((row) => row.key !== "commonName")
                      .map((row) => (
                        <div
                          key={`${tree.slug}-${row.key}`}
                          className="grid gap-1 border-t border-border/60 pt-3 first:border-t-0 first:pt-0"
                        >
                          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {row.label}
                          </dt>
                          <dd className="text-sm text-foreground">
                            {(row.mobileRender ?? row.render)(tree)}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              </article>
            ))}
          </div>

          <div
            aria-label={translations.comparisonTableLabel}
            className="hidden overflow-x-auto md:block"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 w-32 border-b border-border bg-background p-3 text-left">
                    {/* Empty header for property column */}
                  </th>
                  {selectedTrees.map((tree) => (
                    <th
                      key={tree.slug}
                      className="relative min-w-[220px] border-b border-border bg-muted/50 p-3 text-center align-top"
                    >
                      <button
                        onClick={() => {
                          removeTree(tree.slug);
                        }}
                        className="absolute right-2 top-2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={translations.removeSelectedTreeTemplate.replace("{title}", tree.title)}
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                      <div className="space-y-3 pt-4">
                        {renderTreeImage(tree)}
                        <Link
                          href={`/trees/${tree.slug}`}
                          className="block font-semibold text-primary-dark transition-colors hover:text-primary hover:underline dark:text-primary-light"
                        >
                          {tree.title}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.key}>
                    <td className="sticky left-0 z-10 border-b border-border bg-muted/30 p-3 font-medium align-top">
                      {row.label}
                    </td>
                    {selectedTrees.map((tree) => (
                      <td
                        key={`${tree.slug}-${row.key}`}
                        className="border-b border-border p-3 text-center align-top"
                      >
                        {row.render(tree)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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
