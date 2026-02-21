"use client";

import { useState, useEffect, useCallback } from "react";
import { SafeImage } from "@/components/SafeImage";
import { useScrollLock } from "@/hooks/useScrollLock";

export interface LightboxImage {
  src: string;
  alt: string;
  title?: string;
  credit?: string;
  license?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  const currentImage = images[currentIndex];

  const goToPrevious = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Lock scroll while lightbox is open
  useScrollLock(true);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
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
  }, [onClose, goToPrevious, goToNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors"
        aria-label="Close lightbox"
      >
        <CloseIcon className="w-8 h-8" />
      </button>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all"
            aria-label="Next image"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image container */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Image */}
        <div className="relative max-w-full max-h-[75vh]">
          <SafeImage
            src={currentImage.src}
            alt={currentImage.alt}
            width={1200}
            height={800}
            className={`max-h-[75vh] w-auto object-contain transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => {
              setIsLoading(false);
            }}
            quality={85}
            priority
            fallback="placeholder"
          />
        </div>

        {/* Caption */}
        <div className="mt-4 text-center text-white max-w-2xl px-4">
          {currentImage.title && (
            <h3 className="text-lg font-semibold mb-1">{currentImage.title}</h3>
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

        {/* Image counter */}
        {images.length > 1 && (
          <div className="mt-4 text-white/60 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail strip for multiple images */}
        {images.length > 1 && images.length <= 10 && (
          <div className="mt-4 flex gap-2 overflow-x-auto max-w-full px-4 pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsLoading(true);
                  setCurrentIndex(index);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-white scale-110"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <SafeImage
                  src={image.src}
                  alt={image.alt}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  quality={60}
                  fallback="placeholder"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon components
function CloseIcon({ className }: { className?: string }) {
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
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
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
      <path d="m15 18-6-6 6-6" />
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
