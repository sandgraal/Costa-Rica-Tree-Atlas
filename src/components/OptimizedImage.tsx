"use client";

import Image from "next/image";
import { useState } from "react";
import { BLUR_DATA_URL } from "@/lib/image";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  placeholder = "blur",
  blurDataURL = BLUR_DATA_URL,
  quality = 75,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If image fails to load, show placeholder
  if (error) {
    return (
      <div
        className={`bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center ${className}`}
        style={!fill ? { width, height } : undefined}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-16 h-16 text-primary/30"
        >
          <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
        </svg>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: `${className} ${isLoading ? "scale-110 blur-sm opacity-0" : "scale-100 blur-0 opacity-100"} transition-all duration-300`,
    priority,
    sizes,
    placeholder: placeholder as "blur" | "empty",
    blurDataURL,
    quality,
    onError: () => setError(true),
    onLoad: () => setIsLoading(false),
  };

  if (fill) {
    return (
      <Image {...imageProps} alt={alt} fill style={{ objectFit: "cover" }} />
    );
  }

  return (
    <Image
      {...imageProps}
      alt={alt}
      width={width || 800}
      height={height || 600}
      style={{ objectFit: "cover" }}
    />
  );
}

// Tree-specific image sizes for common use cases
export const IMAGE_SIZES = {
  // Card thumbnail in grid view - optimized for ~400px card width in 3-column desktop grid
  // Mobile: full viewport, Tablet: 2 columns (~50vw), Desktop: 3 columns but container-constrained
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
  // Featured image on tree detail page
  featured: "(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 896px",
  // Gallery images in 2-4 column responsive grid
  // Mobile: 2 columns (50vw), Tablet: 3 columns (33vw), Desktop: 4 columns (25vw)
  gallery: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  // Full-width hero
  hero: "100vw",
};

export default OptimizedImage;
