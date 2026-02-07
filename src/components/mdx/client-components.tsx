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
            onClick={(e) => {
              e.stopPropagation();
            }}
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
        onClick: () => {
          openLightbox(index);
        },
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

// ============================================================================
// COMPARISON-SPECIFIC COMPONENTS
// ============================================================================

// Before/After Image Slider for comparing similar features
interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel: string;
  afterLabel: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeCredit?: string;
  afterCredit?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  beforeAlt,
  afterAlt,
  beforeCredit,
  afterCredit,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = React.useState(50);
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMove = React.useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseMove = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = React.useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const isBeforeRemote = beforeImage.startsWith("http");
  const isAfterRemote = afterImage.startsWith("http");

  return (
    <div className="my-8 not-prose">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-ew-resize select-none border border-border"
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* After Image (Full width, behind) */}
        <div className="absolute inset-0">
          <SafeImage
            src={afterImage}
            alt={afterAlt || afterLabel}
            fill
            className="object-cover"
            unoptimized={isAfterRemote}
          />
          {/* After Label */}
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/70 text-white text-sm font-medium rounded-full backdrop-blur-sm">
            {afterLabel}
          </div>
        </div>

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="relative w-full h-full"
            style={{ width: `${100 / (sliderPosition / 100)}%` }}
          >
            <SafeImage
              src={beforeImage}
              alt={beforeAlt || beforeLabel}
              fill
              className="object-cover"
              unoptimized={isBeforeRemote}
            />
          </div>
          {/* Before Label */}
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 text-white text-sm font-medium rounded-full backdrop-blur-sm">
            {beforeLabel}
          </div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-primary">
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 12H4m0 0l3-3m-3 3l3 3M16 12h4m0 0l-3-3m3 3l-3 3" />
            </svg>
          </div>
        </div>

        {/* Instructions overlay (shown briefly) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm opacity-70 pointer-events-none">
          ← Drag to compare →
        </div>
      </div>

      {/* Credits */}
      {(beforeCredit || afterCredit) && (
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {beforeCredit && <span>📷 {beforeCredit}</span>}
          {afterCredit && <span>📷 {afterCredit}</span>}
        </div>
      )}
    </div>
  );
}

// Side-by-Side Images with synchronized lightbox
interface SideBySideImagesProps {
  leftImage: string;
  rightImage: string;
  leftLabel: string;
  rightLabel: string;
  leftAlt?: string;
  rightAlt?: string;
  leftCredit?: string;
  rightCredit?: string;
  caption?: string;
}

export function SideBySideImages({
  leftImage,
  rightImage,
  leftLabel,
  rightLabel,
  leftAlt,
  rightAlt,
  leftCredit,
  rightCredit,
  caption,
}: SideBySideImagesProps) {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  useScrollLock(lightboxOpen);

  const images = [
    {
      src: leftImage,
      alt: leftAlt || leftLabel,
      label: leftLabel,
      credit: leftCredit,
    },
    {
      src: rightImage,
      alt: rightAlt || rightLabel,
      label: rightLabel,
      credit: rightCredit,
    },
  ];

  const isLeftRemote = leftImage.startsWith("http");
  const isRightRemote = rightImage.startsWith("http");

  return (
    <>
      <figure className="my-8 not-prose">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Left Image */}
          <button
            onClick={() => {
              setActiveIndex(0);
              setLightboxOpen(true);
            }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 transition-colors group cursor-zoom-in"
          >
            <SafeImage
              src={leftImage}
              alt={leftAlt || leftLabel}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 400px"
              unoptimized={isLeftRemote}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
              <span className="text-white font-semibold text-sm sm:text-base">
                {leftLabel}
              </span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M11 8v6M8 11h6" />
              </svg>
            </div>
          </button>

          {/* Right Image */}
          <button
            onClick={() => {
              setActiveIndex(1);
              setLightboxOpen(true);
            }}
            className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 transition-colors group cursor-zoom-in"
          >
            <SafeImage
              src={rightImage}
              alt={rightAlt || rightLabel}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 400px"
              unoptimized={isRightRemote}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
              <span className="text-white font-semibold text-sm sm:text-base">
                {rightLabel}
              </span>
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M11 8v6M8 11h6" />
              </svg>
            </div>
          </button>
        </div>

        {/* Credits */}
        {(leftCredit || rightCredit) && (
          <div className="flex justify-between mt-2 px-1 text-xs text-muted-foreground">
            <span>{leftCredit && `📷 ${leftCredit}`}</span>
            <span>{rightCredit && `📷 ${rightCredit}`}</span>
          </div>
        )}

        {caption && (
          <figcaption className="text-center text-sm text-muted-foreground mt-3 italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(0);
            }}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-colors ${activeIndex === 0 ? "bg-primary text-white" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
            aria-label="View first image"
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
              setActiveIndex(1);
            }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full transition-colors ${activeIndex === 1 ? "bg-primary text-white" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
            aria-label="View second image"
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

          <div
            className="relative max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex].src}
              alt={images[activeIndex].alt}
              width={1200}
              height={800}
              className="max-h-[75vh] w-auto object-contain"
              priority
              quality={85}
              unoptimized={images[activeIndex].src.startsWith("http")}
            />
            <div className="mt-4 text-center text-white">
              <h3 className="text-lg font-semibold">
                {images[activeIndex].label}
              </h3>
              {images[activeIndex].credit && (
                <p className="text-sm text-white/70 mt-1">
                  📷 {images[activeIndex].credit}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Feature Annotation Component - Clickable hotspots on images
interface AnnotationPoint {
  x: number; // Percentage from left
  y: number; // Percentage from top
  label: string;
  description: string;
}

interface FeatureAnnotationProps {
  image: string;
  alt: string;
  annotations: AnnotationPoint[];
  credit?: string;
}

export function FeatureAnnotation({
  image,
  alt,
  annotations,
  credit,
}: FeatureAnnotationProps) {
  const [activeAnnotation, setActiveAnnotation] = React.useState<number | null>(
    null
  );
  const isRemote = image.startsWith("http");

  return (
    <figure className="my-8 not-prose">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border">
        <SafeImage
          src={image}
          alt={alt}
          fill
          className="object-cover"
          unoptimized={isRemote}
        />

        {/* Annotation Points */}
        {annotations.map((point, index) => (
          <button
            key={index}
            className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-all ${
              activeAnnotation === index
                ? "bg-primary scale-125 z-20"
                : "bg-primary/80 hover:bg-primary hover:scale-110 z-10"
            }`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onClick={() =>
              setActiveAnnotation(activeAnnotation === index ? null : index)
            }
            aria-label={point.label}
          >
            <span className="text-white font-bold text-sm">{index + 1}</span>
          </button>
        ))}

        {/* Active Annotation Tooltip */}
        {activeAnnotation !== null && (
          <div
            className="absolute z-30 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xs border border-border"
            style={{
              left: `${Math.min(Math.max(annotations[activeAnnotation].x, 20), 80)}%`,
              top: `${annotations[activeAnnotation].y + 8}%`,
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => setActiveAnnotation(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center hover:bg-primary-dark"
            >
              ✕
            </button>
            <h4 className="font-semibold text-sm mb-1">
              {annotations[activeAnnotation].label}
            </h4>
            <p className="text-xs text-muted-foreground">
              {annotations[activeAnnotation].description}
            </p>
          </div>
        )}
      </div>

      {/* Annotation Legend */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {annotations.map((point, index) => (
          <button
            key={index}
            onClick={() =>
              setActiveAnnotation(activeAnnotation === index ? null : index)
            }
            className={`flex items-start gap-2 p-2 rounded-lg text-left transition-colors ${
              activeAnnotation === index
                ? "bg-primary/10 border border-primary/30"
                : "hover:bg-muted"
            }`}
          >
            <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full text-xs flex items-center justify-center font-bold">
              {index + 1}
            </span>
            <div>
              <span className="font-medium text-sm">{point.label}</span>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {point.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {credit && (
        <p className="text-xs text-muted-foreground mt-2">📷 {credit}</p>
      )}
    </figure>
  );
}

// Export all client components as a mapped object
export const mdxClientComponents = {
  AccordionItem,
  ImageCard,
  ImageGallery,
  Tabs,
  GlossaryTooltip,
  // Comparison components
  BeforeAfterSlider,
  SideBySideImages,
  FeatureAnnotation,
};
