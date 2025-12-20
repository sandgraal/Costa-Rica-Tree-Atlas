"use client";

import { useEffect, useState } from "react";
import type { BiodiversityData } from "@/app/api/species/route";
import {
  ConservationStatus,
  ConservationScale,
} from "../ConservationStatus";

interface BiodiversityInfoProps {
  scientificName: string;
  locale: string;
}

export function BiodiversityInfo({
  scientificName,
  locale,
}: BiodiversityInfoProps) {
  const [data, setData] = useState<BiodiversityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/species?species=${encodeURIComponent(scientificName)}`
        );
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [scientificName]);

  const labels = {
    title: locale === "es" ? "Datos de Biodiversidad" : "Biodiversity Data",
    observations:
      locale === "es"
        ? "Observaciones en Costa Rica"
        : "Observations in Costa Rica",
    globalRecords: locale === "es" ? "Registros globales" : "Global records",
    researchGrade:
      locale === "es" ? "Grado de investigación" : "Research grade",
    viewOn: locale === "es" ? "Ver en" : "View on",
    loading: locale === "es" ? "Cargando datos..." : "Loading data...",
    noData:
      locale === "es"
        ? "Sin datos de observación disponibles"
        : "No observation data available",
    source: locale === "es" ? "Fuentes de datos" : "Data sources",
  };

  if (loading) {
    return (
      <div className="bg-muted rounded-xl p-6 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || (!data?.gbif && !data?.inaturalist && !data?.iucn)) {
    return null; // Silently fail - don't show section if no data
  }

  const inatObs = data?.inaturalist?.observationsInCostaRica || 0;
  const gbifObs = data?.gbif?.costaRicaOccurrences || 0;
  const globalObs = data?.gbif?.globalOccurrences || 0;
  const researchGrade = data?.inaturalist?.researchGradeCount || 0;
  const hasObservationData = inatObs > 0 || gbifObs > 0;
  const hasIUCNData = data?.iucn?.category && data.iucn.category !== "NE";

  // Don't show if no data at all
  if (!hasObservationData && !hasIUCNData) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      {/* IUCN Conservation Status */}
      {hasIUCNData && data?.iucn && (
        <div>
          <ConservationStatus
            category={data.iucn.category}
            populationTrend={data.iucn.populationTrend}
            assessmentDate={data.iucn.assessmentDate}
            iucnUrl={data.iucn.iucnUrl}
            locale={locale}
          />
          <ConservationScale
            currentCategory={data.iucn.category}
            locale={locale}
          />
        </div>
      )}

      {/* Biodiversity Observation Data */}
      {hasObservationData && (
        <div className="bg-muted rounded-xl p-6">
          <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5" />
            {labels.title}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* iNaturalist Costa Rica observations */}
            {inatObs > 0 && (
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-primary">
                  {inatObs.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {labels.observations}
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  iNaturalist
                </p>
              </div>
            )}

            {/* Research grade count */}
            {researchGrade > 0 && (
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {researchGrade.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {labels.researchGrade}
                </p>
              </div>
            )}

            {/* GBIF Costa Rica records */}
            {gbifObs > 0 && (
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-secondary">
                  {gbifObs.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  GBIF Costa Rica
                </p>
              </div>
            )}

            {/* Global records */}
            {globalObs > 0 && (
              <div className="text-center p-4 bg-background rounded-lg">
                <p className="text-3xl font-bold text-accent-dark dark:text-accent">
                  {globalObs.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {labels.globalRecords}
                </p>
              </div>
            )}
          </div>

          {/* External links */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground self-center">
              {labels.viewOn}:
            </span>
            {data?.inaturalist && (
              <a
                href={data.inaturalist.inatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#74ac00]/10 text-[#74ac00] hover:bg-[#74ac00]/20 rounded-full transition-colors"
              >
                <INaturalistIcon className="h-3.5 w-3.5" />
                iNaturalist
                <ExternalLinkIcon className="h-3 w-3" />
              </a>
            )}
            {data?.gbif && (
              <a
                href={data.gbif.gbifUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#4e9a06]/10 text-[#4e9a06] hover:bg-[#4e9a06]/20 rounded-full transition-colors"
              >
                <GBIFIcon className="h-3.5 w-3.5" />
                GBIF
                <ExternalLinkIcon className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
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
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function INaturalistIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
    </svg>
  );
}

function GBIFIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
