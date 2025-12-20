"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

interface TreeSeasonData {
  title: string;
  slug: string;
  scientificName: string;
  featuredImage?: string;
  floweringSeason?: string[];
  fruitingSeason?: string[];
}

interface SeasonalCalendarProps {
  trees: TreeSeasonData[];
  locale: string;
}

const MONTHS = [
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
  },
};

const FULL_MONTH_LABELS: Record<string, Record<string, string>> = {
  en: {
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
  },
  es: {
    january: "Enero",
    february: "Febrero",
    march: "Marzo",
    april: "Abril",
    may: "Mayo",
    june: "Junio",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
    october: "Octubre",
    november: "Noviembre",
    december: "Diciembre",
  },
};

type ViewMode = "calendar" | "list";
type FilterType = "all" | "flowering" | "fruiting";

export function SeasonalCalendar({ trees, locale }: SeasonalCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(
    () => MONTHS[new Date().getMonth()]
  );
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const labels = useMemo(
    () => ({
      title:
        locale === "es"
          ? "Calendario de Floración y Fructificación"
          : "Flowering & Fruiting Calendar",
      subtitle:
        locale === "es"
          ? "Descubre qué árboles están floreciendo o dando frutos cada mes"
          : "Discover which trees are flowering or fruiting each month",
      flowering: locale === "es" ? "Floración" : "Flowering",
      fruiting: locale === "es" ? "Fructificación" : "Fruiting",
      all: locale === "es" ? "Todo" : "All",
      yearRound: locale === "es" ? "Todo el año" : "Year-round",
      treesFlowering: locale === "es" ? "árboles en flor" : "trees flowering",
      treesFruiting: locale === "es" ? "árboles con frutos" : "trees fruiting",
      calendarView: locale === "es" ? "Vista Calendario" : "Calendar View",
      listView: locale === "es" ? "Vista Lista" : "List View",
      selectMonth:
        locale === "es"
          ? "Selecciona un mes para ver qué árboles están activos"
          : "Select a month to see which trees are active",
      previousMonth: locale === "es" ? "Mes anterior" : "Previous month",
      nextMonth: locale === "es" ? "Mes siguiente" : "Next month",
      noTrees:
        locale === "es"
          ? "No hay árboles con datos de temporada disponibles"
          : "No trees with seasonal data available",
    }),
    [locale]
  );

  const monthLabels = MONTH_LABELS[locale] || MONTH_LABELS.en;
  const fullMonthLabels = FULL_MONTH_LABELS[locale] || FULL_MONTH_LABELS.en;

  // Filter trees with seasonal data
  const treesWithSeasonData = useMemo(
    () =>
      trees.filter(
        (tree) =>
          (tree.floweringSeason && tree.floweringSeason.length > 0) ||
          (tree.fruitingSeason && tree.fruitingSeason.length > 0)
      ),
    [trees]
  );

  // Get trees active in selected month
  const activeTreesInMonth = useMemo(() => {
    if (!selectedMonth) return { flowering: [], fruiting: [] };

    const flowering = treesWithSeasonData.filter((tree) => {
      if (!tree.floweringSeason) return false;
      return (
        tree.floweringSeason.includes(selectedMonth) ||
        tree.floweringSeason.includes("all-year")
      );
    });

    const fruiting = treesWithSeasonData.filter((tree) => {
      if (!tree.fruitingSeason) return false;
      return (
        tree.fruitingSeason.includes(selectedMonth) ||
        tree.fruitingSeason.includes("all-year")
      );
    });

    return { flowering, fruiting };
  }, [selectedMonth, treesWithSeasonData]);

  // Count trees per month for calendar heatmap
  const monthCounts = useMemo(() => {
    const counts: Record<string, { flowering: number; fruiting: number }> = {};

    for (const month of MONTHS) {
      counts[month] = { flowering: 0, fruiting: 0 };

      for (const tree of treesWithSeasonData) {
        if (
          tree.floweringSeason?.includes(month) ||
          tree.floweringSeason?.includes("all-year")
        ) {
          counts[month].flowering++;
        }
        if (
          tree.fruitingSeason?.includes(month) ||
          tree.fruitingSeason?.includes("all-year")
        ) {
          counts[month].fruiting++;
        }
      }
    }

    return counts;
  }, [treesWithSeasonData]);

  // Get max count for heatmap intensity
  const maxCount = useMemo(() => {
    let max = 0;
    for (const month of MONTHS) {
      max = Math.max(
        max,
        monthCounts[month].flowering,
        monthCounts[month].fruiting
      );
    }
    return max || 1;
  }, [monthCounts]);

  if (treesWithSeasonData.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {labels.noTrees}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {labels.title}
        </h2>
        <p className="text-muted-foreground">{labels.subtitle}</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* View Mode Toggle */}
        <div className="inline-flex rounded-lg border border-border p-1">
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === "calendar"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {labels.calendarView}
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {labels.listView}
          </button>
        </div>

        {/* Filter Type */}
        <div className="inline-flex rounded-lg border border-border p-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filterType === "all"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {labels.all}
          </button>
          <button
            onClick={() => setFilterType("flowering")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
              filterType === "flowering"
                ? "bg-pink-500 text-white"
                : "hover:bg-pink-50 dark:hover:bg-pink-900/20"
            }`}
          >
            <FlowerIcon className="h-4 w-4" />
            {labels.flowering}
          </button>
          <button
            onClick={() => setFilterType("fruiting")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
              filterType === "fruiting"
                ? "bg-orange-500 text-white"
                : "hover:bg-orange-50 dark:hover:bg-orange-900/20"
            }`}
          >
            <FruitIcon className="h-4 w-4" />
            {labels.fruiting}
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {MONTHS.map((month) => {
            const isSelected = selectedMonth === month;
            const counts = monthCounts[month];
            const floweringIntensity = counts.flowering / maxCount;
            const fruitingIntensity = counts.fruiting / maxCount;

            return (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`relative p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "ring-2 ring-primary border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-xs font-medium mb-2">
                  {monthLabels[month]}
                </div>

                {/* Intensity bars */}
                <div className="space-y-1">
                  {(filterType === "all" || filterType === "flowering") && (
                    <div
                      className="h-1.5 rounded-full bg-pink-200 dark:bg-pink-900"
                      title={`${counts.flowering} ${labels.treesFlowering}`}
                    >
                      <div
                        className="h-full rounded-full bg-pink-500 transition-all"
                        style={{ width: `${floweringIntensity * 100}%` }}
                      />
                    </div>
                  )}
                  {(filterType === "all" || filterType === "fruiting") && (
                    <div
                      className="h-1.5 rounded-full bg-orange-200 dark:bg-orange-900"
                      title={`${counts.fruiting} ${labels.treesFruiting}`}
                    >
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all"
                        style={{ width: `${fruitingIntensity * 100}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Count badges */}
                <div className="flex justify-center gap-1 mt-2">
                  {(filterType === "all" || filterType === "flowering") &&
                    counts.flowering > 0 && (
                      <span className="text-[10px] px-1 rounded bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
                        {counts.flowering}
                      </span>
                    )}
                  {(filterType === "all" || filterType === "fruiting") &&
                    counts.fruiting > 0 && (
                      <span className="text-[10px] px-1 rounded bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300">
                        {counts.fruiting}
                      </span>
                    )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* List View Month Navigation */}
      {viewMode === "list" && selectedMonth && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              const currentIndex = MONTHS.indexOf(selectedMonth);
              const prevIndex = currentIndex === 0 ? 11 : currentIndex - 1;
              setSelectedMonth(MONTHS[prevIndex]);
            }}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label={labels.previousMonth}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium min-w-[150px] text-center appearance-none cursor-pointer hover:bg-muted transition-colors"
          >
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {fullMonthLabels[month]}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const currentIndex = MONTHS.indexOf(selectedMonth);
              const nextIndex = currentIndex === 11 ? 0 : currentIndex + 1;
              setSelectedMonth(MONTHS[nextIndex]);
            }}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label={labels.nextMonth}
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Selected Month Details */}
      {selectedMonth && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-center mb-6">
            {fullMonthLabels[selectedMonth]}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Flowering Trees */}
            {(filterType === "all" || filterType === "flowering") && (
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-5">
                <h4 className="flex items-center gap-2 text-lg font-medium text-pink-700 dark:text-pink-300 mb-4">
                  <FlowerIcon className="h-5 w-5" />
                  {labels.flowering}
                  <span className="ml-auto text-sm font-normal">
                    {activeTreesInMonth.flowering.length}
                  </span>
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {activeTreesInMonth.flowering.map((tree) => (
                    <TreeListItem
                      key={tree.slug}
                      tree={tree}
                      locale={locale}
                      type="flowering"
                    />
                  ))}
                  {activeTreesInMonth.flowering.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      {locale === "es"
                        ? "Sin árboles floreciendo este mes"
                        : "No trees flowering this month"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Fruiting Trees */}
            {(filterType === "all" || filterType === "fruiting") && (
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5">
                <h4 className="flex items-center gap-2 text-lg font-medium text-orange-700 dark:text-orange-300 mb-4">
                  <FruitIcon className="h-5 w-5" />
                  {labels.fruiting}
                  <span className="ml-auto text-sm font-normal">
                    {activeTreesInMonth.fruiting.length}
                  </span>
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {activeTreesInMonth.fruiting.map((tree) => (
                    <TreeListItem
                      key={tree.slug}
                      tree={tree}
                      locale={locale}
                      type="fruiting"
                    />
                  ))}
                  {activeTreesInMonth.fruiting.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      {locale === "es"
                        ? "Sin árboles fructificando este mes"
                        : "No trees fruiting this month"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span>{labels.flowering}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>{labels.fruiting}</span>
        </div>
      </div>
    </div>
  );
}

function TreeListItem({
  tree,
  locale,
  type,
}: {
  tree: TreeSeasonData;
  locale: string;
  type: "flowering" | "fruiting";
}) {
  const isYearRound =
    type === "flowering"
      ? tree.floweringSeason?.includes("all-year")
      : tree.fruitingSeason?.includes("all-year");

  return (
    <Link
      href={`/${locale}/trees/${tree.slug}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
    >
      {tree.featuredImage && (
        <div className="w-10 h-10 relative rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={tree.featuredImage}
            alt={tree.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{tree.title}</p>
        <p className="text-xs text-muted-foreground italic truncate">
          {tree.scientificName}
        </p>
      </div>
      {isYearRound && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
          {locale === "es" ? "Todo el año" : "Year-round"}
        </span>
      )}
    </Link>
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

function ChevronLeftIcon({ className }: { className?: string }) {
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
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
