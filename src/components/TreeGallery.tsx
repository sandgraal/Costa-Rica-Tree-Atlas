"use client";

import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { BLUR_DATA_URL } from "@/lib/image";
import { ComponentErrorBoundary } from "./ComponentErrorBoundary";
import { ImageLightbox } from "./ImageLightbox";
import type { LightboxImage } from "./ImageLightbox";

export interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  credit?: string;
  license?: string;
}

// Re-export ImageLightbox for backward compatibility
export { ImageLightbox };

interface TreeGalleryProps {
  images: GalleryImage[];
  title?: string;
}

export function TreeGallery({ images, title }: TreeGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <ComponentErrorBoundary componentName="Tree Gallery">
      <div className="my-8">
        {title && (
          <h3 className="text-lg font-semibold mb-4 text-primary-dark dark:text-primary-light">
            📸 {title}
          </h3>
        )}

        {/* Grid layout - responsive columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                openLightbox(index);
              }}
              className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <SafeImage
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                quality={75}
                fallback="placeholder"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ExpandIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Title overlay */}
              {image.title && (
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-xs text-white truncate">{image.title}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* View all button for many images */}
        {images.length > 8 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                openLightbox(0);
              }}
              className="text-sm text-primary hover:text-primary-dark transition-colors"
            >
              View all {images.length} photos →
            </button>
          </div>
        )}

        {/* Lightbox - only rendered when open (lazy JS execution) */}
        {lightboxOpen && (
          <ImageLightbox
            images={images as LightboxImage[]}
            initialIndex={lightboxIndex}
            onClose={() => {
              setLightboxOpen(false);
            }}
          />
        )}
      </div>
    </ComponentErrorBoundary>
  );
}

function ExpandIcon({ className }: { className?: string }) {
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
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

export default TreeGallery;
