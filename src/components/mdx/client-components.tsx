"use client";

import React from "react";
import Image from "next/image";
import { SafeImage } from "@/components/SafeImage";
import { useScrollLock } from "@/hooks/useScrollLock";

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

// Image Card with Source Attribution
interface ImageCardProps {
  src: string;
  alt: string;
  title?: string;
  credit?: string;
  license?: string;
  sourceUrl?: string;
  slug?: string; // NEW: Add slug prop for optimized image lookup
  index?: number; // NEW: Gallery image index
  onClick?: () => void;
}

export function ImageCard({
  src,
  alt,
  title,
  credit,
  license,
  sourceUrl,
  slug,
  index: _index, // Prefix with _ to mark as intentionally unused
  onClick,
}: ImageCardProps) {
  // Derive slug from src if not provided (only for local paths)
  const _imageSlug =
    slug ||
    (src.startsWith("/images/trees/")
      ? src.match(/\/images\/trees\/([^/]+)/)?.[1]
      : undefined);
  const isRemote = src.startsWith("http");

  const content = (
    <figure className="bg-card rounded-xl overflow-hidden border border-border not-prose group">
      <div className="aspect-[4/3] bg-muted relative">
        <SafeImage
          src={src}
          alt={alt}
          fill
          className={`object-cover ${onClick ? "group-hover:scale-105 transition-transform duration-300" : ""}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

  // Lock scroll when lightbox is open
  useScrollLock(lightbox.isOpen);

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

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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

// Glossary Tooltip Component
interface GlossaryTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function GlossaryTooltip({
  term,
  definition,
  children,
}: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <span className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="underline decoration-dotted decoration-primary hover:text-primary transition-colors cursor-help"
        aria-label={`Definition of ${term}`}
      >
        {children}
      </button>
      {isOpen && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg shadow-lg border border-border max-w-xs">
          <span className="font-semibold block mb-1">{term}</span>
          <span className="text-xs">{definition}</span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-popover border-r border-b border-border rotate-45" />
        </span>
      )}
    </span>
  );
}

// Export all client components as a mapped object
export const mdxClientComponents = {
  AccordionItem,
  ImageCard,
  ImageGallery,
  Tabs,
  GlossaryTooltip,
};
