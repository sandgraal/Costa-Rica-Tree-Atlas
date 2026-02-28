"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";

interface TreeRatingProps {
  slug: string;
}

export function TreeRating({ slug }: TreeRatingProps) {
  const t = useTranslations("rating");
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRating = useCallback(async () => {
    try {
      const res = await fetch(`/api/trees/${slug}/rating`);
      if (!res.ok) return;
      const data = await res.json();
      setAverageRating(data.averageRating);
      setTotalRatings(data.totalRatings);
      setUserRating(data.userRating);
    } catch {
      // errors are handled in finally
    } finally {
      setLoaded(true);
    }
  }, [slug]);

  useEffect(() => {
    void fetchRating();
  }, [fetchRating]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleRate = async (rating: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/trees/${slug}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback(t("error"));
        return;
      }

      setUserRating(data.userRating);
      setAverageRating(data.averageRating);
      setTotalRatings(data.totalRatings);
      setFeedback(userRating ? t("updated") : t("thankYou"));

      // Clear feedback after 3 seconds
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loaded) {
    return <div className="bg-muted rounded-xl p-6 mb-8 animate-pulse h-24" />;
  }

  const displayRating = hoveredStar ?? userRating ?? 0;

  return (
    <section className="bg-card border border-border rounded-xl p-6 mb-8 no-print">
      <h3 className="text-lg font-semibold mb-3">{t("title")}</h3>

      {/* Average rating display */}
      {averageRating !== null && totalRatings > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                filled={star <= Math.round(averageRating)}
                className="h-5 w-5 text-amber-500"
              />
            ))}
          </div>
          <span className="text-sm font-medium">
            {t("averageRating", { rating: averageRating.toFixed(1) })}
          </span>
          <span className="text-sm text-muted-foreground">
            ({t("totalRatings", { count: totalRatings })})
          </span>
        </div>
      )}

      {/* No ratings yet */}
      {totalRatings === 0 && (
        <p className="text-sm text-muted-foreground mb-4">
          {t("totalRatings", { count: 0 })}
        </p>
      )}

      {/* User rating input */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {userRating ? t("yourRating") : t("rateThis")}
        </p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => void handleRate(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              disabled={isSubmitting}
              className="p-1 transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label={t(`stars.${star}` as Parameters<typeof t>[0])}
            >
              <StarIcon
                filled={star <= displayRating}
                className="h-7 w-7 text-amber-500 transition-colors"
              />
            </button>
          ))}
          {hoveredStar && (
            <span className="ml-2 text-sm text-muted-foreground">
              {t(`stars.${hoveredStar}` as Parameters<typeof t>[0])}
            </span>
          )}
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <p
          className={`mt-3 text-sm ${
            feedback === t("error")
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {feedback}
        </p>
      )}

      {/* Prompt */}
      <p className="mt-3 text-xs text-muted-foreground">{t("loginPrompt")}</p>
    </section>
  );
}

function StarIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}
