"use client";

import React from "react";
import { SafeImage } from "@/components/SafeImage";

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
          style={{ width: `${Math.min(99.9, Math.max(0.1, sliderPosition))}%` }}
        >
          <div
            className="relative w-full h-full"
            style={{
              width: `${100 / (Math.min(99.9, Math.max(0.1, sliderPosition)) / 100)}%`,
            }}
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
