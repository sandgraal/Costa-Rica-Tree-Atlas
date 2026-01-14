"use client";

import Image, { type ImageProps } from "next/image";
import { BLUR_DATA_URL } from "@/lib/image";

interface ResponsiveImageProps extends Omit<
  ImageProps,
  "sizes" | "placeholder"
> {
  /** Aspect ratio (e.g., '16/9', '4/3', '1/1') */
  aspectRatio?: string;
  /** Priority loading for above-the-fold images */
  priority?: boolean;
  /** Show blur placeholder while loading */
  showPlaceholder?: boolean;
}

/**
 * Responsive image with automatic sizes calculation
 * Automatically handles blur placeholders and responsive sizing
 */
export function ResponsiveImage({
  aspectRatio,
  priority = false,
  showPlaceholder = true,
  className = "",
  ...props
}: ResponsiveImageProps) {
  // Auto-calculate sizes based on common breakpoints
  const sizes = props.fill
    ? "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    : undefined;

  return (
    <div
      className={`relative ${aspectRatio ? "overflow-hidden" : ""}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Image
        {...props}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        placeholder={showPlaceholder ? "blur" : "empty"}
        blurDataURL={showPlaceholder ? BLUR_DATA_URL : undefined}
        className={className}
      />
    </div>
  );
}
