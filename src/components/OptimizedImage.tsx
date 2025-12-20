"use client";

import Image from "next/image";
import { useState } from "react";

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
}

// Default blur placeholder - a simple gray gradient
const DEFAULT_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyZDVhMjciIG9wYWNpdHk9IjAuMSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhiNWEyYiIgb3BhY2l0eT0iMC4xIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==";

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
  blurDataURL = DEFAULT_BLUR_DATA_URL,
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
    className: `${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`,
    priority,
    sizes,
    placeholder: placeholder as "blur" | "empty",
    blurDataURL,
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
  // Card thumbnail in grid view
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  // Featured image on tree detail page
  featured: "(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 896px",
  // Gallery images
  gallery: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  // Full-width hero
  hero: "100vw",
};

export default OptimizedImage;
