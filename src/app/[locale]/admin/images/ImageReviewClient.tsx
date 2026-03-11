"use client";
/* eslint-disable security/detect-object-injection -- admin image-review maps are keyed by controlled tree slugs and filter enums. */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@i18n/navigation";
import { useTranslations } from "next-intl";

interface TreeImageData {
  slug: string;
  title: string;
  scientificName: string;
  family: string;
  featuredImage: string | null;
  hasPlaceholder: boolean;
  hasLocalImage: boolean;
}

interface ImageReviewClientProps {
  trees: TreeImageData[];
}

interface ImageVote {
  slug: string;
  vote: "up" | "down";
}

type FilterType =
  | "all"
  | "placeholder"
  | "external"
  | "local"
  | "voted-up"
  | "voted-down";

export default function ImageReviewClient({ trees }: ImageReviewClientProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [votes, setVotes] = useState<Record<string, ImageVote>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTree, setSelectedTree] = useState<TreeImageData | null>(null);
  const [alternateImages, setAlternateImages] = useState<
    Array<{ url: string; attribution: string }>
  >([]);
  const [loadingAlternates, setLoadingAlternates] = useState(false);
  const [loadingVotes, setLoadingVotes] = useState(true);
  const [savingVote, setSavingVote] = useState<string | null>(null);
  const t = useTranslations("admin.images");

  // Load votes from server
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await fetch("/api/admin/image-votes");
        if (response.ok) {
          const data = await response.json();
          const serverVotes: Record<string, ImageVote> = {};
          for (const [slug, v] of Object.entries(
            data.data.votes as Record<string, { vote: "up" | "down" }>
          )) {
            serverVotes[slug] = { slug, vote: v.vote };
          }
          setVotes(serverVotes);
        }
      } catch (e) {
        console.error("Failed to load votes:", e);
      } finally {
        setLoadingVotes(false);
      }
    };

    void fetchVotes();
  }, []);

  // Save vote to server
  const saveVote = useCallback(
    async (slug: string, voteType: "up" | "down") => {
      setSavingVote(slug);
      // Optimistic update
      setVotes((prev) => ({
        ...prev,
        [slug]: { slug, vote: voteType },
      }));

      try {
        const response = await fetch("/api/admin/image-votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ treeSlug: slug, vote: voteType }),
        });

        if (!response.ok) {
          // Revert on failure
          setVotes((prev) => {
            const { [slug]: _removed, ...rest } = prev;
            return rest;
          });
          console.error("Failed to save vote:", response.statusText);
        }
      } catch (e) {
        // Revert on error
        setVotes((prev) => {
          const { [slug]: _removed, ...rest } = prev;
          return rest;
        });
        console.error("Failed to save vote:", e);
      } finally {
        setSavingVote(null);
      }
    },
    []
  );

  // Remove vote from server
  const removeVote = useCallback(async (slug: string) => {
    // Optimistic update
    setVotes((prev) => {
      const { [slug]: _removed, ...rest } = prev;
      return rest;
    });

    try {
      const response = await fetch("/api/admin/image-votes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ treeSlug: slug }),
      });

      if (!response.ok) {
        console.error("Failed to remove vote:", response.statusText);
      }
    } catch (e) {
      console.error("Failed to remove vote:", e);
    }
  }, []);

  // Filter trees
  const filteredTrees = trees.filter((tree) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !tree.title.toLowerCase().includes(query) &&
        !tree.scientificName.toLowerCase().includes(query) &&
        !tree.slug.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Category filter
    switch (filter) {
      case "placeholder":
        return tree.hasPlaceholder;
      case "external":
        return (
          !tree.hasPlaceholder && !tree.hasLocalImage && tree.featuredImage
        );
      case "local":
        return tree.hasLocalImage;
      case "voted-up":
        return votes[tree.slug]?.vote === "up";
      case "voted-down":
        return votes[tree.slug]?.vote === "down";
      default:
        return true;
    }
  });

  // Fetch alternate images from iNaturalist
  const fetchAlternateImages = async (scientificName: string) => {
    setLoadingAlternates(true);
    setAlternateImages([]);
    try {
      const response = await fetch(
        `/api/species/images?name=${encodeURIComponent(scientificName)}`
      );
      if (response.ok) {
        const data = await response.json();
        setAlternateImages(data.images || []);
      }
    } catch (error) {
      console.error("Failed to fetch alternate images:", error);
    }
    setLoadingAlternates(false);
  };

  const voteCounts = {
    up: Object.values(votes).filter((v) => v.vote === "up").length,
    down: Object.values(votes).filter((v) => v.vote === "down").length,
  };

  return (
    <div>
      {/* Loading indicator */}
      {loadingVotes && (
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
          {t("loadingVotes")}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as FilterType);
          }}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">{t("filterAll", { count: trees.length })}</option>
          <option value="placeholder">
            {t("filterNeedPhotos", {
              count: trees.filter((tr) => tr.hasPlaceholder).length,
            })}
          </option>
          <option value="external">
            {t("filterExternal", {
              count: trees.filter(
                (tr) =>
                  !tr.hasPlaceholder && !tr.hasLocalImage && tr.featuredImage
              ).length,
            })}
          </option>
          <option value="local">
            {t("filterLocal", {
              count: trees.filter((tr) => tr.hasLocalImage).length,
            })}
          </option>
          <option value="voted-up">
            {t("filterVotedUp", { count: voteCounts.up })}
          </option>
          <option value="voted-down">
            {t("filterVotedDown", { count: voteCounts.down })}
          </option>
        </select>

        {/* Vote summary */}
        {(voteCounts.up > 0 || voteCounts.down > 0) && (
          <span className="text-sm text-muted-foreground">
            👍 {voteCounts.up} · 👎 {voteCounts.down}
          </span>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {t("showingResults", {
          shown: filteredTrees.length,
          total: trees.length,
        })}
      </p>

      {/* Tree Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTrees.map((tree) => (
          <TreeImageCard
            key={tree.slug}
            tree={tree}
            vote={votes[tree.slug]}
            onVote={(voteValue) => {
              void saveVote(tree.slug, voteValue);
            }}
            isSaving={savingVote === tree.slug}
            onRemoveVote={() => {
              void removeVote(tree.slug);
            }}
            onSelectForAlternates={() => {
              setSelectedTree(tree);
              void fetchAlternateImages(tree.scientificName);
            }}
          />
        ))}
      </div>

      {/* Alternate Images Modal */}
      {selectedTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedTree.title}
                  </h2>
                  <p className="text-sm text-muted-foreground italic">
                    {selectedTree.scientificName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTree(null);
                  }}
                  className="text-muted-foreground hover:text-foreground text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Current Image */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t("currentImage")}
                </h3>
                {selectedTree.featuredImage && !selectedTree.hasPlaceholder ? (
                  <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden bg-muted">
                    <Image
                      src={selectedTree.featuredImage}
                      alt={selectedTree.title}
                      fill
                      className="object-cover"
                      quality={75}
                      unoptimized={selectedTree.featuredImage.startsWith(
                        "http"
                      )}
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full max-w-md rounded-xl bg-muted flex items-center justify-center">
                    <span className="text-4xl opacity-30">🌳</span>
                  </div>
                )}
              </div>

              {/* Alternate Images from iNaturalist */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t("iNaturalistImages")}
                </h3>
                {loadingAlternates ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : alternateImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {alternateImages.map((img, idx) => (
                      <div key={idx} className="group relative">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                          <Image
                            src={img.url}
                            alt={`${selectedTree.title} photo ${idx + 1}`}
                            fill
                            className="object-cover"
                            quality={75}
                            unoptimized
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {img.attribution}
                        </p>
                        <button
                          onClick={() => {
                            // Copy URL to clipboard
                            void navigator.clipboard.writeText(img.url);
                            alert(t("urlCopied"));
                          }}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {t("copyUrl")}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-4">
                    {t("noAlternates")}{" "}
                    <a
                      href={`https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(selectedTree.scientificName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {t("iNaturalist")}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Individual tree card component
function TreeImageCard({
  tree,
  vote,
  onVote,
  onRemoveVote,
  onSelectForAlternates,
  isSaving,
}: {
  tree: TreeImageData;
  vote?: ImageVote;
  onVote: (vote: "up" | "down") => void;
  onRemoveVote: () => void;
  onSelectForAlternates: () => void;
  isSaving?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const t = useTranslations("admin.images");

  const statusBadge = tree.hasPlaceholder
    ? {
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        label: t("badgeNeedsPhoto"),
      }
    : tree.hasLocalImage
      ? {
          color:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          label: t("badgeLocal"),
        }
      : {
          color:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          label: t("badgeExternal"),
        };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted">
        {tree.featuredImage && !tree.hasPlaceholder && !imageError ? (
          <Image
            src={tree.featuredImage}
            alt={tree.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={75}
            unoptimized={tree.featuredImage.startsWith("http")}
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-20">🌳</span>
          </div>
        )}

        {/* Status badge */}
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}
        >
          {statusBadge.label}
        </span>

        {/* Vote badge */}
        {vote && (
          <span
            className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              vote.vote === "up"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {vote.vote === "up" ? "👍" : "👎"}
          </span>
        )}

        {/* Saving indicator */}
        {isSaving && (
          <div className="absolute top-2 right-2">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => {
              onVote("up");
            }}
            className={`p-3 rounded-full transition ${
              vote?.vote === "up"
                ? "bg-green-500 text-white"
                : "bg-white/20 hover:bg-green-500/80 text-white"
            }`}
            title={t("tooltipGoodImage")}
          >
            👍
          </button>
          <button
            onClick={() => {
              onVote("down");
            }}
            className={`p-3 rounded-full transition ${
              vote?.vote === "down"
                ? "bg-red-500 text-white"
                : "bg-white/20 hover:bg-red-500/80 text-white"
            }`}
            title={t("tooltipBadImage")}
          >
            👎
          </button>
          <button
            onClick={onSelectForAlternates}
            className="p-3 rounded-full bg-white/20 hover:bg-blue-500/80 text-white transition"
            title={t("tooltipFindAlternates")}
          >
            🔍
          </button>
          {vote && (
            <button
              onClick={onRemoveVote}
              className="p-3 rounded-full bg-white/20 hover:bg-gray-500/80 text-white transition"
              title={t("tooltipClearVote")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <Link
          href={`/trees/${tree.slug}`}
          className="font-semibold text-foreground hover:text-primary text-sm line-clamp-1"
        >
          {tree.title}
        </Link>
        <p className="text-xs text-muted-foreground italic line-clamp-1">
          {tree.scientificName}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">{tree.family}</p>
      </div>
    </div>
  );
}
