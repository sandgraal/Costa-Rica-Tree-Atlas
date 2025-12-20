"use client";

import { Link } from "@i18n/navigation";
import { useFavorites } from "./FavoritesProvider";

interface FavoritesLinkProps {
  locale?: string;
}

/**
 * FavoritesLink - Navigation link to favorites page with count badge
 * Shows a heart icon with the number of saved favorites.
 */
export function FavoritesLink({ locale = "en" }: FavoritesLinkProps) {
  const { favorites } = useFavorites();
  const count = favorites.length;

  const label = locale === "es" ? "Favoritos" : "Favorites";

  return (
    <Link
      href="/favorites"
      className="relative inline-flex items-center text-foreground/80 hover:text-red-500 transition-colors"
      aria-label={`${label} (${count})`}
      title={label}
    >
      <HeartIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

function HeartIcon({ className }: { className?: string }) {
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
