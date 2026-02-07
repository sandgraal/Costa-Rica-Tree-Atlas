"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import {
  getEventsForMonth,
  getEventTranslation,
  EVENT_TYPE_COLORS,
  type CostaRicaEvent,
} from "@/lib/costaRicaEvents";

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
  const [showEvents, setShowEvents] = useState(true);
  const [shareTooltip, setShareTooltip] = useState<string | null>(null);

  const labels = useMemo(
    () => ({
      title:
        locale === "es" ? "Calendario de Costa Rica" : "Costa Rica Calendar",
      subtitle:
        locale === "es"
          ? "Floración, fructificación, eventos, festivales y más - tu guía completa para planificar"
          : "Flowering, fruiting, events, festivals & more - your complete planning guide",
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
      showEvents: locale === "es" ? "Mostrar eventos" : "Show events",
      hideEvents: locale === "es" ? "Ocultar eventos" : "Hide events",
      eventsAndHolidays:
        locale === "es" ? "Eventos y Festividades" : "Events & Holidays",
      share: locale === "es" ? "Compartir" : "Share",
      shareMonth: locale === "es" ? "Compartir este mes" : "Share this month",
      shareEvent: locale === "es" ? "Compartir evento" : "Share event",
      copied: locale === "es" ? "¡Enlace copiado!" : "Link copied!",
      tip: locale === "es" ? "Consejo" : "Tip",
      holiday: locale === "es" ? "Feriado" : "Holiday",
      environmental: locale === "es" ? "Ambiental" : "Environmental",
      cultural: locale === "es" ? "Cultural" : "Cultural",
      festival: locale === "es" ? "Festival" : "Festival",
      agricultural: locale === "es" ? "Agrícola" : "Agricultural",
      tourism: locale === "es" ? "Turismo" : "Tourism",
      school: locale === "es" ? "Escolar" : "School",
      weather: locale === "es" ? "Clima" : "Weather",
      planYourVisit:
        locale === "es" ? "Planifica tu Visita" : "Plan Your Visit",
      officialHoliday: locale === "es" ? "Feriado Oficial" : "Official Holiday",
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

  // Get events for selected month
  const eventsInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    return getEventsForMonth(selectedMonth);
  }, [selectedMonth]);

  // Count trees per month for calendar heatmap
  const monthCounts = useMemo(() => {
    const counts: Record<
      string,
      { flowering: number; fruiting: number; events: number }
    > = {};

    for (const month of MONTHS) {
      counts[month] = { flowering: 0, fruiting: 0, events: 0 };

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

      // Count events
      counts[month].events = getEventsForMonth(month).length;
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

  // Share functionality
  const handleShareMonth = useCallback(
    async (month: string) => {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const shareUrl = `${baseUrl}/${locale}/seasonal?month=${month}`;
      const monthName = fullMonthLabels[month];
      const shareText =
        locale === "es"
          ? `Descubre qué árboles de Costa Rica están floreciendo en ${monthName} 🌳🌸`
          : `Discover which Costa Rican trees are flowering in ${monthName} 🌳🌸`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: `${monthName} - Costa Rica Tree Atlas`,
            text: shareText,
            url: shareUrl,
          });
        } catch {
          // User cancelled
        }
      } else {
        await copyToClipboard(shareUrl);
        setShareTooltip(month);
        setTimeout(() => {
          setShareTooltip(null);
        }, 2000);
      }
    },
    [locale, fullMonthLabels]
  );

  const handleShareEvent = useCallback(
    async (event: CostaRicaEvent) => {
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const shareUrl = `${baseUrl}/${locale}/seasonal?month=${event.month}&event=${event.id}`;
      const eventInfo = getEventTranslation(event.id, locale);
      const shareText =
        locale === "es"
          ? `${event.icon} ${eventInfo?.name || event.id} - Calendario de Árboles de Costa Rica`
          : `${event.icon} ${eventInfo?.name || event.id} - Costa Rica Tree Atlas`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: eventInfo?.name || event.id,
            text: shareText,
            url: shareUrl,
          });
        } catch {
          // User cancelled
        }
      } else {
        await copyToClipboard(shareUrl);
        setShareTooltip(event.id);
        setTimeout(() => setShareTooltip(null), 2000);
      }
    },
    [locale]
  );

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
            onClick={() => {
              setViewMode("calendar");
            }}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              viewMode === "calendar"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {labels.calendarView}
          </button>
          <button
            onClick={() => {
              setViewMode("list");
            }}
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
            onClick={() => {
              setFilterType("all");
            }}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filterType === "all"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {labels.all}
          </button>
          <button
            onClick={() => {
              setFilterType("flowering");
            }}
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
            onClick={() => {
              setFilterType("fruiting");
            }}
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

        {/* Events Toggle */}
        <button
          onClick={() => {
            setShowEvents(!showEvents);
          }}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors flex items-center gap-1.5 ${
            showEvents
              ? "bg-green-500 text-white border-green-500"
              : "border-border hover:bg-muted"
          }`}
        >
          <CalendarIcon className="h-4 w-4" />
          {showEvents ? labels.hideEvents : labels.showEvents}
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {MONTHS.map((month) => {
            const isSelected = selectedMonth === month;
            const counts = monthCounts[month];
            const floweringIntensity = counts.flowering / maxCount;
            const fruitingIntensity = counts.fruiting / maxCount;
            const hasEvents = counts.events > 0;

            return (
              <button
                key={month}
                onClick={() => {
                  setSelectedMonth(month);
                }}
                className={`relative p-3 rounded-lg border transition-all ${
                  isSelected
                    ? "ring-2 ring-primary border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="text-xs font-medium mb-2 flex items-center justify-center gap-1">
                  {monthLabels[month]}
                  {showEvents && hasEvents && (
                    <span className="text-green-500">•</span>
                  )}
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
                      <span className="text-[10px] px-1 rounded bg-pink-100 dark:bg-pink-900/50 text-foreground">
                        {counts.flowering}
                      </span>
                    )}
                  {(filterType === "all" || filterType === "fruiting") &&
                    counts.fruiting > 0 && (
                      <span className="text-[10px] px-1 rounded bg-orange-100 dark:bg-orange-900/50 text-foreground">
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
            onChange={(e) => {
              setSelectedMonth(e.target.value);
            }}
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <h3 className="text-xl font-semibold">
              {fullMonthLabels[selectedMonth]}
            </h3>
            <div className="relative">
              <button
                onClick={() => handleShareMonth(selectedMonth)}
                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                aria-label={labels.shareMonth}
                title={labels.shareMonth}
              >
                <ShareIcon className="h-4 w-4" />
              </button>
              {shareTooltip === selectedMonth && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap">
                  {labels.copied}
                </div>
              )}
            </div>
          </div>

          {/* Events Section */}
          {showEvents && eventsInMonth.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-5 border border-green-300 dark:border-green-800">
              <h4 className="flex items-center gap-2 text-lg font-medium text-green-900 dark:text-green-300 mb-4">
                <CalendarIcon className="h-5 w-5" />
                {labels.eventsAndHolidays}
                <span className="ml-auto text-sm font-normal">
                  {eventsInMonth.length}
                </span>
              </h4>
              <div className="grid gap-3">
                {eventsInMonth.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    locale={locale}
                    labels={labels}
                    shareTooltip={shareTooltip}
                    onShare={handleShareEvent}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Flowering Trees */}
            {(filterType === "all" || filterType === "flowering") && (
              <div className="bg-pink-100 dark:bg-pink-900/20 rounded-xl p-5 border border-pink-200 dark:border-pink-800">
                <h4 className="flex items-center gap-2 text-lg font-medium text-pink-800 dark:text-pink-300 mb-4">
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
              <div className="bg-orange-100 dark:bg-orange-900/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
                <h4 className="flex items-center gap-2 text-lg font-medium text-orange-800 dark:text-orange-300 mb-4">
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
      <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span>{labels.flowering}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>{labels.fruiting}</span>
        </div>
        {showEvents && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>{labels.eventsAndHolidays}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({
  event,
  locale,
  labels,
  shareTooltip,
  onShare,
}: {
  event: CostaRicaEvent;
  locale: string;
  labels: Record<string, string>;
  shareTooltip: string | null;
  onShare: (event: CostaRicaEvent) => void;
}) {
  const eventInfo = getEventTranslation(event.id, locale);
  const typeColors = EVENT_TYPE_COLORS[event.type];
  const typeLabel = labels[event.type] || event.type;

  if (!eventInfo) return null;

  return (
    <div
      className={`relative p-4 rounded-lg border bg-white/80 dark:bg-transparent ${typeColors.border}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{event.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h5 className={`font-medium ${typeColors.text}`}>
              {eventInfo.name}
            </h5>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeColors.bg} ${typeColors.text}`}
            >
              {typeLabel}
            </span>
            {event.isOfficial && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                {labels.officialHoliday}
              </span>
            )}
            {event.day && (
              <span className="text-xs text-muted-foreground ml-auto">
                {event.endDay ? `${event.day} - ${event.endDay}` : event.day}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-400">
            {eventInfo.description}
          </p>
          {eventInfo.tip && (
            <p className="mt-2 text-xs text-green-900 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded px-2 py-1">
              <span className="font-medium">💡 {labels.tip}:</span>{" "}
              {eventInfo.tip}
            </p>
          )}
          {event.relatedTrees && event.relatedTrees.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {event.relatedTrees.map((treeSlug) => (
                <Link
                  key={treeSlug}
                  href={`/${locale}/trees/${treeSlug}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300 hover:bg-green-300 dark:hover:bg-green-800/50 transition-colors"
                >
                  🌳 {treeSlug}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              onShare(event);
            }}
            className="p-1.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
            aria-label={labels.shareEvent}
            title={labels.shareEvent}
          >
            <ShareIcon className="h-4 w-4 text-muted-foreground" />
          </button>
          {shareTooltip === event.id && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-10">
              {labels.copied}
            </div>
          )}
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
  const [imageError, setImageError] = useState(false);

  const isYearRound =
    type === "flowering"
      ? tree.floweringSeason?.includes("all-year")
      : tree.fruitingSeason?.includes("all-year");

  // Shared container styles for image and fallback
  const imageContainerClass =
    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0";

  return (
    <Link
      href={`/${locale}/trees/${tree.slug}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
    >
      <div className="w-10 h-10 relative rounded-lg overflow-hidden flex-shrink-0">
        <SafeImage
          src={tree.featuredImage || ""}
          alt={tree.title}
          fill
          sizes="40px"
          className="object-cover"
          fallback="hide"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{tree.title}</p>
        <p className="text-xs text-muted-foreground italic truncate">
          {tree.scientificName}
        </p>
      </div>
      {isYearRound && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300">
          {locale === "es" ? "Todo el año" : "Year-round"}
        </span>
      )}
    </Link>
  );
}

// Utility function for clipboard
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    }
  } catch {
    return false;
  }
}

// Icons
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
