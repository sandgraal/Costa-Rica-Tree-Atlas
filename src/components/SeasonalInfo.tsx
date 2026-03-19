"use client";

import { useTranslations } from "next-intl";
import { getMonthLabel as getSharedMonthLabel } from "@/lib/i18n";
import type { Month } from "@/types/tree";

interface SeasonalInfoProps {
  floweringSeason?: string[];
  fruitingSeason?: string[];
  locale: string;
}

const MONTHS_ORDER: Month[] = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

type MonthToken = Month | "all-year";

function normalizeMonthToken(raw: string): MonthToken | null {
  // Normalize known non-canonical tokens from content
  const value = raw === "todo-el-ano" ? "all-year" : raw;

  if (value === "all-year") {
    return "all-year";
  }

  if ((MONTHS_ORDER as string[]).includes(value)) {
    return value as Month;
  }

  return null;
}

function getLabel(locale: string, month: string): string {
  const safeLocale = locale === "es" ? "es" : "en";
  const normalized = normalizeMonthToken(month);

  if (!normalized) {
    return month;
  }

  const label = getSharedMonthLabel(normalized as Month, safeLocale, "short");
  return label ?? month;
}

export function SeasonalInfo({
  floweringSeason,
  fruitingSeason,
  locale,
}: SeasonalInfoProps) {
  const t = useTranslations("seasonal");

  const hasFlowering = floweringSeason && floweringSeason.length > 0;
  const hasFruiting = fruitingSeason && fruitingSeason.length > 0;

  if (!hasFlowering && !hasFruiting) {
    return null;
  }

  const formatSeason = (months: string[]): string => {
    // Handle "all year" seasons, including non-canonical tokens
    if (months.some((month) => normalizeMonthToken(month) === "all-year")) {
      return getLabel(locale, "all-year");
    }

    // Sort months by calendar order
    const getCalendarIndex = (month: string): number => {
      const normalized = normalizeMonthToken(month);

      if (!normalized || normalized === "all-year") {
        return Number.POSITIVE_INFINITY;
      }

      return MONTHS_ORDER.indexOf(normalized as Month);
    };

    const sorted = [...months].sort(
      (a, b) => getCalendarIndex(a) - getCalendarIndex(b)
    );

    // Group consecutive months
    const groups: string[][] = [];
    let currentGroup: string[] = [];
    let previousMonth: Month | undefined;

    for (const rawMonth of sorted) {
      const normalized = normalizeMonthToken(rawMonth);

      // Skip unknown tokens and "all-year" here; they are handled separately
      if (!normalized || normalized === "all-year") {
        continue;
      }

      if (
        previousMonth &&
        MONTHS_ORDER.indexOf(normalized as Month) -
          MONTHS_ORDER.indexOf(previousMonth) ===
          1
      ) {
        currentGroup.push(normalized);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [normalized];
      }
      previousMonth = normalized as Month;
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Format groups
    return groups
      .map((group) => {
        if (group.length === 1) {
          return getLabel(locale, group[0]);
        }
        return `${getLabel(locale, group[0])}-${getLabel(
          locale,
          group[group.length - 1]
        )}`;
      })
      .join(", ");
  };

  return (
    <div className="bg-muted rounded-xl p-5 mb-8">
      <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-2">
        <CalendarIcon className="h-5 w-5" />
        {t("seasonLabel")}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Flowering Season */}
        {hasFlowering && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <FlowerIcon className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("flowering")}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatSeason(floweringSeason!)}
              </p>
            </div>
          </div>
        )}

        {/* Fruiting Season */}
        {hasFruiting && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <FruitIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("fruiting")}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatSeason(fruitingSeason!)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Month Timeline */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex gap-0.5">
          {MONTHS_ORDER.map((month) => {
            const isFlowering =
              hasFlowering &&
              (floweringSeason?.includes(month) ||
                floweringSeason?.includes("all-year"));
            const isFruiting =
              hasFruiting &&
              (fruitingSeason?.includes(month) ||
                fruitingSeason?.includes("all-year"));

            return (
              <div key={month} className="flex-1 text-center">
                <div className="text-[9px] text-muted-foreground mb-1">
                  {getLabel(locale, month)}
                </div>
                <div className="space-y-0.5">
                  <div
                    className={`h-2 rounded-sm ${
                      isFlowering
                        ? "bg-pink-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    title={isFlowering ? t("inFlower") : ""}
                  />
                  <div
                    className={`h-2 rounded-sm ${
                      isFruiting
                        ? "bg-orange-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    title={isFruiting ? t("inFruit") : ""}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-pink-500" />
            {t("flowers")}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-orange-500" />
            {t("fruits")}
          </span>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function FlowerIcon({ className }: { className?: string }) {
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
      <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function FruitIcon({ className }: { className?: string }) {
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
      <path d="M17.5 6.5c0 2.5-2.5 5-5 5s-5-2.5-5-5" />
      <path d="M12 2v4" />
      <path d="M12 11.5c-4.5 0-7.5 3-7.5 8.5h15c0-5.5-3-8.5-7.5-8.5z" />
    </svg>
  );
}
