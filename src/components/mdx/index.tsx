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
};
