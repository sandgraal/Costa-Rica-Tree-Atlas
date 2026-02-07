"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@i18n/navigation";

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
  imageUrl: string;
  timestamp: number;
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

  // Load votes from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedVotes = localStorage.getItem("tree-image-votes");
      if (savedVotes) {
        setVotes(JSON.parse(savedVotes));
      }
    } catch (e) {
      console.error("Failed to parse image votes:", e);
    }
  }, []);

  // Save votes to localStorage
  const saveVote = (
    slug: string,
    voteType: "up" | "down",
    imageUrl: string
  ) => {
    setVotes((prevVotes) => {
      const newVotes = {
        ...prevVotes,
        [slug]: {
          slug,
          vote: voteType,
          imageUrl,
          timestamp: performance.now(),
        },
      };
      try {
        localStorage.setItem("tree-image-votes", JSON.stringify(newVotes));
      } catch (e) {
        console.error("Failed to save vote:", e);
      }
      return newVotes;
    });
  };

  const removeVote = (slug: string) => {
    if (!Object.hasOwn(votes, slug)) return;
    // Use destructuring to safely remove property without triggering object injection warning
    const { [slug]: _removed, ...newVotes } = votes;
    setVotes(newVotes);
    try {
      localStorage.setItem("tree-image-votes", JSON.stringify(newVotes));
    } catch (e) {
      console.error("Failed to save votes after removal:", e);
    }
  };

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

  // Export votes for processing
  const exportVotes = () => {
    const upvoted = Object.values(votes).filter((v) => v.vote === "up");
    const downvoted = Object.values(votes).filter((v) => v.vote === "down");

    const exportData = {
      upvoted,
      downvoted,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tree-image-votes-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const voteCounts = {
    up: Object.values(votes).filter((v) => v.vote === "up").length,
    down: Object.values(votes).filter((v) => v.vote === "down").length,
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search trees..."
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
          <option value="all">All Trees ({trees.length})</option>
          <option value="placeholder">
            🔴 Need Photos ({trees.filter((t) => t.hasPlaceholder).length})
          </option>
          <option value="external">
            🟡 External URLs (
            {
              trees.filter(
                (t) => !t.hasPlaceholder && !t.hasLocalImage && t.featuredImage
              ).length
            }
            )
          </option>
          <option value="local">
            🟢 Local Images ({trees.filter((t) => t.hasLocalImage).length})
          </option>
          <option value="voted-up">👍 Voted Up ({voteCounts.up})</option>
          <option value="voted-down">👎 Voted Down ({voteCounts.down})</option>
        </select>

        {/* Export */}
        {(voteCounts.up > 0 || voteCounts.down > 0) && (
          <button
            onClick={exportVotes}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Export Votes ({voteCounts.up + voteCounts.down})
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredTrees.length} of {trees.length} trees
      </p>

      {/* Tree Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTrees.map((tree) => (
          <TreeImageCard
            key={tree.slug}
            tree={tree}
            vote={votes[tree.slug]}
            onVote={(voteValue) => {
              if (tree.featuredImage) {
                saveVote(tree.slug, voteValue, tree.featuredImage);
              }
            }}
            onRemoveVote={() => {
              removeVote(tree.slug);
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
                  Current Image
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
                  iNaturalist Images (Costa Rica)
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
                            alert("Image URL copied to clipboard!");
                          }}
                          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Copy URL
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-4">
                    No alternate images found. Try searching on{" "}
                    <a
                      href={`https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(selectedTree.scientificName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      iNaturalist
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
}: {
  tree: TreeImageData;
  vote?: ImageVote;
  onVote: (vote: "up" | "down") => void;
  onRemoveVote: () => void;
  onSelectForAlternates: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  const statusBadge = tree.hasPlaceholder
    ? {
        color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        label: "Needs Photo",
      }
    : tree.hasLocalImage
      ? {
          color:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          label: "Local",
        }
      : {
          color:
            "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          label: "External",
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
            title="Good image - save locally"
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
            title="Bad image - needs replacement"
          >
            👎
          </button>
          <button
            onClick={onSelectForAlternates}
            className="p-3 rounded-full bg-white/20 hover:bg-blue-500/80 text-white transition"
            title="Find alternate images"
          >
            🔍
          </button>
          {vote && (
            <button
              onClick={onRemoveVote}
              className="p-3 rounded-full bg-white/20 hover:bg-gray-500/80 text-white transition"
              title="Clear vote"
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
