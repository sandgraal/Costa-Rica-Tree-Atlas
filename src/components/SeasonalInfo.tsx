"use client";

interface SeasonalInfoProps {
  floweringSeason?: string[];
  fruitingSeason?: string[];
  locale: string;
}

const MONTH_LABELS: Record<string, Record<string, string>> = {
  en: {
    january: "Jan",
    february: "Feb",
    march: "Mar",
    april: "Apr",
    may: "May",
    june: "Jun",
    july: "Jul",
    august: "Aug",
    september: "Sep",
    october: "Oct",
    november: "Nov",
    december: "Dec",
    "all-year": "Year-round",
  },
  es: {
    january: "Ene",
    february: "Feb",
    march: "Mar",
    april: "Abr",
    may: "May",
    june: "Jun",
    july: "Jul",
    august: "Ago",
    september: "Sep",
    october: "Oct",
    november: "Nov",
    december: "Dic",
    "all-year": "Todo el año",
  },
};

const MONTHS_ORDER = [
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

export function SeasonalInfo({
  floweringSeason,
  fruitingSeason,
  locale,
}: SeasonalInfoProps) {
  const labels = MONTH_LABELS[locale] || MONTH_LABELS.en;

  const hasFlowering = floweringSeason && floweringSeason.length > 0;
  const hasFruiting = fruitingSeason && fruitingSeason.length > 0;

  if (!hasFlowering && !hasFruiting) {
    return null;
  }

  const formatSeason = (months: string[]): string => {
    if (months.includes("all-year")) {
      return labels["all-year"];
    }

    // Sort months by calendar order
    const sorted = [...months].sort(
      (a, b) => MONTHS_ORDER.indexOf(a) - MONTHS_ORDER.indexOf(b)
    );

    // Group consecutive months
    const groups: string[][] = [];
    let currentGroup: string[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const month = sorted[i];
      const prevMonth = sorted[i - 1];

      if (
        prevMonth &&
        MONTHS_ORDER.indexOf(month) - MONTHS_ORDER.indexOf(prevMonth) === 1
      ) {
        currentGroup.push(month);
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [month];
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    // Format groups
    return groups
      .map((group) => {
        if (group.length === 1) {
          return labels[group[0]];
        }
        return `${labels[group[0]]}-${labels[group[group.length - 1]]}`;
      })
      .join(", ");
  };

  return (
    <div className="bg-muted rounded-xl p-5 mb-8">
      <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-2">
        <CalendarIcon className="h-5 w-5" />
        {locale === "es" ? "Temporada" : "Season"}
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
                {locale === "es" ? "Floración" : "Flowering"}
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
                {locale === "es" ? "Fructificación" : "Fruiting"}
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
              (floweringSeason!.includes(month) ||
                floweringSeason!.includes("all-year"));
            const isFruiting =
              hasFruiting &&
              (fruitingSeason!.includes(month) ||
                fruitingSeason!.includes("all-year"));

            return (
              <div key={month} className="flex-1 text-center">
                <div className="text-[9px] text-muted-foreground mb-1">
                  {labels[month]}
                </div>
                <div className="space-y-0.5">
                  <div
                    className={`h-2 rounded-sm ${
                      isFlowering
                        ? "bg-pink-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    title={
                      isFlowering
                        ? locale === "es"
                          ? "En flor"
                          : "Flowering"
                        : ""
                    }
                  />
                  <div
                    className={`h-2 rounded-sm ${
                      isFruiting
                        ? "bg-orange-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                    title={
                      isFruiting
                        ? locale === "es"
                          ? "Con frutos"
                          : "Fruiting"
                        : ""
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-pink-500" />
            {locale === "es" ? "Flores" : "Flowers"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-orange-500" />
            {locale === "es" ? "Frutos" : "Fruits"}
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
