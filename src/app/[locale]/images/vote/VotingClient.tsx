"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@i18n/navigation";
import { useTranslations } from "next-intl";
import type { ImageType, ImageFlagReason } from "@/types/image-review";

interface TreeImageData {
  slug: string;
  title: string;
  scientificName: string;
  family: string;
  featuredImage: string;
  hasPlaceholder: boolean;
  hasLocalImage: boolean;
}

interface VotingClientProps {
  trees: TreeImageData[];
}

interface VoteStats {
  upvotes: number;
  downvotes: number;
  flags: number;
  userVote?: "up" | "down" | "flag";
}

const FLAG_REASONS: { value: ImageFlagReason; labelKey: string }[] = [
  { value: "MISLABELED", labelKey: "flagMislabeled" },
  { value: "POOR_QUALITY", labelKey: "flagPoorQuality" },
  { value: "WRONG_SPECIES", labelKey: "flagWrongSpecies" },
  { value: "INAPPROPRIATE", labelKey: "flagInappropriate" },
  { value: "COPYRIGHT", labelKey: "flagCopyright" },
  { value: "OTHER", labelKey: "flagOther" },
];

export default function VotingClient({ trees }: VotingClientProps) {
  const t = useTranslations("imageVoting");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedTrees, setVotedTrees] = useState<Set<string>>(new Set());
  const [voteStats, setVoteStats] = useState<Record<string, VoteStats>>({});
  const [loading, setLoading] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState<ImageFlagReason>("MISLABELED");
  const [flagNotes, setFlagNotes] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [sessionVoteCount, setSessionVoteCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Shuffle trees on mount for random order
  const [shuffledTrees, setShuffledTrees] = useState<TreeImageData[]>([]);

  useEffect(() => {
    // Shuffle array using Fisher-Yates algorithm
    const shuffled = [...trees];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledTrees(shuffled);

    // Load voted trees from sessionStorage
    try {
      const saved = sessionStorage.getItem("voted-trees");
      if (saved) {
        setVotedTrees(new Set(JSON.parse(saved)));
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [trees]);

  const currentTree = shuffledTrees[currentIndex];

  // Fetch vote stats for current tree
  useEffect(() => {
    if (!currentTree) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/images/vote?treeSlug=${currentTree.slug}&imageType=FEATURED`
        );
        if (response.ok) {
          const data = await response.json();
          setVoteStats((prev) => ({
            ...prev,
            [currentTree.slug]: data.data,
          }));
        }
      } catch {
        // Ignore fetch errors for stats
      }
    };

    if (!voteStats[currentTree.slug]) {
      fetchStats();
    }
  }, [currentTree, voteStats]);

  const submitVote = useCallback(
    async (isUpvote: boolean) => {
      if (!currentTree || loading) return;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/images/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            treeSlug: currentTree.slug,
            imageType: "FEATURED" as ImageType,
            isUpvote,
          }),
        });

        if (response.status === 503) {
          setError(t("errorNotInitialized"));
          return;
        }

        if (response.status === 429) {
          setError(t("errorRateLimit"));
          return;
        }

        if (!response.ok) {
          throw new Error("Vote failed");
        }

        // Mark as voted
        const newVoted = new Set(votedTrees);
        newVoted.add(currentTree.slug);
        setVotedTrees(newVoted);
        setSessionVoteCount((c) => c + 1);

        // Save to sessionStorage
        try {
          sessionStorage.setItem(
            "voted-trees",
            JSON.stringify(Array.from(newVoted))
          );
        } catch {
          // Ignore sessionStorage errors
        }

        // Update local stats
        setVoteStats((prev) => ({
          ...prev,
          [currentTree.slug]: {
            ...(prev[currentTree.slug] || {
              upvotes: 0,
              downvotes: 0,
              flags: 0,
            }),
            upvotes:
              (prev[currentTree.slug]?.upvotes || 0) + (isUpvote ? 1 : 0),
            downvotes:
              (prev[currentTree.slug]?.downvotes || 0) + (isUpvote ? 0 : 1),
            userVote: isUpvote ? "up" : "down",
          },
        }));

        // Show thank you briefly
        setShowThankYou(true);
        setTimeout(() => {
          setShowThankYou(false);
          // Move to next tree
          if (currentIndex < shuffledTrees.length - 1) {
            setCurrentIndex((i) => i + 1);
          }
        }, 800);
      } catch {
        setError(t("errorVoteFailed"));
      } finally {
        setLoading(false);
      }
    },
    [currentTree, currentIndex, shuffledTrees.length, loading, votedTrees, t]
  );

  const submitFlag = useCallback(async () => {
    if (!currentTree || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/images/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treeSlug: currentTree.slug,
          imageType: "FEATURED" as ImageType,
          isFlag: true,
          flagReason,
          flagNotes: flagNotes || undefined,
        }),
      });

      if (response.status === 503) {
        setError(t("errorNotInitialized"));
        return;
      }

      if (!response.ok) {
        throw new Error("Flag failed");
      }

      // Mark as voted
      const newVoted = new Set(votedTrees);
      newVoted.add(currentTree.slug);
      setVotedTrees(newVoted);
      setSessionVoteCount((c) => c + 1);

      // Update local stats
      setVoteStats((prev) => ({
        ...prev,
        [currentTree.slug]: {
          ...(prev[currentTree.slug] || { upvotes: 0, downvotes: 0, flags: 0 }),
          flags: (prev[currentTree.slug]?.flags || 0) + 1,
          userVote: "flag",
        },
      }));

      // Close dialog and show thank you
      setShowFlagDialog(false);
      setFlagNotes("");
      setShowThankYou(true);
      setTimeout(() => {
        setShowThankYou(false);
        if (currentIndex < shuffledTrees.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
      }, 800);
    } catch {
      setError(t("errorFlagFailed"));
    } finally {
      setLoading(false);
    }
  }, [
    currentTree,
    currentIndex,
    shuffledTrees.length,
    loading,
    votedTrees,
    flagReason,
    flagNotes,
    t,
  ]);

  const skipToNext = useCallback(() => {
    if (currentIndex < shuffledTrees.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, shuffledTrees.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (showFlagDialog) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
          e.preventDefault();
          submitVote(true);
          break;
        case "ArrowDown":
        case "s":
          e.preventDefault();
          submitVote(false);
          break;
        case "ArrowRight":
        case "d":
          e.preventDefault();
          skipToNext();
          break;
        case "ArrowLeft":
        case "a":
          e.preventDefault();
          goToPrevious();
          break;
        case "f":
          e.preventDefault();
          setShowFlagDialog(true);
          break;
        case "Escape":
          setShowFlagDialog(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [submitVote, skipToNext, goToPrevious, showFlagDialog]);

  if (shuffledTrees.length === 0) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("noImages")}</p>
        </div>
      </div>
    );
  }

  if (!currentTree) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl p-8">
            <span className="text-6xl mb-4 block">🎉</span>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
              {t("allDone")}
            </h2>
            <p className="text-green-700 dark:text-green-300 mb-4">
              {t("votedCount", { count: sessionVoteCount })}
            </p>
            <Link
              href="/trees"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {t("exploreTrees")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = voteStats[currentTree.slug];
  const hasVoted = votedTrees.has(currentTree.slug);

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("title")}
          </h1>
          <p className="text-muted-foreground mb-4">{t("description")}</p>
          <div className="text-sm text-muted-foreground">
            {t("progress", {
              current: currentIndex + 1,
              total: shuffledTrees.length,
            })}
            {sessionVoteCount > 0 && (
              <span className="ml-2 text-primary">
                • {t("sessionVotes", { count: sessionVoteCount })}
              </span>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-4 mb-6 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Thank you animation */}
        {showThankYou && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-green-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold animate-bounce">
              {t("thankYou")} 🙏
            </div>
          </div>
        )}

        {/* Main voting card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-muted">
            <Image
              src={currentTree.featuredImage}
              alt={currentTree.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
            {/* Image type badge */}
            <div className="absolute top-4 left-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentTree.hasLocalImage
                    ? "bg-green-500/90 text-white"
                    : "bg-amber-500/90 text-white"
                }`}
              >
                {currentTree.hasLocalImage
                  ? t("localImage")
                  : t("externalImage")}
              </span>
            </div>
            {/* Vote stats overlay */}
            {stats && (
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  👍 {stats.upvotes}
                </span>
                <span className="bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  👎 {stats.downvotes}
                </span>
                {stats.flags > 0 && (
                  <span className="bg-red-500/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    🚩 {stats.flags}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Tree info */}
          <div className="p-6">
            <Link
              href={`/trees/${currentTree.slug}`}
              className="hover:text-primary transition-colors"
            >
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {currentTree.title}
              </h2>
            </Link>
            <p className="text-muted-foreground italic mb-1">
              {currentTree.scientificName}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentTree.family}
            </p>
          </div>

          {/* Voting buttons */}
          <div className="px-6 pb-6">
            <p className="text-center text-muted-foreground mb-4">
              {t("votePrompt")}
            </p>

            {hasVoted ? (
              <div className="text-center py-4">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  ✓ {t("alreadyVoted")}
                </span>
                <button
                  onClick={skipToNext}
                  className="ml-4 text-primary hover:underline"
                >
                  {t("nextImage")} →
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Downvote */}
                <button
                  onClick={() => submitVote(false)}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-4 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl transition-colors disabled:opacity-50 text-lg font-medium"
                  title={t("downvoteTitle")}
                >
                  <span className="text-2xl">👎</span>
                  {t("needsBetter")}
                </button>

                {/* Upvote */}
                <button
                  onClick={() => submitVote(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-4 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-xl transition-colors disabled:opacity-50 text-lg font-medium"
                  title={t("upvoteTitle")}
                >
                  <span className="text-2xl">👍</span>
                  {t("looksGood")}
                </button>
              </div>
            )}

            {/* Secondary actions */}
            <div className="flex justify-center gap-4 mt-6 text-sm">
              <button
                onClick={() => setShowFlagDialog(true)}
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 flex items-center gap-1"
              >
                🚩 {t("reportProblem")}
              </button>
              <button
                onClick={skipToNext}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("skip")} →
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← {t("previous")}
          </button>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {shuffledTrees.length}
          </div>
          <button
            onClick={skipToNext}
            disabled={currentIndex >= shuffledTrees.length - 1}
            className="px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {t("next")} →
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{t("keyboardHint")}</p>
          <p className="mt-1 text-xs opacity-75">
            ↑/W = {t("upvote")} • ↓/S = {t("downvote")} • →/D = {t("skip")} • F
            = {t("flag")}
          </p>
        </div>

        {/* Flag dialog */}
        {showFlagDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {t("flagDialogTitle")}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t("flagDialogDescription")}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("flagReason")}
                  </label>
                  <select
                    value={flagReason}
                    onChange={(e) =>
                      setFlagReason(e.target.value as ImageFlagReason)
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    {FLAG_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {t(reason.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("flagNotes")} ({t("optional")})
                  </label>
                  <textarea
                    value={flagNotes}
                    onChange={(e) => setFlagNotes(e.target.value)}
                    placeholder={t("flagNotesPlaceholder")}
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFlagDialog(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={submitFlag}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "..." : t("submitFlag")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
