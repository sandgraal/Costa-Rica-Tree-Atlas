"use client";

import React from "react";
import Image from "next/image";
import { useScrollLock } from "@/hooks/useScrollLock";
import type { ImageCardProps } from "./ImageCard";

interface LightboxState {
  isOpen: boolean;
  currentIndex: number;
}

interface ImageGalleryProps {
  children: React.ReactNode;
}

export function ImageGallery({ children }: ImageGalleryProps) {
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
