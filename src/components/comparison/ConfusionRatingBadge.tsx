import { getConfusionRatingConfig } from "@/lib/comparison";
import type { Locale } from "@/types/tree";

interface ConfusionRatingBadgeProps {
  rating: number;
  locale: Locale;
  variant?: "default" | "compact" | "detailed";
  showLabel?: boolean;
}

/**
 * Unified confusion rating badge component
 * Used across comparison list, detail pages, and MDX content
 */
export function ConfusionRatingBadge({
  rating,
  locale,
  variant = "default",
  showLabel = true,
}: ConfusionRatingBadgeProps) {
  const config = getConfusionRatingConfig(rating, locale);

  // Compact variant for list views
  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${config.bgColorClass} ${config.textColorClass} ${config.borderColorClass}`}
      >
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-1.5 h-3 rounded-sm ${
                level <= config.rating ? "bg-current" : "bg-current/20"
              }`}
            />
          ))}
        </div>
        {showLabel && <span>{config.shortLabel}</span>}
      </div>
    );
  }

  // Detailed variant for detail pages
  if (variant === "detailed") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {locale === "es" ? "Nivel de confusión:" : "Confusion level:"}
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-3 h-5 rounded-sm transition-colors ${
                level <= config.rating ? config.colorClass : "bg-border"
              }`}
            />
          ))}
        </div>
        {showLabel && (
          <span className="text-sm font-medium">{config.label}</span>
        )}
      </div>
    );
  }

  // Default variant for MDX content
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full not-prose">
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {locale === "es" ? "Nivel de confusión:" : "Confusion Level:"}
        </span>
      )}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`w-2 h-4 rounded-sm transition-colors ${
              level <= config.rating ? config.colorClass : "bg-border"
            }`}
          />
        ))}
      </div>
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </div>
  );
}
