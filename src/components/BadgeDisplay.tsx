"use client";

import { useTranslations } from "next-intl";
import { BADGE_DEFINITIONS, BADGE_MAP } from "@/lib/reputation";

interface BadgeInfo {
  badgeId: string;
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

interface BadgeDisplayProps {
  /** Array of earned badge objects from API */
  earnedBadges: BadgeInfo[];
  /** Compact mode — shows only earned badges inline */
  compact?: boolean;
  /** Next badge progress info */
  nextBadge?: {
    badge: { id: string; name: string; icon: string };
    progress: number;
    target: number;
  } | null;
}

export function BadgeDisplay({
  earnedBadges,
  compact = false,
  nextBadge,
}: BadgeDisplayProps) {
  const t = useTranslations("reputation.badges");
  const earnedIds = new Set(earnedBadges.map((b) => b.badgeId));

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {earnedBadges.map((badge) => (
          <span
            key={badge.badgeId}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-sm"
            title={badge.description}
          >
            <span aria-hidden="true">{badge.icon}</span>
            <span>{badge.name}</span>
          </span>
        ))}
        {earnedBadges.length === 0 && (
          <span className="text-sm text-muted-foreground italic">
            {t("locked")}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{t("title")}</h3>

      {/* Earned badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((badge) => {
          const isEarned = earnedIds.has(badge.id);
          return (
            <div
              key={badge.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                isEarned
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-muted/30 opacity-50"
              }`}
            >
              <span
                className={`text-2xl ${isEarned ? "" : "grayscale"}`}
                aria-hidden="true"
              >
                {badge.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    isEarned ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {t(badge.id as Parameters<typeof t>[0])}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {t(`${badge.id}_desc` as Parameters<typeof t>[0])}
                </p>
                {isEarned && (
                  <span className="inline-block mt-1 text-xs text-primary font-medium">
                    ✓ {t("earned")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next badge progress */}
      {nextBadge && (
        <div className="rounded-lg border border-border p-4 bg-card">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {t("nextBadge")}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">
              {nextBadge.badge.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {BADGE_MAP.get(nextBadge.badge.id)?.name ||
                  nextBadge.badge.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (nextBadge.progress / nextBadge.target) * 100)}%`,
                    }}
                    role="progressbar"
                    aria-valuenow={nextBadge.progress}
                    aria-valuemin={0}
                    aria-valuemax={nextBadge.target}
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {nextBadge.progress}/{nextBadge.target}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {earnedBadges.length === BADGE_DEFINITIONS.length && (
        <p className="text-center text-sm text-primary font-medium">
          🏆 {t("allEarned")}
        </p>
      )}
    </div>
  );
}
