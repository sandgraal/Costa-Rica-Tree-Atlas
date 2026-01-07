"use client";

import { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

// ============================================================================
// Types
// ============================================================================

interface SafeImageProps extends Omit<ImageProps, "onError" | "src"> {
  src: string;
  slug?: string; // NEW: Tree slug for optimized image lookup
  imageType?: "featured" | "gallery"; // NEW: Type of image
  fallback?: "placeholder" | "hide";
  onErrorCallback?: () => void;
  quality?: number;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SafeImage - Error-resilient image component with optimization support
 *
 * Wraps Next.js Image with error handling and loading state tracking to gracefully
 * handle broken images and ensure proper rendering on initial page load.
 * Shows a placeholder icon or hides entirely when image fails to load or src is empty.
 *
 * NEW: Supports optimized image resolution when slug is provided
 * - Automatically resolves to AVIF → WebP → JPEG variants
 * - Falls back to local original or external URL
 * - Generates responsive srcSet for better performance
 *
 * @param slug - Tree slug for optimized image lookup
 * @param imageType - Type of image (featured or gallery)
 * @param fallback - "placeholder" (default) shows tree icon, "hide" hides entirely
 * @param onErrorCallback - Optional callback when image fails to load
 */
export function SafeImage({
  src,
  slug,
  imageType = "featured",
  alt,
  fallback = "placeholder",
  onErrorCallback,
  className = "",
  quality,
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const [srcSet, setSrcSet] = useState<string | undefined>();

  // Resolve optimized image source
  useEffect(() => {
    if (slug) {
      // Check for optimized images via API route
      fetch(`/api/images/resolve?slug=${slug}&type=${imageType}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.src) {
            setResolvedSrc(data.src);
            setSrcSet(data.srcSet);
          }
        })
        .catch(() => {
          // Fallback to original src
          setResolvedSrc(src);
        });
    }
  }, [slug, imageType, src]);

  const handleError = () => {
    // Try fallback to external URL if optimized image fails
    if (resolvedSrc !== src && src) {
      setResolvedSrc(src);
    } else {
      setError(true);
      if (onErrorCallback) {
        onErrorCallback();
      }
    }
  };

  // Better empty check - trim whitespace and handle StaticImport
  const isEmpty =
    !resolvedSrc ||
    (typeof resolvedSrc === "string" && resolvedSrc.trim() === "");

  // Check BEFORE attempting to render
  if (isEmpty || error) {
    if (fallback === "hide") {
      return null;
    }

    // Show placeholder
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 ${className}`}
        aria-label={alt}
      >
        <TreePlaceholderIcon />
      </div>
    );
  }

  // Render image with error handler
  return (
    <Image
      src={resolvedSrc}
      srcSet={srcSet}
      alt={alt}
      className={className}
      onError={handleError}
      quality={quality}
      {...props}
    />
  );
}

// ============================================================================
// Placeholder Icon
// ============================================================================

function TreePlaceholderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-12 h-12 text-primary/30"
      aria-hidden="true"
    >
      <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 2.5 1 3.5-1.5.5-3 1.5-3 4 0 2 1 3.5 2.5 4.5-.5 1-1 2-1 3.5v.5h11v-.5c0-1.5-.5-2.5-1-3.5 1.5-1 2.5-2.5 2.5-4.5 0-2.5-1.5-3.5-3-4C16.5 9.5 17 8.5 17 7c0-3-2.5-5-5-5z" />
    </svg>
  );
}
