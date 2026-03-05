"use client";

import { useStore } from "@/lib/store";
import { useTranslations } from "next-intl";

interface FavoriteButtonProps {
  slug: string;
  title: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

function getButtonSizeClass(size: "sm" | "md" | "lg"): string {
  switch (size) {
    case "sm":
      return "p-1.5";
    case "lg":
      return "p-2.5";
    case "md":
    default:
      return "p-2";
  }
}

function getIconSizeClass(size: "sm" | "md" | "lg"): string {
  switch (size) {
    case "sm":
      return "h-4 w-4";
    case "lg":
      return "h-6 w-6";
    case "md":
    default:
      return "h-5 w-5";
  }
}

/**
 * FavoriteButton - Add/remove trees from favorites list
 * Uses localStorage for persistence without requiring authentication.
 */
export function FavoriteButton({
  slug,
  title,
  size = "md",
  showLabel = false,
  className = "",
}: FavoriteButtonProps) {
  const t = useTranslations("favorites");
  const hydrated = useStore((state) => state._hydrated);
  const favorites = useStore((state) => state.favorites);
  const toggleFavorite = useStore((state) => state.toggleFavorite);

  // Only check favorites after hydration to prevent mismatch
  const favorited = hydrated ? favorites.includes(slug) : false;

  const labels = {
    add: t("addToFavorites"),
    remove: t("removeFromFavorites"),
    addShort: t("favorite"),
    removeShort: t("saved"),
  };

  const sizeClass = getButtonSizeClass(size);
  const iconSizeClass = getIconSizeClass(size);

  const ariaLabel = favorited
    ? `${labels.remove}: ${title}`
    : `${labels.add}: ${title}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(slug);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={favorited}
      title={favorited ? labels.remove : labels.add}
      className={`inline-flex items-center gap-1.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        favorited
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-red-400"
      } ${sizeClass} ${className}`}
    >
      {favorited ? (
        <HeartFilledIcon className={iconSizeClass} />
      ) : (
        <HeartOutlineIcon className={iconSizeClass} />
      )}
      {showLabel && (
        <span className="text-sm font-medium">
          {favorited ? labels.removeShort : labels.addShort}
        </span>
      )}
    </button>
  );
}

function HeartOutlineIcon({ className }: { className?: string }) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function HeartFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
