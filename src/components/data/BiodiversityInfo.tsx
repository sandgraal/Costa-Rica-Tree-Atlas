"use client";

import { useQuery, QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query-client";
import { biodiversityQueryKeys } from "@/lib/api/biodiversity";
import {
  CONSERVATION_CATEGORIES,
  POPULATION_TRENDS,
  getConservationLabel,
  getUILabel,
} from "@/lib/i18n";
import type {
  Locale,
  ConservationCategory,
  PopulationTrend,
  BiodiversityData,
} from "@/types/tree";

// ============================================================================
// Types
// ============================================================================

interface BiodiversityInfoProps {
  scientificName: string;
  locale: Locale;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Self-contained biodiversity data component.
 * Includes its own QueryClientProvider so it doesn't require a global provider,
 * keeping React Query out of every page's JS bundle.
 */
export function BiodiversityInfo(props: BiodiversityInfoProps) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BiodiversityInfoInner {...props} />
    </QueryClientProvider>
  );
}

function BiodiversityInfoInner({
  scientificName,
  locale,
}: BiodiversityInfoProps) {
  const { data, isLoading, isError } = useQuery<BiodiversityData>({
    queryKey: biodiversityQueryKeys.species(scientificName),
    queryFn: async () => {
      const response = await fetch(
        `/api/species?species=${encodeURIComponent(scientificName)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch biodiversity data");
      }
      return response.json();
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const labels = {
    title: locale === "es" ? "Datos de Biodiversidad" : "Biodiversity Data",
    observations:
      locale === "es"
        ? "Observaciones en Costa Rica"
        : "Observations in Costa Rica",
    globalRecords: getUILabel("globalRecords", locale),
    researchGrade: getUILabel("researchGrade", locale),
    loading: getUILabel("loading", locale),
    viewOn: locale === "es" ? "Ver en" : "View on",
  };

  if (isLoading) {
    return <BiodiversityInfoSkeleton />;
  }

  if (isError || !data) {
    return null;
  }

  const { gbif, inaturalist, iucn } = data;
  const inatObs = inaturalist?.observationsInCostaRica ?? 0;
  const gbifObs = gbif?.costaRicaOccurrences ?? 0;
  const globalObs = gbif?.globalOccurrences ?? 0;
  const researchGrade = inaturalist?.researchGradeCount ?? 0;
  const hasObservationData = inatObs > 0 || gbifObs > 0;
  const hasIUCNData = iucn?.category && iucn.category !== "NE";

  if (!hasObservationData && !hasIUCNData) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      {/* IUCN Conservation Status */}
      {hasIUCNData && iucn && (
        <ConservationStatus
          category={iucn.category}
          populationTrend={iucn.populationTrend}
          assessmentDate={iucn.assessmentDate}
          iucnUrl={iucn.iucnUrl}
          locale={locale}
        />
      )}

      {/* Observation Data */}
      {hasObservationData && (
        <div className="bg-muted rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            {labels.title}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* iNaturalist Costa Rica observations */}
            {inatObs > 0 && (
              <StatCard
                value={inatObs}
                label={labels.observations}
                sublabel="iNaturalist"
                colorClass="text-primary"
              />
            )}

            {/* Research grade count */}
            {researchGrade > 0 && (
              <StatCard
                value={researchGrade}
                label={labels.researchGrade}
                colorClass="text-green-600 dark:text-green-400"
              />
            )}

            {/* GBIF Costa Rica records */}
            {gbifObs > 0 && (
              <StatCard
                value={gbifObs}
                label="GBIF Costa Rica"
                colorClass="text-secondary"
              />
            )}

            {/* Global records */}
            {globalObs > 0 && (
              <StatCard
                value={globalObs}
                label={labels.globalRecords}
                colorClass="text-accent-dark dark:text-accent"
              />
            )}
          </div>

          {/* External links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground self-center">
              {labels.viewOn}:
            </span>
            {inaturalist && (
              <ExternalLink
                href={inaturalist.inatUrl}
                label="iNaturalist"
                color="#74ac00"
                icon={<INaturalistIcon />}
              />
            )}
            {gbif && (
              <ExternalLink
                href={gbif.gbifUrl}
                label="GBIF"
                color="#4e9a06"
                icon={<GBIFIcon />}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Conservation Status Component
// ============================================================================

interface ConservationStatusProps {
  category: ConservationCategory;
  populationTrend?: PopulationTrend;
  assessmentDate?: string;
  iucnUrl?: string;
  locale: Locale;
}

function ConservationStatus({
  category,
  populationTrend,
  assessmentDate,
  iucnUrl,
  locale,
}: ConservationStatusProps) {
  // Fallback to NE (Not Evaluated) if category is not recognized
  const catDef =
    CONSERVATION_CATEGORIES[category] ?? CONSERVATION_CATEGORIES.NE;
  // Only show population trend if it's a known value (not "unknown" or undefined)
  const trendDef =
    populationTrend && populationTrend !== "unknown"
      ? (POPULATION_TRENDS[populationTrend] ?? null)
      : null;

  const labels = {
    title:
      locale === "es"
        ? "Estado de Conservación UICN"
        : "IUCN Conservation Status",
    populationTrend:
      locale === "es" ? "Tendencia poblacional" : "Population trend",
    assessed: locale === "es" ? "Evaluado" : "Assessed",
    viewDetails:
      locale === "es" ? "Ver detalles en IUCN" : "View details on IUCN",
  };

  return (
    <div className="bg-muted rounded-xl p-6">
      <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-2">
        <ShieldIcon className="h-5 w-5" />
        {labels.title}
      </h3>

      <div className="flex flex-wrap items-center gap-4">
        {/* Status badge */}
        <div
          className="px-4 py-2 rounded-lg text-white font-bold flex items-center gap-2"
          style={{ backgroundColor: catDef.color }}
        >
          <span className="text-2xl">{catDef.code}</span>
          <span className="text-sm">
            {getConservationLabel(category, locale)}
          </span>
        </div>

        {/* Population trend */}
        {trendDef && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {labels.populationTrend}:
            </span>
            <span className="font-medium">
              {trendDef.icon} {trendDef.label[locale]}
            </span>
          </div>
        )}

        {/* Assessment date */}
        {assessmentDate && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{labels.assessed}:</span>
            <span className="font-medium">{assessmentDate}</span>
          </div>
        )}

        {/* IUCN link */}
        {iucnUrl && (
          <a
            href={iucnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {labels.viewDetails}
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Conservation scale */}
      <div className="mt-4 pt-4 border-t border-border">
        <ConservationScale currentCategory={category} locale={locale} />
      </div>
    </div>
  );
}

// ============================================================================
// Conservation Scale Component
// ============================================================================

function ConservationScale({
  currentCategory,
  locale,
}: {
  currentCategory: ConservationCategory;
  locale: Locale;
}) {
  const categories: ConservationCategory[] = [
    "LC",
    "NT",
    "VU",
    "EN",
    "CR",
    "EW",
    "EX",
  ];

  return (
    <div className="flex items-center gap-1">
      {categories.map((cat) => {
        const def = CONSERVATION_CATEGORIES[cat] ?? CONSERVATION_CATEGORIES.NE;
        const isActive = cat === currentCategory;

        return (
          <div
            key={cat}
            className={`flex-1 h-8 flex items-center justify-center text-xs font-bold transition-all ${
              isActive
                ? "ring-2 ring-offset-2 ring-gray-800 dark:ring-white"
                : "opacity-60"
            }`}
            style={{
              backgroundColor: def.color,
              color:
                cat === "VU" || cat === "NT" || cat === "LC" ? "#000" : "#fff",
            }}
            title={getConservationLabel(cat, locale)}
          >
            {cat}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function StatCard({
  value,
  label,
  sublabel,
  colorClass,
}: {
  value: number;
  label: string;
  sublabel?: string;
  colorClass: string;
}) {
  return (
    <div className="text-center p-4 bg-background rounded-lg">
      <p className={`text-3xl font-bold ${colorClass}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sublabel && (
        <p className="text-[10px] text-muted-foreground/60">{sublabel}</p>
      )}
    </div>
  );
}

function ExternalLink({
  href,
  label,
  color,
  icon,
}: {
  href: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors"
      style={{
        backgroundColor: `${color}1a`,
        color: color,
      }}
    >
      {icon}
      {label}
      <ExternalLinkIcon className="h-3 w-3" />
    </a>
  );
}

function BiodiversityInfoSkeleton() {
  return (
    <div className="bg-muted rounded-xl p-6 mb-8 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function INaturalistIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function GBIFIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
