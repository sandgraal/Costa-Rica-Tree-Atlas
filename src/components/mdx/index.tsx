"use client";

import React from "react";
import Image from "next/image";
import { BLUR_DATA_URL } from "@/lib/image";

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
  images: { src: string; alt: string; caption?: string }[];
}

export function Gallery({ images }: GalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8 not-prose">
      {images.map((image, index) => (
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
    <div className="border border-border rounded-lg overflow-hidden my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-primary/5 hover:bg-primary/10 flex items-center justify-between text-left transition-colors"
      >
        <span className="font-semibold text-foreground">{title}</span>
        <span
          className={`transition-transform text-primary ${isOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 py-4 bg-card border-t border-border mdx-accordion-content">
          {children}
        </div>
      )}
    </div>
  );
}

// Accordion Container
export function Accordion({ children }: { children: React.ReactNode }) {
  return <div className="my-6">{children}</div>;
}

// Image Card with Source Attribution
interface ImageCardProps {
  src: string;
  alt: string;
  title?: string;
  credit?: string;
  license?: string;
  sourceUrl?: string;
  onClick?: () => void;
}

export function ImageCard({
  src,
  alt,
  title,
  credit,
  license,
  sourceUrl,
  onClick,
}: ImageCardProps) {
  const isRemote = src.startsWith("http");
  const content = (
    <figure className="bg-card rounded-xl overflow-hidden border border-border not-prose group">
      <div className="aspect-[4/3] bg-muted relative">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover ${onClick ? "group-hover:scale-105 transition-transform duration-300" : ""}`}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          quality={75}
          unoptimized={isRemote}
        />
        {onClick && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </svg>
          </div>
        )}
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
            onClick={(e) => e.stopPropagation()}
          >
            View source ↗
          </a>
        )}
      </figcaption>
    </figure>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="text-left w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
      >
        {content}
      </button>
    );
  }

  return content;
}

// Lightbox component for MDX galleries
interface LightboxState {
  isOpen: boolean;
  currentIndex: number;
}

// Image Gallery with lightbox functionality
interface ImageGalleryWithLightboxProps {
  children: React.ReactNode;
}

export function ImageGallery({ children }: ImageGalleryWithLightboxProps) {
  const [lightbox, setLightbox] = React.useState<LightboxState>({
    isOpen: false,
    currentIndex: 0,
  });

  // Extract image data from children
  const images: Array<{
    src: string;
    alt: string;
    title?: string;
    credit?: string;
    license?: string;
  }> = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.props) {
      const props = child.props as ImageCardProps;
      if (props.src) {
        images.push({
          src: props.src,
          alt: props.alt || "",
          title: props.title,
          credit: props.credit,
          license: props.license,
        });
      }
    }
  });

  const openLightbox = (index: number) => {
    setLightbox({ isOpen: true, currentIndex: index });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, currentIndex: 0 });
  };

  const goToPrevious = React.useCallback(() => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0 ? images.length - 1 : prev.currentIndex - 1,
    }));
  }, [images.length]);

  const goToNext = React.useCallback(() => {
    setLightbox((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === images.length - 1 ? 0 : prev.currentIndex + 1,
    }));
  }, [images.length]);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!lightbox.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          closeLightbox();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightbox.isOpen, goToPrevious, goToNext]);

  // Clone children with onClick handlers
  const childrenWithHandlers = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<ImageCardProps>, {
        onClick: () => openLightbox(index),
      });
    }
    return child;
  });

  const currentImage = images[lightbox.currentIndex];
  const isRemote = currentImage?.src?.startsWith("http");

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6 not-prose">
        {childrenWithHandlers}
      </div>

      {/* Lightbox Modal */}
      {lightbox.isOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                aria-label="Previous"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                aria-label="Next"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-full max-h-[75vh]">
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={1200}
                height={800}
                className="max-h-[75vh] w-auto object-contain"
                priority
                quality={85}
                unoptimized={isRemote}
              />
            </div>

            {/* Caption */}
            <div className="mt-4 text-center text-white max-w-2xl px-4">
              {currentImage.title && (
                <h3 className="text-lg font-semibold mb-1">
                  {currentImage.title}
                </h3>
              )}
              {currentImage.credit && (
                <p className="text-sm text-white/70">
                  📷 {currentImage.credit}
                  {currentImage.license && (
                    <span className="ml-2 text-white/50">
                      ({currentImage.license})
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Counter */}
            {images.length > 1 && (
              <div className="mt-4 text-white/60 text-sm">
                {lightbox.currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
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

// Export all components for MDX
export const mdxComponents = {
  // Custom MDX components
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
  ConservationStatusBox,
  TwoColumn,
  Column,
  DataTable,
  SimpleList,
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
