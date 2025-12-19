"use client";

import React from "react";

// Callout Box Component
interface CalloutProps {
  type?: "info" | "warning" | "success" | "tip";
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
  };

  const style = styles[type];

  return (
    <div
      className={`${style.bg} border-l-4 ${style.border} rounded-r-lg p-4 my-6`}
    >
      {title && (
        <div
          className={`font-semibold ${style.titleColor} mb-2 flex items-center gap-2`}
        >
          <span>{style.icon}</span>
          <span>{title}</span>
        </div>
      )}
      <div className="text-foreground/90">{children}</div>
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

// Comparison Table Component
interface ComparisonRowProps {
  property: string;
  pilon: string;
  teak: string;
  cedar: string;
}

export function ComparisonTable({ rows }: { rows: ComparisonRowProps[] }) {
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
          {rows.map((row, index) => (
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
      <div className="rounded-xl overflow-hidden bg-muted">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover"
          loading="lazy"
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
  images: { src: string; alt: string; caption?: string }[];
}

export function Gallery({ images }: GalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8 not-prose">
      {images.map((image, index) => (
        <div key={index} className="group relative">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
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
  colors: { name: string; hex: string; description?: string }[];
}

export function ColorSwatch({ colors }: ColorSwatchProps) {
  return (
    <div className="flex flex-wrap gap-4 my-6 not-prose">
      {colors.map((color, index) => (
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

export function Timeline({ items }: { items: TimelineItemProps[] }) {
  return (
    <div className="relative my-8 not-prose">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      {items.map((item, index) => (
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
  countries: string[];
  locale?: string;
}

export function DistributionMap({
  countries,
  locale = "en",
}: DistributionMapProps) {
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
      <div className="flex flex-wrap justify-center gap-2">
        {countries.map((country, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
          >
            📍 {country}
          </span>
        ))}
      </div>
    </div>
  );
}

// Quick Reference Card
interface QuickRefProps {
  title: string;
  items: { label: string; value: string }[];
}

export function QuickRef({ title, items }: QuickRefProps) {
  return (
    <div className="bg-card border-2 border-primary/20 rounded-xl overflow-hidden my-6 not-prose">
      <div className="bg-primary/10 px-4 py-2 border-b border-primary/20">
        <h4 className="font-semibold text-primary-dark dark:text-primary-light">
          {title}
        </h4>
      </div>
      <div className="p-4">
        <dl className="space-y-2">
          {items.map((item, index) => (
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

// Collapsible/Accordion Component
interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden my-2 not-prose">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-muted hover:bg-muted/80 flex items-center justify-between text-left transition-colors"
      >
        <span className="font-medium">{title}</span>
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-card border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

// Accordion Container
export function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="my-6 not-prose">{children}</div>;
}

// Image Card with Source Attribution
interface ImageCardProps {
  src: string;
  alt: string;
  title?: string;
  credit?: string;
  license?: string;
  sourceUrl?: string;
}

export function ImageCard({
  src,
  alt,
  title,
  credit,
  license,
  sourceUrl,
}: ImageCardProps) {
  return (
    <figure className="bg-card rounded-xl overflow-hidden border border-border not-prose">
      <div className="aspect-[4/3] bg-muted">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <figcaption className="p-3 text-sm">
        {title && <p className="font-medium mb-1">{title}</p>}
        {credit && (
          <p className="text-muted-foreground text-xs">
            📷 {credit}
            {license && <span className="ml-2 opacity-75">({license})</span>}
          </p>
        )}
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline mt-1 inline-block"
          >
            View source ↗
          </a>
        )}
      </figcaption>
    </figure>
  );
}

// Image Gallery with multiple cards
export function ImageGallery({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6 not-prose">
      {children}
    </div>
  );
}

// iNaturalist Embed Component
interface INaturalistEmbedProps {
  taxonId: string;
  taxonName: string;
  observationCount?: number;
}

export function INaturalistEmbed({
  taxonId,
  taxonName,
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

// Tabs Component
interface TabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
}

export function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || "");

  return (
    <div className="my-6 not-prose">
      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
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
    <div
      className={`rounded-xl border p-5 my-4 not-prose ${variants[variant]}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h4 className="font-semibold text-foreground">{title}</h4>
      </div>
      <div className="text-foreground/80 text-sm">{children}</div>
    </div>
  );
}

// Two Column Layout
export function TwoColumn({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6 not-prose">
      {children}
    </div>
  );
}

// Column
export function Column({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// Data Table Component for use inside JSX components
interface DataTableProps {
  headers: string[];
  rows: string[][];
}

export function DataTable({ headers, rows }: DataTableProps) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-primary/10">
            {headers.map((header, index) => (
              <th
                key={index}
                className="p-3 text-left font-semibold text-foreground border-b border-border"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
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
  items: (string | { label: string; value: string })[];
  ordered?: boolean;
}

export function SimpleList({ items, ordered = false }: SimpleListProps) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag
      className={`my-3 space-y-2 ${ordered ? "list-decimal" : "list-disc"} list-inside`}
    >
      {items.map((item, index) => (
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

// Export all components for MDX
export const mdxComponents = {
  Callout,
  PropertyCard,
  PropertiesGrid,
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
  AccordionItem,
  ImageCard,
  ImageGallery,
  INaturalistEmbed,
  Reference,
  ReferencesSection,
  Tabs,
  FeatureBox,
  TwoColumn,
  Column,
  DataTable,
  SimpleList,
};
