"use client";

import React from "react";
import Image from "next/image";
import { SafeImage } from "@/components/SafeImage";
import { useScrollLock } from "@/hooks/useScrollLock";

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
          role="dialog"
          aria-modal="true"
          aria-label={`Image lightbox: ${images[activeIndex].label}`}
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
