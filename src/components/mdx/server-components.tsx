import React from "react";
import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/image";
import { ConfusionRatingBadge } from "@/components/comparison/ConfusionRatingBadge";
import { ComparisonTagPill } from "@/components/comparison/ComparisonTagPill";
import type { Locale } from "@/types/tree";

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

// Translation helper for legacy MDX components
// These translations are loaded from messages/{locale}.json
const translations = {
  en: {
    safety: {
      safetyOverview: "Safety Overview",
      safetyWarning: "Safety Warning",
      warnings: "Warnings",
      precautions: "Precautions",
      safe: "Safe",
      caution: "Caution",
      warning: "Warning",
      danger: "High Risk",
    },
    conservation: {
      assessed: "Assessed",
      populationTrend: "Population trend",
      threats: "Threats",
    },
  },
  es: {
    safety: {
      safetyOverview: "Resumen de Seguridad",
      safetyWarning: "Advertencia de Seguridad",
      warnings: "Advertencias",
      precautions: "Precauciones",
      safe: "Seguro",
      caution: "Precaución",
      warning: "Advertencia",
      danger: "Alto Riesgo",
    },
    conservation: {
      assessed: "Evaluado",
      populationTrend: "Tendencia poblacional",
      threats: "Amenazas",
    },
  },
} as const;

// Callout Box Component
interface CalloutProps {
  type?:
    | "info"
    | "warning"
    | "success"
    | "tip"
    | "error"
    | "leaf"
    | "star"
    | "danger";
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const styles = {
    info: {
      bg: "bg-info/10 dark:bg-info/20",
      border: "border-info",
      icon: "ℹ️",
      titleColor: "text-info",
    },
    warning: {
      bg: "bg-warning/10 dark:bg-warning/20",
      border: "border-warning",
      icon: "⚠️",
      titleColor: "text-warning",
    },
    success: {
      bg: "bg-success/10 dark:bg-success/20",
      border: "border-success",
      icon: "✅",
      titleColor: "text-success",
    },
    tip: {
      bg: "bg-accent/10 dark:bg-accent/20",
      border: "border-accent",
      icon: "💡",
      titleColor: "text-accent-dark dark:text-accent",
    },
    error: {
      bg: "bg-destructive/10 dark:bg-destructive/20",
      border: "border-destructive",
      icon: "🚨",
      titleColor: "text-destructive",
    },
    leaf: {
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-500",
      icon: "🌿",
      titleColor: "text-green-700 dark:text-green-400",
    },
    star: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      border: "border-yellow-500",
      icon: "⭐",
      titleColor: "text-yellow-700 dark:text-yellow-400",
    },
    danger: {
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-600",
      icon: "⛔",
      titleColor: "text-red-700 dark:text-red-400",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} border-l-4 ${style.border} rounded-r-lg p-5 my-6`}
    >
      {title && (
        <div
          className={`font-semibold ${style.titleColor} mb-3 flex items-center gap-2 text-lg`}
        >
          <span>{style.icon}</span>
          <span>{title}</span>
        </div>
      )}
      <div className="text-foreground/90 mdx-accordion-content">{children}</div>
    </div>
  );
}

// Property Card Component
interface PropertyCardProps {
  icon: string;
  label: string;
  value: string;
  description?: string;
}

export function PropertyCard({
  icon,
  label,
  value,
  description,
}: PropertyCardProps) {
  return (
    <div className="bg-muted rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="font-semibold text-foreground">{value}</div>
      {description && (
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      )}
    </div>
  );
}

// Properties Grid Component
interface PropertiesGridProps {
  children: React.ReactNode;
}

export function PropertiesGrid({ children }: PropertiesGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-6 not-prose">
      {children}
    </div>
  );
}

// Legacy alias used by some MDX files
interface PropertyProps {
  icon?: string;
  label?: string;
  title?: string;
  value: string;
  description?: string;
}

export function Property({
  icon = "📌",
  label,
  title,
  value,
  description,
}: PropertyProps) {
  return (
    <PropertyCard
      icon={icon}
      label={label || title || "Property"}
      value={value}
      description={description}
    />
  );
}

// Legacy safety component used in some tree MDX content
interface SafetyCardProps {
  safetyLevel?: "safe" | "caution" | "warning" | "danger";
  warnings?: string[];
  precautions?: string[];
  locale?: "en" | "es";
}

export function SafetyCard({
  safetyLevel = "safe",
  warnings,
  precautions,
  locale = "en",
}: SafetyCardProps) {
  const safeWarnings = asArray(warnings);
  const safePrecautions = asArray(precautions);
  const t = translations[locale].safety;

  const levelConfig = {
    safe: {
      badge: t.safe,
      badgeClass: "bg-success/15 text-success border-success/30",
      title: t.safetyOverview,
    },
    caution: {
      badge: t.caution,
      badgeClass: "bg-warning/15 text-warning border-warning/30",
      title: t.safetyOverview,
    },
    warning: {
      badge: t.warning,
      badgeClass: "bg-warning/20 text-warning border-warning/40",
      title: t.safetyWarning,
    },
    danger: {
      badge: t.danger,
      badgeClass: "bg-destructive/15 text-destructive border-destructive/30",
      title: t.safetyWarning,
    },
  };

  const config = levelConfig[safetyLevel];

  return (
    <div className="my-6 rounded-xl border border-border bg-card p-5 not-prose">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h4 className="font-semibold text-foreground">{config.title}</h4>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
        >
          {config.badge}
        </span>
      </div>

      {safeWarnings.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-foreground mb-2">
            {t.warnings}
          </h5>
          <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-foreground/90">
            {safeWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {safePrecautions.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">
            {t.precautions}
          </h5>
          <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-foreground/90">
            {safePrecautions.map((precaution, index) => (
              <li key={index}>{precaution}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Legacy conservation component used in some tree MDX content
interface LegacyConservationStatusProps {
  code?: string;
  status?: string;
  statusText?: string;
  rationale?: string;
  assessed?: string;
  assessmentDate?: string;
  population?: string;
  threats?: string[];
  locale?: "en" | "es";
}

export function ConservationStatus({
  code,
  status,
  statusText,
  rationale,
  assessed,
  assessmentDate,
  population,
  threats,
  locale = "en",
}: LegacyConservationStatusProps) {
  const category = status || code || "NE";
  const threatList = asArray(threats);
  const t = translations[locale].conservation;

  return (
    <div className="my-6 rounded-xl border border-border bg-card p-5 not-prose">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/25 bg-primary/10 text-primary">
          {category}
        </span>
        {statusText && (
          <span className="text-sm text-foreground font-medium">
            {statusText}
          </span>
        )}
        {(assessed || assessmentDate) && (
          <span className="text-xs text-muted-foreground">
            {t.assessed}: {assessed || assessmentDate}
          </span>
        )}
      </div>

      {rationale && (
        <p className="text-sm text-foreground/90 mb-3">{rationale}</p>
      )}

      {population && (
        <p className="text-sm text-foreground/90 mb-3">
          <strong>{t.populationTrend}:</strong> {population}
        </p>
      )}

      {threatList.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-foreground mb-2">
            {t.threats}
          </h5>
          <ul className="list-disc list-outside ml-5 space-y-1 text-sm text-foreground/90">
            {threatList.map((threat, index) => (
              <li key={index}>{threat}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Legacy care-calendar component used in some tree MDX content
interface CareCalendarProps {
  locale?: "en" | "es";
  items?: Array<{
    month: string;
    tasks: string;
  }>;
}

export function CareCalendar({ locale = "en", items }: CareCalendarProps) {
  const safeItems = asArray(items);

  if (safeItems.length === 0) return null;

  return (
    <div className="my-6 not-prose">
      <h4 className="font-semibold text-foreground mb-3">
        {locale === "es" ? "Calendario de Cuidados" : "Care Calendar"}
      </h4>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-primary/10">
              <th className="p-3 text-left font-semibold border-b border-border">
                {locale === "es" ? "Mes" : "Month"}
              </th>
              <th className="p-3 text-left font-semibold border-b border-border">
                {locale === "es" ? "Tareas" : "Tasks"}
              </th>
            </tr>
          </thead>
          <tbody>
            {safeItems.map((item, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-muted/20" : "bg-background"}
              >
                <td className="p-3 border-b border-border/50 font-medium">
                  {item.month}
                </td>
                <td className="p-3 border-b border-border/50 text-foreground/90">
                  {item.tasks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Comparison Table Component
interface ComparisonRowProps {
  property: string;
  pilon: string;
  teak: string;
  cedar: string;
}

export function ComparisonTable({ rows }: { rows?: ComparisonRowProps[] }) {
  const safeRows = asArray(rows);

  return (
    <div className="overflow-x-auto my-6 not-prose">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary text-white">
            <th className="p-3 text-left font-semibold rounded-tl-lg">
              Property
            </th>
            <th className="p-3 text-center font-semibold bg-primary-dark">
              Pilón
            </th>
            <th className="p-3 text-center font-semibold">Teak</th>
            <th className="p-3 text-center font-semibold rounded-tr-lg">
              Cedar
            </th>
          </tr>
        </thead>
        <tbody>
          {safeRows.map((row, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-muted" : "bg-muted/50"}
            >
              <td className="p-3 font-medium">{row.property}</td>
              <td className="p-3 text-center bg-primary/5 font-semibold">
                {row.pilon}
              </td>
              <td className="p-3 text-center">{row.teak}</td>
              <td className="p-3 text-center">{row.cedar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Image with Caption Component
interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
}

export function Figure({ src, alt, caption, credit }: FigureProps) {
  return (
    <figure className="my-8 not-prose">
      <div className="rounded-xl overflow-hidden bg-muted relative aspect-video">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 896px"
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          quality={80}
        />
      </div>
      {(caption || credit) && (
        <figcaption className="mt-3 text-center">
          {caption && (
            <p className="text-sm text-foreground/80 italic">{caption}</p>
          )}
          {credit && (
            <p className="text-xs text-muted-foreground mt-1">📷 {credit}</p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

// Image Gallery Component
interface GalleryProps {
  images?: { src: string; alt: string; caption?: string }[];
}

export function Gallery({ images }: GalleryProps) {
  const safeImages = asArray(images);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8 not-prose">
      {safeImages.map((image, index) => (
        <div key={index} className="group relative">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted relative">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              quality={75}
            />
          </div>
          {image.caption && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {image.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// Wood Color Swatch Component
interface ColorSwatchProps {
  colors?: { name: string; hex: string; description?: string }[];
}

export function ColorSwatch({ colors }: ColorSwatchProps) {
  const safeColors = asArray(colors);

  return (
    <div className="flex flex-wrap gap-4 my-6 not-prose">
      {safeColors.map((color, index) => (
        <div key={index} className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg shadow-md border border-border"
            style={{ backgroundColor: color.hex }}
          />
          <div>
            <div className="font-medium text-sm">{color.name}</div>
            {color.description && (
              <div className="text-xs text-muted-foreground">
                {color.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Stat Bar Component
interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

export function StatBar({
  label,
  value,
  maxValue = 100,
  color = "primary",
}: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="my-3 not-prose">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value}/{maxValue}
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color} rounded-full transition-all duration-500`}
          style={{
            width: `${percentage}%`,
            backgroundColor: `var(--${color})`,
          }}
        />
      </div>
    </div>
  );
}

// Stats Group Component
export function StatsGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 my-6 not-prose">
      {children}
    </div>
  );
}

// Timeline Component for Wood Aging
interface TimelineItemProps {
  time: string;
  title: string;
  description: string;
}

export function Timeline({ items }: { items?: TimelineItemProps[] }) {
  const safeItems = asArray(items);

  return (
    <div className="relative my-8 not-prose">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      {safeItems.map((item, index) => (
        <div key={index} className="relative pl-12 pb-8 last:pb-0">
          <div className="absolute left-2 w-5 h-5 rounded-full bg-primary border-4 border-background" />
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm font-semibold text-primary mb-1">
              {item.time}
            </div>
            <div className="font-medium mb-1">{item.title}</div>
            <div className="text-sm text-muted-foreground">
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Distribution Map Placeholder Component
interface DistributionMapProps {
  distribution?: string[];
  countries?: string[];
  elevation?: string;
  locale?: string;
}

export function DistributionMap({
  distribution,
  countries,
  elevation,
  locale = "en",
}: DistributionMapProps) {
  const items = distribution || countries || [];
  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 my-6 not-prose border border-border">
      <div className="text-center mb-4">
        <span className="text-4xl">🗺️</span>
        <h4 className="font-semibold mt-2">
          {locale === "es"
            ? "Distribución Geográfica"
            : "Geographic Distribution"}
        </h4>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              📍 {item}
            </span>
          ))}
        </div>
      )}
      {elevation && (
        <p className="text-center text-sm text-muted-foreground mt-3">
          {locale === "es" ? "Elevación" : "Elevation"}: {elevation}
        </p>
      )}
    </div>
  );
}

// Quick Reference Card
interface QuickRefProps {
  title?: string;
  items?: { label: string; value: string }[];
}

export function QuickRef({
  title = "Quick Reference",
  items = [],
}: QuickRefProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="bg-card border-2 border-primary/20 rounded-xl overflow-hidden my-6 not-prose">
      <div className="bg-primary/10 px-4 py-2 border-b border-primary/20">
        <h4 className="font-semibold text-primary-dark dark:text-primary-light">
          {title}
        </h4>
      </div>
      <div className="p-4">
        <dl className="space-y-2">
          {safeItems.map((item, index) => (
            <div key={index} className="flex justify-between">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

// External Link Card Component
interface ExternalLinkProps {
  href: string;
  title: string;
  description: string;
  icon?: string;
  source?: string;
}

export function ExternalLink({
  href,
  title,
  description,
  icon = "🔗",
  source,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-card border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all group not-prose"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
            <span className="ml-2 text-xs opacity-50">↗</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {source && <p className="text-xs text-primary/70 mt-2">{source}</p>}
        </div>
      </div>
    </a>
  );
}

// External Links Grid
export function ExternalLinksGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
      {children}
    </div>
  );
}

// Accordion Container
export function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="my-6">{children}</div>;
}

// iNaturalist Embed Component
interface INaturalistEmbedProps {
  taxonId: string;
  taxonName: string;
  observationCount?: number;
}

export function INaturalistEmbed({
  taxonId,
  observationCount,
}: INaturalistEmbedProps) {
  return (
    <div className="bg-gradient-to-br from-[#74AC00]/10 to-[#74AC00]/5 rounded-xl p-6 my-6 border border-[#74AC00]/20 not-prose">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-[#74AC00] rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">🌿</span>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">
            iNaturalist Observations
          </h4>
          <p className="text-sm text-muted-foreground">
            Community-powered species data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-card rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#74AC00]">
            {observationCount || "290+"}
          </p>
          <p className="text-xs text-muted-foreground">Observations</p>
        </div>
        <div className="bg-card rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[#74AC00]">186</p>
          <p className="text-xs text-muted-foreground">Observers</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://www.inaturalist.org/taxa/${taxonId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-[#74AC00] text-white rounded-lg text-sm font-medium hover:bg-[#5a8a00] transition-colors"
        >
          View Species Page ↗
        </a>
        <a
          href={`https://www.inaturalist.org/observations?taxon_id=${taxonId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-card border border-[#74AC00]/30 text-foreground rounded-lg text-sm font-medium hover:border-[#74AC00] transition-colors"
        >
          Browse Photos ↗
        </a>
        <a
          href={`https://www.inaturalist.org/observations?taxon_id=${taxonId}&place_id=6924`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 bg-card border border-[#74AC00]/30 text-foreground rounded-lg text-sm font-medium hover:border-[#74AC00] transition-colors"
        >
          🇨🇷 Costa Rica Only ↗
        </a>
      </div>
    </div>
  );
}

// Scientific References Component
interface ReferenceProps {
  authors: string;
  year: string;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
}

export function Reference({
  authors,
  year,
  title,
  journal,
  doi,
  url,
}: ReferenceProps) {
  const link = doi ? `https://doi.org/${doi}` : url;

  return (
    <div className="border-l-2 border-primary/30 pl-4 py-2 my-3 not-prose">
      <p className="text-sm">
        <span className="font-medium">{authors}</span>
        <span className="text-muted-foreground"> ({year}). </span>
        <span className="italic">{title}</span>
        {journal && <span className="text-muted-foreground">. {journal}</span>}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-primary hover:underline text-xs"
          >
            [Link ↗]
          </a>
        )}
      </p>
    </div>
  );
}

// References Section
export function ReferencesSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 rounded-xl p-6 my-6 not-prose">
      <h4 className="font-semibold text-lg mb-4 text-primary-dark dark:text-primary-light">
        📚 Scientific References & Further Reading
      </h4>
      {children}
    </div>
  );
}

// Feature Highlight Box
interface FeatureBoxProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "highlight" | "warning";
}

export function FeatureBox({
  icon,
  title,
  children,
  variant = "default",
}: FeatureBoxProps) {
  const variants = {
    default: "bg-muted border-border",
    highlight: "bg-primary/5 border-primary/20",
    warning: "bg-warning/10 border-warning/20",
  };

  return (
    <div className={`rounded-xl border p-5 my-6 ${variants[variant]}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-lg text-foreground">{title}</h4>
      </div>
      <div className="text-foreground/90 mdx-accordion-content">{children}</div>
    </div>
  );
}

// Conservation Status Box - for displaying IUCN conservation status
interface ConservationStatusBoxProps {
  status: string;
  criteria?: string;
  assessmentYear?: number;
}

const IUCN_STATUS_CONFIG: Record<
  string,
  { name: string; color: string; textColor: string; icon: string }
> = {
  NE: {
    name: "Not Evaluated",
    color: "#d1d5db",
    textColor: "#1f2937",
    icon: "❓",
  },
  DD: {
    name: "Data Deficient",
    color: "#d1d5db",
    textColor: "#1f2937",
    icon: "📊",
  },
  LC: {
    name: "Least Concern",
    color: "#059669",
    textColor: "#ffffff",
    icon: "✅",
  },
  NT: {
    name: "Near Threatened",
    color: "#84cc16",
    textColor: "#1f2937",
    icon: "⚠️",
  },
  VU: {
    name: "Vulnerable",
    color: "#eab308",
    textColor: "#1f2937",
    icon: "🔶",
  },
  EN: {
    name: "Endangered",
    color: "#f97316",
    textColor: "#ffffff",
    icon: "🔴",
  },
  CR: {
    name: "Critically Endangered",
    color: "#dc2626",
    textColor: "#ffffff",
    icon: "🚨",
  },
  EW: {
    name: "Extinct in Wild",
    color: "#7c3aed",
    textColor: "#ffffff",
    icon: "💀",
  },
  EX: { name: "Extinct", color: "#1f2937", textColor: "#ffffff", icon: "⚫" },
};

export function ConservationStatusBox({
  status,
  criteria,
  assessmentYear,
}: ConservationStatusBoxProps) {
  const config = IUCN_STATUS_CONFIG[status] || IUCN_STATUS_CONFIG.NE;

  return (
    <div className="rounded-xl border border-border p-5 my-6 bg-muted/50">
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold shadow-md"
          style={{
            backgroundColor: config.color,
            color: config.textColor,
          }}
        >
          {status}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <h4 className="font-semibold text-lg text-foreground">
              {config.name}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground">IUCN Red List Status</p>
        </div>
      </div>

      {(criteria || assessmentYear) && (
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-sm">
          {criteria && (
            <div>
              <span className="text-muted-foreground">Criteria: </span>
              <span className="font-medium text-foreground">{criteria}</span>
            </div>
          )}
          {assessmentYear && (
            <div>
              <span className="text-muted-foreground">Assessed: </span>
              <span className="font-medium text-foreground">
                {assessmentYear}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Two Column Layout
export function TwoColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">{children}</div>
  );
}

// Column
export function Column({ children }: { children: React.ReactNode }) {
  return <div className="mdx-accordion-content">{children}</div>;
}

// Data Table Component for use inside JSX components
interface DataTableProps {
  headers?: string[];
  rows?: string[][];
  data?: string[][] | Record<string, unknown>[];
  columns?: string[];
}

export function DataTable({ headers, rows, data, columns }: DataTableProps) {
  const safeHeaders = Array.isArray(headers) ? headers : [];
  const safeColumns = Array.isArray(columns) ? columns : [];

  // Normalize data to string[][] format
  let tableData: string[][] = [];

  if (Array.isArray(rows)) {
    // Use rows if provided
    tableData = rows
      .filter((row): row is string[] => Array.isArray(row))
      .map((row) => row.map((cell) => String(cell ?? "")));
  } else if (Array.isArray(data) && data.length > 0) {
    // Check if data is array of objects (has columns prop or first item is an object)
    if (
      safeColumns.length > 0 &&
      typeof data[0] === "object" &&
      data[0] !== null &&
      !Array.isArray(data[0])
    ) {
      // Data is array of objects, extract values using columns keys
      // Convert each object to a Map to avoid prototype pollution via direct bracket access
      tableData = (data as Record<string, unknown>[]).map((item) => {
        const safeMap = new Map(Object.entries(item));
        return safeColumns.map((col) => String(safeMap.get(col) ?? ""));
      });
    } else if (Array.isArray(data[0])) {
      // Data is already string[][]
      tableData = (data as unknown[][])
        .filter((row): row is unknown[] => Array.isArray(row))
        .map((row) => row.map((cell) => String(cell ?? "")));
    }
  }

  const resolvedHeaders =
    safeHeaders.length > 0
      ? safeHeaders
      : safeColumns.length > 0
        ? safeColumns
        : tableData[0]?.map((_, index) => `Column ${index + 1}`) || [];

  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm">
        {resolvedHeaders.length > 0 && (
          <thead>
            <tr className="bg-primary/10">
              {resolvedHeaders.map((header, index) => (
                <th
                  key={index}
                  className="p-3 text-left font-semibold text-foreground border-b border-border"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-muted/30" : "bg-muted/10"}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="p-3 border-b border-border/50 text-foreground/90"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Simple List for use inside JSX components
interface SimpleListProps {
  items?: (string | { label: string; value: string })[];
  ordered?: boolean;
}

export function SimpleList({ items, ordered = false }: SimpleListProps) {
  const safeItems = asArray(items);
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag
      className={`my-3 space-y-2 ${ordered ? "list-decimal" : "list-disc"} list-inside`}
    >
      {safeItems.map((item, index) => (
        <li key={index} className="text-foreground/90">
          {typeof item === "string" ? (
            item
          ) : (
            <>
              <span className="font-medium">{item.label}:</span> {item.value}
            </>
          )}
        </li>
      ))}
    </ListTag>
  );
}

// Native HTML Element Components for beautiful typography

// Styled h1-h6 components for MDX
function H1({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mt-10 mb-6 pb-3 border-b-2 border-primary/20"
      {...props}
    >
      {children}
    </h1>
  );
}

function H2({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className="text-2xl md:text-3xl font-bold text-primary-dark dark:text-primary-light mt-10 mb-5 pb-2 border-b border-border"
      {...props}
    >
      {children}
    </h2>
  );
}

function H3({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className="text-xl md:text-2xl font-semibold text-primary-dark dark:text-primary-light mt-8 mb-4"
      {...props}
    >
      {children}
    </h3>
  );
}

function H4({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className="text-lg md:text-xl font-semibold text-foreground mt-6 mb-3"
      {...props}
    >
      {children}
    </h4>
  );
}

function H5({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className="text-base md:text-lg font-semibold text-foreground mt-5 mb-2"
      {...props}
    >
      {children}
    </h5>
  );
}

function H6({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h6
      className="text-sm md:text-base font-semibold text-muted-foreground mt-4 mb-2 uppercase tracking-wide"
      {...props}
    >
      {children}
    </h6>
  );
}

// Styled paragraph
function P({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className="text-foreground/90 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  );
}

// Styled anchor
function A({
  children,
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = href?.startsWith("http");
  return (
    <a
      href={href}
      className="text-primary hover:text-primary-light underline underline-offset-2 transition-colors"
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
      {isExternal && <span className="ml-1 text-xs">↗</span>}
    </a>
  );
}

// Styled blockquote
function Blockquote({
  children,
  ...props
}: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className="border-l-4 border-primary/40 pl-4 py-2 my-6 bg-primary/5 rounded-r-lg italic text-foreground/80"
      {...props}
    >
      {children}
    </blockquote>
  );
}

// Styled unordered list
function Ul({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className="list-disc list-outside ml-6 mb-4 space-y-2 text-foreground/90"
      {...props}
    >
      {children}
    </ul>
  );
}

// Styled ordered list
function Ol({ children, ...props }: React.OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol
      className="list-decimal list-outside ml-6 mb-4 space-y-2 text-foreground/90"
      {...props}
    >
      {children}
    </ol>
  );
}

// Styled list item
function Li({ children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li className="leading-relaxed pl-1" {...props}>
      {children}
    </li>
  );
}

// Styled table elements
function Table({
  children,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto my-6 rounded-lg border border-border">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  );
}

function Thead({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="bg-primary/10" {...props}>
      {children}
    </thead>
  );
}

function Tbody({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props}>{children}</tbody>;
}

function Tr({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className="border-b border-border/50 even:bg-muted/30" {...props}>
      {children}
    </tr>
  );
}

function Th({
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className="p-3 text-left font-semibold text-foreground border-b border-border"
      {...props}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className="p-3 text-foreground/90" {...props}>
      {children}
    </td>
  );
}

// Styled code elements
function Code({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-secondary-dark dark:text-secondary-light"
      {...props}
    >
      {children}
    </code>
  );
}

function Pre({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className="bg-muted p-4 rounded-lg overflow-x-auto my-6 text-sm font-mono border border-border"
      {...props}
    >
      {children}
    </pre>
  );
}

// Styled hr
function Hr(props: React.HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className="my-10 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      {...props}
    />
  );
}

// Styled strong and em
function Strong({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  );
}

function Em({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <em className="italic text-foreground/90" {...props}>
      {children}
    </em>
  );
}

// Care & Cultivation Components
interface CareGuideProps {
  children: React.ReactNode;
}

export function CareGuide({ children }: CareGuideProps) {
  return (
    <div className="my-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">🌱</span>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200">
          Care & Cultivation
        </h2>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

interface PlantingInstructionsProps {
  steps?: Array<{
    title: string;
    description: string;
    tip?: string;
  }>;
}

export function PlantingInstructions({ steps }: PlantingInstructionsProps) {
  const safeSteps = asArray(steps);

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>🪴</span>
        <span>Planting Instructions</span>
      </h3>
      <ol className="space-y-4">
        {safeSteps.map((step, index) => (
          <li
            key={index}
            className="bg-card rounded-lg p-4 border-l-4 border-primary"
          >
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  {step.title}
                </h4>
                <p className="text-foreground/80 text-sm">{step.description}</p>
                {step.tip && (
                  <p className="mt-2 text-xs text-primary italic">
                    💡 Tip: {step.tip}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

interface MaintenanceTimelineProps {
  stages?: Array<{
    period: string;
    tasks: string[];
    frequency?: string;
  }>;
}

export function MaintenanceTimeline({ stages }: MaintenanceTimelineProps) {
  const safeStages = asArray(stages);

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>📅</span>
        <span>Maintenance Schedule</span>
      </h3>
      <div className="space-y-3">
        {safeStages.map((stage, index) => (
          <div
            key={index}
            className="bg-muted rounded-lg p-4 border-l-4 border-secondary"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-secondary-dark dark:text-secondary-light">
                {stage.period}
              </h4>
              {stage.frequency && (
                <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                  {stage.frequency}
                </span>
              )}
            </div>
            <ul className="space-y-1 text-sm">
              {asArray(stage.tasks).map((task, taskIndex) => (
                <li key={taskIndex} className="flex items-start gap-2">
                  <span className="text-secondary mt-0.5">✓</span>
                  <span className="text-foreground/80">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CareRequirementsProps {
  requirements?: Array<{
    icon: string;
    label: string;
    value: string;
    description?: string;
  }>;
}

export function CareRequirements({ requirements }: CareRequirementsProps) {
  const safeRequirements = asArray(requirements);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {safeRequirements.map((req, index) => (
        <div
          key={index}
          className="bg-card rounded-lg p-4 border border-border hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{req.icon}</span>
            <h4 className="font-semibold text-foreground">{req.label}</h4>
          </div>
          <p className="text-lg font-medium text-primary mb-1">{req.value}</p>
          {req.description && (
            <p className="text-sm text-muted-foreground">{req.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

interface CommonProblemsProps {
  problems?: Array<{
    symptom: string;
    cause: string;
    solution: string;
  }>;
}

export function CommonProblems({ problems }: CommonProblemsProps) {
  const safeProblems = asArray(problems);

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>⚠️</span>
        <span>Common Problems & Solutions</span>
      </h3>
      <div className="space-y-3">
        {safeProblems.map((problem, index) => (
          <div
            key={index}
            className="bg-card rounded-lg p-4 border border-warning/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <h5 className="text-xs font-semibold text-warning uppercase mb-1">
                  Symptom
                </h5>
                <p className="text-sm text-foreground">{problem.symptom}</p>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-info uppercase mb-1">
                  Cause
                </h5>
                <p className="text-sm text-foreground/80">{problem.cause}</p>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-success uppercase mb-1">
                  Solution
                </h5>
                <p className="text-sm text-foreground/80">{problem.solution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMPARISON-SPECIFIC SERVER COMPONENTS
// ============================================================================

// Confusion Rating Display (1-5 scale)
// Wrapper around shared ConfusionRatingBadge component for MDX usage
interface ConfusionRatingProps {
  rating: number;
  label?: string;
  locale?: Locale;
}

export function ConfusionRating({
  rating,
  label,
  locale = "en",
}: ConfusionRatingProps) {
  return (
    <ConfusionRatingBadge
      rating={rating}
      locale={locale}
      variant="default"
      showLabel={!!label || label === undefined}
    />
  );
}

// Comparison Hero Section
interface ComparisonHeroProps {
  leftImage: string;
  rightImage: string;
  leftLabel: string;
  rightLabel: string;
  leftSubtitle?: string;
  rightSubtitle?: string;
  vsText?: string;
}

export function ComparisonHero({
  leftImage,
  rightImage,
  leftLabel,
  rightLabel,
  leftSubtitle,
  rightSubtitle,
  vsText = "VS",
}: ComparisonHeroProps) {
  return (
    <div className="relative my-8 not-prose">
      <div className="grid grid-cols-2 gap-0 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
        {/* Left Species */}
        <div className="relative aspect-[4/3]">
          <Image
            src={leftImage}
            alt={leftLabel}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 400px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
            <h3 className="text-lg sm:text-2xl font-bold drop-shadow-lg">
              {leftLabel}
            </h3>
            {leftSubtitle && (
              <p className="text-sm sm:text-base text-white/80 italic">
                {leftSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Species */}
        <div className="relative aspect-[4/3]">
          <Image
            src={rightImage}
            alt={rightLabel}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 400px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white text-right">
            <h3 className="text-lg sm:text-2xl font-bold drop-shadow-lg">
              {rightLabel}
            </h3>
            {rightSubtitle && (
              <p className="text-sm sm:text-base text-white/80 italic">
                {rightSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-xl border-4 border-white">
            {vsText}
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Compare Row - Visual comparison row with images
interface FeatureCompareRowProps {
  feature: string;
  leftValue: string;
  rightValue: string;
  leftImage?: string;
  rightImage?: string;
  icon?: string;
}

export function FeatureCompareRow({
  feature,
  leftValue,
  rightValue,
  leftImage,
  rightImage,
  icon,
}: FeatureCompareRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-border last:border-b-0 not-prose items-center">
      {/* Left Value */}
      <div className="text-right">
        {leftImage && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden ml-auto mb-2">
            <Image
              src={leftImage}
              alt={leftValue}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <span className="text-sm font-medium">{leftValue}</span>
      </div>

      {/* Feature Label (Center) */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center gap-1 px-3 py-2 bg-primary/10 rounded-lg">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {feature}
          </span>
        </div>
      </div>

      {/* Right Value */}
      <div className="text-left">
        {rightImage && (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden mb-2">
            <Image
              src={rightImage}
              alt={rightValue}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        )}
        <span className="text-sm font-medium">{rightValue}</span>
      </div>
    </div>
  );
}

// Feature Compare Grid - Container for FeatureCompareRows
interface FeatureCompareGridProps {
  leftLabel: string;
  rightLabel: string;
  children: React.ReactNode;
}

export function FeatureCompareGrid({
  leftLabel,
  rightLabel,
  children,
}: FeatureCompareGridProps) {
  return (
    <div className="my-8 bg-card rounded-xl border border-border overflow-hidden not-prose">
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-muted border-b border-border">
        <div className="text-right font-semibold text-primary">{leftLabel}</div>
        <div className="text-center text-xs text-muted-foreground uppercase tracking-wide">
          Feature
        </div>
        <div className="text-left font-semibold text-primary">{rightLabel}</div>
      </div>
      {/* Rows */}
      <div className="px-4">{children}</div>
    </div>
  );
}

// Quick Decision Flow - Visual decision tree
interface DecisionStep {
  question: string;
  yesAnswer: string;
  noAnswer: string;
  yesResult?: string; // Species name if this concludes
  noResult?: string; // Species name if this concludes
}

interface QuickDecisionFlowProps {
  title?: string;
  steps?: DecisionStep[];
}

export function QuickDecisionFlow({
  title = "Quick Identification Guide",
  steps,
}: QuickDecisionFlowProps) {
  const safeSteps = asArray(steps);

  return (
    <div className="my-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-border not-prose">
      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🔍</span>
        {title}
      </h4>
      <div className="space-y-4">
        {safeSteps.map((step, index) => (
          <div key={index} className="relative">
            {/* Question */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium mb-3">{step.question}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Yes Path */}
                    <div
                      className={`p-3 rounded-lg ${
                        step.yesResult
                          ? "bg-success/10 border border-success/30"
                          : "bg-muted"
                      }`}
                    >
                      <div className="text-xs font-semibold text-success mb-1">
                        ✓ YES
                      </div>
                      <p className="text-sm">{step.yesAnswer}</p>
                      {step.yesResult && (
                        <div className="mt-2 px-2 py-1 bg-success/20 rounded text-xs font-semibold text-success">
                          → {step.yesResult}
                        </div>
                      )}
                    </div>
                    {/* No Path */}
                    <div
                      className={`p-3 rounded-lg ${
                        step.noResult
                          ? "bg-info/10 border border-info/30"
                          : "bg-muted"
                      }`}
                    >
                      <div className="text-xs font-semibold text-info mb-1">
                        ✗ NO
                      </div>
                      <p className="text-sm">{step.noAnswer}</p>
                      {step.noResult && (
                        <div className="mt-2 px-2 py-1 bg-info/20 rounded text-xs font-semibold text-info">
                          → {step.noResult}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Connector Line */}
            {index < safeSteps.length - 1 &&
              !step.yesResult &&
              !step.noResult && (
                <div className="absolute left-7 top-full w-0.5 h-4 bg-border" />
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compare In Tool Button
interface CompareInToolButtonProps {
  species: string[];
  locale?: string;
  label?: string;
}

export function CompareInToolButton({
  species,
  locale = "en",
  label,
}: CompareInToolButtonProps) {
  const speciesParam = species.join(",");
  const href = `/${locale}/compare?species=${encodeURIComponent(speciesParam)}`;
  const buttonLabel =
    label ||
    (locale === "es"
      ? "Comparar en herramienta interactiva"
      : "Compare in interactive tool");

  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg not-prose my-4"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
      {buttonLabel}
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </a>
  );
}

// Comparison Tags Display
// Wrapper around shared ComparisonTagPill component for MDX usage
// Note: Uses English labels in MDX context due to MDX compilation limitations.
// MDX components are compiled at build time and don't have direct access to runtime locale context.
// For full localization, use ComparisonTagPill directly in page components with locale prop.
// This is acceptable as tags include clear icons and are primarily technical identifiers.
interface ComparisonTagsProps {
  tags?: string[];
}

export function ComparisonTags({ tags }: ComparisonTagsProps) {
  const safeTags = asArray(tags);

  return (
    <div className="flex flex-wrap gap-2 not-prose">
      {safeTags.map((tag) => (
        <ComparisonTagPill key={tag} tag={tag} variant="primary" locale="en" />
      ))}
    </div>
  );
}

// Seasonal Note Display
interface SeasonalNoteProps {
  note: string;
  icon?: string;
}

export function SeasonalNote({ note, icon = "📅" }: SeasonalNoteProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-lg text-sm not-prose">
      <span className="text-lg">{icon}</span>
      <span className="text-foreground/90">{note}</span>
    </div>
  );
}

// Export all server components for MDX
export const mdxServerComponents = {
  // Custom MDX components
  Callout,
  PropertyCard,
  Property,
  PropertiesGrid,
  SafetyCard,
  ConservationStatus,
  CareCalendar,
  ComparisonTable,
  Figure,
  Gallery,
  ColorSwatch,
  StatBar,
  StatsGroup,
  Timeline,
  DistributionMap,
  QuickRef,
  ExternalLink,
  ExternalLinksGrid,
  Accordion,
  INaturalistEmbed,
  Reference,
  ReferencesSection,
  FeatureBox,
  ConservationStatusBox,
  TwoColumn,
  Column,
  DataTable,
  SimpleList,
  // Care & Cultivation components
  CareGuide,
  PlantingInstructions,
  MaintenanceTimeline,
  CareRequirements,
  CommonProblems,
  // Comparison-specific components
  ConfusionRating,
  ComparisonHero,
  FeatureCompareRow,
  FeatureCompareGrid,
  QuickDecisionFlow,
  CompareInToolButton,
  ComparisonTags,
  SeasonalNote,
  // Native HTML element overrides for consistent styling
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  a: A,
  blockquote: Blockquote,
  ul: Ul,
  ol: Ol,
  li: Li,
  table: Table,
  thead: Thead,
  tbody: Tbody,
  tr: Tr,
  th: Th,
  td: Td,
  code: Code,
  pre: Pre,
  hr: Hr,
  strong: Strong,
  em: Em,
};
